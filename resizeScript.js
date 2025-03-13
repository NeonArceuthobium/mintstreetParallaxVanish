function resizeSVG() {
    let svg       = document.getElementById("guideSVG");
    let greenRect = document.getElementById("greenRect");
    let blueLine  = document.getElementById("blueLine");
    let redLine1  = document.getElementById("redLine1");
    let redLine2  = document.getElementById("redLine2");
  
    // Get current screen size
    let screenWidth  = window.innerWidth;
    let screenHeight = window.innerHeight;
  
    // Original green rectangle dimensions
    let rectOriginalX      = 1027;
    let rectOriginalY      = 485;
    let rectOriginalWidth  = 1920;
    let rectOriginalHeight = 1080;
  
    // Scaling factors based on green rectangle
    let scaleX = screenWidth  / rectOriginalWidth;
    let scaleY = screenHeight / rectOriginalHeight;
  
    // Set viewBox to match screen dimensions
    svg.setAttribute("viewBox", `0 0 ${screenWidth} ${screenHeight}`);
  
    // Make the green rectangle fill the screen
    greenRect.setAttribute("x", 0);
    greenRect.setAttribute("y", 0);
    greenRect.setAttribute("width", screenWidth);
    greenRect.setAttribute("height", screenHeight);
  
    // Helper function: scale an <line> from original coords
    function scaleLine(line, x1, y1, x2, y2) {
      line.setAttribute("x1", x1 * scaleX);
      line.setAttribute("y1", y1 * scaleY);
      line.setAttribute("x2", x2 * scaleX);
      line.setAttribute("y2", y2 * scaleY);
    }
  
    // Adjust lines relative to original design coords
    scaleLine(blueLine,
      271.05  - rectOriginalX, 897.215  - rectOriginalY,
      3433.91 - rectOriginalX, 897.215  - rectOriginalY
    );
    scaleLine(redLine1,
      1.43298  - rectOriginalX,  993.478 - rectOriginalY,
      2961.09  - rectOriginalX,  4.28699 - rectOriginalY
    );
    scaleLine(redLine2,
      162.795  - rectOriginalX, 858.626  - rectOriginalY,
      2981.52  - rectOriginalX, 1800.71  - rectOriginalY
    );
  }
  // Run on load and resize
  window.addEventListener("load", resizeSVG);
  window.addEventListener("resize", resizeSVG);
  
  /************************************************************
   * Debugging: Create a single magenta path
   ************************************************************/
  let dynamicLine = null; // Store reference to the drawn line
  
  function animateLineDrawing(lineElem, duration) {
    const x1 = parseFloat(lineElem.getAttribute("x1"));
    const y1 = parseFloat(lineElem.getAttribute("y1"));
    const x2 = parseFloat(lineElem.getAttribute("x2"));
    const y2 = parseFloat(lineElem.getAttribute("y2"));
  
    if (!dynamicLine) {
      // Create dynamic line **only if it doesn’t exist**
      dynamicLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
      dynamicLine.setAttribute("stroke", "#FF00FF"); // Match redLine1 color
      dynamicLine.setAttribute("stroke-width", lineElem.getAttribute("stroke-width"));
      dynamicLine.setAttribute("stroke-miterlimit", lineElem.getAttribute("stroke-miterlimit"));
      dynamicLine.setAttribute("x1", x1);
      dynamicLine.setAttribute("y1", y1);
      dynamicLine.setAttribute("x2", x1);
      dynamicLine.setAttribute("y2", y1);
      
      // Append to same parent
      lineElem.parentElement.appendChild(dynamicLine);
    } else {
      // Reset existing line position
      dynamicLine.setAttribute("x1", x1);
      dynamicLine.setAttribute("y1", y1);
      dynamicLine.setAttribute("x2", x1);
      dynamicLine.setAttribute("y2", y1);
    }
  
    let startTime = null;
  
    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      let progress = (timestamp - startTime) / duration;
      if (progress > 1) progress = 1; // Clamp to 100%
  
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
  
  function getLineY(lineElem, x) {
    const bbox = lineElem.getBoundingClientRect(); // Get true screen position
    const svg = document.getElementById("guideSVG"); // The main SVG element
    const point = svg.createSVGPoint();
    
    // Convert x to SVG space
    point.x = x;
    const svgCoords = point.matrixTransform(svg.getScreenCTM().inverse());
  
    // Read original line coordinates
    const x1 = parseFloat(lineElem.getAttribute("x1"));
    const y1 = parseFloat(lineElem.getAttribute("y1"));
    const x2 = parseFloat(lineElem.getAttribute("x2"));
    const y2 = parseFloat(lineElem.getAttribute("y2"));
  
    // Compute slope
    if (Math.abs(x2 - x1) < 0.0001) return y1; // Avoid division by zero
    const slope = (y2 - y1) / (x2 - x1);
  
    // Compute new y position
    return slope * (svgCoords.x - x1) + y1;
  }
  
  // ✅ First run animation on page load
  window.addEventListener("load", () => {
    resizeSVG();
    const redLine1 = document.getElementById("redLine1");
    animateLineDrawing(redLine1, 2000);
  });
  
  // ✅ On resize, recalculate positions and restart animation
  window.addEventListener("resize", () => {
    resizeSVG();
    const redLine1 = document.getElementById("redLine1");
    animateLineDrawing(redLine1, 2000);
  });
  
  
  
  
  
  //lamp
  
  const activeLamps = [];
  
  /************************************************************ 
   * A) Track Definitions (same as before) 
   ************************************************************/
  const trackShapes = {
    track1: ["shapeATrack1"],
  };
  
  const trackColors = {
    track1: ["red", "green"],
  };
  
  const lastSpawnedMap = {
    track1: null,
    track2: null,
    track3: null,
    track4: null,
    track5: null,
  };
  
  /************************************************************ 
   * B) Base Distance
   * We'll define a base distance from x=-300 to x=2000 (2300px),
   * though in the pinning approach we handle the tween differently.
   ************************************************************/
  const BASE_DISTANCE = 2300; // -300 to 2000
  
  
  
  function spawnSmokeStack(svgRoot, durationSec) {
    const trackId = svgRoot.getAttribute("id");
    const shortId = trackId.replace("Svg", "");
  
    const shapeId = "shapeATrack1";
    const template = document.getElementById(shapeId);
    if (!template) {
      console.warn("No template found for ID:", shapeId);
      return;
    }
  
    // Clone the lamp
    const newLamp = template.cloneNode(true);
    newLamp.removeAttribute("id");
    svgRoot.appendChild(newLamp);
  
    // Get original bounding box
    const bbox = newLamp.getBBox();
    const lampOriginalHeight = bbox.height; 
    const lampOriginalWidth = bbox.width;   
  
    // Debugging circle to check anchor position
    const debugCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    debugCircle.setAttribute("r", "10");
    debugCircle.setAttribute("fill", "red");
    debugCircle.setAttribute("stroke", "black");
    debugCircle.setAttribute("stroke-width", "2");
    svgRoot.appendChild(debugCircle);
  
  
    
    gsap.to({ param: -300 }, {
      param: 2500,
      duration: durationSec,
      ease: CustomEase.create("myEase", "M0,0 C1, -0.06 1,0.4 1,1"),
  
  // "myEase", .52,-0.48,1,.02 1,-0.06,1,.31
      onUpdate: function () {
        const currentX = this.targets()[0].param;
  
        // Get Y positions from both lines
        const yRedLine1 = getLineY(document.getElementById("redLine1"), currentX);
        const yRedLine2 = getLineY(document.getElementById("redLine2"), currentX);
  
        if (yRedLine1 === null || yRedLine2 === null) return;
  
        // Calculate uniform scaling factor based on height difference
        let scaleFactor = (yRedLine2 - yRedLine1) / lampOriginalHeight;
  
        // Prevent negative or zero scaling
        if (scaleFactor <= 0) scaleFactor = 0.01; 
  
        // Move the lamp so its **top** stays at `redLine1`
        gsap.set(newLamp, {
          transformOrigin: "50% 0%", // Anchor at **top-center**
          transform: `translate(${currentX - bbox.x}px, ${yRedLine1 - bbox.y}px) scale(${scaleFactor})`
        });
  
        // Debugging: Move the red circle to check alignment
        gsap.set(debugCircle, {
          cx: currentX - bbox.x,
          cy: yRedLine2 - bbox.y
        });
      },
  
      onComplete: () => {
        newLamp.remove();
        debugCircle.remove();
      }
    });
  
    lastSpawnedMap[shortId] = newLamp;
  }
  
  
  /************************************************************
   * F) Automatic Spawning
   * e.g. spawn a lamp every 2 seconds, each crosses in 8s
   ************************************************************/
  const track1Svg = document.getElementById("track1Svg");
  setInterval(() => {
    spawnSmokeStack(track1Svg, 8);
  }, 1000);
  
  
  window.addEventListener("resize", () => {
    resizeSVG();
    const redLine = document.getElementById("redLine1");
    const rect = redLine.getBoundingClientRect();
    console.log("Red Line Actual Position:", rect);
  });
  
  window.addEventListener("resize", () => {
    const trackSvg = document.getElementById("track1Svg");
    const guideSvg = document.getElementById("guideSVG");
    
    console.log("track1Svg ViewBox:", trackSvg.getAttribute("viewBox"));
    console.log("guideSVG ViewBox:", guideSvg.getAttribute("viewBox"));
  });
  