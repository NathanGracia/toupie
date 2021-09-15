//init consts
const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
canvas.width = innerWidth;
canvas.height = innerHeight;
const gravitationalStrenght = 1.00000;

const friction_object = 0.95;
const friction_edge = 0.50;
const friction_rotation = 0.9998;
const mouse = {
    x: innerWidth / 2,
    y: innerHeight / 2
};
const color_planets = ['#A57BEB', '#67D972', '#FF5A56', '#F5B841', '#75E0D2'];
const color_enemies = ['#ba1100', '#c01017', '#be2a30', '#F11B00'];

let score = 0;
let bestScore = 0;
let circles = [];
let particles = [];


// Objects


class Toupie {
    constructor(id, x, y, radius, center) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = randomColor(color_planets);
        this.velocity = {
            x: randomIntFromRange(1, 60),
            y: randomIntFromRange(1, 60)
        };
        this.center = center;
        this.mass = radius;
        this.killed = false
        this.angle = 0;
        this.rotation = 20; // multiplicateur - donne la vitesse de la rotation.
        this.speed_malus = 1 // est utilisé pour arreter la toupie

        this.alive = true
    }

    // affiche le cercle à l'écran
    draw() {
        console.log(this.rotation);
        //on place le point d'origine du canvas là ou la toupis va spawn
        c.save();
        c.translate(this.x, this.y);
        //on tourne avec l'angle
        c.rotate(this.angle * this.rotation * Math.PI / 180);
        this.angle += 1;
        this.rotation *= friction_rotation * this.speed_malus;
        //si la rotation est inferieur à 1, alors la toupie est full dead


        c.strokeStyle = '#000000';
        //tracage du cercle
        c.beginPath();
        c.arc(0, 0, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.globalAlpha = 1;
        c.fill();
        c.stroke();
        c.closePath()


        //tracage des pics
        c.beginPath();
        c.lineWidth = 3;
        c.line
        c.moveTo(-this.radius * 13 / 16, -this.radius * 13 / 16);
        c.lineTo(+this.radius * 13 / 16, +this.radius * 13 / 16);
        c.moveTo(+this.radius * 13 / 16, -this.radius * 13 / 16);
        c.lineTo(-this.radius * 13 / 16, +this.radius * 13 / 16);
        c.strokeStyle = '#ffffffff';
        c.stroke();
        //on replace le point d'origine du canvas a truc normal
        c.restore();

    }

//https://jsfiddle.net/awsumpwner27/k7CVw/


    //est executé à chaque frame
    update() {

        //coeficient de ralentissement du à la rotation :
        let rotation_slow = (1 - 1 / (1 + this.rotation * 1000));
        //Suis le centre qui lui est donné
        if (this.x !== this.center.x && this.y !== this.center.y && this.alive) {

            let xDiff = this.center.x - this.x;
            let yDiff = this.center.y - this.y;
            //prendre que les valeurs : passe en positif si negatif, ou bien reste en positif
            let additionDistance = Math.sign(xDiff) * xDiff + Math.sign(yDiff) * yDiff;

            let xWanted = xDiff / additionDistance;
            let yWanted = yDiff / additionDistance;

            let xDeplacement = xWanted;
            let yDeplacement = yWanted;

            //rebondis sur les cotés
            if (this.x - this.radius < 0 || this.x + this.radius > innerWidth) {
                this.velocity.x *=-1
                this.rotation *= friction_edge;

            }
            if (this.y - this.radius < 0 || this.y + this.radius > innerHeight) {
                this.velocity.y *=-1
                this.rotation *= friction_edge;
            }

            this.velocity.x += xDeplacement / gravitationalStrenght * rotation_slow * this.speed_malus;
            this.velocity.y += yDeplacement / gravitationalStrenght * rotation_slow * this.speed_malus;


        } else {
            //rebondis sur les cotés
            if (this.x - this.radius < 0 || this.x + this.radius > innerWidth) {
                this.velocity.x *= -1;

            }
            if (this.y - this.radius < 0 || this.y + this.radius > innerHeight) {
                this.velocity.y *= -1;
            }
            this.velocity.x = this.velocity.x * rotation_slow * this.speed_malus;
            this.velocity.y = this.velocity.y * rotation_slow * this.speed_malus;

        }


        if (this.rotation < 5) {
            //on la tue
            this.alive = false
            //on reduit sa vitesse de ouf
            this.speed_malus = 0.98

        }


        this.x += this.velocity.x;
        this.y += this.velocity.y;


        this.draw()
    }
}


//particle
class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.killed = false;
        this.alpha = 0.8;

    }

    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color;

        c.globalAlpha = this.alpha;
        c.fill()
        c.closePath()
    }

    update() {


        //si y'a un choc avec l'ennemi, on met des degats


        //sinon, ca se deplace normalement

        this.x += this.velocity.x;
        this.velocity.x = this.velocity.x / gravitationalStrenght;
        this.velocity.y = this.velocity.y / gravitationalStrenght;
        this.y += this.velocity.y;


        //disparait petit à petit
        this.radius -= 0.1
        if (this.radius < 0) {

            delete this.x;
            this.killed = true;
        }

        this.draw()
    }


}

// Implementation


class Center {
    constructor(X, Y) {
        this.x = X;
        this.y = Y;
        this.radius = 1200;

        var gradient = c.createRadialGradient(X, Y, 0, X, Y, 800);
        gradient.addColorStop(0, '#5b0f0f');
        gradient.addColorStop(1, '#8f1717');
        this.color = gradient

    }

    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;

        c.globalAlpha = 1;


        c.fill();
        c.closePath()
    }

    update() {
        this.draw();
    }

}

//tools
// random int from min and max
function randomIntFromRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

//random color in this array
function randomColor(colors) {
    return colors[Math.floor(Math.random() * colors.length)]
}

//give distance between 2 points
function distance(x1, y1, x2, y2) {
    const xDist = x2 - x1;
    const yDist = y2 - y1;

    return Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2))
}

// Newton's equation to resolve a collision
function resolveCollision(particle, otherParticle) {
    const xVelocityDiff = particle.velocity.x - otherParticle.velocity.x;
    const yVelocityDiff = particle.velocity.y - otherParticle.velocity.y;

    const xDist = otherParticle.x - particle.x;
    const yDist = otherParticle.y - particle.y;

    // Prevent accidental overlap of particles
    if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {

        // Grab angle between the two colliding particles
        const angle = -Math.atan2(otherParticle.y - particle.y, otherParticle.x - particle.x);

        // Store mass in var for better readability in collision equation
        const m1 = particle.mass;
        const m2 = otherParticle.mass;

        // Velocity before equation
        const u1 = rotate(particle.velocity, angle);
        const u2 = rotate(otherParticle.velocity, angle);

        // Velocity after 1d collision equation
        const v1 = {x: u1.x * (m1 - m2) / (m1 + m2) + u2.x * 2 * m2 / (m1 + m2), y: u1.y};
        const v2 = {x: u2.x * (m1 - m2) / (m1 + m2) + u1.x * 2 * m2 / (m1 + m2), y: u2.y};

        // Final velocity after rotating axis back to original location
        const vFinal1 = rotate(v1, -angle);
        const vFinal2 = rotate(v2, -angle);

        // Swap particle velocities for realistic bounce effect
        particle.velocity.x = vFinal1.x * friction_object;
        particle.velocity.y = vFinal1.y * friction_object;

        otherParticle.velocity.x = vFinal2.x * friction_object;
        otherParticle.velocity.y = vFinal2.y * friction_object;
    }
}

// used in resolveCollision
function rotate(velocity, angle) {
    const rotatedVelocities = {
        x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
        y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle)
    };

    return rotatedVelocities;
}


// Event Listeners
addEventListener('mousemove', (event) => {
    mouse.x = event.clientX
    mouse.y = event.clientY
});
addEventListener('resize', () => {
    canvas.width = innerWidth
    canvas.height = innerHeight

    init()
});
addEventListener('click', () => {
    init()
});


//regarde dans toutes les toupies si deux sont en collision
function CheckAllToupiesCollisions(toupies) {
    toupies.forEach(toupie1 =>
        toupies.forEach(toupie2 => {
            if (toupie1.id !== toupie2.id) {
                CheckTwoToupiesCollision(toupie1, toupie2);

            }
        })
    )
}

function CheckTwoToupiesCollision(toupie1, toupie2) {
    if (distance(toupie1.x, toupie1.y, toupie2.x, toupie2.y) < toupie2.radius + toupie1.radius) {
        resolveCollision(toupie1, toupie2);
        //on reduit la rotation des deux toupies
        toupie1.rotation *= friction_object;
        toupie2.rotation *= friction_object;

        let damagesX = toupie1.velocity.x - toupie2.velocity.x;
        let damagesY = toupie1.velocity.y - toupie2.velocity.y;
        let damages = Math.pow(Math.abs(damagesX) + Math.abs(damagesY), 3) / 1000;

        //creation des particules en fonction des degats
        for (let i = 0; i < damages / 3; i++) {
            let radius = randomIntFromRange(2, 8);
            let ranVelocityX = toupie1.velocity.x + randomIntFromRange(-5, 5);
            let ranVelocityY = toupie1.velocity.y + randomIntFromRange(-5, 2);
            let velocity = {
                x: ranVelocityX,
                y: ranVelocityY
            };
            particles.push(new Particle(toupie1.x, toupie1.y, radius, toupie1.color, velocity))
            let radius2 = randomIntFromRange(1, 4);
            let ranVelocityX2 = toupie1.velocity.x + randomIntFromRange(-5, 5);
            let ranVelocityY2 = toupie1.velocity.y + randomIntFromRange(-5, 2);
            let velocity2 = {
                x: ranVelocityX2,
                y: ranVelocityY2
            };
            particles.push(new Particle(toupie1.x, toupie1.y, radius2, toupie1.color, velocity2))
        }


    }
}


let toupies = [];

function init() {

    toupies = [];


    center = new Center(innerWidth / 2, innerHeight / 2,);
    for (let i = 0; i < 2; i++) {
        let toupieX = randomIntFromRange(innerWidth / 6, innerWidth * 5 / 6);
        let toupieY = randomIntFromRange(innerHeight / 6, innerHeight * 5 / 6);

        toupies.push(new Toupie(i, toupieX, toupieY, 80, center));
    }


}

// Animation Loop
function animate() {
    CheckAllToupiesCollisions(toupies);
    //loop
    requestAnimationFrame(animate);
    //clear page
    c.clearRect(0, 0, canvas.width, canvas.height);
    center.update();


    //update toupies
    toupies.forEach(toupie => {

        toupie.update()
    });

    //update particles
    particles.forEach(particle => {

        particle.update()
    });


    //end animate
}


init()
animate()
