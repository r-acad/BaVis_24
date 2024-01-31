///  Color scales

gradcol = function grad_col_rgb_oldbutok( level , min = 0, max = 1, reverse = false) {
    // original visual basic function
    let i = (level-min)/(max-min)
    if (reverse) {i = (1-i)}

    if (i > 1 ) { i = 1} 
    if (i < 0 ) { i = 0} 

    let sig = 0.09
    let d = 1 / 5
    let l_bc2 = 255 * Math.exp(-1 * ((i - 0.8 * d) ** 2) / (2 * sig ** 2))
    let l_bc3 = 255 * Math.exp(-1 * ((i - 1.3 * d) ** 2) / (3.4 * sig ** 2))
    let l_gc3 = l_bc3
    let l_gc4 = 255 * Math.exp(-1 * ((i - 2.2 * d) ** 2) / (3 * sig ** 2))
    let l_gc5 = 255 * Math.exp(-1 * ((i - 3.7 * d) ** 2) / (4.3 * sig ** 2))
    let l_rc5 = l_gc5
    let l_rc7 = 255 * Math.exp(-1 * ((i - 5 * d) ** 2) / (4.4 * sig ** 2))
    let l_rc =  l_rc5 +  l_rc7
    let l_bc = l_bc2 + l_bc3 
    let l_gc = l_gc3 + l_gc4 + l_gc5 
    
    r = l_bc/255
    g = l_gc /255
    b = l_rc /255


    color = new BABYLON.Color3(r, g, b)

    return color

  }   



  mapcol =  function mapValueToColor(value) {
            // Ensure the input is clamped between 0 and 1
            value = Math.max(0, Math.min(value, 1));
        
            let color;
            
            if (value <= 0.1) {
                color = new BABYLON.Color3(0, 0, 0.5); // Dark Blue
            } else if (value <= 0.2) {
                color = new BABYLON.Color3(0.5, 0.5, 1); // Light Blue
            } else if (value <= 0.3) {
                color = new BABYLON.Color3(0, 0.5, 0); // Dark Green
            } else if (value <= 0.4) {
                color = new BABYLON.Color3(0.5, 1, 0.5); // Light Green
            } else if (value <= 0.5) {
                color = new BABYLON.Color3(0.5, 0.5, 0); // Dark Yellow
            } else if (value <= 0.6) {
                color = new BABYLON.Color3(1, 1, 0); // Light Yellow
            } else if (value <= 0.7) {
                color = new BABYLON.Color3(1, 0.5, 0); // Light Orange
            } else if (value <= 0.8) {
                color = new BABYLON.Color3(1, 0.5, 0); // Dark Orange
            } else if (value <= 0.9) {
                color = new BABYLON.Color3(1, 0, 0); // Light Red
            } else {
                color = new BABYLON.Color3(0.5, 0, 0.5); // Purple
            }
        
            return color;
        }



    rainbcol =    function rainbowColor(value) {
            // Ensure the input is clamped between 0 and 1
            value = Math.max(0, Math.min(value, 1));
        
            // Convert value to a hue in the HSV color model
            let hue = value * 360;
        
            // Convert HSV to RGB
            let f = (n, k = (n + hue / 60) % 6) => value - value * Math.max(Math.min(k, 4 - k, 1), 0);
            let r = f(5);
            let g = f(3);
            let b = f(1);
        
            // Create and return a new BABYLON.Color3 object with the RGB values
            return new BABYLON.Color3(r, g, b);
        }





        get_Color_from_scalar_rgb_rgbalpha_or_name = function My_get_Color_from_scalar_rgb_rgbalpha_or_name(input) {
            if (typeof input === 'number') {
                // Handle scalar input
                return gradcol(input);
            } else if (Array.isArray(input)) {
                // Handle array input, assuming it contains RGB or RGBA values
                let r = input[0], g = input[1], b = input[2], a = input[3] || 1; // Default alpha to 1 if not provided
                return new BABYLON.Color4(r, g, b, a);
            } else if (typeof input === 'string') {
                // Handle color names
                switch (input.toLowerCase()) {
                    case 'black':
                        return new BABYLON.Color4(0, 0, 0, 1);
                    case 'white':
                        return new BABYLON.Color4(1, 1, 1, 1);
                    case 'red':
                        return new BABYLON.Color4(1, 0, 0, 1);
                    case 'green':
                        return new BABYLON.Color4(0, 1, 0, 1);
                    case 'blue':
                        return new BABYLON.Color4(0, 0, 1, 1);
                    case 'purple':
                        return new BABYLON.Color4(0.5, 0, 0.5, 1);
                    case 'magenta':
                        return new BABYLON.Color4(1, 0, 1, 1);
                    case 'yellow':
                        return new BABYLON.Color4(1, 1, 0, 1);
                    case 'gray':
                    case 'grey':
                        return new BABYLON.Color4(0.5, 0.5, 0.5, 1);
                    case 'teal':
                        return new BABYLON.Color4(0, 0.5, 0.5, 1);
                    default:
                        console.warn("Color name not recognized. Returning black.");
                        return new BABYLON.Color4(0, 0, 0, 1);
                }
            } else {
                console.error("Invalid input. Expecting a number, an array of RGB/RGBA values, or a color name.");
                return new BABYLON.Color4(0, 0, 0, 1); // Default to black
            }
        }
        


        /*
         In this function, color3ToHex, we take a BABYLON.Color3 object as input. 
         We then convert each of the red, green, and blue components to a 0-255 range, then to a hexadecimal string. 
         Finally, we concatenate these hex strings into one hex color code.
         */
        function color3ToHex(color) {
            // Convert each color component to an integer between 0 and 255
            const r = Math.floor(color.r * 255);
            const g = Math.floor(color.g * 255);
            const b = Math.floor(color.b * 255);
        
            // Convert each component to a hexadecimal string and pad with zero if necessary
            const hexR = r.toString(16).padStart(2, '0');
            const hexG = g.toString(16).padStart(2, '0');
            const hexB = b.toString(16).padStart(2, '0');
        
            // Concatenate the hexadecimal strings
            return "#${hexR}${hexG}${hexB}"
        }