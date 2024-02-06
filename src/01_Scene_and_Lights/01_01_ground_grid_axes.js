
function create_ground(size, light, shadowGenerator) {


            // Create a basic plane as the ground
            //var ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 100, height: 100, subdivisions: 2}, scene);
            var ground = BABYLON.MeshBuilder.CreateGround("ground", {width: size, height: size}, scene);
            //var groundMaterial = new BABYLON.GridMaterial("groundMat", scene);

            ground.position.y = 0
            
            var groundMaterial = new BABYLON.StandardMaterial("groundMat", scene);
            groundMaterial.mainColor = new BABYLON.Color3(0.49, 0.68, 0.83); // Grey-blue color
            groundMaterial.diffuseColor = new BABYLON.Color3(0.39, 0.58, 0.93);
            groundMaterial.lineColor = new BABYLON.Color3(0.8, 0.8, 0.8); // Light grey lines
            groundMaterial.gridRatio = 1;
            ground.material = groundMaterial;
            // Receive shadows
            ground.receiveShadows = true;

            // Creating minor ground grid lines
            var minor_lines = [];
            var minor_lineColor = new BABYLON.Color3(0.6, 0.6, 0.7);
            
            var minor_step = 1

            for (var i = -size/2; i <= size/2; i += minor_step) {
                minor_lines.push([new BABYLON.Vector3(i, 0.01, -size/2), new BABYLON.Vector3(i, 0.01, size/2)]);
                minor_lines.push([new BABYLON.Vector3(-size/2, 0.01, i), new BABYLON.Vector3(size/2, 0.01, i)]);
            }

            var minor_gridLines = BABYLON.MeshBuilder.CreateLineSystem("minor_gridLines", {lines: minor_lines}, scene);
                        
            var gridMaterial = new BABYLON.StandardMaterial("gridMat", scene);
            gridMaterial.emissiveColor = minor_lineColor;
            minor_gridLines.color = minor_lineColor;
            minor_gridLines.isPickable = true

            // Creating major ground grid lines
            var major_lines = [];
            var major_lineColor = new BABYLON.Color3(0.7, 0.8, 0.9);
            
            var major_step = 10 //minor_step * 10

            for (var i = -size/2; i <= size/2; i += major_step) {
                major_lines.push([new BABYLON.Vector3(i, 0.01, -size/2), new BABYLON.Vector3(i, 0.01, size/2)]);
                major_lines.push([new BABYLON.Vector3(-size/2, 0.01, i), new BABYLON.Vector3(size/2, 0.01, i)]);
            }

            var major_gridLines = BABYLON.MeshBuilder.CreateLineSystem("major_gridLines", {lines: major_lines}, scene);
            
            var gridMaterial = new BABYLON.StandardMaterial("gridMat", scene);
            gridMaterial.emissiveColor = major_lineColor;
            major_gridLines.color = major_lineColor;
            major_gridLines.isPickable = true







/*

 // Axis lines for X, Y, Z
 var axisX, axisY, axisZ;

 // Create a point at the center of rotation (COR)
 var corPoint = BABYLON.MeshBuilder.CreateSphere('corPoint', {diameter: 0.2}, scene);
 corPoint.material = new BABYLON.StandardMaterial('corMaterial', scene);
 corPoint.material.diffuseColor = new BABYLON.Color3(1, 1, 0); // Yellow color
 corPoint.position = BABYLON.Vector3.Zero();

 // Function to update the position of the axes and COR
 var updateAxesAndCOR = function (targetPosition) {
     if (axisX) {
         axisX.dispose();
         axisY.dispose();
         axisZ.dispose();
     }
     var axisSize = size;
     var makeAxis = function (name, start, end, color) {
         var points = [
             start,
             end,
             end.subtract(new BABYLON.Vector3(0.1, 0, 0)),
             end,
             end.subtract(new BABYLON.Vector3(0, 0.1, 0))
         ];
         var axis = BABYLON.MeshBuilder.CreateLines(name, {points: points}, scene);
         axis.color = color;
         return axis;
     };

     axisX = makeAxis('axisX', targetPosition, targetPosition.add(new BABYLON.Vector3(axisSize, 0, 0)), new BABYLON.Color3(1, 0, 0));
     axisY = makeAxis('axisY', targetPosition, targetPosition.add(new BABYLON.Vector3(0, axisSize, 0)), new BABYLON.Color3(0, 1, 0));
     axisZ = makeAxis('axisZ', targetPosition, targetPosition.add(new BABYLON.Vector3(0, 0, axisSize)), new BABYLON.Color3(0, 0, 1));

     // Update COR position
     corPoint.position = targetPosition;
 };

 // Initial update of axes and COR at the origin
 updateAxesAndCOR(BABYLON.Vector3.Zero());

*/



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
    switch(axis) {
        case 'x':
            cone.rotation.z = -1*Math.PI / 2;
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

var axisLength = size/40; // Length of each axis
var axisThickness = axisLength/40; // Thickness of the axes

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
var coneHeight = axisThickness*4
var coneDiameter = axisThickness*2
createCone(new BABYLON.Vector3(axisLength, 0, 0), coneHeight, coneDiameter, new BABYLON.Color3(1, 0, 0), scene, 'x');
createCone(new BABYLON.Vector3(0, axisLength, 0), coneHeight, coneDiameter, new BABYLON.Color3(0, 1, 0), scene, 'y');
createCone(new BABYLON.Vector3(0, 0, axisLength), coneHeight, coneDiameter, new BABYLON.Color3(0, 0, 1), scene, 'z');







        }