//######################################### Initialisation du canvas ##################################################
const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
canvas.width = innerWidth;
canvas.height = innerHeight;

// ######################################## Config generale ###########################################################
const debug = true;
const color_attack = ['#8e1740', '#910b0b', '#b34715', '#9d1010', '#75E0D2'];
const color_stamina = ['#7abd15', '#1ea010', '#10a731', '#0d7126', '#75E0D2'];
const color_defense = ['#1a396d', '#193969', '#28156a', '#2d0872', '#75E0D2'];
const categories = ["defense", "attack", "stamina"];

const mouse = {
    x: innerWidth / 2,
    y: innerHeight / 2
};

// ######################################## config physique ###########################################################
const gravitationalStrenght = 1.0005; // puissance de la gravité
const friction_object = 0.95;
const friction_edge = 0.80;
const friction_rotation = 0.9998;
const defense_instability = 0.975 //plus c'est élevé, plus une toupie defense sera instable

//######################################### Iitialisation de certains tableaux ###################################################
let particles = [];
let tailParticles = [];
let toupies = [];
let background;




//######################################### Entités ###################################################
class Toupie {
    constructor(id, x, y, radius,color, center, rotation, velocity, category, life) {
        this.id = id;
        this.x = x; // position x
        this.y = y; // position y
        this.radius = radius; // Rayon de la toupie
        this.color = color; // Couleur du fond de la toupie
        this.velocity = velocity;

        this.life = life; // si les points vie tombe à 0, la toupie burst
        this.center = center; // Centre du canvas, là où elles seront attirées
        this.mass = radius; // utilisé dans le calcul des collision Newton
        this.angle = 0; // Rotation de la toupie actuelle
        this.rotation = rotation; // Vitesse de la rotation.
        this.speed_malus = 1 // Est utilisé pour arreter la toupie lorsqu'elle tombe
        this.fulldead= false // True lorsque la toupie est à l'arret complet.
        this.bursted = false; // True lorsque la toupie n'a plus de point de vie
        this.alive = true; // False lorsqu'elle n'a plus de rotation. Alors il y a un speed malus et apres quelques frame elle passe en fulldead
        this.out = false // True lorsqu'elle est en dehors du stadium

        this.category = category;

    }

    // affiche la toupie à l'écran
    draw() {

        drawToupie(this);

        //Affiche du text au dessus de la souris (en debug)
        if(debug === true){
            showDebugToupie([
                "Rotation  : " + Math.round(this.rotation*100)/100,
                "Life  : " + Math.round(this.life*100)/100,
            ], this);
        }

    }

    //est executé à chaque frame
    update() {



        //check si la toupie est en dehors du terrain
        if(checkIfIsOutOfCircle(this, this.center)){
            this.out = true;
            this.speed_malus -= 0.010
            let rotation_slow = (1 - 1 / (1 + this.rotation * 1000));
            this.velocity.x = (this.velocity.x * this.speed_malus ) * rotation_slow * this.speed_malus  ;
            this.velocity.y = (this.velocity.y * this.speed_malus ) * rotation_slow * this.speed_malus  ;
        }

        if(!this.out){
            moove(this)
        }

       //si la toupie est encore vivante, elle se déplace normalement
        if (!this.alive ) {
                ultraSlowToupie(this)
        }
        bounceOnEdge(this)

        if (this.rotation < 10) {
            this.speed_malus -= 0.002;
            this.alive = false;
        }

        if(this.life <= 0){
            this.burst()
        }
        if(this.alive){
            generateTailParticles(this);

        }

        this.x += this.velocity.x;
        this.y += this.velocity.y;

        this.draw();

    }
    burst(){

        //creation des particules en fonction du radius de la toupie
        for (let i = 0; i < this.radius*6 ; i++) {

            let radius2 = randomFromRange(1, 4);
            let ranVelocityX2 = randomFromRange(-10, 10);
            let ranVelocityY2 = randomFromRange(-10, 10);
            let velocity2 = {
                x: ranVelocityX2,
                y: ranVelocityY2
            };
            particles.push(new Particle(this.x, this.y, radius2, this.color, velocity2, this.center))

            let radius = randomFromRange(2, 6);
            let ranVelocityX = randomFromRange(-5, 5);
            let ranVelocityY =  randomFromRange(-5, 5);
            let velocity = {
                x: ranVelocityX,
                y: ranVelocityY
            };
            particles.push(new Particle(this.x, this.y, radius, this.color, velocity, this.center))


            let radius3 = randomFromRange(4, 8);
            let ranVelocityX3 = randomFromRange(-3, 3);
            let ranVelocityY3 =  randomFromRange(-3, 3);
            let velocity3 = {
                x: ranVelocityX3,
                y: ranVelocityY3
            };
            particles.push(new Particle(this.x, this.y, radius3, this.color, velocity3, this.center))
        }
        this.bursted = true;
        this.rotation = 0;
        this.radius = 0;


    }
}

class Particle {
    constructor(x, y, radius, color, velocity, center) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.baseRadius = radius;
        this.center = center;
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
        this.velocity.x = this.velocity.x / gravitationalStrenght*0.99;
        this.velocity.y = this.velocity.y / gravitationalStrenght*0.99;
        this.y += this.velocity.y;


        //disparait petit à petit
        if (this.radius > this.baseRadius/3){
            this.radius -= 0.01
        }

        if(checkIfIsOutOfCircle(this, this.center)){
            this.radius -= 0.01
            if (this.radius < 1){
                delete this.x;
                this.killed = true;
            }

        }
   




        this.draw()
    }


}

class TailParticle {
    constructor(x, y,  color) {
    this.x = x;
    this.y = y;
    this.radius = 10;
    this.baseRadius = 10;
    this.color = color;
    this.killed = false;
    this.alpha = 0.2;

}

draw() {
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.fillStyle = this.color;

    c.globalAlpha = this.alpha;
    c.fill()
    c.closePath()

    c.beginPath()
    c.arc(this.x, this.y, this.radius+1, 0, Math.PI * 2, false)
    c.fillStyle = "#ffffff";

    c.globalAlpha = 0.1;
    c.fill()
    c.closePath()
}

update() {


        this.radius -= 0.5



    if (this.radius < 1){
        delete this.x;
        this.killed = true;
    }

    this.draw()
}


}

class Center {
    constructor(X, Y) {
        this.x = X;
        this.y = Y;
        this.radius = 800;
        this.mass = 99999999999999999
        this.velocity = {
            x: 0,
            y: 0
        }
        this.life = 999999999;

        var gradient = c.createRadialGradient(X, Y, 0, X, Y, 800);
        gradient.addColorStop(0, '#4d4d4d');
        gradient.addColorStop(1, '#707070');
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

class BackGround{
    constructor( center) {
        this.x = center.x;
        this.y = center.y;
        this.radius = 1200;
        var gradient = c.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
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

//######################################### Event listeners ###################################################
// Traque la position de la souris
addEventListener('mousemove', (event) => {
    mouse.x = event.clientX
    mouse.y = event.clientY
});

// Ajuste la taille du canvas si la fenêtre est redimensionné
addEventListener('resize', () => {
    canvas.width = innerWidth
    canvas.height = innerHeight

    init()
});

//######################################### Iitialisation du canvas ###################################################
// Traque les clics de l'utilisateur
addEventListener('click', () => {
    init()
});


//######################################### Outils ###################################################

// Génere un int random entre min et max
function randomIntFromRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

// Génere un nombre décimal random entre min et max
function randomFromRange(min, max) {
    return Math.random() * (max - min) + min;
}

//Sors une couleur random d'un tableau de couleur
function randomColor(colors) {
    return colors[Math.floor(Math.random() * colors.length)]
}

//Donne la distance entre deux points
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

function checkCollisionToupieCenter(toupie, center){

    if(  distance(toupie.x, toupie.y, center.x, center.y) < toupie.radius + center.radius){

        resolveCollision(toupie, center)
        //reset velocité du center parceque il a modifié lors du resolve colision alros qu'il faudrai pas
        center.velocity.x = 0;
        center.velocity.y = 0;
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

//regarde dans toutes les toupies si deux sont en collision
function CheckAllToupiesCollisions(toupies) {
    toupies.forEach(toupie1 =>{
        //si la toupie est out, on check qu'elle ne puisse pas revenir au centre
        if(toupie1.out){
            checkCollisionToupieCenter(toupie1, toupie1.center)
        }
        toupies.forEach(toupie2 => {
            if (toupie1.id !== toupie2.id) {
                CheckTwoToupiesCollision(toupie1, toupie2);
            }
        })
    })
}

//regarde si il y a collision entre deux toupies
function CheckTwoToupiesCollision(toupie1, toupie2) {
    if (distance(toupie1.x, toupie1.y, toupie2.x, toupie2.y) < toupie2.radius + toupie1.radius) {
        resolveCollision(toupie1, toupie2);
        //on reduit la rotation des deux toupies
        toupie1.rotation *= friction_object;
        toupie2.rotation *= friction_object;

        let damagesX = toupie1.velocity.x - toupie2.velocity.x;
        let damagesY = toupie1.velocity.y - toupie2.velocity.y;
        let damages = Math.pow(Math.abs(damagesX) + Math.abs(damagesY), 3) / 10000;

        // donne un bonus à la toupie qui va le plus vite
        let sumVelocity1 = Math.abs(toupie1.velocity.x) + Math.abs(toupie1.velocity.y)
        let sumVelocity2 = Math.abs(toupie2.velocity.x) + Math.abs(toupie2.velocity.y)
        let bonus1 = 1;
        let bonus2 = 1;
        if(sumVelocity1 > sumVelocity2){
            bonus1 = 1.2;
        }else {
            bonus2 = 1.2
        }

        toupie1.life -= damages * bonus1;
        toupie2.life -= damages * bonus2;

        //creation des particules en fonction des degats
        for (let i = 0; i < damages *10; i++) {
            let radius = randomFromRange(2, 8);
            let ranVelocityX = toupie1.velocity.x + randomFromRange(-5, 5);
            let ranVelocityY = toupie1.velocity.y + randomFromRange(-5, 2);
            let velocity = {
                x: ranVelocityX,
                y: ranVelocityY
            };
            particles.push(new Particle(toupie1.x, toupie1.y, radius, toupie1.color, velocity, toupie1.center))
            let radius2 = randomFromRange(1, 4);
            let ranVelocityX2 = toupie1.velocity.x + randomFromRange(-5, 5);
            let ranVelocityY2 = toupie1.velocity.y + randomFromRange(-5, 2);
            let velocity2 = {
                x: ranVelocityX2,
                y: ranVelocityY2
            };
            particles.push(new Particle(toupie1.x, toupie1.y, radius2, toupie1.color, velocity2, toupie2.center))
        }


    }
}

//dessine une toupie
function drawToupie(toupie) {
    //sauvegarde de l'état du canvas avant de le faire tourner
    c.save();
    // Place l e point d'origine du canvas au centre de la toupie
    c.translate(toupie.x, toupie.y);

    //on tourne avec l'angle
    c.rotate(toupie.angle * toupie.rotation * Math.PI / 180);
    toupie.angle += 1;
    toupie.rotation *= friction_rotation * toupie.speed_malus;

    //tracage du cercle
    if(toupie.alive){
        c.strokeStyle = '#000000';

    }else {
        c.strokeStyle = '#ff0000';

    }
    c.beginPath();
    c.arc(0, 0, toupie.radius, 0, Math.PI * 2, false);
    c.fillStyle = toupie.color;
    c.globalAlpha = 1;
    c.fill();
    c.stroke();
    c.closePath()


    //tracage des pics
    c.beginPath();
    c.lineWidth = 3;
    c.line
    c.moveTo(-toupie.radius * 13 / 16, -toupie.radius * 13 / 16);
    c.lineTo(+toupie.radius * 13 / 16, +toupie.radius * 13 / 16);
    c.moveTo(+toupie.radius * 13 / 16, -toupie.radius * 13 / 16);
    c.lineTo(-toupie.radius * 13 / 16, +toupie.radius * 13 / 16);
    c.strokeStyle = '#ffffffff';
    c.stroke();

    //on replace le point d'origine du canvas a truc normal
    c.restore();
}

//Affiche le debug au dessus d'une toupie
function showDebugToupie(strings, toupie){
    c.globalAlpha = 1;
    c.font = '30px Arial';
    c.fillStyle = "rgba(255, 255, 255, 0.8)";
    c.textAlign = "center";

    let textSpace = 0;
    strings.forEach(string=>{
        c.fillText(string, toupie.x, toupie.y-toupie.radius - 15 - textSpace);
        textSpace += 30
    })
}

// Check si un point est dans le cercle
function checkIfIsOutOfCircle(point, circle) {
    if(Math.pow((point.x - circle.x), 2) + Math.pow((point.y - circle.y), 2) > Math.pow(circle.radius, 2) && !point.out){
        return true
    }
}

//Lorsque qu'uen toupie a une rotaiton trop basse, sa velocité diminue tres vite
function ultraSlowToupie(toupie) {

    if(toupie.rotation < 0.01){
        //lorsque la toupie est trop lente, on l'immobilise
        toupie.fulldead = true;
        toupie.velocity.x = 0;
        toupie.velocity.y = 0;
        toupie.rotation = 0

    }else {

        //ralentie rapidement la toupie
        let rotation_slow = (1 - 1 / (1 + toupie.rotation * 1000));

        toupie.velocity.x = toupie.velocity.x  * toupie.speed_malus;
        toupie.velocity.y = toupie.velocity.y  * toupie.speed_malus;
    }

}

//fait rebondir sur les bords de l'écran
function bounceOnEdge(moovable) {

    if (moovable.x - moovable.radius < 0 || moovable.x + moovable.radius > innerWidth) {
        moovable.velocity.x *=-1
        moovable.rotation *= friction_edge;

        let damagesX = moovable.velocity.x
        let damages = Math.pow(Math.abs(damagesX), 3) / 5000;
        moovable.life -= damages;
    }

    if (moovable.y - moovable.radius < 0 || moovable.y + moovable.radius > innerHeight) {
        moovable.velocity.y *=-1
        moovable.rotation *= friction_edge;

        let damagesY = moovable.velocity.y
        let damages = Math.pow(Math.abs(damagesY), 3) / 5000;
        moovable.life -= damages;
    }

}

function moove(toupie){
    if(toupie.category === "attack"){
        attackMovement(toupie, toupie.center)
    }

    if(toupie.category === "defense" || toupie.category === "stamina"){
        passiveMoovement(toupie, toupie.center)
    }

}
// Fait suivre un point à un element deplacable

function attackMovement(toupie, center) {

    let xDiff = center.x - toupie.x;
    let yDiff = center.y - toupie.y;

    //prendre que les valeurs : passe en positif si negatif, ou bien reste en positif
    let additionDistance = Math.sign(xDiff) * xDiff + Math.sign(yDiff) * yDiff;

    let xWanted = xDiff / additionDistance;
    let yWanted = yDiff / additionDistance;

    let xDeplacement = xWanted;
    let yDeplacement = yWanted;


    let rotation_slow = (1 - 1 / (1 + toupie.rotation * 1000));

    toupie.velocity.x += xDeplacement / gravitationalStrenght * rotation_slow * toupie.speed_malus;
    toupie.velocity.y += yDeplacement / gravitationalStrenght * rotation_slow * toupie.speed_malus;

}

// La toupie sera repoussé par les bords
function passiveMoovement(toupie, center) {
    let xDiff = center.x - toupie.x;
    let yDiff = center.y - toupie.y;



    let xWanted = xDiff / 600;
    let yWanted = yDiff / 600;

    let xDeplacement = xWanted;
    let yDeplacement = yWanted;

    let rotation_slow = (1 - 1 / (1 + toupie.rotation * 10));


    toupie.velocity.x = toupie.velocity.x * rotation_slow * defense_instability + xDeplacement * gravitationalStrenght * rotation_slow * toupie.speed_malus ;
    toupie.velocity.y = toupie.velocity.y * rotation_slow * defense_instability + yDeplacement * gravitationalStrenght * rotation_slow * toupie.speed_malus ;



}

// Sors une valeur random d'un array
function randomFromArray(categories) {
    return categories[Math.floor(Math.random() * categories.length)]

}

function generateTailParticles(toupie){

    tailParticles.push(new TailParticle(toupie.x, toupie.y, toupie.color))

}

//######################################### Fonctions moteur canvas ###################################################




// lance la partie
function init() {

    toupies = [];
    particles = [];
    tailParticles = [];



    center = new Center(innerWidth / 2, innerHeight / 2,);
    for (let i = 0; i < 2; i++) {

        let toupieX = randomIntFromRange(innerWidth / 6, innerWidth*5 / 6);
        let toupieY = randomIntFromRange(innerHeight / 6, innerHeight*5 / 6);

        let VelocityX = randomIntFromRange(-15,15);
        let VelocityY = randomIntFromRange(-15,15);
        let velocity = {
            x: VelocityX,
            y: VelocityY
        };
        let category = randomFromArray(categories);
        let color = "";
        let rotation = 50;
        let life = 30;
        if (category === 'attack'){
            color = randomColor(color_attack)
            rotation = 40;
        }
        if (category === 'defense'){
            color = randomColor(color_defense)
            life = 50;
        }
        if (category === 'stamina'){
            rotation = 80;
            life = 20;
            color = randomColor(color_stamina)
        }






        toupies.push(new Toupie(i, toupieX, toupieY, 30,color, center, rotation, velocity, category, life));
    }
    background = new BackGround(center);


}

// Est executé chaque frame
function animate() {

    tailParticles = tailParticles.slice(-40)
    particles = particles.slice(-800)
    CheckAllToupiesCollisions(toupies);
    //loop
    requestAnimationFrame(animate);
    //clear page
    c.clearRect(0, 0, canvas.width, canvas.height);
    //update du center de l'arenne et du background
    background.update();
    center.update();

    //update de la trainée des toupies
    tailParticles.forEach(tailParticle=>{
        tailParticle.update()
    })

    //update particles
    particles.forEach(particle => {

        particle.update()
    });

    //update toupies
    toupies.forEach(toupie => {

        toupie.update()
    });




    //end animate
}

//######################################### Lancement du canvas ###################################################
init()

animate()
