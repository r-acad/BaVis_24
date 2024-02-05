
//===================================================================================================================
// Given the data_model and the DEFINITION of a vector (Vector or node id, literal vector definition [1,2, param], or scalar-vector expression), it evaluates all dependencies to return an array of 3 coordinates
// Note that nodes are treated as vectors in this function

function get_Vector_Coordinates_from_Definition(DEF, geometric_data_object) {
    
    var vectors = geometric_data_object.model_data.VECTORs
    var nodes = geometric_data_object.model_data.NODEs
    var variables = geometric_data_object.model_data.PARAMETERs

    // Start here! Find the requested vector and evaluate its DEF
    returned_vector_coordinates = _evaluate_vector_definition_by_ID_vec_or_expression(DEF)

    // in this case, the vectors in the scalar-vector expression were defined in different coordinate systems. Return original for re-evaluation once the vectors and coordinate systems are evaluated
    if (returned_vector_coordinates == false) {
        return DEF}  

    //console.log(" Definition ", DEF, " returned value ", returned_vector_coordinates )

    // Map a final pass ONLY on the coordinates to get scalar components from global definitions, leave the coordinate system definition intact
    final_parameter_pass_on_coordinates = returned_vector_coordinates.slice(0,3).map( (_) => get_Scalar_Value_from_Parameters(_, geometric_data_object))
    final_parameter_pass_on_coordinates.push(returned_vector_coordinates[3]) // This is the final result returned, this line is mutating, if assigned to a variable it would return 4 (length)

    return final_parameter_pass_on_coordinates
    //_________________________________________________________________________________________________________
    // Recursive function to evaluate expressions with scalar and vector values, including vector operations
    function __evaluate_ScalarVector_expression(expr) {
   
        // Handle VECTOR CROSS PRODUCT
        // Find recursively all instances, included nested, of cross(X) and evaluate X. Return the original expression with the results of the cross products replacing the cross() pattern
        expr = expr.includes('cross(') ?   __evaluate_cross_product(expr) : expr 

     // Replace vector and variable references in the remaining expression with their numerical values in an array format
     vector_numerical_expr = expr.replace(/([a-zA-Z0-9_]+)/g, (match) => {
        const vector = _find_Vector_or_node_by_Id(match)
        if (vector) {
            const vecValue = _evaluate_vector_definition_by_ID_vec_or_expression(vector.DEF)
            return `[${vecValue.join(',')}]`
        }
        const variable = _find_scalar_Variable_by_Id(match)
        if (variable) {
            return variable.VALUE
        }
        return match
    })

        // Evaluate the resulting arithmetic expression with pure numbers
        // Caution: eval() can be unsafe, consider using a safer evaluation method
        try {
            return evaluate_Vector_Numerical_Expression(__replaceNormalize(vector_numerical_expr)) // evaluate normalize functions before final evaluation
        } catch (e) {
            console.error('Error evaluating expression:', expr, e)
            return null
        }
    } // end of function __evaluate_ScalarVector_expression
    //______________________________________________________________________






        // SECOND LEVEL HELPER FUNCTIONS

                        // Helper function to normalize a numerical vector in a string and replace the value in the string with the pattern:
                        // replaceNormalize('[15,-1,11]+4*normalize([16.6,-334,-53])-normalize([1,2,3])*9'))     ->   '[15,-1,11]+4*[-0.04481641468682506, 0.9017278617710583, 0.14308855291576675]-[0.16666666666666666, 0.3333333333333333, 0.5]*9'
                        function __replaceNormalize(str) {
                            if (!str.includes('normalize(')) {return str}  // if there is no normalize statement return the original string
                            const regex = /normalize\(\[([^\]]+)\]\)/g
                            // Function to normalize an array of numbers
                            function normalizeArray(arr) {
                                const sum = arr.reduce((acc, val) => acc + val, 0)
                                return arr.map(val => val / sum)
                            }
                            return str.replace(regex, (match, arrayString) => {
                                // Convert the captured group into an array of numbers
                                const numbers = arrayString.split(',').map(Number)
                                // Normalize the array
                                const normalizedArray = normalizeArray(numbers);
                                // Return the normalized array in string format
                                return `[${normalizedArray.join(', ')}]`
                            })
                        }

                        // Helper function to evaluate the cross product from a cross() pattern
                        function __evaluate_cross_product(str) {
                            // Regular expression to match the innermost "cross(X)" pattern
                            const regex = /cross\(([^()]+)\)/

                            // Recursive function to process the string
                            function ___process(s) {
                                const match = s.match(regex)
                                // Base case: if no match is found, return the string
                                if (!match) {
                                    return s
                                }

                                // Extract the matched group, which is the content inside "cross(X)"
                                const innerContent = match[1]

                                // Calculate the cross product of the inner content
                                const cross_product_vectors = split_two_Arguments(innerContent)  // separate text into an array of the two arguments

                                v1 = __evaluate_ScalarVector_expression(cross_product_vectors[0])  // convert "[1,2,3]"  into [1,2,3]
                                v2 = __evaluate_ScalarVector_expression(cross_product_vectors[1])
                                const vec1 = Array.isArray(v1)?  v1 :  _evaluate_vector_definition_by_ID_vec_or_expression(_find_Vector_or_node_by_Id(v1).DEF) // parse scalar and vector values
                                const vec2 = Array.isArray(v2)?  v2 :  _evaluate_vector_definition_by_ID_vec_or_expression(_find_Vector_or_node_by_Id(v2).DEF)

                                cross_product_result = vector_cross_product_0_index(vec1, vec2) // perform numerical cross product

                                // Replace the matched "cross(X)" with the length of X
                                const replaced = s.replace(regex, "[" + cross_product_result + "]") // convert the array to a string and replace cross() pattern in expression

                                // Recursively process the rest of the string
                                return ___process(replaced)
                            }

                            return ___process(str)
                        }

                            // Helper function to find a vector by ID
                            // nodes will be treated as vectors in this function to allow for node translations (and even abuses of notation, treating nodes as vectors) with the same expressions as for pure vectors
                            // IF A NODE HAS THE SAME ID AS A VECTOR, THE VECTOR WILL BE SELECTED FIRST: -> AVOID DUPLICATING NAMES BETWEEN NODES AND VECTORS
                            function _find_Vector_or_node_by_Id(id) {if (vectors.find(v => v.ID === id) != undefined) {return (vectors.find(v => v.ID === id)) } else { return (nodes.find(v => v.ID === id))   }   }

                            // Helper function to find a variable by ID
                            function _find_scalar_Variable_by_Id(id) {return variables.find(v => v.ID === id)}


                            // Helper function to evaluate a vector definition
                            function _evaluate_vector_definition_by_ID_vec_or_expression(def) {
                                if (Array.isArray(def)) {  // The definition is an array of coordinates, parse the scalar components from the variables and return the result as a numerical vector
                                evaluated_coordinates = def.slice(0,3).map(element => get_Scalar_Value_from_Parameters(element, geometric_data_object)) // operate only on the 3 spatial coordinates

                                parsed_coor_sys = def[3] == undefined ? "*BASIC*" : def[3]   // if the node/vector has not 4th coordinate, then it's reference coordinate system is set to 0 (the BASIC)

                                evaluated_coordinates.push(parsed_coor_sys)  // append 4th "coordinate", which is ID of reference coordinate system or "undefined" for a basic point or vector

                                return evaluated_coordinates 

                                } else if (typeof def.EXPRESSION === 'string' && def.EXPRESSION.startsWith('<') && def.EXPRESSION.endsWith('>')) {
                                    evaluated_expression = __evaluate_ScalarVector_expression(def.EXPRESSION.slice(1, -1))
                                    return evaluated_expression
                                }
                                //return "Error in vector definition"
                                //return _evaluate_vector_definition_by_ID_vec_or_expression(_find_Vector_or_node_by_Id(def).DEF)

                                // Search in the complete list of vectors and nodes, in this order

                                data_VECTORS = geometric_data_object.model_data.VECTORs == undefined ? []  : geometric_data_object.model_data.VECTORs  // this is to prevent error if there are no vectors or nodes defined
                                data_NODES = geometric_data_object.model_data.NODEs == undefined ? []  : geometric_data_object.model_data.NODEs

                                concatenation_of_VECTORs_and_NODEs = data_VECTORS.concat(data_NODES)

                                evaluated_coordinates = concatenation_of_VECTORs_and_NODEs.find(n => n.ID == def).DEF  // look-up nodes in global data object                               
                                parsed_coor_sys = evaluated_coordinates[3] == undefined ? "*BASIC*" : evaluated_coordinates[3]   // if the node/vector has not 4th coordinate, then it's reference coordinate system is set to 0 (the BASIC)
                                evaluated_coordinates[3] = parsed_coor_sys  // append 4th "coordinate", which is ID of reference coordinate system or "undefined" for a basic point or vector
                                
                                return evaluated_coordinates 

                                //return geometric_data_object.model_data.NODEs.find(n => n.ID == def).DEF  // OJO!!!!! porqué????
                            } // end of _evaluate_vector_definition_by_ID_vec_or_expression

}  // end of get_Vector_Coordinates_from_Definition
//===================================================================================================================





//********************************************************** */
// Takes a string with a vector expression where the vectors are given by their coordinates,
// already evaluated to numbers, and evaluates the complete expression element-wise, returning the final vector
// Example    evaluate_Vector_Numerical_Expression('[0.5,1,-11]+[-184.6,1,0.2]')    ->   [-184.1, 2, -10.8]
// in a case where the expression is like: '3*[0.5,1,-11,spher]/4-0.3*[-178.6,1,3.2,*BASIC*]/-0.5'   with the vectors defined in different coordinate systems, the global call needs to return the unevaluated expression
function evaluate_Vector_Numerical_Expression(expr) {
    // Extract vectors and replace them with placeholders A, B, C...
    const vectors = []  // array of arrays of coordinates with ref_cord_sys
    const ref_coord_systems = []  // array of the ids of the ref cord sys

    const placeholderExpr = expr.replace(/\[(.*?)\]/g, (_, vector) => {

        vector_coordinates =  (vector.split(',').slice(0,3).map(Number))  // filter each of the coordinates
        coord_sys_id = vector.split(',')[3]

        vector_coordinates.push(coord_sys_id)  // re-append the reference coordinate system

        ref_coord_systems.push(coord_sys_id)
        vectors.push( vector_coordinates  )

        return 'vec' + (vectors.length - 1)
    } )
    // Create separate expressions for each coordinate
    const coordinateExprs = vectors[0].map((_, i) =>
        placeholderExpr.replace(/vec(\d+)/g, (_, index) => vectors[index][i])
    )
    // Evaluate each coordinate expression


    common_ref_coor_system_id = get_unique_value_in_array_or_false(ref_coord_systems)  // get the common coordinate system id (if exists), or false if there is no common reference system among vectors


    evaluated_result_coordinates = coordinateExprs.slice(0,3).map(coordExpr => eval(coordExpr.replace(/--/g, '+')))   // the replace -- for + is to fix situations like '-2--1'
    evaluated_result_coordinates.push(common_ref_coor_system_id)

    // if there is no common coordinate system, the evaluation is senseless so return false (it will be handled later), otherwise, return the evaluated expression
    result = common_ref_coor_system_id ?  evaluated_result_coordinates :  false  

    return result
}
//********************************************************** */



// takes an array and returns false if not all the elements are equal. If all elements are equal, it returns the first element
function get_unique_value_in_array_or_false(array) {
    if (array.length === 0) return false; // Check if the array is empty

    let firstValue = array[0]; // Get the first value for comparison

    for (let i = 1; i < array.length; i++) {
        if (array[i] !== firstValue) {
            return false; // Return false if any value is not equal to the first value
        }
    }

    return firstValue; // All values are equal, return the common value
}




function split_two_Arguments(str) {
    // It iterates through the string while keeping track of the number of open brackets.
    // When it encounters a comma and the bracket count is zero (meaning the comma is not inside any brackets), it records the index of this comma.
    // The string is then split at this index into two parts.
    // Each part is trimmed to remove any leading or trailing whitespace.
    // The function returns an array containing these two parts.
    // This approach will work as long as the input string has matching brackets and a single comma outside of any brackets, separating the two arguments.
    let bracketCount = 0
    let splitIndex = -1
    for (let i = 0; i < str.length; i++) {
        if (str[i] === '[' || str[i] === '(') {
            bracketCount++;
        } else if (str[i] === ']' || str[i] === ')') {
            bracketCount--;
        } else if (str[i] === ',' && bracketCount === 0) {
            splitIndex = i;
            break;
        }
    }
    if (splitIndex === -1) {
        // No valid split point found
        return null;
    }
    // Split the string into two parts and trim any whitespace
    const part1 = str.substring(0, splitIndex).trim();
    const part2 = str.substring(splitIndex + 1).trim();
    return [part1, part2];
}
