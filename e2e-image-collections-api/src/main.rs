mod content_range;
mod error_handler;
mod handlers;
mod range;

use crate::handlers::get_file::get_file;
use axum::Router;
use axum::extract::DefaultBodyLimit;
use axum::http::Method;
use axum::routing::get;
use handlers::get_files::get_files;
use handlers::head_file::head_file;
use handlers::post_file::post_file;
use tower_http::cors::{Any, CorsLayer};
use tower_http::limit::RequestBodyLimitLayer;
use tower_http::trace::TraceLayer;
use tracing::info;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

const UPLOADS_DIRECTORY: &str = "uploads";
const UPLOAD_SIZE_LIMIT: usize = 16_777_216; /* 16 MiB */

#[tokio::main]
async fn main() {
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env().unwrap_or_else(|_| {
                format!("{}=debug,tower_http=debug", env!("CARGO_CRATE_NAME")).into()
            }),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    // save files to a separate directory to not override files in the current directory
    if !tokio::fs::try_exists(UPLOADS_DIRECTORY)
        .await
        .unwrap_or(false)
    {
        tokio::fs::create_dir(UPLOADS_DIRECTORY)
            .await
            .expect("failed to create `uploads` directory");
    }

    let cors = CorsLayer::new()
        .allow_methods([Method::GET, Method::POST])
        .allow_headers(Any)
        .allow_origin(Any);

    let app = Router::new()
        .route("/file", get(get_files))
        .route(
            "/file/{filename}",
            get(get_file).head(head_file).post(post_file),
        )
        .layer(DefaultBodyLimit::disable())
        .layer(TraceLayer::new_for_http())
        .layer(RequestBodyLimitLayer::new(UPLOAD_SIZE_LIMIT))
        .layer(cors);

    // run it
    let listener = tokio::net::TcpListener::bind("127.0.0.1:3000")
        .await
        .unwrap();
    info!("listening on {}", listener.local_addr().unwrap());
    axum::serve(listener, app).await.unwrap();
}
