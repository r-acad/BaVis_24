/// <reference path='../../lib/babylon.d.ts' />

function add_segments_to_scene(geometric_data_object, scale_mesh_by = 1) {

    if (geometric_data_object.model_data.SEGMENTs) {  // if there are segments to render

        geometric_data_object.model_data.SEGMENTs.forEach(seg => { // each segment group has one or various elements with the same rendering options

            seg.DEF.forEach(el => { // loop through elements and apply segment rendering options
                create_Arrow_for_Vector(el, geometric_data_object, seg.render_params)

            })  // loop for each element of each segment
        }) // loop for each segment group
    } // end if
}


function create_Arrow_for_Vector(segment_points, geometric_data_object,
    { arrow_color = "black",
        arrow_length = false,
        arrow_angle = 15,
        thickness = 0,
        arrow_at_start_point = false,
        arrow_at_end = false,
        start_diameter = null,
        end_diameter = null,
        label_at_start_point = "_*coordinates*_",
        label_at_midpoint = "_*vector_length*_",
        label_at_end_point = "Testing culo",
        alpha = .5 } = {}// end of optional parameters (render parameters)
) {


    start_point_array = get_Vector_Coordinates_from_Definition(segment_points.START, geometric_data_object)
    start_point = new BABYLON.Vector3(start_point_array[0], start_point_array[1], start_point_array[2])

    end_point_array = get_Vector_Coordinates_from_Definition(segment_points.END, geometric_data_object)
    end_point = new BABYLON.Vector3(end_point_array[0], end_point_array[1], end_point_array[2])

    arrow_color_babylon = get_Color_from_scalar_rgb_rgbalpha_or_name(arrow_color)

    Vector_Length = end_point.subtract(start_point).length()   // Calculate vector length

    midpoint = start_point.add((end_point.subtract(start_point)).scale(0.5))  //                  (start_point.add(end_point)).scale(0.5))

    start_point_coordinates_as_text = start_point.x + ", " + start_point.y + ", " + start_point.z
    mid_point_coordinates_as_text = midpoint.x + ", " + midpoint.y + ", " + midpoint.z
    end_point_coordinates_as_text = end_point.x + ", " + end_point.y + ", " + end_point.z

    // Red material for the lines
    var VectorMaterial = new BABYLON.StandardMaterial("VectorMaterial", scene);
    VectorMaterial.emissiveColor = arrow_color_babylon
    VectorMaterial.diffuseColor = arrow_color_babylon
    VectorMaterial.backFaceCulling = true // Cull back faces
    VectorMaterial.alpha = alpha

    if (thickness == 0) {  // Draw lines

        // CREATE LINE ARROWS
        // Draw the vector line
        var lines = BABYLON.MeshBuilder.CreateLines("lines", { points: [start_point, end_point] }, scene);
        lines.color = arrow_color_babylon // Set line color to red by default

        // Calculate arrowhead orientation
        var direction = end_point.subtract(start_point).normalize();
        var arrowLength = (arrow_length == null) ? Vector_Length / 8 : arrow_length // Length of the arrowhead lines
        var angle = (180 - arrow_angle) / 180 * (Math.PI) // angle of the arrowheads

        // Calculate left and right directions for the arrowheads
        var left = new BABYLON.Vector3(
            direction.x * Math.cos(angle) - direction.y * Math.sin(angle),
            direction.x * Math.sin(angle) + direction.y * Math.cos(angle),
            0
        ).scale(arrowLength);

        var right = new BABYLON.Vector3(
            direction.x * Math.cos(-angle) - direction.y * Math.sin(-angle),
            direction.x * Math.sin(-angle) + direction.y * Math.cos(-angle),
            0
        ).scale(arrowLength);

        if (arrow_at_end) {
            // Draw arrowheads
            var arrowHead1 = BABYLON.MeshBuilder.CreateLines("arrowHead1", { points: [end_point, end_point.add(left)] }, scene);
            arrowHead1.color = arrow_color_babylon

            var arrowHead2 = BABYLON.MeshBuilder.CreateLines("arrowHead2", { points: [end_point, end_point.add(right)] }, scene);
            arrowHead2.color = arrow_color_babylon
        }

        if (arrow_at_start_point) {
            var arrowHead3 = BABYLON.MeshBuilder.CreateLines("arrowHead1", { points: [start_point, start_point.subtract(left)] }, scene);
            arrowHead3.color = arrow_color_babylon

            var arrowHead4 = BABYLON.MeshBuilder.CreateLines("arrowHead2", { points: [start_point, start_point.subtract(right)] }, scene);
            arrowHead4.color = arrow_color_babylon
        }

    } else {  // Given a thickness, draw tubes

        // CREATE THICK ARROWS
        // Cone height
        var coneHeight = thickness * 4

        // Adjust points for tube
        var direction = end_point.subtract(start_point).normalize()

        var adjustedstart_point = eval(arrow_at_start_point) ? start_point.add(direction.scale(coneHeight / 1)) : start_point
        var adjustedend_point = eval(arrow_at_end) ? end_point.subtract(direction.scale(coneHeight / 1)) : end_point

        var intermediatePoints = (start_diameter == end_diameter) ? 1 : 61  // Number of intermediate points
        var path = [];
        for (let i = 0; i <= intermediatePoints; i++) {
            var t = i / intermediatePoints
            var point = BABYLON.Vector3.Lerp(adjustedstart_point, adjustedend_point, t)
            path.push(point)
        }

        // Radius function to create the tapering effect
        var radiusFunction1 = function (i, distance) {

            diameterStart = (start_diameter == null) ? thickness : start_diameter
            diameterEnd = (end_diameter == null) ? thickness : end_diameter

            var radiusStart = diameterStart / 2
            var radiusEnd = diameterEnd / 2

            // Define the path from start to end point
            var path = [adjustedstart_point, adjustedend_point]

            return radiusStart + (radiusEnd - radiusStart) * (i / (path.length - 1));
        }




        var radiusFunction = function (i, xpos) {
            diameterStart = (start_diameter == null) ? thickness : start_diameter
            diameterEnd = (end_diameter == null) ? thickness : end_diameter
            var distance = BABYLON.Vector3.Distance(adjustedstart_point, adjustedend_point)
            var x = xpos / distance // Use the actual distance along the path

            if ((diameterEnd - diameterStart) > 0) {
                var radius = diameterStart / 2 + (diameterEnd - diameterStart) / 2 * Math.pow(x, .4)
            } else {
                var radius = diameterEnd/2 -  (diameterEnd-diameterStart)/2*Math.pow((1-x), .4) //+ diameterEnd / 2;
            }


            return radius
        }


        // Create Tube
        var tube = BABYLON.MeshBuilder.CreateTube("tube", {
            path: path,
            radiusFunction: radiusFunction,
            //radiusFunction: thickness,
            tessellation: 25,
            sideOrientation: BABYLON.Mesh.DOUBLESIDE // make all faces visible
        }, scene)
        tube.material = VectorMaterial;


        // Function to add a cone-shaped cylinder as an arrowhead
        var addCone = function (position, direction) {
            var cone = BABYLON.MeshBuilder.CreateCylinder("cone", {
                diameterTop: 0,
                diameterBottom: thickness * 2,
                height: coneHeight,
                tessellation: 16,
                sideOrientation: BABYLON.Mesh.DOUBLESIDE // make all faces visible
            }, scene)

            cone.position = position
            cone.material = VectorMaterial


            // Aligning the cone with the tube's direction
            var axis = new BABYLON.Vector3(0, 1, 0);
            var angle = Math.acos(BABYLON.Vector3.Dot(axis, direction));
            var axisNormal = BABYLON.Vector3.Cross(axis, direction).normalize();
            cone.rotationQuaternion = BABYLON.Quaternion.RotationAxis(axisNormal, angle)

        }

        // Add Cones as Arrowheads
        if (eval(arrow_at_end)) { addCone(adjustedend_point.add(direction.scale(coneHeight / 2)), direction) }

        if (eval(arrow_at_start_point)) { addCone(adjustedstart_point.subtract(direction.scale(coneHeight / 2)), direction.negate()) }

    } // end if thickness


    // Use entered text or keywords to represent point coordinates or vector length
    if (label_at_start_point) {
        the_label_text = (label_at_start_point == "_*coordinates*_") ? start_point_coordinates_as_text : label_at_start_point
        add_label_to_scene(label_location = start_point, label_text = the_label_text)
    }

    if (label_at_end_point) {
        the_label_text = (label_at_end_point == "_*coordinates*_") ? end_point_coordinates_as_text : label_at_end_point
        add_label_to_scene(label_location = end_point, label_text = the_label_text)
    }


    if (label_at_midpoint == "_*coordinates*_") {
        add_label_to_scene(label_location = midpoint, label_text = mid_point_coordinates_as_text)
    } else {
        if (label_at_midpoint) {
            the_label_text = (label_at_midpoint == "_*vector_length*_") ? Vector_Length : label_at_midpoint
            add_label_to_scene(label_location = midpoint, label_text = the_label_text)
        }
    }

}