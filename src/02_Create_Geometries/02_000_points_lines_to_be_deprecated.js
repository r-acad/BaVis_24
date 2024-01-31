

function create_points(scene) {

document.getElementById("createPointsBtn").addEventListener("click", createPoints)
document.getElementById("resetSceneBtn").addEventListener("click", resetScene)


var pcs, lines = []


// PointsCloudSystem
pcs = new BABYLON.PointsCloudSystem("pcs", 1, scene)


function createPoints() {
    var amount = document.getElementById("pointCountInput").valueAsNumber
    if (!amount) return

    // Clear previous points and lines
    resetScene()

    // Add points to the PCS
    pcs.addPoints(amount, (particle, i, s) => {
        var randomPos = new BABYLON.Vector3(
            Math.random() * 100 - 50,
            Math.random() * 10 + 5,
            Math.random() * 100 - 50
        )
        particle.position = randomPos
        return particle
    })

    pcs.buildMeshAsync()

    // Create lines connecting random points
    for (var i = 0; i < amount; i++) {
        var pointA = pcs.particles[Math.floor(Math.random() * pcs.particles.length)].position
        var pointB = pcs.particles[Math.floor(Math.random() * pcs.particles.length)].position
        var line = BABYLON.MeshBuilder.CreateLines("line" + i, {points: [pointA, pointB], updatable: false}, scene)
        lines.push(line)
    }

}



function resetScene() {
    if (pcs) pcs.dispose() // Dispose the current PCS
    lines.forEach(function (line) {
        line.dispose()
    })
    lines = []
    pcs = new BABYLON.PointsCloudSystem("pcs", 1, scene)
}


}

