import { useEffect } from "react"
import Matrix4 from "./matrix4.js"

function initShader(gl: WebGL2RenderingContext): WebGLShader | null {
  let vsource = `
  attribute vec4 position;
  attribute vec4 color;
  uniform mat4 matrix;
  varying vec4 vcolor;
  void main() {
    gl_Position = matrix * position;
    vcolor = color;
  }`
  let fsource = `
  precision mediump float;
  varying vec4 vcolor;
  void main() {
    gl_FragColor = vec4(vcolor.rgb, 0.4);
  }`
  let vshader: WebGLShader | null = gl.createShader(gl.VERTEX_SHADER)
  if (!vshader) {
    console.log('VERTEX_SHADER create error');
    return null
  }
  let fshader: WebGLShader | null = gl.createShader(gl.FRAGMENT_SHADER)
  if (!fshader) {
    console.log('FRAGMENT_SHADER create error');
    return null
  }
  gl.shaderSource(vshader, vsource)
  gl.compileShader(vshader)
  gl.shaderSource(fshader, fsource)
  gl.compileShader(fshader)
  var program: WebGLProgram | null = gl.createProgram();
  if (!program) {
    console.log('WebGLProgram create error');
    return null
  }
  gl.attachShader(program, vshader);
  gl.attachShader(program, fshader);
  gl.linkProgram(program)
  gl.useProgram(program)
  return program
}

function bindBuffer(gl: WebGL2RenderingContext, data: Float32Array | Uint8Array, type: any) {
  let buffer = gl.createBuffer()
  gl.bindBuffer(type, buffer)
  gl.bufferData(type, data, gl.STATIC_DRAW)
}


function activeData(gl: WebGL2RenderingContext, size: number, attrib: any, count: number, arrNumber: number = 0, offset: number = 0) {
  gl.vertexAttribPointer(attrib, count, gl.FLOAT, false, arrNumber * size, offset * size)
  gl.enableVertexAttribArray(attrib)
}


let points: Array<number> = [
  .5, .5, .5, 1, 1, 1,
  -.5, .5, .5, 1, 0, 1,
  -.5, -.5, .5, 1, 0, 0,
  .5, -.5, .5, 1, 1, 0,
  .5, -.5, -.5, 0, 1, 0,
  .5, .5, -.5, 0, 1, 1,
  -.5, .5, -.5, 0, 0, 1,
  -.5, -.5, -.5, 0, 0, 0,
], count: number = 6;

let indices = new Uint8Array([
  0, 1, 2, 0, 2, 3,
  0, 3, 4, 0, 4, 5,
  0, 5, 6, 0, 6, 1,
  1, 6, 7, 1, 7, 2,
  7, 4, 3, 7, 3, 2,
  4, 7, 6, 4, 6, 5
])

let colorPoints: Array<number> = [
  .5, .5, .5, 1, 1, 1,
  -.5, .5, .5, 1, 1, 1,
  -.5, -.5, .5, 1, 1, 1,
  .5, -.5, .5, 1, 1, 1,
  .5, .5, .5, 1, 0, 1,
  .5, -.5, .5, 1, 0, 1,
  .5, -.5, -.5, 1, 0, 1,
  .5, .5, -.5, 1, 0, 1,
  .5, .5, .5, 1, 0, 0,
  .5, .5, -.5, 1, 0, 0,
  -.5, .5, -.5, 1, 0, 0,
  -.5, .5, .5, 1, 0, 0,
  -.5, .5, .5, 0, 0, 1,
  -.5, .5, -.5, 0, 0, 1,
  -.5, -.5, -.5, 0, 0, 1,
  -.5, -.5, .5, 0, 0, 1,
  -.5, -.5, -.5, 0, 0, 0,
  .5, -.5, -.5, 0, 0, 0,
  .5, -.5, .5, 0, 0, 0,
  -.5, -.5, .5, 0, 0, 0,
  .5, -.5, -.5, 0, 1, 0,
  -.5, -.5, -.5, 0, 1, 0,
  -.5, .5, -.5, 0, 1, 0,
  .5, .5, -.5, 0, 1, 0,
]

let singleColor: Array<number> = [
  .5, .5, .5, 1, 1, 1,
  -.5, .5, .5, 1, 1, 1,
  -.5, -.5, .5, 1, 1, 1,
  .5, -.5, .5, 1, 1, 1,
  .5, .5, .5, 1, 1, 1,
  .5, -.5, .5, 1, 1, 1,
  .5, -.5, -.5, 1, 1, 1,
  .5, .5, -.5, 1, 1, 1,
  .5, .5, .5, 1, 1, 1,
  .5, .5, -.5, 1, 1, 1,
  -.5, .5, -.5, 1, 1, 1,
  -.5, .5, .5, 1, 1, 1,
  -.5, .5, .5, 1, 1, 1,
  -.5, .5, -.5, 1, 1, 1,
  -.5, -.5, -.5, 1, 1, 1,
  -.5, -.5, .5, 1, 1, 1,
  -.5, -.5, -.5, 1, 1, 1,
  .5, -.5, -.5, 1, 1, 1,
  .5, -.5, .5, 1, 1, 1,
  -.5, -.5, .5, 1, 1, 1,
  .5, -.5, -.5, 1, 1, 1,
  -.5, -.5, -.5, 1, 1, 1,
  -.5, .5, -.5, 1, 1, 1,
  .5, .5, -.5, 1, 1, 1,
]

let sixColorPoints: Array<number> = [
  .5, .5, .5,
  -.5, .5, .5,
  -.5, -.5, .5,
  .5, -.5, .5,
  .5, .5, .5,
  .5, -.5, .5,
  .5, -.5, -.5,
  .5, .5, -.5,
  .5, .5, .5,
  .5, .5, -.5,
  -.5, .5, -.5,
  -.5, .5, .5,
  -.5, .5, .5,
  -.5, .5, -.5,
  -.5, -.5, -.5,
  -.5, -.5, .5,
  -.5, -.5, -.5,
  .5, -.5, -.5,
  .5, -.5, .5,
  -.5, -.5, .5,
  .5, -.5, -.5,
  -.5, -.5, -.5,
  -.5, .5, -.5,
  .5, .5, -.5,
]
let sixColor: Array<number> = [
  1, 1, 1,
  1, 1, 1,
  1, 1, 1,
  1, 1, 1,
  1, 0, 1,
   1, 0, 1,
  1, 0, 1,
  1, 0, 1,
  1, 0, 0,
  1, 0, 0,
  -1, 0, 0,
  -1, 0, 0,
  -0, 0, 1,
  -0, 0, 1,
  -0, 0, 1,
  - 0, 0, 1,
  -0, 0, 0,
  0, 0, 0,
   0, 0, 0,
  - 0, 0, 0,
  0, 1, 0,
  -0, 1, 0,
  -0, 1, 0,
  0, 1, 0,
]


let indicesColor = new Uint8Array([
  0, 1, 2, 0, 2, 3,
  4, 5, 6, 4, 6, 7,
  8, 9, 10, 8, 10, 11,
  12, 13, 14, 12, 14, 15,
  16, 17, 18, 16, 18, 19,
  20, 21, 22, 20, 22, 23
])

export default function baseContent() {
  useEffect(() => {
    var canvas = document.getElementById('webgl')
    var gl: WebGL2RenderingContext = canvas?.getContext('webgl')
    if (!gl) {
      return
    }
    let program = initShader(gl)
    if (!program) {
      return
    }
    let position = gl.getAttribLocation(program, 'position')
    let color = gl.getAttribLocation(program, 'color')
    let matrix = gl.getUniformLocation(program, 'matrix')

    let matrix4 = new Matrix4()
    let dataList = new Float32Array(sixColorPoints)
    let dataSize = dataList.BYTES_PER_ELEMENT
    
    bindBuffer(gl, dataList, gl.ARRAY_BUFFER)
    activeData(gl, dataSize, position, 3);
    
    bindBuffer(gl, new Float32Array(sixColor), gl.ARRAY_BUFFER)
    activeData(gl, dataSize, color, 3);

    matrix4.lookAt(.15, .15, .15, 0,0,0,0,-2,0)
    gl.uniformMatrix4fv(matrix, false, matrix4.elements)

    bindBuffer(gl, indicesColor, gl.ELEMENT_ARRAY_BUFFER)

    gl.clearColor(1.0, 0.5, 0.3, 1.0)
    gl.enable(gl.DEPTH_TEST)
    gl.clear(gl.COLOR_BUFFER_BIT)

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    // gl.drawElements(gl.TRIANGLES, Math.floor(points.length / count), gl.UNSIGNALED, 0)
    
    // gl.drawArrays(gl.TRIANGLES, 0, Math.floor(points.length / count))
    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_BYTE, 0)
  }, [])
  return (
    <>
      <canvas id="webgl" width={500} height={500}></canvas>
    </>

  )
}