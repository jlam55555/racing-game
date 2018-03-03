/**
  * graphics file
  * @author Rahul Kiefer
  */


//created scene and camera
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// created renderer
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//creating cube
var geometry = new THREE.BoxGeometry(5,5,5);
var material = new THREE.MeshLambertMaterial( {color: 0xCC0000 } );
var cube = new THREE.Mesh(geometry, material);
scene.add(cube);


//animating cube
camera.position.z = 10;

function animate() {
	requestAnimationFrame( animate );
  cube.rotation.x -= .01;
  //cube.position.z -= .01;
	renderer.render( scene, camera );
}
animate();

<<<<<<< HEAD
//creating spotLight
var spotLight = new THREE.SpotLight( 0xffffff );
spotLight.position.set( 0, 10, 100 );
=======
//light
//Light(0xffffff, 1);
>>>>>>> 5a23f22f401d0db53e4e96e6185ab5abc623f708

spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;

spotLight.shadow.camera.near = 500;
spotLight.shadow.camera.far = 4000;
spotLight.shadow.camera.fov = 30;

scene.add( spotLight );
