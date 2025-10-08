const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3.5 + 1.5;
        this.speedX = Math.random() * 0.8 - 0.4;
        this.speedY = Math.random() * 0.8 - 0.4;
        this.opacity = Math.random() * 0.5 + 0.4;
        this.hue = Math.random() * 60 + 180;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
    }

    draw() {
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.size * 3
        );
        gradient.addColorStop(0, `hsla(${this.hue}, 80%, 65%, ${this.opacity})`);
        gradient.addColorStop(0.5, `hsla(${this.hue}, 75%, 60%, ${this.opacity * 0.5})`);
        gradient.addColorStop(1, `hsla(${this.hue}, 70%, 55%, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
        ctx.fill();

        // Add bright core
        ctx.fillStyle = `hsla(${this.hue}, 90%, 75%, ${this.opacity * 0.8})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 0.8, 0, Math.PI * 2);
        ctx.fill();
    }
}

const particles = [];
const particleCount = 120;

// Create a grid to ensure even distribution
const cols = Math.ceil(Math.sqrt(particleCount));
const rows = Math.ceil(particleCount / cols);
const cellWidth = canvas.width / cols;
const cellHeight = canvas.height / rows;

for (let i = 0; i < particleCount; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);

    // Place particle randomly within its grid cell
    const particle = new Particle();
    particle.x = col * cellWidth + Math.random() * cellWidth;
    particle.y = row * cellHeight + Math.random() * cellHeight;
    particles.push(particle);
}

let mouse = { x: null, y: null, radius: 180 };

window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
});

window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
});

function connectParticles() {
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 140) {
                const opacity = (1 - distance / 140) * 0.35;
                const gradient = ctx.createLinearGradient(
                    particles[i].x, particles[i].y,
                    particles[j].x, particles[j].y
                );
                gradient.addColorStop(0, `rgba(56, 189, 248, ${opacity})`);
                gradient.addColorStop(0.5, `rgba(99, 102, 241, ${opacity})`);
                gradient.addColorStop(1, `rgba(168, 85, 247, ${opacity})`);

                ctx.strokeStyle = gradient;
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }

        if (mouse.x !== null && mouse.y !== null) {
            const dx = particles[i].x - mouse.x;
            const dy = particles[i].y - mouse.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < mouse.radius) {
                const force = (mouse.radius - distance) / mouse.radius;
                const dirX = dx / distance;
                const dirY = dy / distance;

                particles[i].x += dirX * force * 3;
                particles[i].y += dirY * force * 3;

                const gradient = ctx.createLinearGradient(
                    particles[i].x, particles[i].y,
                    mouse.x, mouse.y
                );
                gradient.addColorStop(0, `rgba(168, 85, 247, ${force * 0.6})`);
                gradient.addColorStop(0.5, `rgba(236, 72, 153, ${force * 0.5})`);
                gradient.addColorStop(1, `rgba(56, 189, 248, ${force * 0.3})`);

                ctx.strokeStyle = gradient;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.stroke();
            }
        }
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });

    connectParticles();
    requestAnimationFrame(animate);
}

animate();