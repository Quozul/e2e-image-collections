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

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn test_content_range() {
        assert_eq!(
            ContentRange::from_str("bytes 0-99/100").unwrap(),
            ContentRange {
                unit: ContentRangeUnit::Bytes,
                range_start: 0,
                range_end: 99,
                size: 100
            }
        );
        assert_eq!(
            ContentRange::from_str("bytes 0-99/*").unwrap(),
            ContentRange {
                unit: ContentRangeUnit::Bytes,
                range_start: 0,
                range_end: 99,
                size: u64::MAX
            }
        );
        assert!(ContentRange::from_str("bytes */100").is_err()); // missing range-start and range-end
        assert_eq!(ContentRange::from_str("bytes */*").unwrap(), ContentRange {
            unit: ContentRangeUnit::Bytes,
            range_start: 0,
            range_end: u64::MAX,
            size: u64::MAX
        });
        assert!(ContentRange::from_str("megabytes 0-99/100").is_err()); // unsupported unit
        assert!(ContentRange::from_str("bytes a-b/c").is_err()); // invalid numbers in range and size
        assert!(ContentRange::from_str("bytes 100-50/200").is_err()); // range-end less than range-start
    }
}
