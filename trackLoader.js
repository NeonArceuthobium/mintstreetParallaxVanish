
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
      ease: "expo.in",
  
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
    spawnSmokeStack(track1Svg, 6);
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
  