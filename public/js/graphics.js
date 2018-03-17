/*0*
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
	* Function to create a car
	* @author Rahul Kiefer
	*/
function Car() {

	var hoodHeight = 1.25; //height of a car's hood
	var carHeight = hoodHeight + .75; //distance between ground and roof

	this.shape = new THREE.Shape(); //drawing the car
	this.shape.moveTo(0,-1);
	this.shape.lineTo(0,hoodHeight); //from front bottom to front of hood
	this.shape.lineTo(2,hoodHeight); //from front of hood to windshield
	this.shape.lineTo(2.5,carHeight); //from bottom of windshield to top of windshield
	this.shape.lineTo(4.5,carHeight); //from top of windshield to top of back window
	this.shape.lineTo(5,hoodHeight); //from top of back window to bottom of back window
	this.shape.lineTo(6,hoodHeight); //from bottom of back window to top of trunk
	this.shape.lineTo(6,-1); //from top of trunk to bottom of trunk
  this.shape.lineTo(0,-1);

  // use basic extrudegeometry
	this.extrudeSettings = {
		steps: 1,
		amount: 3, //WIDTH OF CAR!!!
		bevelEnabled: false, //set to false to make the texture mapping easier
		bevelThickness: .5,
		bevelSize: .5,
		bevelSegments: 2,
    material: 0,
    extrudeMaterial: 1
	}
  this.geometry = new THREE.ExtrudeGeometry(this.shape, this.extrudeSettings);

  // create material (lambert material for interaction with light)
  this.materials = [];
  for(var i = 0; i < 2; i++) {
    var texture = new THREE.TextureLoader().load(`/assets/map/map${i+1}.png`);
    if(i == 1) {
      // scaling for the extrude material
      texture.repeat.set(1/2, 1/3);
      texture.offset.set(0, 2/3);
    } else {
      // scaling for the side material
      texture.repeat.set(1/6, 1/6);
    }
    this.materials.push( new THREE.MeshBasicMaterial({ map: texture }) );
  }

  // The below is testing for UV mapping -- remove when car is properly textured
  console.log(this.geometry.faceVertexUvs[0]);
  var uv = [
    { x: 1, y: 1 },
    { x: 2, y: 1 },
    { x: 1, y: -2 }
  ];
  console.log(uv);
  this.geometry.faceVertexUvs[0] = [];
  for(var i = 0; i < this.geometry.faces.length; i++) {
    this.geometry.faceVertexUvs[0].push(uv);
  }
  // console.log(this.geometry.faces.length);

  // create mesh and add to scene
	this.mesh = new THREE.Mesh(this.geometry, this.materials);
	scene.add(this.mesh);

  /**
    * Attach a camera to a car when car joins
    * Called in updateCars()
    * @author Jonathan Lam
    */
  this.addCamera = camera => {
    this.camera = camera;
    this.mesh.add(camera);
  };

  /**
    * Remove a car and its associated camera when car leaves
    * Called in updateCars()
    * @author Jonathan Lam
    */
  this.remove = () => {
    this.mesh.remove(this.camera);
    scene.remove(this.mesh);
  };
}

// initial car at 0,0 for testing and as a reference point
// remove in production code
var car = new Car();

/**
  * Creating multiple views
  * @author Jonathan Lam
  */
var views = [
  // car 1: left top [currently: viewing car from front *FIX*]
  {
    left: 0,
    top: 0,
    width: 0.5,
    height: 0.5,
    background: new THREE.Color(0.5, 0.5, 0.7),
    position: [20, 3, 1.5], rotation: [0, Math.PI/2, 0],  // this is the normal view
    position: [-10, 1, 1.5], rotation: [0, -Math.PI/2, 0],// FRONT
    position: [3, -15, 1.5], rotation: [Math.PI/2, 0, 0], // BOTTOM
    position: [20, 1, 1.5], rotation: [0, Math.PI/2, 0],  // BACK
    position: [3, 1, 15], rotation: [0, 0, 0],            // SIDE
    position: [3, 15, 1.5], rotation: [-Math.PI/2, 0, 0], // TOP
    fov: 30,
    enabled: true
  },
  // car 2: right top (looking down on car from above)
  {
    left: 0.5,
    top: 0,
    width: 0.5,
    height: 0.5,
    background: new THREE.Color(0.5, 0.5, 0.7),
		position: [20, 3, 1.5], // [3, 15, 1.5], //pos of camera relative to car
    rotation: [0, Math.PI/2, 0],//[-Math.PI/2, 0, 0],
    fov: 30
  },
  // car 3: left bottom (looking at car from front)
  {
    left: 0,
    top: 0.5,
    width: 0.5,
    height: 0.5,
    background: new THREE.Color(0.5, 0.5, 0.7),
		position: [20, 3, 1.5], // [3, 15, 1.5], //pos of camera relative to car
    rotation: [0, Math.PI/2, 0],//[-Math.PI/2, 0, 0],
    // position: [-10, 3, 1.5], //pos of camera relative to car
    // rotation: [-Math.PI/2, -Math.PI/2, -Math.PI/2],
    fov: 30
  },
  // car 4: right bottom
  {
    left: 0.5,
    top: 0.5,
    width: 0.5,
    height: 0.5,
    background: new THREE.Color(0.5, 0.5, 0.7),
		position: [20, 3, 1.5], // [3, 15, 1.5], //pos of camera relative to car
    rotation: [0, Math.PI/2, 0],//[-Math.PI/2, 0, 0],
    // position: [3.25, 5, 20], //pos of camera relative to car
    // rotation: [-.1, 0, 0],
    fov: 30
  }
];

// update cars
var map = [];
var cars = [];
function updateCars() {
  // remove all cars
  for(var i = 0; i < cars.length; i++) {
    cars[i].remove();
  }
  cars = [];

  // make new ones
  for(var i = 0; i < map.length; i++) {
    var car = new Car();
    // x and y are coordinates on flat plane in server
    // x and z are coordinates on flat plane in three.js
    car.mesh.position.x = map[i].x;
    car.mesh.position.z = map[i].y;
    car.mesh.position.y = map[i].z;
    car.addCamera(views[i].camera);
    cars.push(car);
  }

  // disable all views after view 1 that are enabled
  for(var i = 1; i < views.length; i++) {
    views[i].enabled = i < cars.length;
  }
  // set view cameras appropriately to number of cars
  switch(cars.length) {
    case 0:
    case 1:
      // if no cars or one car, set full-screen
      views[0].width = 1.0;
      views[0].height = 1.0;
      break;
    case 2:
      // if two cars, set side by side
      views[0].width = views[1].width = 0.5;
      views[0].height = views[1].height = 1.0;
      views[1].left = 0.5;
      break;
    case 3:
      // if three or four cars, set to one-quarter screen size
      views[0].width = views[1].width = views[2].width = 0.5;
      views[0].height = views[1].height = views[3].height = 0.5;
      views[1].left = 0.5;
      views[2].top = 0.5;
      views[2].left = 0.25;
      break;
    case 4:
      views[0].width = views[1].width = views[2].width = views[3].width = 0.5;
      views[0].height = views[1].height = views[3].height = views[3].height = 0.5;
      views[1].left = 0.5;
      views[2].top = 0.5;
      views[2].left = 0.0;
      views[3].top = 0.5;
      views[3].left = 0.5;
      break;
  }
}

/**
	* Create init function
	* @author Rahul Kiefer
	*/
function init() {
  for(var view of views) {
    // create a camera for every view
    var camera = new THREE.PerspectiveCamera(view.fov, width/height, 0.1, 20000);
    camera.position.fromArray(view.position);
    camera.rotation.fromArray(view.rotation);
    view.camera = camera;
  }

  /**
    * Create skybox
    * Example used for template: stemkoski.github.io/Three.js/Skybox.html
    * @author Jonathan Lam
    */
  var imagePrefix = "/assets/dawnmountain-";
	var directions  = ["xpos", "xneg", "ypos", "yneg", "zpos", "zneg"];
	var imageSuffix = ".png";
	var skyGeometry = new THREE.CubeGeometry( 5000, 5000, 5000 );

	var materialArray = [];
	for (var i = 0; i < 6; i++)
		materialArray.push( new THREE.MeshBasicMaterial({
			map: new THREE.TextureLoader().load( imagePrefix + directions[i] + imageSuffix ),
			side: THREE.BackSide
		}));
	var skyMaterial = materialArray; //new THREE.MeshFaceMaterial( materialArray );
	var skyBox = new THREE.Mesh( skyGeometry, skyMaterial );
	scene.add( skyBox );

	/**
	  * Create spot light
	  * @author Rahul Kiefer
    */
  var spotLight = new THREE.PointLight( 0xffffff );
  spotLight.position.set(0, 1000, 0);

  spotLight.shadow.camera.near = 500;
  spotLight.shadow.camera.far = 10000;

  scene.add(spotLight);

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
	var floorTexture = new THREE.TextureLoader().load('/assets/grass_texture.jpg');
	floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
	floorTexture.repeat.set( 1000, 1000 );
	var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.DoubleSide } );
	var floorGeometry = new THREE.PlaneGeometry(5000, 5000, 10, 10); //floor is 5000x5000 to match skybox
	var floor = new THREE.Mesh(floorGeometry, floorMaterial);
	//floor.position.y = -100;
	floor.rotation.x = Math.PI / 2;
	scene.add(floor);

	/**
		* Creating race track
		* @author Rahul Kiefer
		*/
		var track = new THREE.Shape();

		track.moveTo(150,50);
		track.lineTo(150,150);
		track.quadraticCurveTo(150,175,100,175);
		track.quadraticCurveTo(50,175,50,150);
		track.lineTo(50,50);
		track.quadraticCurveTo(50,25,100,25);
		track.quadraticCurveTo(150,25,150,50);

		var trackExtrudeSettings = {
			amount: 5,
			bevelEnabled: false,
			bevelSegments: 2,
			steps: 1,
			bevelSize: 1,
			bevelThickness: 1
		};

		var trackTexture = new THREE.TextureLoader().load('/assets/blacktop_texture.jpg');
		trackTexture.wrapS = trackTexture.wrapT = THREE.RepeatWrapping;
		trackTexture.repeat.set( 10, 10 );

		var trackMaterial = new THREE.MeshBasicMaterial( {map: floorTexture, side: THREE.DoubleSide} );
		var trackGeometry = new THREE.ExtrudeGeometry(track, trackExtrudeSettings);
<<<<<<< HEAD

=======
>>>>>>> e424af4494c7b47e204762934090769331a263e6
		var raceTrackMesh = new THREE.Mesh( trackGeometry, trackMaterial );

		raceTrackMesh.rotation.x = Math.PI / 2;
		raceTrackMesh.position.y = 0.1;
		scene.add(raceTrackMesh);

}

/**
  * Run the animation
  * @author Rahul Kiefer
  */
function animate() {
  // update coordinates of cars
  for(var i = 0; i < map.length; i++) {
    if(cars[i]) {
      // see note above for switched z and y
      cars[i].mesh.position.x = map[i].x;
      cars[i].mesh.position.z = -map[i].y;
      cars[i].mesh.position.y = map[i].z;
      cars[i].mesh.rotation.y = map[i].heading;
    }
  }

  // render views
  render();

  // wait until canvas ready to render
	requestAnimationFrame(animate);
}

/**
  * Render the scene
  * @author Jonathan Lam
  */
function render() {
  for(var view of views) {
    // if disabled, skip
    if(!view.enabled) continue;

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

// init and animate to start the game
init();
animate();
