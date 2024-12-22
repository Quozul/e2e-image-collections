use regex::Regex;
use std::str::FromStr;

#[derive(Debug, PartialEq)]
enum ContentRangeUnit {
    Bytes,
}

impl FromStr for ContentRangeUnit {
    type Err = &'static str;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "bytes" => Ok(ContentRangeUnit::Bytes),
            _ => Err("unsupported unit"),
        }
    }
}

#[derive(Debug, PartialEq)]
pub struct ContentRange {
    unit: ContentRangeUnit,
    pub range_start: u64,
    range_end: u64,
    size: u64,
}

impl FromStr for ContentRange {
    type Err = &'static str;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let re = Regex::new(r"^(\w+)\s+(\d+)-(\d+)/(\d+)$").map_err(|_| "invalid regex")?;
        if let Some(caps) = re.captures(s) {
            let unit = caps[1].parse::<ContentRangeUnit>()?;
            let range_start = caps[2].parse::<u64>().map_err(|_| "parse int error")?;
            let range_end = caps[3].parse::<u64>().map_err(|_| "parse int error")?;
            let size = caps[4].parse::<u64>().map_err(|_| "parse int error")?;
            Ok(ContentRange {
                unit,
                range_start,
                range_end,
                size,
            })
        } else {
            Err("invalid content-range header")
        }
    }
}
