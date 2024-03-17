/// <reference path='../../lib/babylon.d.ts' />



function Render_Loop() {

//==============================================
        // RENDER LOOP
        engine.runRenderLoop(function () {
            scene.render()
        })

        window.addEventListener("resize", function () {
            engine.resize()
        })
        //==============================================


    }