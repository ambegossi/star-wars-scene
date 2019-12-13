import * as glm from "gl-matrix";
import { Camera } from "./camera";

export class FPSCamera extends Camera {

    private ylimit = 97;
    private ylimit2 = -47;
    private xlimit = 31.8;
    private xlimit2 = -31.9;

    rotate(pitch: number, yaw: number) {
        this._pitch += glm.glMatrix.toRadian(pitch);
        this._yaw += glm.glMatrix.toRadian(yaw);

        this._pitch = this.clamp(this._pitch, - Math.PI / 2 + 0.1, Math.PI / 2 - 0.1);

        this.updateCameraVectors();
    }

    move(offset: glm.vec3, elementsPositions: [number,number,number][], elementsBoxes: [number,number,number][]) {
        // Check if the user cube collides with any of the obstacle cubes
        let positionfake = glm.vec3.fromValues(this._position[0],this._position[1],this._position[2]);

        glm.vec3.add(positionfake, positionfake, offset);
        
        let collide = false;
        for (let i = 0; i < elementsPositions.length; i++) {
            if (this.camCollide(positionfake, [1,1,1], elementsPositions[i], elementsBoxes[i])) {
                collide = true;
                break;
            }
        }

        if (!collide){
            offset[1] = 0;
            glm.vec3.add(this._position, this._position, offset);
            this.keepUserOnGrid();
            this.updateCameraVectors();
        }

    }

    setPosition(position: glm.vec3) {
        this._position = position;
        this.updateCameraVectors();
    }

        /**
     * Make sure our user cube doesn't escape to outer scape
     */
    private keepUserOnGrid() {
        // Keep the user cube on the area defined by the grid
        // If the cube's X position is lower than the grid's left edge, make the X position equal to the grid's left edge
        if(this._position[0] < this.xlimit2){
            this._position[0] = this.xlimit2;
        }

        // If the cube's X position is greater than the grid's right edge, make the X position equal to the grid's right edge
        if(this._position[0] > this.xlimit){
            this._position[0] = this.xlimit;
        }
        
        // The same goes for the cube's Z position and the grid's top and bottom edges
        if(this._position[2] < this.ylimit2){
            this._position[2] = this.ylimit2;
        }

        if(this._position[2] > this.ylimit){
            this._position[2] = this.ylimit;
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
    private camCollide(firstCubePos: glm.vec3, firstCubeScale: [number, number, number],
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

    protected updateCameraVectors() {

        // Spherical to droidekatesian to obtain look direction
        let dir = glm.vec3.create();
        dir[0] = Math.cos(this._pitch) * Math.sin(this._yaw);
        dir[1] = Math.sin(this._pitch);
        dir[2] = Math.cos(this._pitch) * Math.cos(this._yaw);

        glm.vec3.normalize(this._direction, dir);

        // Recalculate right vector
        let right = glm.vec3.create();
        glm.vec3.cross(right, this._direction, this._worldUp);
        glm.vec3.normalize(this._right, right);

        // Recalculate up vector
        let up = glm.vec3.create();
        glm.vec3.cross(up, this._right, this._direction);
        glm.vec3.normalize(this._up, up);

        // Target = position + look direction
        glm.vec3.add(this._target, this._position, this._direction);
    }
}