use crate::error_handler::AppError;
use crate::path_security::get_static_path;
use crate::range::Range;
use axum::body::Body;
use axum::extract::Path;
use axum::http::{header, HeaderMap, Response, StatusCode};
use std::io::SeekFrom;
use std::str::FromStr;
use tokio::fs::OpenOptions;
use tokio::io::{AsyncReadExt, AsyncSeekExt};

pub async fn get_file(
    Path(filename): Path<String>,
    headers: HeaderMap,
) -> Result<Response<Body>, AppError> {
    let path = get_static_path(&filename).await?;
    let range = get_range(&headers)?;
    let mut file = OpenOptions::new().read(true).open(path).await?;

    file.seek(SeekFrom::Start(range.range_start)).await?;
    let mut bytes = vec![0; range.size()];
    file.read_exact(&mut bytes).await?;

    let response = Response::builder()
        .header(header::CONTENT_TYPE, "application/octet-stream")
        .header(header::CONTENT_RANGE, range.to_string())
        .status(StatusCode::PARTIAL_CONTENT)
        .body(Body::from(bytes))?;

    Ok(response)
}

fn get_range(header_map: &HeaderMap) -> Result<Range, AppError> {
    let range = header_map.get(header::RANGE).and_then(|h| h.to_str().ok());
    if let Some(range) = range {
        match Range::from_str(range) {
            Ok(range) => Ok(range),
            Err(_) => Err(AppError::bad_request()),
        }
    } else {
        Err(AppError::bad_request())
    }
}
