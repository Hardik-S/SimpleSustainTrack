# Modernized Surface Notes - SimpleSustainTrack

## Selection context

- Repository: `Hardik-S/SimpleSustainTrack`
- Selection method: live GitHub randomization via `Get-Random` over eligible `Hardik-S` repos.
- Rationale:
  - Repo selected as a legacy static app with simple existing JS behavior.
  - No prior `modern/` path found in automation ledger or memory before this run.
  - Existing behavior is compact and safe to preserve while extending usability in a dedicated path.

## Old -> New functionality map

- Input behavior preserved
  - Legacy accepted only complete finite non-negative numeric input; rejected empty/negative/invalid values.
  - New keeps this contract through `toDecimalNumber` and validation guard.
- Output preserved
  - Legacy displayed `Carbon Footprint: X.XX kg CO2` from a base factor.
  - New keeps the same formula style and message format for compatible cases.
- Visual feedback preserved
  - Legacy used leaf-fall animation tied to footprint thresholds.
  - New preserves thresholds and animation pattern with 0/3/6 falling leaves.
- Extensibility added
  - New transport mode selector adds logical extension points while keeping legacy default factor available.
- UX upgrades
  - Responsive two-column card layout with semantic sections.
  - Preset distance controls for faster entry.
  - Recent run history and local export for handoff.
  - Deterministic news headlines to avoid hardcoded API keys.

## Decisions and rejected approaches

- Kept implementation static (no framework) to preserve low-friction deployability.
- Rejected using a remote news API to avoid shipping a fixed credential in source.
- Kept CSS and JS separate files for readability and parity with classic frontend structure.

## Verification

- `node --check modern/app.js`
- `git diff --check`
- Local smoke fetch of `modern/index.html` in a temporary HTTP preview.

## Deployment notes

- This run does not deploy by default.
- If deploying to Vercel, `modern/index.html` can be used as a standalone static route.

## Next action

- Add optional trend line for footprint reduction goals and a JSON import path for archived runs.
