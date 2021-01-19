
function randomCol() {
  let a  = random(0, 255);
  let b = random(0, 255);
  let c = random(0, 255);

  return [a, b, c];
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
    this.speed = (PI * radin)/ 10000;
    this.vx = cos(this.speed) * this.radius;
    this.vy = sin(this.speed) * this.radius;
    this.history = [];

    this.mass = radin*radin*radin * radin;

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


  //This has a bug, sometime works, sometimes the orbiters fly in the opposite directions, why? I DONT KNOW
  elasticCollide() {
    for (let i = this.id + 1; i < orbiters.length; ++i) {
      let dx = this.x - orbiters[i].x;
      let dy = this.y - orbiters[i].y;
      let distance = sqrt(dx * dx + dy *dy);
      
      if (distance < MINDIST) {
        let dvx = (this.vx + this.cvx) - (orbiters[i].vx + orbiters[i].cvx);
        let dvy = (this.vy + this.cvy) - (orbiters[i].vy + orbiters[i].cvy);
        let combMass = this.mass + orbiters[i].mass;
        let dot = dvx * dx + dvy * dy;
        let colScaled = dot / (distance *distance)
        let oMass = ((2*this.mass)/combMass);
        let tMass = ((2*orbiters[i].mass)/combMass)
        
        //bit funky as dvx/dvy is sum of veloctiies but collision only effects cvx/cvy, is this right??
        this.cvx = this.cvx - tMass * colScaled * -dx;
        this.cvy  = this.cvy - tMass * colScaled * -dy;
        orbiters[i].cvx = orbiters[i].cvx - oMass * colScaled * dx;
        orbiters[i].cvy = orbiters[i].cvy - oMass * colScaled * dy;
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

