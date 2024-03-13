/// <reference path='../../lib/babylon.d.ts' />



function load_3D_asset_file(filename, scale = 1, rotate_around_x = true, alpha_mesh = 1) {

    // Create a standard material with transparency (alpha)
    var material = new BABYLON.StandardMaterial("materialWithAlpha", scene);

    /*
    material.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.8); // A blue color
    material.specularColor = new BABYLON.Color3(0.9, 0.9, 0.9); // Specular color for the Phong model

    if (alpha_mesh < 1) { material.alpha = 0.7} // Set alpha to 0.5 (50% transparent)
*/

                // Apply the material to the mesh
            

            // Apply a physically based material with metallic blue
            var pbr = new BABYLON.PBRMetallicRoughnessMaterial("pbr", scene);
            pbr.baseColor = new BABYLON.Color3(0.1, 0.1, 0.8); // A blue color
            pbr.metallic = 1.0; // Fully metallic
            pbr.roughness = 0.5; // Adjust for shininess, lower values are shinier
  



    //material.sideOrientation = BABYLON.Material.DoubleSide

    // Render both sides of the mesh
    //material.backFaceCulling = false; // This is key for double-sided rendering

    BABYLON.SceneLoader.ImportMesh("", "./assets/", filename, scene, function (meshes) {
        // Scale the model
        meshes.forEach(function (mesh) {
            mesh.scaling = new BABYLON.Vector3(scale, scale, scale); // Scale by a factor of scale in all directions
            if (rotate_around_x) {mesh.rotation.x = BABYLON.Tools.ToRadians(90)}

            //mesh.material = pbr
            //mesh.material = material
            
        })
    })
}




// HTML code to display the rear parameters form
// Get the modal
var modal = document.getElementById('myModal');

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

document.getElementById('3DfileInput').onchange = function() {
modal.style.display = "block";
};

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
modal.style.display = "none";
};

function cancelEverything() {
modal.style.display = 'none';
document.getElementById('3DfileInput').value = ''; // Reset file input
document.getElementById('scaleForm').reset(); // Reset form values
}

function openFileWrapper() {
var filename = document.getElementById('3DfileInput').files[0].name;
var scale = document.getElementById('scaleFactor').value;
var alpha_value = document.getElementById('alpha_3D_file').value;
var rotate = document.getElementById('rotateCheck').checked;
load_3D_asset_file(filename, parseFloat(scale) , rotate, alpha_value)
modal.style.display = 'none'; // Close the modal
}


// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
if (event.target == modal) {
modal.style.display = "none";
}
}




function updateScaleValue() {
    const originalUnits = document.getElementById('originalUnits').value;
    const scaleFactor = document.getElementById('scaleFactor');
    const scaleFactorValues = {
        'm': 1,
        'dm': 0.1,
        'cm': 0.01,
        'mm': 0.001,
        'in': 39.3700787402,
        'ft': 3.28083989501
    };

    scaleFactor.value = scaleFactorValues[originalUnits];
}

