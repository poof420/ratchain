import * as THREE from 'three';
import { MTLLoader } from 'MTLLoader';
import { OBJLoader } from 'OBJLoader';

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

// Create an MTLLoader instance
const mtlLoader = new MTLLoader();
let objMesh; // Reference to the loaded object mesh
// Load the OBJ file
mtlLoader.load('figurine.mtl', materials => {
  materials.preload();
  const objLoader = new OBJLoader();
  objLoader.setMaterials(materials);
  objLoader.load('figurine.obj', object => {
    objMesh = object;
    // Set the scale of the object
    objMesh.scale.set(0.5, 0.5, 0.5); // Adjust x, y, z scale to make it smaller
    // Set the position of the object
    objMesh.position.set(0, 0, 0); // Center the object
    scene.add(objMesh);
    console.log('Object added to scene!');
    animate(); // Start the animation loop when the object is loaded
  });
});





// The animation loop
// Update the animate function to include rotation of all random objects
function animate() {
  requestAnimationFrame(animate);
  // Rotate the main object mesh if it has been loaded
  if (objMesh) {
    objMesh.rotation.y += 0.01;
  }
  // Rotate all other objects
  scene.traverse(function(object) {
    if (object.isMesh && object.userData.rotationSpeed) {
      object.rotation.y += object.userData.rotationSpeed;
    }
  });
  renderer.render(scene, camera);
}

// Ensure the renderer and any other components handle resizes:
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}


// Add event listener to button
document.getElementById('addObjectButton').addEventListener('click', addRandomObject);
// Function to add a random object to the scene
function addRandomObject() {
  // Create a random geometry
  const geometryTypes = [THREE.BoxGeometry, THREE.SphereGeometry, THREE.ConeGeometry];
  const randomGeometry = new geometryTypes[Math.floor(Math.random() * geometryTypes.length)](0.1, 0.1, 0.1);
  // Create a material with a random color
  const material = new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff });
  // Create a mesh and set its random position and scale
  const mesh = new THREE.Mesh(randomGeometry, material);
  mesh.position.set((Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5);
  mesh.scale.set(Math.random() * 0.5, Math.random() * 0.5, Math.random() * 0.5);
  // Optional: set a random rotation speed
  mesh.userData.rotationSpeed = Math.random() * 0.02;
  // Add mesh to the scene
  scene.add(mesh);
}




