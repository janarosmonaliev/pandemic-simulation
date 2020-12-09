import * as THREE from "three";
import { WebGLRenderer, Scene, Camera } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Matrix4, Vector3 } from "three";
// import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
// import Flat from "./objects/Flat.gltf";
// import FlatImg from "./objects/HouseTexture1.png";
var renderer, camera, scene, controls;
var plane, cube;
var cityWidth = 1300;
var cityLength = 1300;
var t = 0;
var pathsArray = []

init();
generateGraph();
animate();

function init() {
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
    60,
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
  scene.fog = new THREE.Fog(skyBoxMaterial.color, 1500, 4000);

  // NOTE: Plane
  var planeGeometry = new THREE.PlaneBufferGeometry(1300, 1300);
  // NOTE Shift the plane
  // planeGeometry.applyMatrix4(new THREE.Matrix4().makeTranslation(50, -50, 0));
  var planeMaterial = new THREE.MeshStandardMaterial({
    color: 0xa1a1a1,
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
  const axesHelper = new THREE.AxesHelper(1000);
  scene.add(axesHelper);
  // var helperCamera = new THREE.CameraHelper(light.shadow.camera);
  // scene.add(helperCamera);
  // var helper = new THREE.DirectionalLightHelper(light, 10, 0xff1c1c);
  // scene.add(helper);

  // SECTION City Generation
  scene.add(generateCity(cityWidth, cityLength));

  camera.position.y = 1000;
  camera.position.z = 1000;
  camera.position.x = 1000;

  window.addEventListener("resize", onWindowResize, false);
}

function animate() {
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

function generateCity(cityWidth, cityLength) {
  var districtMinSize = 50;
  var gridWidth = Math.floor(cityWidth / districtMinSize);
  var gridLength = Math.floor(cityLength / districtMinSize);
  var cityGrid = generateCityGrid(gridWidth, gridLength, districtMinSize);

  // Creating districts
  var cityGeometry = new THREE.Geometry();
  var value = 0;

  for (var i = 0; i < gridWidth; i++) {
    for (var j = 0; j < gridLength; j++) {
      if (cityGrid[i][j] == value) {
        for (var k = i; k < gridWidth; k++) {
          if (cityGrid[k][j] != value) {
            break;
          }
        }
        var districtWidth = k - i;

        for (var k = j + 1; k < gridLength; k++) {
          if (cityGrid[i][k] != value) {
            break;
          }
        }
        var districtLength = k - j;

        for (var k = 0; k < districtWidth; k++) {
          for (var l = 0; l < districtLength; l++) {
            cityGrid[k + i][l + j] = 1;
          }
        }

        districtWidth *= districtMinSize;
        districtLength *= districtMinSize;

        var districtHeight = generateDistrictHeightRange();

        // console.log("District. Width: " + districtWidth + " Length " + districtLength)
        var district = generateDistrict(
          districtWidth,
          districtLength,
          districtHeight.x,
          districtHeight.y
        );
        district.applyMatrix4(
          new THREE.Matrix4().makeTranslation(
            i * districtMinSize,
            0,
            j * districtMinSize
          )
        );

        // NOTE Deprecated function
        THREE.GeometryUtils.merge(cityGeometry, district);
        // cityGeometry.merge(district);
      }
    }
  }

  var material = new THREE.MeshLambertMaterial({
    vertexColors: THREE.VertexColors,
  });
  var mesh = new THREE.Mesh(cityGeometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  mesh.applyMatrix4(
    new THREE.Matrix4().makeTranslation(-cityWidth / 2, 0, -cityLength / 2)
  );

  return mesh;
}

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
  ranges[i++] = new THREE.Vector2(50, 90); // Small
  ranges[i++] = new THREE.Vector2(80, 130); // Medium
  ranges[i++] = new THREE.Vector2(100, 200); // Medium-tall
  ranges[i++] = new THREE.Vector2(90, 250); // Tall

  return ranges[Math.floor(random(0, i))];
}

function generateDistrict(cityWidth, length, minHeight, maxHeight) {
  var districtGeometry = new THREE.Geometry();
  var rowWidth = 0;
  var rowLength = 0;
  var totalLength = 0;

  for (var j = 0; j < length; j += 5) {
    if (length - j < 45) break;

    var rowGeometry = new THREE.Geometry();
    for (var i = 0; i < cityWidth; i += 5) {
      if (cityWidth - i < 45) break;
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
      new THREE.Matrix4().makeTranslation((cityWidth - rowWidth) / 2.0, 0, 0)
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

  var planeGeometry = new THREE.PlaneGeometry(cityWidth, length);
  var planeMaterial = new THREE.MeshLambertMaterial();
  var plane = new THREE.Mesh(planeGeometry, planeMaterial);

  var planeColor = new THREE.Color(0xb8b8b8);
  plane.geometry.faces[0].vertexColors = [planeColor, planeColor, planeColor];
  plane.geometry.faces[1].vertexColors = [planeColor, planeColor, planeColor];

  plane.rotation.x = -0.5 * Math.PI;
  plane.position.x = cityWidth / 2;
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

  var cityWidth = random(minWidth, bldgMaxWidth);
  var height = random(bldgMinHeight, bldgMaxHeight);
  var length = cityWidth;

  // Building creation
  var geometry = new THREE.BoxGeometry(cityWidth, height, length);
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

  return new Building(cityWidth, height, length, mesh);
}

function Building(Width, Height, Length, Mesh) {
  this.Width = Width;
  this.Height = Height;
  this.Length = Length;
  this.Mesh = Mesh;
}

function random(min, max) {
  return min + Math.random() * (max - min);
}

// SECTION City Graph Creation
function generateGraph() {
  // sphere will move along the path
  var sphereMaterial = new THREE.MeshNormalMaterial();
  var sphereGeometry = new THREE.BoxGeometry( 20, 20, 20);
  
  
  var matrix = new THREE.Matrix4().makeTranslation(-cityWidth / 2, 0, -cityLength / 2);
  
  // create paths
  for (var n = 0; n <= 5; n++) {
    var pointsPath = new THREE.CurvePath();
    var v1 = new THREE.Vector3(25 + 250 * n, 10, 25);
    var v2 = new Vector3(25 + 250 * n, 10, 1300 - 25);
    
    v1.applyMatrix4(matrix);
    v2.applyMatrix4(matrix);
    
    pointsPath.add(new THREE.LineCurve3(v1, v2));
    var points = pointsPath.curves.reduce(
      (p, d) => [...p, ...d.getPoints(20)],
      []
      );
      
      var lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
      var lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
      var road = new THREE.Line(lineGeometry, lineMaterial);
      var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      sphere.castShadow = true;
      sphere.receiveShadow = true;
    pathsArray.push({
      line: road,
      points: pointsPath,
      sphere: sphere,
    });
  }
  for (var m = 0; m <= 5; m++) {
    var pointsPath = new THREE.CurvePath();
    var h1 = (new THREE.Vector3(25, 10, 25+250*m));
    var h2 = (new Vector3(25+250*5, 10, 25+250*m));
    
    h1.applyMatrix4(matrix);
    h2.applyMatrix4(matrix);
    
    pointsPath.add(new THREE.LineCurve3(h1, h2));
    var points = pointsPath.curves.reduce(
      (p, d) => [...p, ...d.getPoints(20)],
      []
      );
      
      var lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
      var lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
      var road = new THREE.Line(lineGeometry, lineMaterial);
      var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      sphere.castShadow = true;
      sphere.receiveShadow = true;
    pathsArray.push({
      line: road,
      points: pointsPath,
      sphere: sphere,
    });
  }
  pathsArray.forEach((d) => {
    scene.add(d.line);
    scene.add(d.sphere);
  });

}

function render(){
  pathsArray.forEach((e) => {
    var newPos = e.points.getPoint(t);
    e.sphere.position.set(newPos.x, newPos.y, newPos.z);
  });
  t = (t+0.001 >= 1) ? 0 : t + 0.001;
  renderer.render( scene, camera );
}
