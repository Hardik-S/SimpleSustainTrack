# SimpleSustainTrack
Simple Carbon Tracker

## Local verification

Run the input-contract harness after changing the calculator:

```bash
node scripts/verify-distance-input.mjs
```

The harness protects the distance field contract. The calculator intentionally
rejects partial numeric strings such as `12abc`, negative values, and non-finite
numbers instead of letting JavaScript coerce them into a misleading footprint.
