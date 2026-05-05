const scrollWrapper = document.querySelector('.scroll-wrapper');
const horizontalContent = document.querySelector('.horizontal-content');
const marquees = document.querySelectorAll('.marquee');
const marqueeData = Array.from(marquees).map((m, i) => ({
    element: m,
    position: 0,
    baseDirection: i === 1 ? -1 : 1
}));

let direction = 1; // 1 for right, -1 for left
let speed = 0.5;
let speedTimeout;

const scrollController = () => {
    const scrollWrapperTop = scrollWrapper.offsetTop;
    const scrollWrapperHeight = scrollWrapper.offsetHeight;
    const windowHeight = window.innerHeight;
    const windowScrollTop = window.scrollY;

    if (windowScrollTop >= scrollWrapperTop && windowScrollTop <= scrollWrapperTop + scrollWrapperHeight - windowHeight) {
        const scrollPercentage = (windowScrollTop - scrollWrapperTop) / (scrollWrapperHeight - windowHeight);
        const newPosition = -scrollPercentage * (horizontalContent.scrollWidth - window.innerWidth);
        horizontalContent.style.transform = `translateX(${newPosition}px)`;
    }
}

const animateMarquee = () => {
    marqueeData.forEach(data => {
        data.position += speed * direction * data.baseDirection;

        if (data.position > 0) {
            data.position = -data.element.scrollWidth / 2;
        } else if (data.position < -data.element.scrollWidth / 2) {
            data.position = 0;
        }

        data.element.style.transform = `translateX(${data.position}px)`;
    });

    requestAnimationFrame(animateMarquee);
}

window.addEventListener('wheel', (event) => {
    if (event.deltaY < 0) {
        // upscroll
        direction = -1;
        speed = 5;
    } else {
        // downscroll
        direction = 1;
        speed = 5;
    }

    clearTimeout(speedTimeout);
    speedTimeout = setTimeout(() => {
        speed = 0.5;
    }, 200);
});

window.addEventListener('scroll', scrollController);

// Initial call to set the position after a short delay
setTimeout(scrollController, 100);

// Start the marquee animation
animateMarquee();

const mockupContainer = document.getElementById('mockup-container');
const mockupImages = document.querySelectorAll('.mockup-img');
const mockupNameLabel = document.getElementById('mockup-name');

// Nomes dos projetos para o label
const nomesProjetos = ["247", "NOITE", "MOON", "PANTHER", "EDITORIAL", "POSTER"];

// Variável para controlar qual imagem está ativa
let indexAtivo = 0; // Começamos com a primeira (0)

if (mockupContainer) {
    mockupContainer.addEventListener('mousemove', (e) => {
        // 1. Pega o tamanho e posição do container
        const rect = mockupContainer.getBoundingClientRect();
        
        // 2. Calcula a posição do mouse relativa ao container (0 a 1)
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
    
        // 3. Define qual índice de imagem mostrar (dividindo o X pelo número de fotos)
        const totalFotos = mockupImages.length;
        // O Math.min garante que o índice não passe do limite (ex: se X for 1.0)
        const novoIndex = Math.min(Math.floor(x * totalFotos), totalFotos - 1);
    
        // 4. Se o índice mudou, atualizamos as classes
        if (novoIndex !== indexAtivo) {
            mockupImages[indexAtivo].classList.remove('active');
            mockupImages[novoIndex].classList.add('active');
            mockupNameLabel.innerText = nomesProjetos[novoIndex];
            indexAtivo = novoIndex;
        }
    
        // 5. Aplica o efeito Parallax na imagem ATIVA
        const imgAtiva = mockupImages[indexAtivo];
        // O deslocamento é baseado na distância do centro (0.5)
        const moveX = (x - 0.5) * 40; // Deslocamento X sutil
        const moveY = (y - 0.5) * 40; // Deslocamento Y sutil
        
        // Usamos calc(-50% + moveX) para manter a imagem centralizada e adicionar o movimento
        imgAtiva.style.transform = `translate(calc(-50% + ${moveX}px), calc(-50% + ${moveY}px)) scale(1.05)`;
    });
    
    // Reseta o estado Parallax quando o mouse sai, mas MANTÉM a imagem visível
    mockupContainer.addEventListener('mouseleave', () => {
        const imgAtiva = mockupImages[indexAtivo];
        // Retorna ao estado centralizado sem o Parallax
        imgAtiva.style.transform = `translate(-50%, -50%) scale(1.02)`;
    });
}

// --- Lógica do Vídeo de Intro (Breu) ---
const scrollIndicator = document.getElementById('scroll-indicator');

// Esconde o SVG quando o usuário scrollar
window.addEventListener('scroll', () => {
    if (scrollIndicator && window.scrollY > 10) {
        scrollIndicator.classList.remove('visible');
    }

    // Expande o vídeo retirando a margem progressivamente
    const introContainer = document.querySelector('.intro-video-container');
    if (introContainer) {
        // O efeito ocorre suavemente durante os primeiros 50vh (metade da altura da tela) de scroll
        let maxScroll = window.innerHeight * 0.5;
        let progress = Math.max(0, Math.min(window.scrollY / maxScroll, 1));
        
        // Se a largura for menor ou igual à altura, deixa as margens horizontais iguais às verticais (10vw)
        let paddingH = window.innerWidth <= window.innerHeight ? 10 : 24;
        introContainer.style.padding = `${10 - (10 * progress)}vw ${paddingH - (paddingH * progress)}vw`;
    }
});