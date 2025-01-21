const { connect, getShelfCoordinates, saveShelfCoordinates } = require('./db');
const THREE = require('three');

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
scene.add(directionalLight);

// Connect to MongoDB and load shelves
connect().then(async () => {
    const shelves = await getShelfCoordinates();
    shelves.forEach(({ x, z }) => {
        scene.add(createShelf(x, z));
    });

    // Render the scene
    animate();
}).catch(console.error);

// Function to create a shelf
function createShelf(x, z) {
    const shelfGroup = new THREE.Group();

    // Frame
    const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const frameGeometry = new THREE.BoxGeometry(1, 1, 1);
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    shelfGroup.add(frame);

    // Position the shelf
    shelfGroup.position.set(x, 0, z);
    return shelfGroup;
}

// Example function to save a new shelf coordinate
async function addNewShelf(x, z) {
    await saveShelfCoordinates(x, z);
    scene.add(createShelf(x, z));
}

// Add initial shelves
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