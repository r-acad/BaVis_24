// return the ids of the coordinate systems which do not depend on another coordinate system either through points or vectors
function find_root_coordinate_systems(global_data_object) {

// Evaluate all parameters
global_data_object.model_data.PARAMETERs.forEach(param => param.VALUE = get_Scalar_Value_from_Parameters(param.ID, global_data_object))


while (find_IDs_of_relative_Nodes_and_Vectors(global_data_object.model_data.VECTORs.concat(global_data_object.model_data.NODEs)).length > 0) {    
    evaluate_coordinates_of_COORDs_NODEs_and_VECTORs (global_data_object)
}

// Evaluate all coordinate systems
//test_node_coord_2 = global_data_object.model_data.NODEs.find(obj => obj["ID"] === "P_1").DEF
pp = 1
}



// A: origin, U, V, W: CORDR unit vectors, P: point to be transformed
function transform_coordinates_if_cordsys_has_DEF_in_same_reference(input_vector, global_data_object) {  

    ref_coord_sys_ID = input_vector[3]  // ID of the reference coordinate system for the input vector

    coord_sys_DEF = global_data_object.model_data.COORDs.find(obj => obj["ID"]  === ref_coord_sys_ID)

    if (coord_sys_DEF == undefined) {return input_vector}  // if the coordinate system is undefined, just return value (OJO!!! This should check for a default *BASIC* system)


    // Check if the three vectors or nodes defining the coordinate system are themselves defined in the same reference coordinate system
    coord_sys_vectors_are_defined_in_single_reference_system = (coord_sys_DEF.DEF[0][3] === coord_sys_DEF.DEF[1][3] && coord_sys_DEF.DEF[1][3] === coord_sys_DEF.DEF[2][3])  

    if (coord_sys_vectors_are_defined_in_single_reference_system == false) {return input_vector}  // if the reference system has vectors defined in various systems, do nothing and return input vector

    if (coord_sys_DEF.TYPE == "CORDR") {   
        transformed_coordinates = myMath_0_index.CORDR_transform(coord_sys_DEF.DEF[0], coord_sys_DEF.DEF[1], coord_sys_DEF.DEF[2], coord_sys_DEF.DEF[3], input_vector ) 
        transformed_coordinates.push(coord_sys_DEF.DEF[0][3])  // now the transformed vector is defined in the reference coordinate system which was used to transform it
        return transformed_coordinates
    }

    if (coord_sys_DEF.TYPE == "CORD1R") {   
        transformed_coordinates = myMath_0_index.CORD1R_transform(coord_sys_DEF.DEF[0], coord_sys_DEF.DEF[1], coord_sys_DEF.DEF[2],  input_vector   ) 
        transformed_coordinates.push(coord_sys_DEF.DEF[0][3])  // now the transformed vector is defined in the reference coordinate system which was used to transform it
        return transformed_coordinates
    }

    if (coord_sys_DEF.TYPE == "CORDC") {   
        transformed_coordinates = myMath_0_index.CORDC_transform(coord_sys_DEF.DEF[0], coord_sys_DEF.DEF[1], coord_sys_DEF.DEF[2], coord_sys_DEF.DEF[3], input_vector   ) 
        transformed_coordinates.push(coord_sys_DEF.DEF[0][3])  // now the transformed vector is defined in the reference coordinate system which was used to transform it
        return transformed_coordinates
    }

    if (coord_sys_DEF.TYPE == "CORD1C") {   
        transformed_coordinates = myMath_0_index.CORD1C_transform(coord_sys_DEF.DEF[0], coord_sys_DEF.DEF[1], coord_sys_DEF.DEF[2],  input_vector   ) 
        transformed_coordinates.push(coord_sys_DEF.DEF[0][3])  // now the transformed vector is defined in the reference coordinate system which was used to transform it
        return transformed_coordinates
    }

    if (coord_sys_DEF.TYPE == "CORDS") {   
        transformed_coordinates = myMath_0_index.CORDS_transform(coord_sys_DEF.DEF[0], coord_sys_DEF.DEF[1], coord_sys_DEF.DEF[2], coord_sys_DEF.DEF[3], input_vector   ) 
        transformed_coordinates.push(coord_sys_DEF.DEF[0][3])  // now the transformed vector is defined in the reference coordinate system which was used to transform it
        return transformed_coordinates
    }

    if (coord_sys_DEF.TYPE == "CORD1S") {   
        transformed_coordinates = myMath_0_index.CORD1S_transform(coord_sys_DEF.DEF[0], coord_sys_DEF.DEF[1], coord_sys_DEF.DEF[2],  input_vector   ) 
        transformed_coordinates.push(coord_sys_DEF.DEF[0][3])  // now the transformed vector is defined in the reference coordinate system which was used to transform it
        return transformed_coordinates
    }
}



function evaluate_coordinates_of_COORDs_NODEs_and_VECTORs (global_data_object) {
    
    global_data_object.model_data.COORDs.forEach(cord => {
        cord.DEF = cord.DEF.map(coord_array => get_Vector_Coordinates_from_Definition(coord_array, global_data_object))  // Evaluate coordinates from parameters, without performing coordinate transformation
    })
        
    global_data_object.model_data.VECTORs.forEach(vector => {
        vector.DEF = get_Vector_Coordinates_from_Definition(vector.DEF, global_data_object)
    })

    global_data_object.model_data.NODEs.forEach(node => {
        node.DEF = get_Vector_Coordinates_from_Definition(node.DEF, global_data_object)
    })

    //**********************/

    global_data_object.model_data.COORDs.forEach(cord => {
        cord.DEF = cord.DEF.map(coord_array => transform_coordinates_if_cordsys_has_DEF_in_same_reference(coord_array, global_data_object)) // Try to transform coordinates if reference is basic for all vectors
    })
        
    global_data_object.model_data.VECTORs.forEach(vector => {
        vector.DEF = transform_coordinates_if_cordsys_has_DEF_in_same_reference(vector.DEF, global_data_object)
    })

    global_data_object.model_data.NODEs.forEach(node => {
        node.DEF = transform_coordinates_if_cordsys_has_DEF_in_same_reference(node.DEF, global_data_object)
    })

    return global_data_object
}



// Find the candidate vectors that may be defined in a local reference system: those with 4 coordinates in their DEF and those defined by expressions
function find_IDs_of_relative_Nodes_and_Vectors(data) {
    const specialVectors = [];

    data.forEach(vector => {
        const def = vector.DEF;
        
        // Check if DEF is an array with 4 elements
        if (  def[3] != "*BASIC*"  && def[3] != undefined ) {
            specialVectors.push(vector.ID);
        }

        // Check if DEF is a string containing an expression delimited by <>
        if (typeof def.EXPRESSION === 'string' && def.EXPRESSION.includes('<') && def.EXPRESSION.includes('>')) {
            specialVectors.push(vector.ID);
        }
    })
    return specialVectors
}


