import { useEffect } from "react"
import Matrix4 from "./matrix4.js"

function initShader(gl: WebGL2RenderingContext): WebGLShader | null {
  let vsource = `
  attribute vec4 position;
  uniform mat4 uInfo;
  void main() {
    gl_Position = uInfo * position;
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

let points: Array<number> = [0, 0, .6, 0, .4, .3], count: number = 2;

let angleStep = 45, currentAngle = 0, translateX = 0, lastTime = Date.now()
function tick(gl: WebGL2RenderingContext, alocs: Matrix4, uname: WebGLUniformLocation) {
  function drawBefore() {
    changeAngle()
    draw(gl, alocs, uname)
    requestAnimationFrame(drawBefore)
  }
  drawBefore()
}

function changeAngle() {
  let now = Date.now()
  let elapsed = now - lastTime
  lastTime = now
  let newAngle = currentAngle + (angleStep * elapsed) / 1000.0
  currentAngle = newAngle %= 360
}

function draw(gl: WebGL2RenderingContext, alocs: Matrix4, uname: WebGLUniformLocation) {
  let newTranslate = translateX + 0.004
  translateX = translateX > 1 ? -1 : newTranslate
  alocs.rotate(currentAngle, false, false, true)
  alocs.setTranslate(translateX, 0, 0)
  gl.uniformMatrix4fv(uname, false, alocs.elements)
  // gl.clear(gl.COLOR_BUFFER_BIT)
  gl.drawArrays(gl.TRIANGLES, 0, 3)
}

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
    let uInfo = gl.getUniformLocation(program, 'uInfo')
    bindBuffer(gl, new Float32Array(points), position, count)
    let matrix4 = new Matrix4()
    tick(gl, matrix4, uInfo)
  }, [])
  return (
    <>
      <canvas id="webgl" width={500} height={500}></canvas>
    </>

  )
}