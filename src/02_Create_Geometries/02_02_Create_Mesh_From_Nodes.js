function Create_Mesh_from_Nodes(Model_Data_Object, scale_mesh_by = 1, single_mesh = true, material_alpha = 1) {


  scale_mesh_by = (Model_Data_Object.geometric_data_object.Bounding_Box.max_box_side < 200) ? 1 : 0.001

  
initTime = Date.now()

//var Model_Data_Object = mesh_by_Nodes_data_example   // UNCOMMENT FOR TESTING WITH TEST DATA, OVERRIDE INPUT TO FUNCTION




FEM_nodes = Model_Data_Object.geometric_data_object.NODEs


CORDs = Model_Data_Object.geometric_data_object.CORDs

for (var key in CORDs) {
  if (CORDs.hasOwnProperty(key)) {
      var CORD_center = CORDs[key].A.slice(1,4).map(x =>  x * scale_mesh_by)
            
      var vec_U = CORDs[key].U.slice(1,4)
      var vec_V = CORDs[key].V.slice(1,4)
      var vec_W = CORDs[key].W.slice(1,4)





        // Create a line
        drawPointsAndLine([CORD_center, myMath_0_index.add_vectors( CORD_center , vec_U)], radius = 0, lineColor = 'red')
        drawPointsAndLine([CORD_center, myMath_0_index.add_vectors( CORD_center , vec_V)], radius = 0, lineColor = 'green')
        drawPointsAndLine([CORD_center, myMath_0_index.add_vectors( CORD_center , vec_W)], radius = 0, lineColor = 'blue')



  }
}





// Draw plotels
PLOTELs = Model_Data_Object.geometric_data_object.PLOTELs

for (var key in PLOTELs) {
  if (PLOTELs.hasOwnProperty(key)) {
      var node1 = PLOTELs[key].NODE_IDs[1]
      var node2 = PLOTELs[key].NODE_IDs[2]

        // Points to draw line between
        var pointA = Model_Data_Object.geometric_data_object.NODEs[node1].X.slice(1,4)
        var pointB = Model_Data_Object.geometric_data_object.NODEs[node2].X.slice(1,4)

        // Create a line
        drawPointsAndLine([pointA, pointB], radius = 0.1)
  }
}

/**
 * Draws a line connecting a series of points in 3D space and places spheres at each point.
 * @param {BABYLON.Scene} scene - The Babylon.js scene object.
 * @param {Array<Array<number>>} pointsArray - An array of points, where each point is an array of three numbers [x, y, z].
 * @param {number} radius - The radius of the spheres to place at each point (default is 0.1).
 * @returns {BABYLON.LinesMesh|BABYLON.Mesh} - The created geometry, either line or single sphere.
 */
function drawPointsAndLine(pointsArray, radius = 0.1, lineColor = 'white') {
  if (!pointsArray.length) {
      console.warn("No points provided.");
      return;
  }

  // Only create spheres if the radius is greater than 0
  if (radius > 0) {
    pointsArray.forEach((point) => {
        var sphere = BABYLON.MeshBuilder.CreateSphere("sphere", { diameter: 2 * radius }, scene);
        sphere.position = new BABYLON.Vector3(point[0], point[1], point[2]);
    });
  }

  // If only one point, and spheres are drawn, return the created sphere
  if (pointsArray.length === 1 && radius > 0) {
      return sphere;
  }

  // Convert the array of points into an array of BABYLON.Vector3
  var points = pointsArray.map(function(point) {
      return new BABYLON.Vector3(point[0], point[1], point[2]);
  });

  // Parse the color input to create a Color4 object (assuming color names are simple and can be converted to RGB)
  const colorRGB = get_Color_from_scalar_rgb_rgbalpha_or_name(lineColor)
  const color4 = new BABYLON.Color4(colorRGB.r, colorRGB.g, colorRGB.b, 1);  // Alpha is set to 1 for full opacity

  // Create the line mesh using the points and the color
  var line = BABYLON.MeshBuilder.CreateLines("lineMesh", { points: points, updatable: false }, scene);
  line.color = color4
  return line;
}

// end of draw plotels





/*
for (var key in FEM_nodes) {
  if (FEM_nodes.hasOwnProperty(key)) {
      var node_coordinates = FEM_nodes[key].X
      //var node_Marker = BABYLON.MeshBuilder.CreateSphere(key, {segments: 3, diameter: .1}, scene);

      var node_Marker = BABYLON.MeshBuilder.CreateBox(key, {height: .04, width: .04, depth: .04}, scene);

      node_Marker.position = new BABYLON.Vector3(node_coordinates[1]*scale_mesh_by, node_coordinates[2]*scale_mesh_by, node_coordinates[3]*scale_mesh_by)
      //pointSphere.position = new BABYLON.Vector3(0,0,0)
  }
}
*/


CAERO_macro_aero_panels = Model_Data_Object.geometric_data_object.CAEROs

Plot_CAERO_macro_panels(CAERO_macro_aero_panels) 

function Plot_CAERO_macro_panels(data) {

  // Iterate over each key in the data object
  for (let key in data) {
      if (data.hasOwnProperty(key)) {
          // Check if P array exists and has at least 4 elements
          if (data[key].P && data[key].P.length >= 5) {
              // Slice the P array from index 1 to 5 (end index is exclusive)
              let node_coordinates_array = data[key].P.map((x) => x.slice(1, 4))
              // Plot the CAERO panels
              create_single_SHELL_from_3_or_4_points(node_coordinates_array, label = key , "CAERO1")

          }
      }
  }




}


function create_single_SHELL_from_3_or_4_points(nodes, label = null, prefix = null) {
  // Create custom mesh
  var customMesh = new BABYLON.Mesh("custom", scene);

  // Positions and indices for the mesh
  var vertexData = new BABYLON.VertexData();
  var positions = [];
  var indices = (nodes.length == 3) ? [0, 1, 2] : [0, 1, 2, 0, 2, 3]; // Define one or two triangles

  // Compute centroid
  var centroid = [0, 0, 0];
  nodes.forEach(node => {
      positions.push(node[0] * scale_mesh_by, node[1] * scale_mesh_by, node[2] * scale_mesh_by);
      centroid[0] += node[0];
      centroid[1] += node[1];
      centroid[2] += node[2];
  });

  centroid = centroid.map(coord => coord * scale_mesh_by / nodes.length);

  vertexData.positions = positions;
  vertexData.indices = indices;
  vertexData.applyToMesh(customMesh, true);

  // Create material and apply random color
  var material = new BABYLON.StandardMaterial("material", scene);
  material.diffuseColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
  material.backFaceCulling = false; // Visible from both sides
  customMesh.material = material;

  // Create a GUI label in 3D space if a label is requested
  if (label) {

    if (prefix) {label = prefix + " " + label}
      // Create a plane to host the GUI label
      var labelPlane = BABYLON.MeshBuilder.CreatePlane("labelPlane", { size: 10 }, scene);
      labelPlane.position = new BABYLON.Vector3(centroid[0], centroid[1], centroid[2]);
      labelPlane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL; // Always face the camera
      labelPlane.isPickable = false; // Make the plane non-interactive
      labelPlane.renderingGroupId = 1; // Render this plane on top of other meshes

      // Attach a dynamic texture to the plane
      var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(labelPlane);

      // Create the text block
      var textBlock = new BABYLON.GUI.TextBlock();
      textBlock.text = label;
      textBlock.color = "white";
      textBlock.fontSize = 20;  // Can adjust based on visibility needs
      advancedTexture.addControl(textBlock);
  }
}





//return

if (single_mesh) {
  // CREATE SINGLE MESH FOR ALL SHELLS

        var positions =  []   // these get initialized for each shell, which will become a mesh
        var indices =    []
        var nodelist =   []  // initialize list of nodes to traverse, different for each element
        var colors =     []  // initialize array of colors
        var index =      0   // initialize index for nodes

        const nodelistQUAD =  [1, 2, 3, 4, 1, 3] 
        const nodelistTRIA =  [1, 2, 3]

        
        for (const [id, shell] of Object.entries(Model_Data_Object.geometric_data_object.SHELLs)) {

          switch (shell.NODE_IDs.slice(1).length) {   // Define a node list to traverse the nodes of a shell depending on its number of nodes
                    case 4:
                      nodelist = nodelistQUAD
                    break
                    default:
                      nodelist = nodelistTRIA
                }

                // OJO!!! The slice is to make the indices 1-based as in the nastran code


            nodelist.forEach((shell_nodeId ) => {

            //shell.NODE_IDs.slice(1).forEach((nodeId ) => {
            //var node = Model_Data_Object.geometric_data_object.NODEs[nodeId]

            var node = Model_Data_Object.geometric_data_object.NODEs[shell.NODE_IDs[shell_nodeId]]

            positions.push(node.X[1]*scale_mesh_by, node.X[2]*scale_mesh_by, node.X[3]*scale_mesh_by)  // populate array of positions (the x, y, z coordinates of each node)
            
            // let color =  gradcol(shell.color * scale_mesh_by, 1, 13, true) 
            // colors.push(color.r, color.g, color.b, 1)

            //colors.push(.6, .7, .4, 1)
            //colors.push( gradcol(nastran_model.PSHELLs[shell.PID].T*1000))



            //let color =  gradcol((nastran_model.PSHELLs[shell.PID].T*1000*scale_mesh_by), 1, 10, true) 
            let color =  scalarToRainbowColor((nastran_model.PSHELLs[shell.PID].T*1000*scale_mesh_by), 1, 10, true) 

             colors.push(color.r, color.g, color.b, 1)



            indices.push(index)  // populate array of unique indices of each node
            index++  // increment the counter of indices          
          })
          }


          // Create ONE custom mesh FOR ALL SHELLs
          var customMesh = new BABYLON.Mesh("shell", scene)
          var vertexData = new BABYLON.VertexData()

          vertexData.positions = positions
          vertexData.indices = indices
          vertexData.colors = colors

          vertexData.applyToMesh(customMesh, true)

          var material = new BABYLON.StandardMaterial("material", scene)

          material.backFaceCulling = false; // Render both sides
          material.alpha = material_alpha
          customMesh.material = material
      
      } else { // ONE MESH PER SHELL (expensive!!)

        Model_Data_Object.geometric_data_object.SHELLs.slice(0,120384).forEach(shell => {  // go shell by shell
          var positions = []   // these get initialized for each shell, which will become a mesh
          var indices = []

          Array.from([shell.NODE_IDs[0], shell.NODE_IDs[1], shell.NODE_IDs[2]]).forEach((nodeId, index) => {  // Always add nodes corresponding to the triangle 1,2,3
              var node = Model_Data_Object.geometric_data_object.NODEs.find(n => n.ID === nodeId);
              positions.push(node.X[0]*scale_mesh_by, node.X[1]*scale_mesh_by, node.X[2]*scale_mesh_by);
              indices.push(index)}
            )

        if (shell.NODE_IDs.length > 3) {  // if there are more than 3 nodes (OJO!  modify this to represent CQUAD8 etc...)

          Array.from([shell.NODE_IDs[2], shell.NODE_IDs[3], shell.NODE_IDs[0]]).forEach((nodeId, index) => {
            var node = Model_Data_Object.geometric_data_object.NODEs.find(n => n.ID === nodeId);
            positions.push(node.X[0]*scale_mesh_by, node.X[1]*scale_mesh_by, node.X[2]*scale_mesh_by);
            indices.push(index + 3)}
            )
          } // end if

          // Create custom mesh FOR EACH SHELL
          var customMesh = new BABYLON.Mesh("shell", scene)
          var vertexData = new BABYLON.VertexData()

          vertexData.positions = positions
          vertexData.indices = indices

          vertexData.applyToMesh(customMesh, true)

          var material = new BABYLON.StandardMaterial("material", scene);
          material.diffuseColor = gradcol(shell.color*scale_mesh_by)
          material.backFaceCulling = false; // Render both sides
          material.alpha = .5
          customMesh.material = material;
      })


      }  // end if and end of mesh creation


timeElpsed = (Date.now() - initTime) / 1000

console.log("Time to render mesh " , timeElpsed)

    }