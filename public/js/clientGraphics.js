/**
  * client graphics file
  * <p>
  * Critical functions: render() (overwrite the one in hostGraphics)
  * Initialization is already set up in the main graphics file
  * @author Jonathan Lam
  */

// overwrite main render function (called when role is determined to be client)
function overwriteRender() {

  var camera = new THREE.PerspectiveCamera(30, width/height, 0.1, 20000);

  // TODO:
  render = function() {
    renderer.render(scene, camera);
  };

  // attach camera to correct car
  // TODO:
}
