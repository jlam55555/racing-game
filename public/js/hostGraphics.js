/**
  * host graphics file
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
  * Car class (a function as per JS standards). Create using 'new Car()'
  * <p>
  * Publicly available fields: .mesh (to change position and rotation)
  * @param  id The id of the car (the socketId of the client) to correctly match the client camera to the car
  * @todo   Make member fields private
  * @return undefined
  * @author Rahul Kiefer
  */
function Car(id) {

  /**
    * Set id of car (to attach camera to correct car on mobile)
    * @author Jonathan Lam
    */
  this.id = id;

  /**
    * Draw shape of car, and then extrude
    * @author Rahul Kiefer
    */
  var hoodHeight = 1.25;               // height of a car's hood
  var carHeight = hoodHeight + .75;    // distance between ground and roof

  // drawing the car shape
  this.shape = new THREE.Shape();
  this.shape.moveTo(0, 0);
  this.shape.lineTo(0, hoodHeight);    // from front bottom to front of hood
  this.shape.lineTo(2, hoodHeight);    // from front of hood to windshield
  this.shape.lineTo(2.5, carHeight);   // from bottom of windshield to top of windshield
  this.shape.lineTo(4.5, carHeight);   // from top of windshield to top of back window
  this.shape.lineTo(5, hoodHeight);    // from top of back window to bottom of back window
  this.shape.lineTo(6, hoodHeight);    // from bottom of back window to top of trunk
  this.shape.lineTo(6, 0);             // from top of trunk to bottom of trunk
  this.shape.lineTo(0, 0);

  // use basic extrudegeometry
  this.extrudeSettings = {
    steps: 1,               // extrudegeometry uses one intermediate shape
    amount: 3,              // width of car
    bevelEnabled: false,    // bevel set to false to make the texture (UV) mapping easier
    // bevelThickness: .5,
    // bevelSize: .5,
    // bevelSegments: 2,
    material: 0,            // first material (texture) in material array is for sides
    extrudeMaterial: 1      // second material (texture) in material array is for the front, hood, windshield, top, rear windshield, rear hood, rear (and bottom)
  }
  this.geometry = new THREE.ExtrudeGeometry(this.shape, this.extrudeSettings);

  /**
    * Create materials (lambert textures) with UV mapping for custom extrude geometry
    * @author Jonathan Lam
    */

  // load materials
  this.materials = [];
  for(var i = 0; i < 2; i++) {
    // texture 1 (sides) is located at /assets/map/map1.png
    // texture 2 (other faces) is located at /assets/map/map2.png
    var texture = new THREE.TextureLoader().load(`/assets/map/map${i+1}.png`);
    if(i == 1) {
      // scaling for the extrude material
      // scale goes from x: 0-2, y: (-2)-1 (this is for the UV mapping to work)
      texture.repeat.set(1/2, 1/3);
      texture.offset.set(0, 2/3);
    } else {
      // scaling for the side material
      // scale goes from x: 0-6, y: 0-2
      texture.repeat.set(1/6, 1/2);
    }
    this.materials.push(new THREE.MeshLambertMaterial({ map: texture }));
  }

  /**
    * UV mapping for the car texture
    * <p>
    * Brief description of UV mapping: UV mapping is a system to get a 2D image
    * wrapped around a 3D shape. Luckily, this is relatively easy for objects
    * with flat faces (such as this car), which means that we simply have to
    * translate coordinates from the 2D "map" to the 3D geometry.
    * <p>
    *
    *   (0, 1)               (2, 1)     // The map is a square image with
    *   +--------------------+          // the labelled (U, V) coordinates.
    *   |                    |          // These specific (U, V) coordinates
    *   |                    |          // were made to wrap around the car.
    *   |                    |
    *   |                    |
    *   |                    |
    *   |                    |
    *   +--------------------+
    *   (0, -2)              (2, -2)
    *
    * <p>
    * Different 3D triangular "faces" of the car geometry, numbered 12-25, were
    * programatically mapped to the corresponding (U, V) coordinates on the
    * map.
    * <p>
    * Made with a LOT of painstaking trial-and-error. =/ I thought this
    * deserves its own special comment.
    * @author Jonathan Lam
    */

  // no change to sides (faceVertexUvs indeces 0-11)
  // no change to bottom (faceVertexUvs indeces 26-27)

  // side lengths correspond to the lengths of the sides of the car's Shape
  var sideLengths = [ 0, 1.25, 2, Math.sqrt(0.5*0.5 + 0.75*0.75), 2, Math.sqrt(0.5*0.5 + 0.75*0.75), 1, 1.25 ];
  // cumulative lengths correspond to the length of the sides from the start of the car's Shape
  var cumulativeLengths = sideLengths.map((e, index) => sideLengths.slice(0, index+1).reduce((accumulator, value) => accumulator + value));
  // positions correspond to the scaled version of the cumulative lengths for the UV map
  var positions = cumulativeLengths.map(length => length / cumulativeLengths[cumulativeLengths.length-1] * 2);

  // start from front, go to back (index 25 is front, index 14 is back)
  for(var i = 25; i >= 12; i--) {

    // generate correct set of UV map points in points array
    var points;

    // even face numbers
    if(i % 2 == 0) {
      points = [
        { x: positions[(25-i-1) / 2 + 1], y: 1 },
        { x: positions[(25-i-1) / 2],     y: 1 },
        { x: positions[(25-i-1) / 2 + 1], y: -2 },
      ];
    }
    // odd face numbers
    else {
      points = [
        { x: positions[(25-i) / 2],     y: 1 },
        { x: positions[(25-i) / 2],     y: -2 },
        { x: positions[(25-i) / 2 + 1], y: -2 },
      ];
    }

    // add uv map to geometry
    this.geometry.faceVertexUvs[0][i] = points;
  }

  /**
    * Create mesh and add to scene
    * @author Rahul Kiefer
    */
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
  * @todo   Make this programatically instead of hardcoding it in, explain position and rotation metrics
  * @author Jonathan Lam
  */
var views = [
  // car 1: left top [currently: viewing car from front *FIX*]
  {
    left: 0,
    top: 0,
    width: 0.5,
    height: 0.5,
    position: [3, -15, 1.5], rotation: [Math.PI/2, 0, 0], // BOTTOM (for debug)
    position: [-10, 1, 1.5], rotation: [0, -Math.PI/2, 0],// FRONT  (for debug)
    position: [3, 15, 1.5], rotation: [-Math.PI/2, 0, 0], // TOP    (for debug)
    position: [3, 1, 15], rotation: [0, 0, 0],            // SIDE   (for debug)
    position: [20, 1, 1.5], rotation: [0, Math.PI/2, 0],  // BACK   (for debug)
    position: [20, 3, 1.5], rotation: [0, Math.PI/2, 0],  // NORMAL (for prod)
    fov: 30,
    enabled: true
  },
  // car 2: right top (looking down on car from above)
  {
    left: 0.5,
    top: 0,
    width: 0.5,
    height: 0.5,
    position: [20, 3, 1.5],
    rotation: [0, Math.PI/2, 0],
    fov: 30
  },
  // car 3: left bottom
  {
    left: 0,
    top: 0.5,
    width: 0.5,
    height: 0.5,
    position: [20, 3, 1.5],
    rotation: [0, Math.PI/2, 0],
    fov: 30
  },
  // car 4: right bottom
  {
    left: 0.5,
    top: 0.5,
    width: 0.5,
    height: 0.5,
    position: [20, 3, 1.5],
    rotation: [0, Math.PI/2, 0],
    fov: 30
  }
];

/**
  * updateCars() function
  * This is called every time a user enters leaves (upon the 'updateNames' message from socket.io (see /public/js/game.js))
  * @return undefined
  * @author Jonathan Lam
  */

// map and car arrays to map (client positions) and cars (Car objects)
var map = [];
var cars = [];

// updateCars function
function updateCars() {

  // remove all cars ("reset" array)
  for(var i = 0; i < cars.length; i++) {
    cars[i].remove();
  }
  cars = [];

  // make new cars ("refresh" the array)
  for(var i = 0; i < map.length; i++) {
    var car = new Car(map[i].socketId);
    // x and y are coordinates on flat plane in server
    // x and z are coordinates on flat plane in three.js
    car.mesh.position.x = map[i].x;
    car.mesh.position.z = map[i].y;
    car.mesh.position.y = map[i].z;
    car.addCamera(views[i].camera);
    cars.push(car);
  }

  // disable all views after view 1 that are enabled
  // i.e., the first view is default, even if no cars; the others are triggered by multiple people entering the game
  for(var i = 1; i < views.length; i++) {
    views[i].enabled = i < cars.length;
  }
  // set view cameras appropriately to number of cars
  // TODO: set these programatically
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
  * init() function to set up views, objects
  * @return undefined
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
    * Create skybox (side length of 5000)
    * Example used for template: stemkoski.github.io/Three.js/Skybox.html
    * @todo   Change images to match theme
    * @author Jonathan Lam
    */
  var imagePrefix = '/assets/dawnmountain-';
  var directions  = [ 'xpos', 'xneg', 'ypos', 'yneg', 'zpos', 'zneg' ];
  var imageSuffix = '.png';
  var skyGeometry = new THREE.CubeGeometry(5000, 5000, 5000);

  var materialArray = [];
  for (var i = 0; i < 6; i++) {
    materialArray.push(new THREE.MeshBasicMaterial({
      map: new THREE.TextureLoader().load(imagePrefix + directions[i] + imageSuffix),
      side: THREE.BackSide
    }));
  }
  var skyMaterial = materialArray;
  var skyBox = new THREE.Mesh(skyGeometry, skyMaterial);
  scene.add(skyBox);

  /**
    * Create spot light (sun, directly above)
    * @author Rahul Kiefer
    */
  var spotLight = new THREE.PointLight( 0xffffff );
  spotLight.position.set(0, 1000, 0);

  spotLight.shadow.camera.near = 500;
  spotLight.shadow.camera.far = 10000;

  scene.add(spotLight);

  /**
    * Create ambient light (is this necessary?)
    * @todo   Remove?
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
  floorTexture.repeat.set(1000, 1000);
  var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.DoubleSide } ); //floor looks better as a MeshBasicMaterial
  var floorGeometry = new THREE.PlaneGeometry(5000, 5000, 10, 10); //floor is 5000x5000 to match skybox
  var floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = Math.PI / 2;
  scene.add(floor);

  /**
    * Creating race track from path
    * @author Rahul Kiefer
    */


    race track as a fat line
    var trackPositions = [
      (150,50),
      (150,150),
      (100,175),
      (50,150),
      (50,50),
      (100,25),
      (150,50)
    ];

    var trackGeo = new THREE.LineGeometry();

    trackGeo.setPositions(positions);

    matLine = new THREE.LineMaterial( {
      color: 0xffffff,
      linewidth: 50, //in px
      vertexColors: THREE.vertexColors,
      dashed: false
    } );

    raceTrack = new THREE.Line2(trackGeo, matLine);
    raceTrack.computeLineDistances();
    raceTrack.scale.set(1, 1, 1);
    scene.add(raceTrack);


  /*

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
  trackTexture.repeat.set( 1, 1 );
  var trackMaterial = new THREE.MeshBasicMaterial( {map: trackTexture, side: THREE.DoubleSide} );
  var trackGeometry = new THREE.ExtrudeGeometry(track, trackExtrudeSettings);
  var raceTrackMesh = new THREE.Mesh( trackGeometry, trackMaterial );

  raceTrackMesh.rotation.x = Math.PI / 2;
  raceTrackMesh.position.y = 0.01; //barely above the ground
  scene.add(raceTrackMesh);

  */
}

/**
  * Function animate() to run the animation
  * This is run on every frame, by window.requestAnimationFrame()
  * @return undefined
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
  * render() function to render the scene by setting up each viewport (camera) as appropriate
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

// initialize the scene (both for clients and host)
init();

// begin the simulation/animation/game
animate();
