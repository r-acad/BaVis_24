

function add_label_to_scene(label_location = (new BABYLON.Vector3(0, 0, 0)),
                            text = "Hello", 
                            planeHeight = .3,
                            label_background_color = "blue", //(new BABYLON.Color3.White()), 
                            label_text_color = "white",  // It does not work yet
                            my_font_size = 80   // controls the resolution of the text font
    
                            ) {

    //Set font
    var font_size = my_font_size
    var font = "bold " + font_size + "px Arial"
    
    //Set height for dynamic texture
    var DTHeight = 1.5 * font_size //or set as wished
    
    //Calcultae ratio
    var ratio = planeHeight/DTHeight
     
    //Use a temporay dynamic texture to calculate the length of the text on the dynamic texture canvas
    var temp = new BABYLON.DynamicTexture("DynamicTexture", 64, scene)
    var tmpctx = temp.getContext()
    tmpctx.font = font
    var DTWidth = tmpctx.measureText(text).width + 8
    
    //Calculate width the plane has to be 
    var planeWidth = DTWidth * ratio
   
    //Create dynamic texture and write the text
    var dynamicTexture = new BABYLON.DynamicTexture("DynamicTexture", {width:DTWidth, height:DTHeight}, scene, false)
    dynamicTexture.hasAlpha = true

    var mat = new BABYLON.StandardMaterial("mat", scene)
    mat.diffuseTexture = dynamicTexture
    mat.emissiveColor = new BABYLON.Color3(1, 1, 1); // White emissive color
    dynamicTexture.drawText(text, null, null, font, label_text_color, label_background_color, true)
    
    //Create plane and set dynamic texture as material
    var plane = BABYLON.MeshBuilder.CreatePlane("plane", {width:planeWidth, height:planeHeight}, scene)
    plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL // Make the plane face the camera
    plane.material = mat
    plane.position = label_location.add(new BABYLON.Vector3(planeHeight/3, planeHeight, 0))

   
   }