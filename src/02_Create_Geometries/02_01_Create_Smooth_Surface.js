function surface_smooth(fun, scene, shadowGenerator, recipe = {"color3" : [.4, .5, .6] , "alpha" : 1, "wireframe" : false}    ) {
  var size = 100;
  var data = {
      positions: [],
      indices: [],
      normals: []
  };


  var colors = [];
 
  function hslToRgb(h, s, l) {
    s /= 100;
    l /= 100;
  
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n => l - a * Math.max(Math.min(k(n) - 3, 9 - k(n), 1), -1);
    
    return new BABYLON.Color3(f(0), f(8), f(4));
}

function valueToRainbowColor(value, min, max) {
    // Ensure the value is within the range
    value = Math.min(Math.max(value, min), max);
    
    // Calculate the hue value based on the position within the range
    const hue = ((value - min) / (max - min)) * 360; // Hue value goes from 0 to 360

    // Convert HSL to RGB
    return hslToRgb(hue, 100, 50);
}


  var index = 0;
  for (var x = -size; x <= size; x++) {
      for (var z = -size; z <= size; z++) {
          var y = fun(x, z) / size;
          data.positions.push(x, y, z);
          if (x < size && z < size) {
              var i = index;
              data.indices.push(i, i + 2 * size + 1, i + 1);
              data.indices.push(i + 1, i + 2 * size + 1, i + 2 * size + 2);
          }

                      // Push color based on the y value
                      var color = new BABYLON.Color3(y/5, 0, 1 - y/5);
                      color = valueToRainbowColor(y, -10, 100)
                      colors.push(color.r, color.g, color.b, 1); // Alpha is 1
          
          index++
      }
  }

  // Create mesh from data
  var customMesh = new BABYLON.Mesh("custom", scene);
  var vertexData = new BABYLON.VertexData();
  vertexData.positions = data.positions;
  vertexData.indices = data.indices;

  // Calculate normals for the vertices
  BABYLON.VertexData.ComputeNormals(data.positions, data.indices, data.normals);
  vertexData.normals = data.normals;
  vertexData.colors = colors;

  // Apply vertex data to the custom mesh
  vertexData.applyToMesh(customMesh, true);

  
  // Create a standard material with the given color
  var material = new BABYLON.StandardMaterial("material", scene);
  material.diffuseColor = new BABYLON.Color3(recipe.color3[0], recipe.color3[1], recipe.color3[2] ); // Use the color provided in the function argument


  material.specularColor = new BABYLON.Color3(1, 1, 1); // White specular highlights
  material.backFaceCulling = false; // Render both sides of the mesh
  material.alpha = recipe.alpha
  material.wireframe = recipe.wireframe

  // Assign the material to the mesh
  customMesh.material = material;

  // Optional: Update mesh's side orientation to be double sided
  customMesh.sideOrientation = BABYLON.Mesh.DOUBLESIDE;

  // Create a shadow generator for casting shadows
  //var shadowGenerator = new BABYLON.ShadowGenerator(1024, new BABYLON.DirectionalLight("DirLight", new BABYLON.Vector3(0, -1, 0), scene));

  // Configure the mesh to cast and receive shadows
  shadowGenerator.getShadowMap().renderList.push(customMesh);
  customMesh.receiveShadows = true;


}
