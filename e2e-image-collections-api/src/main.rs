mod content_range;
mod error_handler;
mod handlers;
mod range;

use crate::handlers::delete_file::delete_file;
use crate::handlers::get_file::get_file;
use axum::extract::DefaultBodyLimit;
use axum::http::header::{CONTENT_RANGE, CONTENT_TYPE, RANGE};
use axum::http::{HeaderValue, Method};
use axum::routing::get;
use axum::Router;
use axum_server::tls_rustls::RustlsConfig;
use handlers::get_files::get_files;
use handlers::head_file::head_file;
use handlers::post_file::post_file;
use std::net::SocketAddr;
use std::path::PathBuf;
use std::time::Duration;
use tokio::signal;
use tower_http::cors::CorsLayer;
use tower_http::limit::RequestBodyLimitLayer;
use tower_http::services::{ServeDir, ServeFile};
use tower_http::trace::TraceLayer;
use tracing::info;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

const UPLOADS_DIRECTORY: &str = "uploads";
const STATIC_DIRECTORY: &str = "static";
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

    let cors_layer = CorsLayer::new()
        .allow_methods([Method::GET, Method::POST, Method::HEAD, Method::DELETE])
        .allow_headers([CONTENT_RANGE, RANGE, CONTENT_TYPE])
        .allow_origin("http://localhost:5173".parse::<HeaderValue>().unwrap());

    let api_router = Router::new().route("/file", get(get_files)).route(
        "/file/{filename}",
        get(get_file)
            .head(head_file)
            .post(post_file)
            .delete(delete_file),
    );

    let index_file_path = PathBuf::from(STATIC_DIRECTORY).join("index.html");

    let app = Router::new()
        .nest("/api", api_router)
        .fallback_service(
            ServeDir::new(STATIC_DIRECTORY).not_found_service(ServeFile::new(index_file_path)),
        )
        .layer(DefaultBodyLimit::disable())
        .layer(TraceLayer::new_for_http())
        .layer(RequestBodyLimitLayer::new(UPLOAD_SIZE_LIMIT))
        .layer(cors_layer);

    if std::env::var("TLS").is_ok() {
        listen_tls(app).await;
    } else {
        listen(app).await;
    }
}

async fn listen(app: Router) {
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    info!("listening on {}", listener.local_addr().unwrap());
    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal(None))
        .await
        .unwrap();
}

async fn listen_tls(app: Router) {
    let cwd = std::env::current_dir().unwrap();
    let config = RustlsConfig::from_pem_file(
        cwd.join("self_signed_certs").join("cert.pem"),
        cwd.join("self_signed_certs").join("key.pem"),
    )
    .await
    .unwrap();

    let handle = axum_server::Handle::new();
    let shutdown_future = shutdown_signal(Some(handle.clone()));

    // run it
    let addr = SocketAddr::from(([0, 0, 0, 0], 443));
    tracing::debug!("listening on {}", addr);
    axum_server::bind_rustls(addr, config)
        .handle(handle)
        .serve(app.into_make_service())
        .await
        .unwrap();
    drop(shutdown_future);
}

async fn shutdown_signal(handle: Option<axum_server::Handle>) {
    let ctrl_c = async {
        signal::ctrl_c()
            .await
            .expect("failed to install Ctrl+C handler");
    };

    #[cfg(unix)]
    let terminate = async {
        signal::unix::signal(signal::unix::SignalKind::terminate())
            .expect("failed to install signal handler")
            .recv()
            .await;
    };

    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! {
        _ = ctrl_c => {},
        _ = terminate => {},
    }

    if let Some(handle) = handle {
        info!("Received termination signal shutting down");
        handle.graceful_shutdown(Some(Duration::ZERO));
    }
}
