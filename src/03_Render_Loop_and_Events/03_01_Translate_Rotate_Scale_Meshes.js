
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
["Scale", "PosX", "PosY", "PosZ", "RotX", "RotY", "RotZ"].forEach((name, index) => {
  object_position_and_orientation.push(createInputField(name, `${index * 40}px`))
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
    }
    currentMesh = pickResult.pickedMesh
    currentMesh.renderOverlay = true
    currentMesh.overlayColor = new BABYLON.Color3(1, 0, 1)
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
  button.top = `${-20 - advancedTexture._rootContainer.children.length * 50}px`
  button.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM
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