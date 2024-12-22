use crate::UPLOADS_DIRECTORY;
use crate::error_handler::AppError;
use axum::body::Body;
use axum::extract::Path;
use axum::http::{Response, StatusCode};

pub async fn delete_file(Path(filename): Path<String>) -> anyhow::Result<Response<Body>, AppError> {
    let path = std::path::Path::new(UPLOADS_DIRECTORY).join(filename); // TODO: Check if path is safe
    tokio::fs::remove_file(path).await?;

    let response = Response::builder()
        .status(StatusCode::NO_CONTENT)
        .body(Body::empty())?;

    Ok(response)
}
