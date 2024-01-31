function Create_Mesh_from_Nodes(Model_Data_Object, scale_mesh_by = 1, single_mesh = true, material_alpha = 1) {

initTime = Date.now()

//var Model_Data_Object = mesh_by_Nodes_data_example   // UNCOMMENT FOR TESTING WITH TEST DATA, OVERRIDE INPUT TO FUNCTION

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



            let color =  gradcol((nastran_model.PSHELLs[shell.PID].T*1000), 1, 13, true) 
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