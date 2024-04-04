/// <reference path='../../lib/babylon.d.ts' />

var setup_GUI = async function () {

let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("GUI", true, scene)




//let loadedGUI = await advancedTexture.parseFromURLAsync("./src/06_GUI/guiTexture.json");

let loadedGUI = await advancedTexture.parseFromSnippetAsync("1G2LYV#32")





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