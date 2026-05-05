import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// 0. Container
const container = document.getElementById('logo-container');

if (!container) {
    throw new Error('Container #logo-container not found!');
}

// 1. Cena
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
);

const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true
});

renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

// 2. Luz
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 8);
directionalLight.position.set(5, 5, 10);
scene.add(directionalLight);

// Luz de preenchimento (agora mais fraca, apenas para não deixar a sombra 100% preta)
const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
fillLight.position.set(-5, -5, 10);
scene.add(fillLight);

// 3. Loader
const loader = new GLTFLoader();
let model;
const originalColors = new Map();

loader.load(
    'Elements/Bruno Who is.glb',
    (gltf) => {
        model = gltf.scene;

        // Centraliza o modelo
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);

        const customColor = container.getAttribute('data-color');

        // Guarda as cores originais de cada malha
        model.traverse((child) => {
            if (child.isMesh) {
                if (customColor) {
                    child.material.color.set(customColor);
                }
                
                // Adiciona brilho e propriedades reflexivas ao material
                child.material.roughness = 0.15; // Mais liso, concentra os pontos de luz
                child.material.metalness = 0.4;  // Mais metálico, reflete mais as sombras e o ambiente
                originalColors.set(child.uuid, child.material.color.clone());
            }
        });

        scene.add(model);

        // Observer para mudar a cor dinamicamente se o atributo 'data-color' for alterado
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'data-color') {
                    const newColor = container.getAttribute('data-color');
                    if (model && newColor) {
                        model.traverse((child) => {
                            if (child.isMesh) {
                                child.material.color.set(newColor);
                                originalColors.set(child.uuid, child.material.color.clone());
                            }
                        });
                    }
                }
            });
        });
        observer.observe(container, { attributes: true });

        // Recalcula a caixa já centralizada
        const fittedBox = new THREE.Box3().setFromObject(model);

        // Usa esfera de contorno em vez de só dimensão máxima
        const sphere = fittedBox.getBoundingSphere(new THREE.Sphere());
        const radius = sphere.radius;

        // FOV vertical
        const fov = THREE.MathUtils.degToRad(camera.fov);

        // Distância para caber verticalmente
        let cameraZ = radius / Math.sin(fov / 2);

        // margem extra porque ele gira em todos os eixos
        cameraZ *= 1.15;

        camera.position.set(0, 0, cameraZ);
        camera.lookAt(0, 0, 0);

        camera.near = Math.max(0.01, cameraZ - radius * 3);
        camera.far = cameraZ + radius * 3;
        camera.updateProjectionMatrix();
    },
    undefined,
    (error) => {
        console.error('Erro ao carregar o modelo:', error);
    }
);

// 4. Animação
function animate() {
    requestAnimationFrame(animate);

    if (model) {
        model.rotation.y += 0.012;
    }

    renderer.render(scene, camera);
}

animate();

// 5. Resize
window.addEventListener('resize', () => {
    const width = container.clientWidth;
    const height = container.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
});

// 6. Efeito de Hover
container.addEventListener('mouseenter', () => {
    if (!model) return;

    model.traverse((child) => {
        if (child.isMesh) {
            // Cria uma cor HSL aleatória e vibrante
            const randomColor = new THREE.Color();
            randomColor.setHSL(Math.random(), 1.0, 0.6); // Matiz aleatória, saturação e brilho altos
            child.material.color.copy(randomColor);
        }
    });
});

container.addEventListener('mouseleave', () => {
    if (!model) return;

    model.traverse((child) => {
        if (child.isMesh && originalColors.has(child.uuid)) {
            // Restaura a cor original que foi guardada
            child.material.color.copy(originalColors.get(child.uuid));
        }
    });
});