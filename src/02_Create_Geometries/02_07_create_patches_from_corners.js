// This function takes a Model_Data_Object which contains the geometric data of the model.
function create_patches_from_corners(Model_Data_Object) {

    // Iterates over each SHELL object within the model data to process its geometry.
    Model_Data_Object.model_data.SHELLs.forEach(function(shell, index) {
        // Transforms the NODE_IDs of each shell, which are assumed to be arrays of [x, y, z] coordinates,
        // into BABYLON.Vector3 objects, which are required for creating 3D geometry in BABYLON.js.
        var paths = shell.NODE_IDs.map(function(node_ids) {
            return new BABYLON.Vector3(node_ids[0], node_ids[1], node_ids[2]);
        })

        // This block prepares the paths for the ribbon creation by grouping the Vector3 points.
        // Points are grouped in pairs to form the segments of the ribbon.
        var ribbonPaths = [];
        for (let i = 0; i < paths.length; i += 2) {
            ribbonPaths.push([paths[i], paths[Math.min(i + 1, paths.length - 1)]]);
        }

        // A ribbon is created for each shell. Ribbons are a way to visualize surfaces in 3D space.
        // The properties of the ribbon are configured, including its path, orientation, and updatable status.
        var ribbon = BABYLON.MeshBuilder.CreateRibbon("ribbon" + shell.ID, {pathArray: ribbonPaths, sideOrientation: BABYLON.Mesh.DOUBLESIDE, updatable: true}, scene);

        // Retrieves color and alpha (transparency) values from the shell's rendering parameters.
        var ribbon_color = shell.render_params.color;
        var ribbon_alpha = shell.render_params.alpha;

        // A material is created and configured with the color and transparency obtained previously.
        // This material is applied to the ribbon to define its appearance.
        var material = new BABYLON.StandardMaterial("material_NVUD_liftsurf" + shell.ID, scene);
        material.diffuseColor = new BABYLON.Color3(ribbon_color);
        material.alpha = ribbon_alpha; // Defines the transparency of the ribbon.

        // The material is then applied to the ribbon, completing its visual representation.
        ribbon.material = material;
    })

    // This appears to be a placeholder or unused variable, as it is set but never read or modified.
    var pp = 0;
}
