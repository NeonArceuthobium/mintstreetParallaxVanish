// ========================================================
// Global Constants and Variables
// ========================================================

const BASE_DISTANCE = 2300; // Base x-range for tweening
const perspectiveGuideLines = []; // Array to store perspective guide (rail) lines

// Instead of activeLamps and lastSpawnedMap, use activeAssets
const activeAssets = [];

// Configuration objects remain the same
const trackConfigs = [
  {
    id: "track1",
    svgId: "track1Svg",
    topRailId: "redLine1",
    bottomRailId: "rail9",
    assetTemplates: ["shapeATrack1", "shapeBTrack1", "shapeCTrack1", "shapeDTrack1"],
    speed: 6,
    spawnRate: 1000,
    zIndex: 1
  },
  {
      id: "track2",
    svgId: "track2Svg",
    topRailId: "redLine2",
    bottomRailId: "rail14",
    assetTemplates: ["shapeATrack2"],
    speed: 20,
    spawnRate: 10000,
    zIndex: 0
  }

];


// ========================================================
// SVG Resize and Guide Lines Setup
// ========================================================

function resizeSVG() {
  const svg = document.getElementById("guideSVG");
  const greenRect = document.getElementById("greenRect");
  const blueLine = document.getElementById("blueLine");
  const redLine1 = document.getElementById("redLine1");
  const redLine2 = document.getElementById("redLine2");

  // Get current screen dimensions
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  // Original design dimensions for the green rectangle
  const rectOriginalX = 1027;
  const rectOriginalY = 485;
  const rectOriginalWidth = 1920;
  const rectOriginalHeight = 1080;

  // Calculate scaling factors for width and height
  const scaleX = screenWidth / rectOriginalWidth;
  const scaleY = screenHeight / rectOriginalHeight;

  // Update the SVG viewBox so that it matches the screen dimensions
  svg.setAttribute("viewBox", `0 0 ${screenWidth} ${screenHeight}`);

  // Update the green rectangle to fill the entire screen
  greenRect.setAttribute("x", 0);
  greenRect.setAttribute("y", 0);
  greenRect.setAttribute("width", screenWidth);
  greenRect.setAttribute("height", screenHeight);

  // ----------------------------------------------------
  // Helper Function: Scale and Extend a Guide Line
  // ----------------------------------------------------
  function scaleAndExtendLine(
    line,
    x1Orig,
    y1Orig,
    x2Orig,
    y2Orig,
    extensionFactor = 0.2
  ) {
    const dx = x2Orig - x1Orig;
    const dy = y2Orig - y1Orig;
    const newX1 = x1Orig - extensionFactor * dx;
    const newY1 = y1Orig - extensionFactor * dy;
    const newX2 = x2Orig + extensionFactor * dx;
    const newY2 = y2Orig + extensionFactor * dy;

    // Apply scaling based on the original design offset and scaling factors
    const scaledX1 = (newX1 - rectOriginalX) * scaleX;
    const scaledY1 = (newY1 - rectOriginalY) * scaleY;
    const scaledX2 = (newX2 - rectOriginalX) * scaleX;
    const scaledY2 = (newY2 - rectOriginalY) * scaleY;

    // Set the new positions for the guide line
    line.setAttribute("x1", scaledX1);
    line.setAttribute("y1", scaledY1);
    line.setAttribute("x2", scaledX2);
    line.setAttribute("y2", scaledY2);

    console.log(line.id, scaledX1, scaledY1, scaledX2, scaledY2);
  }

  // Update guide lines based on original design coordinates
  scaleAndExtendLine(blueLine, 271.05, 897.215, 3433.91, 897.215);
  scaleAndExtendLine(redLine1, 1.43298, 993.478, 2961.09, 4.28699);
  scaleAndExtendLine(redLine2, 162.795, 858.626, 2981.52, 1800.71);
}

// ========================================================
// Utility Functions
// ========================================================

function getLineY(lineElem, x) {
  const x1 = parseFloat(lineElem.getAttribute("x1"));
  const y1 = parseFloat(lineElem.getAttribute("y1"));
  const x2 = parseFloat(lineElem.getAttribute("x2"));
  const y2 = parseFloat(lineElem.getAttribute("y2"));

  if (Math.abs(x2 - x1) < 0.0001) return y1;
  const slope = (y2 - y1) / (x2 - x1);
  return slope * (x - x1) + y1;
}

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
  if (Math.abs(params1.m - params2.m) < 0.0001) return null;
  const x = (params2.b - params1.b) / (params1.m - params2.m);
  const y = params1.m * x + params1.b;
  return { x, y };
}

// ========================================================
// Guide (Rail) Line Functions
// ========================================================

/**
 * Animates a single guide (rail) line from (startX, startY) outward at a given angle.
 * The id parameter assigns a unique ID (e.g., "rail1"), and the color parameter sets its stroke.
 */
function animateGuideLine(
  startX,
  startY,
  angleDeg,
  length,
  duration,
  id,
  color
) {
  const angleRad = (angleDeg * Math.PI) / 180;
  const endX = startX + length * Math.cos(angleRad);
  const endY = startY + length * Math.sin(angleRad);

  const guideLine = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "line"
  );
  if (id) {
    guideLine.setAttribute("id", id);
  }
  guideLine.setAttribute("stroke", color);
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

/**
 * Creates multiple guide (rail) lines from an intersection point.
 * Removes any existing rail lines (IDs starting with "rail"),
 * then creates new ones with unique IDs ("rail1", "rail2", etc.)
 * using a preset array of colors (consistent order). Finally, logs each rail's ID and color.
 */
function createGuideLinesWithIds(
  startX,
  startY,
  count,
  initialAngle,
  angleSeparation,
  length,
  duration
) {
  // Remove existing guide lines with IDs starting with "rail"
  const existingGuideLines = document.querySelectorAll("[id^='rail']");
  existingGuideLines.forEach((el) => el.remove());

  // Clear the global array
  perspectiveGuideLines.length = 0;

  // Define an array of colors in a consistent order
  const guideLineColors = [
    "orange",
    "yellow",
    "red",
    "blue",
    "green",
    "purple",
    "cyan",
    "magenta",
    "lime",
    "pink",
    "teal",
    "lavender",
    "brown",
    "black"
  ];

  // Create the guide (rail) lines with IDs "rail1", "rail2", etc.
  for (let i = 0; i < count; i++) {
    const angle = initialAngle + i * angleSeparation;
    const railId = "rail" + (i + 1);
    const color = guideLineColors[i % guideLineColors.length];
    const guideLine = animateGuideLine(
      startX,
      startY,
      angle,
      length,
      duration,
      railId,
      color
    );
    perspectiveGuideLines.push(guideLine);
  }

  // Log each rail's ID and color
  perspectiveGuideLines.forEach((line) => {
    console.log(`Rail ID: ${line.id}, Color: ${line.getAttribute("stroke")}`);
  });
}

// ========================================================
// Debug Animation Function: Animate Line Drawing
// ========================================================

function animateLineDrawing(lineElem, duration) {
  const x1 = parseFloat(lineElem.getAttribute("x1"));
  const y1 = parseFloat(lineElem.getAttribute("y1"));
  const x2 = parseFloat(lineElem.getAttribute("x2"));
  const y2 = parseFloat(lineElem.getAttribute("y2"));

  let dynamicLine = document.getElementById("dynamicLine");
  if (!dynamicLine) {
    dynamicLine = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "line"
    );
    dynamicLine.setAttribute("id", "dynamicLine");
    dynamicLine.setAttribute("stroke", "#FF00FF");
    dynamicLine.setAttribute(
      "stroke-width",
      lineElem.getAttribute("stroke-width") || 2
    );
    dynamicLine.setAttribute(
      "stroke-miterlimit",
      lineElem.getAttribute("stroke-miterlimit") || 10
    );
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

// ========================================================
// Updated Smoke Stack Function to Accept Template ID
// ========================================================

function spawnSmokeStack(svgRoot, durationSec, assetTemplateId, topRailId, bottomRailId) {
  const trackId = svgRoot.getAttribute("id");

  // Find the template element based on assetTemplateId
  const template = document.getElementById(assetTemplateId);
  if (!template) {
    console.warn("No template found for ID:", assetTemplateId);
    return;
  }

  // Clone and append asset
  const newAsset = template.cloneNode(true);
  newAsset.removeAttribute("id");
  svgRoot.appendChild(newAsset);

  // Add the asset to activeAssets array
  activeAssets.push(newAsset);

  const bbox = newAsset.getBBox();
  const assetOriginalHeight = bbox.height;

  const debugCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  debugCircle.setAttribute("r", "10");
  debugCircle.setAttribute("fill", "red");
  debugCircle.setAttribute("stroke", "black");
  debugCircle.setAttribute("stroke-width", "2");
  svgRoot.appendChild(debugCircle);

  gsap.to({ param: -300 }, {
    param: 2500,
    duration: durationSec,
    ease: "expo.in",
    onUpdate: function() {
      const currentX = this.targets()[0].param;
      
      // Use the rail IDs specified in the track configuration
      const topRail = document.getElementById(topRailId);
      const bottomRail = document.getElementById(bottomRailId);
      
      if (!topRail || !bottomRail) return;
      
      const yTopRail = getLineY(topRail, currentX);
      const yBottomRail = getLineY(bottomRail, currentX);
      if (yTopRail === null || yBottomRail === null) return;
      
      let scaleFactor = (yBottomRail - yTopRail) / assetOriginalHeight;
      if (scaleFactor <= 0) scaleFactor = 0.01;
      
      gsap.set(newAsset, {
        transformOrigin: "50% 0%",
        transform: `translate(${currentX - bbox.x}px, ${yTopRail - bbox.y}px) scale(${scaleFactor})`
      });
      gsap.set(debugCircle, {
        cx: currentX - bbox.x,
        cy: yBottomRail - bbox.y
      });
    },
    onComplete: () => {
      newAsset.remove();
      debugCircle.remove();
      const index = activeAssets.indexOf(newAsset);
      if (index > -1) {
        activeAssets.splice(index, 1);
      }
    }
  });
}







// ========================================================
// Generic Function to Spawn an Asset for a Given Track
// ========================================================

function spawnAssetForTrack(trackConfig) {
  const { svgId, assetTemplates, spawnRate, topRailId, bottomRailId, speed } = trackConfig;
  const svgRoot = document.getElementById(svgId);
  if (!svgRoot) {
    console.warn(`SVG not found for track: ${svgId}`);
    return;
  }
  
  const randomIndex = Math.floor(Math.random() * assetTemplates.length);
  const selectedTemplateId = assetTemplates[randomIndex];
  
  // Now pass the rail IDs to spawnSmokeStack
  spawnSmokeStack(svgRoot, 6, selectedTemplateId, topRailId, bottomRailId);
}


// ========================================================
// Updated Track Initialization
// ========================================================
// Global variable for track intervals (if needed elsewhere)
let trackIntervals = [];

// Helper: Clear existing road, curb, and sidewalk elements on track2
function clearTrack2Elements() {
  const ids = ["roadTrack2", "curbTrack2", "sidewalkTrack2"];
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.remove();
    }
  });
}

function initTracks() {
  // Clear existing intervals
  trackIntervals.forEach((intervalID) => clearInterval(intervalID));
  trackIntervals = [];

  // Update the SVG guides/rails first
  resizeSVG();

  // For each track configuration, set up a repeating spawn interval and save its ID
  trackConfigs.forEach((config) => {
    const intervalID = setInterval(() => {
      spawnAssetForTrack(config);
    }, config.spawnRate);
    trackIntervals.push(intervalID);
  });
}

// Road, curb, sidewalk generation functions:
function generateRoadOnTrack2() {
  const svg = document.getElementById("track2Svg");
  if (!svg) {
    console.warn("SVG for track 2 not found.");
    return;
  }
  
  const topRail = document.getElementById("redLine2");
  const bottomRail = document.getElementById("rail14");
  if (!topRail || !bottomRail) {
    console.warn("Required rails for road generation not found.");
    return;
  }
  
  // Use the full width of the screen as our x-range
  const screenWidth = window.innerWidth;
  const xLeft = 0;
  const xRight = screenWidth;
  
  // Calculate y coordinates on each rail at the left and right edges.
  const yTopLeft = getLineY(topRail, xLeft);
  const yTopRight = getLineY(topRail, xRight);
  const yBottomLeft = getLineY(bottomRail, xLeft);
  const yBottomRight = getLineY(bottomRail, xRight);
  
  // Create a polygon that fills the area between the rails.
  const road = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  road.setAttribute("id", "roadTrack2");
  road.setAttribute(
    "points",
    `${xLeft},${yTopLeft} ${xRight},${yTopRight} ${xRight},${yBottomRight} ${xLeft},${yBottomLeft}`
  );
  road.setAttribute("fill", "#1a1a1a"); // road-like color
  road.setAttribute("stroke", "none");
  
  // Insert the road as the bottom layer in the SVG.
  svg.insertBefore(road, svg.firstChild);
}

function generateCurbOnTrack2() {
  const svg = document.getElementById("track2Svg");
  if (!svg) {
    console.warn("SVG for track 2 not found.");
    return;
  }
  
  const topRail = document.getElementById("redLine2");
  const bottomRail = document.getElementById("rail9");
  if (!topRail || !bottomRail) {
    console.warn("Required rails for curb generation not found.");
    return;
  }
  
  const screenWidth = window.innerWidth;
  const xLeft = 0;
  const xRight = screenWidth;
  
  const yTopLeft = getLineY(topRail, xLeft);
  const yTopRight = getLineY(topRail, xRight);
  const yBottomLeft = getLineY(bottomRail, xLeft);
  const yBottomRight = getLineY(bottomRail, xRight);
  
  const curb = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  curb.setAttribute("id", "curbTrack2");
  curb.setAttribute(
    "points",
    `${xLeft},${yTopLeft} ${xRight},${yTopRight} ${xRight},${yBottomRight} ${xLeft},${yBottomLeft}`
  );
  curb.setAttribute("fill", "#2a2a2a"); // lighter curb color
  curb.setAttribute("stroke", "none");
  
  svg.insertBefore(curb, svg.firstChild);
}

function generateSidewalkOnTrack2() {
  const svg = document.getElementById("track2Svg");
  if (!svg) {
    console.warn("SVG for track 2 not found.");
    return;
  }
  
  // Note: Use distinct rail IDs for sidewalk if needed; here we assume:
  // Top edge: rail9, Bottom edge: rail7
  const topRail = document.getElementById("rail9");
  const bottomRail = document.getElementById("rail7");
  if (!topRail || !bottomRail) {
    console.warn("Required rails for sidewalk generation not found.");
    return;
  }
  
  const screenWidth = window.innerWidth;
  const xLeft = 0;
  const xRight = screenWidth;
  
  const yTopLeft = getLineY(topRail, xLeft);
  const yTopRight = getLineY(topRail, xRight);
  const yBottomLeft = getLineY(bottomRail, xLeft);
  const yBottomRight = getLineY(bottomRail, xRight);
  
  const sidewalk = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  sidewalk.setAttribute("id", "sidewalkTrack2");
  sidewalk.setAttribute(
    "points",
    `${xLeft},${yTopLeft} ${xRight},${yTopRight} ${xRight},${yBottomRight} ${xLeft},${yBottomLeft}`
  );
  sidewalk.setAttribute("fill", "#3a3a3a"); // sidewalk color
  sidewalk.setAttribute("stroke", "none");
  
  svg.insertBefore(sidewalk, svg.firstChild);
}









// Global array to track active skyline buildings
const skylineAssets = [];

/**
 * Dynamically generates and animates a skyline building shape that anchors to specified rails.
 * The building is defined as a polygon whose top and bottom edges follow the chosen rails.
 *
 * @param {SVGElement} svgRoot - The SVG element where the building will be appended.
 * @param {number} durationSec - Animation duration in seconds.
 * @param {Array} topRailOptions - Array of rail IDs to choose from for the building's top edge.
 * @param {string} bottomRailId - The rail ID used for the building's bottom edge (e.g. "rail7").
 * @param {number} buildingWidth - The base horizontal width (in pixels) of the building.
 * @param {number} spawnOffset - How far off-screen (in pixels) the building spawns from the left.
 */
function spawnDynamicSkylineBuilding(
  svgRoot,
  durationSec,
  topRailOptions,
  bottomRailId,
  buildingWidth,
  spawnOffset
) {
  // Randomly select one of the top rails
  const randomIndex = Math.floor(Math.random() * topRailOptions.length);
  const chosenTopRailId = topRailOptions[randomIndex];
  const topRail = document.getElementById(chosenTopRailId);
  const bottomRail = document.getElementById(bottomRailId);
  
  if (!topRail || !bottomRail) {
    console.warn("One or both required rails were not found:", chosenTopRailId, bottomRailId);
    return;
  }
  
  // Create the SVG polygon for the building.
  const building = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  building.setAttribute("fill", "#444");  // Building color (dark gray)
  building.setAttribute("stroke", "#222");  // Border color
  building.setAttribute("stroke-width", "2");
  svgRoot.insertBefore(building, svgRoot.firstChild);
  skylineAssets.push(building);

  // Define starting/ending X positions for the animation.
  const startX = -spawnOffset;
  const endX = window.innerWidth;
  
  // Compute a "base height" from the rails at the starting position
  const baseTopY = getLineY(topRail, startX);
  const baseBottomY = getLineY(bottomRail, startX);
  const baseHeight = baseBottomY - baseTopY;
  if (baseHeight <= 0) {
    console.warn("Invalid baseHeight—check top vs bottom rails.");
  }

  // Animate the building’s left edge from startX to endX, linear, no overlap
  gsap.to({ param: startX }, {
    param: endX,
    duration: durationSec,
    ease: "expo.in",  // No easing, uniform speed
    onUpdate: function() {
      const currentX = this.targets()[0].param;
      
      // 1. Get the y-values along both rails at the current left edge
      const leftTopY = getLineY(topRail, currentX);
      const leftBottomY = getLineY(bottomRail, currentX);
      if (leftBottomY <= leftTopY) return; // Safeguard

      // 2. Compute a **clamped** scale factor based on height difference
      let scaleFactor = (leftBottomY - leftTopY) / baseHeight;
      scaleFactor = Math.min(scaleFactor, 2);  // Cap the growth at 2x

      // 3. Compute a **smooth** width growth factor
      const progress = (currentX - startX) / (endX - startX);  // 0 (left) -> 1 (right)
      const dynamicWidth = buildingWidth * (1 + scaleFactor * progress); // Gradual expansion

      // 4. Compute right edge
      const rightX = currentX + dynamicWidth;

      // 5. Get the y-values along the rails at the building’s right edge
      const rightTopY = getLineY(topRail, rightX);
      const rightBottomY = getLineY(bottomRail, rightX);

      // 6. Update the polygon points
      const points = `${currentX},${leftTopY} 
                      ${rightX},${rightTopY} 
                      ${rightX},${rightBottomY} 
                      ${currentX},${leftBottomY}`;
      building.setAttribute("points", points.trim());
    },
    onComplete: () => {
      // Remove the building from the DOM
      building.remove();
      const index = skylineAssets.indexOf(building);
      if (index > -1) skylineAssets.splice(index, 1);
    }
  });
}

// ========================================================
// Example Initialization
// ========================================================
function init() {
  resizeSVG();
  
  // Clear old elements (roads, curbs, sidewalks) before recalculating.
  clearTrack2Elements();
  
  // Example lines animation
  const redLine1 = document.getElementById("redLine1");
  animateLineDrawing(redLine1, 2000);
  
  const redLine2 = document.getElementById("redLine2");
  const intersection = intersectLines(redLine1, redLine2);
  if (intersection && intersection.x !== null && intersection.y !== null) {
    createGuideLinesWithIds(intersection.x, intersection.y, 16, -25, 5, 3000, 2000);
  }
  
  // Delay generation of sidewalk, curb, and road elements until rails are ready
  setTimeout(generateSidewalkOnTrack2, 200);
  setTimeout(generateCurbOnTrack2, 200);
  setTimeout(generateRoadOnTrack2, 200);
  
  // Initialize track-based asset spawning
  initTracks();
  
function updateSkylineConfig() {
  const spawnOffset = window.innerWidth * 0.2; // Offset is 20% of screen width
  const buildingWidth = window.innerWidth * 0.1; // Width is 5% of screen width

  return {
    svgId: "track3Svg",
    topRailOptions: ["rail1", "rail2", "rail3", "rail4"],
    bottomRailId: "rail7",
    buildingWidth,  // Dynamic width
    speed: 10,  // Time for buildings to cross the screen
    spawnRate: 300, // Adjust spawn rate as needed
    spawnOffset // Dynamic spawn offset
  };
}

// Initialize SkylineConfig on load
let skylineConfigs = updateSkylineConfig();

// Recalculate on resize
window.addEventListener("resize", () => {
  skylineConfigs = updateSkylineConfig();
});

// Spawn function now uses the dynamically updated skylineConfigs
function spawnBuildingForSkyline(config) {
  const { svgId, topRailOptions, bottomRailId, buildingWidth, speed, spawnOffset } = config;
  const svgRoot = document.getElementById(svgId);
  if (!svgRoot) {
    console.warn(`SVG not found for skyline: ${svgId}`);
    return;
  }
  spawnDynamicSkylineBuilding(svgRoot, speed, topRailOptions, bottomRailId, buildingWidth, spawnOffset);
}

  
  // Start periodically spawning skyline buildings
  if (!window.skylineInterval) {
    window.skylineInterval = setInterval(() => {
      spawnBuildingForSkyline(skylineConfigs);
    }, skylineConfigs.spawnRate);
  }
}

window.addEventListener("load", init);
window.addEventListener("resize", init);
