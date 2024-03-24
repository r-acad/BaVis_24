
function create_ground(size, light, shadowGenerator) {

    ground_z = 0
    ground_x_shift = 40

    var groundMaterial = new BABYLON.StandardMaterial("groundMat", scene);
    //groundMaterial.mainColor = new BABYLON.Color3(0.49, 0.68, 0.83); // Grey-blue color
    //groundMaterial.diffuseColor = new BABYLON.Color3(0.39, 0.58, 0.93);
    //groundMaterial.lineColor = new BABYLON.Color3(0.8, 0.8, 0.8); // Light grey lines
    //groundMaterial.gridRatio = 1;

    // Create a basic plane as the ground
    ground = BABYLON.MeshBuilder.CreateGround("ground", { width: size, height: size, subdivisions: 20 }, scene);

    ground.rotation.z = Math.PI / 2;
    ground.rotation.y = Math.PI / 2;
    ground.position.x = ground_x_shift

    ground.up = new BABYLON.Vector3(0, 0, 1)
    ground.position.z = ground_z



    
    // Creating minor ground grid lines
    var minor_lines = [];
    var minor_lineColor = new BABYLON.Color3(0.7, 0.8, 0.9);
    
    var minor_step = 1

    for (var i = -size/2; i <= size/2; i += minor_step) {
        
 
        
                 // Vertical
        //minor_lines.push([new BABYLON.Vector3(i, 0.01, -size/2), new BABYLON.Vector3(i, 0.01, size/2)]);
        //minor_lines.push([new BABYLON.Vector3(-size/2, 0.01, i), new BABYLON.Vector3(size/2, 0.01, i)]);
        

        // Horizontal
        minor_lines.push([new BABYLON.Vector3(i, -size/2, ground_z), new BABYLON.Vector3(i, size/2, ground_z)]);
        minor_lines.push([new BABYLON.Vector3(-size/2, i, ground_z), new BABYLON.Vector3(size/2, i, ground_z)]);


    }

    minor_gridLines = BABYLON.MeshBuilder.CreateLineSystem("minor_gridLines", {lines: minor_lines}, scene);
                
    var gridMaterial = new BABYLON.StandardMaterial("gridMat", scene);
    gridMaterial.emissiveColor = minor_lineColor;
    minor_gridLines.color = minor_lineColor;
    minor_gridLines.isPickable = true



    // Creating major ground grid lines
    major_lines = [];
    var major_lineColor = new BABYLON.Color3(0.9, 0.99, 0.99);
    
    var major_step = 10 //minor_step * 10

    for (var i = -size/2; i <= size/2; i += major_step) {
        
                        // Vertical
        
        //major_lines.push([new BABYLON.Vector3(i, 0.01, -size/2), new BABYLON.Vector3(i, 0.01, size/2)]);
        //major_lines.push([new BABYLON.Vector3(-size/2, 0.01, i), new BABYLON.Vector3(size/2, 0.01, i)]);
        


                        // Horizontal
                        major_lines.push([new BABYLON.Vector3(i, -size/2, ground_z), new BABYLON.Vector3(i, size/2, ground_z)]);
                        major_lines.push([new BABYLON.Vector3(-size/2, i, ground_z), new BABYLON.Vector3(size/2, i, ground_z)]);
    }

    major_gridLines = BABYLON.MeshBuilder.CreateLineSystem("major_gridLines", {lines: major_lines}, scene);
    
    var gridMaterial = new BABYLON.StandardMaterial("gridMat", scene);
    gridMaterial.emissiveColor = major_lineColor;
    major_gridLines.color = major_lineColor;
    major_gridLines.isPickable = true

minor_gridLines.position.x = ground_x_shift
major_gridLines.position.x = ground_x_shift



// Move ground to a position consistent with GUI (OJO!!! check this and make it more elegant)
ground.position.z = -3
major_gridLines.position.z = -3
minor_gridLines.position.z = -3


    var axisLength = 1 // Length of each axis
    var axisThickness = axisLength / 15; // Thickness of the axes

    // Red X Axis
    var xAxis = BABYLON.MeshBuilder.CreateCylinder("xAxis", { height: axisLength, diameter: axisThickness }, scene);
    xAxis.material = new BABYLON.StandardMaterial("xAxisMat", scene);
    xAxis.material.diffuseColor = new BABYLON.Color3(1, 0, 0);
    xAxis.position = new BABYLON.Vector3(axisLength / 2, 0, 0);
    xAxis.rotation.z = Math.PI / 2;

    // Green Y Axis
    var yAxis = BABYLON.MeshBuilder.CreateCylinder("yAxis", { height: axisLength, diameter: axisThickness }, scene);
    yAxis.material = new BABYLON.StandardMaterial("yAxisMat", scene);
    yAxis.material.diffuseColor = new BABYLON.Color3(0, 1, 0);
    yAxis.position = new BABYLON.Vector3(0, axisLength / 2, 0);

    // Blue Z Axis
    var zAxis = BABYLON.MeshBuilder.CreateCylinder("zAxis", { height: axisLength, diameter: axisThickness }, scene);
    zAxis.material = new BABYLON.StandardMaterial("zAxisMat", scene);
    zAxis.material.diffuseColor = new BABYLON.Color3(0, 0, 1);
    zAxis.position = new BABYLON.Vector3(0, 0, axisLength / 2);
    zAxis.rotation.x = Math.PI / 2;

    // Cones to represent the direction of the axes
    // The cones are placed at the end of the axes, and their rotation is aligned with the axes
    var coneHeight = axisThickness * 4
    var coneDiameter = axisThickness * 2
    createCone(new BABYLON.Vector3(axisLength, 0, 0), coneHeight, coneDiameter, new BABYLON.Color3(1, 0, 0), scene, 'x');
    createCone(new BABYLON.Vector3(0, axisLength, 0), coneHeight, coneDiameter, new BABYLON.Color3(0, 1, 0), scene, 'y');
    createCone(new BABYLON.Vector3(0, 0, axisLength), coneHeight, coneDiameter, new BABYLON.Color3(0, 0, 1), scene, 'z');


    function createCone(position, height, diameter, color, scene, axis) {
        var cone = BABYLON.MeshBuilder.CreateCylinder("cone", {
            height: height,
            diameterTop: 0,
            diameterBottom: diameter
        }, scene);
        cone.material = new BABYLON.StandardMaterial("coneMat", scene);
        cone.material.diffuseColor = color;

        // Adjust the position and rotation according to the axis
        cone.position = position;
        switch (axis) {
            case 'x':
                cone.rotation.z = -1 * Math.PI / 2;
                break;
            case 'y':
                // No rotation needed for Y axis; it's the default orientation
                break;
            case 'z':
                cone.rotation.x = Math.PI / 2;
                break;
        }
        return cone;
    }

}