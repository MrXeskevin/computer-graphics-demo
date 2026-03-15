/**
 * Computer Graphics Canvas Demo
 * - Geometric primitives: rectangles, circles, triangles, lines
 * - Composition: house, car, person built from primitives
 * - Transformations: translate, rotate, scale (with save/restore)
 * - Animation: requestAnimationFrame loop
 *
 * Runs locally: open index.html
 */

"use strict";

// ---------------------------
// Canvas setup
// ---------------------------
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const toggleBtn = document.getElementById("toggleBtn");
const speedSlider = document.getElementById("speed");
const breathSlider = document.getElementById("breath");

// ---------------------------
// Scene state (animation variables)
// ---------------------------
let running = true;

// Car motion (translation)
let carX = -160; // start off-screen
const carY = 350;

// Wheel rotation (rotation)
let wheelAngle = 0;

// Person breathing (scaling) + micro-bob (translation)
let t = 0;

// Hover interaction to scale one object (extra enhancement)
let hovered = "none"; // "house" | "car" | "person" | "none"

// World positions (used for hover hit testing; keep simple bounding boxes)
const world = {
  house: { x: 100, y: 210, w: 260, h: 220 },
  car: { x: 0, y: carY - 70, w: 220, h: 110 }, // x updates every frame
  person: { x: 720, y: 260, w: 130, h: 230 },
};

// ---------------------------
// Utilities (primitives)
// ---------------------------

function clear() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawGround() {
  // Simple background bands (no images; still primitives)
  ctx.save();
  ctx.fillStyle = "#081026";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Sky gradient band
  const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
  g.addColorStop(0, "#162a54");
  g.addColorStop(0.55, "#0b1530");
  g.addColorStop(1, "#07101f");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Ground
  ctx.fillStyle = "#0a1f13";
  ctx.fillRect(0, 410, canvas.width, 110);

  // Simple "road" stripe
  ctx.fillStyle = "#0a0f1f";
  ctx.fillRect(0, 392, canvas.width, 26);
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  for (let x = 0; x < canvas.width; x += 60) {
    ctx.fillRect(x + 10, 404, 30, 4);
  }

  ctx.restore();
}

function drawTriangle(ctx, x1, y1, x2, y2, x3, y3, fillStyle, strokeStyle) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x3, y3);
  ctx.closePath();
  if (fillStyle) {
    ctx.fillStyle = fillStyle;
    ctx.fill();
  }
  if (strokeStyle) {
    ctx.strokeStyle = strokeStyle;
    ctx.stroke();
  }
}

function drawCircle(ctx, cx, cy, r, fillStyle, strokeStyle, lineWidth = 2) {
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  if (fillStyle) {
    ctx.fillStyle = fillStyle;
    ctx.fill();
  }
  if (strokeStyle) {
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
}

// ---------------------------
// Objects (composition + transforms)
// ---------------------------

/**
 * Draw a house constructed from primitives.
 * Demonstrates: rectangles + triangle + composition.
 * Uses translate for object placement (clean local coordinates).
 */
function drawHouse(ctx, x, y, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Local coordinate system for the house:
  // (0,0) is the top-left of the house "body" region.
  const bodyW = 220;
  const bodyH = 140;

  // Roof (triangle)
  drawTriangle(
    ctx,
    -10,
    10,
    bodyW / 2,
    -70,
    bodyW + 10,
    10,
    "#b64a3a",
    "rgba(255,255,255,0.25)"
  );

  // Body (rectangle)
  ctx.fillStyle = "#e9d7b6";
  ctx.fillRect(0, 10, bodyW, bodyH);
  ctx.strokeStyle = "rgba(255,255,255,0.25)";
  ctx.strokeRect(0, 10, bodyW, bodyH);

  // Door (rectangle)
  ctx.fillStyle = "#6e4b2a";
  ctx.fillRect(95, 70, 40, 80);
  ctx.strokeStyle = "rgba(255,255,255,0.25)";
  ctx.strokeRect(95, 70, 40, 80);

  // Door knob (small circle)
  drawCircle(ctx, 128, 110, 3.5, "#f3d27a", "rgba(0,0,0,0.25)", 1);

  // Windows (rectangles)
  ctx.fillStyle = "#88d7ff";
  ctx.fillRect(25, 45, 45, 35);
  ctx.fillRect(150, 45, 45, 35);

  ctx.strokeStyle = "rgba(0,0,0,0.25)";
  ctx.strokeRect(25, 45, 45, 35);
  ctx.strokeRect(150, 45, 45, 35);

  // Window crossbars (lines)
  ctx.beginPath();
  ctx.moveTo(25, 62.5);
  ctx.lineTo(70, 62.5);
  ctx.moveTo(47.5, 45);
  ctx.lineTo(47.5, 80);

  ctx.moveTo(150, 62.5);
  ctx.lineTo(195, 62.5);
  ctx.moveTo(172.5, 45);
  ctx.lineTo(172.5, 80);
  ctx.strokeStyle = "rgba(0,0,0,0.25)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Small label
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.font = "12px system-ui, sans-serif";
  ctx.fillText("House (primitives + composition)", 0, bodyH + 35);

  ctx.restore();
}

/**
 * Draw a wheel centered at (0,0) with a rotation angle.
 * Demonstrates: rotation around local origin.
 */
function drawWheel(ctx, r, angle) {
  ctx.save();
  ctx.rotate(angle);

  // Tire
  drawCircle(ctx, 0, 0, r, "#1a1f2a", "rgba(255,255,255,0.22)", 2);

  // Rim
  drawCircle(ctx, 0, 0, r * 0.55, "#bfc6d6", "rgba(0,0,0,0.25)", 1.5);

  // Spokes (lines)
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3; // 60 degrees
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a) * r * 0.5, Math.sin(a) * r * 0.5);
  }
  ctx.strokeStyle = "rgba(0,0,0,0.35)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Hub
  drawCircle(ctx, 0, 0, r * 0.12, "#8a93a8", "rgba(0,0,0,0.25)", 1);

  ctx.restore();
}

/**
 * Draw a car composed from primitives.
 * Demonstrates:
 * - translate to place the car
 * - wheel rotation
 */
function drawCar(ctx, x, y, wheelAngle, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Car body (rectangles)
  ctx.fillStyle = "#2cc7ff";
  ctx.fillRect(20, -40, 170, 40); // upper body
  ctx.fillRect(0, -10, 220, 40); // main body
  ctx.strokeStyle = "rgba(255,255,255,0.20)";
  ctx.strokeRect(20, -40, 170, 40);
  ctx.strokeRect(0, -10, 220, 40);

  // Windows
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.fillRect(40, -35, 55, 22);
  ctx.fillRect(105, -35, 70, 22);

  ctx.strokeStyle = "rgba(0,0,0,0.25)";
  ctx.strokeRect(40, -35, 55, 22);
  ctx.strokeRect(105, -35, 70, 22);

  // Wheels (circles with rotation)
  ctx.save();
  ctx.translate(55, 35);
  drawWheel(ctx, 18, wheelAngle);
  ctx.restore();

  ctx.save();
  ctx.translate(170, 35);
  drawWheel(ctx, 18, wheelAngle);
  ctx.restore();

  // Headlight
  ctx.fillStyle = "#fff3b0";
  ctx.fillRect(210, 0, 8, 10);

  // Small label
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.font = "12px system-ui, sans-serif";
  ctx.fillText("Car (translate + wheel rotate)", 0, 75);

  ctx.restore();
}

/**
 * Draw a simple person (stick-ish figure) from primitives.
 * Demonstrates scale ("breathing") + small bobbing translation.
 */
function drawPerson(ctx, x, y, scale, bobY = 0) {
  ctx.save();
  ctx.translate(x, y + bobY);
  ctx.scale(scale, scale);

  // Head (circle)
  drawCircle(ctx, 0, 0, 22, "#ffd7c2", "rgba(0,0,0,0.25)", 1.5);

  // Eyes (tiny circles)
  drawCircle(ctx, -7, -4, 2.5, "#172033", null);
  drawCircle(ctx, 7, -4, 2.5, "#172033", null);

  // Body (rectangle)
  ctx.fillStyle = "#b6ff7a";
  ctx.fillRect(-12, 22, 24, 60);
  ctx.strokeStyle = "rgba(0,0,0,0.2)";
  ctx.strokeRect(-12, 22, 24, 60);

  // Arms (lines)
  ctx.beginPath();
  ctx.moveTo(-12, 35);
  ctx.lineTo(-40, 55);
  ctx.moveTo(12, 35);
  ctx.lineTo(40, 55);
  ctx.strokeStyle = "rgba(255,255,255,0.6)";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.stroke();

  // Legs (lines)
  ctx.beginPath();
  ctx.moveTo(-6, 82);
  ctx.lineTo(-20, 125);
  ctx.moveTo(6, 82);
  ctx.lineTo(20, 125);
  ctx.strokeStyle = "rgba(255,255,255,0.6)";
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.stroke();

  // Label
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.font = "12px system-ui, sans-serif";
  ctx.fillText("Person (scale + translate)", -55, 150);

  ctx.restore();
}

// ---------------------------
// Hover interaction (extra enhancement)
// ---------------------------

function pointInRect(px, py, rect) {
  return px >= rect.x && px <= rect.x + rect.w && py >= rect.y && py <= rect.y + rect.h;
}

canvas.addEventListener("mousemove", (e) => {
  const r = canvas.getBoundingClientRect();
  const mx = ((e.clientX - r.left) / r.width) * canvas.width;
  const my = ((e.clientY - r.top) / r.height) * canvas.height;

  // Update dynamic car bbox x
  world.car.x = carX;
  // Keep it simple: test in priority order (top-most "feeling" object)
  if (pointInRect(mx, my, world.person)) hovered = "person";
  else if (pointInRect(mx, my, world.house)) hovered = "house";
  else if (pointInRect(mx, my, world.car)) hovered = "car";
  else hovered = "none";
});

canvas.addEventListener("mouseleave", () => {
  hovered = "none";
});

// ---------------------------
// Animation controls
// ---------------------------
toggleBtn.addEventListener("click", () => {
  running = !running;
  toggleBtn.textContent = running ? "Pause animation" : "Start animation";
  if (running) requestAnimationFrame(loop);
});

function readSliders() {
  // speed: pixels per second (approx)
  const carSpeed = Number(speedSlider.value);
  const breathAmount = Number(breathSlider.value);
  return { carSpeed, breathAmount };
}

// ---------------------------
// Main loop
// ---------------------------
let lastTime = performance.now();

function loop(now) {
  if (!running) return;

  const dt = Math.min(0.05, (now - lastTime) / 1000); // clamp delta for stability
  lastTime = now;

  const { carSpeed, breathAmount } = readSliders();

  // Update animation variables
  carX += carSpeed * dt;
  if (carX > canvas.width + 40) carX = -260;

  // wheel rotation proportional to car speed (simple relation)
  wheelAngle += (carSpeed * dt) / 20;

  t += dt;

  // Render
  clear();
  drawGround();

  // Determine hover scale multipliers (subtle)
  const houseHoverScale = hovered === "house" ? 1.04 : 1.0;
  const carHoverScale = hovered === "car" ? 1.04 : 1.0;
  const personHoverScale = hovered === "person" ? 1.06 : 1.0;

  // House (static)
  drawHouse(ctx, 120, 250, houseHoverScale);

  // Car (animated translation + wheel rotation)
  drawCar(ctx, carX, carY, wheelAngle, carHoverScale);

  // Person (breathing scaling + bobbing)
  const breathe = 1 + (Math.sin(t * 2.4) * breathAmount) / 1000; // small scale
  const bob = Math.sin(t * 2.4 + 1.2) * 3; // few pixels
  drawPerson(ctx, 780, 280, breathe * personHoverScale, bob);

  // On-canvas concept labels (reinforcement)
  drawOverlayLabels();

  // Next frame
  requestAnimationFrame(loop);
}

function drawOverlayLabels() {
  ctx.save();
  ctx.font = "14px system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.85)";

  ctx.fillText("Transforms used:", 14, 24);

  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.fillText("• translate(): car motion, placing objects", 14, 46);
  ctx.fillText("• rotate(): wheel spokes", 14, 66);
  ctx.fillText("• scale(): person breathing + hover highlight", 14, 86);

  // Debug-ish hover indicator (helps students see interaction state)
  ctx.fillStyle = "rgba(255,255,255,0.65)";
  ctx.fillText(`Hover target: ${hovered}`, 14, 110);

  ctx.restore();
}

// Start animation
requestAnimationFrame(loop);