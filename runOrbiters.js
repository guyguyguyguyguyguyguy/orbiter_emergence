
let input, sbutton, cbutton, numOrbiters, msg;
let orbiters = [];
//set as 12 as each point has a radius of 5
let MINDIST = 12;
let spring = 0.05;
let IDCOUNT = 0;

//for zooming
let sf = 1; // scaleFactor
let x = 0; // pan X
let y = 0; // pan Y
let mx, my; // mouse coords;


function randomCol() {
  let a = random(0, 255);
  let b = random(0, 255);
  let c = random(0, 255);

  return [a, b, c];
}


function initOrbiters() {
  numOrbiters = input.value();
  for (let i = 0; i < input.value(); ++i) {
    orbiters[i] = new Orbiter(
      random(width),
      random(height),
      IDCOUNT,
      random(10, 50)
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
  canvas.position(0, 100)
  canvas.mouseWheel(e => Controls.zoom(controls).worldZoom(e))

  input = createInput();
  input.position(windowWidth / 2, 30);
  
  sbutton = createButton('submit');
  sbutton.position(input.x + input.width, input.y);
  sbutton.mousePressed(initOrbiters);
  
  sbutton = createButton('clear canvas');
  sbutton.position(input.x + input.width + 100, input.y);
  sbutton.mousePressed(clearCanvas = () => {orbiters = []; input.value('')});
  
  msg = createElement('h5', "How many orbiters to initalise?");
  msg.position(input.x, input.y - 46);

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
    orbiter.moveCollision();
  });
  
}


window.mousePressed = e => Controls.move(controls).mousePressed(e);
window.mouseDragged = e => Controls.move(controls).mouseDragged(e);
window.mouseReleased = e => Controls.move(controls).mouseReleased(e);
// window.keyPressed = e => Controls.move(controls).keyPressed(e);

