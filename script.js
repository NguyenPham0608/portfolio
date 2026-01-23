const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');

let width = window.innerWidth;
let height = window.innerHeight;
let dpr = window.devicePixelRatio || 1;

function resizeCanvas() {
    dpr = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const palette = [
    { r: 20, g: 184, b: 166 },
    { r: 56, g: 189, b: 248 },
    { r: 249, g: 115, b: 22 }
];

class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        const color = palette[Math.floor(Math.random() * palette.length)];
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2.8 + 1.2;
        this.baseSpeedX = Math.random() * 0.6 - 0.3;
        this.baseSpeedY = Math.random() * 0.6 - 0.3;
        this.opacity = Math.random() * 0.4 + 0.4;
        this.color = color;
    }

    update(speedBoost) {
        this.x += this.baseSpeedX * (1 + speedBoost);
        this.y += this.baseSpeedY * (1 + speedBoost);

        if (this.x > width) this.x = 0;
        if (this.x < 0) this.x = width;
        if (this.y > height) this.y = 0;
        if (this.y < 0) this.y = height;
    }

    draw() {
        const { r, g, b } = this.color;
        const gradient = ctx.createRadialGradient(
            this.x,
            this.y,
            0,
            this.x,
            this.y,
            this.size * 4
        );
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${this.opacity})`);
        gradient.addColorStop(0.6, `rgba(${r}, ${g}, ${b}, ${this.opacity * 0.35})`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 4, 0, Math.PI * 2);
        ctx.fill();
    }
}

const particles = [];
const particleCount = 130;

for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
}

let mouse = { x: null, y: null, radius: 180 };
let scrollBoost = 0;
let hoverEl = null;
let hoverTarget = null;

window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
});

window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
});

window.addEventListener('scroll', () => {
    scrollBoost = Math.min(0.8, window.scrollY / 1200);
    updateHoverTarget();
});

const cards = document.querySelectorAll('.project-card');

function updateHoverTarget() {
    if (!hoverEl) {
        hoverTarget = null;
        return;
    }

    const rect = hoverEl.getBoundingClientRect();
    hoverTarget = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        radius: 240
    };
}

cards.forEach((card) => {
    card.addEventListener('mouseenter', () => {
        hoverEl = card;
        updateHoverTarget();
    });

    card.addEventListener('mouseleave', () => {
        hoverEl = null;
        hoverTarget = null;
    });
});

function connectParticles() {
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 150) {
                const opacity = (1 - distance / 150) * 0.3;
                ctx.strokeStyle = `rgba(56, 189, 248, ${opacity})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }

        if (mouse.x !== null && mouse.y !== null) {
            const dx = particles[i].x - mouse.x;
            const dy = particles[i].y - mouse.y;
            const distance = Math.sqrt(dx * dx + dy * dy) || 1;

            if (distance < mouse.radius) {
                const force = (mouse.radius - distance) / mouse.radius;
                const dirX = dx / distance;
                const dirY = dy / distance;

                particles[i].x += dirX * force * 2.5;
                particles[i].y += dirY * force * 2.5;

                ctx.strokeStyle = `rgba(20, 184, 166, ${force * 0.5})`;
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.stroke();
            }
        }

        if (hoverTarget) {
            const dx = hoverTarget.x - particles[i].x;
            const dy = hoverTarget.y - particles[i].y;
            const distance = Math.sqrt(dx * dx + dy * dy) || 1;

            if (distance < hoverTarget.radius) {
                const force = (hoverTarget.radius - distance) / hoverTarget.radius;
                particles[i].x += (dx / distance) * force * 0.8;
                particles[i].y += (dy / distance) * force * 0.8;

                ctx.strokeStyle = `rgba(249, 115, 22, ${force * 0.35})`;
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(hoverTarget.x, hoverTarget.y);
                ctx.stroke();
            }
        }
    }
}

function animate() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach((particle) => {
        particle.update(scrollBoost);
        particle.draw();
    });

    connectParticles();
    requestAnimationFrame(animate);
}

animate();
