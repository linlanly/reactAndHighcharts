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
  rotate(angle: number, x: boolean, y: boolean, z: boolean) {
    let radian = angle * Math.PI / 180
    let sinD = Math.sin(radian)
    let cosD = Math.cos(radian)
    this.elements = new Float32Array([
      y || z ? cosD : 1, z ? sinD : 0, y ? sinD : 0, 0,
      z ? -sinD : 0, x || z ? cosD : 1, x ? -sinD : 0, 0,
      y ? -sinD : 0, x ? sinD : 0, x || y ? cosD : 1, 0,
      0, 0, 0, 1])
  }
  translate(x: number, y: number, z: number) {
    this.elements = new Float32Array([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      x, y, z, 1
    ])
  }
  scale(x: number, y: number, z: number) {
    this.elements = new Float32Array([
      x, 0, 0, 0,
      0, y, 0, 0,
      0, 0, z, 0,
      0, 0, 0, 1
    ])
  }
  setRotate(angle: number, x: boolean, y: boolean, z: boolean) {
    let radian = angle * Math.PI / 180
    let sinD = Math.sin(radian)
    let cosD = Math.cos(radian)
    let translate = [
      [y || z ? cosD : 1, z ? sinD : 0, y ? sinD : 0, 0],
      [z ? -sinD : 0, x || z ? cosD : 1, x ? -sinD : 0, 0],
      [y ? -sinD : 0, x ? sinD : 0, x || y ? cosD : 1, 0],
      [0, 0, 0, 1]]
    let dataList = this.changeElements(translate)
    if (dataList) {
      this.elements = dataList
    }
  }
  setScale(x: number, y: number, z: number) {
    let translate = [
      [x, 0, 0, 0],
      [0, y, 0, 0],
      [0, 0, z, 0],
      [0, 0, 0, 1]
    ]
    let dataList = this.changeElements(translate)
    if (dataList) {
      this.elements = dataList
    }
  }
  setTranslate(x: number, y: number, z: number) {
    let translate = [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [x, y, z, 1]
    ]
    let dataList = this.changeElements(translate)
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
      for(let j = 0; j < size; j++) {
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
    for(let i = 0; i < size; i++) {
      for(let j = 0; j < size; j++) {
        dealList.push(result[j][i])
      }
    }
    return new Float32Array(dealList)
  }
}