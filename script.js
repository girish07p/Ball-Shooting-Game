const scoreEl = document.getElementById("scoreEl");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;
const projectiles = [];
const enemies = [];
const particles =[];
const friction = 0.99; 

class Player{
    constructor(x,y,radius,color){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }
    draw(){
        ctx.beginPath()
        ctx.fillStyle = this.color;
        ctx.arc(this.x,this.y,this.radius,0,Math.PI*2);
        ctx.fill();
    }
}
class Projectile{
    constructor(x,y,radius,color,velocity){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }
    draw(){
        ctx.beginPath()
        ctx.fillStyle = this.color;
        ctx.arc(this.x,this.y,this.radius,0,Math.PI*2);
        ctx.fill();
    }
    update(){
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}
class Enemy{
    constructor(x,y,radius,color,velocity){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }
    draw(){
        ctx.beginPath()
        ctx.fillStyle = this.color;
        ctx.arc(this.x,this.y,this.radius,0,Math.PI*2);
        ctx.fill();
    }
    update(){
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}
class Particles{
    constructor(x,y,radius,color,velocity){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha =3;
    }
    draw(){
        ctx.save();
        ctx.beginPath();
        ctx.globalAplha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.arc(this.x,this.y,this.radius,0,Math.PI*2);
        ctx.fill();
        ctx.restore();
    }
    update(){
        this.draw();
        this.velocity.x = this.velocity.x * friction;
        this.velocity.y = this.velocity.y * friction;
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
        this.alpha = this.alpha - 0.01;
    }
}


const player = new Player(innerWidth/2,innerHeight/2,10,"white");
player.draw();

function spawnEnemies() {
    setInterval(() => {
        let min_radius = 6;
        let max_radius = 30;
        const radius = Math.random() * (max_radius- min_radius) + min_radius;
        let x;
        let y;
        if (Math.random() < 0.5) {
            x= Math.random() < 0.5 ? 0-radius : canvas.width+radius;
            y= Math.random() * canvas.height;
        } else {
            x= Math.random() * canvas.width;
            y= Math.random() < 0.5 ? 0-radius : canvas.height+radius;
        }
        const color = `hsl(${Math.random()*360},50%,50%)`;
        const angle  = Math.atan2(
            canvas.height/2-y,
            canvas.width/2-x
        );
        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }
        enemies.push(new Enemy(x,y,radius,color,velocity));
    }, 1000);
}

let animationId;
let score = 0;
function animate() {
    animationId = requestAnimationFrame(animate);
    ctx.fillStyle = "rgba(0,0,0,0.1)";
    ctx.fillRect(0,0,canvas.width,canvas.height)
    player.draw();
    projectiles.forEach((projectile, projectileIndex) => {
        projectile.update();
        if (projectile.x + projectile.radius < 0 
            || projectile.x - projectile.radius > canvas.width
            || projectile.y + projectile.radius < 0
            || projectile.y - projectile.radius > canvas.height) {
            projectiles.splice(projectileIndex,1)
        }
    });
    particles.forEach((particle, particleIndex) => {
        if (particle.alpha <= 0) {
            particles.splice(particleIndex,1);
        } else{
            particle.update();
        }
    });
    enemies.forEach((enemy, enemyIndex) => {
        enemy.update();

        const playerDist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
        // --- game over ---
        if (playerDist - enemy.radius - player.radius < 1) {
            cancelAnimationFrame(animationId)
        }

        projectiles.forEach((projectile, projectileIndex)=>{
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);

            // ---- when projectile touch enemy --- 
            if (dist - enemy.radius - projectile.radius < 1) {

                score = score + 100;
                scoreEl.innerText = score;

                // ---- create explosions ---- 
                for (let i = 0; i < enemy.radius; i++) {
                    particles.push(new Particles(projectile.x, projectile.y,Math.random()*2, enemy.color,{
                        x: (Math.random()-0.5) * (Math.random()*6),
                        y: (Math.random()-0.5) * (Math.random()*6),
                    }))
                }

                if (enemy.radius - 10 > 5) {
                    gsap.to(enemy , {
                        radius: enemy.radius - 10
                    });
                } else {
                    enemies.splice(enemyIndex,1);
                }
                projectiles.splice(projectileIndex,1)
            }
        })
    });
}

addEventListener("click",(event)=>{
    const angle  = Math.atan2(
        event.clientY - canvas.height/2,
        event.clientX - canvas.width/2
    );
    const velocity = {
        x: Math.cos(angle) *5 ,
        y: Math.sin(angle) *5 
    }
    projectiles.push(new Projectile(innerWidth/2,innerHeight/2,5,"white",velocity))
});

animate();
spawnEnemies();

// 1:13