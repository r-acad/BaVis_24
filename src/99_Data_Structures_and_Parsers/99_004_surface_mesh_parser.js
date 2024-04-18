function showDropArea() {
    document.getElementById('dropArea').style.display = 'flex'
}

var dropArea = document.getElementById('dropArea')
dropArea.addEventListener('dragover', function(e) {
    e.preventDefault()
    dropArea.style.borderColor = 'green'
})

dropArea.addEventListener('dragleave', function(e) {
    dropArea.style.borderColor = '#ccc'
})

dropArea.addEventListener('drop', function(e) {
    e.preventDefault();  // Prevent the default behavior (which could be opening the file)
    dropArea.style.display = 'none';  // Hide the drop area after dropping files

    // Access the files from the drop event
    var files = e.dataTransfer.files;

    // Check if there are any files
    if (files.length > 0) {
        // Iterate over each file
        for (var i = 0; i < files.length; i++) {
            var file = files[i];

            // Process each file according to its extension
            if (file.name.endsWith('.geo')) {
                read_GEO_File(file);  // Call the function to read .geo files
            } else if (file.name.endsWith('.205')) {
                read_205_File(file);  // Call the function to read .205 files
            } else {
                alert('Please drop files with .geo or .205 extensions.');  // Alert if the file type is incorrect
            }
        }
    } else {
        alert('No files were dropped.');  // Alert if no files were dropped
    }
});



/// read 205 file

function extractAndConvertNumbers(line) {
// Define the column ranges based on zero-index (subtract 1 from each start and end)
const columnRanges = [
    { start: 30, end: 40 },  // Adjusted from columns 31-40
    { start: 40, end: 50 },  // Adjusted from columns 41-50
    { start: 50, end: 60 },  // Adjusted from columns 51-60
    { start: 60, end: 70 },  // Adjusted from columns 61-70
    { start: 70, end: 85 },  // Adjusted from columns 71-85
    { start: 85, end: 100 }, // Adjusted from columns 86-100
    { start: 100, end: 115 },// Adjusted from columns 101-115
    { start: 115, end: 130 },// Adjusted from columns 116-130
    { start: 130, end: 145 },// Adjusted from columns 131-145
    { start: 145, end: 160 },// Adjusted from columns 146-160
    { start: 160, end: 175 },// Adjusted from columns 161-175
    { start: 175, end: 190 },// Adjusted from columns 176-190
    { start: 190, end: 205 } // Adjusted from columns 191-205
];

// Map over each range, extract the substring, and convert to a floating point number
const numbers = columnRanges.map(range => {
    // Extract the substring based on the start and end indices
    const substring = line.substring(range.start, range.end);
    // Convert the extracted substring to a floating point number
    // Note: parseFloat will ignore trailing non-numeric characters and leading whitespaces
    return parseFloat(substring);
});

// Filter out any NaN values that result from empty or non-numeric strings
return numbers.filter(num => !isNaN(num));
}




function read_205_File(file) {

var reader = new FileReader()
reader.onload = function(e) {
    var text = e.target.result


    material = new BABYLON.StandardMaterial("material", scene)
    diffuseColor = new BABYLON.Color4(Math.random(), Math.random(), Math.random(), 1)


    const lines = text.split('\n'); // Split text into lines
    // Wing pattern for mass data file
    const pattern1 = /^\s*\d+\s+\d+\s+(-?\d+\.\d+)\s+(-?\d+\.\d+)\s+(-?\d+\.\d+)\s+(-?\d+\.\d+)\s+(-?\d+\.\d+)\s+(-?\d+\.\d+)\s+(-?\d+\.\d+)\s+(-?\d+\.\d+)\s+(-?\d+\.\d+)\s+(-?\d+\.\d+)\s*$/

    const results = [];

    lines.forEach(line => {
        const match1 = line.match(pattern1);
        //console.log(line)
        if (match1) {
            results.push(match1.slice(1).map(Number)); // Extract numbers and convert to Number type
        }

        if (extractAndConvertNumbers(line).length == 13) { // this is for mass files following the non-wing format, OJO!!! revise robustness
            results.push(extractAndConvertNumbers(line)) // Extract numbers and convert to Number type
        }


    });

    results.forEach((item) => {
        var sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: Math.cbrt(item[3]/100) }, scene);
        sphere.position.x = item[0];
        sphere.position.y = item[1];
        sphere.position.z = item[2];
        //sphere.scaling.x = item[4];
        //sphere.scaling.y = item[5];
        //sphere.scaling.z = item[6];

        sphere.material = material
        sphere.material.diffuseColor = diffuseColor
        sphere.visibility = 0.5
    })

                
        add_label_to_scene(label_location = (new BABYLON.Vector3(results[0][0], results[0][1], results[0][2])),
        text = file.name, 
        planeHeight = .1,
        label_background_color = diffuseColor, //(new BABYLON.Color3.White()), 
        label_text_color = "white",  // It does not work yet
        my_font_size = 30   // controls the resolution of the text font
        )



}
reader.readAsText(file)
}



















//// read GEO file


function extractGroupedTriplets(text) {
    // Split the text into lines
    const lines = text.split('\n');

    // Prepare the final array of groups of triplets
    const groups = [];
    let currentGroup = [];

    // Regular expression to match lines with exactly three real numbers
    const tripletRegex = /^\s*([+-]?\d*\.?\d+(?:[eE][+-]?\d+)?)\s*[,;\s]\s*([+-]?\d*\.?\d+(?:[eE][+-]?\d+)?)\s*[,;\s]\s*([+-]?\d*\.?\d+(?:[eE][+-]?\d+)?)\s*$/;

    // Iterate over each line
    for (const line of lines) {
        // Check if the line matches the regex
        const match = line.match(tripletRegex);
        if (match) {
            // Extract the numbers from the match and convert them to float
            const triplet = [parseFloat(match[1]), parseFloat(match[2]), parseFloat(match[3])];
            // Add the triplet to the current group
            currentGroup.push(triplet);
        } else {
            // If the current group has triplets and we encounter a non-triplet line, push the current group to groups and start a new one
            if (currentGroup.length > 0) {
                groups.push(currentGroup);
                currentGroup = [];
            }
        }
    }

    // If there are remaining triplets in the last group, add them to groups
    if (currentGroup.length > 0) {
        groups.push(currentGroup);
    }

    // Return the array of groups of triplets
    return groups;
}


// Function to create a ribbon from a group of triplets
function createRibbonFromTriplets(triplets, scene) {
    // Convert triplet data into a format suitable for the ribbon creation
    const paths = triplets.map(triplet => {
        return new BABYLON.Vector3(triplet[0], triplet[1], triplet[2])
    })

    // Use an array of paths to define the shape of the ribbon
    const ribbon = BABYLON.MeshBuilder.CreateRibbon("ribbon", {pathArray: [paths], sideOrientation: BABYLON.Mesh.DOUBLESIDE}, scene)

            // Create and assign a fully metallic material to the mesh.
    var metallicMaterial = new BABYLON.PBRMaterial("metallicMaterial", scene)
    metallicMaterial.metallic = 1
    metallicMaterial.roughness = 0.5
    metallicMaterial.albedoColor = new BABYLON.Color3(Math.random()/2+.2, 1, Math.random()/2+.2) // Metallic green
    //metallicMaterial.albedoColor = new BABYLON.Color3(Math.random(), Math.random(),Math.random()) // Metallic green
    metallicMaterial.subSurface.isRefractionEnabled = true;
    metallicMaterial.subSurface.tintColor = new BABYLON.Color3(1, 1, 0.8) // Light yellow tint
    metallicMaterial.subSurface.tintColorAtDistance = 1;
    
    ribbon.material = metallicMaterial


    //return ribbon;
}



function read_GEO_File(file) {

    var reader = new FileReader()
    reader.onload = function(e) {
        var contents = e.target.result




        dataGroups =   extractGroupedTriplets(contents)

// Create a ribbon for each group of triplets
dataGroups.forEach(group => {
    createRibbonFromTriplets(group )
})







/*
        var lines = contents.split('\n').map(line => line.trim()).filter(line => line)

        var sides = parseInt(lines[1])
        var [xStations, pointsPerCurve] = lines[2].split(/\s+/).map(Number)

        var pointsStructure = Array(sides).fill().map(() => Array(xStations).fill().map(() => new Array(pointsPerCurve).fill(null)))

        lines.slice(3).forEach((line, index) => {
            let [x, y, z] = line.split(/\s+/).map(Number)
            let totalPointsPerSide = xStations * pointsPerCurve
            let sideIndex = index < totalPointsPerSide ? 0 : (sides > 1 ? 1 : 0)
            let xIndex = Math.floor((index % totalPointsPerSide) / pointsPerCurve)
            let pIndex = index % pointsPerCurve
            
            pointsStructure[sideIndex][xIndex][pIndex] = [x, y, z]
        })

        // Convert points to Vector3 and create meshes with metallic material for each side.
        pointsStructure.forEach((side, sideIndex) => {
            var paths = side.map(station => station.map(point => new BABYLON.Vector3(point[0], point[1], point[2])))
            var mesh = BABYLON.MeshBuilder.CreateRibbon("ribbon" + sideIndex, {pathArray: paths, updatable: true, sideOrientation: BABYLON.Mesh.DOUBLESIDE}, scene)
         
        })

        */

        console.log(pointsStructure)
    }
    reader.readAsText(file)
}