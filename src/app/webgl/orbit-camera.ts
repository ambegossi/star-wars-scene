import * as glm from "gl-matrix";
import { Camera } from "./camera";
import { MyMath } from './my-math';
import { Model } from "./model";

export class OrbitCamera extends Camera {

    private userCubeCamDistance: number = 10;
    private camTargetYOffset: number = 5; // To keep camera always a bit above the cube instead of having it centralized
    private userCubeYRotationAngle = 0;

    private elementPosition: glm.vec3 = glm.vec3.fromValues(0, 0, 77);
    
    private ylimit = 97;
    private ylimit2 = -47;
    private xlimit = 31.8;
    private xlimit2 = -31.9;

    constructor() {
        super();
        this._position[1] = 20;
    }

    protected _radius = 10;

    rotate(pitch: number, yaw: number) {

       this._pitch = pitch;
       this._yaw = yaw;

        this.updateCameraVectors();
    }

    setLookAt(target: glm.vec3) {
        this._target = target;

        this.updateCameraVectors();
    }

    protected updateCameraVectors() {

        this._position[0] = this.elementPosition[0] + this.userCubeCamDistance * Math.cos(MyMath.degreeToRad(this._pitch)) * Math.sin(MyMath.degreeToRad(this._yaw));
        this._position[1] = this.userCubeCamDistance * Math.sin(MyMath.degreeToRad(this._pitch));
        this._position[1] += 5;
        this._position[2] = this.elementPosition[2] + this.userCubeCamDistance * Math.cos(MyMath.degreeToRad(this._pitch)) * Math.cos(MyMath.degreeToRad(this._yaw));

        // 2) Use the user cube's position as the camera's target vector.
        //    Add the camTargetYOffset to the Y coordinate to keep the target a little above the camera (to make the user cube appear more at the bottom of the screen)
        this._target[0] = this.elementPosition[0];
        this._target[1] = this.elementPosition[1];
        this._target[2] = this.elementPosition[2];
        this._target[1] += this.camTargetYOffset;

        // 3) Use user cube position and camera position to calculate the look direction. Remember to normalize!
        let aux =  MyMath.normalize([this._position[0]-this.elementPosition[0],this._position[1]-this.elementPosition[1],this._position[2]-this.elementPosition[2]]);
        this._direction[0] = aux[0];
        this._direction[1] = aux[1];
        this._direction[2] = aux[2];

        // 4) Use direction and standard up vector (0, 1, 0) to calculate the camera's right vector. Tip: cross product!
        let aux2 = MyMath.normalize(MyMath.cross(aux,[0,1,0]));
        
        this._right[0] = aux2[0];
        this._right[1] = aux2[1];
        this._right[2] = aux2[2];
    }

        /**
     * Make sure our user cube doesn't escape to outer scape
     */
    private keepUserCubeOnGrid(elementModel: Model) {
        // Keep the user cube on the area defined by the grid
        // If the cube's X position is lower than the grid's left edge, make the X position equal to the grid's left edge
        if(this.elementPosition[0] < this.xlimit2){
            this.elementPosition[0] = this.xlimit2;
            elementModel.position[0] = this.xlimit2;
            this._position[0] = this.xlimit2;
        }

        // If the cube's X position is greater than the grid's right edge, make the X position equal to the grid's right edge
        if(this.elementPosition[0] > this.xlimit){
            this.elementPosition[0] = this.xlimit;
            elementModel.position[0] = this.xlimit;
            this._position[0] = this.xlimit;
        }
        
        // The same goes for the cube's Z position and the grid's top and bottom edges
        if(this.elementPosition[2] < this.ylimit2){
            this.elementPosition[2] = this.ylimit2;
            elementModel.position[2] = this.ylimit2;
            this._position[2] = this.ylimit2+13;
        }

        if(this.elementPosition[2] > this.ylimit){
            this.elementPosition[2] = this.ylimit;
            elementModel.position[2] = this.ylimit;
            this._position[2] = this.ylimit+13;
        }
        // Remember that the grid's edges can be obtained from its width and length (given as variables!)
    }

    /**
     * Check if two cubes collide.
     * 
     * @param firstCubePos position vector of the first cube
     * @param firstCubeScale scale vector of the first cube
     * @param secondCubePos position vector of the second cube
     * @param secondCubeScale scale vector of the second cube
     */
    private cubesCollide(firstCubePos: glm.vec3, firstCubeScale: [number, number, number],
        secondCubePos: [number, number, number], secondCubeScale: [number, number, number]): boolean {
        
        // Check if cubes collide on the XZ plane. We're keeping the user cube on the ground, so we can ignore Y.
        // The user cube may not be axis-aligned with the others, but, for simplicity's sake, we'll pretend it is
        // Use each cube's position (its center!) and scale vector to find its corners
        // Remember the unscaled dimensions of the cubes are 2x2x2
        // Cubes collide if the following conditions are met:

        // 1) the right corner of the first cube is larger than the left corner of the second cube
        if(firstCubePos[0]+firstCubeScale[0] < secondCubePos[0]-(secondCubeScale[0]/2)){
             return false;
        }

        // 2) the right corner of the second cube is larger than the left corner of the first cube
        if(secondCubePos[0]+(secondCubeScale[0]/2) < firstCubePos[0]-firstCubeScale[0]){
            return false;
        }
        // 3) the bottom corner of the first cube is larger than the top corner of the second cube
        if(firstCubePos[2]+firstCubeScale[2] < secondCubePos[2]-(secondCubeScale[2]/2)){
            return false;
        }
        // 4) the bottom corner of the second cube is larger than the top corner of the first cube
        if(secondCubePos[2]+(secondCubeScale[2]/2) < firstCubePos[2]-firstCubeScale[2]){
            return false;
        }

        return true;

    }

        /**
     * Always make the user cube's back is facing the camera
     */
    private adjustUserCubeDirection() {        
        this.userCubeYRotationAngle = this._yaw - 180;
    }

    move(offset: glm.vec3, elementsPositions: [number,number,number][], elementsBoxes: [number,number,number][], elementModel: Model) {
        
        this.elementPosition[0] = elementModel.position[0];
        this.elementPosition[1] = elementModel.position[1];
        this.elementPosition[2] = elementModel.position[2];
        
        // Check if the user cube collides with any of the obstacle cubes
        let positionfake = glm.vec3.fromValues(elementModel.position[0],elementModel.position[1],elementModel.position[2]);

        glm.vec3.add(positionfake, positionfake, offset);

        // Make cube's back face the camera
        this.adjustUserCubeDirection();   
        
        let collide = false;
        for (let i = 0; i < elementsPositions.length; i++) {
            if (this.cubesCollide(positionfake, [2,2,2], elementsPositions[i], elementsBoxes[i])) {
                collide = true;
                break;
            }
        }

        if (!collide){
            offset[1] = 0;
            glm.vec3.add(this._position, this._position, offset);
            glm.vec3.add(elementModel.position,elementModel.position,offset);
            glm.vec3.add(this.elementPosition,this.elementPosition,offset);

            this.keepUserCubeOnGrid(elementModel);
            this.updateCameraVectors();
        }

    }

    setPosition(position: glm.vec3) {
        this._position = position;
        this.updateCameraVectors();
    }
    
    
    public get radius() : number {
        return this._radius;
    }
    
    public set radius(v : number) {
        this._radius = this.clamp(v, 2, 80);
        this.updateCameraVectors();
    }    
}