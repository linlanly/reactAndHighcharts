import { useEffect } from "react"
import Matrix4 from "./matrix4.js"

function initShader(gl: WebGL2RenderingContext): WebGLShader | null {
  let vsource = `
  attribute vec4 position;
  attribute vec2 coord;
  varying vec2 vcoord;
  void main() {
    gl_Position = position;
    vcoord = coord;
  }`
  let fsource = `
  precision mediump float;
  varying vec2 vcoord;
  uniform sampler2D sampler;
  uniform sampler2D sampler1;
  void main() {
    vec4 color0 = texture2D(sampler, vcoord);
    vec4 color1 = texture2D(sampler1, vcoord);
    gl_FragColor = color0 * color1;
    // gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
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

function initTextures(gl: WebGL2RenderingContext, sampler: WebGLUniformLocation, imageName: string, order: number) {
  var texture = gl.createTexture()
  var image = new Image()
  image.onload = function () {
    loadTexture(gl, sampler, texture as WebGLTexture, image, order)
  }
  image.src = `/src/assets/images/${imageName}.png`
}

function loadTexture(gl: WebGL2RenderingContext, sampler: WebGLUniformLocation, texture: WebGLTexture, image: HTMLImageElement, order: number) {
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
  gl.activeTexture(gl[`TEXTURE${order}`])
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT)
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image)
  gl.uniform1i(sampler, order)
}

let points: Array<number> =
  [
    -0.5, 0.5, -0.3, 1.7,
    -.5, -0.5, -0.3, -0.2,
    .5, .5, 1.7, 1.7,
    .5, -.5, 1.7, -0.2
  ]
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
    let data = new Float32Array(points)
    let dataSize = data.BYTES_PER_ELEMENT
    let position = gl.getAttribLocation(program, 'position')
    let size = gl.getAttribLocation(program, 'coord')
    let uWidth = gl.getUniformLocation(program, 'sampler')
    let sampler1 = gl.getUniformLocation(program, 'sampler1')
    bindBuffer(gl, data)
    activeData(gl, dataSize, position, 2, 4);
    activeData(gl, dataSize, size, 2, 4, 2);
    initTextures(gl, uWidth as WebGLUniformLocation, 'gas', 0)
    initTextures(gl, sampler1 as WebGLUniformLocation, 'map', 1)

    setTimeout(() => {
      gl.clearColor(0.3, 0.5, 0.3, 1.0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }, 1000);
  }, [])
  return (
    <>
      <canvas id="webgl" width={500} height={500}></canvas>
    </>

  )
}