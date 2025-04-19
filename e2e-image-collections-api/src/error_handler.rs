use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};

pub enum AppError {
    Anyhow(anyhow::Error),
    Defined {
        status_code: StatusCode,
        error_message: String,
    },
}

impl AppError {
    pub fn bad_request() -> Self {
        Self::Defined {
            status_code: StatusCode::BAD_REQUEST,
            error_message: "Bad Request".to_string(),
        }
    }

    pub fn not_found() -> Self {
        Self::Defined {
            status_code: StatusCode::NOT_FOUND,
            error_message: "Not Found".to_string(),
        }
    }
}

// Tell axum how to convert `AppError` into a response.
impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        match self {
            Self::Anyhow(err) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("Something went wrong: {}", err),
            ),
            Self::Defined {
                status_code,
                error_message,
            } => (status_code, error_message),
        }
        .into_response()
    }
}

// This enables using `?` on functions that return `Result<_, anyhow::Error>` to turn them into
// `Result<_, AppError>`. That way you don't need to do that manually.
impl<E> From<E> for AppError
where
    E: Into<anyhow::Error>,
{
    fn from(err: E) -> Self {
        Self::Anyhow(err.into())
    }
}
