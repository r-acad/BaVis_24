/// <reference path='../../lib/babylon.d.ts' />

var setup_GUI = async function () {

let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("GUI", true, scene)
let loadedGUI = await advancedTexture.parseFromURLAsync("./src/06_GUI/guiTexture.json");

//let loadedGUI = await advancedTexture.parseFromSnippetAsync("A2KPKQ#2")





const gizmoManager = new BABYLON.GizmoManager(scene)
gizmoManager.usePointerToAttachGizmos = false
gizmoManager.positionGizmoEnabled = true
gizmoManager.rotationGizmoEnabled = true
gizmoManager.scaleGizmoEnabled = false

let transformationModeEnabled = false
var selectedMesh = null
let currentMesh = null
let startPosition = null

const object_position_and_orientation = []

const createInputField = (placeholder, topOffset) => {
  const inputField = new BABYLON.GUI.InputText()
  inputField.width = "0.06"
  inputField.maxWidth = "0.06"
  inputField.height = "40px"
  inputField.color = "white"

  inputField.placeholder = placeholder
  inputField.top = topOffset
  inputField.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT
  inputField.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP
  advancedTexture.addControl(inputField)

  inputField.onTextChangedObservable.add(function () {
    inputField.background = "orange"
    updateButton.background = "orange"
  })

  inputField.background = "darkgreen"

  return inputField
}

// Populate the GUI with input fields
;["Scale", "PosX", "PosY", "PosZ", "RotX", "RotY", "RotZ"].forEach((name, index) => {
  object_position_and_orientation.push(createInputField(name, `${index * 40+40}px`))
})

const labelStyles = (label) => {
  label.color = "white"
  label.fontSize = 24
  label.background = "grey"
  label.alpha = 0.5
  label.height = "40px"
  label.paddingTop = "10px"
  label.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT
  label.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER
}

let meshNameLabel = new BABYLON.GUI.TextBlock()
labelStyles(meshNameLabel)
meshNameLabel.top = "-100px"
advancedTexture.addControl(meshNameLabel)

let distanceLabel = new BABYLON.GUI.TextBlock()
labelStyles(distanceLabel)
distanceLabel.top = "-60px"
advancedTexture.addControl(distanceLabel)

let rotationLabel = new BABYLON.GUI.TextBlock()
labelStyles(rotationLabel)
rotationLabel.top = "-20px"
advancedTexture.addControl(rotationLabel)

let positionLabel = new BABYLON.GUI.TextBlock()
labelStyles(positionLabel)
positionLabel.top = "20px"
advancedTexture.addControl(positionLabel)

// Enable mesh picking
canvas.addEventListener("pointerdown", function (evt) {
  var pickResult = scene.pick(scene.pointerX, scene.pointerY)
  if (pickResult.hit) {
    if (currentMesh) {
      currentMesh.renderOverlay = false // Remove previous overlay
      //currentMesh.renderOutline = false

      if (highlightLayer.hasMesh(currentMesh)) {
        highlightLayer.removeMesh(currentMesh);
    }

      


    }
    currentMesh = pickResult.pickedMesh
    currentMesh.renderOverlay = true
    currentMesh.overlayColor = new BABYLON.Color3(0, 1, 1)
    //currentMesh.renderOutline = true
    //currentMesh.outlineColor = new BABYLON.Color3(1, 0, 1)

    highlightLayer.addMesh(currentMesh, BABYLON.Color3.Green());

 
} else {
  if (currentMesh) {
  currentMesh.renderOverlay = false // Remove previous overlay

  if (highlightLayer.hasMesh(currentMesh)) {
    highlightLayer.removeMesh(currentMesh);
}

  }
}


})

function onDragStart() {
  if (currentMesh) {
    meshNameLabel.text = currentMesh.name
    startPosition = currentMesh.position.clone()
    distanceLabel.text = "Move object"
  }
}

const updateObjectProperties = () => {
  if (currentMesh) {
    //const pos = currentMesh.position
    //const rot = currentMesh.rotationQuaternion ? currentMesh.rotationQuaternion.toEulerAngles() : currentMesh.rotation;

    currentMesh.scaling.x = parseFloat(object_position_and_orientation[0].text) //|| pos.x;
    currentMesh.scaling.y = parseFloat(object_position_and_orientation[0].text) //|| pos.x;
    currentMesh.scaling.z = parseFloat(object_position_and_orientation[0].text) //|| pos.x;

    currentMesh.position.x = parseFloat(object_position_and_orientation[1].text) //|| pos.x;
    currentMesh.position.y = parseFloat(object_position_and_orientation[2].text) //|| pos.y;
    currentMesh.position.z = parseFloat(object_position_and_orientation[3].text) //|| pos.z;

    var eulerX = parseFloat(object_position_and_orientation[4].text) //|| 0;
    var eulerY = parseFloat(object_position_and_orientation[5].text) //|| 0;
    var eulerZ = parseFloat(object_position_and_orientation[6].text) //|| 0;

    currentMesh.rotation = new BABYLON.Vector3(BABYLON.Tools.ToRadians(eulerX), BABYLON.Tools.ToRadians(eulerY), BABYLON.Tools.ToRadians(eulerZ))
  }
}

const setObjectPropertiesToInputs = () => {
  if (currentMesh) {
    //const pos = currentMesh.position;
    const rot = currentMesh.rotationQuaternion ? currentMesh.rotationQuaternion.toEulerAngles() : currentMesh.rotation

    object_position_and_orientation[0].text = currentMesh.scaling.x.toFixed(2)
    object_position_and_orientation[1].text = currentMesh.position.x.toFixed(2)
    object_position_and_orientation[2].text = currentMesh.position.y.toFixed(2)
    object_position_and_orientation[3].text = currentMesh.position.z.toFixed(2)

    object_position_and_orientation[4].text = BABYLON.Tools.ToDegrees(rot.x).toFixed(2)
    object_position_and_orientation[5].text = BABYLON.Tools.ToDegrees(rot.y).toFixed(2)
    object_position_and_orientation[6].text = BABYLON.Tools.ToDegrees(rot.z).toFixed(2)
  }
}

function onDrag() {
  if (currentMesh && startPosition) {
    meshNameLabel.text = currentMesh.name

    const currentDistance = BABYLON.Vector3.Distance(startPosition, currentMesh.position)
    distanceLabel.text = `Moving: ${currentDistance.toFixed(2)} units`

    const rotation = currentMesh.rotationQuaternion ? currentMesh.rotationQuaternion.toEulerAngles() : currentMesh.rotation
    rotationLabel.text = `Euler : ${BABYLON.Tools.ToDegrees(rotation.x).toFixed(0)}°, ${BABYLON.Tools.ToDegrees(rotation.y).toFixed(0)}°, ${BABYLON.Tools.ToDegrees(rotation.z).toFixed(0)}°`

    positionLabel.text = `X: ${currentMesh.position.x.toFixed(2)} Y: ${currentMesh.position.y.toFixed(2)} Z: ${currentMesh.position.z.toFixed(2)}`
  }
}

const randomColor = () => new BABYLON.Color4(Math.random(), Math.random(), Math.random(), 1)

const addMesh = (type) => {
  let mesh
  if (type === "box") {
    mesh = BABYLON.MeshBuilder.CreateBox("box", { size: 2 }, scene)
  } else if (type === "sphere") {
    mesh = BABYLON.MeshBuilder.CreateSphere("sphere", { diameter: 2 }, scene)
  } else if (type === "torus") {
    mesh = BABYLON.MeshBuilder.CreateTorus("torus", { diameter: 3, thickness: 1 }, scene)
  }
  mesh.position.x = Math.random() * 10 - 5
  mesh.position.y = Math.random() * 5 + 1
  mesh.position.z = Math.random() * 10 - 5
  mesh.material = new BABYLON.StandardMaterial("material", scene)
  mesh.material.diffuseColor = new BABYLON.Color4(Math.random(), Math.random(), Math.random(), 1)

  mesh.rotationQuaternion = new BABYLON.Quaternion()

  mesh.actionManager = new BABYLON.ActionManager(scene)
  mesh.actionManager.registerAction(
    new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, () => {
      if (transformationModeEnabled) {
        gizmoManager.attachToMesh(mesh)
        currentMesh = mesh
        setObjectPropertiesToInputs()
      }
    })
  )
}

const addButton = (text, callback, back_color = "blue") => {
  const button = BABYLON.GUI.Button.CreateSimpleButton("button", text)
  button.width = "150px"
  button.height = "40px"
  button.color = "white"
  button.background = back_color
  button.top = `${+720 - advancedTexture._rootContainer.children.length * 50}px`
  button.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM
  button.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT
  button.onPointerUpObservable.add(callback)
  advancedTexture.addControl(button)
  return button
}

var updateButton = addButton("Update", () => {
  object_position_and_orientation.forEach((inputField) => (inputField.background = "darkgreen"))
  updateButton.background = "darkgreen"
  updateObjectProperties()
})

addButton("Add Box", () => addMesh("box"))
addButton("Add Sphere", () => addMesh("sphere"))
addButton("Add Torus", () => addMesh("torus"))

var copyButton = addButton("Copy", () => {}, "orange")
var cancelButton = addButton("Cancel", () => {}, "magenta")

// "Transformation" button to toggle mode
var transformButton = addButton("Transformation", () => {
  transformationModeEnabled = !transformationModeEnabled // Toggle the mode
  transformButton.background = transformationModeEnabled ? "green" : "blue"
  if (!transformationModeEnabled) {
    gizmoManager.attachToMesh(null) // Detach any mesh
    currentMesh = null
    gizmoManager.gizmos.positionGizmo.isEnabled = false
    gizmoManager.gizmos.rotationGizmo.isEnabled = false
  } else {
    gizmoManager.gizmos.positionGizmo.isEnabled = true
    gizmoManager.gizmos.rotationGizmo.isEnabled = true
  }
})

gizmoManager.gizmos.positionGizmo.onDragStartObservable.add(onDragStart)
gizmoManager.gizmos.positionGizmo.onDragObservable.add(onDrag)
gizmoManager.gizmos.positionGizmo.onDragEndObservable.add(() => (distanceLabel.text = ""))
gizmoManager.gizmos.rotationGizmo.onDragStartObservable.add(onDragStart)
gizmoManager.gizmos.rotationGizmo.onDragObservable.add(onDrag)

// Update the inputs continuously as the object is moved or rotated
gizmoManager.gizmos.positionGizmo.onDragObservable.add(setObjectPropertiesToInputs)
gizmoManager.gizmos.rotationGizmo.onDragObservable.add(setObjectPropertiesToInputs)

scene.onPointerObservable.add((pointerInfo) => {
  if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERDOWN && transformationModeEnabled) {
    var mesh = pointerInfo.pickInfo.pickedMesh
    if (mesh) {
      var clone = mesh.clone()
      clone.material = mesh.material.clone()
      clone.material.diffuseColor = BABYLON.Color3.Magenta()
      clone.name = "Cloned"
      gizmoManager.attachToMesh(clone)
      selectedMesh = mesh
    }
  }
})

copyButton.onPointerClickObservable.add(function () {
  if (selectedMesh && gizmoManager.gizmos.positionGizmo.attachedMesh) {
    var clonedMesh = gizmoManager.gizmos.positionGizmo.attachedMesh
    selectedMesh.position.copyFrom(clonedMesh.position)
    selectedMesh.rotation.copyFrom(clonedMesh.rotation)
    selectedMesh.scaling.copyFrom(clonedMesh.scaling)
    selectedMesh.material.diffuseColor.copyFrom(clonedMesh.material.diffuseColor)
  }
})

updateButton.onPointerClickObservable.add(function () {
  if (selectedMesh && gizmoManager.gizmos.positionGizmo.attachedMesh) {
    var clonedMesh = gizmoManager.gizmos.positionGizmo.attachedMesh
    selectedMesh.position.copyFrom(clonedMesh.position)
    selectedMesh.rotation.copyFrom(clonedMesh.rotation)
    selectedMesh.scaling.copyFrom(clonedMesh.scaling)
    clonedMesh.dispose()
    gizmoManager.attachToMesh(null)
    selectedMesh = null
  }
})

cancelButton.onPointerClickObservable.add(function () {
  if (selectedMesh && gizmoManager.gizmos.positionGizmo.attachedMesh) {
    gizmoManager.gizmos.positionGizmo.attachedMesh.dispose()
  }

  transformationModeEnabled = false
  transformButton.background = transformationModeEnabled ? "green" : "blue"

  gizmoManager.attachToMesh(null) // Detach any mesh
  currentMesh = null
  gizmoManager.gizmos.positionGizmo.isEnabled = false
  gizmoManager.gizmos.rotationGizmo.isEnabled = false
})

/*

cancelButton.onPointerClickObservable.add(function() {

if (selectedMesh && gizmoManager.gizmos.positionGizmo.attachedMesh) {           
    gizmoManager.gizmos.positionGizmo.attachedMesh.material = selectedMesh.material
}

transformationModeEnabled = false
transformButton.background = transformationModeEnabled ? "green" : "blue";

gizmoManager.attachToMesh(null); // Detach any mesh
    currentMesh = null;
    gizmoManager.gizmos.positionGizmo.isEnabled = false;
    gizmoManager.gizmos.rotationGizmo.isEnabled = false;
})
*/






















var measurementMode = false;
        var selectedPoints = [];
        var linesAndMarkers = [];
        var spheres = [];
        var toggleMeasureButton = document.getElementById('toggleMeasure');




        function updateCursorAndButtonStyle() {
            if (measurementMode) {
                canvas.style.cursor = 'crosshair';
                toggleMeasureButton.style.backgroundColor = 'green';
            } else {
                canvas.style.cursor = 'default';
                toggleMeasureButton.style.backgroundColor = 'blue';
            }
        }

        document.getElementById('createSpheres').addEventListener('click', function() {
            // Clean only spheres and keep lines/markers intact
            spheres.forEach(sphere => sphere.dispose());
            spheres = [];

            var count = document.getElementById('sphereCount').value;
            for (let i = 0; i < count; i++) {
                let sphere = BABYLON.MeshBuilder.CreateSphere("sphere" + i, {diameter: 0.5}, scene);
                sphere.position = new BABYLON.Vector3(Math.random() * 5 - 2.5, Math.random() * 5 - 2.5, Math.random() * 5 - 2.5);
                spheres.push(sphere);
            }
        });

        document.getElementById('toggleMeasure').addEventListener('click', function() {
            measurementMode = !measurementMode;
            updateCursorAndButtonStyle();
        });

        document.getElementById('deleteLast').addEventListener('click', function() {
            if (linesAndMarkers.length > 0) {
                var lastItem = linesAndMarkers.pop();
                lastItem.line?.dispose();
                lastItem.marker?.dispose();
                lastItem.midpointMesh?.dispose();
                advancedTexture.removeControl(lastItem.label);
            }
        });

        document.getElementById('deleteAll').addEventListener('click', function() {
            while(linesAndMarkers.length) {
                var item = linesAndMarkers.pop();
                item.line?.dispose();
                item.marker?.dispose();
                item.midpointMesh?.dispose();
                advancedTexture.removeControl(item.label);
            }
            selectedPoints = [];
        });

        window.addEventListener("click", function(evt) {
    if (!measurementMode || !scene) return;

    var pickResult = scene.pick(scene.pointerX, scene.pointerY);
    if (pickResult.hit && pickResult.pickedMesh !== canvas) {
        var pickedPoint = pickResult.pickedPoint;
        selectedPoints.push(pickedPoint);

        if (selectedPoints.length <= 2) {
            // Format the coordinates into a string with 2 decimal places
            var coordsText = "x: " + pickedPoint.x.toFixed(2) + ", y: " + pickedPoint.y.toFixed(2) + ", z: " + pickedPoint.z.toFixed(2);
            var label = new BABYLON.GUI.Rectangle();
            label.width = "140px"; // Adjust width to fit the coordinates text
            label.height = "30px";
            label.cornerRadius = 10;
            label.color = "White";
            label.thickness = 1;
            label.background = "rgba(255, 0, 0, 0.5)"; // Set alpha to 0.5 for the label background
            var text1 = new BABYLON.GUI.TextBlock();
            text1.text = coordsText; // Use the coordinates text here
            text1.color = "white";
            text1.fontSize = "50%"; // Set the size of the text to half of its current size
            label.addControl(text1);
            advancedTexture.addControl(label);
            var invisibleMarker = BABYLON.MeshBuilder.CreateSphere("markerPoint" + selectedPoints.length, {diameter: 0.01, visibility: 0}, scene);
            invisibleMarker.position = pickedPoint;
            label.linkWithMesh(invisibleMarker);

            // Store label with invisible markers for cleanup
            linesAndMarkers.push({label, marker: invisibleMarker});
        }

        if (selectedPoints.length === 2) {
            var distance = BABYLON.Vector3.Distance(selectedPoints[0], selectedPoints[1]).toFixed(2);
            var line = BABYLON.MeshBuilder.CreateLines("line", {points: selectedPoints}, scene);
            var midpoint = BABYLON.Vector3.Center(selectedPoints[0], selectedPoints[1]);
            var midpointMesh = BABYLON.MeshBuilder.CreateSphere("midpoint", {diameter: 0.01, visibility: 0}, scene);
            midpointMesh.position = midpoint;
            line.renderingGroupId = 1; // Render this line on top of other meshes

            var label = new BABYLON.GUI.Rectangle();
            label.width = "120px"; // Adjust width to fit the distance text
            label.height = "30px";
            label.cornerRadius = 20;
            label.color = "White";
            label.thickness = 2;
            label.background = "rgba(0, 128, 0, 0.5)"; // Set alpha to 0.5 for the label background
            var text1 = new BABYLON.GUI.TextBlock();
            text1.text = distance + ' units';
            text1.color = "white";
            text1.fontSize = "50%"; // Set the size of the text to half of its current size
            label.addControl(text1);
            advancedTexture.addControl(label);
            label.linkWithMesh(midpointMesh);

            linesAndMarkers.push({line, label, midpointMesh});

            selectedPoints = [];
        }
    }
});

















const Button_show_global_menu = advancedTexture.getControlByName('Button_show_global_menu')
const StackPanel_Global_Menu = advancedTexture.getControlByName('StackPanel_Global_Menu')

const Button_read_files = advancedTexture.getControlByName('Button_read_files')
const read_files_box = advancedTexture.getControlByName('read_files_box')
const Button_close_read_files_box = advancedTexture.getControlByName('Button_close_read_files_box')

const Button_render_options = advancedTexture.getControlByName('Button_render_options')
const render_options_box = advancedTexture.getControlByName('render_options_box')

const Slider_ground_z = advancedTexture.getControlByName('Slider_ground_z')
const InputText_ground_z = advancedTexture.getControlByName('InputText_ground_z')

const Checkbox_show_ground = advancedTexture.getControlByName('Checkbox_show_ground')

const Button_show_inspector = advancedTexture.getControlByName('Button_show_inspector')

const Button_change_full_screen = advancedTexture.getControlByName('Button_change_full_screen')


const Button_close_render_options_box = advancedTexture.getControlByName('Button_close_render_options_box')

const Button_readnastran = advancedTexture.getControlByName('Button_readnastran')

const Button_read_GEO_file = advancedTexture.getControlByName('Button_read_GEO_file')

Button_read_GEO_file.onPointerDownObservable.add(function() {
    read_files_box.isVisible = !read_files_box.isVisible 
    showDropArea()
})



Button_change_full_screen.onPointerDownObservable.add(function() {
    //render_options_box.isVisible = !render_options_box.isVisible 
    toggleFullscreen()
})


Button_close_read_files_box.onPointerUpObservable.add(function() {
    read_files_box.isVisible = !read_files_box.isVisible 
})

Button_close_render_options_box.onPointerUpObservable.add(function() {
    render_options_box.isVisible = !render_options_box.isVisible 
})


Button_read_files.onPointerUpObservable.add(function() {
    read_files_box.isVisible = !read_files_box.isVisible 
})

Button_render_options.onPointerUpObservable.add(function() {
    render_options_box.isVisible = !render_options_box.isVisible 
})


Button_show_inspector.onPointerUpObservable.add(function() {
     scene.debugLayer.show({embedMode: true})
}
)



Slider_ground_z.onValueChangedObservable.add(function(value) {
        
    InputText_ground_z.text = value.toFixed(3)
   
    ground.position.z = value
    major_gridLines.position.z = value
    minor_gridLines.position.z = value
    
})

InputText_ground_z.onBlurObservable.add(function() {
    // Update ground z location
    var z_value = parseFloat(InputText_ground_z.text);
    if (!isNaN(z_value) ) {
        ground.position.z = z_value
        major_gridLines.position.z = z_value
        minor_gridLines.position.z = z_value
        Slider_ground_z.value = z_value
    } else {
        // Reset to default if input is invalid
        InputText_ground_z.text = "Not valid";
        ground.position.z = Slider_ground_z.text
        major_gridLines.position.z = Slider_ground_z.text
        minor_gridLines.position.z = Slider_ground_z.text
    }
})

Checkbox_show_ground.onIsCheckedChangedObservable.add(function(value) {
    ground.isVisible = !ground.isVisible 
    major_gridLines.isVisible = !major_gridLines.isVisible
    minor_gridLines.isVisible = !minor_gridLines.isVisible
    render_options_box.isVisible = !render_options_box.isVisible 
})



Button_show_global_menu.onPointerUpObservable.add(function() {
    StackPanel_Global_Menu.isVisible = !StackPanel_Global_Menu.isVisible 
})



Button_readnastran.onPointerDownObservable.add(function() {
    var fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.style.display = 'none';
    fileInput.multiple = true;
    fileInput.accept = ".bdf,.dat"; // Accept only .bdf and .dat files
    //document.body.appendChild(fileInput);

    fileInput.onchange = function () {
        var files = fileInput.files;
        var allLines = [];
        var filesRead = 0;
        
        Array.from(files).forEach(file => {
            var reader = new FileReader();
            reader.onload = function (e) {
                var lines = e.target.result.split("\n");
                allLines = allLines.concat(lines);
                filesRead++;
                if (filesRead === files.length) {
                    build_nastran_model(allLines)
                }
            };
            reader.readAsText(file);
        });
    };

    fileInput.click();
})






}























function toggleFullscreen() {
    if (!document.fullscreenElement) {
        // Enter fullscreen
        if (canvas.requestFullscreen) {
            canvas.requestFullscreen();
        } else if (canvas.mozRequestFullScreen) { /* Firefox */
            canvas.mozRequestFullScreen();
        } else if (canvas.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
            canvas.webkitRequestFullscreen();
        } else if (canvas.msRequestFullscreen) { /* IE/Edge */
            canvas.msRequestFullscreen();
        }
    } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) { /* Firefox */
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { /* IE/Edge */
            document.msExitFullscreen();
        }
    }
}