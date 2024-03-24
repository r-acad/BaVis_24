
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
        e.preventDefault()
        dropArea.style.display = 'none'
        var file = e.dataTransfer.files[0]
        if (file && file.name.endsWith('.geo')) {
            read_GEO_File(file)
        } else {
            alert('Please drop a .geo file.')
        }
    })

    function read_GEO_File(file) {

        var reader = new FileReader()
        reader.onload = function(e) {
            var contents = e.target.result
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
                
                // Create and assign a fully metallic material to the mesh.
                var metallicMaterial = new BABYLON.PBRMaterial("metallicMaterial", scene);
        metallicMaterial.metallic = 1
        metallicMaterial.roughness = 0.5
        metallicMaterial.albedoColor = new BABYLON.Color3(0, 1, 0); // Metallic green
        metallicMaterial.subSurface.isRefractionEnabled = true;
        metallicMaterial.subSurface.tintColor = new BABYLON.Color3(1, 1, 0.8); // Light yellow tint
        metallicMaterial.subSurface.tintColorAtDistance = 1;
                mesh.material = metallicMaterial
            })

            console.log(pointsStructure)
        }
        reader.readAsText(file)
    }

