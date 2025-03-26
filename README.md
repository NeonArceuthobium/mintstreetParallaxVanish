# 🌀 Dynamic Perspective Environment System

This project is a **generative parallax scrolling engine** built in JavaScript and SVG. It creates an animated **single-point vanishing perspective** environment with **layered depth**, **dynamic scaling**, and **rain/lightning FX**. Designed for visual storytelling, real-time simulation, or experimental urban aesthetics, this system was created during an advanced AI + Design course.

---

## 🌐 Core Concept: Single-Point Vanishing Parallax

- Simulates a **single-point perspective** system, where all rails and assets align to a calculated vanishing point.
- Implements **parallax scrolling** by assigning **variable speeds** to different layers (foreground, midground, background).
- **Scale is calculated dynamically** based on asset position and guide rails, preserving illusion of depth as elements animate across screen.
- Supports **adaptive screen sizes** via SVG scaling and `viewBox` adjustments.

---

## 🔧 Features

### 📐 Perspective Line System
- Procedural generation of perspective guide rails based on user-defined intersection points.
- Rail extension and animation driven by geometry and easing curves.
- Dynamically resizes based on browser window dimensions.

### 🛤️ Track System & Spawning Logic
- Multi-track system with independent configuration per layer:
  - `speed`, `spawnRate`, `zIndex`, and `assetTemplates`.
  - Each asset is constrained to a top and bottom guide rail, simulating real 3D motion across a 2D plane.
- Tracks include:
  - **Track 1 / 4** – Midground object spawners.
  - **Track 2** – Road, curb, and sidewalk layer.
  - **Track 3** – Dynamic skyline system.

### 🏙️ Dynamic Skyline Generator
- Procedurally generates buildings that **grow and scale** based on screen-relative Y positions.
- Anchored between top and bottom rails with **gradual horizontal growth** to mimic perspective distortion.
- Dynamically spawned from the left with smooth GSAP animation across the full width of the viewport.

### 🌧️ Rain & Lightning FX
- Procedural rain using SVG `<line>` elements.
- Periodic **lightning flashes** and synced **thunder audio**.
- Weather toggled dynamically with fade in/out behavior and a looping cycle.

---

## 🧠 Technical Highlights

- **getLineY & getLineParams**: Compute position along SVG lines based on X for accurate alignment.
- **intersectLines**: Finds vanishing point to derive angle for guide rails.
- **spawnSmokeStack / spawnDynamicSkylineBuilding**: Animate elements using GSAP with live scale transforms from real rail geometry.
- **SVG Manipulation**: Elements (`<polygon>`, `<line>`, `<circle>`) are generated and positioned on the fly.
- **GSAP Motion**: Handles easing, movement, and transform origin behavior.

---

## ⚙️ Track Config Example

```js
{
  id: "track4",
  svgId: "track4Svg",
  topRailId: "rail5",
  bottomRailId: "rail8",
  assetTemplates: ["shapeATrack4", "shapeBTrack4", "shapeCTrack4"],
  speed: 8,
  spawnRate: 6000,
  zIndex: 1
}


---

## 🧩 Dependencies & Tools

- **[GSAP (GreenSock Animation Platform)](https://greensock.com/gsap/)** – Used for precise, smooth animations across the perspective environment.
- **[ChatGPT (OpenAI)](https://chat.openai.com/)** – Assisted in code structuring, refactoring, and documentation writing throughout the development process.

---

## 🌀 Author Notes

This project explores the boundaries between **2D geometry** and **3D illusion**, using pure JavaScript and SVG as the canvas...
