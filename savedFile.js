//consts
let input, button, numOrbiters, msg;
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
  
  button = createButton('submit');
  button.position(input.x + input.width, input.y);
  button.mousePressed(initOrbiters);
  
  msg = createElement('h5', "How many orbiters to initalise?");
  msg.position(input.x, input.y - 46);

  noStroke();
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

class Controls {
  static move(controls) {
    function mousePressed(e) {
      controls.viewPos.isDragging = true;
      controls.viewPos.prevX = e.clientX;
      controls.viewPos.prevY = e.clientY;
    }

    function mouseDragged(e) {
      const {
        prevX,
        prevY,
        isDragging
      } = controls.viewPos;
      if (!isDragging) return;

      const pos = {
        x: e.clientX,
        y: e.clientY
      };
      const dx = pos.x - prevX;
      const dy = pos.y - prevY;

      if (prevX || prevY) {
        controls.view.x += dx;
        controls.view.y += dy;
        controls.viewPos.prevX = pos.x;
        controls.viewPos.prevY = pos.y;
      }
    }

    function mouseReleased(e) {
      //needs to be improved
      //need to scale mouse pos based on zoom and arrow movement
      let x = mouseX;
      let y = mouseY;
      orbiters.push(new Orbiter(
        x,
        y,
        IDCOUNT,
        random(10, 50)
      ));
      ++IDCOUNT;
      ++numOrbiters;

      controls.viewPos.isDragging = false;
      controls.viewPos.prevX = null;
      controls.viewPos.prevY = null;
    }

    // function keyPressed(e) {
    //   if (keyIsDown(UP_ARROW)) {
    //     controls.view.y += 20;
    //   } else if (keyIsDown(DOWN_ARROW)) {
    //     controls.view.y -= 20;
    //   } else if (keyIsDown(LEFT_ARROW)) {
    //     controls.view.x += 20;
    //   } else if (keyIsDown(RIGHT_ARROW)) {
    //     controls.view.x -= 20;
    //   }
    // }

    return {
      mousePressed,
      mouseDragged,
      mouseReleased
      // keyPressed
    }
  }

  static zoom(controls) {
    function worldZoom(e) {
      const {
        x,
        y,
        deltaY
      } = e;
      const direction = deltaY > 0 ? -1 : 1;
      const factor = 0.05;
      const zoom = 1 * direction * factor;



      const wx = (x - controls.view.x) / (width * controls.view.zoom);
      const wy = (y - controls.view.y) / (height * controls.view.zoom);

      controls.view.x -= wx * width * zoom;
      controls.view.y -= wy * height * zoom;
      controls.view.zoom += zoom;
    }

    return {
      worldZoom
    }
  }
}



class Orbiter {
  constructor(xin, yin, idin, radin) {
    this.x = xin;
    this.y = yin;
    this.centreX = xin;
    this.centreY = yin - 15;
    this.cvx = 0;
    this.cvy = 0;
    this.id = idin;
    this.radius = radin;
    this.angle = 0;
    //need the right speed such that larger orbiters are a lot faster than smaller, but such that smaller orbiters cannot skip through large orbiters
    this.speed = (PI * radin) / 10000;
    this.vx = cos(this.speed) * this.radius;
    this.vy = sin(this.speed) * this.radius;
    this.history = [];

    this.mass = radin * radin * radin * radin;

    this.col = randomCol();
  }

  //move orbiter along the circumfrance
  //want the centre to move according to the collide
  move() {
    this.x = this.centreX + cos(this.angle) * this.radius;
    this.y = this.centreY + sin(this.angle) * this.radius;

    this.angle += this.speed;

    let v = createVector(this.x, this.y);
    this.history.push(v);

    if (this.history.length > 20) {
      this.history.splice(0, 1);
    }
  }

  moveCollision() {
    this.centreX += this.cvx;
    this.centreY += this.cvy;
  }


  //possibly be a recurrent function?
  //this needs to be damped (last x frames after collision)
  //this needs fixing!!!
  collide() {
    for (let i = this.id + 1; i < orbiters.length; ++i) {
      let dx = this.x - orbiters[i].x;
      let dy = this.y - orbiters[i].y;
      let distance = sqrt(dx * dx + dy * dy);

      if (distance < MINDIST) {
        let dvx = (this.vx + this.cvx) - (orbiters[i].vx + orbiters[i].cvx);
        let dvy = (this.vy + this.cvy) - (orbiters[i].vy + orbiters[i].cvy);
        let combMass = this.mass + orbiters[i].mass;
        let dot = dvx * dx + dvy * dy;
        let colScaled = dot / (distance * distance)
        let oMass = ((2 * this.mass) / combMass);
        let tMass = ((2 * orbiters[i].mass) / combMass)

        //bit funky as dvx/dvy is sum of veloctiies but collision only effects cvx/cvy, is this right??
        this.cvx = this.cvx - tMass * colScaled * dx;
        this.cvy = this.cvy - tMass * colScaled * dy;
        orbiters[i].cvx = orbiters[i].cvx - oMass * colScaled * -dx;
        orbiters[i].cvy = orbiters[i].cvy - oMass * colScaled * -dy;
      }
    }
  }

  //display orbiter to the http, display the tail of the orbiter and the orbiter itself
  display() {
    for (let i = 0; i < this.history.length; i += 3) {
      let pos = this.history[i];
      let j = (i == 0 ? 1 : i);

      //want colour to be based on raius
      let trailColour = color(this.col[0], this.col[1], this.col[2]);
      trailColour.setAlpha(j * 10);
      fill(trailColour);
      ellipse(pos.x, pos.y, 10, 10)
    }

    //want colour to be based on raius
    //fill(255, 0, 0);
    fill(this.col[0], this.col[1], this.col[2]);
    ellipse(this.x, this.y, 10, 10);
  }
}
