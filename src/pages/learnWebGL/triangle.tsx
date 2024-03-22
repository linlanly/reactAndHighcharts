import { useEffect } from "react"
import Matrix4 from "./matrix4.js"

function initShader(gl: WebGL2RenderingContext): WebGLShader | null {
  let vsource = `
  attribute vec4 position;
  uniform vec4 translation;
  uniform vec2 angle;
  uniform mat4 mangle;
  uniform mat4 mtranslation;
  uniform mat4 mscale;
  void main() {
    // gl_Position = position + translation;
    // gl_Position = vec4(position.x * angle.y - position.y * angle.x, position.x * angle.x + position.y * angle.y, position.z, position.w);
    // gl_Position = mangle * position;
    // gl_Position = mtranslation * position;
    // gl_Position = mscale * position;
    gl_Position = position;
  }`
  let fsource = `
  void main() {
    gl_FragColor = vec4(1.0, 0.5, 0.5, 1.0);
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

function bindBuffer(gl: WebGL2RenderingContext, data: Float32Array, attrib: any, count: number) {
  let size = data.BYTES_PER_ELEMENT
  let buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
  gl.vertexAttribPointer(attrib, count, gl.FLOAT, false, 0, 0)
  gl.enableVertexAttribArray(attrib)
}

let points: Array<number> = [0, 0, .6, 0, .4, .3, .2, .4], count: number = 2;

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
    let translation = gl.getUniformLocation(program, 'translation')
    let rotate = gl.getUniformLocation(program, 'angle')
    let mangle = gl.getUniformLocation(program, 'mangle')
    let mtranslation = gl.getUniformLocation(program, 'mtranslation')
    let mscale = gl.getUniformLocation(program, 'mscale')

    let matrix4 = new Matrix4()
    let angle = 60
    let redian = angle * Math.PI / 180

    // bindBuffer(gl, new Float32Array(points), position, count)
    // gl.uniform4f(translation, -.3, -.4, 0.0, 0.0)
    // gl.uniform2f(rotate, Math.sin(redian), Math.cos(redian))
    // gl.uniformMatrix4fv(mangle, false, matrix4.elements)
    // matrix4.translate(.2, -.8, .5)
    // gl.uniformMatrix4fv(mtranslation, false, matrix4.elements)
    // matrix4.scale(1.2, 1.4, .6)
    // gl.uniformMatrix4fv(mscale, false, matrix4.elements)

    matrix4.setData(new Float32Array([0, 0, 0, 1, .6, 0, 0, 1, .4, .3, 0, 1, .2, .4, 0, 1]))
    matrix4.setRotate(angle, true, false, true)
    matrix4.setTranslate(-.4, 0, 0)
    matrix4.setScale(0.8, 1.2, 1.4)
    bindBuffer(gl, matrix4.elements, position, 4)


    gl.clearColor(1.0, 0.5, 0.3, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.TRIANGLE_FAN, 0, Math.floor(points.length / count))
  }, [])
  return (
    <>
      <canvas id="webgl" width={500} height={500}></canvas>
    </>

  )
}