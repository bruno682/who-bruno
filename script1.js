import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// 1. Configuração Básica da Cena
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(new THREE.Color('#ffffff'), 1); // Cor de fundo preta
document.body.appendChild(renderer.domElement);

// Variáveis para interação com o mouse
const raycaster = new THREE.Raycaster();
raycaster.params.Points.threshold = 0.1; // Facilita a detecção de cliques nos modelos pontilhados
const mouse = new THREE.Vector2(-1000, -1000);
const mousePlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
const mousePos3D = new THREE.Vector3(-1000, -1000, -1000);
let mouseX = 0;
let mouseY = 0;
let hoveredObject = null; // Guarda o modelo 3D que está sob o mouse no momento

window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Captura o movimento do mouse em pixels para mudar a direção do fundo
    mouseX = event.clientX;
    mouseY = event.clientY;

    // Muda o cursor para "mãozinha" se estiver sobre um modelo clicável
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(particles);
    if (intersects.length > 0) {
        document.body.style.cursor = 'pointer';
        
        // Lógica de hover: muda a cor do objeto alvo para branco
        const object = intersects[0].object;
        if (hoveredObject !== object) {
            if (hoveredObject) {
                hoveredObject.geometry.attributes.color.array.set(hoveredObject.userData.originalColorsArray);
                hoveredObject.geometry.attributes.color.needsUpdate = true;
                if (hoveredObject.userData.label) {
                    hoveredObject.userData.label.style.filter = ''; // Remove o filtro inline
                }
                if (hoveredObject.userData.desc) {
                    hoveredObject.userData.desc.classList.remove('active');
                }
            }
            hoveredObject = object;
            hoveredObject.geometry.attributes.color.array.set(hoveredObject.userData.hoverColorsArray);
            hoveredObject.geometry.attributes.color.needsUpdate = true;
            if (hoveredObject.userData.label) {
                hoveredObject.userData.label.style.filter = 'brightness(0) invert(1)'; // Altera a imagem para branco
            }
            if (hoveredObject.userData.desc) {
                hoveredObject.userData.desc.classList.add('active');
            }
        }
    } else {
        document.body.style.cursor = 'default';
        
        // Restaura a cor original se o mouse não estiver mais sobre nenhum objeto
        if (hoveredObject) {
            hoveredObject.geometry.attributes.color.array.set(hoveredObject.userData.originalColorsArray);
            hoveredObject.geometry.attributes.color.needsUpdate = true;
            if (hoveredObject.userData.label) {
                hoveredObject.userData.label.style.filter = ''; 
            }
            if (hoveredObject.userData.desc) {
                hoveredObject.userData.desc.classList.remove('active');
            }
            hoveredObject = null;
        }
    }
});

window.addEventListener('mouseleave', () => {
    mouse.set(-1000, -1000);
    document.body.style.cursor = 'default';
    
    // Garante que a cor seja restaurada quando o mouse sair da tela do navegador
    if (hoveredObject) {
        hoveredObject.geometry.attributes.color.array.set(hoveredObject.userData.originalColorsArray);
        hoveredObject.geometry.attributes.color.needsUpdate = true;
        if (hoveredObject.userData.label) {
            hoveredObject.userData.label.style.filter = ''; 
        }
        if (hoveredObject.userData.desc) {
            hoveredObject.userData.desc.classList.remove('active');
        }
        hoveredObject = null;
    }
});

// Evento de clique para redirecionar para as páginas individuais
window.addEventListener('click', () => {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(particles);
    
    if (intersects.length > 0 && intersects[0].object.userData.url) {
        window.location.href = intersects[0].object.userData.url;
    }
});

// 2. Lista para armazenar os sistemas de partículas para animação
const particles = [];
const loader = new GLTFLoader();

// Função auxiliar para carregar, converter em partículas e posicionar o modelo 3D
function loadModelAsParticles(path, color, positionX, positionY = 0, rotationX = 0, rotationY = 0, scale = 1, labelText = null, targetUrl = null, labelOffsetX = 0, descData = null) {
    // Criação do elemento HTML de TEXTO (substituindo o <img>)
    let labelElement = null;
    let descElement = null;
    if (labelText) {
        labelElement = document.createElement('span');
        labelElement.className = 'model-label';
        labelElement.innerText = labelText; // Aqui inserimos o texto
        document.body.appendChild(labelElement);
    }
    
    // Criação do elemento da descrição (imagem, título, texto)
    if (descData) {
        descElement = document.createElement('div');
        descElement.className = 'model-desc';
        descElement.style.color = '#000000'; // Força a cor do texto para preto
        descElement.innerHTML = `
            ${descData.image ? `<img src="${descData.image}" alt="${descData.title}">` : ''}
            <div class="desc-content">
                <h3 style="color: #000000;">${descData.title}</h3>
                <p style="color: #000000;">${descData.text}</p>
            </div>
        `;
        document.body.appendChild(descElement);
    }
    
    // ... (restante do código da função continua igual)

    loader.load(path, (gltf) => {
        // Encontrar a geometria original do arquivo
        const originalMesh = gltf.scene.children[0]; 
        const geometry = originalMesh.geometry;

        // Aplica a rotação inicial diretamente na geometria
        // Isso corrige a posição sem bagunçar o eixo Y usado na animação de giro
        if (rotationX !== 0) geometry.rotateX(rotationX);
        if (rotationY !== 0) geometry.rotateY(rotationY);

        // Configuração das Cores Individuais para as Partículas
        const count = geometry.attributes.position.count;
        const colors = new Float32Array(count * 3);
        const originalColorsArray = new Float32Array(count * 3);
        const hoverColorsArray = new Float32Array(count * 3);
        const baseColor = new THREE.Color(color);

        for (let i = 0; i < count; i++) {
            // Cor original (normalmente preto)
            originalColorsArray[i * 3] = baseColor.r;
            originalColorsArray[i * 3 + 1] = baseColor.g;
            originalColorsArray[i * 3 + 2] = baseColor.b;

            // Cor aleatória vibrante para o hover (Efeito multicolorido)
            const randColor = new THREE.Color();
            randColor.setHSL(Math.random(), 1.0, 0.5); // Matiz aleatória, saturação/brilho altos
            hoverColorsArray[i * 3] = randColor.r;
            hoverColorsArray[i * 3 + 1] = randColor.g;
            hoverColorsArray[i * 3 + 2] = randColor.b;
            
            // Inicia aplicando a cor original nos pontos
            colors[i * 3] = baseColor.r;
            colors[i * 3 + 1] = baseColor.g;
            colors[i * 3 + 2] = baseColor.b;
        }

        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        // Criar o Material de Pontos (Partículas)
        const pointsMaterial = new THREE.PointsMaterial({
            color: 0xffffff,      // Precisa ser branco para permitir a mistura com as cores dos vértices
            size: 0.025,          // Tamanho de cada ponto
            transparent: true,    // Permite transparência
            sizeAttenuation: true, // Pontos diminuem com a distância
            vertexColors: true    // Habilita as cores individuais
        });

        // Modificar o shader padrão do PointsMaterial para adicionar repulsão
        pointsMaterial.onBeforeCompile = (shader) => {
            shader.uniforms.uMousePos = { value: mousePos3D };
            
            shader.vertexShader = `
                uniform vec3 uMousePos;
            ` + shader.vertexShader;

            shader.vertexShader = shader.vertexShader.replace(
                `#include <project_vertex>`,
                `
                vec4 worldPosition = modelMatrix * vec4( transformed, 1.0 );
                
                float dist = distance(worldPosition.xyz, uMousePos);
                float maxDist = 1.0; // Raio da repulsão do mouse
                
                if (dist < maxDist) {
                    vec3 dir = normalize(worldPosition.xyz - uMousePos);
                    // Força diminui quadraticamente com a distância para um efeito mais suave
                    float force = pow((maxDist - dist) / maxDist, 2.0) * 0.8; 
                    worldPosition.xyz += dir * force;
                }
                
                vec4 mvPosition = viewMatrix * worldPosition;
                gl_Position = projectionMatrix * mvPosition;
                `
            );
        };

        // Criar o Objeto de Pontos em vez de Mesh
        const particleSystem = new THREE.Points(geometry, pointsMaterial);
        
        // Posicionar o modelo e alterar a escala caso necessário
        particleSystem.position.x = positionX;
        particleSystem.position.y = positionY;
        if (scale !== 1) {
            particleSystem.scale.set(scale, scale, scale);
        }
        
        // Armazena o elemento de texto dentro dos dados do objeto 3D para acessarmos na animação
        particleSystem.userData.label = labelElement;
        particleSystem.userData.desc = descElement;
        particleSystem.userData.url = targetUrl; // Armazena o link da página para o clique
        particleSystem.userData.originalColorsArray = originalColorsArray; // Armazena array de cor original
        particleSystem.userData.hoverColorsArray = hoverColorsArray; // Armazena array de cores aleatórias
        particleSystem.userData.labelOffsetX = labelOffsetX; // Armazena o deslocamento visual do nome no eixo X

        scene.add(particleSystem);
        particles.push(particleSystem);
    });
}

// 3. Carregar os modelos e colocá-los lado a lado (ajuste o positionX se necessário)
// Substituindo 'assets/Nome.png' pelo texto direto
loadModelAsParticles('3D/Who Corrodit.glb', 0x000000, -3.4, 1, 0, 0, 0.8, 'CORRODIT', 'corrodit.html', -20, {
    title: 'CORRODIT',
    text: 'Spot lights made for exterior that transform corrosism in art.',
    image: 'Imagens/corrodit 4.png'
});
loadModelAsParticles('3D/Who Breu.glb', 0x000000, -1.3, 1, Math.PI / 2, 4, 0.6, 'BREU', 'breu.html', 0, {
    title: 'BREU',
    text: 'A typography born from shadow, of the relation between Portugal and Turkey',
    image: 'Elements/Breu mockup 6.jpg'
});
loadModelAsParticles('3D/Who Ovar.glb', 0x000000, 0.9, 1, 0, 0, 1, 'OVAR', 'ovar.html', 0, {
    title: 'OVAR',
    text: 'A identity made for a theater in Ovar, Portugal, talking with memories ',
    image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=200&auto=format&fit=crop'
});
loadModelAsParticles('3D/Who Enklav.glb', 0x000000, 3.4, 1, 0, 0, 0.7, 'ENKLAV', 'enklav.html', 70, {
    title: 'ENKLAV',
    text: 'Camping kit made with metalsheets, to make pause in the modernity.',
    image: 'Imagens/Render Enklav 0020.jpg'
});

// 4. Posicionamento da câmera
camera.position.z = 5; // Aproxima a câmera (era 7)
camera.position.y = 1.0; // Ajusta levemente a altura para manter a proporção
camera.lookAt(scene.position); // Faz a câmera apontar de volta para o centro

// 5. Função de animação para girar os objetos
// --- 5. Criação das Partículas (Background) ---
const bgParticlesGeometry = new THREE.BufferGeometry();
const bgParticlesCount = 5000; // Quantidade de pontos 
const bgPosArray = new Float32Array(bgParticlesCount * 3);
const bgColorsArray = new Float32Array(bgParticlesCount * 3);

// Preenche o array com posições e cores aleatórias 
for (let i = 0; i < bgParticlesCount; i++) {
    // Espalha os pontos pela cena
    bgPosArray[i * 3] = (Math.random() - 0.5) * 15;
    bgPosArray[i * 3 + 1] = (Math.random() - 0.5) * 15;
    bgPosArray[i * 3 + 2] = (Math.random() - 0.5) * 15;

    // Cor aleatória para cada bolinha
    const randColor = new THREE.Color();
    randColor.setHSL(Math.random(), 1.0, 0.5);
    bgColorsArray[i * 3] = randColor.r;
    bgColorsArray[i * 3 + 1] = randColor.g;
    bgColorsArray[i * 3 + 2] = randColor.b;
}

bgParticlesGeometry.setAttribute('position', new THREE.BufferAttribute(bgPosArray, 3));
bgParticlesGeometry.setAttribute('color', new THREE.BufferAttribute(bgColorsArray, 3));

const bgParticlesMaterial = new THREE.PointsMaterial({
    size: 0.025,
    color: 0xffffff, // Precisa ser branco para permitir as cores por vértices
    transparent: true,
    vertexColors: true
});

const bgParticlesMesh = new THREE.Points(bgParticlesGeometry, bgParticlesMaterial);
scene.add(bgParticlesMesh);

const clock = new THREE.Clock(); // Relógio para a animação do fundo

// 6. Função de animação para girar os objetos e o fundo
const animate = function () {
    requestAnimationFrame(animate);
    
    // Atualiza a posição 3D do mouse usando o Raycaster
    raycaster.setFromCamera(mouse, camera);
    const intersect = raycaster.ray.intersectPlane(mousePlane, mousePos3D);
    if (!intersect) {
        // Se o mouse estiver fora do plano ou não houver interseção, joga o alvo para longe
        mousePos3D.set(-1000, -1000, -1000);
    }

    // Animação e Direção do Fundo baseada no Mouse
    const elapsedTime = clock.getElapsedTime();

    // Rotaciona o fundo constantemente
    bgParticlesMesh.rotation.y = elapsedTime * 0.04;

    // Altera a direção da rotação com base na posição do mouse 
    if (mouseX > 0) {
        bgParticlesMesh.rotation.x = -mouseY * (elapsedTime * 0.00001);
        bgParticlesMesh.rotation.y = mouseX * (elapsedTime * 0.00001);
    }

    // Gira todos os sistemas de partículas armazenados na lista
    particles.forEach(p => {
        p.rotation.y += 0.01;

        // Atualiza as coordenadas 2D do texto na tela com base na posição do objeto 3D
        if (p.userData.label || p.userData.desc) {
            const vector = new THREE.Vector3();
            p.getWorldPosition(vector);
            
            // Desloca o vetor para baixo para que o texto fique logo abaixo da malha do modelo
            // (Caso ache que o texto ficou muito colado ou distante, ajuste esse valor de 1.6)
            vector.y -= 1;
            
            vector.project(camera);
            
            const x = (vector.x * 0.5 + 0.5) * window.innerWidth + (p.userData.labelOffsetX || 0);
            const y = -(vector.y * 0.5 - 0.5) * window.innerHeight;
            
            if (p.userData.label) {
                p.userData.label.style.left = `${x}px`;
                p.userData.label.style.top = `${y}px`;
            }
        }
    });

    renderer.render(scene, camera);
};

animate();

// Ajustar o canvas se a janela for redimensionada
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
