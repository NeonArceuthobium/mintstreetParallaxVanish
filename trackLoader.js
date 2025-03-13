

/* --- GSAP-based Smoke Stack Animation --- */
// (Your smoke stack code remains unchanged below this point.)
const activeLamps = [];
const trackShapes = { track1: ["shapeATrack1"] };
const trackColors = { track1: ["red", "green"] };
const lastSpawnedMap = {
  track1: null,
  track2: null,
  track3: null,
  track4: null,
  track5: null,
};
const BASE_DISTANCE = 2300; // Base x-range for tweening

function spawnSmokeStack(svgRoot, durationSec) {
  const trackId = svgRoot.getAttribute("id");
  const shortId = trackId.replace("Svg", "");
  const shapeId = "shapeATrack1";
  const template = document.getElementById(shapeId);
  if (!template) {
    console.warn("No template found for ID:", shapeId);
    return;
  }

  const newLamp = template.cloneNode(true);
  newLamp.removeAttribute("id");
  svgRoot.appendChild(newLamp);

  const bbox = newLamp.getBBox();
  const lampOriginalHeight = bbox.height;
  const lampOriginalWidth = bbox.width;

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
    onUpdate: function () {
      const currentX = this.targets()[0].param;
      // Get y-positions from red lines
      const yRedLine1 = getLineY(document.getElementById("redLine1"), currentX);
      const yRedLine2 = getLineY(document.getElementById("redLine2"), currentX);
      if (yRedLine1 === null || yRedLine2 === null) return;
      let scaleFactor = (yRedLine2 - yRedLine1) / lampOriginalHeight;
      if (scaleFactor <= 0) scaleFactor = 0.01;
      gsap.set(newLamp, {
        transformOrigin: "50% 0%",
        transform: `translate(${currentX - bbox.x}px, ${yRedLine1 - bbox.y}px) scale(${scaleFactor})`
      });
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

// Automatically spawn a lamp every second on track1Svg.
const track1Svg = document.getElementById("track1Svg");
setInterval(() => {
  spawnSmokeStack(track1Svg, 6);
}, 1000);
