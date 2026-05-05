// --- 1. CONFIGURAÇÃO DAS PALETAS (Verde, Amarelo, Azul, Vermelho) ---
function aplicarCorAleatoria(comFade = false) {
    if (!comFade) {
        // Adiciona um estilo temporário bloqueando qualquer transição na página inteira
        const style = document.createElement('style');
        style.id = 'temp-no-transition';
        style.innerHTML = '* { transition: none !important; }';
        document.head.appendChild(style);

        document.documentElement.style.transition = 'none';
        document.body.style.transition = 'none';
    } else {
        document.documentElement.style.transition = 'background-color 0.35s ease-in-out';
        document.body.style.transition = 'background-color 0.35s ease-in-out';
    }

    const paletas = [
        { nome: 'verde',    h: [120, 160], s: [40, 90], l: [40, 70] },
        { nome: 'amarelo',  h: [45, 60],   s: [60, 100], l: [45, 75] },
        { nome: 'azul',     h: [190, 240], s: [40, 90], l: [40, 70] },
        { nome: 'vermelho', h: [0, 15],    h2: [345, 360], s: [50, 90], l: [40, 65] }
    ];

    const paleta = paletas[Math.floor(Math.random() * paletas.length)];
    
    let hue;
    if (paleta.nome === 'vermelho' && Math.random() > 0.5) {
        hue = Math.floor(Math.random() * (paleta.h2[1] - paleta.h2[0] + 1)) + paleta.h2[0];
    } else {
        hue = Math.floor(Math.random() * (paleta.h[1] - paleta.h[0] + 1)) + paleta.h[0];
    }
    
    const saturation = Math.floor(Math.random() * (paleta.s[1] - paleta.s[0] + 1)) + paleta.s[0];
    const lightness = Math.floor(Math.random() * (paleta.l[1] - paleta.l[0] + 1)) + paleta.l[0];

    const finalColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    const ehClaro = lightness > 55;

    document.documentElement.style.setProperty('--bg-color', finalColor);
    document.documentElement.style.setProperty('--text-color', ehClaro ? '#000000' : '#ffffff');
    document.documentElement.style.setProperty('--btn-bg', ehClaro ? '#000000' : '#ffffff');
    
    // Atualiza a cor do botão 3D dependendo da luminosidade do fundo
    // (Usa cinza escuro no lugar do preto absoluto para manter os reflexos e brilhos)
    const logoContainer = document.getElementById('logo-container');
    if (logoContainer) {
        logoContainer.setAttribute('data-color', ehClaro ? '#222222' : '#ffffff');
    }

    if (!comFade) {
        void document.documentElement.offsetWidth; // Força a renderização imediata na tela
        // Remove a trava logo após a cor ser aplicada, liberando as animações novamente
        const tempStyle = document.getElementById('temp-no-transition');
        if (tempStyle) tempStyle.remove();
    }
}

// Executa cor instantânea ao abrir
aplicarCorAleatoria(false);

// --- 2. CONFIGURAÇÃO DE CURSORES, TAMANHOS E FONTES ---
const cursores = [
    'Cursor/Vector 1.svg', 'Cursor/Vector 2.svg', 'Cursor/Vector 3.svg', 'Cursor/Vector 4.svg', 'Cursor/Vector 5.svg',
    'Cursor/Vector 6.svg', 'Cursor/Vector 7.svg', 'Cursor/Vector 8.svg', 'Cursor/Vector 9.svg', 'Cursor/Vector 10.svg'
];
const tamanhos = [30, 45, 60, 25, 50, 75, 40, 55, 35, 90];

const cursoresHover = [
    'Cursor/Vector 11.svg', 'Cursor/Vector 12.svg', 'Cursor/Vector 13.svg', 'Cursor/Vector 14.svg', 'Cursor/Vector 15.svg',
    'Cursor/Vector 16.svg', 'Cursor/Vector 17.svg', 'Cursor/Vector 18.svg', 'Cursor/Vector 19.svg', 'Cursor/Vector 20.svg'
];
const tamanhosHover = [50, 60, 70, 55, 65, 75, 45, 60, 70, 50];

const fontes = [
    'Arial, sans-serif', '"Courier New", Courier, monospace', 'Georgia, serif', 'Impact, sans-serif', 
    '"Comic Sans MS", cursive', '"Trebuchet MS", sans-serif', '"Lucida Console", Monaco, monospace', 
    '"Palatino Linotype", Palatino, serif', 'Tahoma, sans-serif', '"Times New Roman", Times, serif'
];

// Pré-carregamento dos SVGs
[...cursores, ...cursoresHover].forEach(caminho => { const img = new Image(); img.src = caminho; });

// --- 3. VARIÁVEIS DE ESTADO E ELEMENTOS ---
let indiceAtual = 0;
let indiceFonteAtual = 0;
let contadorDeMovimentos = 0;
let isHovering = false;
let isTransitioning = false;
let fontInterval;
const limiteDeTroca = 15; 

const cursorElement = document.getElementById('cursor-customizado');
const brunoTextElement = document.getElementById('bruno-text');
const introTextEl = document.getElementById('intro-text');
const mainTitleEl = document.querySelector('.main-title');
const ctaBtnEl = document.querySelector('.cta-button');

// --- 4. ANIMAÇÃO DE INTRODUÇÃO ---
if (mainTitleEl && ctaBtnEl && introTextEl && brunoTextElement) {
    mainTitleEl.style.opacity = '0';
    ctaBtnEl.style.opacity = '0';
    ctaBtnEl.style.pointerEvents = 'none';

    setTimeout(() => {
        introTextEl.style.transition = 'opacity 1s ease';
        introTextEl.style.opacity = '0';

        setTimeout(() => {
            introTextEl.style.display = 'none';
            mainTitleEl.style.transition = 'opacity 1s ease';
            ctaBtnEl.style.transition = 'opacity 1s ease';
            mainTitleEl.style.opacity = '1';
            ctaBtnEl.style.opacity = '1';
            ctaBtnEl.style.pointerEvents = 'auto';

            // Inicia troca de fontes do BRUNO após a intro
            fontInterval = setInterval(() => {
                indiceFonteAtual = (indiceFonteAtual + 1) % fontes.length;
                brunoTextElement.style.fontFamily = fontes[indiceFonteAtual];
            }, 750);
        }, 1000);
    }, 2500);
}

// --- 5. LÓGICA DO MOUSE (MOVIMENTO E HOVER) ---
if (cursorElement) {
    // Oculta o cursor quando o mouse sai da página
    document.addEventListener('mouseleave', () => {
        cursorElement.style.opacity = '0';
    });
    // Mostra o cursor novamente quando o mouse volta para a página
    document.addEventListener('mouseenter', () => {
        cursorElement.style.opacity = '1';
    });

    document.addEventListener('mousemove', (e) => {
        cursorElement.style.left = `${e.clientX}px`;
        cursorElement.style.top = `${e.clientY}px`;

        if (isTransitioning) return;

        contadorDeMovimentos++;

        if (contadorDeMovimentos >= limiteDeTroca) {
            contadorDeMovimentos = 0;
            const listaC = isHovering ? cursoresHover : cursores;
            const listaT = isHovering ? tamanhosHover : tamanhos;

            indiceAtual = (indiceAtual + 1) % listaC.length;

            if (isHovering) {
                cursorElement.style.webkitMaskImage = 'none';
                cursorElement.style.maskImage = 'none';
                cursorElement.style.backgroundImage = `url('${listaC[indiceAtual]}')`;
            } else {
                cursorElement.style.backgroundImage = 'none';
                cursorElement.style.webkitMaskImage = `url('${listaC[indiceAtual]}')`;
                cursorElement.style.maskImage = `url('${listaC[indiceAtual]}')`;
            }
            cursorElement.style.width = `${listaT[indiceAtual]}px`;
            cursorElement.style.height = `${listaT[indiceAtual]}px`;
        }
    });

    const elementosClicaveis = document.querySelectorAll('a, button');
    elementosClicaveis.forEach(el => {
        el.addEventListener('mouseenter', () => {
            if (isTransitioning) return;
            isHovering = true;
            indiceAtual = 0;
            cursorElement.classList.add('hover-active');
            cursorElement.style.backgroundImage = `url('${cursoresHover[0]}')`;
            cursorElement.style.width = `${tamanhosHover[0]}px`;
            cursorElement.style.height = `${tamanhosHover[0]}px`;
        });
        el.addEventListener('mouseleave', () => {
            if (isTransitioning) return;
            isHovering = false;
            indiceAtual = 0;
            cursorElement.classList.remove('hover-active');
            cursorElement.style.backgroundImage = 'none';
            cursorElement.style.webkitMaskImage = `url('${cursores[0]}')`;
            cursorElement.style.width = `${tamanhos[0]}px`;
            cursorElement.style.height = `${tamanhos[0]}px`;
        });
    });
}

// --- 6. EVENTO DE CLIQUE (O CAOS DE SAÍDA) ---
if (ctaBtnEl) {
    ctaBtnEl.addEventListener('click', (e) => {
        e.preventDefault();
        if (isTransitioning) return;

        isTransitioning = true;
        const targetUrl = ctaBtnEl.getAttribute('href');
        clearInterval(fontInterval);

        // Caos de cores com FADE (suave na saída)
        const colorInterval = setInterval(() => aplicarCorAleatoria(true), 350);

        // Caos de fontes e cursores (rápido)
        const fastFontInterval = setInterval(() => {
            indiceFonteAtual = (indiceFonteAtual + 1) % fontes.length;
            brunoTextElement.style.fontFamily = fontes[indiceFonteAtual];
        }, 150);

        const chaosInterval = setInterval(() => {
            indiceAtual = (indiceAtual + 1) % cursoresHover.length;
            cursorElement.style.backgroundImage = `url('${cursoresHover[indiceAtual]}')`;
            cursorElement.style.width = `${tamanhosHover[indiceAtual]}px`;
            cursorElement.style.height = `${tamanhosHover[indiceAtual]}px`;
        }, 150);

        // Overlay final para transição de página
        setTimeout(() => {
            clearInterval(colorInterval);
            clearInterval(fastFontInterval);
            clearInterval(chaosInterval);

            const overlay = document.createElement('div');
            overlay.style.cssText = "position:fixed; top:0; left:0; width:100vw; height:100vh; background:#1a1a1a; z-index:100000; opacity:0; transition:opacity 0.4s ease;";
            document.body.appendChild(overlay);
            void overlay.offsetWidth;
            overlay.style.opacity = '1';
        }, 1100);

        setTimeout(() => { window.location.href = targetUrl; }, 1500);
    });
}
