# How Dynamic Content Works

> **Historical / Superseded:** This abbreviated data-flow summary is retained
> for reference. Use
> [technical/DYNAMIC-DATA-MAP.md](../technical/DYNAMIC-DATA-MAP.md) for current
> implementation truth.

> Current-state note (2026-07-29): Exact implemented and missing paths are in
> [technical/DYNAMIC-DATA-MAP.md](../technical/DYNAMIC-DATA-MAP.md).

Version: 1.0
Last Updated: July 27, 2026

Homepage Featured Tournament:
Uses the active/published tournament.

Tournament Schedule:
Reads tournament records.

Registration:
Stores entries in Supabase.

Results:
Generated from imported WeighFish data after publishing.

Winner Circle:
Uses published results and uploaded winner photos.

AOY:
Calculated from published tournament results.
