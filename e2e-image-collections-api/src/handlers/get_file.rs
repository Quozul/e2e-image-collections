use crate::UPLOADS_DIRECTORY;
use crate::error_handler::AppError;
use crate::range::Range;
use axum::body::Body;
use axum::extract::Path;
use axum::http::{HeaderMap, Response, StatusCode, header};
use std::io::SeekFrom;
use std::str::FromStr;
use tokio::fs::OpenOptions;
use tokio::io::{AsyncReadExt, AsyncSeekExt};

pub async fn get_file(
    Path(filename): Path<String>,
    headers: HeaderMap,
) -> anyhow::Result<Response<Body>, AppError> {
    let path = std::path::Path::new(UPLOADS_DIRECTORY).join(filename);
    let range = get_range(&headers)?;

    let mut file = OpenOptions::new().read(true).open(path).await?;

    file.seek(SeekFrom::Start(range.range_start)).await?;
    let mut bytes = vec![0; range.size()];
    file.read_exact(&mut bytes).await?;

    let response = Response::builder()
        .header(
            header::CONTENT_TYPE,
            header::HeaderValue::from_str("application/octet-stream")?,
        )
        .header(header::CONTENT_RANGE, range.to_string())
        .status(StatusCode::PARTIAL_CONTENT)
        .body(Body::from(bytes))?;

    Ok(response)
}

fn get_range(header_map: &HeaderMap) -> Result<Range, anyhow::Error> {
    let range = header_map.get(header::RANGE).and_then(|h| h.to_str().ok());
    if let Some(range) = range {
        match Range::from_str(range) {
            Ok(range) => Ok(range),
            Err(err) => {
                anyhow::bail!(err.to_string())
            }
        }
    } else {
        anyhow::bail!("range header missing")
    }
}
