// Example adjustments in script working.js
import * as THREE from '/three/build/three.module.js';
import { MTLLoader } from '/three/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from '/three/examples/jsm/loaders/OBJLoader.js';

// Your existing code using THREE, MTLLoader, and OBJLoader follows here

// Create the scene
const scene = new THREE.Scene();


// Set up texture loader and load background texture
const textureLoader = new THREE.TextureLoader();
scene.background = textureLoader.load('preview16.jpeg');

//scene.background = new THREE.Color('skyblue');


// Set up the camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5; // Started camera zoomed out


// Define variables for camera motion
const radius = 20; // increased radius for wider circular path
let angle = 0; // initialize angle for circular motion
let zoom = 0.0000001; // zooming in speed
const zoomAmplitude = 0.005; // range for zooming in and out
const speed = 0.001; // speed of the camera motion
const verticalAmplitude = 2; // amplitude of the vertical oscillation



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


// Function to add a mesh to the scene with random position, scale and rotation speed
function addRandomObject() {
  if (objMesh) {
    const clonedMesh = objMesh.clone();
    const scale = Math.random() * 0.5 + 0.5; // Update scale to be more varied
    clonedMesh.scale.set(scale, scale, scale);
    const positionOffset = 10; // Increased spread of position
    clonedMesh.position.set(
      (Math.random() - 0.5) * positionOffset * 2,
      (Math.random() - 0.5) * positionOffset,
      (Math.random() - 0.5) * positionOffset * 2
    );
    // Set random rotation speed
    clonedMesh.userData.rotationSpeed = Math.random() * 0.03 + 0.01;
    scene.add(clonedMesh);
  }
}


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
function animate() {
  requestAnimationFrame(animate);
  // Camera zoom in and out effect
  camera.position.z += zoom;
  if (camera.position.z > zoomAmplitude || camera.position.z < -zoomAmplitude) {
    zoom = -zoom; // reverse the zoom direction
  }
  // Circular and vertical oscillation of the camera
  angle += speed;
  camera.position.x = radius * Math.sin(angle);
  camera.position.y = radius * Math.sin(angle * 3) * 0.1; // vertical oscillation
  camera.lookAt(scene.position); // always look at the center of the scene
  // Rotate the main object mesh if it has been loaded
  if (objMesh) {
    objMesh.rotation.y += 0.01;
  }
  // Rotate all other objects
  scene.traverse(function(object) {
    if (object.isMesh && object !== objMesh) {
      object.rotation.y += object.userData.rotationSpeed || 0.01;
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