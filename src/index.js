import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

var renderer, camera, scene, controls;
var plane, cube;

init();
animate();

function init() {
  // SECTION: Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setClearColor(new THREE.Color(0xb0b0b0));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.appendChild(renderer.domElement);

  // SECTION: Scene & Camera
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    10000
  );
  // camera.position.set(1000, 50, 1500);
  scene.add(camera);

  // SECTION: Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.maxPolarAngle = Math.PI * 0.5;
  controls.minDistance = 10;
  controls.maxDistance = 5000;

  // NOTE: Skybox
  var skyBoxGeometry = new THREE.CubeGeometry(10000, 10000, 10000);
  var skyBoxMaterial = new THREE.MeshBasicMaterial({
    color: 0xf2f2f2,
    side: THREE.BackSide,
  });
  var skyBox = new THREE.Mesh(skyBoxGeometry, skyBoxMaterial);
  scene.add(skyBox);
  scene.fog = new THREE.Fog(skyBoxMaterial.color, 900, 4000);

  // NOTE: Plane
  var planeGeometry = new THREE.PlaneBufferGeometry(1000, 1000);
  var planeMaterial = new THREE.MeshStandardMaterial({
    color: 0xced4da,
    polygonOffset: true,
    polygonOffsetFactor: 5,
    side: THREE.DoubleSide,
  });
  plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.receiveShadow = true;
  plane.rotation.x = -Math.PI / 2;
  scene.add(plane);

  // NOTE Light
  var ambientLight = new THREE.AmbientLight(0x787878);
  scene.add(ambientLight);

  var light = new THREE.DirectionalLight(0xffffff, 0.8);
  light.position.set(-500, 600, 300);
  scene.add(light);

  light.shadow.camera = new THREE.OrthographicCamera(
    -100,
    100,
    100,
    -100,
    0.5,
    2000
  );
  light.castShadow = true;
  light.shadow.mapSize.height = 3096;
  light.shadow.mapSize.width = 3096;
  light.shadowCameraVisible = true;

  // Helpers
  // var helperCamera = new THREE.CameraHelper(light.shadow.camera);
  // scene.add(helperCamera);
  // var helper = new THREE.DirectionalLightHelper(light, 10, 0xff1c1c);
  // scene.add(helper);

  // Reference Material
  var geometry = new THREE.BoxGeometry(30, 30, 30);
  var material = new THREE.MeshLambertMaterial({ color: 0xadb5bd });
  cube = new THREE.Mesh(geometry, material);
  cube.castShadow = true;
  cube.receiveShadow = false;
  cube.position.y = 15;
  scene.add(cube);

  camera.position.z = 50;
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
