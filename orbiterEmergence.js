//consts
let numOrbiters = 10;
let orbiters = [];
let MINDIST = 10;
let spring = 5;

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

  for (let i = 0; i < numOrbiters; i++) {
    orbiters[i] = new Orbiter(
      random(width),
      random(height),
      i,
      random(10, 100)
    );
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
    orbiter.collide();
    orbiter.move();
    orbiter.display();
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
        controls.viewPos.prevX = pos.x, controls.viewPos.prevY = pos.y
      }
    }

    function mouseReleased(e) {
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
    this.vx = 0;
    this.vy = 0;
    this.id = idin;
    this.radius = radin;
    this.angle = 0;
    this.speed = PI / 40;
    this.history = [];
  }

  //move orbiter along the circumfrance
  //want the centre to move according to the collide
  move() {
    this.centreX += this.vx;
    this.centreY += this.vy;

    this.x = this.centreX + cos(this.angle) * this.radius;
    this.y = this.centreY + sin(this.angle) * this.radius;

    this.angle += this.speed;
    
    let v = createVector(this.x, this.y);
    this.history.push(v);
    
    if (this.history.length > 50) {
      this.history.splice(0, 1);   
    }
  }


  //possibly be a recurrent function?
  collide() {
    for (let i = this.id + 1; i < numOrbiters; ++i) {
      let dx = orbiters[i].x - this.x;
      let dy = orbiters[i].y - this.y;
      let distance = sqrt(dx * dx + dy * dy);
      if (distance < MINDIST) {
        let angle = atan(dy, dx);
        let targetX = this.x + cos(angle) * MINDIST;
        let targetY = this.y + sin(angle) * MINDIST;
        let ax = (targetX - orbiters[i].x) * spring;
        let ay = (targetY - orbiters[i].y) * spring;
        this.vx -= ax;
        this.vy -= ay;
        orbiters[i].vx = ax;
        orbiters[i].vy = ay;
      }
    }
  }

  //display orbiter to the http, display the tail of the orbiter and the orbiter itself
  display() {
    for (let i = 0; i < this.history.length; i++) {
      let pos = this.history[i];      
      let j = (i == 0 ? 1 : i);
      let trailColour = color(255, 0, 0);
      trailColour.setAlpha(j*10);
      fill(trailColour);
      ellipse(pos.x, pos.y, 10, 10)
    }    
    
    fill(255, 0, 0);
    ellipse(this.x, this.y, 10, 10);
  }
}
