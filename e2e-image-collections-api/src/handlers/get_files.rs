use crate::UPLOADS_DIRECTORY;
use crate::error_handler::AppError;
use axum::Json;
use futures::TryStreamExt;
use tokio_stream::wrappers::ReadDirStream;

pub async fn get_files() -> anyhow::Result<Json<Vec<String>>, AppError> {
    let path = std::path::Path::new(UPLOADS_DIRECTORY);
    let file_names = tokio::fs::read_dir(path)
        .await
        .map(ReadDirStream::new)?
        .map_ok(|entry| entry.file_name().to_string_lossy().into_owned())
        .try_collect::<Vec<_>>()
        .await?;

    Ok(Json(file_names))
}
