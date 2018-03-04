/**
  * graphics file
  * <p>
  * Critical functions: init(), animate(), render()
  * @author Rahul Kiefer
  */

/**
  * Use #game as base element
  * @author Jonathan Lam
  */
var element = document.querySelector('#game');
var width = element.getBoundingClientRect().width;
var height = element.getBoundingClientRect().height;

// created scene and camera
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);

camera.position.z = 30;

// created renderer
var renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
element.appendChild(renderer.domElement);

// creating cube
var geometry = new THREE.BoxGeometry(5,5,5);
var material = new THREE.MeshLambertMaterial( {color: 0xCC0000 } );
var cube = new THREE.Mesh(geometry, material);
scene.add(cube);

/**
  * Creating multiple views
  * @author Jonathan Lam
  */
var views = [
  {
    left: 0,
    top: 0,
    width: 0.5,
    height: 1.0,
    background: new THREE.Color(0.5, 0.5, 0.7),
    position: [0, 0, 50],
    rotation: [0, 0, 0],
    fov: 30
  },
  {
    left: 0.5,
    top: 0,
    width: 0.5,
    height: 1.0,
    background: new THREE.Color(0.8, 0.8, 0),
    position: [0, 50, 0],
    rotation: [-Math.PI/2, 0, 0],
    fov: 30
  }
];

// init and animate
init();
animate();

function init() {
  for(var view of views) {
    // create a camera for every view
    var camera = new THREE.PerspectiveCamera(view.fov, width/height, 0.1, 1000);
    camera.position.fromArray(view.position);
    camera.rotation.fromArray(view.rotation);
    cube.add(camera)
    view.camera = camera;
  }
}

/**
  * Run the animation
  * @author Rahul Kiefer
  */
function animate() {
	requestAnimationFrame( animate );
  cube.rotation.x -= .01;
  // cube.position.z -= .01;

  // render views
  render();
}

/**
  * Render the scene
  * @author Jonathan Lam
  */
function render() {
  for(var view of views) {
    var camera = view.camera;

    var viewLeft = Math.floor(width * view.left);
    var viewTop = Math.floor(height * view.top);
    var viewWidth = Math.floor(width * view.width);
    var viewHeight = Math.floor(height * view.height);

    renderer.setViewport(viewLeft, viewTop, viewWidth, viewHeight);
    renderer.setScissor(viewLeft, viewTop, viewWidth, viewHeight);
    renderer.setScissorTest(true);
    renderer.setClearColor(view.background);

    camera.aspect = viewWidth/viewHeight;
    camera.updateProjectionMatrix();

    renderer.render(scene, camera);
  }
}

// creating spotLight
var spotLight = new THREE.SpotLight( 0xffffff );
spotLight.position.set(0, 10, 100);

spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;

spotLight.shadow.camera.near = 500;
spotLight.shadow.camera.far = 4000;
spotLight.shadow.camera.fov = 30;

scene.add(spotLight);

// creating floor
var floor = new THREE.Mesh(
	new THREE.PlaneGeometry(20, 100),
	new THREE.MeshLambertMaterial({color: 0x808080})
);
floor.rotation.x -= 1; //set back to zero later, fix camera angle
 scene.add(floor);
