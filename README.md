# Synth Corruption

Synth Corruption is a Canvas 2D survival shooter for a frontend course project. It uses plain HTML, CSS, JavaScript, Canvas 2D, Web Audio, and localStorage.

## Run

Open `index.html` in a browser.

## Controls

| Input | Action |
| --- | --- |
| WASD / Arrow Keys | Move |
| Mouse | Aim |
| Left Click | Fire |
| Right Click / Space | Warptime |
| Escape | Pause or resume |
| Enter | Start or restart |

## Features

- Splash, playing, paused, and game over states
- TTF-based Canvas text rendering through `js/text.js`
- Keyboard and mouse input
- Player movement with normalized diagonal speed
- Mouse aiming and bullets
- Warptime, player trail, and audio feedback
- Chaser, fast, tank, and shooter enemies
- Enemy projectiles
- Red corruption cores
- Grid-based corruption cells
- Corruption slowdown
- Core ownership cleanup
- Score-based wave triggers
- CRT/glitch Canvas 2D post-processing
- Score and best score
- Final test records and presentation notes

## Technical Notes

The project intentionally avoids WebGL and build tools. CRT/glitch effects are implemented with Canvas 2D by drawing the game to an offscreen canvas and then applying scanlines, chromatic offset, glitch slices, noise, and vignette.

