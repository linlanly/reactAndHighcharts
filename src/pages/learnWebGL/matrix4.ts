export default class Matrix4 {
  elements: Float32Array = new Float32Array([]);
  constructor() {
  }
  setIndentity() {
    this.elements = new Float32Array([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ])
  }
  set(m: number) {
    this.elements = new Float32Array([
      m, 0, 0, 0,
      0, m, 0, 0,
      0, 0, m, 0,
      0, 0, 0, m
    ])
  }
  setData(data: Float32Array) {
    this.elements = data
  }
  beforeRotate(angle: number, x: boolean, y: boolean, z: boolean): Array<number> {
    let radian = angle * Math.PI / 180
    let sinD = Math.sin(radian)
    let cosD = Math.cos(radian)
    return [
      y || z ? cosD : 1, z ? sinD : 0, y ? sinD : 0, 0,
      z ? -sinD : 0, x || z ? cosD : 1, x ? -sinD : 0, 0,
      y ? -sinD : 0, x ? sinD : 0, x || y ? cosD : 1, 0,
      0, 0, 0, 1]
  }
  rotate(angle: number, x: boolean, y: boolean, z: boolean) {
    this.elements = new Float32Array(this.beforeRotate(angle, x, y, z))
  }
  beforeTranslate(x: number, y: number, z: number): Array<number> {
    return [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      x, y, z, 1
    ]
  }
  translate(x: number, y: number, z: number) {
    this.elements = new Float32Array(this.beforeTranslate(x, y, z))
  }
  beforeScale(x: number, y: number, z: number): Array<number> {
    return [
      x, 0, 0, 0,
      0, y, 0, 0,
      0, 0, z, 0,
      0, 0, 0, 1
    ]
  }
  scale(x: number, y: number, z: number) {
    this.elements = new Float32Array(this.beforeScale(x, y, z))
  }
  beforeLookAt(eyeX: number, eyeY: number, eyeZ: number, centerX: number, centerY: number, centerZ: number, upX: number, upY: number, upZ: number) {
    let dealList: Array<number> = new Array(16).fill(0);
    let fx, fy, fz, rlf, sx, sy, sz, rls, ux, uy, uz;

    fx = centerX - eyeX;
    fy = centerY - eyeY;
    fz = centerZ - eyeZ;

    // Normalize f.
    rlf = 1 / Math.sqrt(fx * fx + fy * fy + fz * fz);
    fx *= rlf;
    fy *= rlf;
    fz *= rlf;

    // Calculate cross product of f and up.
    sx = fy * upZ - fz * upY;
    sy = fz * upX - fx * upZ;
    sz = fx * upY - fy * upX;

    // Normalize s.
    rls = 1 / Math.sqrt(sx * sx + sy * sy + sz * sz);
    sx *= rls;
    sy *= rls;
    sz *= rls;

    // Calculate cross product of s and f.
    ux = sy * fz - sz * fy;
    uy = sz * fx - sx * fz;
    uz = sx * fy - sy * fx;

    // Set to this.
    dealList[0] = sx;
    dealList[1] = ux;
    dealList[2] = -fx;

    dealList[4] = sy;
    dealList[5] = uy;
    dealList[6] = -fy;

    dealList[8] = sz;
    dealList[9] = uz;
    dealList[10] = -fz;
    dealList[15] = 1;
    return dealList
  }
  lookAt(eyeX: number, eyeY: number, eyeZ: number, centerX: number, centerY: number, centerZ: number, upX: number, upY: number, upZ: number) {
    let dealList: Array<number> = this.beforeLookAt(eyeX, eyeY, eyeZ, centerX, centerY, centerZ, upX, upY, upZ)
    this.elements = new Float32Array(dealList)
    this.setTranslate(-eyeX, -eyeY, -eyeZ)
  }
  ortho(left: number, right: number, bottom: number, top: number, near: number, far: number) {
    let rw, rh, rd;
    if (left === right || bottom === top || near === far) {
      throw 'null frustum';
    }
    rw = 1 / (right - left)
    rh = 1 / (top - bottom)
    rd = 1 / (far - near)
    let dealList: Array<number> = new Array(16).fill(0);
    dealList[0] = 2 * rw;
    dealList[5] = 2 * rh;
    dealList[10] = -2 * rd;
    dealList[12] = -(right + left) * rw;
    dealList[13] = -(top + bottom) * rh;
    dealList[14] = -(far + near) * rd;
    dealList[15] = 1;
    this.elements = new Float32Array(dealList)
  }
  perspective(fovy: number, aspect: number, near: number, far: number) {
    if (near === far || aspect === 0) {
      throw 'null frustum'
    }
    if (near < 0) {
      throw 'near <= 0'
    }
    if (far < 0) {
      throw 'far <= 0'
    }
    let rd: number, ct: number, s: number;
    fovy = Math.PI * fovy / 180 / 2;
    s = Math.sin(fovy)
    if (s === 0) {
      throw 'null frustum';
    }
    rd = 1 / (far - near)
    ct = Math.cos(fovy) / s
    let dealList: Array<number> = new Array(16).fill(0)
    dealList[0] = ct / aspect
    dealList[5] = ct
    dealList[10] = -(far + near) * rd
    dealList[11] = -1
    dealList[14] = -2 * near * far * rd
    dealList[15] = 1
    this.elements = new Float32Array(dealList)
  }
  setRotate(angle: number, x: boolean, y: boolean, z: boolean) {
    let translate = this.beforeRotate(angle, x, y, z)
    let dataList = this.changeElements(this.arrayGrouping(translate, 4))
    if (dataList) {
      this.elements = dataList
    }
  }
  setScale(x: number, y: number, z: number) {
    let translate = this.beforeScale(x, y, z)
    let dataList = this.changeElements(this.arrayGrouping(translate, 4))
    if (dataList) {
      this.elements = dataList
    }
  }
  setTranslate(x: number, y: number, z: number) {
    let translate = this.beforeTranslate(x, y, z)
    let dataList = this.changeElements(this.arrayGrouping(translate, 4))
    if (dataList) {
      this.elements = dataList
    }
  }
  changeElements(translate: Array<Array<number>>) {
    if (!this.elements || !Array.isArray(translate) || translate.length < 1) {
      return
    }
    let size: number = translate.length
    // 将点转成符合WebGL格式的矩阵
    let dataList: Array<Array<number>> = []
    this.elements.forEach((item, index) => {
      let x = Math.floor(index / size)
      let y = index % size
      if (!dataList[y]) {
        dataList[y] = []
      }
      dataList[y][x] = item
    })
    let result: Array<Array<number>> = [];
    for (let i = 0; i < size; i++) {
      result[i] = []
      for (let j = 0; j < size; j++) {
        let sum = 0
        result[i][j] = 0
        for (let k = 0; k < size; k++) {
          sum += translate[k][i] * dataList[k][j]
        }
        result[i][j] = sum
      }
    }
    // WebGL格式的矩阵转成符合WebGL存入缓存的一维数组
    let dealList = []
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        dealList.push(result[j][i])
      }
    }
    return new Float32Array(dealList)
  }
  arrayGrouping(data: Array<number>, count: number): Array<Array<number>> {
    let dealList: Array<Array<number>> = [], tempList: Array<number> = [];
    let index = 0
    data.forEach(item => {
      if (index < count) {
        tempList.push(item)
        index++
      } else {
        index = 1
        dealList.push(tempList)
        tempList = [item]
      }
    })
    dealList.push(tempList)
    return dealList;
  }
  transpose() {
    let dealList = new Array(16)
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        dealList[i * 4 + j] = this.elements[j * 4 + i]
      }
    }
    this.elements = new Float32Array(dealList)
  }
  setInverseOf(data: Matrix4) {
    let dealList = new Array(16)
    let o = data.elements;
    dealList[0] = o[5] * o[10] * o[15] - o[5] * o[11] * o[14] - o[9] * o[6] * o[15]
      + o[9] * o[7] * o[14] + o[13] * o[6] * o[11] - o[13] * o[7] * o[10];
    dealList[4] = - o[4] * o[10] * o[15] + o[4] * o[11] * o[14] + o[8] * o[6] * o[15]
      - o[8] * o[7] * o[14] - o[12] * o[6] * o[11] + o[12] * o[7] * o[10];
    dealList[8] = o[4] * o[9] * o[15] - o[4] * o[11] * o[13] - o[8] * o[5] * o[15]
      + o[8] * o[7] * o[13] + o[12] * o[5] * o[11] - o[12] * o[7] * o[9];
    dealList[12] = - o[4] * o[9] * o[14] + o[4] * o[10] * o[13] + o[8] * o[5] * o[14]
      - o[8] * o[6] * o[13] - o[12] * o[5] * o[10] + o[12] * o[6] * o[9];

    dealList[1] = - o[1] * o[10] * o[15] + o[1] * o[11] * o[14] + o[9] * o[2] * o[15]
      - o[9] * o[3] * o[14] - o[13] * o[2] * o[11] + o[13] * o[3] * o[10];
    dealList[5] = o[0] * o[10] * o[15] - o[0] * o[11] * o[14] - o[8] * o[2] * o[15]
      + o[8] * o[3] * o[14] + o[12] * o[2] * o[11] - o[12] * o[3] * o[10];
    dealList[9] = - o[0] * o[9] * o[15] + o[0] * o[11] * o[13] + o[8] * o[1] * o[15]
      - o[8] * o[3] * o[13] - o[12] * o[1] * o[11] + o[12] * o[3] * o[9];
    dealList[13] = o[0] * o[9] * o[14] - o[0] * o[10] * o[13] - o[8] * o[1] * o[14]
      + o[8] * o[2] * o[13] + o[12] * o[1] * o[10] - o[12] * o[2] * o[9];

    dealList[2] = o[1] * o[6] * o[15] - o[1] * o[7] * o[14] - o[5] * o[2] * o[15]
      + o[5] * o[3] * o[14] + o[13] * o[2] * o[7] - o[13] * o[3] * o[6];
    dealList[6] = - o[0] * o[6] * o[15] + o[0] * o[7] * o[14] + o[4] * o[2] * o[15]
      - o[4] * o[3] * o[14] - o[12] * o[2] * o[7] + o[12] * o[3] * o[6];
    dealList[10] = o[0] * o[5] * o[15] - o[0] * o[7] * o[13] - o[4] * o[1] * o[15]
      + o[4] * o[3] * o[13] + o[12] * o[1] * o[7] - o[12] * o[3] * o[5];
    dealList[14] = - o[0] * o[5] * o[14] + o[0] * o[6] * o[13] + o[4] * o[1] * o[14]
      - o[4] * o[2] * o[13] - o[12] * o[1] * o[6] + o[12] * o[2] * o[5];

    dealList[3] = - o[1] * o[6] * o[11] + o[1] * o[7] * o[10] + o[5] * o[2] * o[11]
      - o[5] * o[3] * o[10] - o[9] * o[2] * o[7] + o[9] * o[3] * o[6];
    dealList[7] = o[0] * o[6] * o[11] - o[0] * o[7] * o[10] - o[4] * o[2] * o[11]
      + o[4] * o[3] * o[10] + o[8] * o[2] * o[7] - o[8] * o[3] * o[6];
    dealList[11] = - o[0] * o[5] * o[11] + o[0] * o[7] * o[9] + o[4] * o[1] * o[11]
      - o[4] * o[3] * o[9] - o[8] * o[1] * o[7] + o[8] * o[3] * o[5];
    dealList[15] = o[0] * o[5] * o[10] - o[0] * o[6] * o[9] - o[4] * o[1] * o[10]
      + o[4] * o[2] * o[9] + o[8] * o[1] * o[6] - o[8] * o[2] * o[5];

    let det = o[0] * dealList[0] + o[1] * dealList[4] + o[2] * dealList[8] + o[3] * dealList[12];
    if (det === 0) {
      return this;
    }

    det = 1 / det;
    for (let i = 0; i < 16; i++) {
      dealList[i] = dealList[i] * det;
    }
    this.elements = new Float32Array(dealList)
  }
  multiply(data: Matrix4) {
    var i, dealList, a, b, ai0, ai1, ai2, ai3;

    dealList = new Array(16);
    a = this.elements;
    b = data.elements;

    for (i = 0; i < 4; i++) {
      ai0 = a[i]; ai1 = a[i + 4]; ai2 = a[i + 8]; ai3 = a[i + 12];
      dealList[i] = ai0 * b[0] + ai1 * b[1] + ai2 * b[2] + ai3 * b[3];
      dealList[i + 4] = ai0 * b[4] + ai1 * b[5] + ai2 * b[6] + ai3 * b[7];
      dealList[i + 8] = ai0 * b[8] + ai1 * b[9] + ai2 * b[10] + ai3 * b[11];
      dealList[i + 12] = ai0 * b[12] + ai1 * b[13] + ai2 * b[14] + ai3 * b[15];
    }
  }
}