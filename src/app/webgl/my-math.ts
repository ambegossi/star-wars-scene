
// Defining type aliases to make things easier to read
type Vector3 = [number, number, number];
type Vector4 = [number, number, number, number];

export class MyMath {
    static degreeToRad(d: number) {
        return d * Math.PI / 180;
    }

    static rotate2D(degree: number): Float32Array {
        const angle = MyMath.degreeToRad(degree);        
        
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        
        const m = new Float32Array(9);

        m[0] = cos; m[1] = -sin; m[2] = 0.0;    // col 1
        m[3] = sin; m[4] =  cos; m[5] = 0.0;    // col 2
        m[6] = 0.0; m[7] =  0.0; m[8] = 1.0;    // col 3 

        return m;
    }

    static translate2D(x: number, y: number) {        
        const m = new Float32Array(9);
        m[0] = 1; m[3] = 0; m[6] = x;
        m[1] = 0; m[4] = 1; m[7] = y;
        m[2] = 0; m[5] = 0; m[8] = 1;
        return m;
    }

    static identity3D() {
        const m = new Float32Array(16);
        m[0] = 1; m[4] = 0; m[8] = 0;  m[12] = 0;
        m[1] = 0; m[5] = 1; m[9] = 0;  m[13] = 0;
        m[2] = 0; m[6] = 0; m[10] = 1; m[14] = 0;
        m[3] = 0; m[7] = 0; m[11] = 0; m[15] = 1;
        return m;
    }

    static scale3D(x: number, y: number, z: number) {
        const m = new Float32Array(16);
        m[0] = x; m[4] = 0; m[8] = 0;  m[12] = 0;
        m[1] = 0; m[5] = y; m[9] = 0;  m[13] = 0;
        m[2] = 0; m[6] = 0; m[10] = z; m[14] = 0;
        m[3] = 0; m[7] = 0; m[11] = 0; m[15] = 1;
        return m;
    }

    static translate3D(x: number, y: number, z: number) {
        const m = new Float32Array(16);
        m[0] = 1; m[4] = 0; m[8] = 0;  m[12] = x;
        m[1] = 0; m[5] = 1; m[9] = 0;  m[13] = y;
        m[2] = 0; m[6] = 0; m[10] = 1; m[14] = z;
        m[3] = 0; m[7] = 0; m[11] = 0; m[15] = 1;
        return m;
    }

    static rotate3D_X(degree: number) {
        const angle = MyMath.degreeToRad(degree);
        
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        const m = new Float32Array(16);
        m[0] = 1; m[4] = 0;   m[8] = 0;     m[12] = 0;
        m[1] = 0; m[5] = cos; m[9] = -sin;  m[13] = 0;
        m[2] = 0; m[6] = sin; m[10] = cos;  m[14] = 0;
        m[3] = 0; m[7] = 0;   m[11] = 0;    m[15] = 1;
        return m;
    }

    static rotate3D_Y(degree: number) {
        const angle = MyMath.degreeToRad(degree);
        
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        const m = new Float32Array(16);
        m[0] = cos;  m[4] = 0; m[8] = sin;  m[12] = 0;
        m[1] = 0;    m[5] = 1; m[9] = 0;    m[13] = 0;
        m[2] = -sin; m[6] = 0; m[10] = cos; m[14] = 0;
        m[3] = 0;    m[7] = 0; m[11] = 0;   m[15] = 1;
        return m;
    }

    static multiplyMatrix2D(m1: Float32Array, m2: Float32Array) {

        const m1_l1: Vector3 = [m1[0], m1[3], m1[6]];
        const m1_l2: Vector3 = [m1[1], m1[4], m1[7]];
        const m1_l3: Vector3 = [m1[2], m1[5], m1[8]];

        const m2_c1: Vector3 = [m2[0], m2[1], m2[2]];
        const m2_c2: Vector3 = [m2[3], m2[4], m2[5]];
        const m2_c3: Vector3 = [m2[6], m2[7], m2[8]];

        const m = new Float32Array(9);

        m[0] = MyMath.dot3f(m1_l1, m2_c1);    m[3] = MyMath.dot3f(m1_l1, m2_c2);    m[6] = MyMath.dot3f(m1_l1, m2_c3);
        m[1] = MyMath.dot3f(m1_l2, m2_c1);    m[4] = MyMath.dot3f(m1_l2, m2_c2);    m[7] = MyMath.dot3f(m1_l2, m2_c3);
        m[2] = MyMath.dot3f(m1_l3, m2_c1);    m[5] = MyMath.dot3f(m1_l3, m2_c2);    m[8] = MyMath.dot3f(m1_l3, m2_c3);

        return m;
    }

    static multiplyMatrix3D(m1: Float32Array, m2: Float32Array) {

        const m1_l1: Vector4 = [m1[0], m1[4], m1[8],  m1[12]];
        const m1_l2: Vector4 = [m1[1], m1[5], m1[9],  m1[13]];
        const m1_l3: Vector4 = [m1[2], m1[6], m1[10], m1[14]];
        const m1_l4: Vector4 = [m1[3], m1[7], m1[11], m1[15]];

        const m2_c1: Vector4 = [m2[0],  m2[1],  m2[2],   m2[3]];
        const m2_c2: Vector4 = [m2[4],  m2[5],  m2[6],   m2[7]];
        const m2_c3: Vector4 = [m2[8],  m2[9],  m2[10], m2[11]];
        const m2_c4: Vector4 = [m2[12], m2[13], m2[14], m2[15]];

        const m = new Float32Array(16);

        m[0] = MyMath.dot4f(m1_l1, m2_c1);    m[4] = MyMath.dot4f(m1_l1, m2_c2);    m[8] = MyMath.dot4f(m1_l1, m2_c3);  m[12] = MyMath.dot4f(m1_l1, m2_c4);
        m[1] = MyMath.dot4f(m1_l2, m2_c1);    m[5] = MyMath.dot4f(m1_l2, m2_c2);    m[9] = MyMath.dot4f(m1_l2, m2_c3);  m[13] = MyMath.dot4f(m1_l2, m2_c4);
        m[2] = MyMath.dot4f(m1_l3, m2_c1);    m[6] = MyMath.dot4f(m1_l3, m2_c2);    m[10] = MyMath.dot4f(m1_l3, m2_c3); m[14] = MyMath.dot4f(m1_l3, m2_c4);
        m[3] = MyMath.dot4f(m1_l4, m2_c1);    m[7] = MyMath.dot4f(m1_l4, m2_c2);    m[11] = MyMath.dot4f(m1_l4, m2_c3); m[15] = MyMath.dot4f(m1_l4, m2_c4);

        return m;
    }

    static dot3f(v1: Vector3, v2: Vector3) {
        return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
    }

    static dot4f(v1: Vector4, v2: Vector4) {
        return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2] + v1[3] * v2[3];
    }

    static normalize(v: Vector3): Vector3 {
        const l = Math.sqrt(MyMath.dot3f(v, v));
        if (l <= 0.00001) {
            return [0, 0, 0];
        }
        return [v[0]/l, v[1]/l, v[2]/l];
    }

    static cross(v1: Vector3, v2: Vector3): Vector3 {
        return [
            v1[1] * v2[2] - v1[2] * v2[1],
            v1[2] * v2[0] - v1[0] * v2[2],
            v1[0] * v2[1] - v1[1] * v2[0]
        ];
    }

    static lookAt(eye: Vector3, target: Vector3, up: Vector3) {
        const d: Vector3 = MyMath.normalize([- eye[0] + target[0], - eye[1] + target[1], - eye[2] + target[2]]);
        const l = MyMath.normalize(MyMath.cross(d, up));
        const u = MyMath.normalize(MyMath.cross(l, d));        

        const orientation = new Float32Array(16);

        orientation[0] = l[0]; orientation[4] = l[1]; orientation[8] =  l[2]; orientation[12] = 0;
        orientation[1] = u[0]; orientation[5] = u[1]; orientation[9] =  u[2]; orientation[13] = 0;
        orientation[2] = -d[0]; orientation[6] = -d[1]; orientation[10] = -d[2]; orientation[14] = 0;
        orientation[3] = 0;    orientation[7] = 0;    orientation[11] = 0;    orientation[15] = 1;
        
        const translation = MyMath.translate3D(-eye[0], -eye[1], -eye[2]);

        return MyMath.multiplyMatrix3D(orientation, translation);
    }

    static perspective(fovy: number, aspect: number, near: number, far: number) {
        const d = 1/Math.tan(MyMath.degreeToRad(fovy)/2);
        
        const p = new Float32Array(16);        
        p[0] = d/aspect;  p[4] = 0; p[8] = 0;                           p[12] = 0;
        p[1] = 0;         p[5] = d; p[9] = 0;                           p[13] = 0;
        p[2] = 0;         p[6] = 0; p[10] = - (far+near)/(far-near);    p[14] = - (2 * far * near)/(far - near);
        p[3] = 0;         p[7] = 0; p[11] = -1;                         p[15] = 0;

        return p;
    }
}