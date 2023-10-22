use base64::engine::general_purpose;
use base64::Engine;
use std::path::{Component, PathBuf};
use std::time::Duration;

use poem::error::{BadRequest, InternalServerError, NotFound};
use poem::middleware::Cors;
use poem::{listener::TcpListener, EndpointExt, Route, Server};
use poem_openapi::param::{Path, Query};
use poem_openapi::payload::{Binary, Json, PlainText};
use poem_openapi::types::multipart::Upload;
use poem_openapi::{ApiResponse, Multipart, Object, OpenApi, OpenApiService};
use sha2::{Digest, Sha256};

struct Api;

#[derive(Object)]
struct Files {
    files: Vec<String>,
    iv: String,
    name: String,
    total_files: usize,
}

#[derive(ApiResponse)]
enum GetResponse {
    #[oai(status = 200)]
    Files(Json<Files>),

    /// Returned when the path is invalid
    #[oai(status = 403)]
    Forbidden,
}

#[derive(Debug, Multipart)]
struct UploadPayload {
    files: Vec<Upload>,
}

#[derive(ApiResponse)]
enum UploadResponse {
    /// Returns when the files are saved
    #[oai(status = 201)]
    Created,

    /// Returned when the path is invalid
    #[oai(status = 403)]
    Forbidden,
}

#[derive(ApiResponse)]
enum FileResponse {
    /// Returns when the files are saved
    #[oai(status = 200)]
    Ok(Binary<Vec<u8>>),

    /// Returned when the path is invalid
    #[oai(status = 403)]
    Forbidden,
}

#[derive(ApiResponse)]
enum DeleteResponse {
    /// Returns when the files are saved
    #[oai(status = 204)]
    NoContent,

    /// Returned when the path is invalid
    #[oai(status = 403)]
    Forbidden,
}

#[OpenApi]
impl Api {
    #[oai(path = "/", method = "get")]
    async fn index(&self, Query(path): Query<Option<String>>) -> PlainText<String> {
        match path {
            Some(name) => PlainText(format!("hello, {name}!")),
            None => PlainText("hello!".to_string()),
        }
    }

    #[oai(path = "/collection/:collection", method = "get")]
    async fn collection(
        &self,
        Path(collection): Path<String>,
        Query(show_hidden_files): Query<Option<bool>>,
    ) -> GetResponse {
        let path = PathBuf::from("./collections/").join(collection.clone());

        if path
            .components()
            .into_iter()
            .any(|x| x == Component::ParentDir)
        {
            return GetResponse::Forbidden;
        }

        let mut hasher = Sha256::new();
        let concatenated_iv = format!("{collection}salt");
        let data = concatenated_iv.as_bytes();
        hasher.update(data);
        let hash = hasher.finalize();
        let iv = general_purpose::STANDARD_NO_PAD.encode(hash);

        let files = match std::fs::read_dir(path) {
            Ok(entries) => entries
                .into_iter()
                .filter_map(|entry| entry.ok())
                .filter(|entry| {
                    let is_hidden_file = entry.file_name().to_string_lossy().starts_with(".");

                    match show_hidden_files {
                        None => !is_hidden_file,
                        Some(show_hidden_files) => {
                            is_hidden_file && show_hidden_files || !is_hidden_file
                        }
                    }
                })
                .map(|entry| entry.file_name().to_string_lossy().to_string())
                .collect::<Vec<_>>(),
            Err(_) => Vec::new(),
        };

        GetResponse::Files(Json(Files {
            total_files: files.len(),
            files,
            iv,
            name: collection,
        }))
    }

    #[oai(path = "/collection/:collection", method = "post")]
    async fn create_file(
        &self,
        Path(collection): Path<String>,
        upload: UploadPayload,
    ) -> poem::Result<UploadResponse> {
        let path = PathBuf::from("./collections/").join(collection);

        if path
            .components()
            .into_iter()
            .any(|x| x == Component::ParentDir)
        {
            return Ok(UploadResponse::Forbidden);
        }

        if !path.exists() {
            std::fs::create_dir_all(path.clone()).map_err(InternalServerError)?;
        }

        for file in upload.files {
            if let Some(file_name) = file.file_name() {
                let file_path = path.clone().join(file_name);
                let body = file.into_vec().await.map_err(BadRequest)?;
                std::fs::write(file_path, body).map_err(InternalServerError)?;
            }
        }

        Ok(UploadResponse::Created)
    }

    #[oai(path = "/collection/:collection/image/:image", method = "get")]
    async fn get_file(
        &self,
        Path(collection): Path<String>,
        Path(image): Path<String>,
    ) -> poem::Result<FileResponse> {
        let path = PathBuf::from("./collections/").join(collection).join(image);

        if path
            .components()
            .into_iter()
            .any(|x| x == Component::ParentDir)
        {
            return Ok(FileResponse::Forbidden);
        }

        let file = std::fs::read(path).map_err(NotFound)?;

        Ok(FileResponse::Ok(Binary(file)))
    }

    #[oai(path = "/collection/:collection/image/:image", method = "delete")]
    async fn delete_file(
        &self,
        Path(collection): Path<String>,
        Path(image): Path<String>,
    ) -> poem::Result<DeleteResponse> {
        let path = PathBuf::from("./collections/").join(collection).join(image);

        if path
            .components()
            .into_iter()
            .any(|x| x == Component::ParentDir)
        {
            return Ok(DeleteResponse::Forbidden);
        }

        std::fs::remove_file(path).map_err(NotFound)?;

        // TODO: Remove dir if empty

        Ok(DeleteResponse::NoContent)
    }
}

#[tokio::main]
async fn main() -> Result<(), std::io::Error> {
    if std::env::var_os("RUST_LOG").is_none() {
        std::env::set_var("RUST_LOG", "poem=debug");
    }
    tracing_subscriber::fmt::init();

    let api_service =
        OpenApiService::new(Api, "Hello World", "1.0").server("http://localhost:8000/api");
    let ui = api_service.swagger_ui();

    let app = Route::new()
        .nest("/api", api_service)
        .nest("/", ui)
        .with(Cors::new());

    Server::new(TcpListener::bind("0.0.0.0:8000"))
        .run_with_graceful_shutdown(
            app,
            async move {
                let _ = tokio::signal::ctrl_c().await;
            },
            Some(Duration::from_secs(5)),
        )
        .await
}
