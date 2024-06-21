import { useEffect } from "react"
import Matrix4 from "./cuon-matrix.js";

function initShader(gl: WebGLRenderingContext): WebGLShader | null {
  let vsource = `
    attribute vec4 a_position;
    attribute vec2 a_texcoord;
    uniform mat4 u_mvpMatrix;
    varying vec2 v_texcoord;
    void main() {
      gl_Position = u_mvpMatrix * a_position;
      v_texcoord = a_texcoord;
    }`
  let fsource = `
  precision mediump float;
  varying vec2 v_texcoord;
  uniform sampler2D sampler;
  void main() {
    gl_FragColor = texture2D(sampler, v_texcoord);
  }
  `
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
  if (!gl.getShaderParameter(vshader, gl.COMPILE_STATUS)) {
    let error = gl.getShaderInfoLog(vshader)
    console.log('VERTEX_SHADER compile error：' + error)
  }
  gl.shaderSource(fshader, fsource)
  gl.compileShader(fshader)
  if (!gl.getShaderParameter(fshader, gl.COMPILE_STATUS)) {
    let error = gl.getShaderInfoLog(fshader)
    console.log('FRAGMENT_SHADER compile error：' + error)
  }
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

function bindBuffer(gl: WebGLRenderingContext, data: Float32Array | Uint8Array, type: any) {
  let buffer = gl.createBuffer()
  gl.bindBuffer(type, buffer)
  gl.bufferData(type, data, gl.STATIC_DRAW)
  return buffer
}

function activeData(gl: WebGLRenderingContext, attrib: any, count: number, type: any = gl.FLOAT,arrNumber: number = 0, offset: number = 0) {
  gl.vertexAttribPointer(attrib, count, type, false, arrNumber, offset)
  gl.enableVertexAttribArray(attrib)
}
function initVertexBufferOfCube(gl: WebGLRenderingContext) {
  let vertices = new Float32Array([
    1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0,    // v0-v1-v2-v3 front
    1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0,    // v0-v3-v4-v5 right
    1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0,    // v0-v5-v6-v1 up
    -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0,    // v1-v6-v7-v2 left
    -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,    // v7-v4-v3-v2 down
    1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0     // v4-v7-v6-v5 back
  ])
  let texCoords = new Float32Array([
    1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,    // v0-v1-v2-v3 front
    0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0,    // v0-v3-v4-v5 right
    1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0,    // v0-v5-v6-v1 up
    1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,    // v1-v6-v7-v2 left
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,    // v7-v4-v3-v2 down
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0     // v4-v7-v6-v5 back
  ]);

  let indices = new Uint8Array([
    0, 1, 2, 0, 2, 3,    // front
    4, 5, 6, 4, 6, 7,    // right
    8, 9, 10, 8, 10, 11,    // up
    12, 13, 14, 12, 14, 15,    // left
    16, 17, 18, 16, 18, 19,    // down
    20, 21, 22, 20, 22, 23     // back
  ]);
  return {
    points: bindBuffer(gl, vertices, gl.ARRAY_BUFFER),
    texcoords: bindBuffer(gl, texCoords, gl.ARRAY_BUFFER),
    indices: bindBuffer(gl, indices, gl.ELEMENT_ARRAY_BUFFER),
    length: indices.length
  }
}


function initVertexBufferOfPlane(gl: WebGLRenderingContext) {
  let vertices = new Float32Array([
    1.0, 1.0, 0.0, -1.0, 1.0, 0.0, -1.0, -1.0, 0.0, 1.0, -1.0, 0.0
  ])
  let texCoords = new Float32Array([
    1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0
  ]);

  let indices = new Uint8Array([
    0, 1, 2, 0, 2, 3
  ]);
  return {
    points: bindBuffer(gl, vertices, gl.ARRAY_BUFFER),
    texcoords: bindBuffer(gl, texCoords, gl.ARRAY_BUFFER),
    indices: bindBuffer(gl, indices, gl.ELEMENT_ARRAY_BUFFER),
    length: indices.length
  }
}

function initTextures(gl: WebGLRenderingContext, program: WebGLProgram) {
  let texture = gl.createTexture()
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }
  let u_sampler = gl.getUniformLocation(program, 'u_sampler')
  if (u_sampler) {
    console.log('Failed to get the storage location of u_sampler');
    return false;
  }

  let image = new Image()
  image.onload = function () {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
    gl.uniform1i(u_sampler, 0)

    // gl.bindTexture(gl.TEXTURE_2D, null)
  }
  image.onerror = function () {
    console.log('load image failed')
  }
  image.src = '/src/assets/images/map.png'
  return texture
}

let offsetscreen_width = 256, offsetscreen_height = 256;
function initFrameBufferObject(gl: WebGLRenderingContext) {
  let frameBuffer: WebGLFramebuffer | null, texture: WebGLTexture | null, depthBuffer: WebGLRenderbuffer | null;

  let error = function () {
    if (frameBuffer) gl.deleteFramebuffer(frameBuffer);
    if (texture) gl.deleteTexture(texture);
    if (depthBuffer) gl.deleteRenderbuffer(depthBuffer)
    return null
  }

  frameBuffer = gl.createFramebuffer()
  if (!frameBuffer) {
    console.log('failed to create frame buffer object.')
    return error()
  }

  texture = gl.createTexture()
  if (!texture) {
    console.log('failed to create texture object.')
    return error()
  }
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, offsetscreen_width, offsetscreen_height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)

  depthBuffer = gl.createRenderbuffer()
  if (!depthBuffer) {
    console.log('failed to create renderbuffer object')
    return error()
  }
  gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer)
  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, offsetscreen_width, offsetscreen_height)

  gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer)

  let e = gl.checkFramebufferStatus(gl.FRAMEBUFFER)
  if (gl.FRAMEBUFFER_COMPLETE !== e) {
    console.log('frame buffer object is incomplete: ' + e.toString())
    return error()
  }

  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  gl.bindTexture(gl.TEXTURE_2D, null)
  gl.bindRenderbuffer(gl.RENDERBUFFER, null)

  return {
    frameBuffer,
    texture
  }
}

let ANGLE_STEP = 30, last = Date.now()
function animate(angle: number) {
  let now = Date.now()
  let elapsed = now - last;
  last = now;
  let newAngle = angle + elapsed * ANGLE_STEP / 1000;
  return newAngle % 360;
}

function draw(gl: WebGLRenderingContext, program: any, canvas: HTMLCanvasElement, fbo: any, planeBuffer: any, cubeBuffer: any, angle: number, texture: WebGLTexture, viewProjMatrix: Matrix4, viewProjMatrixFBO: Matrix4) {
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo.frameBuffer)
  gl.viewport(0, 0, offsetscreen_width, offsetscreen_height)

  gl.clearColor(.2, .2, .4, 1)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  drawTextureCube(gl, program, cubeBuffer, angle, texture, viewProjMatrixFBO)

  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  gl.viewport(0, 0, canvas.clientWidth, canvas.clientHeight)

  gl.clearColor(0, 0, 0, 1)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  drawTexturePlane(gl, program, planeBuffer, angle, fbo.texture, viewProjMatrix)
}

let g_modelMatrix = new Matrix4()
let g_mvpMatrix = new Matrix4()

function drawTextureCube(gl: WebGLRenderingContext, program: any, planeBuffer: any, angle: number, texture: WebGLTexture, viewProjMatrix: Matrix4) {
  g_modelMatrix.setRotate(20, 1, 0, 0)
  g_modelMatrix.rotate(angle, 0, 1, 0)
  g_modelMatrix.scale(.5, .5, .5)

  g_mvpMatrix.set(viewProjMatrix)
  g_mvpMatrix.multiply(g_modelMatrix)
  gl.uniformMatrix4fv(program.u_mvpMatrix, false, g_mvpMatrix.elements)

  drawTexturedObject(gl, program, planeBuffer, texture)
}

function drawTexturePlane(gl: WebGLRenderingContext, program: any, bufferList: any, angle: number, texture: WebGLTexture, viewProjMatrix: Matrix4) {
  g_modelMatrix.setTranslate(0, 0, 1)
  g_modelMatrix.setRotate(20, 1, 0, 0)
  g_modelMatrix.rotate(angle, 0, 1, 0)

  g_mvpMatrix.set(viewProjMatrix)
  g_mvpMatrix.multiply(g_modelMatrix)
  gl.uniformMatrix4fv(program.u_mvpMatrix, false, g_mvpMatrix.elements)

  drawTexturedObject(gl, program, bufferList, texture)
}
function drawTexturedObject(gl: WebGLRenderingContext, program: any, planeBuffer: any, texture: WebGLTexture) {
  gl.bindBuffer(gl.ARRAY_BUFFER, planeBuffer.points)
  activeData(gl, program.a_position, 3)

  gl.bindBuffer(gl.ARRAY_BUFFER, planeBuffer.texcoords)
  activeData(gl, program.a_texCoord, 2)

  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, texture)

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, planeBuffer.indices)
  console.log('sho da', planeBuffer, planeBuffer.length)

  gl.drawElements(gl.TRIANGLES, planeBuffer.length, gl.UNSIGNED_BYTE, 0)
}
export default function baseContent() {
  useEffect(() => {
    var canvas = document.getElementById('webgl')
    if (!canvas) return;
    var glbefore: WebGLRenderingContext | null = (canvas as HTMLCanvasElement).getContext('webgl')
    if (!glbefore) {
      return
    }
    let gl = glbefore as WebGLRenderingContext
    let programBefore = initShader(gl)
    if (!programBefore) {
      return
    }

    let program = {
      program: programBefore as WebGLProgram,
      a_position: gl.getAttribLocation(programBefore, 'a_position'),
      a_texCoord: gl.getAttribLocation(programBefore, 'a_texcoord'),
      u_mvpMatrix: gl.getUniformLocation(programBefore, 'u_mvpMatrix')
    }

    if (program.a_position < 0 || program.a_texCoord < 0 || !program.u_mvpMatrix) {
      console.log('failed to get the storage location of attribute or uniform.')
      return
    }

    let cubeBuffer = initVertexBufferOfCube(gl)
    let planeBuffer = initVertexBufferOfPlane(gl)
    if (!cubeBuffer || !planeBuffer) {
      console.log('failed to set th vertex information')
      return
    }

    let texture = initTextures(gl, programBefore)
    if (!texture) {
      console.log('failed to intialize the texture.')
      return
    }

    let fbo = initFrameBufferObject(gl)
    if (!fbo) {
      console.log('failed to intialize the framebuffer object (FBO).')
      return
    }

    gl.enable(gl.DEPTH_TEST)

    let viewProjMatrix = new Matrix4()
    viewProjMatrix.setPerspective(30, canvas.clientWidth / canvas.clientHeight, 1, 200)
    viewProjMatrix.lookAt(0, 0, 7, 0, 0, 0, 0, 1, 0)

    let viewProjMatrixFBO = new Matrix4()
    viewProjMatrix.setPerspective(30, offsetscreen_width / offsetscreen_height, 1, 100)
    viewProjMatrix.lookAt(0, 2, 7, 0, 0, 0, 0, 1, 0)

    let currentAngle = 0;
    let tick = function () {
      currentAngle = animate(currentAngle)
      draw(gl, program, canvas as HTMLCanvasElement, fbo, planeBuffer, cubeBuffer, currentAngle, texture, viewProjMatrix, viewProjMatrixFBO)
      window.requestAnimationFrame(tick)
    }
    tick()
  }, [])
  return (
    <>
      <canvas id="webgl" width={500} height={500}></canvas>
    </>

  )
}