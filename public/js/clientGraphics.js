/**
  * client graphics file
  * <p>
  * Critical functions: render() (overwrite the one in hostGraphics)
  * Initialization is already set up in the main graphics file
  * @author Jonathan Lam
  */

// overwrite main render function (called when role is determined to be client)
function overwriteRender() {

  // create camera, attach to correct car
  var camera = new THREE.PerspectiveCamera(30, width/height, 0.1, 20000);

  // simple, single camera full-screen viewport
  render = function() {
    renderer.setViewport(0, 0, width, height);
    renderer.render(scene, camera);
  };
}
