use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::io::{self, BufRead, Write};
use url::Url;

#[derive(Debug, Serialize, Deserialize)]
pub struct MagnetInfo {
    pub info_hash: String,
    pub name: Option<String>,
    pub trackers: Vec<String>,
    pub exact_length: Option<u64>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct HydraGameItem {
    pub title: String,
    pub uris: Vec<String>,
    #[serde(rename = "uploadDate")]
    pub upload_date: Option<String>,
    #[serde(rename = "fileSize")]
    pub file_size: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct HydraSource {
    pub name: Option<String>,
    pub downloads: Vec<HydraGameItem>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct IpcRequest {
    pub id: u64,
    pub action: String,
    pub payload: serde_json::Value,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct IpcResponse {
    pub id: u64,
    pub success: bool,
    pub result: Option<serde_json::Value>,
    pub error: Option<String>,
}

pub fn parse_magnet(uri: &str) -> Result<MagnetInfo, String> {
    if !uri.starts_with("magnet:?") {
        return Err("Invalid magnet URI prefix".to_string());
    }

    let parsed = Url::parse(uri).map_err(|e| format!("URL parse error: {}", e))?;
    let _query_pairs: HashMap<_, _> = parsed.query_pairs().into_owned().collect();

    let mut info_hash = String::new();
    let mut trackers = Vec::new();
    let mut name = None;
    let mut exact_length = None;

    for (k, v) in parsed.query_pairs() {
        match k.as_ref() {
            "xt" => {
                if let Some(hash) = v.strip_prefix("urn:btih:") {
                    info_hash = hash.to_string();
                } else {
                    info_hash = v.to_string();
                }
            }
            "dn" => {
                name = Some(v.to_string());
            }
            "tr" => {
                trackers.push(v.to_string());
            }
            "xl" => {
                exact_length = v.parse::<u64>().ok();
            }
            _ => {}
        }
    }

    if info_hash.is_empty() {
        return Err("Missing info_hash (xt parameter)".to_string());
    }

    Ok(MagnetInfo {
        info_hash,
        name,
        trackers,
        exact_length,
    })
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let args: Vec<String> = std::env::args().collect();

    if args.len() > 1 && args[1] == "--version" {
        println!("SkyEngine v1.0.0 (Rust/C++ Core)");
        return Ok(());
    }

    if args.len() > 2 && args[1] == "parse-magnet" {
        match parse_magnet(&args[2]) {
            Ok(info) => {
                println!("{}", serde_json::to_string_pretty(&info)?);
            }
            Err(e) => {
                eprintln!("Error: {}", e);
                std::process::exit(1);
            }
        }
        return Ok(());
    }

    // Default: Run stdio JSON-RPC IPC server for Electron / Frontend
    let stdin = io::stdin();
    let mut stdout = io::stdout();

    for line in stdin.lock().lines() {
        let line = match line {
            Ok(l) => l,
            Err(_) => break,
        };

        if line.trim().is_empty() {
            continue;
        }

        let req: Result<IpcRequest, _> = serde_json::from_str(&line);
        let resp = match req {
            Ok(r) => handle_request(r).await,
            Err(e) => IpcResponse {
                id: 0,
                success: false,
                result: None,
                error: Some(format!("JSON parsing error: {}", e)),
            },
        };

        if let Ok(resp_json) = serde_json::to_string(&resp) {
            let _ = writeln!(stdout, "{}", resp_json);
            let _ = stdout.flush();
        }
    }

    Ok(())
}

async fn handle_request(req: IpcRequest) -> IpcResponse {
    let id = req.id;
    match req.action.as_str() {
        "ping" => IpcResponse {
            id,
            success: true,
            result: Some(serde_json::json!({ "engine": "SkyEngine (Rust)", "status": "online" })),
            error: None,
        },
        "parse_magnet" => {
            if let Some(uri) = req.payload.get("uri").and_then(|v| v.as_str()) {
                match parse_magnet(uri) {
                    Ok(info) => IpcResponse {
                        id,
                        success: true,
                        result: Some(serde_json::to_value(info).unwrap()),
                        error: None,
                    },
                    Err(e) => IpcResponse {
                        id,
                        success: false,
                        result: None,
                        error: Some(e),
                    },
                }
            } else {
                IpcResponse {
                    id,
                    success: false,
                    result: None,
                    error: Some("Missing 'uri' in payload".to_string()),
                }
            }
        }
        "fetch_source" => {
            if let Some(url_str) = req.payload.get("url").and_then(|v| v.as_str()) {
                match reqwest::get(url_str).await {
                    Ok(res) => match res.json::<HydraSource>().await {
                        Ok(source) => IpcResponse {
                            id,
                            success: true,
                            result: Some(serde_json::to_value(source).unwrap()),
                            error: None,
                        },
                        Err(e) => IpcResponse {
                            id,
                            success: false,
                            result: None,
                            error: Some(format!("Failed to parse source JSON: {}", e)),
                        },
                    },
                    Err(e) => IpcResponse {
                        id,
                        success: false,
                        result: None,
                        error: Some(format!("HTTP request error: {}", e)),
                    },
                }
            } else {
                IpcResponse {
                    id,
                    success: false,
                    result: None,
                    error: Some("Missing 'url' in payload".to_string()),
                }
            }
        }
        _ => IpcResponse {
            id,
            success: false,
            result: None,
            error: Some(format!("Unknown action: {}", req.action)),
        },
    }
}
