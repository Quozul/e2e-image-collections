use crate::error_handler::AppError;
use crate::path_security::get_static_path;
use axum::body::Body;
use axum::extract::Path;
use axum::http::{header, Response, StatusCode};
use std::os::unix::fs::MetadataExt;

pub async fn head_file(Path(filename): Path<String>) -> anyhow::Result<Response<Body>, AppError> {
    let path = get_static_path(&filename).await?;
    let size = tokio::fs::metadata(path).await.map(|m| m.size())?;

    let response = Response::builder()
        .header(header::CONTENT_LENGTH, size)
        .status(StatusCode::NO_CONTENT)
        .body(Body::empty())?;

    Ok(response)
}
