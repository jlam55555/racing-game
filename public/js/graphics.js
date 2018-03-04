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

/**
	* Create scene and camera
	* @author Rahul Kiefer
	*/
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);

// created renderer
var renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
element.appendChild(renderer.domElement);

/**
	* Create the car
	* @author Rahul Kiefer
	*/
var carLength = 5, carWidth = 3;

var carShape = new THREE.Shape();
carShape.moveTo(0,0);
carShape.lineTo( 0, carWidth );
carShape.lineTo( carLength, carWidth );
carShape.lineTo( carLength, 0 );
carShape.lineTo( 0, 0 );

var carExtrudeSettings = {
	steps: 1,
	amount: carWidth,
	bevelEnabled: false,
	bevelThickness: 1,
	bevelSize: 1,
	bevelSegments: 1
}

var carGeometry = new THREE.ExtrudeGeometry(carShape, carExtrudeSettings);
var carMaterial = new THREE.MeshLambertMaterial({color:0xCC0000});
var carMesh = new THREE.Mesh(carGeometry, carMaterial);
scene.add(carMesh);

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
    position: [2.5, 7.5, 14.5], //pos of camera relative to car
    rotation: [-.5, 0, 0],
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
    carMesh.add(camera);
    view.camera = camera;
  }
  /*
  //creating spotLight
  var spotLight = new THREE.SpotLight( 0xffffff );
  spotLight.position.set(0, 10, 100);

  spotLight.shadow.mapSize.width = 1024;
  spotLight.shadow.mapSize.height = 1024;

  spotLight.shadow.camera.near = 500;
  spotLight.shadow.camera.far = 4000;
  spotLight.shadow.camera.fov = 30;

  scene.add(spotLight);
  */

	/**
	  * Create ambient light
	  * @author Rahul Kiefer
	  */
  var ambLight = new THREE.AmbientLight(0xf5f5f5); //soft white light
  scene.add(ambLight);

	/**
	  * Create the floor
	  * @author Rahul Kiefer
	  */
  var floor = new THREE.Mesh(
  	new THREE.PlaneGeometry(20, 100),
  	new THREE.MeshLambertMaterial({color: 0x808080})
  );
  floor.rotation.x = 0; //set back to zero later, fix camera angle
  //scene.add(floor);
}

/**
  * Run the animation
  * @author Rahul Kiefer
  */
function animate() {
  // wait until canvas ready to render
	requestAnimationFrame(animate);

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

    // set viewport
    var viewLeft = Math.floor(width * view.left);
    var viewTop = Math.floor(height * view.top);
    var viewWidth = Math.floor(width * view.width);
    var viewHeight = Math.floor(height * view.height);

    renderer.setViewport(viewLeft, viewTop, viewWidth, viewHeight);
    renderer.setScissor(viewLeft, viewTop, viewWidth, viewHeight);
    renderer.setScissorTest(true);
    renderer.setClearColor(view.background);

    // update camera
    camera.aspect = viewWidth/viewHeight;
    camera.updateProjectionMatrix();

    // render view
    renderer.render(scene, camera);
  }
}
