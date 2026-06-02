# Player Corruption Notes

Phase 2 connects corrupted cells to player movement.

## Player Slow

When the player stands on a corrupted grid cell, movement speed is multiplied by `0.62`.

## Trail

The player stores a small trail list. Each trail entry contains:

- position
- angle
- life
- maxLife

Warptime uses a longer trail life and a shorter spacing threshold, so the effect becomes more visible.

