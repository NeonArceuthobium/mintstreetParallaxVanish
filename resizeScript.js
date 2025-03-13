// --- Resize & Extend SVG Elements ---
function resizeSVG() {
  const svg       = document.getElementById("guideSVG");
  const greenRect = document.getElementById("greenRect");
  const blueLine  = document.getElementById("blueLine");
  const redLine1  = document.getElementById("redLine1");
  const redLine2  = document.getElementById("redLine2");

  // Get current screen size
  const screenWidth  = window.innerWidth;
  const screenHeight = window.innerHeight;

  // Original design dimensions (green rectangle)
  const rectOriginalX      = 1027;
  const rectOriginalY      = 485;
  const rectOriginalWidth  = 1920;
  const rectOriginalHeight = 1080;

  // Scaling factors
  const scaleX = screenWidth  / rectOriginalWidth;
  const scaleY = screenHeight / rectOriginalHeight;

  // Set viewBox to match screen dimensions (overflow is set to visible in CSS)
  svg.setAttribute("viewBox", `0 0 ${screenWidth} ${screenHeight}`);

  // Make the green rectangle fill the screen
  greenRect.setAttribute("x", 0);
  greenRect.setAttribute("y", 0);
  greenRect.setAttribute("width", screenWidth);
  greenRect.setAttribute("height", screenHeight);

  // Helper: Scale a line from original design coordinates (and extend endpoints)
  function scaleAndExtendLine(line, x1Orig, y1Orig, x2Orig, y2Orig, extensionFactor = 0.2) {
    // Calculate extension (extend both ends by a percentage of the original length)
    const dx = x2Orig - x1Orig;
    const dy = y2Orig - y1Orig;
    const newX1 = x1Orig - extensionFactor * dx;
    const newY1 = y1Orig - extensionFactor * dy;
    const newX2 = x2Orig + extensionFactor * dx;
    const newY2 = y2Orig + extensionFactor * dy;

    // Apply scaling while accounting for the original offset
    const scaledX1 = (newX1 - rectOriginalX) * scaleX;
    const scaledY1 = (newY1 - rectOriginalY) * scaleY;
    const scaledX2 = (newX2 - rectOriginalX) * scaleX;
    const scaledY2 = (newY2 - rectOriginalY) * scaleY;

    line.setAttribute("x1", scaledX1);
    line.setAttribute("y1", scaledY1);
    line.setAttribute("x2", scaledX2);
    line.setAttribute("y2", scaledY2);

    console.log(line.id, scaledX1, scaledY1, scaledX2, scaledY2);
  }

  // Adjust and extend lines based on original design values
  scaleAndExtendLine(blueLine, 271.05, 897.215, 3433.91, 897.215);
  scaleAndExtendLine(redLine1, 1.43298, 993.478, 2961.09, 4.28699);
  scaleAndExtendLine(redLine2, 162.795, 858.626, 2981.52, 1800.71);
}

// --- Animate a Line Drawing (Debugging) ---
function animateLineDrawing(lineElem, duration) {
  const x1 = parseFloat(lineElem.getAttribute("x1"));
  const y1 = parseFloat(lineElem.getAttribute("y1"));
  const x2 = parseFloat(lineElem.getAttribute("x2"));
  const y2 = parseFloat(lineElem.getAttribute("y2"));

  // Create or reset a dynamic line for animation
  let dynamicLine = document.getElementById("dynamicLine");
  if (!dynamicLine) {
    dynamicLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
    dynamicLine.setAttribute("id", "dynamicLine");
    dynamicLine.setAttribute("stroke", "#FF00FF");
    dynamicLine.setAttribute("stroke-width", lineElem.getAttribute("stroke-width") || 2);
    dynamicLine.setAttribute("stroke-miterlimit", lineElem.getAttribute("stroke-miterlimit") || 10);
    dynamicLine.setAttribute("x1", x1);
    dynamicLine.setAttribute("y1", y1);
    dynamicLine.setAttribute("x2", x1);
    dynamicLine.setAttribute("y2", y1);
    lineElem.parentElement.appendChild(dynamicLine);
  } else {
    dynamicLine.setAttribute("x1", x1);
    dynamicLine.setAttribute("y1", y1);
    dynamicLine.setAttribute("x2", x1);
    dynamicLine.setAttribute("y2", y1);
  }

  let startTime = null;
  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    let progress = (timestamp - startTime) / duration;
    if (progress > 1) progress = 1;

    // Calculate the new x position
    let newX = x1 + progress * (x2 - x1);
    let newY = getLineY(lineElem, newX);

    dynamicLine.setAttribute("x2", newX);
    dynamicLine.setAttribute("y2", newY);

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }
  requestAnimationFrame(step);
}

// Compute y on a line given an x value using the line’s equation.
function getLineY(lineElem, x) {
  const x1 = parseFloat(lineElem.getAttribute("x1"));
  const y1 = parseFloat(lineElem.getAttribute("y1"));
  const x2 = parseFloat(lineElem.getAttribute("x2"));
  const y2 = parseFloat(lineElem.getAttribute("y2"));

  if (Math.abs(x2 - x1) < 0.0001) return y1; // Avoid division by zero
  const slope = (y2 - y1) / (x2 - x1);
  return slope * (x - x1) + y1;
}

// --- Intersection Calculation Helpers ---
function getLineParams(lineElem) {
  const x1 = parseFloat(lineElem.getAttribute("x1"));
  const y1 = parseFloat(lineElem.getAttribute("y1"));
  const x2 = parseFloat(lineElem.getAttribute("x2"));
  const y2 = parseFloat(lineElem.getAttribute("y2"));

  console.log("Values for", lineElem.id, x1, y1, x2, y2);

  if (Math.abs(x2 - x1) < 0.0001) {
    return { vertical: true, x: x1 };
  }
  const m = (y2 - y1) / (x2 - x1);
  const b = y1 - m * x1;
  return { vertical: false, m, b };
}

function intersectLines(lineElem1, lineElem2) {
  const params1 = getLineParams(lineElem1);
  const params2 = getLineParams(lineElem2);

  // Handle vertical cases
  if (params1.vertical && params2.vertical) return null;
  if (params1.vertical) {
    const x = params1.x;
    const y = params2.m * x + params2.b;
    return { x, y };
  }
  if (params2.vertical) {
    const x = params2.x;
    const y = params1.m * x + params1.b;
    return { x, y };
  }
  if (Math.abs(params1.m - params2.m) < 0.0001) return null; // Parallel

  const x = (params2.b - params1.b) / (params1.m - params2.m);
  const y = params1.m * x + params1.b;
  return { x, y };
}

// Global array to store your perspective guide lines by order.
const perspectiveGuideLines = [];

// --- Guide Line Functions ---
// Animate a single guide line from (startX, startY) outwards at a given angle.
// An optional id parameter names the line.
function animateGuideLine(startX, startY, angleDeg, length, duration, id) {
  const angleRad = angleDeg * Math.PI / 180;
  const endX = startX + length * Math.cos(angleRad);
  const endY = startY + length * Math.sin(angleRad);

  const guideLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
  if (id) {
    guideLine.setAttribute("id", id);
  }
  guideLine.setAttribute("stroke", "#00FF00"); // Green for guide lines
  guideLine.setAttribute("stroke-width", "9");
  guideLine.setAttribute("x1", startX);
  guideLine.setAttribute("y1", startY);
  guideLine.setAttribute("x2", startX);
  guideLine.setAttribute("y2", startY);

  const svg = document.getElementById("guideSVG");
  svg.appendChild(guideLine);

  let startTime = null;
  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    let progress = (timestamp - startTime) / duration;
    if (progress > 1) progress = 1;
    const currentX = startX + progress * (endX - startX);
    const currentY = startY + progress * (endY - startY);
    guideLine.setAttribute("x2", currentX);
    guideLine.setAttribute("y2", currentY);
    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }
  requestAnimationFrame(step);
  return guideLine;
}

// Create multiple guide lines from the intersection point with unique IDs.
// This function clears the previous perspective lines and then stores new ones.
function createGuideLinesWithIds(startX, startY, count, initialAngle, angleSeparation, length, duration) {
  // Clear any previous guide lines from our global array.
  perspectiveGuideLines.length = 0;
  
  // Optionally, you might also want to remove old guide line elements from the DOM:
  // document.querySelectorAll("[id^='guideLine']").forEach(el => el.remove());
  
  for (let i = 0; i < count; i++) {
    const angle = initialAngle + i * angleSeparation;
    // Create a unique id for each guide line (e.g., "guideLine1", "guideLine2", etc.)
    const lineId = "guideLine" + (i + 1);
    const guideLine = animateGuideLine(startX, startY, angle, length, duration, lineId);
    perspectiveGuideLines.push(guideLine);
  }
}

// --- (Your existing functions remain unchanged) ---
// resizeSVG, animateLineDrawing, getLineY, getLineParams, intersectLines, etc.

// --- Putting It All Together ---
function init() {
  // Run resize to update all SVG element attributes (and extend lines)
  resizeSVG();

  // Animate a debug line using redLine1 (for instance)
  const redLine1 = document.getElementById("redLine1");
  animateLineDrawing(redLine1, 2000);

  // Compute the intersection of redLine1 and redLine2
  const redLine2 = document.getElementById("redLine2");
  const intersection = intersectLines(redLine1, redLine2);
  console.log("Intersection of redLine1 and redLine2:", intersection);

  // If a valid intersection is found, create guide lines from that point.
  if (intersection && intersection.x !== null && intersection.y !== null) {
    // Example: create 14 guide lines starting at the intersection,
    // starting at -30° and increasing by 5° each time,
    // each 3000px long, animated over 2 seconds.
    createGuideLinesWithIds(intersection.x, intersection.y, 14, -30, 5, 3000, 2000);

    // At this point, perspectiveGuideLines is an array of your named SVG <line> elements.
    // For example, you can later refer to perspectiveGuideLines[0] for "guideLine1",
    // perspectiveGuideLines[1] for "guideLine2", etc.
    // You can use these references to measure distances or compute scales for other objects.
  }
}

// Run init on load and when the window is resized.
window.addEventListener("load", init);
window.addEventListener("resize", () => {
  init();

  // Extra debugging: log viewBox values and red line position.
  const trackSvg = document.getElementById("track1Svg");
  const guideSvg = document.getElementById("guideSVG");
  console.log("track1Svg ViewBox:", trackSvg.getAttribute("viewBox"));
  console.log("guideSVG ViewBox:", guideSvg.getAttribute("viewBox"));
  const redLineRect = document.getElementById("redLine1").getBoundingClientRect();
  console.log("Red Line Actual Position:", redLineRect);
});




