# Audio and Player Polish Notes

The audio module uses Web Audio and does not require external sound files.

## Sounds

- Shooting: short square-wave beep
- Warptime: lower sine beep

Browsers require audio to be unlocked by a user gesture, so the module initializes on the first pointer or keyboard event.

