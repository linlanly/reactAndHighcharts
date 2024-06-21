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
  -.5, -.4, -0.5, 1, .4, .4,
  .5, -.4, -0.5, 1, 1, .4,
  0, .6, -0.5, 1, 1, .4,

  -.5, .5, -.3, .4, .4, 1,
  .5, .5, -.3, .4, .4, 1,
  0, -.5, -.3, 1, .4, .4,
  
  -.5, -.5, 0, .4, 1, .4,
  .5, -.5, 0, .4, 1, .4,
  0, .5, 0, 1, .4, .4

], count: number = 6;

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
    let dataList = new Float32Array(points)
    let dataSize = dataList.BYTES_PER_ELEMENT
    
    bindBuffer(gl, dataList)
    activeData(gl, dataSize, position, 3, count);
    activeData(gl, dataSize, color, 3, count, 3);

    let positionInfo = {
      near: 0,
      far: .5,
    }
    document.addEventListener('keyup', function(event) {
      if (event.code === 'ArrowRight') {
        positionInfo.near += .2
      } else if (event.code === 'ArrowLeft') {
        positionInfo.near -= .2
      } else if (event.code === 'ArrowDown') {
        positionInfo.far -= .2
      } else if (event.code === 'ArrowUp') {
        positionInfo.far += .2
      }
      matrix4.ortho(-.3, .3, -1, 1, positionInfo.near, positionInfo.far)
      gl.uniformMatrix4fv(matrix, false, matrix4.elements)
  
      gl.clearColor(1.0, 0.5, 0.3, 1.0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLES, 0, Math.floor(points.length / count))
    })
  }, [])
  return (
    <>
      <canvas id="webgl" width={500} height={500}></canvas>
    </>

  )
}