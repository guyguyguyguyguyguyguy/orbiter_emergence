let input, sbutton, cbutton, numOrbiters, msg;
let orbiters = [];
//set as 12 as each point has a radius of 5
const MINDIST = 10;
let IDCOUNT = 0;
const minRad = 30;
const maxRad = 300;
//1/gamma gives the mean of the exponential distribution; in this case 100
const gamma = 0.01;
let canvas;

//for zooming
let sf = 1; // scaleFactor
let x = 0; // pan X
let y = 0; // pan Y
let mx, my; // mouse coords;


function fact(x) {
  if (x < 0) return;
  if (x === 0) return 1;
  return x * fact(x - 1);
}


function randomCol() {
  let a = random(0, 255);
  let b = random(0, 255);
  let c = random(0, 255);

  return [a, b, c];
}


function initOrbiters() {
  //numOrbiters = input.value();
  for (let i = 0; i < numOrbiters; ++i) {
    orbiters[i] = new Orbiter(
      random(width),
      random(height),
      IDCOUNT,
      log(1 - random()) / (-gamma)
    );
    ++IDCOUNT;
  }
}

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
  canvas = createCanvas(windowWidth, windowHeight - 100);
  canvas.position(0, 150)
  canvas.mouseWheel(e => Controls.zoom(controls).worldZoom(e))

  numOrbiters = 0;
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
    orbiter.elasticCollide();
    //orbiter.testColide();
    orbiter.moveCollision();
  });

}


window.mousePressed = e => Controls.move(controls).mousePressed(e);
window.mouseDragged = e => Controls.move(controls).mouseDragged(e);
window.mouseReleased = e => Controls.move(controls).mouseReleased(e);
// window.keyPressed = e => Controls.move(controls).keyPressed(e);

