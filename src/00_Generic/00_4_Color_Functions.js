///  Color scales


function scalarToRainbowColor(input_value, min_scale, max_scale, reverse) {
    // Ensure the scalar is clamped between 0 and 1


    scalar = reverse ? (input_value - min_scale) /(max_scale - min_scale ) : ((1- input_value) - min_scale) /(max_scale - min_scale )

    if (scalar > 2) {
        return new BABYLON.Color3(1, 1, 1); // White
    }


    if (scalar > 1) {
        return new BABYLON.Color3(0.7, 0, 0.7); // Deep magenta
    }



    //scalar = Math.max(0, Math.min(1, scalar));

    // Map the scalar value to the hue range for a rainbow
    // Red starts at 0°, transitioning to violet up to 270°, but we extend to 360° for a full cycle.
    // We start at 240° (blue) and end at 0° (red), moving in reverse
    let hue = 240 - scalar * 240; // This maps 0->240 (blue) to 1->0 (red)

    // Convert hue to RGB using Babylon.js utility functions
    return HSVtoRGB(hue, 1, 1);
}

function HSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;

    // Assuming hue is in degrees (0 to 360), saturation and value are in [0, 1]
    h = h / 360;

    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);

    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }

    // Convert r, g, b from [0,1] range to Babylon.js Color3
    return new BABYLON.Color3(r, g, b);
}





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