

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
    this.speed = (PI * radin)/ 100000;
    this.vx = cos(this.speed) * this.radius;
    this.vy = sin(this.speed) * this.radius;
    this.history = [];

    this.mass = radin*radin*radin;
  }

  //move orbiter along the circumfrance
  //want the centre to move according to the collide
  move() {
    this.x = this.centreX + cos(this.angle) * this.radius;
    this.y = this.centreY + sin(this.angle) * this.radius;
    
    this.angle += this.speed;

    let v = createVector(this.x, this.y);
    this.history.push(v);

    if (this.history.length > this.radius) {
      this.history.splice(0, 1);
    }
  }
  
  moveCollision() {
    this.centreX += this.cvx;
    this.centreY += this.cvy;
  }


  //possibly be a recurrent function?
  //this needs to be damped (last x frames after collision)
  collide() {
    for (let i = this.id + 1; i < orbiters.length; ++i) {
      let dx = orbiters[i].x - this.x;
      let dy = orbiters[i].y - this.y;
      let distanceSqd = dx * dx + dy * dy;
      if (distanceSqd < MINDIST) {
        let xVel = orbiters[i].vx - this.vx;
        let yVel = orbiters[i].vy - this.vy;
        let dotProd = dx * xVel + dy * yVel;
        if(dotProd > 0) {
          let colScale = dotProd / distanceSqd;
          let xCol = dx * colScale;
          let yCol = dy * colScale;
          
          let combinedMass = this.mass + orbiters[i].mass;
          let colWeightA = 2 * orbiters[i].mass / combinedMass;
          let colWeightB = 2 * this.mass / combinedMass;
          this.cvx += colWeightA * dx / 100;
          this.cvy += colWeightA * dy / 100;
          orbiters[i].cvx -= colWeightB * dx / 100;
          orbiters[i].cvy -= colWeightB * dy / 100;
        }
      }
    }
  }

  //display orbiter to the http, display the tail of the orbiter and the orbiter itself
  display() {
    for (let i = 0; i < this.history.length; i += 3) {
      let pos = this.history[i];
      let j = (i == 0 ? 1 : i);

      //want colour to be based on raius
      let trailColour = color(255, 0, 0);
      trailColour.setAlpha(j * 10);
      fill(trailColour);
      ellipse(pos.x, pos.y, 10, 10)
    }

    //want colour to be based on raius
    fill(255, 0, 0);
    ellipse(this.x, this.y, 10, 10);
  }
}

