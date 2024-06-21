class Vector3 {
  elements: Float32Array

  constructor(data: Array<number>) {
    var v = new Float32Array(3);
    if (data.length === 3) {
      v[0] = data[0]; v[1] = data[1]; v[2] = data[2];
    }
    this.elements = v;
  }

  normalize() {
    var v = this.elements;
    var c = v[0], d = v[1], e = v[2], g = Math.sqrt(c * c + d * d + e * e);
    if (g) {
      if (g == 1)
        return this;
    } else {
      v[0] = 0; v[1] = 0; v[2] = 0;
      return this;
    }
    g = 1 / g;
    v[0] = c * g; v[1] = d * g; v[2] = e * g;
    return this;
  }
}

export {
  Vector3
}