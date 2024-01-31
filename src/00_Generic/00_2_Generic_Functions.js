// IN VSCODE USE THE YAML❤JSON EXTENSION TO CONVERT THE FILES DIRECTLY BY CHANGING THE EXTENSION IN THE FILE EXPLORER

yaml2json = function(text) {
    res = jsyaml.load(text)
    return res
    }
    
    json2yaml = function(jsObject) {
      res = jsyaml.dump(JSON.stringify(jsObject))
      return res
      } 


function parse_value_Or_Zero_if_null(input) {  // Return the numeric value of an input (if it exists) or 0 if the input is null
    // Check if the input is null
    if (input === null) {
        return 0;
    }
    // Parse the input to a number and return
    const numericValue = Number(input);
    return numericValue;
}

function is_pure_String(input) {  // true if the input is a well formed string OR UNDEFINED!!! CAREFUL!! BETTER USE isNumeric
    // Check if input is null
    if (input === null) {
        return false;
    }
    // Check if input is a non-empty string and not numeric
    return typeof input === 'string' && input.trim().length > 0 && isNaN(input);
}

function isNumeric(str) {
    // Check for null or undefined
    if (str === null || str === undefined) {
        return false;
    }

    // Convert to string and then check if the string is not empty and is not just whitespace
    if (str.toString().trim() === '') {
        return false;
    }

    // Try converting to a number and check if it's not NaN
    return !isNaN(Number(str))
}




function tokenizeString(str) {
    // Regular expression to match words, numbers, and operators
    const regex = /[A-Za-z]+|[-+]?[0-9]*\.?[0-9]+|[-+*/<>]/g;
    // Split the string into tokens
    return str.match(regex);
  }
  
  // // Example usage
  // const exampleString = "<A1 -3*Length/-0.3>"  // ->     ['<', 'A', '1', '-3', '*', 'Length', '/', '-0.3', '>']
  // //console.log(tokenizeString(exampleString));

  



//   The regular expression ^\[\s*(\d+\s*,\s*)*\d+\s*\]$ is used to check if the string looks like an array. It checks for a pattern that starts and ends with square brackets and contains numbers separated by commas.
//   If the string matches the pattern, JSON.parse() is used to convert it into an array.
//   If parsing fails or the string does not match the pattern, the original string is returned.
//   This function assumes that the array only contains numbers. If you need to handle more complex arrays (like those containing strings or other types), you would need to modify the regular expression and parsing logic accordingly.
  
function stringToArray(str) {
    // Check if the string is in the format of an array
    if (/^\[\s*((-?\d+(\.\d+)?\s*,\s*)*-?\d+(\.\d+)?\s*)?\]$/.test(str)) {
        try {
            // Try to parse the string as JSON
            return JSON.parse(str);
        } catch (error) {
            // In case of a parsing error, return the original string
            return str;
        }
    } else {
        // If the string does not represent an array, return the original string
        return str;
    }
}



