/*if ( ! Detector.webgl ) Detector.addGetWebGLMessage();*/

function Building(Width, Height, Length, Mesh) {
  this.Width = Width;
  this.Height = Height;
  this.Length = Length;
  this.Mesh = Mesh;
}

function m_rand(min, max) {
  return min + Math.random() * (max - min);
}

var renderer,
  scene,
  camera,
  RENDER_WIDTH = window.innerWidth,
  RENDER_HEIGHT = window.innerHeight;

function init() {
  // on initialise le moteur de rendu
  renderer = new THREE.WebGLRenderer({ antialias: true });

  // si WebGL ne fonctionne pas sur votre navigateur vous pouvez utiliser le moteur de rendu Canvas à la place
  // renderer = new THREE.CanvasRenderer();
  renderer.setClearColor(new THREE.Color(0xeeeeee, 1.0)); //0xEEEEEE
  renderer.setSize(RENDER_WIDTH, RENDER_HEIGHT);
  renderer.shadowMapEnabled = true;
  renderer.shadowMapType = THREE.PCFSoftShadowMap;

  document.body.appendChild(renderer.domElement);

  // on initialise la scène
  scene = new THREE.Scene();

  // on initialise la camera que l’on place ensuite sur la scène
  camera = new THREE.PerspectiveCamera(
    75,
    RENDER_WIDTH / RENDER_HEIGHT,
    100,
    10000
  );
  camera.position.set(0, 500, 0);
  scene.add(camera);

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.maxPolarAngle = Math.PI * 0.5;
  controls.minDistance = 500;
  controls.maxDistance = 5000;

  var skyBoxGeometry = new THREE.CubeGeometry(10000, 10000, 10000);
  var skyBoxMaterial = new THREE.MeshBasicMaterial({
    color: 0xf2f2f2,
    side: THREE.BackSide,
  }); // 0x3DA2EF, 0x69606b
  var skyBox = new THREE.Mesh(skyBoxGeometry, skyBoxMaterial);
  scene.add(skyBox);

  // scene.fog = new THREE.FogExp2(skyBoxMaterial.color, 0.0004); // ( skyBoxMaterial.color, 0.0003 )
  scene.fog = new THREE.Fog(skyBoxMaterial.color, 900, 4000); // ( skyBoxMaterial.color, 0.0003 )

  var planeGeometry = new THREE.PlaneGeometry(100000, 100000);
  var planeMaterial = new THREE.MeshLambertMaterial({
    color: 0xf0f0f0,
    polygonOffset: true,
    polygonOffsetFactor: 5,
  }); // 0x000000
  var plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.receiveShadow = true;

  plane.rotation.x = -0.5 * Math.PI;
  plane.position.x = 0;
  plane.position.y = 0;
  plane.position.z = 0;

  scene.add(plane);

  scene.add(generate_city(5000, 5000));

  // add subtle ambient lighting
  var ambiColor = "#787878";
  var ambientLight = new THREE.AmbientLight(ambiColor);
  scene.add(ambientLight);

  var pointColor = "#ffffff";
  var directionalLight = new THREE.DirectionalLight(pointColor);
  directionalLight.position.set(-500, 700, -300);
  directionalLight.castShadow = true;
  directionalLight.shadowCameraNear = 50;
  directionalLight.shadowCameraFar = 2000;
  directionalLight.shadowCameraLeft = -1500;
  directionalLight.shadowCameraRight = 1500;
  directionalLight.shadowCameraTop = 1500;
  directionalLight.shadowCameraBottom = -1000;

  directionalLight.distance = 0;
  directionalLight.intensity = 0.6;
  directionalLight.shadowMapHeight = 3096;
  directionalLight.shadowMapWidth = 3096;
  //directionalLight.shadowCameraVisible = true;
  scene.add(directionalLight);

  //var directionalLight2 = directionalLight.clone();
  //directionalLight2.shadowCameraVisible = true;
  //directionalLight2.onlyShadow = true;
  //directionalLight2.translateZ(900);
  //directionalLight2.translateX(-450);

  //var target = new THREE.Object3D();
  //target.position = new THREE.Vector3(-450,0,900);
  //directionalLight2.target = target;

  //scene.add(directionalLight2);

  // THREE.WindowResize(renderer, camera, RENDER_HEIGHT);
}

function generate_building(
  building_max_width,
  building_min_height,
  building_max_height
) {
  var min_width = 40,
    max_width = 60;

  if (building_max_width < min_width) building_max_width = min_width;
  else if (building_max_width > max_width) building_max_width = max_width;

  var width = m_rand(min_width, building_max_width);

  var height = m_rand(building_min_height, building_max_height); // (90, 250)
  var length = width;

  var geometry = new THREE.CubeGeometry(width, height, length);
  geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, height / 2, 0));

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
  var fade = 1.3; // 0x3DA2EF
  var baseColor = new THREE.Color().setRGB(
    value /*+ Math.random()*/ * fade,
    value /*+ Math.random()*/ * fade,
    value /*+ Math.random()*/ * fade
  );
  var topColor = baseColor.clone().multiply(light);
  var bottomColor = baseColor.clone().multiply(shadow);

  var random_building_color = Math.random() * Math.random() * Math.random();

  if (random_building_color > 0.65) {
    baseColor = new THREE.Color().setRGB(0.9, 0.2, 0.2);
    topColor = baseColor.clone().multiply(light);
    bottomColor = baseColor.clone().multiply(shadow);
  }

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

function generate_district(
  district_width,
  district_length,
  district_min_height,
  district_max_height
) {
  var districtGeometry = new THREE.Geometry();

  var row_width = 0,
    row_length = 0,
    total_length = 0;

  for (var j = 0; j < district_length; j += m_rand(5, 10)) {
    if (district_length - j < 45) break;

    var rowGeometry = new THREE.Geometry();

    for (var i = 0; i < district_width; i += m_rand(5, 10)) {
      if (district_width - i < 45) break;

      var building = generate_building(
        district_length - j,
        district_min_height,
        district_max_height
      );

      if (district_width - i < building.Width)
        building = generate_building(
          district_width - i,
          district_min_height,
          district_max_height
        );

      var floor_width = Math.floor(building.Width / 5) * 5 + 5;
      var floor_length = Math.floor(building.Length / 5) * 5 + 5;

      if (floor_length > row_length) row_length = floor_length;

      building.Mesh.position.x = i + floor_width / 2.0;
      building.Mesh.position.z = j + row_length / 2.0;

      THREE.GeometryUtils.merge(rowGeometry, building.Mesh);

      i += floor_width;
      row_width = i;
    }

    rowGeometry.applyMatrix(
      new THREE.Matrix4().makeTranslation(
        (district_width - row_width) / 2.0,
        0,
        0
      )
    );
    THREE.GeometryUtils.merge(districtGeometry, rowGeometry);

    j += row_length;
    total_length = j;

    row_width = 0;
    row_length = 0;
  }

  districtGeometry.applyMatrix(
    new THREE.Matrix4().makeTranslation(
      0,
      0,
      (district_length - total_length) / 2.0
    )
  );
  //districtGeometry.applyMatrix( new THREE.Matrix4().makeTranslation( -district_width/2, 0, -district_length/2 ) );

  var planeGeometry = new THREE.PlaneGeometry(district_width, district_length);
  var planeMaterial = new THREE.MeshLambertMaterial();
  var plane = new THREE.Mesh(planeGeometry, planeMaterial);

  var planeColor = new THREE.Color(0xb8b8b8);
  plane.geometry.faces[0].vertexColors = [planeColor, planeColor, planeColor];
  plane.geometry.faces[1].vertexColors = [planeColor, planeColor, planeColor];

  plane.rotation.x = -0.5 * Math.PI;
  plane.position.x = district_width / 2;
  plane.position.y = 1;
  plane.position.z = district_length / 2;

  THREE.GeometryUtils.merge(districtGeometry, plane);

  var material = new THREE.MeshLambertMaterial({
    vertexColors: THREE.VertexColors,
  });
  var mesh = new THREE.Mesh(districtGeometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  return mesh;
}

function generate_district_heigth_range() {
  var ranges = new Array();
  var i = 0;
  ranges[i++] = new THREE.Vector2(30, 60); // Very small
  ranges[i++] = new THREE.Vector2(50, 90); // Small
  ranges[i++] = new THREE.Vector2(80, 150); // Medium
  ranges[i++] = new THREE.Vector2(100, 250); // Medium-tall
  ranges[i++] = new THREE.Vector2(90, 350); // Tall

  return ranges[Math.floor(m_rand(0, i))];
}

function generate_grid(grid_width, grid_length, min_district_size) {
  var city_grid = new Array();

  // Initialisation de la grille
  for (var i = 0; i < grid_width; i++) {
    city_grid[i] = new Array();
    for (var j = 0; j < grid_length; j++) {
      city_grid[i][j] = 0;
    }
  }

  var min_floor = 2,
    max_floor = 4;

  // Routes horizontales
  for (
    var i = 2;
    i < grid_width - 2;
    i += Math.floor(m_rand(min_floor, max_floor)) + 1
  )
    for (var j = 2; j < grid_length - 2; j++) city_grid[i][j] = 1;

  // Routes verticales
  for (
    var i = 2;
    i < grid_width - 2;
    i += Math.floor(m_rand(min_floor, max_floor)) + 1
  )
    for (var j = 2; j < grid_length - 2; j++) city_grid[j][i] = 1;
  //  NOTE
  for (var i = 0; i < grid_width; i++) city_grid[i][2] = 1;

  for (var i = 0; i < grid_width; i++) city_grid[i][grid_width - 3] = 1;

  for (var i = 0; i < grid_length; i++) city_grid[2][i] = 1;

  for (var i = 0; i < grid_length; i++) city_grid[grid_length - 3][i] = 1;
  // On supprime certaines routes

  for (var i = 2; i < grid_width - 2; i++) {
    for (var j = 2; j < grid_length - 2; j++) {
      if (city_grid[i][j] == 0) {
        // On trouve un building

        if (city_grid[i - 1][j] == 1) {
          // Si le building est adjacent à une route horizontale
          if (Math.floor(m_rand(0, 10)) == 3) {
            // On cherche le coin supérieur gauche du district
            for (var k = j - 1; city_grid[i][k] == 0 && k >= 0; k--) {}
            k++; // On se re-positionne dans le coin

            for (; city_grid[i][k] == 0; k++) city_grid[i - 1][k] = 2;
          }
        } else if (city_grid[i][j + 1] == 1) {
          // Si le building est adjacent à une route verticale
          if (Math.floor(m_rand(0, 10)) == 3) {
            // On cherche le coin supérieur droit du district
            for (var k = i - 1; city_grid[k][j] == 0 && k >= 0; k--) {}
            k++; // On se re-positionne dans le coin

            for (; city_grid[k][j] == 0; k++) city_grid[k][j + 1] = 2;
          }
        }
      }
    }
  }
  return city_grid;
}

function generate_city(city_width, city_length) {
  var min_district_size = 70;
  var grid_width = Math.floor(city_width / min_district_size);
  var grid_length = Math.floor(city_length / min_district_size);
  var city_grid = generate_grid(grid_width, grid_length, min_district_size);

  // debug
  /*for (var i = 0 ; i < grid_width ; i++)
		document.getElementById("test").innerHTML+=city_grid[i].toString()+"<br>";
	
	document.getElementById("test").innerHTML+="<br>";*/
  // end debug

  var city_geometry = new THREE.Geometry();

  // Création des districts

  var val = 0; // On remplit les districts
  while (val <= 2) {
    for (var i = 0; i < grid_width; i++) {
      for (var j = 0; j < grid_length; j++) {
        if (city_grid[i][j] == val) {
          for (var k = i; k < grid_width; k++) {
            if (city_grid[k][j] != val) break;
          }

          var district_width = k - i;

          for (var k = j + 1; k < grid_length; k++) {
            if (city_grid[i][k] != val) break;
          }

          var district_length = k - j;

          for (var k = 0; k < district_width; k++)
            for (var l = 0; l < district_length; l++)
              city_grid[k + i][l + j] = 1;

          district_width *= min_district_size;
          district_length *= min_district_size;

          var district_height = generate_district_heigth_range();
          var district = generate_district(
            district_width,
            district_length,
            district_height.x,
            district_height.y
          );
          district.applyMatrix(
            new THREE.Matrix4().makeTranslation(
              i * min_district_size,
              0,
              j * min_district_size
            )
          );

          THREE.GeometryUtils.merge(city_geometry, district);
        }
      }
    }
    val += 2; // On remplit les routes devenues des districts
  }

  var material = new THREE.MeshLambertMaterial({
    vertexColors: THREE.VertexColors,
  });
  var mesh = new THREE.Mesh(city_geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  mesh.applyMatrix(
    new THREE.Matrix4().makeTranslation(-city_width / 2, 0, -city_length / 2)
  );

  return mesh;
}

var t = 3.15,
  radius = 1300,
  id;
function animate() {
  t += 0.001;

  // camera.position.x = radius * Math.cos(t);
  // camera.position.y = 300 * Math.abs(Math.sin(t)) + 300;
  // camera.position.z = radius * Math.sin(t);
  camera.lookAt(new THREE.Vector3(0, 100, 0));

  // on appel la fonction animate() récursivement à chaque frame
  id = requestAnimationFrame(animate);
  // on effectue le rendu de la scène
  renderer.render(scene, camera);
}

init();
animate();
