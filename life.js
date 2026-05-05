const container = document.getElementById('canvas-container');
const world = document.getElementById('world');

let isDragging = false;
let startX = 0, startY = 0;
let currentX = 0, currentY = 0; // Posição atual sendo renderizada
let targetX = 0, targetY = 0;   // Destino (usado para calcular a suavização)
let dragDistance = 0; // Ajuda a distinguir se o usuário está clicando ou arrastando

container.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX - targetX;
    startY = e.clientY - targetY;
    document.body.style.cursor = 'grabbing';
    dragDistance = 0;
});

window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    dragDistance++; // Conta o movimento
    // O alvo se move conforme o mouse arrasta a tela
    targetX = e.clientX - startX;
    targetY = e.clientY - startY;
});

window.addEventListener('mouseup', () => {
    isDragging = false;
    document.body.style.cursor = 'grab';
});

window.addEventListener('mouseleave', () => {
    isDragging = false;
    document.body.style.cursor = 'grab';
});

// Motor de animação para garantir que o deslize seja leve e fluido
function animate() {
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;
    
    world.style.transform = `translate(${currentX}px, ${currentY}px)`;
    requestAnimationFrame(animate);
}

animate();

// --- Lógica do Overlay de Vídeo (Bubbles) ---
const bubbleItem = document.querySelector('.bubble-item');
const videoOverlay = document.getElementById('video-overlay');
const overlayVideo = document.getElementById('overlay-video');
const closeOverlayBtn = document.querySelector('.close-overlay');

if (bubbleItem) {
    bubbleItem.addEventListener('click', (e) => {
        e.preventDefault();
        // Se a distância do arrasto for maior que um pequeno limite, não abre o vídeo
        if (dragDistance > 5) return; 
        
        videoOverlay.classList.add('active');
        overlayVideo.currentTime = 0;
        overlayVideo.play();
    });
}

function closeOverlay() {
    videoOverlay.classList.remove('active');
    overlayVideo.pause();
}

if (closeOverlayBtn) closeOverlayBtn.addEventListener('click', closeOverlay);

if (videoOverlay) {
    videoOverlay.addEventListener('click', (e) => {
        // Fecha o pop-up caso o usuário clique na área escura (fora do vídeo)
        if (e.target === videoOverlay) closeOverlay();
    });
}

// --- Lógica do Overlay Rolex ---
const rolexItem = document.querySelector('.rolex-item');
const rolexOverlay = document.getElementById('rolex-overlay');
const rolexVideo = document.getElementById('rolex-video');
const closeRolexBtn = document.getElementById('close-rolex');

if (rolexItem) {
    rolexItem.addEventListener('click', (e) => {
        e.preventDefault();
        if (dragDistance > 5) return; 
        
        if (rolexOverlay) rolexOverlay.classList.add('active');
        if (rolexVideo) {
            rolexVideo.currentTime = 0;
            rolexVideo.play(); // Força o início da reprodução real
        }
    });
}

function closeRolexOverlay() {
    if (rolexOverlay) rolexOverlay.classList.remove('active');
    if (rolexVideo) rolexVideo.pause();
}

if (closeRolexBtn) closeRolexBtn.addEventListener('click', closeRolexOverlay);

if (rolexOverlay) {
    rolexOverlay.addEventListener('click', (e) => {
        // Fecha o pop-up caso o usuário clique na área escura (fora do vídeo)
        if (e.target === rolexOverlay) closeRolexOverlay();
    });
}

// --- Lógica do Overlay Green Work (Carrossel) ---
const greenItem = document.querySelector('.green-item');
const greenOverlay = document.getElementById('green-overlay');
const closeGreenBtn = document.getElementById('close-green');
const greenCarouselImages = greenOverlay ? greenOverlay.querySelectorAll('.carousel-img') : [];
const greenPrevBtn = document.getElementById('carousel-prev');
const greenNextBtn = document.getElementById('carousel-next');

let currentGreenIndex = 0;

if (greenItem) {
    greenItem.addEventListener('click', (e) => {
        e.preventDefault();
        if (dragDistance > 5) return; 
        
        if (greenOverlay) {
            greenOverlay.classList.add('active');
            updateGreenCarousel();
        }
    });
}

function closeGreenOverlay() {
    if (greenOverlay) greenOverlay.classList.remove('active');
}

if (closeGreenBtn) closeGreenBtn.addEventListener('click', closeGreenOverlay);

if (greenOverlay) {
    greenOverlay.addEventListener('click', (e) => {
        // Fecha o pop-up caso o usuário clique na área escura (fora da imagem e dos botões)
        if (e.target === greenOverlay || e.target.classList.contains('carousel-container') || e.target.classList.contains('carousel-track')) {
            closeGreenOverlay();
        }
    });
}

function updateGreenCarousel() {
    greenCarouselImages.forEach((img, index) => {
        if (index === currentGreenIndex) {
            img.classList.add('active');
        } else {
            img.classList.remove('active');
        }
    });
}

if (greenPrevBtn) {
    greenPrevBtn.addEventListener('click', () => {
        currentGreenIndex = (currentGreenIndex - 1 + greenCarouselImages.length) % greenCarouselImages.length;
        updateGreenCarousel();
    });
}

if (greenNextBtn) {
    greenNextBtn.addEventListener('click', () => {
        currentGreenIndex = (currentGreenIndex + 1) % greenCarouselImages.length;
        updateGreenCarousel();
    });
}

// --- Lógica do Overlay Yellow and Black (Carrossel) ---
const ybItem = document.querySelector('.yellow-black-item');
const ybOverlay = document.getElementById('yb-overlay');
const closeYbBtn = document.getElementById('close-yb');
const ybCarouselImages = ybOverlay ? ybOverlay.querySelectorAll('.carousel-img') : [];
const ybPrevBtn = document.getElementById('yb-prev');
const ybNextBtn = document.getElementById('yb-next');

let currentYbIndex = 0;

if (ybItem) {
    ybItem.addEventListener('click', (e) => {
        e.preventDefault();
        if (dragDistance > 5) return; 
        
        if (ybOverlay) {
            ybOverlay.classList.add('active');
            updateYbCarousel();
        }
    });
}

function closeYbOverlay() {
    if (ybOverlay) ybOverlay.classList.remove('active');
}

if (closeYbBtn) closeYbBtn.addEventListener('click', closeYbOverlay);

if (ybOverlay) {
    ybOverlay.addEventListener('click', (e) => {
        if (e.target === ybOverlay || e.target.classList.contains('carousel-container') || e.target.classList.contains('carousel-track')) {
            closeYbOverlay();
        }
    });
}

function updateYbCarousel() {
    ybCarouselImages.forEach((img, index) => {
        if (index === currentYbIndex) {
            img.classList.add('active');
        } else {
            img.classList.remove('active');
        }
    });
}

if (ybPrevBtn) {
    ybPrevBtn.addEventListener('click', () => {
        currentYbIndex = (currentYbIndex - 1 + ybCarouselImages.length) % ybCarouselImages.length;
        updateYbCarousel();
    });
}

if (ybNextBtn) {
    ybNextBtn.addEventListener('click', () => {
        currentYbIndex = (currentYbIndex + 1) % ybCarouselImages.length;
        updateYbCarousel();
    });
}