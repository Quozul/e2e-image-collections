use crate::UPLOADS_DIRECTORY;
use axum::Json;
use axum::http::StatusCode;
use futures::TryStreamExt;
use tokio_stream::wrappers::ReadDirStream;

pub async fn list_handler() -> Result<Json<Vec<String>>, (StatusCode, String)> {
    let path = std::path::Path::new(UPLOADS_DIRECTORY);
    let file_names = tokio::fs::read_dir(path)
        .await
        .map(ReadDirStream::new)
        .map_err(|_| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                "Internal Server Error".to_string(),
            )
        })?
        .map_ok(|entry| entry.file_name().to_string_lossy().into_owned())
        .try_collect::<Vec<_>>()
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(Json(file_names))
}
