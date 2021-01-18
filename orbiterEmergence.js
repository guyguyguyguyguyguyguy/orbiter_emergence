//import Controls from './controlsClass.js';
//import Orbiter from './orbiterClass.js';

//consts
let numOrbiters = 10;
let orbiters = [];
//set as 12 as each point has a radius of 5
let MINDIST = 20*20 + 2;
let spring = 0.05;
let IDCOUNT = 0;

//for zooming
let sf = 1; // scaleFactor
let x = 0; // pan X
let y = 0; // pan Y
let mx, my; // mouse coords;


const controls = {
  view: {
    x: 0,
    y: 0,
    zoom: 1
  },
  viewPos: {
    prevX: null,
    prevY: null,
    isDragging: false
  },
}


function setup() {
  canvas = createCanvas(800, 800);
  canvas.mouseWheel(e => Controls.zoom(controls).worldZoom(e))

  for (let i = 0; i < numOrbiters; ++i) {
    orbiters[i] = new Orbiter(
      random(width),
      random(height),
      IDCOUNT,
      random(10, 100)
    );
    ++IDCOUNT;
  }

  noStroke();
}


function draw() {

  background(0);
  translate(controls.view.x, controls.view.y);
  scale(controls.view.zoom);

  if (keyIsDown(UP_ARROW)) {
    controls.view.y += 10;
  } else if (keyIsDown(DOWN_ARROW)) {
    controls.view.y -= 10;
  } else if (keyIsDown(LEFT_ARROW)) {
    controls.view.x += 10;
  } else if (keyIsDown(RIGHT_ARROW)) {
    controls.view.x -= 10;
  }

  orbiters.forEach(orbiter => {
    orbiter.move();
    orbiter.display();
    orbiter.collide();
    orbiter.moveCollision();
  });

}


window.mousePressed = e => Controls.move(controls).mousePressed(e);
window.mouseDragged = e => Controls.move(controls).mouseDragged(e);
window.mouseReleased = e => Controls.move(controls).mouseReleased(e);
// window.keyPressed = e => Controls.move(controls).keyPressed(e);
