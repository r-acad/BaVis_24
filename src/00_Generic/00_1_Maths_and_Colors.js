const myMath_1_index = {  // These functions assume that the vector coordinates are in elements 1 to 3 of the array (the 0'th value is not used). This is only used for NASTRAN data

    vec_scale: function (vec, scale) {
        return [scale, vec[1]*scale, vec[2]*scale, vec[3]*scale   ]
    },

    vec_normalize: function (vec) {
        const norm = (vec[1]**2 + vec[2]**2 + vec[3]**2)**.5
        return  [0, vec[1]/norm, vec[2]/norm , vec[3]/norm]
    },

    makevector_from_points: function ( pini, pfinal ) {  // points as arrays, starting at index 1
        return [0, (pfinal[1]-pini[1]), (pfinal[2]-pini[2]),  (pfinal[3]-pini[3])]
    },

    vector_product: function (A, B) {
        return [0,
            (A[2]*B[3] - A[3]*B[2]),
            (A[3]*B[1] - A[1]*B[3]),
            (A[1]*B[2] - A[2]*B[1])
        ]
    }, 

    add_vectors: function ( A, B ) {
        return [0,
            A[1] + B[1],
            A[2] + B[2],
            A[3] + B[3]
        ]
    },

    CORDR_transform: function (A, U, V, W, P) {  // A: origin, U, V, W: CORDR unit vectors, P: point to be transformed  /// OJO!!! revisar si funciona cuando los vectores U, V, y W no son ortonormales, ver quien llama a esto
        let R = [0,
                    P[1] * U[1] +  P[2] * V[1] +  P[3] * W[1] , 
                    P[1] * U[2] +  P[2] * V[2] +  P[3] * W[2] , 
                    P[1] * U[3] +  P[2] * V[3] +  P[3] * W[3]  
                ]
        return this.add_vectors(A, R)  // translated point 
    }
}

    // Cross product function
    function vector_cross_product_0_index(a, b) {
        return [
            a[1] * b[2] - a[2] * b[1],
            a[2] * b[0] - a[0] * b[2],
            a[0] * b[1] - a[1] * b[0]
        ]
    }


    const myMath_0_index = {  // These functions assume that the vector coordinates are 0-indexed, as usual in Javascript. This is used generically

        vec_scale: function (vec, scale) {
            return [vec[0]*scale, vec[1]*scale, vec[2]*scale   ]
        },
    
        vec_normalize: function (vec) {
            const norm = (vec[0]**2 + vec[1]**2 + vec[2]**2)**.5
            return  [vec[0]/norm, vec[1]/norm , vec[2]/norm]
        },
    
        makevector_from_points: function ( pini, pfinal ) {  // points as arrays, starting at index 1
            return [(pfinal[0]-pini[0]), (pfinal[1]-pini[1]),  (pfinal[2]-pini[2])]
        },
    
        vector_product: function (A, B) {
            return [
                (A[1]*B[2] - A[2]*B[1]),
                (A[2]*B[0] - A[0]*B[2]),
                (A[0]*B[1] - A[1]*B[0])
            ]
        }, 
    
        add_vectors: function ( A, B ) {
            return [
                A[0] + B[0],
                A[1] + B[1],
                A[2] + B[2]
            ]
        },
    
        subtract_2nd_vector_from_1st: function ( A, B ) {
            return [
                A[0] - B[0],
                A[1] - B[1],
                A[2] - B[2]
            ]
        },


        CORDR_transform: function (A, U, V, W, P) {  // A: origin, U, V, W: CORDR direction vectors (not necessarily unit vectors, therefore scaling is possible), P: point to be transformed
            let R = [
                        P[0] * U[0] +  P[1] * V[0] +  P[2] * W[0] , 
                        P[0] * U[1] +  P[1] * V[1] +  P[2] * W[1] , 
                        P[0] * U[2] +  P[1] * V[2] +  P[2] * W[2]  
                    ]
            return this.add_vectors(A, R)  // translated point 
        },



        CORD1R_transform: function (G1, G2, G3, P) {  // See Nastran CORD1R documentation for names and interpretation  ** RECTANGULAR **
            
                U_z = this.vec_normalize(this.makevector_from_points(G1, G2))
                U_xz = this.vec_normalize(this.makevector_from_points(G1, G3))
                U_y = this.vec_normalize(vector_cross_product_0_index(U_z, U_xz))
                U_x = this.vec_normalize(vector_cross_product_0_index(U_y, U_z))

        return this.CORDR_transform(G1, U_x, U_y, U_z, P) 
        },


        CORDC_transform: function (G1, U, V, W, P) {  // G1, origin, U, V, W, direction vectors (x, y, z) of coordinate system (will be normalized), P, point to be transformed, given by R, theta, Z. with same interpretation as CORD1C

            R = P[0]   // first parameter is radius in cylindrical coordinates
            theta = P[1]  // second parameter is angle in degrees in cylindrical coordinates
            z = P[2]  // third parameter is z in the cylindrical coordinate system
 
            x = R * Math.cos(theta * Math.PI/180)  // get the x value of the point in the cylindrical coordinate system
            y = R * Math.sin(theta * Math.PI/180)  // get the y value of the point in the cylindrical coordinate system

            P[0] = x  // assign x and y and proceed as if the definition was like in a rectangular coordinate system
            P[1] = y

        return this.CORDR_transform(G1, U, V, W, P) 
    },

        CORD1C_transform: function (G1, G2, G3, P) {  // See Nastran CORD1C documentation for names and interpretation  ** CYLINDRICAL **

            R = P[0]   // first parameter is radius in cylindrical coordinates
            theta = P[1]  // second parameter is angle in degrees in cylindrical coordinates
            z = P[2]  // third parameter is z in the cylindrical coordinate system
 
            x = R * Math.cos(theta * Math.PI/180)  // get the x value of the point in the cylindrical coordinate system
            y = R * Math.sin(theta * Math.PI/180)  // get the y value of the point in the cylindrical coordinate system

            P[0] = x  // assign x and y and proceed as if the definition was like in a rectangular coordinate system
            P[1] = y

            
            U_z = this.vec_normalize(this.makevector_from_points(G1, G2))
            U_xz = this.vec_normalize(this.makevector_from_points(G1, G3))
            U_y = this.vec_normalize(vector_cross_product_0_index(U_z, U_xz))
            U_x = this.vec_normalize(vector_cross_product_0_index(U_y, U_z))

        return this.CORDR_transform(G1, U_x, U_y, U_z, P) 
    },


    CORDS_transform: function (G1, U, V, W, P) {  // G1, origin, U, V, W, direction vectors (x, y, z) of coordinate system (will be normalized), P, point to be transformed, given by R, phi, theta with same interpretation as CORD1C

        R = P[0]   // first parameter is radius in spherical coordinates
        phi = P[1]  // second parameter is angle from z axis in degrees in spherical coordinates
        theta = P[2]  // third parameter is angle from x axis of the projection on the x-y plane in spherical coordinates 

        x = R * Math.sin(theta * Math.PI/180)* Math.cos(phi * Math.PI/180)  // get the x value of the point in the spherical coordinate system
        y = R * Math.sin(theta * Math.PI/180)* Math.sin(phi * Math.PI/180)  // get the y value of the point in the spherical coordinate system
        z = R * Math.cos(theta * Math.PI/180)  // get the y value of the point in the spherical coordinate system

        P[0] = x  // assign x, y and z and proceed as if the definition was like in a rectangular coordinate system
        P[1] = y
        P[2] = z

    return this.CORDR_transform(G1, U, V, W, P) 
},


    CORD1S_transform: function (G1, G2, G3, P) {  // See Nastran CORD1S documentation for names and interpretation  ** SPHERICAL **

        R = P[0]   // first parameter is radius in spherical coordinates
        phi = P[1]  // second parameter is angle from z axis in degrees in spherical coordinates
        theta = P[2]  // third parameter is angle from x axis of the projection on the x-y plane in spherical coordinates 

        x = R * Math.sin(theta * Math.PI/180)* Math.cos(phi * Math.PI/180)  // get the x value of the point in the spherical coordinate system
        y = R * Math.sin(theta * Math.PI/180)* Math.sin(phi * Math.PI/180)  // get the y value of the point in the spherical coordinate system
        z = R * Math.cos(theta * Math.PI/180)  // get the y value of the point in the spherical coordinate system

        P[0] = x  // assign x, y and z and proceed as if the definition was like in a rectangular coordinate system
        P[1] = y
        P[2] = z      
        
        U_z = this.vec_normalize(this.makevector_from_points(G1, G2))
        U_xz = this.vec_normalize(this.makevector_from_points(G1, G3))
        U_y = this.vec_normalize(vector_cross_product_0_index(U_z, U_xz))
        U_x = this.vec_normalize(vector_cross_product_0_index(U_y, U_z))  

    return this.CORDR_transform(G1, U_x, U_y, U_z, P) 
}



    }


function grad_col_rgb_normalised( level , min = 0, max = 1, reverse = false, palette = "red_blue") {  // assign a color to a value for rendering with scale
    let i = (level-min)/(max-min)
    if (reverse) {i = (1-i)}

    let redl, greenl, bluel, col_scale
    if (i > 1 ) { i = 1}
    if (i < 0 ) { i = 0}

    if (palette.toLowerCase() === "red_blue") {
        col_scale = [
            {v: 0 ,  r: 1, g: 0, b: 0},      // pure red
            {v: 0.2 ,  r: 1, g: .9, b: 0},
            {v: 0.25 ,  r: 1, g: 1, b: 0},   // pure yellow
            {v: 0.35 ,  r: .9, g: 1, b: 0},
            {v: 0.5 ,  r: 0, g: .9, b: 0},    // pure green
            {v: 0.75 ,  r: 0, g: 1, b: 1},   // pure cyan
            {v: 1 ,  r: 0, g: 0, b: .8}       // pure blue
        ]
    } else if (palette.toLowerCase() === "polar") {
        col_scale = [
            {v: 0 ,  r: 1, g: 0, b: 1},      // magenta
            {v: 0.2 ,  r: 1, g: 0, b: 0},      // pure red
            {v: 0.4 ,  r: 0, g: .9, b: 0},    // pure green
            {v: 0.6 ,  r: 0, g: 1, b: 1},   // pure cyan
            {v: 0.8 ,  r: 0, g: 0, b: .8},       // pure blue
            {v: 1 ,  r: 1, g: 1, b: 1}       // white
        ]
    }
    for (let n = 0 ; n < col_scale.length-1 ; n++) 
            {
                if ((col_scale[n].v  <= i)  &&  (col_scale[n+1].v >= i))     { 
                const delta = (i - col_scale[n].v  ) / (  col_scale[n + 1].v - col_scale[n].v  )
                redl = (col_scale[n+1].r - col_scale[n].r) * delta + col_scale[n].r
                greenl = (col_scale[n+1].g - col_scale[n].g) * delta + col_scale[n].g
                bluel = (col_scale[n+1].b - col_scale[n].b) * delta + col_scale[n].b
                }    
            }
    // output normalised to 1
    this.r = redl ;     this.g = greenl ;     this.b = bluel
}

function rgbToHex(r, g, b) {
    function componentToHex(c) {
        var hex = c.toString(16)
        return hex.length == 1 ? "0" + hex : hex;
    }
    let maxval = Math.max(r,g,b)
    r = Math.floor((r/maxval) * 255)
    g = Math.floor((g/maxval) * 255)
    b = Math.floor((b/maxval) * 255)
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
