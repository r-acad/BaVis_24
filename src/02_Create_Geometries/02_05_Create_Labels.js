function add_label_to_scene(label_location = new BABYLON.Vector3(0, 0, 0),
                            text = "Hello", 
                            planeHeight = 0.3,
                            label_background_color = new BABYLON.Color3(0, 0, 1), // default to blue using Color3
                            label_text_color = "white",
                            my_font_size = 80) {

    // Correct color setup for the text background
    const backgroundColor = new BABYLON.Color4(label_background_color.r, label_background_color.g, label_background_color.b, 1);

    // Set font
    const font = "bold " + my_font_size + "px Arial";

    // Set height for dynamic texture
    const DTHeight = 1.5 * my_font_size; // or set as wished
    
    // Calculate ratio
    const ratio = planeHeight / DTHeight;

    // Use a temporary dynamic texture to calculate the length of the text on the canvas
    const temp = new BABYLON.DynamicTexture("DynamicTexture", 64, scene);
    const tmpctx = temp.getContext();
    tmpctx.font = font;
    const DTWidth = tmpctx.measureText(text).width + 8;

    // Calculate width the plane has to be
    const planeWidth = DTWidth * ratio;

    // Create dynamic texture and write the text
    const dynamicTexture = new BABYLON.DynamicTexture("DynamicTexture", {width: DTWidth, height: DTHeight}, scene, false);
    dynamicTexture.hasAlpha = true;

    const mat = new BABYLON.StandardMaterial("mat", scene);
    mat.diffuseTexture = dynamicTexture;
    mat.emissiveColor = new BABYLON.Color3(label_background_color.r, label_background_color.g, label_background_color.b); // Set emissive color to match background

    dynamicTexture.drawText(text, null, null, font, label_text_color, backgroundColor.toHexString(), true);

    // Create plane and set dynamic texture as material
    const plane = BABYLON.MeshBuilder.CreatePlane("plane", {width: planeWidth, height: planeHeight}, scene);
    plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL; // Make the plane face the camera
    plane.material = mat;
    plane.position = label_location.add(new BABYLON.Vector3(planeHeight / 3, planeHeight, 0));

    plane.renderingGroupId = 1; // Render this plane on top of other meshes
}
