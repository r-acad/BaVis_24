//SETUP GLOBAL OBJECT TO STORE NASTRAN MODEL
const nastran_model = {}

let REL_FILEPATH = "/assets/RUN_11MAY20/"



//********************************************************************************************************** */
//                                TAKE BDF AS ARRAY OF LINES AND BUILD AND DISPLAY FEM
function build_nastran_model(text_bdf) {
    read_Nastran_cards_and_build_model_object(text_bdf)
    transform_grid_coordinates()

    // see example "mesh_by_Nodes_data_example" in src\99_Examples_of_Data_structures.js for the complete data structure 
    meshData = {
        "name": "exampleName",
        "group": "exampleGroup",
        "geometric_data_object": {
            "NODEs": nastran_model.GRIDs,
            "SHELLs": nastran_model.CSHELLs,
            "Bounding_Box": nastran_model.Bounding_Box, 
            "CAEROs": nastran_model.CAEROs,
            "SET1s": nastran_model.SET1s,
            "RBE3s": nastran_model.RBE3s,
            "TETRAs": nastran_model.TETRAs,
            "PLOTELs": nastran_model.PLOTELs,
            "CORDs": nastran_model.CORDs

        }
    }

    Create_Mesh_from_Nodes(meshData)

    //draw_nastran_model(new Rendering_Options_factory)  
}  // end of build nastran model function
//********************************************************************************************************** */



//********************************************************************************************************** */
//                              PARSE NASTRAN FILE AND BUILD NASTRAN MODEL OBJECT
function read_Nastran_cards_and_build_model_object(bdf_lines) {

    const filt_lines = get_clean_bulk_data_section(bdf_lines) // Remove blank lines and comments from .bdf and extract BULK DATA section
    const card_lines = []  // Initialise an array to hold the card names found
    const processed_cards_object = {}
    let line_array = []  // instantiate the array where to store the card fields
    for (let i = 0; i < filt_lines.length; i++) { // Go one by one through all lines of the bulk section
        let card = get_nastran_card_name(filt_lines[i])  // name of card found
        line_array = get_nastran_fields_from_line(filt_lines[i], true)   // get an array of fields from the current line, true => first line of card
        if (card) { // if this is a valid nastran card (not a continuation or blank)
            if (!card_lines.includes(card)) {  // Is this card not in the array of unique cards yet?
                card_lines.push(card)  // If not, then add the card name to the array
                Object.defineProperty(processed_cards_object, card, { value: [] });  // create a new key on the processed cards object
            }
            // now load additional card lines, if they exist
            let lineadd = 1
            while ((i + lineadd < filt_lines.length) && is_nastran_continuation(filt_lines[i + lineadd])) {
                line_array.push(get_nastran_fields_from_line(filt_lines[i + lineadd]))
                line_array[1] = card  // Change card type to the basic name without "*"
                lineadd++
            }  // end while
            i += lineadd - 1  // restore i to next line to be processed (if there was no continuation lineadd-1 = 0 -> no jump)
            processed_cards_object[card].push(line_array.flat(2))  // add the line to the array corresponding to the card
        }
    } // next i, line of the bulk data array

    console.log(processed_cards_object)

    // ADD OBJECTS TO MODEL OBJECT
    nastran_model.GRIDs = CARDS2DATA.GRID(processed_cards_object.GRID) // for GRIDs, return the map directly
    nastran_model.CSHELLs = append_supported_card_arrays("ELM2D", ["CTRIA3", "CTRIAR", "CQUAD4", "CQUADR"]) // append maps
    nastran_model.PSHELLs = append_supported_card_arrays("PROP2D", ["PSHELL", "PCOMP"]) // append maps
    nastran_model.CORDs = append_supported_card_arrays("CORDR", ["CORD1R", "CORD2R"]) // append maps
    nastran_model.CAEROs = append_supported_card_arrays("CAERO", ["CAERO1"]) // append maps
    nastran_model.SET1s = append_supported_card_arrays("SET1", ["SET1"]) // append maps
    nastran_model.RBE3s = append_supported_card_arrays("RBE3", ["RBE3"]) // append maps
    nastran_model.TETRAs = append_supported_card_arrays("CTETRA", ["CTETRA"]) // append maps 
    nastran_model.PLOTELs = append_supported_card_arrays("PLOTEL", ["PLOTEL"]) // append maps 


    function append_supported_card_arrays(elm_class, supported_cards_of_type) { // BUILD MODEL OBJECT FROM MAPS OF TYPES OF CARDS (BY DIMENSION)
        let acc_Map = {} // create accumulator object
        supported_cards_of_type.forEach(card_type => { // iterate on all cards supported of the element class
            if (card_type in processed_cards_object) {  // if card supported
                let curr_Map = CARDS2DATA[elm_class](processed_cards_object[card_type])  // create cards object            
                //curr_Map.forEach((value, key) =>  acc_Map.set(key, value)  ) // assign keys and values to acc map
                acc_Map = { ...acc_Map, ...curr_Map }
            }
        })
        return acc_Map  // return accumulator map merging all the maps of the supported cards
    }
    console.log(nastran_model)
} // end function read_Nastran_cards_and_build_model_object(bdf_lines)
//********************************************************************************************************** */


//********************************************************************************************************** */
//                                NASTRAN CARD INTERPRETATION OBJECT
let CARDS2DATA = {


    PLOTEL: function (processed_cards_array) {
        let cards_object = {}
        processed_cards_array.forEach((arr_line) => {
            let CARD = "PLOTEL"
            let EID = parse_nastran_number(arr_line[2])
            let NODE_IDs = []
            NODE_IDs[1] = parse_nastran_number(arr_line[3])
            NODE_IDs[2] = parse_nastran_number(arr_line[4])
            cards_object[EID] = { CARD, EID, NODE_IDs }
        }) // next foreachnumber
        return cards_object
    }, // end method PLOTEL


    CTETRA: function (processed_cards_array) {
        let cards_object = {}
        processed_cards_array.forEach((arr_line) => {
            let CARD = "CTETRA"
            let EID = parse_nastran_number(arr_line[2])
            let PID = parse_nastran_number(arr_line[3])
            let GRIDs = arr_line.splice(4).map(x => Number(x)).filter(x => x != 0)
            // remove blank fields at the end of the array
            //let index0  =    GRIDs.findIndex(x => x == 0)
            //if (index0 > 0) { GRIDs = GRIDs.slice(0, index0)  }
            cards_object[EID] = { CARD, EID, GRIDs }
        }) // next foreachnumber
        return cards_object
    }, // end method CTETRA

    RBE3: function (processed_cards_array) { // OJO!!! no "UM" set is processed
        let cards_object = {}
        processed_cards_array.forEach((arr_line) => {
            let CARD = "RBE3"
            let EID = parse_nastran_number(arr_line[2])
            let REFGRID = parse_nastran_number(arr_line[4])
            let GRID_GROUPS = []
            let depend_fields = arr_line.splice(6).filter(x => Number(x) != 0)
            // remove blank fields at the end of the array, but don't convert to number yet in order to identify reals
            let weights_locations = []  // store position of weights fields and last field
            for (let i = 0; i < depend_fields.length; i++) { // push every real field location
                if (depend_fields[i].includes(".")) { weights_locations.push(i) }
            }
            weights_locations.push(depend_fields.length) // push number of dependent fields
            for (let i = 0; i < weights_locations.length - 1; i++) {  // for each group of dependent nodes
                let dep_group = depend_fields.slice(weights_locations[i], weights_locations[i + 1])
                let dep_object = {}
                dep_object.Wi = parse_nastran_number(dep_group[0])
                dep_object.Ci = parse_nastran_number(dep_group[1])
                dep_object.GRIDs = dep_group.slice(2).map(x => parse_nastran_number(x))
                GRID_GROUPS.push(dep_object)
            }
            cards_object[EID] = { EID, CARD, REFGRID, GRID_GROUPS }
        }) // next foreachnumber
        return cards_object
    },


    SET1: function (processed_cards_array) {
        let cards_object = {}
        processed_cards_array.forEach((arr_line) => {
            let CARD = "SET1"
            let SID = parse_nastran_number(arr_line[2])
            let GRID_IDs = arr_line.splice(3).map(x => Number(x)).filter(x => x != 0)
            // remove blank fields at the end of the array
            //let index0  =    GRID_IDs.findIndex(x => Number(x) == 0)
            //if (index0 > 0) { GRID_IDs = GRID_IDs.slice(0, index0)  }
            cards_object[SID] = { CARD, SID, GRID_IDs }
        }) // next foreachnumber
        return cards_object
    },

    CAERO: function (processed_cards_array) {
        let cards_object = {}
        processed_cards_array.forEach((arr_line) => {
            let CARD = "CAERO1"
            let EID = parse_nastran_number(arr_line[2])
            let PID = parse_nastran_number(arr_line[3])
            let CP = parse_nastran_number(arr_line[4], 0)  // pass a default value of 0, basic coordinate system
            let NSPAN = parse_nastran_number(arr_line[5])
            let NCHORD = parse_nastran_number(arr_line[6])
            let LSPAN = parse_nastran_number(arr_line[7])
            let LCHORD = parse_nastran_number(arr_line[8])
            let IGID = parse_nastran_number(arr_line[9])
            let X1 = parse_nastran_number(arr_line[10])
            let Y1 = parse_nastran_number(arr_line[11])
            let Z1 = parse_nastran_number(arr_line[12])
            let X12 = parse_nastran_number(arr_line[13])
            let X4 = parse_nastran_number(arr_line[14])
            let Y4 = parse_nastran_number(arr_line[15])
            let Z4 = parse_nastran_number(arr_line[16])
            let X43 = parse_nastran_number(arr_line[17])
            let P = [] // PANEL CORNER POINTS CONSTRUCTED FROM CARD DATA IN CP SYSTEM COORDINATES
            P[1] = [, X1, Y1, Z1]
            P[2] = [, X1 + X12, Y1, Z1]
            P[4] = [, X4, Y4, Z4]
            P[3] = [, X4 + X43, Y4, Z4]
            cards_object[EID] = { CARD, EID, PID, CP, NSPAN, NCHORD, LSPAN, LCHORD, IGID, X1, Y1, Z1, X12, X4, Y4, Z4, X43, P }
        }) // next foreachnumber
        return cards_object
    },

    GRID: function (processed_cards_array) {
        let cards_object = {}
        processed_cards_array.forEach((arr_line) => {
            let CARD = "GRID"
            let ID = parse_nastran_number(arr_line[2])
            let CP = parse_nastran_number(arr_line[3], 0) // pass a default value of 0, basic coordinate system
            let X = []  // Grid coordinates after transformation to basic coordinate system
            X[1] = parse_nastran_number(arr_line[4])
            X[2] = parse_nastran_number(arr_line[5])
            X[3] = parse_nastran_number(arr_line[6])
            let CD = parse_nastran_number(arr_line[7], 0)  // pass a default value of 0, basic coordinate system
            let PS = parse_nastran_number(arr_line[8])
            let SEID = parse_nastran_number(arr_line[9])
            cards_object[ID] = { CARD, ID, CP, X, CD, PS, SEID }
        }) // next foreachnumber
        return cards_object
    }, // end method GRID

    CORDR: function (processed_cards_array) {
        let cards_object = {} // new object
        processed_cards_array.forEach((arr_line) => {
            let CARD = "CORDR"
            let CID = parse_nastran_number(arr_line[2])
            let RID = parse_nastran_number(arr_line[3], 0)
            let A = []; let B = []; let C = []
            A[1] = parse_nastran_number(arr_line[4]); A[2] = parse_nastran_number(arr_line[5]); A[3] = parse_nastran_number(arr_line[6])
            B[1] = parse_nastran_number(arr_line[7]); B[2] = parse_nastran_number(arr_line[8]); B[3] = parse_nastran_number(arr_line[9])
            C[1] = parse_nastran_number(arr_line[10]); C[2] = parse_nastran_number(arr_line[11]); C[3] = parse_nastran_number(arr_line[12])
            let W = myMath_1_index.vec_normalize(myMath_1_index.makevector_from_points(A, B))  // Unit vector in z direction
            let vec_AC = myMath_1_index.makevector_from_points(A, C)  // Vector in plane x-z
            let V = myMath_1_index.vec_normalize(myMath_1_index.vector_product(W, vec_AC))  // Unit vector in y direction
            let U = myMath_1_index.vec_normalize(myMath_1_index.vector_product(V, W)) // Unit vector in x direction
            cards_object[CID] = { CARD, RID, A, B, C, U, V, W }
        }) // next foreachnumber(
        return cards_object
    }, // end method CORDR

    ELM2D: function (processed_cards_array) {
        let cards_object = {} //new Object
        processed_cards_array.forEach((arr_line) => {
            let CARD = arr_line[1].trim()
            let ID = parse_nastran_number(arr_line[2])
            let PID = parse_nastran_number(arr_line[3])
            let NODE_IDs = []
            NODE_IDs[1] = parse_nastran_number(arr_line[4])
            NODE_IDs[2] = parse_nastran_number(arr_line[5])
            NODE_IDs[3] = parse_nastran_number(arr_line[6])
            let field_shift = 0 // by defalt the card is assumed to be a TRIA
            let TYPE = "CTRIA3"    // OJO!!! falta por leer espesores en los nodos Ti
            if (["CQUAD4", "CQUADR"].includes(CARD)) {
                TYPE = "CQUAD4"
                NODE_IDs[4] = parse_nastran_number(arr_line[7])
                field_shift = 1
            }
            let THETA_MCID_field = arr_line[7 + field_shift]
            let THETA = (THETA_MCID_field.includes(".")) ? parse_nastran_number(THETA_MCID_field) : 0.0
            let MCID = (THETA_MCID_field.includes(".")) ? "" : parse_nastran_number(THETA_MCID_field)
            let ZOFFS = parse_nastran_number(arr_line[8 + field_shift])
            cards_object[ID] = { CARD, TYPE, ID, PID, NODE_IDs, THETA, MCID, ZOFFS }
        })
        return cards_object
    }, // end method CSHELLs

    PROP2D: function (processed_cards_array) {
        let cards_object = {}  //new Object
        processed_cards_array.forEach((arr_line) => {
            let CARD = arr_line[1].trim()
            let PID = parse_nastran_number(arr_line[2])
            if (CARD === "PSHELL") {
                let MID1 = parse_nastran_number(arr_line[3])
                let T = parse_nastran_number(arr_line[4])
                let MID2 = parse_nastran_number(arr_line[5])
                let INERTIA_RATIO = parse_nastran_number(arr_line[6])
                let MID3 = parse_nastran_number(arr_line[7])
                let TST = parse_nastran_number(arr_line[8])
                let NSM = parse_nastran_number(arr_line[9])
                let Z1 = parse_nastran_number(arr_line[10])
                let Z2 = parse_nastran_number(arr_line[11])
                let MID4 = parse_nastran_number(arr_line[12])
                cards_object[PID] = { CARD, PID, MID1, T, MID2, INERTIA_RATIO, MID3, TST, NSM, Z1, Z2, MID4 }
            }

            if (CARD === "PCOMP") {
                let Z0 = parse_nastran_number(arr_line[3])
                let NSM = parse_nastran_number(arr_line[4])
                let SB = parse_nastran_number(arr_line[5])
                let FT = (arr_line[6]).trim()
                let TREF = parse_nastran_number(arr_line[7])
                let GE = parse_nastran_number(arr_line[8])
                let LAM = (arr_line[9]).trim()
                let Laminate_array = arr_line.slice(10)
                let stack_object = parse_laminate_array(Laminate_array, LAM)
                let T = stack_object.t
                let STACK = stack_object.stack
                cards_object[PID] = { CARD, PID, Z0, T, NSM, SB, FT, TREF, GE, LAM, STACK }
            }
        })
        return cards_object
    }    // end of PROP2D parser

} // end object CARDS2DATA
//********************************************************************************************************** */


//****************************************************** */
// AUXILIARY NASTRAN FUNCTIONS
//****************************************************** */
function parse_laminate_array(lamarray, LAM) {  //parse plain array of laminate fields in PCOMP to array of ply data
    const array_of_plies = []
    const stack_object = {}
    let sum_of_ts = 0  // sum of all thicknesses read from the card, needs to be interpreted according to LAM value (See NASTRAN docs)
    let first_thickness // thickmess of the first ply, if the other thicknesses are blank, they will be the same as t1
    let lam  /// laminate parameters (MAT, t, theta and SOUT) in each line of a PCOMP

    for (let i = 0; i < lamarray.length; i += 4) {  // jump in 11 elements (10 nastran fields plus the "8")  /// OJO!!! Assumes nastran 8 field format!!!
        lam = lamarray.slice(i, i + 5)  // 4 fields of ply in line
        if (parseInt(lam[0]) > 0) {   // if the MAT is defined, the ply exists, then
            let thick = parse_nastran_number(lam[1])
            if (i === 1) { first_thickness = thick }  // assign first ply, default value
            if (lam[1].trim().length == 0) { thick = first_thickness }   // if ply thickness is not given then take first ply thickness (default)
            let theta = parse_nastran_number(lam[2])
            if (lam[2].trim().length == 0) { theta = 0 }   // default orientation is 0
            sum_of_ts += thick
            array_of_plies.push([lam[0].trim(), thick, theta, lam[3].trim()])
        }  // if the MAT exists, append to the array_of_plies array
    }  // next i ply
    if (LAM.trim().toUpperCase() == "SYM") { sum_of_ts *= 2 }   // obtain final laminate thickness
    stack_object.t = sum_of_ts
    stack_object.stack = array_of_plies
    // console.log(stack_object)
    return stack_object   // object with total thickness and stack array
}

function parse_nastran_number(field, default_val = "") {  // parse NASTRAN float formats and return a JS float or an integer
    if (!field) { return default_val }  // if the requested field does not exist in the nastran card

    if (field.includes(".")) {
        field = field.trim().toLowerCase()
        if (field.startsWith("-")) {
            return (-1 * parseFloat(field.substring(1).replace("+", "e+").replace("-", "e-").replace("ee", "e")))
        } else {
            return (parseFloat(field.replace("+", "e+").replace("-", "e-").replace("ee", "e")))
        }
    } else {
        num = parseInt(field)
        return isNaN(num) ? default_val : num  // if num is NaN then return the default value, this is the case of the empty field
    }
}

function get_nastran_card_name(line) {  // get the NASTRAN card name from a line, if it exists
    if (!is_nastran_continuation(line)) {
        if (line.includes(",")) {
            return line.split(",")[0]
        } else {
            let field1 = line.substring(0, 7).toUpperCase().replace("*", "").trim()
            return field1
        }
    } else { return false }
}

function get_nastran_fields_from_line(line, is_first_line = false) { // return an array containing the content of the NASTRAN line fields, in short, long and comma separated format
    let array_of_fields = []
    let field_start = is_first_line ? 1 : 2
    let nfields = (line.includes("*")) ? { fields: 6, field_width: 16 } : { fields: 10, field_width: 8 }

    if (line.includes(",")) {
        line += ",,,,,,,,,,"  // pad line with fields to be able to extract a set number of fields

        array_of_fields = [",", ...line.split(",")].slice(field_start, 10)

    } else {
        line += "                                                    "   // extend line with blanks to avoid skipping fields
        for (let i = field_start; i <= (nfields.fields - 1); i++) {
            array_of_fields.push(get_nastran_field(line, i, nfields.field_width))
        }
    }

    if (is_first_line) {
        return [nfields.field_width, ...array_of_fields]  // the first element gives the card format (8 or 16)
    } else { return array_of_fields }
}

function get_nastran_field(line, field, flength) { // flength can be 8 or 16 cols, field 1 is always 8 characters long
    if (field == 1) {
        return line.substring(0, 7)
    } else {
        let fstart = 8 + (field - 2) * flength
        return line.substring(fstart, fstart + flength)
    }
}

function is_nastran_continuation(line) {  // check whether a .bdf line is a continuation line
    ret = (line.startsWith(" ") || line.startsWith("+") || line.startsWith(",") || line.startsWith("*")) ? true : false
    return ret
}

function get_clean_bulk_data_section(nastran_lines) {  // get all the lines between BEGIN BULK and ENDDATA, removing empty lines and comments

    const filt_lines = nastran_lines
        .filter(line => !(line.trim().startsWith("$") || (line.trim().length < 2)))  // remove comment and empty lines
        .filter(line => {  // remove text after an inline nastran comment
            if (line.includes("$")) {
                return line.substring(0, line.indexOf("$"))
            } else { return line }
        })

    return filt_lines


    /**   OJO!!! for the time being ignore this selection, allow multiple complete .bdf files to be read at once
     * 
    // Find indexes of start and end of BULK section
    const begin_bulk = filt_lines.findIndex(line => line.includes("BEGIN BULK"));
    const enddata = filt_lines.findIndex(line => line.includes("ENDDATA"));

    if (begin_bulk === -1 && enddata === -1) {
        return  filt_lines
    } else {
    return  filt_lines.slice(begin_bulk + 1, enddata  )
    }
    **/

}

function flatten_read_nastran_file(bdf_lines_array_raw) {

    let flattened_bulk = []  // initial processed array of flat lines

    flatten_bdf(bdf_lines_array_raw)  // flatten array of lines passed as argument and start recursive flattening process

    function flatten_bdf(bdf_lines_array_raw) {

        flattened_bulk = flattened_bulk.concat(get_clean_bulk_data_section(bdf_lines_array_raw))  // get clean read bulk and append to flattened ref
        let index_include = flattened_bulk.findIndex(line => line.toUpperCase().startsWith("INCLUDE")) // is there a INCLUDE in this bdf so far?

        if (index_include > -1) {  // yes, there is at least one included file
            let included_line = flattened_bulk.splice(index_include, 1)   // INCLUDE line is removed from flattened bulk (destructive!)
            let included_file = included_line[0].slice(7).trim()  // get name of included file
            included_file = included_file.substring(1, included_file.length - 1)
            read_nast(included_file)  // read included nastran and then call flatten_bdf to append the results and process recursively
        } else {  // no included files
            //console.log(flattened_bulk)
            build_nastran_model(flattened_bulk)  // build FEM Object with flattened bulk
        }
    }

    // helper functions to read nastran files
    function read_nast(filen) {
        filen = (REL_FILEPATH + filen).trim()   // relative filepath needs to be in the server directory and have the format "/example/example/" and the file "file.bdf" (without /)
        myp5.loadStrings(filen, fileLoaded)
    }

    function fileLoaded(data) {  // callback function after bdf has been read
        //console.log(data)
        flatten_bdf(data) // call method to process read lines
    }
}  // end of flatten_bdf function

// TRANSFORM GRID COORDINATES
function transform_grid_coordinates() {

    // Initialize values for bounding box
    min_x = 99999999999999
    max_x = -99999999999999
    min_y = 99999999999999
    max_y = -99999999999999
    min_z = 99999999999999
    max_z = -99999999999999

    Object.values(nastran_model.GRIDs).forEach(grid => {

        min_x = Math.min(min_x, grid.X[1])
        max_x = Math.max(min_x, grid.X[1])
        min_y = Math.min(min_y, grid.X[2])
        max_y = Math.max(min_y, grid.X[2])
        min_z = Math.min(min_z, grid.X[3])
        max_z = Math.max(min_z, grid.X[3])


        if (grid.CP !== 0) {   // transform grid coordinates
            let cord = nastran_model.CORDs[grid.CP]
            grid.Xr = grid.X  // Read coordinates from .bdf
            grid.X = myMath_1_index.CORDR_transform
                (cord.A, // A: origin
                    cord.U, cord.V, cord.W, // U, V, W: CORDR unit vectors
                    grid.Xr)   // P: point to be transformed
        }
    })


    box_x = max_x - min_x
    box_y = max_y - min_y
    box_z = max_z - min_z

    max_box_side = Math.max(box_x, box_y, box_z)  // get the longest side of the bounding box to guess units OJO!!!

    nastran_model["Bounding_Box"] = { min_x: min_x, min_y: min_y, min_z: max_z, max_x: max_x, max_y: max_y, max_z: max_z, max_box_side: max_box_side }

}