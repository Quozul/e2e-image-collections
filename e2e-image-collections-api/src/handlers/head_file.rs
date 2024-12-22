use crate::UPLOADS_DIRECTORY;
use crate::error_handler::AppError;
use axum::body::Body;
use axum::extract::Path;
use axum::http::{Response, header};
use std::os::unix::fs::MetadataExt;

pub async fn head_file(Path(filename): Path<String>) -> anyhow::Result<Response<Body>, AppError> {
    let path = std::path::Path::new(UPLOADS_DIRECTORY).join(filename);
    let size = tokio::fs::metadata(path).await.map(|m| m.size())?;

    let response = Response::builder()
        .header(header::CONTENT_LENGTH, size)
        .body(Body::empty())?;

    Ok(response)
}
