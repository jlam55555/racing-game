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

/**
	* Create renderer
	* @author Rahul Kiefer
	*/
var renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
element.appendChild(renderer.domElement);

/**
	* Create the car
	* @author Rahul Kiefer
	*/
function Car() {

	var hoodHeight = 1.25; //height of a car's hood
	var carHeight = hoodHeight + .75; //distance between ground and roof

	this.shape = new THREE.Shape(); //drawing the car
	this.shape.moveTo(0,0);
	this.shape.lineTo(0,hoodHeight); //from front bottom to front of hood
	this.shape.lineTo(2,hoodHeight); //from front of hood to windshield
	this.shape.lineTo(2.5,carHeight); //from bottom of windshield to top of windshield
	this.shape.lineTo(4.5,carHeight); //from top of windshield to top of back window
	this.shape.lineTo(5,hoodHeight); //from top of back window to bottom of back window
	this.shape.lineTo(6,hoodHeight); //from bottom of back window to top of trunk
	this.shape.lineTo(6,0); //from top of trunk to bottom of trunk

	this.extrudeSettings = {
		steps: 1,
		amount: 3,
		bevelEnabled: false,
		bevelThickness: 1,
		bevelSize: 1,
		bevelSegments: 1
	}

  this.geometry = new THREE.ExtrudeGeometry(this.shape, this.extrudeSettings);
	this.material = new THREE.MeshLambertMaterial({color:0xCC0000});
	this.mesh = new THREE.Mesh(this.geometry, this.material);
	scene.add(this.mesh);
}
var car = new Car();

/**
  * Creating multiple views
  * @author Jonathan Lam
  */
var views = [
  // car 1: left top
  {
    left: 0,
    top: 0,
    width: 0.5,
    height: 0.5,
    background: new THREE.Color(0.5, 0.5, 0.7),
    position: [3.25, 5, 20], //pos of camera relative to car
    rotation: [-.1, 0, 0],
    fov: 30
  },
  // car 2: right top
  {
    left: 0.5,
    top: 0,
    width: 0.5,
    height: 0.5,
    background: new THREE.Color(0.5, 0.5, 0.7),
    position: [3.25, 5, 20], //pos of camera relative to car
    rotation: [-.1, 0, 0],
    fov: 30
  },
  // car 3: left bottom
  {
    left: 0,
    top: 0.5,
    width: 0.5,
    height: 0.5,
    background: new THREE.Color(0.5, 0.5, 0.7),
    position: [3.25, 5, 20], //pos of camera relative to car
    rotation: [-.1, 0, 0],
    fov: 30
  },
  // car 4: right bottom
  {
    left: 0.5,
    top: 0.5,
    width: 0.5,
    height: 0.5,
    background: new THREE.Color(0.5, 0.5, 0.7),
    position: [3.25, 5, 20], //pos of camera relative to car
    rotation: [-.1, 0, 0],
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
    car.mesh.add(camera);
    view.camera = camera;
  }

  //creating spotLight
  var spotLight = new THREE.SpotLight( 0xffffff );
  spotLight.position.set(3.5, 5, 20);

  spotLight.shadow.mapSize.width = 1024;
  spotLight.shadow.mapSize.height = 1024;

  spotLight.shadow.camera.near = 500;
  spotLight.shadow.camera.far = 4000;
  spotLight.shadow.camera.fov = 30;

  scene.add(spotLight);

	/**
	  * Create ambient light
	  * @author Rahul Kiefer

  var ambLight = new THREE.AmbientLight(0xf5f5f5); //soft white light
  scene.add(ambLight);
	*/

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
