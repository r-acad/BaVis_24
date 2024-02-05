




//****************************************************************** */
// Given the ID of a variable in the object VARIABLES, it returns directly its numerical value if it's a basic definition,
// or evaluates recursively the expressions to resolve the value from the dependencies
function get_Scalar_Value_from_Parameters(variableId, geometric_data_object) {

    //console.log("variable being parsed " , variableId)
    
        // Extract VARIABLES array from geometric_data_object
        const variablesArray = geometric_data_object.model_data.PARAMETERs

        if (variablesArray == undefined)  {return variableId}
    
        // Create a map of variables for quick access. // OJO!!! this is innefficient!! Change code to access directly the object
        const variablesMap = new Map()
        variablesArray.forEach(variable => {
            variablesMap.set(variable.ID, variable.DEF)
        })
    
        // Resolve the value of the requested variable.
        return resolveValue(variableId, variablesMap)
    
    
            //************************************************************************** */
            function string_is_a_valid_expression(text) { return ((typeof text === 'string' && text.startsWith('<') && text.endsWith('>'))  ? true : false )  } // verify if a string has the right format for an expression
    
            function parse_valid_expression(text) {
                    // Check if the value is an expression enclosed in < >
                    if (string_is_a_valid_expression(text)) {
                        //console.log("Parsing expression ", text)
                        // Extract the expression and replace variables with their values.
                        const expression = text.slice(1, -1).replace(/\b(\w+)\b/g, (match) => {
                            return_expression = resolveValue(match, variablesMap)
                            //console.log("match, expression being resolved " , match, return_expression)
                            return      return_expression
                        })
                        
                        // Evaluate the expression safely.
                        try {
                            exp1 = expression.replace(/--/g, '+')  // replace "--" for "+" in cases like '3.2--0.25/--1.55'  -> '3.2+0.25/+1.55'
                            exp2 = exp1.replace(/(\/\+|\*\+)/g, '') // take care of cases like "/+"  and "*+" and remove the "+"

                            exp2 = exp1.replace(/\/\+/g, '/')  // take care of cases like "/+" and remove the "+"
                            exp3 = exp2.replace(/\*\+/g, '*')  // take care of cases like "*+" and remove the "+"
                            exp4 = exp3.replace(/-\(([^\)]+)\*\*([^\)]+)\)/g, '-(($1)**$2)')  // This function uses a regular expression to find instances of negative numbers being raised to a power (like -1.55**2) and wraps them with an extra set of parentheses to clarify the intended order of operations

                            return eval(exp4)
                        } catch (error) {
                            console.error('Error evaluating expression:', exp4, error)
                            return undefined
                        }
                    }}
    
                // Function to parse the value of the variable
                function resolveValue(id, variablesMap) {
    
                if (isNumeric(id)) {
                    return parseFloat(id)}  // If the value of the parameter is purely numeric, just return it parsed as a float
    
                if (variablesMap.has(id)) {  // Otherwise the parameter is defined relative to other parameters, do the parsing
                    const value = variablesMap.get(id)
    
                    //console.log("variable being resolved " , variableId, " with value ", value)
                    if (isNumeric(value)) {
                        return parseFloat(value)}  // If the value of the variable is purely numeric, return it parsed as a float
    
                    return parse_valid_expression(value.EXPRESSION)
    
                } else {
                    if (id == undefined) { 
                        return undefined}  // case where the reference coordinate system is not defined
                    if (string_is_a_valid_expression(id)) { 
                        return parse_valid_expression(id)}
                    if (string_is_a_valid_expression(id.EXPRESSION)) {
                        return parse_valid_expression(id.EXPRESSION)}
                    console.error('Scalar variable not found:', id)
                    return undefined
    
                }  // the id corresponds to a valid expression
                }  // end of resolveValue
      }  // end of get_Scalar_Value_from_Parameters
    //****************************************************************** */

    



    
// Given the ID of a variable in the object VARIABLES, this function returns its numerical value directly if it's a basic definition,
// or evaluates recursively the expressions to resolve the value from the dependencies.
function get_Scalar_Value_from_Parameters_new_but_not_working(variableId, geometric_data_object) {
    const variablesArray = geometric_data_object.model_data.PARAMETERs;
    
    // Function to check if a string is a valid expression
    function string_is_a_valid_expression(text) {
        return typeof text === 'string' && text.startsWith('<') && text.endsWith('>');
    }
    
    // Function to parse and evaluate a valid expression
    function parse_valid_expression(text) {
        if (!string_is_a_valid_expression(text)) return;

        const expression = text.slice(1, -1).replace(/\b(\w+)\b/g, (match) => {
            return resolveValue(match);
        });

        try {
            let sanitizedExpression = expression.replace(/--/g, '+')
                                                .replace(/\/\+/g, '/')
                                                .replace(/\*\+/g, '*')
                                                .replace(/-\(([^\)]+)\*\*([^\)]+)\)/g, '-(($1)**$2)');
            return eval(sanitizedExpression);
        } catch (error) {
            console.error('Error evaluating expression:', text, error);
        }
    }

    // Function to resolve the value of a variable
    function resolveValue(id) {
        // Check if id is numeric
        if (!isNaN(id)) {
            return parseFloat(id);
        }

        // Find the variable in the array
        const variable = variablesArray.find(v => v.ID === id);
        if (variable) {
            if (typeof variable.DEF === 'number') {
                return variable.DEF;
            } else if (typeof variable.DEF.EXPRESSION === 'string') {
                return parse_valid_expression(variable.DEF.EXPRESSION);
            }
        } else {
            console.error('Scalar variable not found:', id);
        }
    }

    return resolveValue(variableId);
}


