// function generateFlat() {
//   // var single = new THREE.Geometry();
//   var loader = new GLTFLoader();

//   var newMaterial = new THREE.MeshLambertMaterial({
//     color: 0xffffff,
//   });
//   var textureLoader = new THREE.TextureLoader();
//   var texture = textureLoader.load(FlatImg);

//   loader.load(
//     Flat,
//     function (gltf) {
//       var flat = gltf.scene.children[0];

//       gltf.scene.traverse(function (child) {
//         if (child.isMesh) {
//           child.material = newMaterial;
//           child.material.map = texture;
//           child.receiveShadow = true;
//           child.castShadow = true;
//         }
//       });
//       flat.visible = true;
//       // flat.geometry.center()
//       // flat.geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(25, 0, 25))
//       flat.scale.set(30, 30, 30);
//       // flat.position.x = 50;
//       scene.add(flat);
//     },
//     undefined,
//     function (error) {
//       console.error(error);
//     }
//   );
// }
