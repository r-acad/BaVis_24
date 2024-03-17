/// <reference path='../../lib/babylon.d.ts' />



function load_3D_asset_file(filename, scale = 1, rotate_around_x = true, alpha_mesh = 1) {

    // Apply a physically based material with metallic blue
    var pbr = new BABYLON.PBRMetallicRoughnessMaterial("pbr", scene)

    pbr.baseColor = new BABYLON.Color3(0.7, 0.1, 0.8); // A blue color
    pbr.metallic = 1.0; // Fully metallic
    pbr.roughness = 0.5; // Adjust for shininess, lower values are shinier

    // Enable sub-surface scattering, allowing light to penetrate the surface for a softer, more realistic look.
    pbr.subSurface.isRefractionEnabled = true;
    pbr.subSurface.isTranslucencyEnabled = true;

    // Set the sub-surface scattering color to purple, enhancing the realism of light interaction.
    pbr.subSurface.tintColor = new BABYLON.Color3(.9, 0, 12);
    // Adjust the strength of the scattering effect.
    pbr.subSurface.tintColorAtDistance = 10;

    // Configure the material to render both sides of the mesh surfaces.
    pbr.sideOrientation = BABYLON.Material.DoubleSide;
    // Disable back-face culling to ensure both sides of each mesh surface are rendered.
    pbr.backFaceCulling = false;
    // Set the alpha transparency of the PBR material to the provided alpha_mesh value.
    pbr.alpha = alpha_mesh;
    // Use a combined alpha mode for blending transparent areas with the background.
    pbr.alphaMode = BABYLON.Engine.ALPHA_ONEONE
    // Enable a separate culling pass for depth sorting transparency more effectively.
    pbr.separateCullingPass = true;


    BABYLON.SceneLoader.ImportMesh("", "./assets/", filename, scene, function (meshes) {
        // Scale the model
        meshes.forEach(function (mesh) {
            mesh.scaling = new BABYLON.Vector3(scale, scale, scale); // Scale by a factor of scale in all directions
            if (rotate_around_x) { mesh.rotation.x = BABYLON.Tools.ToRadians(90) }

            mesh.material = pbr

            //BABYLON.EdgesRenderer is a tool used to render edges on top of a mesh. Edges are rendered between two faces if the dot product of their normals is less than epsilon.
            mesh.enableEdgesRendering(0.3);
            mesh.edgesWidth = 1.0;
            mesh.edgesColor = new BABYLON.Color4(1, 0, 0, 1);

            mesh.renderOutline = true;
            mesh.outlineColor = new BABYLON.Color3(0, 1, 0);
            mesh.outlineWidth = 0.03;
            //mesh.showBoundingBox = true;

        })
    })
}




// HTML code to display the rear parameters form
// Get the modal
var modal = document.getElementById('myModal');

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

document.getElementById('3DfileInput').onchange = function () {
    modal.style.display = "block";
};

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
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
    load_3D_asset_file(filename, parseFloat(scale), rotate, alpha_value)
    modal.style.display = 'none'; // Close the modal
}


// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
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

