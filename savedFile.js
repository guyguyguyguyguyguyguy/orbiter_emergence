//test comment
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
      if (y > 0) {
        orbiters.push(new Orbiter(
          x,
          y,
          IDCOUNT,
          log(1 - random()) / (-gamma)
        ));
        ++IDCOUNT;
        ++numOrbiters;
        document.getElementById("noOrbi").innerHTML = ("Number of orbiters: " + numOrbiters);
      }

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


//need to give larger orbiters ability to faster without causing them to 'jump' over positions in the space
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
    this.speed = (PI * radin) / 20000;
    this.vx = cos(this.speed) * this.radius;
    this.vy = sin(this.speed) * this.radius;
    this.history = [];

    this.mass = radin / 10;


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
  elasticCollide() {
  	//this scaling needs to be played around with
    const scaling = this.radius/10;
    for (let i = this.id + 1; i < orbiters.length; ++i) {
      let dx = this.x - orbiters[i].x;
      let dy = this.y - orbiters[i].y;
      let distance = sqrt(dx * dx + dy * dy);

      if (distance < MINDIST) {
      	//noFill();
      	circle(this.x, this.y, 20);
        let dvx = (this.vx + this.cvx) - (orbiters[i].vx + orbiters[i].cvx);
        let dvy = (this.vy + this.cvy) - (orbiters[i].vy + orbiters[i].cvy);
        let combMass = this.mass + orbiters[i].mass;
        let dot = dvx * dx + dvy * dy;
        let colScaled = dot / (distance * distance)
        let oMass = ((2 * this.mass) / combMass);
        let tMass = ((2 * orbiters[i].mass) / combMass)

        //bit funky as dvx/dvy is sum of veloctiies but collision only effects cvx/cvy, is this right??
        //maybe something like (seems to work, need to do maths to see whether it is correct)
        if (dot < 0) {
          this.cvx = (this.cvx - tMass * colScaled * dx) / (this.radius * scaling);
          this.cvy = (this.cvy - tMass * colScaled * dy) / (this.radius * scaling);
          orbiters[i].cvx = (orbiters[i].cvx - oMass * colScaled * -dx) / (orbiters[i].radius * scaling);
          orbiters[i].cvy = (orbiters[i].cvy - oMass * colScaled * -dy) / (orbiters[i].radius * scaling);
        } else {
          this.cvx = (this.cvx - tMass * colScaled * -dx) / (this.radius * scaling);
          this.cvy = (this.cvy - tMass * colScaled * -dy) / (this.radius * scaling);
          orbiters[i].cvx = (orbiters[i].cvx - oMass * colScaled * dx) / (orbiters[i].radius * scaling);
          orbiters[i].cvy = (orbiters[i].cvy - oMass * colScaled * dy) / (orbiters[i].radius * scaling);
        }
      }
    }
  }
  
  
  //This works but not really, because of using vx and cvx causes issues when collision occurs
  //Elastic colide works better, not really sure why it works but it does 
  testColide() {
  	const scaling = 3;
    for (let i = this.id + 1; i < orbiters.length; ++i) {
    	let normX = orbiters[i].x - this.x;
      let normY = orbiters[i].y - this.y;
      let distance = sqrt(normX * normX + normY * normY);

      if (distance < MINDIST) {      
        let unitNormX = normX/ (sqrt(normX* normX + normY * normY));
        let unitNormY = normY/ (sqrt(normX* normX + normY * normY));
        let unitTanX = - unitNormX;
        let unitTanY = unitNormX; 
        let v1NormX = unitNormX * (this.vx + this.cvx);
        let v1TanX = unitTanX * (this.vx + this.cvx);
        let v1NormY = unitNormX * (this.vy + this.cvy);
        let v1TanY = unitTanX * (this.vy + this.cvy);
        let v2NormX = unitNormX * (orbiters[i].vx + orbiters[i].cvx);
        let v2TanX = unitTanX * (orbiters[i].vx + orbiters[i].cvx);
        let v2NormY = unitNormX * (orbiters[i].vy + orbiters[i].cvy);
        let v2TanY = unitTanX * (orbiters[i].vy + orbiters[i].cvy);
       	
        let v1NormXP = (v1NormX * (this.mass - orbiters[i].mass) + 2 * (orbiters[i].mass * v2NormX)) / (this.mass + orbiters[i].mass)
        let v1NormYP = (v1NormY * (this.mass - orbiters[i].mass) + 2 * (orbiters[i].mass * v2NormY)) / (this.mass + orbiters[i].mass)
        
        let v2NormXP = (v2NormX * (orbiters[i].mass - this.mass) + 2 * (this.mass * v1NormX)) / (this.mass + orbiters[i].mass)
        let v2NormYP = (v2NormY * (orbiters[i].mass - this.mass) + 2 * (this.mass * v1NormY)) / (this.mass + orbiters[i].mass)
        
        v1NormXP = v1NormXP * unitNormX;
        v1NormYP = v1NormYP * unitNormY;
        
        v1TanX = v1TanX * unitNormX;
				v1TanY = v1TanY * unitNormY;
        
        v2NormXP = v2NormXP * unitNormX;
        v2NormYP = v2NormYP * unitNormY;
        
        v2TanX = v2TanX * unitNormX;
        v2TanY = v2TanY * unitNormY;
        
        this.cvx = v1NormXP + v1TanX;
        this.xvy = v1NormYP + v1TanY;
        
        orbiters[i].cvx = v2NormXP + v2TanX;
        orbiters[i].cvy = v2NormYP + v2TanY;
			}
    }
  }

  //display orbiter to the http, display the tail of the orbiter and the orbiter itself
  display() {
    for (let i = 0; i < this.history.length; i += 1) {
      let pos = this.history[i];
      let j = (i == 0 ? 1 : i);

      //want colour to be based on raius
      let trailColour = color(this.col[0], this.col[1], this.col[2]);
      trailColour.setAlpha(j * 10);
      fill(trailColour);
      circle(pos.x, pos.y, 10)
    }

    //want colour to be based on raius
    //fill(255, 0, 0);
    fill(this.col[0], this.col[1], this.col[2]);
    circle(this.x, this.y, 10);
  }
}

