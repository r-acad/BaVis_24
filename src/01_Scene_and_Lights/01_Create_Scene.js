/// <reference path='../../lib/babylon.d.ts' />

// CREATE SCENE FUNCTION
var createScene = async function () {


    // Create HTML Canvas object and start-up rendering engine attached to Canvas
    canvas = document.getElementById("renderCanvas");
    //engine = new BABYLON.Engine(canvas, true);
    const engine = new BABYLON.Engine(canvas, true, { stencil: true });





    // Engine and scene creation
    scene = new BABYLON.Scene(engine);



    // Set the background color to deep blue sky
    scene.clearColor = new BABYLON.Color4(153/255, 204/255, 1, 1); // RGBA values

    // Parameters: name, alpha, beta, radius, target, scene
    // Adjust alpha and beta to point in the (0,-1,0) direction with an up vector of (0,0,1)
    //var camera = new BABYLON.ArcRotateCamera("Camera", -1* Math.PI / 3,  Math.PI / 3, 30, new BABYLON.Vector3(0, 0, 0), scene);
    var camera = new BABYLON.ArcRotateCamera("Camera", -2.21, 1.088, 35, new BABYLON.Vector3(19, 11, 6), scene);

    camera.fov = 0.647;
    camera.upVector = new BABYLON.Vector3(0, 0, 1)
    camera.rotation.z = Math.PI / 2
    camera.attachControl(canvas, true);
    camera.upperBetaLimit = Math.PI;
    camera.lowerBetaLimit = 0;
    camera.lowerAlphaLimit = null;
    camera.upperAlphaLimit = null;
    camera.inertia = 0.9;
    camera.lowerRadiusLimit = .2;
    camera.upperRadiusLimit = 150;
    camera.wheelPrecision = 150;

    // Adjust zoom rate and panning sensibility proportional to distance
    camera.onViewMatrixChangedObservable.add(() => {
        var distance = BABYLON.Vector3.Distance(camera.position, camera.target);
        camera.wheelPrecision = 200 / distance; // Adjust this value as needed
        camera.panningSensibility = 5000 / distance  // Adjust this value as needed
    });

    var originalTarget = camera.target.clone(); // Store original target
    var lastTarget = camera.target.clone(); // Initialize last target with the initial camera target

    canvas.addEventListener('pointerdown', function (evt) {
        if (evt.button === 1) { // Right mouse button
            evt.preventDefault(); // Prevent context menu
            var pickResult = scene.pick(scene.pointerX, scene.pointerY);
            if (pickResult.hit) {
                lastTarget = camera.target.clone(); // Update last target before moving to a new one
                smoothTransitionToTarget(pickResult.pickedPoint, camera, scene, 0.3);
            }
        }
    })

    canvas.addEventListener('dblclick', function (evt) {
        var pickResult = scene.pick(scene.pointerX, scene.pointerY);
        if (!pickResult.hit) { // If double-click did not hit any mesh, return to last target
            smoothTransitionToTarget(lastTarget, camera, scene, 0.3);
        }
    })

    window.addEventListener('keydown', function (evt) {
        if (evt.key === 'h' || evt.key === 'H') {
            smoothTransitionToTarget(lastTarget, camera, scene, 0.3);
        } else if (evt.key === 'o' || evt.key === 'O') {
            smoothTransitionToTarget(originalTarget, camera, scene, 0.3);
        }
    })


    // CREATE LIGTHS

    // // Add HemiLight from above
    var hemi_light_from_above = new BABYLON.HemisphericLight("hemiLight_above", new BABYLON.Vector3(0, 1, 0), scene);
    hemi_light_from_above.intensity = 0.5
    hemi_light_from_above.diffuse = new BABYLON.Color3(1, 1, 1); // This sets the light color to white
    //hemi_light_from_above.groundColor = new BABYLON.Color3(0, 0, 1);

    // // Add HemiLight from below
    var hemi_light_from_below = new BABYLON.HemisphericLight("hemiLight_below", new BABYLON.Vector3(0, -1, 0), scene);
    hemi_light_from_below.intensity = 0.4
    hemi_light_from_below.groundColor = new BABYLON.Color3(0, 0, 1);

    var dlight = new BABYLON.DirectionalLight("dir_from_below", new BABYLON.Vector3(0, 0, 1), scene);
    dlight.position = new BABYLON.Vector3(0, 0, 0);
    dlight.intensity = 0.5


                    // Move light with camera
                    scene.registerBeforeRender(function () {
                        dlight.direction = camera.getTarget().subtract(camera.position).normalize();
                    });


    // Shadow Generator
    var shadowGenerator = new BABYLON.ShadowGenerator(2048, dlight);
    shadowGenerator.useBlurExponentialShadowMap = true;
    shadowGenerator.blurKernel = 32;

    // Highlight layer
    highlightLayer = new BABYLON.HighlightLayer("hl1", scene);

    setup_GUI()



    engine.runRenderLoop(function () {
        scene.render();
    })

    window.addEventListener('resize', function () {
        engine.resize();
    })



  //  console.log("Meshes ", scene.meshes)
    return [scene, shadowGenerator, dlight]



} //END OF CREATE SCENE FUNCTION


function smoothTransitionToTarget(newTarget, camera, scene, durationInSeconds) {
    var frameRate = 60;
    var totalFrames = durationInSeconds * frameRate;

    var animCamTarget = new BABYLON.Animation("animCam", "target", frameRate, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);

    var keys = [];
    keys.push({ frame: 0, value: camera.target });
    keys.push({ frame: totalFrames, value: newTarget });

    animCamTarget.setKeys(keys);

    scene.beginDirectAnimation(camera, [animCamTarget], 0, totalFrames, false);
}
