// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if(target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// --- Draggable Stickers ---
const stickers = document.querySelectorAll('.sticker');
let draggedSticker = null;
let stickerStartX = 0, stickerStartY = 0;

stickers.forEach(sticker => {
    sticker.addEventListener('mousedown', (e) => {
        if(e.button !== 0) return; // Only allow left click dragging
        draggedSticker = sticker;
        stickerStartX = e.pageX - sticker.offsetLeft;
        stickerStartY = e.pageY - sticker.offsetTop;
        sticker.style.zIndex = 100;
        e.preventDefault(); 
    });
});

window.addEventListener('mousemove', (e) => {
    if (draggedSticker) {
        draggedSticker.style.left = (e.pageX - stickerStartX) + 'px';
        draggedSticker.style.top = (e.pageY - stickerStartY) + 'px';
    }
});

window.addEventListener('mouseup', () => {
    if (draggedSticker) {
        draggedSticker.style.zIndex = 50;
        draggedSticker = null;
    }
});


// --- Basketball Mini-Game ---
const ball = document.getElementById('ball');
const rim = document.getElementById('hoop-rim');
const scoreVal = document.getElementById('score-val');
const cards = document.querySelectorAll('.brutal-card');
const slingshotSvg = document.getElementById('slingshot-svg');
const slingshotBand = document.getElementById('slingshot-band');

let score = 0;
let isDragging = false;
let isFlying = false;

let startX, startY;
// Default starting position
let currentX = 50; 
let currentY = window.innerHeight - 150; 

let vx = 0;
let vy = 0;

const gravity = 0.5; // slightly lighter gravity for smoother arcs
const bounce = -0.7; // slightly less bouncy
const friction = 0.98; // a touch more friction for smoother slows

// Reset button to reposition ball


// Hide instructional overlay after first interaction
let hasInteracted = false;
function hideInstructionOverlay() {
    const overlay = document.getElementById('instruction-overlay');
    if (overlay) overlay.style.display = 'none';
}

// Double‑click on the ball to reset to start position
ball.addEventListener('dblclick',() => {
    isFlying=false;
    isDragging=false;
    currentX = 50;
    currentY = window.innerHeight - 150;
    vx=vy=0;
    rotation=0;
    ball.style.transform = `translate(${currentX}px, ${currentY}px) rotate(${rotation}deg)`;
});

let dragDx = 0;
let dragDy = 0;
let rotation = 0;

// Initialize ball position
ball.style.transform = `translate(${currentX}px, ${currentY}px) rotate(0deg)`;

// Keep ball on screen on resize
window.addEventListener('resize', () => {
    if (currentX > window.innerWidth - 60) currentX = window.innerWidth - 60;
    if (currentY > window.innerHeight - 60) currentY = window.innerHeight - 60;
    ball.style.transform = `translate(${currentX}px, ${currentY}px) rotate(${rotation}deg)`;
});

function getClientPos(e) {
    if (e.touches) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    return { x: e.clientX, y: e.clientY };
}

function startDragBall(e) {
    if (isFlying) {
        // Catch the ball mid-air!
        isFlying = false;
        vx = 0; vy = 0;
    }
    isDragging = true;
    const pos = getClientPos(e);
    startX = pos.x;
    startY = pos.y;
    ball.style.transition = 'none';
    
    slingshotSvg.style.display = 'block';
    
    // Initial phantom sling point
    let anchorX = currentX + 30;
    let anchorY = currentY + 30;
    slingshotBand.setAttribute('x1', anchorX);
    slingshotBand.setAttribute('y1', anchorY);
    slingshotBand.setAttribute('x2', anchorX);
    slingshotBand.setAttribute('y2', anchorY);
}

function dragBall(e) {
    if (!isDragging) return;
    e.preventDefault();
    const pos = getClientPos(e);
    dragDx = pos.x - startX;
    dragDy = pos.y - startY;
    

    
    // Update phantom slingshot arrow to point from ball to drag point (intuitive)
    const anchorX = currentX + 30; // ball center
    const anchorY = currentY + 30;
    const targetX = anchorX + dragDx; // where mouse is dragging to
    const targetY = anchorY + dragDy;
    slingshotBand.setAttribute('x1', anchorX);
    slingshotBand.setAttribute('y1', anchorY);
    slingshotBand.setAttribute('x2', targetX);
    slingshotBand.setAttribute('y2', targetY);
}

function endDragBall(e) {
    if (!isDragging) return;
    isDragging = false;
    slingshotSvg.style.display = 'none';
    
    // Apply velocity based on drag direction (pull back to launch forward)
    vx = -dragDx * 0.25;
    vy = -dragDy * 0.25;
    
    const speed = Math.sqrt(vx*vx + vy*vy);
    // Increase max speed cap for more responsive launches
    if(speed > 80) {
        vx = (vx/speed)*80;
        vy = (vy/speed)*80;
    }
    
    dragDx = 0;
    dragDy = 0;
    
    if (Math.abs(vx) > 1 || Math.abs(vy) > 1) {
        isFlying = true;
        requestAnimationFrame(updateGame);
    } else {
        ball.style.transform = `translate(${currentX}px, ${currentY}px) rotate(${rotation}deg)`;
    }
}

// Initialize picture slideshow (in case DOMContentLoaded missed)
function initSlideshow() {
    const slides = document.querySelectorAll('.slide');
    let currentSlide = 0;
    if (slides.length === 0) return;
    slides.forEach((img, idx) => {
        if (img.src.includes('placeholder')) {
            img.src = `https://via.placeholder.com/800x400?text=Slide+${idx + 1}`;
        }
    });
    function showSlide(index) {
        slides.forEach((s, i) => s.style.display = i === index ? 'block' : 'none');
    }
    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }
    showSlide(currentSlide);
    setInterval(nextSlide, 4000);
}
// Run slideshow init on load (covers both ready states)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSlideshow);
} else {
    initSlideshow();
}

ball.addEventListener('mousedown', startDragBall);
window.addEventListener('mousemove', dragBall, {passive: false});
window.addEventListener('mouseup', endDragBall);

ball.addEventListener('touchstart', startDragBall, {passive: false});
window.addEventListener('touchmove', dragBall, {passive: false});
window.addEventListener('touchend', endDragBall);


function updateGame() {
    if (!isFlying) return;
    
    vy += gravity;
    vx *= friction;
    
    currentX += vx;
    currentY += vy;
    rotation += vx * 2; 
    
    // Window Bounds
    if (currentY + 60 >= window.innerHeight) {
        currentY = window.innerHeight - 60;
        vy = vy * bounce;
        vx *= 0.8; 
        
        // Stops and stays wherever it is!
        if (Math.abs(vy) < 2 && Math.abs(vx) < 1) {
            isFlying = false;
            ball.style.transform = `translate(${currentX}px, ${currentY}px) rotate(${rotation}deg)`;
            return; 
        }
    }
    
    if (currentY <= 0) {
        currentY = 0;
        vy = vy * bounce;
    }
    
    if (currentX <= 0) {
        currentX = 0;
        vx = vx * bounce;
    } else if (currentX + 60 >= window.innerWidth) {
        currentX = window.innerWidth - 60;
        vx = vx * bounce;
    }

    // Card Collisions!
    const ballCenterY = currentY + 30;
    const ballCenterX = currentX + 30;
    const radius = 30;

    cards.forEach(card => {
        if(card.id === 'scoreboard') return; 

        const rect = card.getBoundingClientRect();
        
        const closestX = Math.max(rect.left, Math.min(ballCenterX, rect.right));
        const closestY = Math.max(rect.top, Math.min(ballCenterY, rect.bottom));
        
        const dx = ballCenterX - closestX;
        const dy = ballCenterY - closestY;
        const distanceSquared = (dx * dx) + (dy * dy);
        
        if (distanceSquared < radius * radius) {
            if (Math.abs(dx) > Math.abs(dy)) {
                vx = vx * bounce;
                currentX += (dx > 0 ? 1 : -1) * (radius - Math.abs(dx));
            } else {
                vy = vy * bounce;
                currentY += (dy > 0 ? 1 : -1) * (radius - Math.abs(dy));
                vx *= friction; // extra friction on card tops
                
                // Stop on card if slow
                if (dy < 0 && Math.abs(vy) < 2 && Math.abs(vx) < 1) {
                    isFlying = false;
                }
            }
        }
    });
    
    // Stop loop if it landed on a card
    if (!isFlying) {
        ball.style.transform = `translate(${currentX}px, ${currentY}px) rotate(${rotation}deg)`;
        return;
    }
    
    // Scoring Logic
    const rimRect = rim.getBoundingClientRect();
    const prevY = ballCenterY - vy;
    
    if (vy > 0 && prevY < rimRect.top && ballCenterY >= rimRect.top) {
        if (ballCenterX > rimRect.left && ballCenterX < rimRect.right) {
            score++;
            scoreVal.innerText = score;
            rim.style.backgroundColor = 'var(--lime)'; 
            const sb = document.getElementById('scoreboard');
            sb.style.transform = 'scale(1.2) rotate(-5deg)';
            setTimeout(() => {
                rim.style.backgroundColor = '#d46363'; // back to dull red
                sb.style.transform = 'scale(1) rotate(0deg)';
            }, 300);
        }
    }
    
    const bbX = rimRect.right;
    const bbTop = rimRect.top - 80;
    if (ballCenterX + 30 >= bbX && ballCenterY > bbTop && ballCenterY < rimRect.bottom && vx > 0) {
        currentX = bbX - 60;
        vx = vx * bounce;
    }
    
    ball.style.transform = `translate(${currentX}px, ${currentY}px) rotate(${rotation}deg)`;
    requestAnimationFrame(updateGame);
}
