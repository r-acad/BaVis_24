/// <reference path='../../lib/babylon.d.ts' />

function add_Coordinate_Systems_to_scene(geometric_data_object, scale_mesh_by = 1) {   

if (geometric_data_object.model_data.COORDs) {  // if there are coordinate systems to plot

    geometric_data_object.model_data.COORDs.forEach(cordsys_data => { // each segment group has one or various elements with the same rendering options
        create_Coordinate_System(geometric_data_object, cordsys_data, scale_mesh_by)
    }) // loop for each segment group
} // end if
}


function create_Coordinate_System(geometric_data_object, cordsys_data, scale_mesh_by = 1 ) {
    alpha = .8
    // The "center_object" is a marker corresponding to the type of coordinate system (ball, box or cylinder)
    center_object_size = 1 * scale_mesh_by   // characteristic size of center object
    axis_vector_length = center_object_size * 5   // length of the axis vectors

    if (cordsys_data.TYPE == "CORD1R" || cordsys_data.TYPE == "CORDR") {

    // RECTANGULAR COORDINATE SYSTEM
    center_color = "teal"
    var center_object = BABYLON.MeshBuilder.CreateBox("COORD_CENTER_" + cordsys_data.ID, {height: center_object_size, width: center_object_size, depth: center_object_size}, scene);

    } else if (cordsys_data.TYPE == "CORD1S" || cordsys_data.TYPE == "CORDS") {
    // SPHERICAL COORDINATE SYSTEM
    center_color = "teal"
    var center_object = BABYLON.MeshBuilder.CreateSphere("COORD_CENTER_" + cordsys_data.ID, { diameter: center_object_size }, scene)

    } else if (cordsys_data.TYPE == "CORD1C" || cordsys_data.TYPE == "CORDC") {
    // CYLINDRICAL COORDINATE SYSTEM
    center_color = "teal"
    //var center_object = BABYLON.MeshBuilder.CreateSphere("COORD_CENTER_" + cordsys_data.ID, { diameter: center_object_size }, scene)
    var center_object =  BABYLON.MeshBuilder.CreateCylinder("COORD_CENTER_" + cordsys_data.ID, {height: center_object_size, diameterTop: center_object_size, diameterBottom: center_object_size}, scene);

    } else {console.error("ERROR in coordenate system definition")}


    if (cordsys_data.TYPE == "CORD1R" || cordsys_data.TYPE == "CORD1C"  || cordsys_data.TYPE == "CORD1S"   ) {

    center_coords = get_Vector_Coordinates_from_Definition(cordsys_data.DEF[0], geometric_data_object)  // G1
    axis_3_tip_coords = get_Vector_Coordinates_from_Definition(cordsys_data.DEF[1], geometric_data_object)  // G2
    point_G3_coords = get_Vector_Coordinates_from_Definition(cordsys_data.DEF[2], geometric_data_object)    // G3   , all of the Gs correspond to the Nastran CORD1R definition

    } else if (cordsys_data.TYPE == "CORDR" || cordsys_data.TYPE == "CORDC"  || cordsys_data.TYPE == "CORDS"    ) {

    center_coords =     get_Vector_Coordinates_from_Definition(cordsys_data.DEF[0], geometric_data_object)   // origin
    axis_3_tip_coords = myMath_0_index.add_vectors( get_Vector_Coordinates_from_Definition(cordsys_data.DEF[0], geometric_data_object)   , get_Vector_Coordinates_from_Definition(cordsys_data.DEF[3], geometric_data_object) )  // z axis
    point_G3_coords =   myMath_0_index.add_vectors( get_Vector_Coordinates_from_Definition(cordsys_data.DEF[0], geometric_data_object)   , get_Vector_Coordinates_from_Definition(cordsys_data.DEF[1], geometric_data_object) )  // x axis
 
    }


    center_object.material = new BABYLON.StandardMaterial("COORD_material_" + cordsys_data.ID, scene)
    center_object.material.diffuseColor = get_Color_from_scalar_rgb_rgbalpha_or_name(center_color)
    
    center_object.material.alpha = alpha
  
    // Get coordinates of center of the sphere
    center_object.position = new BABYLON.Vector3(center_coords[0], center_coords[1], center_coords[2])

    var Axis3 = new BABYLON.Vector3(axis_3_tip_coords[0] - center_coords[0], axis_3_tip_coords[1] - center_coords[1], axis_3_tip_coords[2] - center_coords[2]).normalize() // Normalized vector for Z-axis
    var Vector_in_plane_x_z = new BABYLON.Vector3(point_G3_coords[0] - center_coords[0], point_G3_coords[1] - center_coords[1], point_G3_coords[2] - center_coords[2]).normalize() // Normalized vector from G1 to G2
    var Axis2 = BABYLON.Vector3.Cross(Axis3, Vector_in_plane_x_z).normalize() // Normalized vector for Y-axis
    var Axis1 = BABYLON.Vector3.Cross(Axis2, Axis3).normalize() // Normalized vector for X-axis


// Create a rotation matrix aligning the box's local axes with the given vectors
var rotationMatrix = BABYLON.Matrix.FromValues(
    Axis1.x, Axis1.y, Axis1.z, 0,
    Axis2.x, Axis2.y, Axis2.z, 0,
    Axis3.x, Axis3.y, Axis3.z, 0,
    0, 0, 0, 1)

// Apply the rotation matrix to the box
center_object.rotationQuaternion = BABYLON.Quaternion.FromRotationMatrix(rotationMatrix);
center_object.rotate(Axis1, Math.PI / 2, BABYLON.Space.WORLD)  // Final rotation of 90 degrees around x axis to align axis of cylinder with the z axis as per CORD1C definition


create_Arrow_for_Vector({START: center_coords, END: [center_coords[0] + Axis1.x * axis_vector_length, center_coords[1] + Axis1.y * axis_vector_length,center_coords[2] + Axis1.z * axis_vector_length]    }, geometric_data_object, 
    {arrow_color: "red", 
    arrow_length: 3 , 
    arrow_angle: 15, 
    thickness: center_object_size * .3, 
    arrow_at_start_point: false, 
    arrow_at_end: true, 
    label_at_start_point: "", 
    label_at_midpoint: cordsys_data.ID, 
    label_at_end_point: "x", 
    alpha: .5 }
    )

    create_Arrow_for_Vector({START: center_coords, END: [center_coords[0] + Axis2.x * axis_vector_length , center_coords[1] + Axis2.y *  axis_vector_length,center_coords[2] + Axis2.z * axis_vector_length] }, geometric_data_object, 
        {arrow_color: "green", 
        arrow_length: 15 , 
        arrow_angle: 15, 
        thickness: center_object_size * .3, 
        arrow_at_start_point: false, 
        arrow_at_end: true, 
        label_at_start_point: "", 
        label_at_midpoint: "", 
        label_at_end_point: "y", 
        alpha: .5 }
        )

        create_Arrow_for_Vector({START: center_coords, END: [center_coords[0] + Axis3.x * axis_vector_length, center_coords[1] + Axis3.y * axis_vector_length,center_coords[2] + Axis3.z * axis_vector_length] }, geometric_data_object, 
            {arrow_color: "blue", 
            arrow_length: 15 , 
            arrow_angle: 15, 
            thickness: center_object_size * .3, 
            arrow_at_start_point: false, 
            arrow_at_end: true, 
            label_at_start_point: "", 
            label_at_midpoint: "", 
            label_at_end_point: "z", 
            alpha: .5 }
            )
      
}
