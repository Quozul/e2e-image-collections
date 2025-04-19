use crate::error_handler::AppError;
use crate::UPLOADS_DIRECTORY;
use std::path::{Component, Path, PathBuf};
use tokio::fs::metadata;

fn validate_path(filename: &str) -> Result<PathBuf, AppError> {
    let path = Path::new(UPLOADS_DIRECTORY).join(filename);

    if path.components().any(|x| x == Component::ParentDir) {
        return Err(AppError::bad_request());
    }

    Ok(path)
}

async fn ensure_file_exists(path: &Path) -> Result<(), AppError> {
    metadata(path).await.map_err(|_| AppError::not_found())?;
    Ok(())
}

pub async fn get_static_path(filename: &str) -> Result<PathBuf, AppError> {
    let path = validate_path(&filename)?;
    ensure_file_exists(&path).await?;
    Ok(path)
}
