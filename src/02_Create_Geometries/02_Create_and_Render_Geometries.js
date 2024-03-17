/// <reference path='../../lib/babylon.d.ts' />

function Create_and_Render_Geometries() {

// Add objects to the scene
create_ground(1180, light, shadowGenerator) 





/*

// define generic functions for plotting surfaces
recipe1 = {"color3" : [.4, 1, .6] , "alpha" : .5, "wireframe" : false}
surface_smooth((x,z) => (x * x + z * z), scene, shadowGenerator, recipe1)

function f_surf2 (x,z) { return ((x  + z ) * -100)}
recipe2 = {"color3" : [1, .8, .6] , "alpha" : .5, "wireframe" : true}
surface_smooth(f_surf2, scene, shadowGenerator, recipe2)


//plot_REST_points(scene)  // show points received from the server as spheres


create_points(scene)  // generate random points and connect them with random lines


// Read and show .stl file NEEDS TO BE SERVED IN ORDER TO READ LOCAL FILES, USE GO-LIVE IN VS-CODE
//load_STL_file('./assets/mares1.stl', 1/1)   //   F:\PhD\JS\BaVis\BaVis\assets

*/


//load_3D_asset_file('mares1.stl', scale = 1, rotate_around_x = true)
//load_3D_asset_file('c6dd.obj', scale = 1, rotate_around_x = true)


/*
    // Load the STL file
    BABYLON.SceneLoader.ImportMesh("", "./assets/", "c6dd.obj", scene, function (meshes) {
      // Scale the model
      meshes.forEach(function (mesh) {
          mesh.scaling = new BABYLON.Vector3(1, 1, 1); // Scale by a factor of 2 in all directions
          mesh.rotation.x = BABYLON.Tools.ToRadians(90)
      });
  });



  BABYLON.SceneLoader.ImportMesh("", "./assets/", "mares1.stl", scene, function (meshes) {
      // Scale the model
      meshes.forEach(function (mesh) {
          mesh.scaling = new BABYLON.Vector3(1, 1, 1); // Scale by a factor of 2 in all directions
          mesh.rotation.x = BABYLON.Tools.ToRadians(90)
      });
  });
*/


/*
load_3D_asset_file("./assets/", '10621_CoastGuardHelicopter.obj', scale = 10, rotate_around_x = true)

load_3D_asset_file("./assets/", "11805_airplane_v2_L2.obj", scale = .1, rotate_around_x = true)
*/



/*
function load_STL_file(path_and_filename, scale = 1.0) {

  // STL file to be loaded
  var stlFile = path_and_filename

  BABYLON.SceneLoader.ImportMesh("", "", stlFile, scene, function (newMeshes) {
      camera.target = newMeshes[0]

      var loadedMesh = newMeshes[0]

      loadedMesh.scaling = new BABYLON.Vector3(scale, scale, scale)
  })

}




// Read and show .obj file  // F:\PhD\JS\BaVis\BaVis\assets
BABYLON.SceneLoader.ImportMesh("", "./assets/", "c6dd.obj", scene, function (meshes) {
   // Scale the model
   meshes.forEach(function (mesh) {
   mesh.scaling = new BABYLON.Vector3(1, 1, 1); // Scale by a factor of 2 in all directions
  })
})
*/


/*
var complete_model_data_object_from_file = convert_MyJSON_to_proper_JSON(jsn)  // This variable contains the processed input file into a JS object

find_root_coordinate_systems(complete_model_data_object_from_file)

//Create_BALLs_from_Nodes(complete_model_data_object_from_file)

add_segments_to_scene(complete_model_data_object_from_file)

add_Coordinate_Systems_to_scene(complete_model_data_object_from_file)
*/


}