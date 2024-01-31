
function plot_REST_points(scene, pointsJSON) {


            // Define your JSON string here
            //var pointsJSON = '{"P1": {"x": 1, "y": 2, "z": 3}, "P2": {"x": 4, "y": 5, "z": 6}, "P3": {"x": 7, "y": 8, "z": 9}, "P4": {"x": 10, "y": 11, "z": 12}}';


            var points = JSON.parse(pointsJSON);

            // Iterate through each point in the JSON and create a sphere at its coordinates
            for (var key in points) {
                if (points.hasOwnProperty(key)) {
                    var point = points[key];
                    var pointSphere = BABYLON.MeshBuilder.CreateSphere(key, {segments: 16, diameter: 2.2}, scene);
                    pointSphere.position = new BABYLON.Vector3(point.x, point.y, point.z);
                }
            }

        }