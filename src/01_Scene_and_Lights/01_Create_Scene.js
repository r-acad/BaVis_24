/// <reference path='../../lib/babylon.d.ts' />


    // Create HTML Canvas object and start-up rendering engine attached to Canvas
    var canvas = document.getElementById("renderCanvas");
    var engine = new BABYLON.Engine(canvas, true);


        // CREATE SCENE FUNCTION
        createScene = function () {

        // Engine and scene creation
            scene = new BABYLON.Scene(engine);
            //scene.clearColor = new BABYLON.Color4(.7, .7, .7, 1); // Transparent clear color to see the gradient background
        
        /*
            // Fog
         scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR
         scene.fogColor = scene.clearColor
         scene.fogStart =-500.0;
         scene.fogEnd = 500.0;
         */

//        var camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 2,  Math.PI / 2,  20, new BABYLON.Vector3(0, 0, 0), scene);


// Parameters: name, alpha, beta, radius, target, scene
// Adjust alpha and beta to point in the (0,-1,0) direction with an up vector of (0,0,1)
var camera = new BABYLON.ArcRotateCamera("Camera", -1* Math.PI / 3,  Math.PI / 3, 30, new BABYLON.Vector3(0, 0, 0), scene);



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
         camera.upperRadiusLimit = 1000;
         camera.wheelPrecision = 150;
         
                // Adjust zoom rate and panning sensibility proportional to distance
                camera.onViewMatrixChangedObservable.add(() => {
                    var distance = BABYLON.Vector3.Distance(camera.position, camera.target);
                    camera.wheelPrecision = 200 / distance; // Adjust this value as needed
                    camera.panningSensibility = 5000 / distance  // Adjust this value as needed
                });       

         var originalTarget = camera.target.clone(); // Store original target
         var lastTarget = camera.target.clone(); // Initialize last target with the initial camera target
         

         canvas.addEventListener('pointerdown', function(evt) {
            if (evt.button === 1) { // Right mouse button
                evt.preventDefault(); // Prevent context menu
                var pickResult = scene.pick(scene.pointerX, scene.pointerY);
                if (pickResult.hit) {
                    lastTarget = camera.target.clone(); // Update last target before moving to a new one
                    smoothTransitionToTarget(pickResult.pickedPoint, camera, scene, 0.3);
                }
            }
        });

        canvas.addEventListener('dblclick', function(evt) {
            var pickResult = scene.pick(scene.pointerX, scene.pointerY);
            if (!pickResult.hit) { // If double-click did not hit any mesh, return to last target
                smoothTransitionToTarget(lastTarget, camera, scene, 0.3);
            }
        });

        window.addEventListener('keydown', function(evt) {
            if (evt.key === 'h' || evt.key === 'H') {
                smoothTransitionToTarget(lastTarget, camera, scene, 0.3);
            } else if (evt.key === 'o' || evt.key === 'O') {
                smoothTransitionToTarget(originalTarget, camera, scene, 0.3);
            }
        });


            // CREATE LIGTHS
            
            // // Add HemiLight from above
            var hemi_light_from_above = new BABYLON.HemisphericLight("hemiLight_above", new BABYLON.Vector3(0, 0, -1), scene);
            hemi_light_from_above.intensity = 0.2
            hemi_light_from_above.groundColor = new BABYLON.Color3(0, 0, 1);

            // // Add HemiLight from below
            var hemi_light_from_below = new BABYLON.HemisphericLight("hemiLight_below", new BABYLON.Vector3(0, 0, 1), scene);
            hemi_light_from_below.intensity = 0.2
            hemi_light_from_below.groundColor = new BABYLON.Color3(0, 0, 1);

            // Add a directional lights to the scene
            var dlight = new BABYLON.DirectionalLight("dir_from_above", new BABYLON.Vector3(0, 0, -1), scene);
            dlight.position = new BABYLON.Vector3(120, 120, 120);
            dlight.intensity = 0.8

            var dlight = new BABYLON.DirectionalLight("dir_from_below", new BABYLON.Vector3(0, 0, 1), scene);
            dlight.position = new BABYLON.Vector3(120, -120, -120);
            dlight.intensity = 0.5



            // Spotlight
            var splight = new BABYLON.SpotLight("spotLight", new BABYLON.Vector3(0, 0, 100), new BABYLON.Vector3(.3, 0, -1), Math.PI / 3, 2, scene);
            splight.intensity = .5

            // Shadow Generator
            var shadowGenerator = new BABYLON.ShadowGenerator(2048, dlight);
            shadowGenerator.useBlurExponentialShadowMap = true;
            shadowGenerator.blurKernel = 32;

            // Create Gizmos to rotate lights
            function CreateGizmos(customLight) {
            const lightGizmo = new BABYLON.LightGizmo();
            lightGizmo.scaleRatio = 2;
            lightGizmo.light = customLight;

            const gizmoManager = new BABYLON.GizmoManager(scene);
            gizmoManager.positionGizmoEnabled = true;
            gizmoManager.rotationGizmoEnabled = true;
            gizmoManager.usePointerToAttachGizmos = false;
            gizmoManager.attachToMesh(lightGizmo.attachedMesh);
            }

            //CreateGizmos(dlight)
            //CreateGizmos(splight)


            /*
            // Sphere that casts and receives shadows
            var sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 1}, scene);
            sphere.position.y = 1;
            sphere.castShadows = true;
            shadowGenerator.addShadowCaster(sphere);

            // Link light direction to the helper sphere rotation
            helperSphere.rotationQuaternion = new BABYLON.Quaternion();
            scene.onBeforeRenderObservable.add(() => {
                // Update the spotlight position to be below the helper sphere
                dlight.position = helperSphere.position.subtract(new BABYLON.Vector3(0, 2, 0));

                // Update the spotlight direction based on helper sphere rotation
                if (helperSphere.rotationQuaternion) {
                    var forward = new BABYLON.Vector3(0, -1, 0);
                    forward = BABYLON.Vector3.TransformNormal(forward, helperSphere.getWorldMatrix());
                    dlight.direction = forward;
                }
            })

            // Helper sphere
            var helperSphere = BABYLON.MeshBuilder.CreateSphere("helperSphere", {diameter: 0.2}, scene);
            helperSphere.position = dlight.position.clone();
            helperSphere.position.y = dlight.position.y + 2; // Keep the helper sphere 2 meters above the spotlight

            // Gizmo to move the light
            var gizmo = new BABYLON.PositionGizmo();
            //gizmo.attachedMesh = helperSphere;
            gizmo.parent = dlight

            // Rotation gizmo to rotate the light
            var rotationGizmo = new BABYLON.RotationGizmo();
            //rotationGizmo.attachedMesh = helperSphere;
            rotationGizmo.parent = dlight;
*/


            console.log("Meshes ", scene.meshes)
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
