# Computer Graphics Canvas Demo (HTML/CSS/Vanilla JS)

A small educational project that demonstrates **intro Computer Graphics** concepts using the **HTML5 Canvas** API.

## How to run

1. Download/copy the folder `computer-graphics-canvas-demo/`
2. Open `index.html` directly in a browser (Chrome/Edge/Firefox)

No build step. No external libraries.

---

## Concepts demonstrated

### 1) Geometric primitives
This demo draws everything using the Canvas 2D primitives:
- **Rectangles**: `ctx.fillRect(...)`, `ctx.strokeRect(...)`
- **Circles**: `ctx.arc(...)` (used for wheels + head)
- **Triangles**: `ctx.beginPath() / lineTo() / closePath()` (roof)
- **Lines**: `ctx.moveTo() / lineTo()` (arms/legs, window crossbars)

### 2) Object composition
Complex objects are created by combining primitives in functions:
- `drawHouse(ctx, x, y, scale)`
- `drawCar(ctx, x, y, wheelAngle, scale)`
- `drawPerson(ctx, x, y, scale, bobY)`

Each function draws the object in its **own local coordinate system**, then uses transforms to position it in the world.

### 3) Transformations (translate, rotate, scale)

Canvas transforms are applied with `ctx.save()` and `ctx.restore()` to avoid affecting other drawings.

#### Translation
Used to position objects and animate motion:
- The car moves by increasing `carX` over time, then calling:
  - `ctx.translate(carX, carY)` inside `drawCar(...)`

#### Rotation
Used for wheel rotation:
- Each wheel is drawn around its local origin (0,0) using:
  - `ctx.rotate(wheelAngle)` inside `drawWheel(...)`

This is the core “rotate around center” pattern:
1. `ctx.translate(wheelCenterX, wheelCenterY)`
2. `ctx.rotate(angle)`
3. draw wheel spokes

#### Scaling
Used for “breathing” animation and hover highlight:
- The person scales slightly over time:
  - `ctx.scale(scale, scale)` inside `drawPerson(...)`
- Hovering over an object slightly increases its scale (to visually reinforce scaling as a transform).

### 4) Animation (requestAnimationFrame)

Animation is performed in a standard loop:

- Update state using `dt` (delta time)
- Clear the canvas
- Redraw the whole scene
- Schedule the next frame

Implemented as:
- `requestAnimationFrame(loop)`

This creates smooth motion and keeps animation synced with the display refresh rate.

---

## Files

- `index.html`  
  Page structure, canvas element, explanatory text, and UI controls.

- `style.css`  
  Basic layout styling, centered canvas, headings/labels.

- `script.js`  
  Canvas setup, drawing functions, transforms, animation loop, and hover interaction.

---

## Suggested student exercises

1. Add a **sun** using a circle + rotating rays (rotation transform).
2. Make the person **wave** by rotating an arm around the shoulder.
3. Add a **second car** with a different scale factor (scaling + translation).
4. Implement keyboard controls to move the car (interactive translation).