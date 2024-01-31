/// <reference path='../../lib/babylon.d.ts' />

function load_STL_file(path_and_filename, scale = 1.0) {

                // STL file to be loaded
                var stlFile = path_and_filename

                BABYLON.SceneLoader.ImportMesh("", "", stlFile, scene, function (newMeshes) {
                    //camera.target = newMeshes[0]

                    var loadedMesh = newMeshes[0]

                    loadedMesh.scaling = new BABYLON.Vector3(scale, scale, scale)
                })

            }

