

document.getElementById('NVUDfileInput').addEventListener('change', function() {
    const outputContainer = document.getElementById('jsonOutput');
    outputContainer.innerHTML = ''; // Clear previous output
    const files = this.files;

    if (files.length) {
        Array.from(files).forEach((file, index) => {
            const reader = new FileReader();
            reader.readAsText(file, "UTF-8");
            reader.onload = function(evt) {
                const lines = evt.target.result.split('\n');
                const jsonObject = get_CND_structure_from_file(lines);
                currentJsonObject = jsonObject; // Store the latest JSON object
                const fileOutputContainer = document.createElement('div');
                fileOutputContainer.id = `file-output-${index}`;
                outputContainer.appendChild(fileOutputContainer);

                buildTree(jsonObject, fileOutputContainer);
            };
            reader.onerror = function(evt) {
                const errorOutput = document.createElement('div');
                errorOutput.textContent = `Error reading file: ${file.name}`;
                outputContainer.appendChild(errorOutput);
            };
        });
    }
});


function getColorByDepth(depth) {
    const colors = ['#FF6347', '#4682B4', '#32CD32', '#FFD700', '#6A5ACD', '#FF69B4', '#20B2AA'];
    return colors[depth % colors.length]; // Cycle through colors if depth exceeds array length
}



function buildTree(obj, container, depth = 0) {
    container.innerHTML = ''; // Clear the container
    const ul = document.createElement('ul');
    ul.style.listStyleType = 'none';
    container.appendChild(ul);

    Object.keys(obj).forEach(key => {
        const li = document.createElement('li');
        ul.appendChild(li);

        // Calculate depth for current node
        const levelDepth = getDepth(obj[key]);

        // Create a span for the collapse icon
        const collapseSpan = document.createElement('span');
        collapseSpan.textContent = '+';
        collapseSpan.style.cursor = 'pointer';
        collapseSpan.style.marginRight = '5px';
        collapseSpan.onclick = function() {
            const siblingUl = this.parentNode.querySelector('ul');
            if (siblingUl) {
                siblingUl.style.display = siblingUl.style.display === 'none' ? 'block' : 'none';
                this.textContent = siblingUl.style.display === 'none' ? '+' : '-';
            }
        };

        if (typeof obj[key] === 'object' && obj[key] !== null) {
            // Create a span for the key name with depth
            const keySpan = document.createElement('span');
            keySpan.textContent = `(${levelDepth}) ${key}`;
            keySpan.style.cursor = 'pointer';
            keySpan.style.color = getColorByDepth(depth); // Set color based on depth

            li.appendChild(collapseSpan);
            li.appendChild(keySpan);

            const childUl = document.createElement('ul');
            childUl.style.display = 'none';
            childUl.style.listStyleType = 'none';
            childUl.style.marginLeft = '20px';
            li.appendChild(childUl);
            buildTree(obj[key], childUl, depth + 1);
        } else {
            // Leaf node
            li.appendChild(document.createTextNode(`(${levelDepth}) ${key}: ${obj[key]}`));
            li.style.color = getColorByDepth(depth); // Set color based on depth
            collapseSpan.style.visibility = 'hidden';
            li.insertBefore(collapseSpan, li.firstChild); // Ensure collapseSpan is still first child even if not visible
        }
    });
}



let currentJsonObject = {}; // This will hold the latest parsed JSON object

document.getElementById('exportXml').addEventListener('click', function() {
    const xmlData = jsonToXml(currentJsonObject);
    triggerDownload(xmlData, 'data.xml', 'text/xml');
});

document.getElementById('exportYaml').addEventListener('click', function() {
    const yamlData = jsonToYaml(currentJsonObject);
    triggerDownload(yamlData, 'data.yaml', 'text/yaml');
});

// Add click event listener to the export button
document.getElementById("exportJsonBtn").addEventListener("click", function() {
    exportObjectAsJson(currentJsonObject, "myObject.json");
});



function triggerDownload(content, fileName, mimeType) {
    const blob = new Blob([content], {type: mimeType});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}







// Utility function to calculate the depth of an object
function getDepth(obj) {
    if (typeof obj !== 'object' || obj === null) {
        return 0;
    }
    let depth = 0;
    for (let key in obj) {
        if (typeof obj[key] === 'object') {
            depth = Math.max(depth, getDepth(obj[key]));
        }
    }
    return depth + 1; // Increment to include the current level
}




// Function to export an object as a JSON file
function exportObjectAsJson(obj, filename) {
    const jsonString = JSON.stringify(obj, null, 2); // Format with indentation
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || "download.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}






function jsonToXml(jsonObj) {
    let xmlStr = '<?xml version="1.0" encoding="UTF-8"?>\n';

    function sanitizeTagName(tagName) {
        // Replace invalid characters in tag names and prepend with 'tag_' if the name starts with a digit
        return tagName.replace(/^[0-9]|[^a-zA-Z0-9_\-]/g, (match, offset) => offset === 0 ? 'tag_' + match : '_');
    }

    function convertValue(value) {
        // Convert undefined, null, and object values to strings to prevent invalid XML content
        if (value === null) return 'null';
        if (typeof value === 'undefined') return 'undefined';
        if (typeof value === 'object') return JSON.stringify(value);
        return value.toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
    }

    function traverse(obj, parent = '') {
        Object.entries(obj).forEach(([key, value]) => {
            const tagName = sanitizeTagName(key);
            if (Array.isArray(value)) {
                value.forEach(item => {
                    xmlStr += `<${tagName}>\n`;
                    if (typeof item === 'object') {
                        traverse(item, tagName);
                    } else {
                        xmlStr += convertValue(item) + '\n';
                    }
                    xmlStr += `</${tagName}>\n`;
                });
            } else if (typeof value === 'object' && value !== null) {
                xmlStr += `<${tagName}>\n`;
                traverse(value, tagName);
                xmlStr += `</${tagName}>\n`;
            } else {
                xmlStr += `<${tagName}>${convertValue(value)}</${tagName}>\n`;
            }
        });
    }

    traverse(jsonObj);
    return xmlStr;
}




function jsonToYaml(jsonObj) {
    function traverse(obj, indent = '') {
        let yamlStr = '';
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                let value = obj[key];
                // Check if the key is 'desc' and wrap the value in quotes
                if (key === 'Desc' && typeof value === 'string') {
                    value = `'${value.replace(/'/g, "") }'`; // Wrap the value in quotes
                }

                if (typeof obj[key] === 'object' && obj[key] !== null && !(obj[key] instanceof Array)) {
                    yamlStr += indent + key + ':\n';
                    yamlStr += traverse(obj[key], indent + '  ');
                } else {
                    yamlStr += indent + key + ': ' + value + '\n';
                }
            }
        }
        return yamlStr;
    }
    return traverse(jsonObj);
}













//CND CODE!!!!!!


var CND_object_FINAL =  { }  // Global object containing the NUVD file in object structure


function get_CND_structure_from_file (raw_lines_array )  {


   let lines_array = raw_lines_array.filter (x =>  {   // filter out line delimiters
       return  (
           ! (x.startsWith ("//-----" ) ) &&
           ! (x.startsWith ("//====" ) ) &&
           ! (x.startsWith ("//- - -" ) ) &&
           ! (x.startsWith ("//. . ." ) ) &&
           ! (x.startsWith ("//..." ) ) &&
            (x.replace (/\s/gi, "" ).length > 0 )  // /\s/gi regex for any space, to filter out empty lines
        )
    } )   //.map (x => x.slice (0, 60 ) )  // OJO!!! quitar 60


   let lines_with_anotated_headers = [] // array of all lines with CND headers annotated
   let header_indices = [] // line numbers of lines with headers of any level
   for  (i = 0; i < lines_array.length; i++ )  {  // add line number to header keys
       let subin =  (lines_array[i].startsWith ("//#" ) ) ? "ñ" + i : ""
       lines_with_anotated_headers.push (lines_array[i].trim ( ) + subin )
       if  (subin != "" )  { header_indices.push (i )  } // build array of lines with headers
    }
   header_indices.push (lines_array.length )  // add last position as delimiter


   let level_line_groups = []  // array of text lines corresponding to each section
   for  (let i = 0; i <  (header_indices.length - 1 ); i++ )  {
       level_line_groups.push (lines_with_anotated_headers.slice (header_indices[i] + 1, header_indices[i + 1] ) )  // [i]+1  don't include chapter tag
    }


   // array of lines with CND headers
   let headers = lines_with_anotated_headers.filter (x =>  (x.startsWith ("//#" ) ) ).map (x => x.trim ( ) )
   let headers_with_parameter_objects =  { }  // list of objects for each final parameter line
   for  (i = 0; i < headers.length; i++ )  {
       let line_group = level_line_groups[i]
       let goup_of_params_as_objects = line_group.map (x => make_object_from_NVUD_parameter_line (x ) )
       headers_with_parameter_objects[headers[i]] = goup_of_params_as_objects
    }


   // object with keys being headers at same level as the header in the first line and the values are their associated blocks of lines
   let obj = array_of_lines_to_object (headers )
   for  (level = 1; level<= 5; level++ )  { obj = convert_NVUD_object (obj )  }  // go 5 levels deep




   let dummy = add_NVUD_params_to_object (obj )  // this call of the function starts the recursive function


   function add_NVUD_params_to_object (obj )  {
       for  (let [k, v] of Object.entries (obj ) )  {  // iterate over an object with keys as headers and values as arrays of lines OR objects
           let obj_params = headers_with_parameter_objects[k]
           if  (obj_params )  { // if there are parameters to add to this header
               if  (obj_params.length > 0 )  {
                   obj_params.forEach (param =>  {
                       obj[k][Object.keys (param )[0]] = Object.values (param )[0]
                    } )
                }
               obj[remove_header_trailing_lines (k )] = v
               delete obj[k]


               if  (v instanceof Object )  {
                   add_NVUD_params_to_object (v )
                }
            }
        }
       return obj  // return the object from the recursive function
    }  // END FUNCTION


   return obj // return the final object and exit the function




   //methods*************************************************


   function remove_header_trailing_lines (line )  {
       return line.slice (0, line.indexOf ("ñ" ) )
    }


   function convert_NVUD_object (obj )  {
       for  (let [k, v] of Object.entries (obj ) )  {  // iterate over an object with keys as headers and values as arrays of lines OR objects


           if  (Array.isArray (v ) )  {  // if the value is an array
               if  (v.length > 0 )  {
                   obj[k] = array_of_lines_to_object (v )
                } else  {
               obj[k] =  { }
                }  // check for empty arrays
            } else  {  // value is object
               obj[k] = convert_NVUD_object (v )
            }
        }
       return obj
    }  // END FUNCTION


   function array_of_lines_to_object (filt_lines, level = false )  {  // return an object of keys of a certain level and their subordinate tags
       if  (filt_lines.length == 0 )  { return  { }  }


       if  (!level )  { level = get_index_of_CND_header (filt_lines[0] )  }
       let header_pos = []  // array of positions of headers
       let headers = [] // array of header values
       filt_lines.forEach ( (line, n ) =>  {
           let index = get_index_of_CND_header (line )
           if  (level == index )  {
               header_pos.push (n )
               headers.push (line )
            }
        } )
       header_pos.push (filt_lines.length )  // add last line of array
       let level_OBJECT =  { } // Object where the tags and subordinates will be stored
       for  (let lin = 0; lin < header_pos.length - 1; lin++ )  {
           level_OBJECT[headers[lin]] = filt_lines.slice (header_pos[lin] + 1, header_pos[lin + 1] )
        }
       return level_OBJECT
    }


   function get_index_of_CND_header (line )  {  // get the numeric value of the hierarchical level of a NVUD label
       let words = line.split (/\s/gi )
       let index = Number (words[0].replace ("//#", "" ) )
       return index
    }


   //================================================================================
   function make_object_from_NVUD_parameter_line (line )  {  // convert an NVUD parameter line to an object
       let eq = line.indexOf ("=" )
       let fist_sep = line.indexOf ("//" )
       let second_sep = line.indexOf ("//", fist_sep + 1 )


       let key = line.slice (0, eq ).trim ( )
       let val = line.slice (eq + 1, fist_sep ).trim ( )
       let units = line.slice (fist_sep + 2, second_sep ).trim ( )
       let desc = line.slice (second_sep + 2 ).trim ( )


       let params_object =  { }
       params_object[key] =  { "Value": val, "Units": units, "Desc": desc  }
       return params_object
    }
   //================================================================================


} // END function get_CND_structure_from_file
//********************************************************************************************************* */




function export2JSON ( )  {  // export JSON file
   const a = document.createElement ("a" );
   a.href = URL.createObjectURL (new Blob ([JSON.stringify (CND_object_FINAL, null, 2 )],  {
       type: "text/plain"
    } ) );
   a.setAttribute ("download", "NVUD.JSON" );
   document.body.appendChild (a );
   a.click ( );
   document.body.removeChild (a );
}


function export2XML ( )  {
   let writer = myp5.createWriter ('NVUD.xml' );
   writer.write ([OBJtoXML (CND_object_FINAL )] );
   writer.close ( );
}


function export2yaml ( )  {
   let writer = myp5.createWriter ('NVUD.yaml' );
   writer.write ([json2yaml (CND_object_FINAL )] );
   writer.close ( );
}


function OBJtoXML (obj, index )  {
   var xml = '',
       root,
       count = 0;
   if  (index > 0 ) count = index;
   for  (var prop in obj )  {
       switch  (typeof obj[prop] )  {
           case 'object':  {
               if  (obj[prop] instanceof Array )  {
                   for  (var instance in obj[prop] )  {
                       xml += `\n\t<$ {prop }>\n$ {OBJtoXML (new Object (obj[prop][instance] ) ) }\t</$ {prop }>`;
                    }
                }
               else  {
                   if  (count === 0 )  {
                       // console.log (`Setting root: $ {prop }` )
                       root = prop
                    }
                   xml += `<$ {prop }>$ {OBJtoXML (new Object (obj[prop] ), count ) }\n</$ {prop }>\n`;
                }
               break;
            }
           case 'number':
           case 'string':  {
               // console.log (`Setting $ {typeof obj[prop] }` )
               xml += `\t\t<$ {prop }>$ {obj[prop] }</$ {prop }>\n`;
               break;
            }
        }
       count += 1;
    }
   return xml
}




function JSON2NVUD  (obj, txt = [] )   { // start with an empty nodename chain and empty file  (array )
   for  (let [key, value] of Object.entries (obj ) )  {  // iterate over an nvud tree object


       if  (key == "ExtraParams" )  {
           for  (let [k,v]  of Object.entries (value  ) )  {
               let newv = v
               if  (Array.isArray (v ) )  { newv = v.join ("," )  }
               txt.push (
                   " * " + k + "    " + newv
                )
            }
        }


       else if  (value["Value"] )  {  // if the value contains the property "Value",


           txt.push (
               " ".repeat (Math.max (0, 33 -  key.length ) ) +   key + "  = " + 
               " ".repeat (Math.max (0, 21 - value.Value.length ) ) + value.Value + "      // " + 
               value.Units  +  " ".repeat (Math.max (0, 9 - value.Units.length ) ) +  "// " + 
               value.Desc    )


               if  (value["ExtraParams"] )  {


                   for  (let [k,v]  of Object.entries (value["ExtraParams"]  ) )  {
                       let newv = v
                       if  (Array.isArray (v ) )  { newv = v.join ("," )  }
                       txt.push (
                           "                                   * " + k + "    " + newv
                        )
                    }
                }


        } else  {  // the value  (object ) does not fulfil the condition, go deeper into the object that it describes


           txt.push (key )               
           obj[key] = JSON2NVUD (value, txt )  // go deeper in the tree to the next dependent object
        }
    } // iterate over keys and values of current NVUD node
   return txt
}

