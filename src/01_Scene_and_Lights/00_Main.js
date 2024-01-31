/// <reference path='../../lib/babylon.d.ts' />

function main() {

    // STEP 01 : Set-up Scene, Camera and Lights
    scene_array =  createScene()    
    scene = scene_array[0]  
    shadowGenerator = scene_array[1]  
    light = scene_array[2]

    // STEP 02 : Add Geometries
    Create_and_Render_Geometries()

    // STEP 03 : Render Loop and Resize event
    Render_Loop()

}