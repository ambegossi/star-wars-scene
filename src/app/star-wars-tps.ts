import * as glm from 'gl-matrix';
import { BasicApp } from './basic-app';
import { ShaderProgram } from './webgl/shader-program';
import { OrbitCamera } from './webgl/orbit-camera';
import { Model } from './webgl/model';

export class StarWarsTPS implements BasicApp {

    private gl: WebGL2RenderingContext;    
    private width: number;
    private height: number;
    private then: number;
    private deltaTime: number;

    private backgroundColor: [number, number, number, number] = [0, 0, 0, 1];

    private stopped: boolean = true;

    private cam = new OrbitCamera();    
    
    private camMoveSpeed = 40.0;
    private pitch = 0;
    private yaw = 0;
    private radius = 10;
    private radiusSpeed = 0.01;
    private angleSpeed = 10;
    private projection = glm.mat4.create(); // Initial matrix will be an identity matrix

    private elementsPositions: [number, number, number][] = [];
    private elementsBoxes: [number, number, number][] = [];

    // Mesh
    private wallVAO: WebGLVertexArrayObject;
    private wallVBO: WebGLBuffer;
    private wallTextCoordsVBO: WebGLBuffer;
    private wallIBO: WebGLBuffer;
    private wallVertices: Float32Array;
    private wallTextCoords: Float32Array;
    private wallIndices: Int32Array;
    private angleAmount = 5;

    // Texture
    private wallTexture: WebGLTexture;
    private wallImageURL = '../assets/textures/tower_b.png';

    private droidModel: Model;
    private droidModelURL = '../assets/models/droid88e9.obj';
    private droidDiffuseTextureURL = '../assets/textures/droid88e9_diffuse.png'; // try replacing with '../assets/textures/logo_ucs.png' or an image of your choice!

    private bb8_Model: Model;
    private bb8_ModelURL = '../assets/models/bb8.obj';
    private bb8_DiffuseTextureURL = '../assets/textures/bb8.jpg'; 

    private r2d2_Model: Model;
    private r2d2_ModelURL = '../assets/models/r2d2.obj';
    private r2d2_DiffuseTextureURL = '../assets/textures/r2d2.jpg'; 

    private droideka_Model: Model;
    private droideka_ModelURL = '../assets/models/droideka.obj';
    private droideka_DiffuseTextureURL = '../assets/textures/droideka.png';

    private defense_towerModel: Model;
    private defense_towerURL = '../assets/models/defense_tower.obj';
    private defense_towerDiffuseTextureURL = '../assets/textures/defense_tower.jpg';

    private defense_towerBModel: Model;
    private defense_towerBURL = '../assets/models/defense_towerB.obj';
    private defense_towerBDiffuseTextureURL = '../assets/textures/defense_towerB.jpg';

    private military_tent_Model: Model;
    private military_tent_URL = '../assets/models/military_tent.obj';
    private military_tent_DiffuseTextureURL = '../assets/textures/military_tent.jpeg';

    private towerA_Model: Model;
    private towerA_URL = '../assets/models/tower_a.obj';
    private towerA_DiffuseTextureURL = '../assets/textures/tower_a.png';

    private towerB_Model: Model;
    private towerB_URL = '../assets/models/tower_b.obj';
    private towerB_DiffuseTextureURL = '../assets/textures/tower_b.png';

    private stormtrooper_Model: Model;
    private stormtrooper_URL = '../assets/models/stormtrooper2.obj';
    private stormtrooper_DiffuseTextureURL = '../assets/textures/stormtrooper2.png';

    private threetroopers_Model: Model;
    private threetroopers_URL = '../assets/models/threetroopers.obj';
    private threetroopers_DiffuseTextureURL = '../assets/textures/threetroopers.jpg';

    private stormtrooper2_Model: Model;
    private stormtrooper2_URL = '../assets/models/stormtrooper2.obj';
    private stormtrooper2_DiffuseTextureURL = '../assets/textures/stormtrooper2.png';

    private droneship_Model: Model;
    private droneship_URL = '../assets/models/droneship.obj';
    private droneship_DiffuseTextureURL = '../assets/textures/droneship.jpg';

    private cargo_crate_Model: Model;
    private cargo_crate_URL = '../assets/models/cargo_crate.obj';
    private cargo_crate_DiffuseTextureURL = '../assets/textures/cargo_crate.png';

    private basic_crate_Model: Model;
    private basic_crate_URL = '../assets/models/basic_crate.obj';
    private basic_crate_DiffuseTextureURL = '../assets/textures/basic_crate.jpeg';

    private xwing_Model: Model;
    private xwing_URL = '../assets/models/xwing.obj';
    private xwing_DiffuseTextureURL = '../assets/textures/xwing.png';

    private floorModel: Model;
    private floorModelURL = '../assets/models/stone_floor.obj';
    private floorDiffuseTextureURL = '../assets/textures/stone_floor.png';

    // Light
    private lightPosition = glm.vec3.fromValues(4, 4, 4); // in front and above the box, a little to the right
    private lightIntensity = 5;
    private lightDiffuseColor = glm.vec3.fromValues(1, 1, 0.9); // slightly yellow-ish light
    private lightSpecularColor = glm.vec3.fromValues(1, 1, 1); // white specular    
    private lightAttenuationConstant = 1;
    private lightAttenuationLinear = 0.07;
    private lightAttenuationQuadratic = 0.017;

    // Ambient light
    private ambientColor = glm.vec3.fromValues(1, 1, 0.9); // also yellow-ish ambient color
    private ambientIntensity = 6; // weak, as it's supposed to be indirect light

    private shaderProgram: ShaderProgram;

    constructor(private canvas: HTMLCanvasElement) {}

    private async init() {        
        this.stopped = false;

        try {
            this.gl = this.canvas.getContext('webgl2');
        } catch (e) {
            throw new Error('Could not generate WebGL 2.0 context.');
        }   

        // Load shaders
        let vsText: string, fsText: string;
        try {
            const vs = await fetch('../assets/shaders/phong-blinn-texture.vert');
            vsText = await vs.text();

            const fs = await fetch('../assets/shaders/phong-blinn-texture.frag');
            fsText = await fs.text();

            this.shaderProgram = new ShaderProgram(this.gl);
            this.shaderProgram.loadShaders(vsText, fsText);
        } catch (e) {
            console.log(e);
        }

        try {            
            this.onCanvasResized();                                           
        } catch (e) {
            throw new Error('Could not generate WebGL 2.0 viewport.');
        }

        // Enable visibility tests
        this.gl.enable(this.gl.DEPTH_TEST); // enable depth test
        this.gl.enable(this.gl.CULL_FACE);  // enable backface culling    

        // Set initial camera position
        this.cam.setPosition(glm.vec3.fromValues(0, 10, 90));
        this.cam.rotate(this.pitch, this.yaw);

        // Clear canvas
        this.gl.clearColor(...this.backgroundColor);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);      
        
        // Flip image on the Y axis. Images have their origin in the upper-left corner, but
        // WebGL's textures have their origin in the lower-left corner.
        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, 1);


        document.addEventListener('mousemove', this.onMouseMove.bind(this));
        document.addEventListener('wheel', this.onMouseWheel.bind(this));
        document.addEventListener('keydown', this.onKeyDown.bind(this));

    }

        /**
     * Initialize wall buffers
     */
    private async initQuadBuffers() {
        this.wallVAO = this.gl.createVertexArray();
        this.gl.bindVertexArray(this.wallVAO);

        this.wallVertices = new Float32Array([
         //  x   y  z
            -33.3, 0, -50,  // bottom-left
             33.3, 0, -50,  // bottom-right
             33.3,  10, -50,  // top-right
            -33.3,  10, -50   // top-left
        ]);

        // Short exercise: try replacing the 1's below for another number (e.g., 4) to see what happens!
        // Note: texture coordinates go from top-left (0, 0) to bottom-right (1, 1)
        this.wallTextCoords = new Float32Array([
        //  u  v  
        -33.3, -50,   // bottom-left
        33.3, -50,   // bottom-right
        33.3, -50,   // top-right
        -33.3, -50    // top-left
        ]);

        this.wallIndices = new Int32Array([
            0, 2, 3,    // triangle 1: bl + tr + tl
            0, 1, 2     // triangle 2: bl + br + tr
        ]);

        // Vertex buffer
        this.wallVBO = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.wallVBO);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.wallVertices, this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(
            0,  // attribute location in the shader (location = 0)
            3,  // number of components per iteration (vertex position has 3 componente: x, y, z)
            this.gl.FLOAT, // data type
            false, // don't normalize the data
            0, // no stride from one iteration to the other, data is contiguous
            0); // no offset, start at the beginning of the buffer
        this.gl.enableVertexAttribArray(0);

        // Texture coordinate buffer
        this.wallTextCoordsVBO = this.gl.createBuffer(); // attribute location in the shader (location = 1)
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.wallTextCoordsVBO);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.wallTextCoords, this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(
            1,  // attribute location in the shader (location = 1)
            2,  // number of components per iteration (vertex texture coordinate has 2 components: u, v)
            this.gl.FLOAT, // data type
            false, // don't normalize the data
            0, // no stride from one iteration to the other, data is contiguous
            0); // no offset, start at the beginning of the buffer
        this.gl.enableVertexAttribArray(1);

        // Index buffer
        this.wallIBO = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.wallIBO);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.wallIndices, this.gl.STATIC_DRAW);
    }

        /**
     * Initialize our wall's texture
     */
    private initTexture() {        
        this.wallTexture = this.gl.createTexture(); // Create texture object
        this.gl.activeTexture(this.gl.TEXTURE0 + 0);    // Make texture unit 0 active
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.wallTexture);  // Make our texture the current 2D texture

        // Temporarily fill the texture with a color while we wait for the image to load
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 1, 1, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE,
            new Uint8Array([255, 0, 255, 255]));

        // Load the image
        const img = new Image();
        img.src = this.wallImageURL;
        img.addEventListener('load', () => {
            // Image has been loaded, let's copy it to the texture            
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.wallTexture);  // Make our texture the current 2D texture
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, img);  // Copy the image
            
            this.gl.generateMipmap(this.gl.TEXTURE_2D); // have webgl generate mip maps automatically

            // Set filtering to define mipmap quality and memory use
            // TEXTURE_MIN_FILTER: when size of drawing is smaller than largest mip
            //    Can be:
            //      NEAREST: choose 1 pixel from largest mip (lowest quality, but less memory)
            //      LINEAR: choose 4 pixel from largest mip and combine them (average)
            //      NEAREST_MIPMAP_NEAREST: choose best mip and pick one pixel
            //      LINEAR_MIPMAP_NEAREST: choose best mip and blend 4 pixels
            //      NEAREST_MIPMAP_LINEAR: choose best two mips, pick 1 pixel from each, and blend them
            //      LINEAR_MIPMAP_LINEAR: choose best two mips, choose 4 pixels from each, and blend them (highest quality, more expensive!)
            // TEXTURE_MAG_FILTER: when size of drawing is larger than largest mip (only NEAREST and LINEAR are valid)
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
            
            // Short exercise: uncomment to see what happens! This changes the repeating pattersn.
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        });
    }

    async initModels() {
        // Load our models and textures             
        this.droidModel = new Model(this.gl, this.droidModelURL, this.droidDiffuseTextureURL);
        this.bb8_Model = new Model(this.gl, this.bb8_ModelURL, this.bb8_DiffuseTextureURL);
        this.r2d2_Model = new Model(this.gl, this.r2d2_ModelURL, this.r2d2_DiffuseTextureURL);
        this.stormtrooper_Model = new Model(this.gl, this.stormtrooper_URL, this.stormtrooper_DiffuseTextureURL);
        this.droideka_Model = new Model(this.gl, this.droideka_ModelURL, this.droideka_DiffuseTextureURL);
        this.threetroopers_Model = new Model(this.gl, this.threetroopers_URL, this.threetroopers_DiffuseTextureURL);
        this.stormtrooper2_Model = new Model(this.gl, this.stormtrooper2_URL, this.stormtrooper2_DiffuseTextureURL);
        this.defense_towerModel = new Model(this.gl, this.defense_towerURL, this.defense_towerDiffuseTextureURL);
        this.defense_towerBModel = new Model(this.gl, this.defense_towerBURL, this.defense_towerBDiffuseTextureURL);
        this.military_tent_Model = new Model(this.gl, this.military_tent_URL, this.military_tent_DiffuseTextureURL);
        this.towerA_Model = new Model(this.gl, this.towerA_URL, this.towerA_DiffuseTextureURL);
        this.towerB_Model = new Model(this.gl, this.towerB_URL, this.towerB_DiffuseTextureURL);
        this.droneship_Model = new Model(this.gl, this.droneship_URL, this.droneship_DiffuseTextureURL);
        this.cargo_crate_Model = new Model(this.gl, this.cargo_crate_URL, this.cargo_crate_DiffuseTextureURL);
        this.basic_crate_Model = new Model(this.gl, this.basic_crate_URL, this.basic_crate_DiffuseTextureURL);
        this.xwing_Model = new Model(this.gl, this.xwing_URL, this.xwing_DiffuseTextureURL);
        this.floorModel = new Model(this.gl, this.floorModelURL, this.floorDiffuseTextureURL);        

        // Configure box material
        // It's a wooden box, so we want it to have little specularity and shininess
        this.droidModel.specularCoefficient = 0.25;
        this.droidModel.shininess = 40;
        this.droidModel.position =glm.vec3.fromValues(0, 0, -7);
        this.droidModel.scale =glm.vec3.fromValues(0.01, 0.01, 0.01);
        this.elementsPositions.push([0,0,-7]);

        this.bb8_Model.specularCoefficient = 0.25;
        this.bb8_Model.shininess = 40;
        this.bb8_Model.position =glm.vec3.fromValues(20, 1, 0);
        this.bb8_Model.scaleUniform(0.01);
        this.elementsPositions.push([20,1,0]);

        this.r2d2_Model.specularCoefficient = 0.25;
        this.r2d2_Model.shininess = 40;
        this.r2d2_Model.position =glm.vec3.fromValues(21.5,0,1.7);
        this.r2d2_Model.scale =glm.vec3.fromValues(0.01, 0.01, 0.01);
        this.r2d2_Model.rotate(0,0,-130);
        this.r2d2_Model.scaleUniform(1.4);
        this.elementsPositions.push([21.5,0,1.7]);

        this.droideka_Model.specularCoefficient = 0.25;
        this.droideka_Model.shininess = 40;
        this.droideka_Model.position =glm.vec3.fromValues(-2, 0, -15);
        this.droideka_Model.rotate(0,0,-150);
        this.droideka_Model.scaleUniform(3);
        this.elementsPositions.push([-2,0,-15]);

        this.stormtrooper_Model.specularCoefficient = 0.25;
        this.stormtrooper_Model.shininess = 40;
        this.stormtrooper_Model.position =glm.vec3.fromValues(-20, 15, 58);
        this.stormtrooper_Model.scaleUniform(1.7);
        this.elementsPositions.push([-20,15,58]);

        this.threetroopers_Model.specularCoefficient = 0.25;
        this.threetroopers_Model.shininess = 40;
        this.threetroopers_Model.position =glm.vec3.fromValues(5, 2.5, 9.8);
        this.threetroopers_Model.scaleUniform(2.9);
        this.elementsPositions.push([5,2.5,9.8]);

        this.droneship_Model.specularCoefficient = 0.25;
        this.droneship_Model.shininess = 40;
        this.droneship_Model.position =glm.vec3.fromValues(23, 1.8, 10);
        this.droneship_Model.scaleUniform(2.4);
        this.elementsPositions.push([23,1.8,10]);

        this.cargo_crate_Model.specularCoefficient = 0.25;
        this.cargo_crate_Model.shininess = 40;
        this.cargo_crate_Model.position =glm.vec3.fromValues(0, 1.8, 30);
        this.cargo_crate_Model.scaleUniform(0.07);
        this.elementsPositions.push([0,1.8,30]);

        this.basic_crate_Model.specularCoefficient = 0.25;
        this.basic_crate_Model.shininess = 40;
        this.basic_crate_Model.position =glm.vec3.fromValues(0, 1.8, 40);
        this.basic_crate_Model.scaleUniform(1);
        this.elementsPositions.push([0,1.8,40]);

        this.xwing_Model.specularCoefficient = 0.25;
        this.xwing_Model.shininess = 40;
        this.xwing_Model.position =glm.vec3.fromValues(30, 40, -10);
        this.xwing_Model.scaleUniform(4);
        this.xwing_Model.pitch = 0.2;
        this.xwing_Model.yaw = -0.7;

        this.stormtrooper2_Model.specularCoefficient = 0.25;
        this.stormtrooper2_Model.shininess = 40;
        this.stormtrooper2_Model.position =glm.vec3.fromValues(0, 0, 77);
        this.stormtrooper2_Model.scaleUniform(1.4);
        this.stormtrooper2_Model.rotate(0,0,180);
        //this.elementsPositions.push([20,0,27]);

        this.defense_towerModel.specularCoefficient = 0.25;
        this.defense_towerModel.shininess = 40;
        this.defense_towerModel.position =glm.vec3.fromValues(20, 1.5, -35);
        this.defense_towerModel.scale =glm.vec3.fromValues(0.02, 0.02, 0.02);
        this.defense_towerModel.rotate(0,0,120);
        this.elementsPositions.push([20,1.5,-35]);

        this.defense_towerBModel.specularCoefficient = 0.25;
        this.defense_towerBModel.shininess = 40;
        this.defense_towerBModel.position =glm.vec3.fromValues(-20, 8.5, -35);
        this.defense_towerBModel.scale =glm.vec3.fromValues(9, 9, 9);
        this.defense_towerBModel.rotate(0,0,180);
        this.elementsPositions.push([-20,8.5,-35]);

        this.military_tent_Model.specularCoefficient = 0.25;
        this.military_tent_Model.shininess = 40;
        this.military_tent_Model.position =glm.vec3.fromValues(-10, 0.2, 10);
        this.military_tent_Model.scale =glm.vec3.fromValues(1, 1, 1);
        this.military_tent_Model.rotate(0,0,90);
        this.elementsPositions.push([-10,0.2,10]);

        this.towerA_Model.specularCoefficient = 0.25;
        this.towerA_Model.shininess = 40;
        this.towerA_Model.position =glm.vec3.fromValues(-20, 0, 60);
        this.towerA_Model.scaleUniform(0.5);
        this.elementsPositions.push([-20,0,60]);

        this.towerB_Model.specularCoefficient = 0.25;
        this.towerB_Model.shininess = 40;
        this.towerB_Model.position =glm.vec3.fromValues(20, 4, 57);
        this.towerB_Model.scaleUniform(2.5);
        this.elementsPositions.push([20,4,57]);

        // Configure floor material
        // It can be shiny!
        this.floorModel.specularCoefficient = 0.5;
        this.floorModel.shininess = 20;
        this.floorModel.position = glm.vec3.fromValues(0,0,0);
        this.floorModel.scale = glm.vec3.fromValues(20,1,30);
    }

    private onMouseMove(e: MouseEvent) {        

        if (e.which !== 1) {
            return;
        }
                
        if (Math.abs(e.movementX) > Math.abs(e.movementY)) {
                
            // YAW: Rotation around Y axis (camera rotates SIDEWAYS, keeping up vector pointing straight up!)
                
            // right
            if (e.movementX < 0) {
                this.yaw += this.angleAmount;
                
                if (this.yaw >= 360) {
                    this.yaw = 0;
                }
            }
                
            // left
            if (e.movementX > 0) {
                this.yaw -= this.angleAmount;
                
                if (this.yaw <= 0) {
                    this.yaw = 360;
                }
            }
        } else {
                
            // PITCH: Rotation around X axis (camera rotates UP/DOWN)
                
            // up
            if (e.movementY > 0) {
                this.pitch += this.angleAmount;
                
                if (this.pitch >= 360) {
                    this.pitch = 0;
                }
            }
                
            // down
            if (e.movementY < 0) {
                this.pitch -= this.angleAmount;
                                        
                if (this.pitch <= 0) {
                    this.pitch = 360;
                }
            }
        }

        this.cam.rotate(this.pitch, this.yaw);
    }

    private onKeyDown(e: KeyboardEvent) {
        let displacement = glm.vec3.create();
        
        this.elementsBoxes.push([this.droidModel.mesh.boundingBox.width * this.droidModel.scale[0], this.droidModel.mesh.boundingBox.height * this.droidModel.scale[1], this.droidModel.mesh.boundingBox.length * this.droidModel.scale[2]]);
        this.elementsBoxes.push([this.bb8_Model.mesh.boundingBox.width * this.bb8_Model.scale[0], this.bb8_Model.mesh.boundingBox.height * this.bb8_Model.scale[1], this.bb8_Model.mesh.boundingBox.length * this.bb8_Model.scale[2]]);
        this.elementsBoxes.push([this.r2d2_Model.mesh.boundingBox.width * this.r2d2_Model.scale[0], this.r2d2_Model.mesh.boundingBox.height * this.r2d2_Model.scale[1], this.r2d2_Model.mesh.boundingBox.length * this.r2d2_Model.scale[2]]);
        this.elementsBoxes.push([this.droideka_Model.mesh.boundingBox.width * this.droideka_Model.scale[0], this.droideka_Model.mesh.boundingBox.height * this.droideka_Model.scale[1], this.droideka_Model.mesh.boundingBox.length * this.droideka_Model.scale[2]]);
        this.elementsBoxes.push([this.stormtrooper_Model.mesh.boundingBox.width * this.stormtrooper_Model.scale[0], this.stormtrooper_Model.mesh.boundingBox.height * this.stormtrooper_Model.scale[1], this.stormtrooper_Model.mesh.boundingBox.length * this.stormtrooper_Model.scale[2]]);
        this.elementsBoxes.push([this.threetroopers_Model.mesh.boundingBox.width * this.threetroopers_Model.scale[0], this.threetroopers_Model.mesh.boundingBox.height * this.threetroopers_Model.scale[1], this.threetroopers_Model.mesh.boundingBox.length * this.threetroopers_Model.scale[2]]);
        this.elementsBoxes.push([this.droneship_Model.mesh.boundingBox.width * this.droneship_Model.scale[0], this.droneship_Model.mesh.boundingBox.height * this.droneship_Model.scale[1], this.droneship_Model.mesh.boundingBox.length * this.droneship_Model.scale[2]]);
        this.elementsBoxes.push([this.cargo_crate_Model.mesh.boundingBox.width * this.cargo_crate_Model.scale[0], this.cargo_crate_Model.mesh.boundingBox.height * this.cargo_crate_Model.scale[1], this.cargo_crate_Model.mesh.boundingBox.length * this.cargo_crate_Model.scale[2]]);
        this.elementsBoxes.push([this.basic_crate_Model.mesh.boundingBox.width * this.basic_crate_Model.scale[0], this.basic_crate_Model.mesh.boundingBox.height * this.basic_crate_Model.scale[1], this.basic_crate_Model.mesh.boundingBox.length * this.basic_crate_Model.scale[2]]);
        //this.elementsBoxes.push([this.stormtrooper2_Model.mesh.boundingBox.width * this.stormtrooper2_Model.scale[0], this.stormtrooper2_Model.mesh.boundingBox.height * this.stormtrooper2_Model.scale[1], this.stormtrooper2_Model.mesh.boundingBox.length * this.stormtrooper2_Model.scale[2]]);
        this.elementsBoxes.push([this.defense_towerModel.mesh.boundingBox.width * this.defense_towerModel.scale[0], this.defense_towerModel.mesh.boundingBox.height * this.defense_towerModel.scale[1], this.defense_towerModel.mesh.boundingBox.length * this.defense_towerModel.scale[2]]);
        this.elementsBoxes.push([this.defense_towerBModel.mesh.boundingBox.width * this.defense_towerBModel.scale[0], this.defense_towerBModel.mesh.boundingBox.height * this.defense_towerBModel.scale[1], this.defense_towerBModel.mesh.boundingBox.length * this.defense_towerBModel.scale[2]]);
        this.elementsBoxes.push([23,10,16]);
        this.elementsBoxes.push([this.towerA_Model.mesh.boundingBox.width * this.towerA_Model.scale[0], this.towerA_Model.mesh.boundingBox.height * this.towerA_Model.scale[1], this.towerA_Model.mesh.boundingBox.length * this.towerA_Model.scale[2]]);
        this.elementsBoxes.push([this.towerB_Model.mesh.boundingBox.width * this.towerB_Model.scale[0], this.towerB_Model.mesh.boundingBox.height * this.towerB_Model.scale[1], this.towerB_Model.mesh.boundingBox.length * this.towerB_Model.scale[2]]);

        
        switch (e.key.toLocaleLowerCase()) {
            case 'a': // left      
                this.cam.move(glm.vec3.scale(displacement, this.cam.right, this.deltaTime * this.camMoveSpeed), this.elementsPositions, this.elementsBoxes, this.stormtrooper2_Model);
                break;
            case 'd': // right
                this.cam.move(glm.vec3.scale(displacement, this.cam.right, - this.deltaTime * this.camMoveSpeed), this.elementsPositions, this.elementsBoxes, this.stormtrooper2_Model);
                break;
            case 'w': // forward  
                this.cam.move(glm.vec3.scale(displacement, this.cam.direction, - this.deltaTime * this.camMoveSpeed), this.elementsPositions, this.elementsBoxes, this.stormtrooper2_Model);          
                break;            
            case 's': // backward
                this.cam.move(glm.vec3.scale(displacement, this.cam.direction, this.deltaTime * this.camMoveSpeed), this.elementsPositions, this.elementsBoxes, this.stormtrooper2_Model);
                break;
        }
    }

    private onMouseWheel(e: WheelEvent) {
        this.radius += e.deltaY * this.radiusSpeed;
    }    

    drawScene(now: number) {
        if (this.stopped) {
            return;
        }        

        // Resize window if necessary
        this.onCanvasResized();

        // Calculate delta time to make animation frame rate independent
        now *= 0.001;   // convert current time to seconds
        this.deltaTime = now - this.then;  // get time difference from previous time to current time
        this.then = now; // remember time for the next frame

        // Tell WebGL how to convert from clip space to pixels
        this.gl.viewport(0, 0, this.width, this.height);

        // Clear the canvas
        this.gl.clearColor(...this.backgroundColor);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);  

        // Set up our projection matrix
        glm.mat4.perspective(this.projection, glm.glMatrix.toRadian(this.cam.fov), this.width/this.height, 0.1, 200);        


        this.shaderProgram.use();

        // Projection and view matrices
        this.shaderProgram.setUniformMatrix4fv('u_projection', this.projection); // pass projection matrix to the shader
        this.shaderProgram.setUniformMatrix4fv('u_view', this.cam.getViewMatrix()); // pass view matrix        


        // Pass camera (eye)
        this.shaderProgram.setUniform3f('u_eyePos', this.cam.position);
        
        // Pass light information to the shader
        this.shaderProgram.setUniform3f('u_light.position', this.lightPosition);
        this.shaderProgram.setUniform1f('u_light.intensity', this.lightIntensity);
        this.shaderProgram.setUniform3f('u_light.diffuseColor', this.lightDiffuseColor);
        this.shaderProgram.setUniform3f('u_light.specularColor', this.lightSpecularColor);
        this.shaderProgram.setUniform1f('u_light.attenuation.constant', this.lightAttenuationConstant);
        this.shaderProgram.setUniform1f('u_light.attenuation.linear', this.lightAttenuationLinear);
        this.shaderProgram.setUniform1f('u_light.attenuation.quadratic', this.lightAttenuationQuadratic);

        // Ambient light
        this.shaderProgram.setUniform3f('u_ambientColor', this.ambientColor);
        this.shaderProgram.setUniform1f('u_ambientIntensity', this.ambientIntensity);

        // Draw model
        this.droidModel.draw(this.shaderProgram);
        this.bb8_Model.draw(this.shaderProgram);
        this.r2d2_Model.draw(this.shaderProgram);
        this.stormtrooper_Model.draw(this.shaderProgram);
        this.droideka_Model.draw(this.shaderProgram);
        this.threetroopers_Model.draw(this.shaderProgram);
        this.stormtrooper2_Model.draw(this.shaderProgram);
        this.defense_towerModel.draw(this.shaderProgram);
        this.defense_towerBModel.draw(this.shaderProgram);
        this.military_tent_Model.draw(this.shaderProgram);
        this.towerA_Model.draw(this.shaderProgram);
        this.towerB_Model.draw(this.shaderProgram);
        this.droneship_Model.draw(this.shaderProgram);
        this.cargo_crate_Model.draw(this.shaderProgram);
        this.basic_crate_Model.draw(this.shaderProgram);
        this.xwing_Model.draw(this.shaderProgram);
        this.floorModel.draw(this.shaderProgram);

        // Draw quad
        this.shaderProgram.setUniformMatrix4fv('u_model', glm.mat4.create());
        this.gl.bindVertexArray(this.wallVAO);      // tell WebGL we want to draw the triangle
        this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_INT, 0);    // params: primitive type, count, type, offset

        // Call draw scene again at the next frame
        requestAnimationFrame(this.drawScene.bind(this));
    }

    onCanvasResized() {
        this.width = this.canvas.clientWidth;
        this.height = this.canvas.clientHeight;

        if (this.canvas.width !== this.width || this.canvas.height !== this.height) {
            this.canvas.width = this.width;
            this.canvas.height = this.height;
        }
    }

    async run() {
        await this.init();

        await this.initQuadBuffers();
        this.initTexture();
        await this.initModels();


        requestAnimationFrame(this.drawScene.bind(this));
    }
    
    async stop() {
        this.stopped = true;        
        document.removeEventListener('mousemove', this.onMouseMove.bind(this));
        document.removeEventListener('wheel', this.onMouseWheel.bind(this));      
        document.removeEventListener('keydown', this.onKeyDown.bind(this));  
        this.shaderProgram.destroy();
        this.droidModel.destroy();
        this.gl.deleteVertexArray(this.wallVAO);
        this.gl.deleteBuffer(this.wallVBO);
        this.gl.deleteBuffer(this.wallTextCoordsVBO);
        this.gl.deleteBuffer(this.wallIBO);
    }    
}