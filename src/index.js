import * as THREE from "three";
import { WebGLRenderer, Scene, Camera } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Matrix4, Vector3 } from "three";
import * as dat from "dat.gui";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import Flat from "./objects/Flat.gltf";
import FlatImg from "./objects/HouseTexture1.png";
var renderer, camera, scene, controls;
var plane, cube;
var cityWidth = 1300;
var cityLength = 1300;
var t = 0;
var pathsArray = [];
var isBlobGoingBack = false;
var daysPassed = 0;
var probability = function (n) {
  return !!n && Math.random() * 100 <= n;
};
var showPaths = false;
const control = {
  play: true,
  tSpeed: 0.001,
  peopleCount: 100,
  infectedBlobs: 10,
  contactedWithBlobs: 10,
  infectionChance: 5,
  showPaths: false,
  reload: function () {
    this.play = false;
    resetBlobs();
    pathsArray = [];
    generatePopulation();
    this.play = true;
  },
  stopAnimation: function () {
    this.play = !this.play;
    if (this.play) animate();
  },
};

init();
generatePopulation();
initControls();

animate();

function init() {
  document.querySelector(".counter").innerHTML = control.infectedBlobs;
  // SECTION: Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setClearColor(new THREE.Color(0xb0b0b0));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  // invalidation.then(() => renderer.dispose());
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.appendChild(renderer.domElement);

  // SECTION: Scene & Camera
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    15000
  );
  // camera.position.set(1000, 50, 1500);
  scene.add(camera);

  // SECTION: Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = false;

  controls.maxPolarAngle = Math.PI * 0.45;
  controls.minPolarAngle = Math.PI * 0.0;
  controls.minDistance = 50;
  controls.maxDistance = 5000;

  // NOTE: Skybox
  var skyBoxGeometry = new THREE.CubeGeometry(10000, 10000, 10000);
  var skyBoxMaterial = new THREE.MeshBasicMaterial({
    color: 0xf2f2f2,
    side: THREE.BackSide,
  });
  var skyBox = new THREE.Mesh(skyBoxGeometry, skyBoxMaterial);
  scene.add(skyBox);
  scene.fog = new THREE.Fog(skyBoxMaterial.color, 1000, 4000);

  // NOTE: Plane
  var planeGeometry = new THREE.PlaneBufferGeometry(1300, 1300);
  // NOTE Shift the plane
  // planeGeometry.applyMatrix4(new THREE.Matrix4().makeTranslation(50, -50, 0));
  var planeMaterial = new THREE.MeshStandardMaterial({
    color: 0x474747,
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
  light.position.set(-500, 1000, -300);

  light.shadow.camera.near = 50;
  light.shadow.camera.far = 2000;
  light.shadow.camera.left = -2000;
  light.shadow.camera.right = 2000;
  light.shadow.camera.top = 2000;
  light.shadow.camera.bottom = -2000;

  light.castShadow = true;
  light.shadow.mapSize.height = 3096;
  light.shadow.mapSize.width = 3096;
  // light.shadowCameraVisible = true;
  scene.add(light);

  // Helpers
  // const axesHelper = new THREE.AxesHelper(800);
  // scene.add(axesHelper);
  // var helperCamera = new THREE.CameraHelper(light.shadow.camera);
  // scene.add(helperCamera);
  // var helper = new THREE.DirectionalLightHelper(light, 10, 0xff1c1c);
  // scene.add(helper);

  // SECTION City Generation
  scene.add(generateCity(cityWidth, cityLength));

  camera.position.y = 1300;
  camera.position.z = 600;
  camera.position.x = 0;

  window.addEventListener("resize", onWindowResize, false);
}

function resetBlobs() {
  pathsArray.forEach((e) => {
    e.sphere.parent.remove(e.sphere);
  });
  pathsArray = null;
  pathsArray = [];
}

function animate() {
  if (!control.play) return;

  requestAnimationFrame(animate);
  controls.update();
  render();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  // effect.setSize(window.innerWidth, window.innerHeight);
}

// function generateCity(cityWidth, cityLength) {
//   var districtMinSize = 50;
//   var gridWidth = Math.floor(cityWidth / districtMinSize);
//   var gridLength = Math.floor(cityLength / districtMinSize);
//   var cityGrid = generateCityGrid(gridWidth, gridLength, districtMinSize);

//   // Creating districts
//   var cityGeometry = new THREE.Geometry();
//   var value = 0;

//   for (var i = 0; i < gridWidth; i++) {
//     for (var j = 0; j < gridLength; j++) {
//       if (cityGrid[i][j] == value) {
//         for (var k = i; k < gridWidth; k++) {
//           if (cityGrid[k][j] != value) {
//             break;
//           }
//         }
//         var districtWidth = k - i;

//         for (var k = j + 1; k < gridLength; k++) {
//           if (cityGrid[i][k] != value) {
//             break;
//           }
//         }
//         var districtLength = k - j;

//         for (var k = 0; k < districtWidth; k++) {
//           for (var l = 0; l < districtLength; l++) {
//             cityGrid[k + i][l + j] = 1;
//           }
//         }

//         districtWidth *= districtMinSize;
//         districtLength *= districtMinSize;

//         var districtHeight = generateDistrictHeightRange();

//         // console.log("District. Width: " + districtWidth + " Length " + districtLength)
//         var district = generateDistrict(
//           districtWidth,
//           districtLength,
//           districtHeight.x,
//           districtHeight.y
//         );
//         district.applyMatrix4(
//           new THREE.Matrix4().makeTranslation(
//             i * districtMinSize,
//             0,
//             j * districtMinSize
//           )
//         );

//         // NOTE Deprecated function
//         THREE.GeometryUtils.merge(cityGeometry, district);
//         // cityGeometry.merge(district);
//       }
//     }
//   }

//   var material = new THREE.MeshLambertMaterial({
//     vertexColors: THREE.VertexColors,
//   });
//   var mesh = new THREE.Mesh(cityGeometry, material);
//   mesh.castShadow = true;
//   mesh.receiveShadow = true;

//   mesh.applyMatrix4(
//     new THREE.Matrix4().makeTranslation(-cityWidth / 2, 0, -cityLength / 2)
//   );
//   mesh.matrixAutoUpdate = false;
//   return mesh;
// }

function generateCityGrid(gridWidth, gridLength, districtMinSize) {
  var cityGrid = new Array();

  // Initialize city grid as an Array
  for (var i = 0; i < gridWidth; i++) {
    cityGrid[i] = new Array();
    for (var j = 0; j < gridLength; j++) {
      cityGrid[i][j] = 0;
    }
  }

  var districtScale = 4;

  // Horizontal Routes
  for (var i = 0; i < gridWidth - 0; i += districtScale + 1) {
    for (var j = 0; j < gridLength - 0; j++) {
      cityGrid[i][j] = 1;
    }
  }

  // Vertical Routes
  for (var i = 0; i < gridWidth - 0; i += districtScale + 1) {
    for (var j = 0; j < gridLength - 0; j++) {
      cityGrid[j][i] = 1;
    }
  }
  // NOTE IDK Why I am doing this.

  return cityGrid;
}

function generateDistrictHeightRange() {
  var ranges = new Array();
  var i = 0;
  // ranges[i++] = new THREE.Vector2(30, 60); // Very small
  // ranges[i++] = new THREE.Vector2(50, 90); // Small
  ranges[i++] = new THREE.Vector2(80, 130); // Medium
  ranges[i++] = new THREE.Vector2(100, 200); // Medium-tall
  ranges[i++] = new THREE.Vector2(90, 250); // Tall

  return ranges[randomInt(0, i)];
}

function generateDistrict(width, length, minHeight, maxHeight) {
  var districtGeometry = new THREE.Geometry();
  var rowWidth = 0;
  var rowLength = 0;
  var totalLength = 0;

  for (var j = 0; j < length; j += 5) {
    if (length - j < 45) break;

    var rowGeometry = new THREE.Geometry();
    for (var i = 0; i < width; i += 5) {
      if (width - i < 45) break;
      var building = generateBuilding(length - j, minHeight, maxHeight);

      var floorWidth = Math.floor(80 / 5) * 5 + 5;
      var floorLength = Math.floor(80 / 5) * 5 + 5;
      if (floorLength > rowLength) rowLength = floorLength;
      building.Mesh.position.x = i + floorWidth / 2.0;
      building.Mesh.position.z = j + rowLength / 2.0;
      // NOTE Deprecated
      THREE.GeometryUtils.merge(rowGeometry, building.Mesh);

      i += floorWidth;
      rowWidth = i;
    }

    rowGeometry.applyMatrix4(
      new THREE.Matrix4().makeTranslation((width - rowWidth) / 2.0, 0, 0)
    );
    // NOTE Deprecated
    THREE.GeometryUtils.merge(districtGeometry, rowGeometry);
    // districtGeometry.merge(rowGeometry);

    j += rowLength;
    totalLength = j;

    rowWidth = 0;
    rowLength = 0;
  }

  districtGeometry.applyMatrix4(
    new Matrix4().makeTranslation(0, 0, (length - totalLength) / 2.0)
  );

  var planeGeometry = new THREE.PlaneGeometry(width, length);
  var planeMaterial = new THREE.MeshLambertMaterial();
  var plane = new THREE.Mesh(planeGeometry, planeMaterial);

  var planeColor = new THREE.Color(0xc8c8c8);
  plane.geometry.faces[0].vertexColors = [planeColor, planeColor, planeColor];
  plane.geometry.faces[1].vertexColors = [planeColor, planeColor, planeColor];

  plane.rotation.x = -0.5 * Math.PI;
  plane.position.x = width / 2;
  plane.position.y = 1;
  plane.position.z = length / 2;

  // NOTE Deprecated
  THREE.GeometryUtils.merge(districtGeometry, plane);
  // districtGeometry.merge(plane);

  var material = new THREE.MeshLambertMaterial({
    vertexColors: THREE.VertexColors,
  });
  var mesh = new THREE.Mesh(districtGeometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  return mesh;
}

function generateBuilding(bldgMaxWidth, bldgMinHeight, bldgMaxHeight) {
  var minWidth = 80;
  var maxWidth = 80;

  bldgMaxWidth =
    bldgMaxWidth < minWidth
      ? minWidth
      : bldgMaxWidth > maxWidth
      ? maxWidth
      : bldgMaxWidth;

  var width = random(minWidth, bldgMaxWidth);
  var height = random(bldgMinHeight, bldgMaxHeight);
  var length = width;

  // Building creation
  var geometry = new THREE.BoxGeometry(width, height, length);
  geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, height / 2, 0));

  var material = new THREE.MeshLambertMaterial({
    color: 0xffffff,
    vertexColors: THREE.VertexColors,
  });
  var mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  var light = new THREE.Color(0xe8e8e8); // 0xFFFFFF
  var shadow = new THREE.Color(0x606060); // 0x707070

  var value = 1 - Math.random() * Math.random() * Math.random();
  var fade = 1.5; // 0x3DA2EF
  var baseColor = new THREE.Color().setRGB(
    value /*+ Math.random()*/ * fade,
    value /*+ Math.random()*/ * fade,
    value /*+ Math.random()*/ * fade
  );
  var topColor = baseColor.clone().multiply(light);
  var bottomColor = baseColor.clone().multiply(shadow);

  // var random_building_color = Math.random() * Math.random() * Math.random();

  // if (random_building_color > 0.65) {
  //   baseColor = new THREE.Color().setRGB(0.9, 0.2, 0.2);
  //   topColor = baseColor.clone().multiply(light);
  //   bottomColor = baseColor.clone().multiply(shadow);
  // }

  var faces = mesh.geometry.faces;
  var i = 0;

  // Front face
  faces[i++].vertexColors = [topColor, bottomColor, topColor];
  faces[i++].vertexColors = [bottomColor, bottomColor, topColor];

  // Back face
  faces[i++].vertexColors = [topColor, bottomColor, topColor];
  faces[i++].vertexColors = [bottomColor, bottomColor, topColor];

  // Top face
  faces[i++].vertexColors = [baseColor, baseColor, baseColor];
  faces[i++].vertexColors = [baseColor, baseColor, baseColor];

  // Bottom face
  i += 2;

  // Left face
  faces[i++].vertexColors = [topColor, bottomColor, topColor];
  faces[i++].vertexColors = [bottomColor, bottomColor, topColor];

  // Right face
  faces[i++].vertexColors = [topColor, bottomColor, topColor];
  faces[i++].vertexColors = [bottomColor, bottomColor, topColor];

  mesh.geometry.faces = faces;

  return new Building(width, height, length, mesh);
}

function Building(Width, Height, Length, Mesh) {
  this.Width = Width;
  this.Height = Height;
  this.Length = Length;
  this.Mesh = Mesh;
}

function generateCity(cityWidth, cityLength) {
  var blockSize = 50;
  var xDistricts = Math.floor(cityWidth / (4 * blockSize + blockSize));
  var yDistricts = Math.floor(cityLength / (4 * blockSize + blockSize));
  for (var i = 0; i < yDistricts; i++) {
    for (var j = 0; j < xDistricts; j++) {
      var xOffset = j * 250 + blockSize + (15 + 40);
      var yOffset = i * 250 + blockSize + (15 + 40);
      for (var k = 1; k <= 4; k++) {
        var xShift = isHouseLeft(k) ? 0 : 90;
        var yShift = isHouseUpper(k) ? 0 : 90;
        var matrix = new THREE.Matrix4().makeTranslation(
          xOffset + xShift,
          0,
          yOffset + yShift
        );
        generateFlat(matrix);
      }
    }
  }
}
function generateFlat(matrix) {
  var matrixGlobal = new THREE.Matrix4().makeTranslation(
    -cityWidth / 2,
    0,
    -cityLength / 2
  );
  // var single = new THREE.Geometry();
  var loader = new GLTFLoader();

  var newMaterial = new THREE.MeshLambertMaterial({
    color: 0xffffff,
  });
  var textureLoader = new THREE.TextureLoader();
  var texture = textureLoader.load(FlatImg);

  loader.load(
    Flat,
    function (gltf) {
      var flat = gltf.scene.children[0];

      gltf.scene.traverse(function (child) {
        if (child.isMesh) {
          child.material = newMaterial;
          child.material.map = texture;
          child.receiveShadow = true;
          child.castShadow = true;
        }
      });
      flat.visible = true;
      // flat.geometry.center();
      flat.applyMatrix4(matrix);
      flat.applyMatrix4(matrixGlobal);
      // flat.updateMatrix();
      flat.scale.set(30, 30, 30);
      scene.add(flat);
    },
    undefined,
    function (error) {
      console.error(error);
    }
  );
}

function random(min, max) {
  return min + Math.random() * (max - min);
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

// SECTION City Graph Creation
function generatePopulation() {
  for (var i = 0; i < control.peopleCount; i++) {
    var src = randomHouse();
    var dst = randomHouse();
    generatePath(src, dst);
  }
  pathsArray.forEach((e) => {
    if (control.showPaths) scene.add(e.line);
    scene.add(e.sphere);
  });
  for (var i = 0; i < control.infectedBlobs; i++) {
    pathsArray[i].sphere.material.color = new THREE.Color(0xef233c);
    pathsArray[i].isInfected = true;
  }
}
function generatePath(src, dst) {
  var matrix = new THREE.Matrix4().makeTranslation(
    -cityWidth / 2,
    0,
    -cityLength / 2
  );
  var pointsPath = new THREE.CurvePath();

  var srcX = src[0] % 5 == 0 ? 5 : src[0] % 5;
  var srcY = src[0] % 5 == 0 ? src[0] / 5 : Math.floor(src[0] / 5) + 1;
  var dstX = dst[0] % 5 == 0 ? 5 : dst[0] % 5;
  var dstY = dst[0] % 5 == 0 ? dst[0] / 5 : Math.floor(dst[0] / 5) + 1;

  var s1 = new THREE.Vector3(25 + 250 * (srcX - 1), 5, 25 + 250 * (srcY - 1));
  s1.setX(isHouseLeft(src[1]) ? s1.x : s1.x + 250);
  s1.setZ(isHouseUpper(src[1]) ? s1.z + 80 : s1.z + 170);
  var s01 = new THREE.Vector3(25 + 250 * (srcX - 1), 5, s1.z);
  s01.setX(isHouseLeft(src[1]) ? s1.x + 80 : s1.x - 80);
  var s2 = new THREE.Vector3(s1.x, 5, 25 + 250 * srcY);

  var d1 = new THREE.Vector3(25 + 250 * (dstX - 1), 5, 25 + 250 * (dstY - 1));
  d1.setX(isHouseLeft(dst[1]) ? d1.x : d1.x + 250);
  d1.setZ(isHouseUpper(dst[1]) ? d1.z + 80 : d1.z + 170);
  var d01 = new THREE.Vector3(25 + 250 * (dstX - 1), 5, d1.z);
  d01.setX(isHouseLeft(dst[1]) ? d1.x + 80 : d1.x - 80);
  var d2 = new THREE.Vector3(d1.x, 5, 25 + 250 * dstY);

  var m1 = new THREE.Vector3(25 + 250 * (randomInt(srcX, dstX) - 1), 5, s2.z);
  var m2 = new THREE.Vector3(m1.x, 5, d2.z);
  s01.applyMatrix4(matrix);
  d01.applyMatrix4(matrix);
  s1.applyMatrix4(matrix);
  s2.applyMatrix4(matrix);
  d1.applyMatrix4(matrix);
  d2.applyMatrix4(matrix);
  m1.applyMatrix4(matrix);
  m2.applyMatrix4(matrix);

  pointsPath.add(new THREE.LineCurve3(s01, s1));
  pointsPath.add(new THREE.LineCurve3(s1, s2));
  pointsPath.add(new THREE.LineCurve3(s2, m1));
  pointsPath.add(new THREE.LineCurve3(m1, m2));
  pointsPath.add(new THREE.LineCurve3(m2, d2));
  pointsPath.add(new THREE.LineCurve3(d2, d1));
  pointsPath.add(new THREE.LineCurve3(d1, d01));
  var points = pointsPath.curves.reduce(
    (p, d) => [...p, ...d.getPoints(20)],
    []
  );

  var lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
  var lineMaterial = new THREE.LineBasicMaterial({ color: 0xfff2af });
  var road = new THREE.Line(lineGeometry, lineMaterial);
  road.castShadow = true;

  pathsArray.push({
    line: road,
    points: pointsPath,
    sphere: generateBlob(),
    isInfected: false,
  });
}

function generateBlob() {
  var geometry = new THREE.SphereGeometry(8, 32, 32);
  var material = new THREE.MeshBasicMaterial({
    color: 0x3792cb,
    transparent: true,
    opacity: 0.9,
  });
  var sphere = new THREE.Mesh(geometry, material);
  sphere.name = "blob";
  sphere.castShadow = true;
  sphere.receiveShadow = true;
  return sphere;
}

function randomHouse() {
  return [
    Math.floor(Math.random() * Math.floor(25)) + 1,
    Math.floor(Math.random() * Math.floor(4)) + 1,
  ];
}

function isHouseLeft(index) {
  if (index % 2 == 1) {
    return true;
  } else return false;
}
function isHouseUpper(index) {
  if (index <= 2) {
    return true;
  } else return false;
}

function render() {
  pathsArray.forEach((e) => {
    var newPos = e.points.getPoint(t);
    e.sphere.position.set(newPos.x, newPos.y, newPos.z);
  });
  if (t - control.tSpeed <= 0 && isBlobGoingBack) {
    isBlobGoingBack = false;
    daysPassed += 1;
    infectBlobs();
  } else if (t + control.tSpeed >= 1 && !isBlobGoingBack) {
    isBlobGoingBack = true;
  }
  t = isBlobGoingBack ? t - control.tSpeed : t + control.tSpeed;
  renderer.render(scene, camera);
}

function infectBlobs() {
  var initInfectedBlobs = control.infectedBlobs;
  for (var i = 0; i < initInfectedBlobs; i++) {
    for (var j = 1; j < control.contactedWithBlobs; j++) {
      if (probability(control.infectionChance)) {
        var blobIndex = randomInt(0, pathsArray.length - 1);
        if (pathsArray[blobIndex].isInfected == false) {
          pathsArray[blobIndex].sphere.material.color = new THREE.Color(
            0xef233c
          );
          pathsArray[blobIndex].isInfected = true;
          control.infectedBlobs += 1;
          document.querySelector(".counter").innerHTML = control.infectedBlobs;
        }
      }
    }
  }
}

function initControls() {
  var gui = new dat.GUI({ width: 500 });
  var populationSetings = gui.addFolder("Population");
  populationSetings
    .add(control, "peopleCount", 50, 500, 2)
    .name("Population (Reload)");
  populationSetings
    .add(control, "tSpeed", 0.0005, 0.01, 0.000095)
    .name("Blob Speed");
  populationSetings.open();

  var infectionSettings = gui.addFolder("Disease Spread");
  infectionSettings
    .add(control, "infectedBlobs", 1, 50, 1)
    .name("Infected Blobs");
  infectionSettings
    .add(control, "infectionChance", 1, 50, 1)
    .name("Infection Chance (%)");
  infectionSettings
    .add(control, "contactedWithBlobs", 1, 50, 1)
    .name("Physical contacts per blob");
  var controls = gui.addFolder("Controls");
  controls.add(control, "showPaths").name("Show paths (Reload)");
  controls.add(control, "stopAnimation").name("Play/Stop Simulation");
  controls.add(control, "reload").name("Reload");
  controls.open();
}
