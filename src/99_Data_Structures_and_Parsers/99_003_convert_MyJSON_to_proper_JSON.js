

// Format the "easy" input file so that it can be parsed as a JSON file
// Replace ever instance of an expression between < > with an object {"EXPRESSION": <expression>} which will be parsed later depending on wether this is a vector or scalar expression
function convert_MyJSON_to_proper_JSON(str) {
    // New first pass: Remove comments starting with # or //
    str = str.split('\n').map(line => {
      let hashIndex = line.indexOf('#')
      let doubleSlashIndex = line.indexOf('//')
  
      if (hashIndex !== -1) {
        line = line.substring(0, hashIndex)
      }
      if (doubleSlashIndex !== -1) {
        line = line.substring(0, doubleSlashIndex)
      }
  
      return line.trim();
    }).filter(line => line).join('\n')
  
    // Original first pass (now second): Wrap specified characters in spaces
    const charactersToWrap = "{}[]:,"
    for (let char of charactersToWrap) {
        str = str.split(char).join(' ' + char + ' ')
    }
  
    // Original second pass (now third): Replace " ." with " 0."
    str = str.replace(/ \./g, " 0.")
  
    // Original third pass (now fourth): Temporarily replace <...> sections
    const placeholders = []
    str = str.replace(/<[^>]+>/g, function(match) {
        placeholders.push(match)
        return "\0"
    })
  
    // Original fourth pass (now fifth): Wrap non-numeric substrings in quotes
    str = str.replace(/([^\s{}[\]:,]+)(?=[\s{}[\]:,])/g, function(match) {
        if (!/^(-?\d+\.?\d*|-?\.\d+)$/.test(match)) {
            return '"' + match + '"'
        }
        return match
    });
  
    // Restore the <...> sections
    str = str.replace(/\0/g, function() {
        return placeholders.shift()
    })
  
    // Original fifth pass (now sixth): Replace "< with {"EXPRESSION": "< and >" with >"}
    str = str.replace(/"<\s*/g, '{"EXPRESSION": "<')
    str = str.replace(/\s*>"/g, '>"}')
  
    // Original sixth pass (now seventh): Replace any group of more than a single " with a single "
    str = str.replace(/"{2,}/g, '"')
  
    // Replace "-." with "-0."
    str = str.replace(/-\./g, '-0.')
  
    // Remove blank spaces
    str = str.replace(/ /g, '')

    // Flatten the string (remove newline characters)
    str = str.replace(/[\n\r\t]/g, '')

    // Replace "}{" with "},{" to allow not having a comma at the end of each end of object in an array
    str = str.replace(/\}\{/g, "},{")

    // replace ]"  with ],"  to allow not having to have a comma at the end of each array definition of the global object properties
    str = str.replace(/\]"/g, '],"')

    // replace ""  with ","  to allow not having to have a comma after the strings corresponding to the global object properties
    str = str.replace(/""/g, '","')
  
    return JSON.parse(str)
    //return str
  }
  
  
  