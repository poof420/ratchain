import * as THREE from 'three';
import { MTLLoader } from 'MTLLoader';
import { OBJLoader } from 'OBJLoader';
import { Physics, RigidBody } from 'three-ammo';

const mtlLoader = new MTLLoader();

// Create the scene
const scene = new THREE.Scene();

// Set up the camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// Set up the renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add a light source
const light = new THREE.AmbientLight(0xffffff, 0.5); // Soft white light
scene.add(light);
// Additional directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(0, 1, 0);
scene.add(directionalLight);

let objMesh, physics;

// Function to initialize Ammo.js physics
async function initPhysics() {
  console.log("Initializing physics.");

  await Physics();

  // Create physics world
  physics = new Physics({ maxSubSteps: 10 });

  // Create a ground plane using a rigid body
  const groundGeometry = new THREE.PlaneGeometry(100, 100);
  const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x226622 });
  const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
  groundMesh.rotation.x = -Math.PI / 2; // Rotate the mesh instead of the rigidBody
  groundMesh.position.y = -1;

  scene.add(groundMesh);  // Add the ground mesh to the scene

  const groundBody = new RigidBody({
    mass: 0, // Static body
    shape: 'box',
    mesh: groundMesh,
    scene: scene,
  });

  physics.addMesh(groundMesh, 0); // Add ground mesh to physics world with 0 mass (static)

  return physics;
}

// Drop an object onto the scene floor every 2 seconds
function dropObjects(physics) {
  console.log("Dropping objects.");

  setInterval(() => {
    if (objMesh) {
      // Clone the mesh for a new dropping object
      const objMeshClone = objMesh.clone();
      scene.add(objMeshClone);  // Add the clone to the scene

      // Create a rigid body for the object
      const rigidBody = new RigidBody({
        mass: 1,
        shape: 'convexHull',
        mesh: objMeshClone,
        scene: scene,
      });
      console.log("Object mesh added to scene.");

      physics.addMesh(objMeshClone, 1); // Add the clone to the physics world with 1 mass (dynamic)

      // Set the initial position of the object
      rigidBody.mesh.position.set(0, 10, 0); // Drop from 10 units above the ground
    }
  }, 2000); // Repeat every 2000 milliseconds (2 seconds)
}

// Initialize both the physics and set up dropping objects when the model is loaded
mtlLoader.load('figurine.mtl', materials => {
  materials.preload();
  const objLoader = new OBJLoader();
  objLoader.setMaterials(materials);
  objLoader.load('figurine.obj', object => {
    console.log("Model loaded.");
    objMesh = object;
    objMesh.scale.set(0.5, 0.5, 0.5); // Preserved existing scale
    objMesh.position.set(0, 0, 0); // Preserved existing position
    scene.add(objMesh);

    // Initialize physics and start dropping objects
    initPhysics().then(p => {
      physics = p;
      dropObjects(physics);
    });

    animate();
  });
});

// Modified animate function to include physics update
function animate() {
  console.log("Animating frame.");

  requestAnimationFrame(animate);

  if (physics) {
    physics.update(1 / 60); // Update the physics world
  }
  console.log("Rendering frame.");
  renderer.render(scene, camera);
}

// Ensure the renderer and any other components handle resizes:
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}


// Temporary code to make sure Three.js is rendering
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);
animate();  // make sure this is still being called