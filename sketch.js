class Boid {
  constructor() {
    this.position = createVector(random(width), random(height));
    this.velocity = p5.Vector.random2D();
    this.velocity.setMag(random(1, 3)); //mengatur kecepatan acak antara 2-4
    
    this.acceleration = createVector(); //percepatan awal nol
    this.maxForce = 0.2; // keterbatasan stir, belok menikuk tiap kendaraan berbeda
    this.maxSpeed = 5; //keterbatas kecepatan kendaraan
  }

  // ======= edges hanya untuk mengatasi keterbatasan canvas p5
  edges() {
    if (this.position.x > width) {
      this.position.x = 0;
    } else if (this.position.x < 0) {
      this.position.x = width;
    }
    if (this.position.y > height) {
      this.position.y = 0;
    } else if (this.position.y < 0) {
      this.position.y = height;
    }
  }
  // ======= edges hanya untuk mengatasi keterbatasan canvas p5
  
  align(boids) { //argument boids (array)
    let perceptionRadius = 15;
    let steering = createVector();// gaya kemudi, dibuat nol
    let total = 0; //untuk menghitung banyak kendaraan di sekiar radius 25
    
    //loop untuk menghitung jarak semua boid di sekitar radius 25
    for (let other of boids) {
      let d = dist(this.position.x, this.position.y, other.position.x, other.position.y);
      if (other != this && d < perceptionRadius) {
        steering.add(other.velocity); // menjumlah semua velocity
        total++;
      }
    }
    if (total > 0) {
      steering.div(total); // membagi total velocity dgn total (kec. rerata)
      steering.setMag(this.maxSpeed); // mengatur kec. max
      //ciri khas aligment
      steering.sub(this.velocity); //gaya kemudi = kec rata2 - kec. kendaraan
      steering.limit(this.maxForce); //mengatur kemudi/menikung maks
    }
    return steering;
  }
  
  //mirip dengan align
  separation(boids) {
    let perceptionRadius = 20;
    let steering = createVector();
    let total = 0;
    for (let other of boids) {
      let d = dist(this.position.x, this.position.y, other.position.x, other.position.y);
      if (other != this && d < perceptionRadius) {
        //ciri khas separation
        let diff = p5.Vector.sub(this.position, other.position); //vektor menjauh
        diff.div(d * d); // 1/r^2 (semakin dekat, semakin menjauh)
        steering.add(diff); // 
        total++;
      }
    }
    //mirip align
    if (total > 0) {
      steering.div(total);
      steering.setMag(this.maxSpeed);
      steering.sub(this.velocity);
      steering.limit(this.maxForce);
    }
    return steering;
  }

  cohesion(boids) {
    let perceptionRadius = 50;
    let steering = createVector();
    let total = 0;
    for (let other of boids) {
      let d = dist(this.position.x, this.position.y, other.position.x, other.position.y);
      if (other != this && d < perceptionRadius) {
        steering.add(other.position);
        total++;
      }
    }
    // cohesion dan aligment beda di sini
    // cohesion lebih pada posisi
    if (total > 0) {
      steering.div(total);
      steering.sub(this.position); //ciri khas cohesion
      steering.setMag(this.maxSpeed);
      steering.sub(this.velocity);
      steering.limit(this.maxForce);
    }
    return steering;
  }

  flock(boids) {
    let alignment = this.align(boids);
    let cohesion = this.cohesion(boids);
    let separation = this.separation(boids);

    alignment.mult(alignSlider.value());
    cohesion.mult(cohesionSlider.value());
    separation.mult(separationSlider.value());
    
    //akumulasi semua gaya akibat aligment, cohesion, dan separation
    this.acceleration.add(alignment);
    this.acceleration.add(cohesion);
    this.acceleration.add(separation);
  }

  update() {
    this.position.add(this.velocity);
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.acceleration.mult(0); //accelerasionya direset setiap update
  }

   show() {
    strokeWeight(6);
    stroke(255);
    image(eagles, this.position.x, this.position.y, 75, 75);
    image(snakes, 75, 300, 100,100);
    image(mice, 30, 325, 75, 75);
  }

}


const flock = []; //array yg akan diisikan banyak kendaraan
let alignSlider, cohesionSlider, separationSlider;
let population;

let mice = [];
let snakes = [];
let eagles = [];
let paddy = [];
let canvasWidth = 800;
let canvasHeight = 400;

let mouseImg, snakeImg, eagleImg, paddyImg;

function preload() {
  mouseImg = loadImage('tikus.png');
  snakeImg = loadImage('ularr.png');
  eagleImg = loadImage('elang.png');
  
  backgroundImg = loadImage('Sawah.jpg');
}

function setup() {
  createCanvas(canvasWidth, canvasHeight);
  // inisialisasi populasi tikus, ular, elang, dan padi
  for (let i = 0; i < 10; i++) {
    mice.push(new Organism(500, 300, 100, mouseImg, true));
  }
  for (let i = 0; i < 5; i++) {
    snakes.push(new Organism(75, 300, 130, snakeImg, true));
  }
  eagles.push(new Organism(0,0, 150, eagleImg, true));
  
  alignSlider = createSlider(0,5,1,0.1);
  cohesionSlider = createSlider(0,5,1,0.1);
  separationSlider = createSlider(0,5,1,0.1);
  
  //menambahkan jumlah populasi 
  p = createInput(3)
  p.position(2, 25)
  p.changed(population)
  
  population ();
  
function population(){
  pop = (p.value())
  for (let i=0; i<pop;i++){
    flock.push(new Boid());
  }
 }

}

function draw() {
  background(backgroundImg);
  // membuat tikus, ular, elang, dan padi

  fill("black")
  stroke(1)
  text("Masukkan Jumlah Populasi Yang Ingin Ditambahkan", 2, 15)
  text("AlignSlider", 2, 395)
  text("CohesionSlider", 140, 395)
  text("SeparationSlider", 270, 395)
  
  
  for (let i = 0; i < mice.length; i++) {
    mice[i].draw();
  }
  for (let i = 0; i < snakes.length; i++) {
    snakes[i].draw();
    snakes[i].move(mice);
    // jika ular bertabrakan dengan tikus, tikus dihapus
    for (let j = 0; j < mice.length; j++) {
      if (snakes[i].intersects(mice[j])) {
        mice.splice(j, 1);
        snakes[i].eat();
      }
    }
  }
  for (let i = 0; i < eagles.length; i++) {
    eagles[i].draw();
    eagles[i].move(snakes);
    // jika elang bertabrakan dengan ular, ular dihapus
    for (let j = 0; j < snakes.length; j++) {
      if (eagles[i].intersects(snakes[j])) {
        snakes.splice(j, 1);
        eagles[i].eat();
      }
    }
  }
  for (let i = 0; i < paddy.length; i++) {
    paddy[i].draw();
    // jika elang bertabrakan dengan padi, game selesai
    for (let j = 0; j < eagles.length; j++) {
      if (eagles[j].intersects(paddy[i])) {
        textSize(32);
        text("Game Over!", canvasWidth / 2 - 60, canvasHeight / 2);
        noLoop();
      }
    }
  }
}

class Organism {
  constructor(x, y, size, img, isPredator = false) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.img = img;
    this.isPredator = isPredator;
    this.speed = 2;
    this.hunger = 0;
  }

  draw() {
    image(this.img, this.x, this.y, this.size, this.size);
  }


move(preys) {
let closestPrey;
let closestDistance = Infinity;
// mencari mangsa terdekat
for (let i = 0; i < preys.length; i++) {
let distance = dist(this.x, this.y, preys[i].x, preys[i].y);
if (distance < closestDistance) {
closestDistance = distance;
closestPrey = preys[i];
}
}
// bergerak menuju mangsa terdekat
if (closestPrey) {
let dx = closestPrey.x - this.x;
let dy = closestPrey.y - this.y;
let angle = atan2(dy, dx);
this.x += this.speed * cos(angle);
this.y += this.speed * sin(angle);
}
// predator lapar
if (this.isPredator) {
this.hunger++;
if (this.hunger > 200) {
noLoop();
}
}
}

intersects(other) {
let distance = dist(this.x, this.y, other.x, other.y);
return distance < (this.size + other.size) / 2;
}

eat() {
this.hunger -= 50;
if (this.hunger < 0) {
this.hunger = 0;
}
}
}