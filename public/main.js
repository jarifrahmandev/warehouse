import * as THREE from 'three';

// Create the scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xeeeeee);

// Camera
const camera = new THREE.PerspectiveCamera(
    75, 
    window.innerWidth / window.innerHeight, 
    0.1, 
    1000
);
camera.position.set(0, 50, 100);
camera.lookAt(0, 0, 0);

// Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 50, 30);
scene.add(directionalLight);

// Warehouse floor
const floorGeometry = new THREE.PlaneGeometry(100, 100);
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// Shelves
function createShelf(x, z) {
    const shelfGroup = new THREE.Group();

    // Frame
    const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const frameGeometry = new THREE.BoxGeometry(1, 10, 1);

    for (let i = -5; i <= 5; i += 10) {
        for (let j = -10; j <= 10; j += 20) {
            const frame = new THREE.Mesh(frameGeometry, frameMaterial);
            frame.position.set(x + j, 5, z + i);
            shelfGroup.add(frame);
        }
    }

    // Shelves
    const shelfMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
    const shelfGeometry = new THREE.BoxGeometry(20, 0.5, 10);

    for (let i = 2; i <= 8; i += 3) {
        const shelf = new THREE.Mesh(shelfGeometry, shelfMaterial);
        shelf.position.set(x, i, z);
        shelfGroup.add(shelf);
    }

    return shelfGroup;
}

scene.add(createShelf(-30, 0));
scene.add(createShelf(30, 0));
scene.add(createShelf(0, -30));
scene.add(createShelf(0, 30));

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
