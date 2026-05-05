import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as CANNON from 'cannon-es';

const container = document.getElementById('physics-bg');

if (container) {
    // --- 1. Configuração da Cena (Three.js) ---
    const scene = new THREE.Scene();
    
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 15);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Luzes
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 6);
    directionalLight.position.set(5, 5, 10); // Movida mais para a frente
    scene.add(directionalLight);

    // Luz de preenchimento (agora mais fraca, apenas para não deixar a sombra 100% preta)
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
    fillLight.position.set(-5, -5, 10);
    scene.add(fillLight);

    // --- 2. Configuração do Mundo Físico (Cannon.js) ---
    const world = new CANNON.World({
        gravity: new CANNON.Vec3(0, -9.82, 0), // Gravidade apontando para baixo
    });

    // Materiais Físicos (Para controlar atrito e o "pulo")
    const defaultMaterial = new CANNON.Material('default');
    const defaultContactMaterial = new CANNON.ContactMaterial(defaultMaterial, defaultMaterial, {
        friction: 0.1,
        restitution: 0.5, // Resiliência (faz eles pularem ao bater)
    });
    world.addContactMaterial(defaultContactMaterial);

    // --- 3. Paredes Invisíveis (Para segurarem os objetos na tela) ---
    const planeShape = new CANNON.Plane();
    
    const floorBody = new CANNON.Body({ mass: 0, shape: planeShape, material: defaultMaterial });
    floorBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    world.addBody(floorBody);

    const leftWall = new CANNON.Body({ mass: 0, shape: planeShape, material: defaultMaterial });
    leftWall.quaternion.setFromEuler(0, Math.PI / 2, 0);
    world.addBody(leftWall);

    const rightWall = new CANNON.Body({ mass: 0, shape: planeShape, material: defaultMaterial });
    rightWall.quaternion.setFromEuler(0, -Math.PI / 2, 0);
    world.addBody(rightWall);

    // Barreiras frente e verso para impedir que caiam para fora da visão Z
    const backWall = new CANNON.Body({ mass: 0, shape: planeShape, material: defaultMaterial });
    backWall.position.z = -3;
    world.addBody(backWall);

    const frontWall = new CANNON.Body({ mass: 0, shape: planeShape, material: defaultMaterial });
    frontWall.quaternion.setFromEuler(0, Math.PI, 0);
    frontWall.position.z = 3;
    world.addBody(frontWall);

    // Ajusta o chão e paredes nas bordas exatas da câmera
    function updatePhysicsBoundaries() {
        const vFOV = THREE.MathUtils.degToRad(camera.fov);
        const height = 2 * Math.tan(vFOV / 2) * camera.position.z;
        const width = height * camera.aspect;

        floorBody.position.y = -height / 2;
        leftWall.position.x = -width / 2;
        rightWall.position.x = width / 2;
    }
    updatePhysicsBoundaries();

    const objectsToUpdate = [];

    // --- 4. Carregamento e Clone do Modelo ---
    const loader = new GLTFLoader();
    loader.load('Elements/Bruno Who is.glb', (gltf) => {
        const originalModel = gltf.scene;

        // Fator de escala: como você mencionou que estava grande, coloquei 0.5 (metade do tamanho).
        // Se a intenção era deixar ainda maior, basta mudar para 1.5, 2.0, etc.
        const scaleFactor = 2; 
        originalModel.scale.set(scaleFactor, scaleFactor, scaleFactor);

        // Centraliza a geometria na sua própria Bounding Box (importante para colisão funcionar bem)
        const box = new THREE.Box3().setFromObject(originalModel);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        originalModel.position.sub(center);

        const baseGroup = new THREE.Group();
        baseGroup.add(originalModel);

        // A caixa de colisão será do exato tamanho do modelo visual
        const shape = new CANNON.Box(new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2));

        let currentObjectCount = 0;
        const maxObjects = 240;

        // Função para gerar os elementos dinamicamente
        function spawnElements(count) {
            for (let i = 0; i < count; i++) {
                if (currentObjectCount >= maxObjects) return; // Bloqueia se atingiu o limite de 150

                const clone = baseGroup.clone();

                // Aplica uma cor HSL aleatória vibrante
                const randomColor = new THREE.Color();
                randomColor.setHSL(Math.random(), 0.8, 0.5);

                clone.traverse((child) => {
                    if (child.isMesh) {
                        child.material = child.material.clone();
                        child.material.color.copy(randomColor);
                        
                        // Deixa o material mais brilhante e reflexivo
                        child.material.roughness = 0.15; // Deixa a superfície mais lisa (0 = espelho, 1 = fosco)
                        child.material.metalness = 0.3;  // Aumenta a reflexão metálica (0 = plástico, 1 = metal puro)
                    }
                });

                scene.add(clone);

                // Cria o corpo de física para este objeto
                const body = new CANNON.Body({
                    mass: 1, // Torna dinâmico/sujeito à gravidade
                    shape: shape,
                    material: defaultMaterial,
                    position: new CANNON.Vec3(
                        (Math.random() - 0.5) * 8, // X aleatório
                        10 + Math.random() * 10,   // Y alto para cair da tela
                        (Math.random() - 0.5) * 2  // Z levemente distribuído
                    )
                });
                
                body.quaternion.setFromEuler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
                
                world.addBody(body);
                objectsToUpdate.push({ mesh: clone, body: body });
                currentObjectCount++;
            }
        }

        // Cai os primeiros 10 elementos assim que a página carrega
        spawnElements(20);

        // Captura a digitação do usuário no formulário para fazer chover mais modelos
        const inputs = document.querySelectorAll('.input-group input, .input-group textarea');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                // A cada nova letra digitada, caem mais 2 elementos
                spawnElements(2);
            });
        });

        // Captura o clique no botão "Contact Us" para derrubar o restante
        const submitBtn = document.querySelector('.submit-btn');
        if (submitBtn) {
            submitBtn.addEventListener('click', (e) => {
                e.preventDefault(); // Evita que a página recarregue imediatamente
                const remaining = maxObjects - currentObjectCount;
                if (remaining > 0) {
                    spawnElements(remaining); // Faz cair todos os que faltam
                }
            });
        }
    });

    // --- 5. Loop de Animação ---
    const clock = new THREE.Clock();
    let oldElapsedTime = 0;

    function animate() {
        requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();
        const deltaTime = elapsedTime - oldElapsedTime;
        oldElapsedTime = elapsedTime;

        // Atualiza a física e transfere as coordenadas para o visual do Three.js
        world.step(1 / 60, Math.min(deltaTime, 0.1), 3);
        for (const object of objectsToUpdate) {
            object.mesh.position.copy(object.body.position);
            object.mesh.quaternion.copy(object.body.quaternion);
        }
        renderer.render(scene, camera);
    }
    animate();
}