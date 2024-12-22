use crate::UPLOADS_DIRECTORY;
use crate::content_range::ContentRange;
use axum::BoxError;
use axum::body::Bytes;
use axum::extract::Path;
use axum::http::{StatusCode, header};
use futures::{Stream, TryStreamExt};
use std::io;
use std::io::SeekFrom;
use std::str::FromStr;
use tokio::fs::OpenOptions;
use tokio::io::{AsyncSeekExt, BufWriter};
use tokio_util::io::StreamReader;

pub async fn post_file(
    Path(filename): Path<String>,
    headers: axum::http::HeaderMap,
    request: axum::extract::Request,
) -> Result<StatusCode, (StatusCode, String)> {
    let content_range = headers
        .get(header::CONTENT_RANGE)
        .and_then(|h| h.to_str().ok())
        .and_then(|h| ContentRange::from_str(h).ok());

    if let Some(content_range) = content_range {
        stream_to_file(
            &filename,
            request.into_body().into_data_stream(),
            content_range.range_start,
        )
        .await?;
        Ok(StatusCode::OK)
    } else {
        Err((StatusCode::BAD_REQUEST, "Bad Request".to_string()))
    }
}

async fn stream_to_file<S, E>(path: &str, stream: S, start: u64) -> Result<(), (StatusCode, String)>
where
    S: Stream<Item = Result<Bytes, E>>,
    E: Into<BoxError>,
{
    if !path_is_valid(path) {
        return Err((StatusCode::BAD_REQUEST, "Invalid path".to_owned()));
    }

    async {
        // Convert the stream into an `AsyncRead`.
        let body_with_io_error = stream.map_err(|err| io::Error::new(io::ErrorKind::Other, err));
        let body_reader = StreamReader::new(body_with_io_error);
        futures::pin_mut!(body_reader);

        // Create the file. `File` implements `AsyncWrite`.
        let path = std::path::Path::new(UPLOADS_DIRECTORY).join(path);
        let mut file = OpenOptions::new()
            .create(true)
            .truncate(false)
            .read(true)
            .write(true)
            .open(path)
            .await?;

        file.seek(SeekFrom::Start(start)).await?;

        let mut file = BufWriter::new(file);

        // Copy the body into the file.
        tokio::io::copy(&mut body_reader, &mut file).await?;

        Ok::<_, io::Error>(())
    }
    .await
    .map_err(|err| (StatusCode::INTERNAL_SERVER_ERROR, err.to_string()))
}

// to prevent directory traversal attacks we ensure the path consists of exactly one normal
// component
fn path_is_valid(path: &str) -> bool {
    let path = std::path::Path::new(path);
    let mut components = path.components().peekable();

    if let Some(first) = components.peek() {
        if !matches!(first, std::path::Component::Normal(_)) {
            return false;
        }
    }

    components.count() == 1
}
