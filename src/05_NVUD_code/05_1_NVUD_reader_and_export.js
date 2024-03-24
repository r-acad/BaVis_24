

document.getElementById('NVUDfileInput').addEventListener('change', function() {
    const outputContainer = document.getElementById('jsonOutput');
    outputContainer.innerHTML = ''; // Clear previous output
    outputContainer.style.width = '100%'; // Ensure it takes the full width of its container

    const files = this.files;

    if (files.length) {
        Array.from(files).forEach((file, index) => {
            const reader = new FileReader();
            reader.readAsText(file, "UTF-8");
            reader.onload = function(evt) {
                const lines = evt.target.result.split('\n');
                const jsonObject = get_CND_structure_from_file(lines); // Assuming this function is defined elsewhere
                // currentJsonObject = jsonObject; // Store the latest JSON object, ensure this variable is declared elsewhere if used
                const fileOutputContainer = document.createElement('div');
                fileOutputContainer.id = `file-output-${index}`;
                fileOutputContainer.style.width = '100%'; // Ensure each file's container takes full width
                outputContainer.appendChild(fileOutputContainer);

                buildTree(jsonObject, fileOutputContainer);

                create_geometry_object_model_from_NVUD(jsonObject)
            };
            reader.onerror = function(evt) {
                const errorOutput = document.createElement('div');
                errorOutput.textContent = `Error reading file: ${file.name}`;
                outputContainer.appendChild(errorOutput);
            };
        });
        }
});

// Mods Lunes


const jsn_nodes_ac = {
    name: "Geometric model from NVUD",
    group: "basic_group",
    model_data: {
        NODEs: [],
        BALLs: [],
        SHELLs: [], 
        SEGMENTs: []
    }
}



function extractAndOrderPlanformStationData(object) {
    const result = {}

    function searchAndExtract(obj, parentName) {
        Object.keys(obj).forEach(key => {
            if (key.includes("Planform") || key.includes("WTD")) {
            //if (key.includes("WTD")) {
                // Initialize parentName key in result if not already initialized
                parent_comp = parentName + "_" + key
                result[parent_comp] = result[parent_comp] || {}

                // Collect all stations under Planform into an array
                const stations = []
                Object.keys(obj[key]).forEach(stationKey => {
                    if (stationKey.includes("Station")) {
                        // Push the station data along with its original key to the array
                        stations.push({ key: stationKey, data: obj[key][stationKey] })
                    }
                })

                // Sort the stations array based on the eta property
                stations.sort((a, b) => a.data.Eta - b.data.Eta)

                // Assign sorted stations with sequential keys and insert into the result
                stations.forEach((station, index) => {
                    const sequentialKey = `Station_${index + 1}` // Creating a sequential key

                    result[parent_comp][sequentialKey] = {
                        Y: station.data.Y,
                        Z: station.data.Z,

                        LE_X: station.data.LE_X,
                        LE_Z: ((station.data.LE_Z == undefined) ? station.data.Z : station.data.LE_Z),
                        LE_Y: ((station.data.LE_Y == undefined) ? station.data.Y : station.data.LE_Y),

                        TE_X: station.data.TE_X,
                        TE_Z: ((station.data.TE_Z == undefined) ? station.data.Z : station.data.TE_Z),
                        TE_Y: ((station.data.TE_Y == undefined) ? station.data.Y : station.data.TE_Y),

                        Eta: station.data.Eta

                    }
                })
            } else if (typeof obj[key] === "object" && obj[key] !== null) {
                // Recurse into child objects if not a Planform station
                searchAndExtract(obj[key], key)
            }
        })
    }

    searchAndExtract(object, null)
    return result
}



function create_FUS_geometry_from_NVUD_object_data(object) {
    
        FUS_nose_tip_x = parseFloat(object["//#1 Aircraft"]["//#2 Geometry"]["//#3 Fuselage"]["//#4 Nose"]["Tip_X"]["Value"])
        FUS_nose_tip_z = parseFloat(object["//#1 Aircraft"]["//#2 Geometry"]["//#3 Fuselage"]["//#4 Nose"]["Tip_Z"]["Value"])
        
        FUS_start_of_cyl_Section_x = FUS_nose_tip_x + parseFloat(object["//#1 Aircraft"]["//#2 Geometry"]["//#3 Fuselage"]["//#4 Nose"]["L"]["Value"])
        FUS_end_of_cyl_Section_x = FUS_start_of_cyl_Section_x + parseFloat(object["//#1 Aircraft"]["//#2 Geometry"]["//#3 Fuselage"]["//#4 Centre"]["L"]["Value"])
        
        FUS_end_x = parseFloat(object["//#1 Aircraft"]["//#2 Geometry"]["//#3 Fuselage"]["//#4 Tail"]["Tip_X"]["Value"])
        FUS_end_z = parseFloat(object["//#1 Aircraft"]["//#2 Geometry"]["//#3 Fuselage"]["//#4 Tail"]["Tip_Z"]["Value"])
        
        FUS_base_area_height = parseFloat(object["//#1 Aircraft"]["//#2 Geometry"]["//#3 Fuselage"]["//#4 Tail"]["Tip_H"]["Value"])
        FUS_base_area_width = parseFloat(object["//#1 Aircraft"]["//#2 Geometry"]["//#3 Fuselage"]["//#4 Tail"]["Tip_W"]["Value"])
            
        FUS_max_width = parseFloat(object["//#1 Aircraft"]["//#2 Geometry"]["//#3 Fuselage"]["W"]["Value"])
        FUS_max_height = parseFloat(object["//#1 Aircraft"]["//#2 Geometry"]["//#3 Fuselage"]["H"]["Value"])
    
    
        jsn_nodes_ac.model_data.SEGMENTs.push(  // OJO!!! con el comienzo en Z de la parte cilíndrica de FUS
    
            { ID: "FUS_NOSE",  DEF: [{START: [FUS_nose_tip_x, 0,  FUS_nose_tip_z ], END: [FUS_start_of_cyl_Section_x, 0,  FUS_nose_tip_z ] }], 
            render_params: {arrow_color: "green", thickness : 1, start_diameter: 0, end_diameter: FUS_max_width , label_at_start_point: "FUS_nose", label_at_end_point: "FUS_cyl_fwd" }      },

            { ID: "FUS_CYL",  DEF: [{START: [FUS_start_of_cyl_Section_x, 0,  FUS_nose_tip_z ], END: [FUS_end_of_cyl_Section_x, 0,  FUS_nose_tip_z ] }], 
            render_params: {arrow_color: "blue", thickness : 1, start_diameter: FUS_max_width, end_diameter: FUS_max_width , label_at_start_point: "FUS_nose", label_at_end_point: "FUS_cyl_fwd" }      }, 

            { ID: "FUS_AFT",  DEF: [{START: [FUS_end_of_cyl_Section_x, 0,  FUS_nose_tip_z ], END: [FUS_end_x, 0,  FUS_end_z ] }], 
            render_params: {arrow_color: "green", thickness : 1, start_diameter: FUS_max_width, end_diameter: FUS_base_area_height , label_at_start_point: "FUS_nose", label_at_end_point: "FUS_cyl_fwd" }      }

        )       
}    




function createCoordsysValidationData(object) {

    Object.keys(object).forEach(section => {
        Object.keys(object[section]).forEach(station => {
            //const {LE_X0, LE_Z0, Y0, TE_X0, TE_Z0} = object[section][station]
            const LE_ID = `${section}_${station}_LE`
            const TE_ID = `${section}_${station}_TE`

            //console.log(object[section][station])

            LE_X = Number(object[section][station].LE_X.Value)
            LE_Y = object[section][station].LE_Y == undefined ? Number(object[section][station].Y.Value) : Number(object[section][station].LE_Y.Value)
            LE_Z = object[section][station].LE_Z == undefined ? Number(object[section][station].Z.Value) : Number(object[section][station].LE_Z.Value)

            TE_X = Number(object[section][station].TE_X.Value)
            TE_Y = object[section][station].TE_Y == undefined ? Number(object[section][station].Y.Value) : Number(object[section][station].TE_Y.Value)
            TE_Z = object[section][station].TE_Z == undefined ? Number(object[section][station].Z.Value) : Number(object[section][station].TE_Z.Value)


            // Adding NODEs
            jsn_nodes_ac.model_data.NODEs.push(
                { ID: LE_ID, DEF: [LE_X, LE_Y, LE_Z] },
                { ID: TE_ID, DEF: [TE_X, TE_Y, TE_Z] }
            )

            // Adding BALLs
            jsn_nodes_ac.model_data.BALLs.push(
                { ID: `${LE_ID}_ball`, NODE_IDs: [LE_ID], R: .1, render_params: { color: "yellow", alpha: .5 } },
                { ID: `${TE_ID}_ball`, NODE_IDs: [TE_ID], R: .1, render_params: { color: "green", alpha: .5 } }
            )


            if (station != Object.keys(object[section])[Object.keys(object[section]).length - 1]) {

                next_station = incrementStationNumber(station)

                LE_X1 = Number(object[section][next_station].LE_X.Value)
                LE_Y1 = object[section][next_station].LE_Y == undefined ? Number(object[section][next_station].Y.Value) : Number(object[section][next_station].LE_Y.Value)
                LE_Z1 = object[section][next_station].LE_Z == undefined ? Number(object[section][next_station].Z.Value) : Number(object[section][next_station].LE_Z.Value)

                TE_X1 = Number(object[section][next_station].TE_X.Value)
                TE_Y1 = object[section][next_station].TE_Y == undefined ? Number(object[section][next_station].Y.Value) : Number(object[section][next_station].TE_Y.Value)
                TE_Z1 = object[section][next_station].TE_Z == undefined ? Number(object[section][next_station].Z.Value) : Number(object[section][next_station].TE_Z.Value)


                jsn_nodes_ac.model_data.SHELLs.push(
                    { ID: LE_ID, NODE_IDs: [[LE_X, LE_Y, LE_Z], [TE_X, TE_Y, TE_Z], [LE_X1, LE_Y1, LE_Z1], [TE_X1, TE_Y1, TE_Z1]], render_params: {color: "green" ,  alpha : .5} }
                )
            }

        })
    })

    return jsn_nodes_ac



    function incrementStationNumber(str) {
        // Split the input string into parts
        const parts = str.split("_")

        // Increment the number part
        const incrementedNumber = parseInt(parts[1], 10) + 1

        // Reassemble and return the updated string
        return `${parts[0]}_${incrementedNumber}`;
    }
}


function create_geometry_object_model_from_NVUD(nvud_object) {

    lifting_surfaces_planform_data = extractAndOrderPlanformStationData(nvud_object)
  
    create_FUS_geometry_from_NVUD_object_data(nvud_object)

    var complete_model_data_object_from_file_NVUD = createCoordsysValidationData(lifting_surfaces_planform_data)  // This variable contains the processed input file into a JS object


    Create_BALLs_from_Nodes(complete_model_data_object_from_file_NVUD)

    create_patches_from_corners(complete_model_data_object_from_file_NVUD)

    add_segments_to_scene(jsn_nodes_ac)





    //return pp


}


// End of Mods Lunes










function getColorByDepth(depth) {
    const colors = [
        "#D32F2F", // Strong Red
        "#1976D2", // Deep Sky Blue
        "#388E3C", // Emerald Green
        "#7B1FA2", // Rich Purple
        "#C2185B", // Pink
        "#E64A19", // Deep Orange
        "#00796B", // Teal
    ];
    
    return colors[depth % colors.length]; // Cycle through colors if depth exceeds array length
}



function buildTree(obj, container, depth = 0) {
    container.innerHTML = ''; // Clear the container
    const ul = document.createElement('ul');
    ul.style.listStyleType = 'none';
    ul.style.padding = '0'; // Ensure padding does not cause overflow
    ul.style.margin = '10px'; // Reset margins to prevent unexpected spacing
    container.appendChild(ul);

    // Apply a translucent background color to the container and allow only this container to scroll vertically
    container.style.backgroundColor = 'rgba(128, 128, 128, 0.1)'; // Translucent grey background
    container.style.width = '100%';
    container.style.overflowY = 'auto'; // Enable vertical scrolling only for the container
    container.style.overflowX = 'hidden';
    container.style.maxHeight = '90vh';
    container.style.boxSizing = 'border-box';

    Object.keys(obj).forEach(key => {
        const li = document.createElement('li');
        li.style.listStyleType = 'none'; // Prevent default list styling from affecting layout
        li.style.paddingLeft = '10px'; // Indent child elements instead of using margin
        li.style.boxSizing = 'border-box'; // Ensure padding is included in the width calculation
        ul.appendChild(li);

        const levelDepth = getDepth(obj[key]); // Assuming getDepth is defined elsewhere

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
            const keySpan = document.createElement('span');
            keySpan.textContent = `(${levelDepth}) ${key}`;
            keySpan.style.cursor = 'pointer';
            keySpan.style.color = getColorByDepth(depth); // Assuming getColorByDepth is defined elsewhere

            li.appendChild(collapseSpan);
            li.appendChild(keySpan);

            const childUl = document.createElement('ul');
            childUl.style.display = 'none';
            childUl.style.listStyleType = 'none';
            childUl.style.paddingLeft = '10px'; // Adjust padding to ensure content fits within parent
            childUl.style.marginLeft = '0'; // Reset margin to prevent unexpected spacing
            childUl.style.boxSizing = 'border-box'; // Include padding in width calculation
            // Remove overflowY style to prevent individual levels from scrolling
            li.appendChild(childUl);
            buildTree(obj[key], childUl, depth + 1);
        } else {
            li.appendChild(document.createTextNode(`(${levelDepth}) ${key}: ${obj[key]}`));
            li.style.color = getColorByDepth(depth); // Assuming getColorByDepth is defined elsewhere
            collapseSpan.style.visibility = 'hidden';
            li.insertBefore(collapseSpan, li.firstChild);
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

