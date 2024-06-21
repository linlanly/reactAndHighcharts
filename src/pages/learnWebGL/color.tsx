import { useEffect } from "react"
import Matrix4 from "./matrix4.js"

function initShader(gl: WebGL2RenderingContext): WebGLShader | null {
  let vsource = `
  attribute vec4 position;
  attribute float size;
  attribute vec4 color;
  varying vec4 vColor;
  void main() {
    gl_Position = position;
    gl_PointSize = size;
    vColor = color;
  }`
  let fsource = `
  precision mediump float;
  varying vec4 vColor;
  uniform float uWidth;
  uniform float uHeight;
  void main() {
    gl_FragColor = vec4( 0.0, gl_FragCoord.x / uWidth, gl_FragCoord.y/uHeight,1.0);
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

function bindBuffer(gl: WebGL2RenderingContext, data: Float32Array) {
  let buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
}

function activeData(gl: WebGL2RenderingContext, size: number, attrib: any, count: number, arrNumber: number = 0, offset: number = 0) {
  gl.vertexAttribPointer(attrib, count, gl.FLOAT, false, arrNumber * size, offset * size)
  gl.enableVertexAttribArray(attrib)
}

let points: Array<number> = [
  0, 0, 10, 1, 0, 0,
  .6, 0, 20, 0, 1, 0,
  .4, .3, 30, 0, 0, 1]
let count: number = 3;

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
    let data =  new Float32Array(points)
    let dataSize = data.BYTES_PER_ELEMENT
    let position = gl.getAttribLocation(program, 'position')
    let size = gl.getAttribLocation(program, 'size')
    let color = gl.getAttribLocation(program, 'color')
    let uWidth = gl.getUniformLocation(program, 'uWidth')
    let uHeight = gl.getUniformLocation(program, 'uHeight')
    gl.uniform1f(uWidth, gl.drawingBufferWidth)
    gl.uniform1f(uHeight, gl.drawingBufferHeight)
    bindBuffer(gl, data)
    activeData(gl, dataSize, position, 2, 6);
    activeData(gl, dataSize, size, 1, 6, 2);
    activeData(gl, dataSize, color, 3, 6, 3);
    gl.clearColor(0.3, 0.5, 0.3, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.TRIANGLES, 0, points.length / count)
  }, [])
  return (
    <>
      <canvas id="webgl" width={500} height={500}></canvas>
    </>

  )
}