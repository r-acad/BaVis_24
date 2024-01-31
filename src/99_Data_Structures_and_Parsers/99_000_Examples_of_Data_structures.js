// Sample_Data_Structures

jsn = `{
  name: Coordsys_validation_complex_case
  group: basic_group
  model_data: {

    PARAMETERs: [   // scalar values which can be referred to other scalar values using the syntax e.g. < 3* another_scalar + yet_another_scalar>

    { ID: nose_x, DEF: 2.54}
    { ID: ac_length, DEF: 20}
    { ID: fus_dia, DEF:  < ac_length/5 > }
    { ID: marker_radius, DEF: < ac_length / 60 >}
    { ID: VTP_hinge_sweep_angle, DEF:   30 }
                  
    ]  // end of parameters

    NODEs: [    // 3D points defined by 3 scalar coordinates, any of which can be an expression < scalar expression depending on the parameters >   e.g.  DEF: [ <dia* 2>, 13, 0.56 ] 
                #The 4th "coordinate", if it exists, refers to the reference coordinate system where the point is defined


    {ID: origin, DEF: [ 0 , 0, 0   ] }

    {ID: AC_NOSE, DEF: [ nose_x , 0, 0   ] }

    {ID: AC_CG, DEF: [ < ac_length/2 > , 0, 0 , AC_NOSE ] }

    {ID: AC_end_of_fuselage, DEF: [ ac_length  , 0, 0 , AC_NOSE ] }
    
    {ID: VTP_hinge_tip, DEF: [ <ac_length / 4>  , VTP_hinge_sweep_angle, 0 , VTP ] }

    {ID: VTP_TE_TIP, DEF: [ 1 , 0, 0  , VTP_HINGE ] }
    {ID: VTP_TE_ROOT, DEF: [ 3 , 0, 0 , VTP_HINGE  ] }

    {ID: test_cordr_point, DEF: [ 1 , 0, 0 , test_cord  ] }


  
  ]  // end of nodes

    COORDs: [

      {ID: AC_NOSE,  TYPE: CORD1R, DEF: [ AC_NOSE , <AC_NOSE -1 * up_vector> , <AC_NOSE + AC_x_vector> ] }       // CORD1R
      {ID: VTP,  TYPE: CORD1C, DEF: [ AC_end_of_fuselage , <AC_end_of_fuselage + 1 * AC_y_vector> , <AC_end_of_fuselage + up_vector> ] }      
      {ID: VTP_HINGE,  TYPE: CORD1C, DEF: [ AC_end_of_fuselage , VTP_hinge_tip , <AC_end_of_fuselage + AC_y_vector> ] }     


      {ID: test_cord,  TYPE: CORDS, DEF: [ origin , AC_x_vector, AC_y_vector, up_vector] }       // CORDR


      
    ]  // end of coords

    VECTORs: [  // 3D vectors where any coordinate can be defined as numbers or as parameter values (but no scalar expressions are allowed for the coordinates)
                // The "DEF:" can also contain a vector expression for example;    DEF: < up1 + up4 >   or   DEF: <[ dia, 1, 0, 0 ] + 3*cross(nose, v2)>   where up1... nose can be vectors or nodes (treated as vectors)
                // To be implemented, 4th parameter of the definition to be reference coordinate system

      { ID: up_vector,  DEF: [ 0, 0, 1 ]  }
      { ID: AC_x_vector,  DEF: [ 1, 0, 0 ]  }
      { ID: AC_y_vector,  DEF: [ 0, 1, 0 ]  }

      
    ]  // end of vectors

    BALLs: [        

      { ID: AC_CG, NODE_IDs: [ AC_CG    ], R: marker_radius, render_params: {color: yellow ,  alpha : 1}  }
      { ID: AC_TAIL, NODE_IDs: [ <AC_NOSE + ac_length * AC_x_vector >   ], R: marker_radius, render_params: {color: red ,  alpha : 1}  }
      
      
      { ID: VTP_hinge_tip_node, NODE_IDs: [ VTP_hinge_tip ], R: marker_radius, render_params: {color: magenta ,  alpha : 1}  }

    ]  // end of balls

    SEGMENTs: [

    { ID: fuselage,  DEF: [{START: AC_NOSE, END: AC_end_of_fuselage }], render_params: {arrow_color: purple, thickness : 1, arrow_at_start_point : true, arrow_at_end : true, label_at_start_point: "START_purple", label_at_midpoint: "MIDDLE_Purple", label_at_end_point: "L" }      }

    { ID: VTP_hinge,  DEF: [{START: AC_end_of_fuselage, END: VTP_hinge_tip }] 
                          , render_params: {arrow_color: yellow, thickness : .3, arrow_at_start_point : true, arrow_at_end : true,  label_at_midpoint: "VTP"}      }

    
    ] // end of segments



    SHELLs: [
      { ID: 1, NODE_IDs: [AC_end_of_fuselage, VTP_hinge_tip, VTP_TE_TIP, VTP_TE_ROOT], color: 0.1 }

    ]


  }
}`








jsn_3 = `{
  name: Coordsys_validation_complex_case
  group: basic_group
  model_data: {

    PARAMETERs: [   // scalar values which can be referred to other scalar values using the syntax e.g. < 3* another_scalar + yet_another_scalar>
     
    { ID: PD_2, DEF: <PA_1 -PB_1/(3-(PC_2**2))>}     // 3.6184100418410043

    { ID: PA_1, DEF: 3.2}
      { ID: PA_2, DEF:.8}
      { ID: PA_3, DEF:-.8}

      { ID: PB_1, DEF:<  -.8/PA_1>}  // -0.25
      { ID: PB_2, DEF:<  PA_1**2 >}  // 10.240000000000002
      { ID: PB_3, DEF:<  2**PA_1 >}  // 9.18958683997628

      { ID: PC_1, DEF: <PB_1 - 5>  }  // -5.25
      { ID: PC_2, DEF: <3* PB_1 - PA_2 >}  // -1.55

      { ID: PD_1, DEF: <PC_1 -3*PB_1/-.3>}   // -7.75
                  
    ]  // end of parameters

    NODEs: [    // 3D points defined by 3 scalar coordinates, any of which can be an expression < scalar expression depending on the parameters >   e.g.  DEF: [ <dia* 2>, 13, 0.56 ] 
                #The 4th "coordinate", if it exists, refers to the reference coordinate system where the point is defined

    {ID: A1, DEF: [0, 0, 0, *BASIC* ]}
    {ID: A2, DEF: [0, 0, 1, *BASIC* ]}
    {ID: A3, DEF: [1, 0, 1, *BASIC* ]}  

    {ID: R1, DEF: [-10, 20, -30, rect0] }
    {ID: R2, DEF: [40, -30, 111, rect0] }
    {ID: R3, DEF: [-1, 10, -41, rect0] }                 

    {ID: P_1, DEF: [ 1, 1, 1 , rect3 ] }
    
    {ID: P_2, DEF: [ 1, 1, 1 , rect0 ] }

    {ID: P_CYL, DEF: [ 1, 135, 1 , cyl ] }

    {ID: P_SPHE, DEF: [ 1, 45, 45 , sphe ] }

    {ID: B1, DEF: [ 111, 112, 113 ] }
    {ID: B2, DEF: [ 121, 122, 123 ] }
    {ID: B3, DEF: [ 131, 132, 133 ] }

    {ID: C1, DEF: [ 211, 212, 213 ] }
    {ID: C2, DEF: [ 221, 222, 223 ] }
    {ID: C3, DEF: [ 231, 232, 233 ] }

    {ID: S1, DEF: [ 211, 312, 313 ] }
    {ID: S2, DEF: [ 321, -322, 323 ] }
    {ID: S3, DEF: [ 31, 32, -333 ] }

    {ID: R1_2, DEF: [11, 21, -454, rect1] }
    {ID: R2_2, DEF: [121, -131, 12, rect1] }
    {ID: R3_2, DEF: [21, 31, 412, rect1] } 

    {ID: R1_3, DEF: [13, 32, 3, rect2] }
    {ID: R2_3, DEF: [31, 13, 14, rect2] }
    {ID: R3_3, DEF: [4, 30, 41, rect2] } 
  
  ]  // end of nodes

    COORDs: [

      {ID: rect3,  TYPE: CORD1R, DEF: [ R1_3 , R2_3 , R3_3 ] },       // CORD1R

      {ID: rect1,   TYPE: CORD1R, DEF: [ R1   , R2   , R3   ] },       // CORD1R
      {ID: rect0,   TYPE: CORD1R, DEF: [ S1   , S2   , S3   ] }       // CORD1R
      {ID: rect2,  TYPE: CORD1R, DEF: [ R1_2 , R2_2 , R3_2 ] },       // CORD1R

      {ID: sphe,   TYPE: CORD1S, DEF: [ A1   , A2   , A3   ] },       // Spherical
      {ID: cyl,   TYPE: CORD1C, DEF: [ A1 , A2 , A3 ] }        // Cylindrical
      
    ]  // end of coords


    VECTORs: [  // 3D vectors where any coordinate can be defined as numbers or as parameter values (but no scalar expressions are allowed for the coordinates)
                // The "DEF:" can also contain a vector expression for example;    DEF: < up1 + up4 >   or   DEF: <[ dia, 1, 0, 0 ] + 3*cross(nose, v2)>   where up1... nose can be vectors or nodes (treated as vectors)
                // To be implemented, 4th parameter of the definition to be reference coordinate system

      { ID: up2,  DEF: [ 15, -1, 11 ]  }

    ]  // end of vectors
  }
}`




jsn_2 = `{
  name: Coordsys_validation_not_so_trivial_case,
  group: basic_group,
  model_data: {

    PARAMETERs: [   // scalar values which can be referred to other scalar values using the syntax e.g. < 3* another_scalar + yet_another_scalar>
      { ID: dia, VALUE: 3.2},
      { ID: transparency, VALUE:.8},
      { ID: K1, VALUE:-.8},
      { ID: K2, VALUE:<  -.8/dia>},
      { ID: Length, VALUE: 9},
      { ID: alpha, VALUE: <3* dia - A2 >},  // -173.6
      { ID: A1, VALUE: <dia -3*Length/-.3>}, // 93.2
      { ID: A2, VALUE: <A1 -3*Length/-.3>},  // 183.2
      { ID: p1, VALUE: <alpha - 5>   }
      
    ],

    NODEs: [    // 3D points defined by 3 scalar coordinates, any of which can be an expression < scalar expression depending on the parameters >   e.g.  DEF: [ <dia* 2>, 13, 0.56 ] 
                #The 4th "coordinate", if it exists, refers to the reference coordinate system where the point is defined
        
    {ID: P_1, DEF: [ 1, 1, 1 , rect3 ] },
    
    {ID: P_2, DEF: [ 1, 1, 1 , rect ] },


    {ID: B1, DEF: [ 111, 112, 113 ] },
    {ID: B2, DEF: [ 121, 122, 123 ] },
    {ID: B3, DEF: [ 131, 132, 133 ] },

    {ID: C1, DEF: [ 211, 212, 213 ] },
    {ID: C2, DEF: [ 221, 222, 223 ] },
    {ID: C3, DEF: [ 231, 232, 233 ] },

    {ID: S1, DEF: [ 311, 312, 313 ] },
    {ID: S2, DEF: [ 321, 322, 323 ] },
    {ID: S3, DEF: [ 331, 332, 333 ] },

    {ID: R1, DEF: [-10, 20, -30] },
    {ID: R2, DEF: [40, -30, 111] },
    {ID: R3, DEF: [-1, 10, -41] }, 

    {ID: R1_2, DEF: [11, 21, -454, rect] },
    {ID: R2_2, DEF: [121, -131, 12, rect] },
    {ID: R3_2, DEF: [21, 31, 412, rect] }, 

    {ID: R1_3, DEF: [13, 32, 3, rect2] },
    {ID: R2_3, DEF: [31, 13, 14, rect2] },
    {ID: R3_3, DEF: [4, 30, 41, rect2] } 

  ],

    COORDs: [

      {ID: rect3,  TYPE: CORD1R, DEF: [ R1_3 , R2_3 , R3_3 ] },       // CORD1R
      {ID: sphe,   TYPE: CORD1S, DEF: [ S1   , S2   , S3   ] },       // Spherical
      {ID: rect,   TYPE: CORD1R, DEF: [ R1   , R2   , R3   ] },       // CORD1R
      {ID: rect2,  TYPE: CORD1R, DEF: [ R1_2 , R2_2 , R3_2 ] },       // CORD1R

      {ID: cyl,   TYPE: CORD1C, DEF: [ C1 , C2 , C3 ] }        // Cylindrical
      
    ],


    VECTORs: [  // 3D vectors where any coordinate can be defined as numbers or as parameter values (but no scalar expressions are allowed for the coordinates)
                // The "DEF:" can also contain a vector expression for example;    DEF: < up1 + up4 >   or   DEF: <[ dia, 1, 0, 0 ] + 3*cross(nose, v2)>   where up1... nose can be vectors or nodes (treated as vectors)
                // To be implemented, 4th parameter of the definition to be reference coordinate system

      { ID: up2,  DEF: [ 15, -1, 11 ]  }

    ]

  }
}`


jsn_trivial = `{
  name: Coordsys_validation_trivial_case,
  group: basic_group,
  model_data: {

    PARAMETERs: [   // scalar values which can be referred to other scalar values using the syntax e.g. < 3* another_scalar + yet_another_scalar>
      { ID: dia, VALUE: 3.2},
      { ID: transparency, VALUE:.8},
      { ID: K1, VALUE:-.8},
      { ID: K2, VALUE:<  -.8/dia>},
      { ID: Length, VALUE: 9},
      { ID: alpha, VALUE: <3* dia - A2 >},  // -173.6
      { ID: A1, VALUE: <dia -3*Length/-.3>}, // 93.2
      { ID: A2, VALUE: <A1 -3*Length/-.3>},  // 183.2
      { ID: p1, VALUE: <alpha - 5>   }
      
    ],

    NODEs: [    // 3D points defined by 3 scalar coordinates, any of which can be an expression < scalar expression depending on the parameters >   e.g.  DEF: [ <dia* 2>, 13, 0.56 ] 
                #The 4th "coordinate", if it exists, refers to the reference coordinate system where the point is defined
        
    {ID: P_1, DEF: [ 1, 1, 1 , rect3 ] },
    {ID: B1, DEF: [ 111, 112, 113 ] },
    {ID: B2, DEF: [ 121, 122, 123 ] },
    {ID: B3, DEF: [ 131, 132, 133 ] },

    {ID: C1, DEF: [ 211, 212, 213 ] },
    {ID: C2, DEF: [ 221, 222, 223 ] },
    {ID: C3, DEF: [ 231, 232, 233 ] },

    {ID: S1, DEF: [ 311, 312, 313 ] },
    {ID: S2, DEF: [ 321, 322, 323 ] },
    {ID: S3, DEF: [ 331, 332, 333 ] },

    {ID: R1, DEF: [0, 0, 0] },
    {ID: R2, DEF: [0, 0, 1] },
    {ID: R3, DEF: [1, 0, 1] }, 

    {ID: R1_2, DEF: [1, 1, 1, rect] },
    {ID: R2_2, DEF: [1, 1, 2, rect] },
    {ID: R3_2, DEF: [2, 1, 2, rect] }, 

    {ID: R1_3, DEF: [3, 3, 3, rect2] },
    {ID: R2_3, DEF: [3, 3, 4, rect2] },
    {ID: R3_3, DEF: [4, 3, 4, rect2] } 

  ],

    COORDs: [

      {ID: rect3,  TYPE: CORD1R, DEF: [ R1_3 , R2_3 , R3_3 ] },       // CORD1R
      {ID: sphe,   TYPE: CORD1S, DEF: [ S1   , S2   , S3   ] },       // Spherical
      {ID: rect,   TYPE: CORD1R, DEF: [ R1   , R2   , R3   ] },       // CORD1R
      {ID: rect2,  TYPE: CORD1R, DEF: [ R1_2 , R2_2 , R3_2 ] },       // CORD1R

      {ID: cyl,   TYPE: CORD1C, DEF: [ C1 , C2 , C3 ] }        // Cylindrical
      
    ],


    VECTORs: [  // 3D vectors where any coordinate can be defined as numbers or as parameter values (but no scalar expressions are allowed for the coordinates)
                // The "DEF:" can also contain a vector expression for example;    DEF: < up1 + up4 >   or   DEF: <[ dia, 1, 0, 0 ] + 3*cross(nose, v2)>   where up1... nose can be vectors or nodes (treated as vectors)
                // To be implemented, 4th parameter of the definition to be reference coordinate system

      { ID: up2,  DEF: [ 15, -1, 11 ]  }

    ]
  }
}`



// This is a "badly" formed (but easier to read and write) JSON file where strings, which should be quoted, are not. Unlike JSON it accepts comments using // or # at any position in the line (including after data)
// There can be empty lines and the content of one line can be spread in multiple consecutive lines if required
jsn1 = `{
  name: exampleName,
  group: exampleGroup,
  model_data: {

    PARAMETERs: [   // scalar values which can be referred to other scalar values using the syntax e.g. < 3* another_scalar + yet_another_scalar>
      { ID: dia, VALUE: 3.2},
      { ID: transparency, VALUE:.8},
      { ID: K1, VALUE:-.8},
      { ID: K2, VALUE:<  -.8/dia>},
      { ID: Length, VALUE: 9},
      { ID: alpha, VALUE: <3* dia - A2 >},  // -173.6
      { ID: A1, VALUE: <dia -3*Length/-.3>}, // 93.2
      { ID: A2, VALUE: <A1 -3*Length/-.3>},  // 183.2
      { ID: p1, VALUE: <alpha - 5>   }
      
    ],

    NODEs: [    // 3D points defined by 3 scalar coordinates, any of which can be an expression < scalar expression depending on the parameters >   e.g.  DEF: [ <dia* 2>, 13, 0.56 ] 
                #The 4th "coordinate", if it exists, refers to the reference coordinate system where the point is defined
        
    {ID: 1, DEF: [ K1, A1, p1 ] },
      { ID: 2, DEF: [ 1.12, 3, 5.6 ] },
      { ID: 30, DEF: [ 0.12, 34, 6, rect ] },
      {ID: 8, DEF: [ 12, 4, 7 , rect] },
      { ID: 5, DEF: [ 11, 11, 10.56 ] },
      { ID: 60, DEF: [ -141, 5, 12.56 ] },
      { ID: 7, DEF: [ 114, .9, 26 ] },
      {ID: 4, DEF: [ 5, 2, 3 ] },
      { ID: 9, DEF: [ 2, 11, 1 ] },
      { ID: 10, DEF: [ 8, 0, 0.56 , cyl ] },
      { ID: center, DEF: [ <dia* 2>, 13, 0.56 ] },
      { ID: nose, DEF: [ 10, -12, 10 ] }
    ],

    COORDs: [
      {ID: spher, TYPE: CORD1S, DEF: [ [10,3,0, cyl] , 2 , aup1] },    // Spherical
      {ID: BASIC, TYPE: CORD1R, DEF: [[0,0,0],[0,1,1],[1,0,1]]},    // CORD1R  BASIC
      {ID: rect, TYPE: CORD1R, DEF: [center ,nose,1] },             // CORD1R
      {ID: cyl, TYPE: CORD1C, DEF: [ [0,4,0] , 2  ,nose]  }        // Cylindrical

    ],

    VECTORs: [  // 3D vectors where any coordinate can be defined as numbers or as parameter values (but no scalar expressions are allowed for the coordinates)
                // The "DEF:" can also contain a vector expression for example;    DEF: < up1 + up4 >   or   DEF: <[ dia, 1, 0, 0 ] + 3*cross(nose, v2)>   where up1... nose can be vectors or nodes (treated as vectors)
                // To be implemented, 4th parameter of the definition to be reference coordinate system

                { ID: up2,  DEF: [ 15, -1, 11 ]  },
                { ID: cup1,  DEF: [ .5, 1, -11 , rect]  },

      { ID: aup1,  DEF: [ .5, 1, -11 , rect]  },


      { ID: up6,  DEF: < 3*aup1/4 -.3* up4/-.5 + down>  },  // [-106.785, 1.35, -6.33]
      { ID: v1,  DEF: [ 1, 0, 0 , cyl]  },
      { ID: v2,  DEF: [ 0, 1, 0 ]  },
      { ID: up7,  DEF: <[ dia, 1, 0, 0 ] + 3*cross(nose, v2)>  },

      { ID: up4,  DEF: [ p1, 1, dia ]  },
      { ID: down,  DEF: [ p1, 1, dia ]  },
      { ID: up5,  DEF: < cup1 + up4 >  },

      { ID: v37,  DEF: <cup1> }
    ],

    BALLs: [        
      { ID: 112, NODE_IDs: [<center + dia*up5/4>], R: 3, render_params: {color: yellow ,  alpha : 1}  },
      { ID: A12, NODE_IDs: [<up7>, <up7*-1>], R: 3, render_params: {color: red ,  alpha : 1}  }
 
      #{ ID: 112, NODE_IDs: [<center - dia*up5/2>], R: 2, render_params: {color: blue ,  alpha : 1}  },
      #{ ID: 12, NODE_IDs: [<dia*[1,2,K1]>], R: 2, render_params: {color: blue ,  alpha : 1}  },
      #{ID: 22, NODE_IDs: [ <center-.3*down>, <nose-.23*up2> ], R: 5 , 
      #  render_params: {color: green,  alpha : .6} },
      #{ID: 122, NODE_IDs: [ <center +  down>,  <nose- down>], R: 1,  render_params: {color: purple,  alpha : transparency}  },
      #{ ID: 1, NODE_IDs: [10, 2, 30, 4], R: dia, 
      #  render_params: {color: [0.3, 0.4, 0.6, 0.1],  alpha : 0.5}    }, 
      #{ID: 2, NODE_IDs: [10, center, 7], R: 2, render_params: {color: red,  alpha : 0.8} },
      #{ID: 2, NODE_IDs: [10, 2, 30, [18, 13, 13]], R: 2, render_params: {color: [0.7, 0.3, 0.1],  alpha : 0.7} }
    ],

    SEGMENTs: [
      { ID: suida,  DEF: [{START:  [ 2, 1, <dia -3*Length/-.3> ], END:  [ 18, 3, -6 ]}], render_params: {arrow_color: "purple", thickness : 1, arrow_at_start_point : true, arrow_at_end : true, label_at_start_point: "START_purple", label_at_midpoint: "MIDDLE_Purple", label_at_end_point: "L" }      },

     { ID: up,  DEF: [{START:  [ 2, dia, 1 ], END:  nose}  , {START:  [ 21, 1, -21 ], END:  [ -8, 1, 56 ]}      ] , render_params: {arrow_color: "red", arrow_length: 3, arrow_angle: 45, thickness : 0.6, arrow_at_start_point : false, arrow_at_end : false, label_at_start_point: "START_POINT", label_at_midpoint: "MIDDLE_POINT", label_at_end_point: "expressions", alpha: .5 }     },
      { ID: "up1", DEF: [{START: <3*center>, END: <nose/7> }], render_params: {arrow_color: "blue", arrow_length: 3, arrow_angle: 45, thickness : 0.5, arrow_at_start_point : false, arrow_at_end : false, label_at_start_point: "START_POINT", label_at_midpoint: "MIDDLE_POINT", label_at_end_point: "sss", alpha: .5 }},
      { ID: tuda,  DEF: [{START:  <up2 + 4*normalize(cross([ 38, 1, 5.6 ], up2))>, END:  [ 38, 1, 5.6 ]}], render_params: {arrow_color: "green", arrow_length: 3, arrow_angle: 15, thickness : 0, arrow_at_start_point : false, arrow_at_end : false, label_at_start_point: "START_POINT", label_at_midpoint: "MIDDLE_POINT", label_at_end_point: "sss", alpha: .5 }      },
      
      { ID: up2,  DEF: [{START:  [ 5, 1, -11 ], END:  [ 18, 1, -20.56 ]}], render_params: {arrow_color: "pink"}      },
      { ID: up3,  DEF: [{START:  [ 3, 4, 21 ], END:  [ -8, 3, 0.56 ]}]      },
      { ID: up4,  DEF: [{START:  [ 12, 1, -5 ], END: [ 1, -3, 11.56 ]}] , render_params: {arrow_color: "yellow", thickness: .3}    },
      { ID: "down", DEF: [{START: [8, 7, 9], END: [15, 13, 12.1]}] }
    ],

    SHELLs: [
      { ID: 1, NODE_IDs: [1, 2, 30, 4], color: 0.1 },
      { ID: 2, NODE_IDs: [5, 60, 7, 8], color: 0.9 },
      { ID: 3, NODE_IDs: [2, 4, 60, 8], color: 0.5 },
      { ID: 4, NODE_IDs: [30, 5, 7, 9], color: 0.8 },
      { ID: 5, NODE_IDs: [1, 4, 7, 10], color: 1 }
    ]
  }
}`

