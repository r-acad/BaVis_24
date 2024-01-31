/// <reference path='../../lib/babylon.d.ts' />


    // Create HTML Canvas object and start-up rendering engine attached to Canvas
    var canvas = document.getElementById("renderCanvas");
    var engine = new BABYLON.Engine(canvas, true);


        // CREATE SCENE FUNCTION
        createScene = function () {

        // Engine and scene creation
            scene = new BABYLON.Scene(engine);
            scene.clearColor = new BABYLON.Color4(.7, .7, .7, .1); // Transparent clear color to see the gradient background
        
        /*
            // Fog
         scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR
         scene.fogColor = scene.clearColor
         scene.fogStart =-500.0;
         scene.fogEnd = 500.0;
         */

            // Camera
            var camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 150, new BABYLON.Vector3(0, 0, 0), scene);
            camera.attachControl(canvas, true)
            //camera.upperBetaLimit = Math.PI / 2;
	        camera.lowerRadiusLimit = 4;

           
            // CREATE LIGTHS
            
            // // Add HemiLight
            var light1 = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(0, 1, 0), scene);
            light1.intensity = 0.2
            light1.groundColor = new BABYLON.Color3(0, 0, 1);

            // Add a directional light to the scene
            var dlight = new BABYLON.DirectionalLight("dir01", new BABYLON.Vector3(1, -2, -1), scene);
            dlight.position = new BABYLON.Vector3(120, 120, 120);


            // Spotlight
            var splight = new BABYLON.SpotLight("spotLight", new BABYLON.Vector3(0, 4, 0), new BABYLON.Vector3(0, -1, 0), Math.PI / 3, 2, scene);
            splight.intensity = 1;

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

            CreateGizmos(dlight)
            CreateGizmos(splight)


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

