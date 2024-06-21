import { useEffect } from "react"
import Matrix4 from "./matrix4.js"

function initShader(gl: WebGL2RenderingContext): WebGLShader | null {
  let vsource = `
  attribute vec4 position;
  attribute vec4 color;
  uniform mat4 matrix;
  uniform mat4 matrix1;
  varying vec4 vcolor;
  void main() {
    gl_Position = matrix * matrix1 * position;
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
  0, .5, -.4, .4, 1, .4, .4,
  .5, .5, .4, .4, 1, .4, .4,
  .5, -.5, -.4, 1, .4, .4, .4,

  .5, .4, .2, 1, .4, .4, .4,
  -.5, .4, -.2, 1, 1, .4, .4,
  0, -.6, -.2, 1, 1, .4, .4,

  0, .5, 0, .4, .4, 1, .4,
  -.5, -.5, 0, .4, .4, 1, .4,
  .5, -.5, 0, 1, .4, .4, .4
], count: number = 7;

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
    let matrix1 = gl.getUniformLocation(program, 'matrix1')

    let matrix4 = new Matrix4()
    let angle = 60
    let dataList = new Float32Array(points)
    let dataSize = dataList.BYTES_PER_ELEMENT
    
    bindBuffer(gl, dataList)
    activeData(gl, dataSize, position, 3, count);
    activeData(gl, dataSize, color, 4, count, 3);
    matrix4.lookAt(.2, .25, .25, 0,0,0,0,1,0)
    matrix4.setRotate(angle, false, false, true)
    gl.uniformMatrix4fv(matrix, false, matrix4.elements)

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    gl.clearColor(1.0, 0.5, 0.3, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.TRIANGLES, 0, Math.floor(points.length / count))

    let eyePosition = {
      x: .2,
      y: .25,
      z: .25
    }, box = {
      near: 0,
      far: 2
    }
    document.addEventListener('keyup', function(event) {
      if (event.code === 'ArrowRight') {
        eyePosition.x += .02
        box.near += .01
      } else if (event.code === 'ArrowLeft') {
        eyePosition.x -= .02
        box.near -= .01
      } else if (event.code === 'ArrowDown') {
        eyePosition.y -= .02
        box.far += .01
      } else if (event.code === 'ArrowUp') {
        eyePosition.y += .02
        box.far -= .01
      }
      matrix4.lookAt(eyePosition.x, eyePosition.y, eyePosition.z, 0,0,0,0,1,0)
      gl.uniformMatrix4fv(matrix, false, matrix4.elements)
      matrix4.ortho(-1, 1, -1, 1, box.near, box.far)
      gl.uniformMatrix4fv(matrix1, false, matrix4.elements)
  
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