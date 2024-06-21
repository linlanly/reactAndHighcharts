import { useEffect } from "react"
import Matrix4 from "./matrix4.js"
import { Vector3 } from "./Vector.js"

function initShader(gl: WebGL2RenderingContext): WebGLShader | null {
  let vsource = `
  attribute vec4 position;
  attribute vec4 color;
  attribute vec4 setsomedata;
  uniform mat4 normalmatrix;
  uniform mat4 matrix;
  uniform vec3 lightd;
  uniform vec3 lightc;
  uniform vec3 envc;
  varying vec4 vcolor;
  void main() {
    gl_Position = matrix * position;
    vec3 normal = normalize(vec3(normalmatrix * setsomedata));
    float dotl = max(dot(lightd, normal), 0.0);
    vec3 diffuse = lightc * vec3(color) * dotl;
    vec3 ambient = envc * color.rgb;
    vcolor = vec4(diffuse + ambient, color.a);
  }`
  let fsource = `
  precision mediump float;
  varying vec4 vcolor;
  void main() {
    gl_FragColor = vcolor;
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

let sixColorPoints: Array<number> = 
[
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
let sixColor: Array<number> = new Array(24).fill(new Array(3).fill(1)).flat(1)

let indicesColor = 
new Uint8Array([
  0, 1, 2, 0, 2, 3,
  4, 5, 6, 4, 6, 7,
  8, 9, 10, 8, 10, 11,
  12, 13, 14, 12, 14, 15,
  16, 17, 18, 16, 18, 19,
  20, 21, 22, 20, 22, 23
])

let normals: Array<number> = [[0,0,1], [1,0,0], [0,1,0], [-1,0,0], [0,-1,0], [0,0,-1]].map(item => [...item, ...item, ...item, ...item]).flat(1)

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
    let setsomedata = gl.getAttribLocation(program, 'setsomedata')
    let matrix = gl.getUniformLocation(program, 'matrix')
    let lightd = gl.getUniformLocation(program, 'lightd')
    let lightc = gl.getUniformLocation(program, 'lightc')
    let envc = gl.getUniformLocation(program, 'envc')
    let normalmatrix = gl.getUniformLocation(program, 'normalmatrix')

    gl.uniform3f(lightc, 1.0, 0, 0)
    gl.uniform3f(envc, .2, .2, .2)

    let lightDirection = new Vector3([0.5, 3, 4])
    lightDirection.normalize()
    gl.uniform3fv(lightd, lightDirection.elements)

    let matrix4 = new Matrix4()
    let dataList = new Float32Array(sixColorPoints)
    let dataSize = dataList.BYTES_PER_ELEMENT
    let normalMa4 = new Matrix4()
    let modealMa4 = new Matrix4()

    bindBuffer(gl, dataList, gl.ARRAY_BUFFER)
    activeData(gl, dataSize, position, 3);
    
    bindBuffer(gl, new Float32Array(sixColor), gl.ARRAY_BUFFER)
    activeData(gl, dataSize, color, 3);

    bindBuffer(gl, new Float32Array(normals), gl.ARRAY_BUFFER)
    activeData(gl, dataSize, setsomedata, 3);

    modealMa4.translate(0, 1, 0)
    modealMa4.setRotate(90, false, true, true)
    matrix4.lookAt(.15, .15, -.35, 0,0,0,0,2,0)
    matrix4.multiply(modealMa4)
    gl.uniformMatrix4fv(matrix, false, matrix4.elements)

    normalMa4.setInverseOf(modealMa4)
    normalMa4.transpose()
    gl.uniformMatrix4fv(normalmatrix, false, normalMa4.elements)

    bindBuffer(gl, indicesColor, gl.ELEMENT_ARRAY_BUFFER)

    gl.clearColor(1.0, 0.5, 0.3, 1.0)
    gl.enable(gl.DEPTH_TEST)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_BYTE, 0)
  }, [])
  return (
    <>
      <canvas id="webgl" width={500} height={500}></canvas>
    </>

  )
}