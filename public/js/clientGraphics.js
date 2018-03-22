/**
  * client graphics file
  * <p>
  * Critical functions: render() (overwrite the one in hostGraphics)
  * Initialization is already set up in the main graphics file
  * @author Jonathan Lam
  */

/**
  * Function overwriteRender to overwrite the main render function for a client
  * device.
  * <p>
  * This is called when the user's car is created (after the first updateCars()
  * in the 'updateNames' websocket event). It replaces the four-car view with a
  * simple view from the windshield of the client's car.
  * @param  id  socketId of the client; used to match the car
  * @return none
  * @author Jonathan Lam
  */
function overwriteRender(id) {

  // create camera
  var camera = new THREE.PerspectiveCamera(30, width/height, 0.1, 20000);
  camera.position.set(0, 3, 1.5);
  camera.rotation.set(0, Math.PI/2, 0);

  // attach camera to car (match socket ids)
  cars.find(car => car.id === id).addCamera(camera);

  // simple, single camera full-screen viewport
  render = function() {
    renderer.setViewport(0, 0, width, height);
    renderer.render(scene, camera);
  };
}
