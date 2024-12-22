use std::fmt::Display;
use std::str::FromStr;

#[derive(Debug)]
enum RangeUnit {
    Bytes,
}

impl Display for RangeUnit {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", match self {
            RangeUnit::Bytes => {
                "bytes".to_owned()
            }
        })
    }
}

impl FromStr for RangeUnit {
    type Err = &'static str;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "bytes" => Ok(RangeUnit::Bytes),
            _ => Err("unsupported unit"),
        }
    }
}

#[derive(Debug)]
pub struct Range {
    unit: RangeUnit,
    pub range_start: u64,
    pub range_end: u64,
}

impl Range {
    pub fn size(&self) -> usize {
        (self.range_end - self.range_start) as usize
    }
}

impl Display for Range {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}={}-{}", self.unit, self.range_start, self.range_end)
    }
}

impl FromStr for Range {
    type Err = &'static str;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let parts: Vec<&str> = s.split('=').collect();

        if parts.len() != 2 {
            return Err("invalid range header format");
        }

        let unit = RangeUnit::from_str(parts[0])?;
        let ranges: Vec<&str> = parts[1].split('-').collect();

        if ranges.len() != 2 {
            return Err("invalid range header format");
        }

        let range_start = ranges[0].parse().map_err(|_| "invalid number")?;
        let range_end = ranges[1].parse().map_err(|_| "invalid number")?;

        Ok(Range {
            unit,
            range_start,
            range_end,
        })
    }
}
