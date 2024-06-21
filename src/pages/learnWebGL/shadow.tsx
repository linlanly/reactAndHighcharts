import { text } from "node:stream/consumers";
import { getKey } from "ol/tilecoord.js";
import { useEffect } from "react"
import Matrix4 from "./cuon-matrix.js";
interface frameBufferObject {
  frameBuffer: WebGLFramebuffer,
  texture: WebGLTexture
}

interface bufferListObject{
  points: WebGLBuffer | null,
  colors: WebGLBuffer | null,
  indices: WebGLBuffer | null,
  length: number
}

let SHADOW_VSHADER_SOURCE = `
  attribute vec4 a_position;
  uniform mat4 u_mvpMatrix;
  void main() {
    gl_Position = u_mvpMatrix * a_position;
  }`

let SHADOW_FSHADER_SOURCE = `
  #ifdef GL_ES
  precision mediump float;
  #endif
  void main() {
    // gl_FragColor = vec4(gl_FragCoord.z, 0.0, 0.0, 0.0);
    const vec4 bitShift = vec4(1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0);
    const vec4 bitMask = vec4(1.0 / 256.0, 1.0 / 256.0, 1.0 / 256.0, 0.0);
    vec4 rgbaDepth = fract(gl_FragCoord.z * bitShift);
    rgbaDepth -= rgbaDepth.gbaa * bitMask;
    gl_FragColor = rgbaDepth;
  }`

let VSHADER_SOURCE = `
  attribute vec4 a_position;
  attribute vec4 a_color;
  uniform mat4 u_mvpMatrix;
  uniform mat4 u_mvpMatrixFromLight;
  varying vec4 v_positionFromLight;
  varying vec4 v_color;
  void main() {
    gl_Position = u_mvpMatrix * a_position;
    v_positionFromLight = u_mvpMatrixFromLight * a_position;
    v_color = a_color;
  }`
let FSHADER_SOURCE = `
  #ifdef GL_ES
  precision mediump float;
  #endif
  uniform sampler2D u_shadowMap;
  varying vec4 v_positionFromLight;
  varying vec4 v_color;

  float unpackDepth(const in vec4 rgbaDepth) {
    const vec4 bitShift = vec4(1.0, 1.0 / 256.0, 1.0 / (256.0 * 256.0), 1.0 / (256.0 * 256.0 * 256.0));
    float depth = dot(rgbaDepth, bitShift);
    return depth;
  }

  void main() {
    vec3 shadowCoord = (v_positionFromLight.xyz / v_positionFromLight.w) / 2.0 + 0.5;
    vec4 rgbaDepth = texture2D(u_shadowMap, shadowCoord.xy);
    // float depth = rgbaDepth.r;
    float depth = unpackDepth(rgbaDepth);
    float visibility = (shadowCoord.z > depth + 0.0015) ? 0.7 : 1.0;
    gl_FragColor = vec4(v_color.rgb * visibility, v_color.a);
  }`
function createProgram(gl: WebGLRenderingContext, vsource: string, fsource: string): WebGLProgram | null {
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
  return program
}

function bindBuffer(gl: WebGLRenderingContext, data: Float32Array | Uint8Array, type: any = gl.ARRAY_BUFFER) {
  let buffer = gl.createBuffer()
  gl.bindBuffer(type, buffer)
  gl.bufferData(type, data, gl.STATIC_DRAW)
  return buffer
}

function activeData(gl: WebGLRenderingContext, attrib: any, count: number, type: any = gl.FLOAT,arrNumber: number = 0, offset: number = 0) {
  gl.vertexAttribPointer(attrib, count, type, false, arrNumber, offset)
  gl.enableVertexAttribArray(attrib)
}
let offsetscreen_width = 2048, offsetscreen_height = 2048;
let light_x = 0, light_y = 40, light_z = 2;

function initVertexBuffersForTriangle(gl: WebGLRenderingContext): bufferListObject {
  let vertices = new Float32Array([-0.8, 3.5, 0.0,  0.8, 3.5, 0.0,  0.0, 3.5, 1.8])
  let color = new Float32Array([1.0, 0.5, 0.0,  1.0, 0.5, 0.0,  1.0, 0.0, 0.0])
  let indices = new Uint8Array([0, 1, 2])
  return {
    points: bindBuffer(gl, vertices),
    colors: bindBuffer(gl, color),
    indices: bindBuffer(gl, indices, gl.ELEMENT_ARRAY_BUFFER),
    length: indices.length
  }
}

function initVertexBufferOfPlane(gl: WebGLRenderingContext): bufferListObject {
  let vertices = new Float32Array([3.0, -1.7, 2.5,  -3.0, -1.7, 2.5,  -3.0, -1.7, -2.5,   3.0, -1.7, -2.5])
  let color = new Float32Array([1.0, 1.0, 1.0,    1.0, 1.0, 1.0,  1.0, 1.0, 1.0,   1.0, 1.0, 1.0])
  let indices = new Uint8Array([0, 1, 2,   0, 2, 3])
  return {
    points: bindBuffer(gl, vertices),
    colors: bindBuffer(gl, color),
    indices: bindBuffer(gl, indices, gl.ELEMENT_ARRAY_BUFFER),
    length: indices.length
  }
}

function initFrameBufferObject(gl: WebGLRenderingContext): frameBufferObject | null {
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
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, offsetscreen_width, offsetscreen_height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)

  depthBuffer = gl.createRenderbuffer()
  if (!depthBuffer) {
    console.log('failed to create renderbuffer object.')
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
  return {
    frameBuffer,
    texture
  }
}

let ANGLE_STEP = 40
let last = Date.now()
function animate(angle: number) {
  let now = Date.now()
  let elapsed = now - last
  last = now
  let newAngle = angle + (elapsed * ANGLE_STEP) / 1000;
  return newAngle % 360
}

let g_modelMatrix = new Matrix4()
let g_mvpMatrix = new Matrix4()
function drawTriangle(gl: WebGLRenderingContext, program: any, bufferList: bufferListObject, angle: number, viewProjMatrix: Matrix4) {
  g_modelMatrix.setRotate(angle, 0, 1, 1)
  draw(gl, program, bufferList, viewProjMatrix)
}

function drawPlane(gl: WebGLRenderingContext, program: any, bufferList: bufferListObject, viewProjMatrix: Matrix4) {
  g_modelMatrix.setRotate(-45, 0, 1, 1)
  draw(gl, program, bufferList, viewProjMatrix)
}


function draw(gl: WebGLRenderingContext, program: any, bufferList: bufferListObject, viewProjMatrix: Matrix4) {
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferList.points)
  activeData(gl, program.a_position, 3)

  if (program.a_color) {
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferList.colors)
    activeData(gl, program.a_color, 3)
  }

  g_mvpMatrix.set(viewProjMatrix)
  g_mvpMatrix.multiply(g_modelMatrix)
  gl.uniformMatrix4fv(program.u_mvpMatrix, false, g_mvpMatrix.elements)

  gl.drawElements(gl.TRIANGLES, bufferList.length, gl.UNSIGNED_BYTE, 0)
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
    let shadowProgramBefore = createProgram(gl, SHADOW_VSHADER_SOURCE, SHADOW_FSHADER_SOURCE)
    if (!shadowProgramBefore) {
      return
    }
    let shadowProgram = {
      program: shadowProgramBefore,
      a_position: gl.getAttribLocation(shadowProgramBefore, 'a_position'),
      u_mvpMatrix: gl.getUniformLocation(shadowProgramBefore, 'u_mvpMatrix')
    }
    if (shadowProgram.a_position < 0 || !shadowProgram.u_mvpMatrix) {
      console.log('failed to get the storage location of attribute or uniform variable from shadowProgram.')
      return
    }

    let normalProgramBefore = createProgram(gl, VSHADER_SOURCE, FSHADER_SOURCE)
    if (!normalProgramBefore) {
      console.log('failed to create program')
      return
    }
    let normalProgram =  {
      program: normalProgramBefore,
      a_position: gl.getAttribLocation(normalProgramBefore, 'a_position'),
      a_color: gl.getAttribLocation(normalProgramBefore, 'a_color'),
      u_mvpMatrix: gl.getUniformLocation(normalProgramBefore, 'u_mvpMatrix'),
      u_mvpMatrixFromLight: gl.getUniformLocation(normalProgramBefore, 'u_mvpMatrixFromLight'),
      u_shadowMap: gl.getUniformLocation(normalProgramBefore, 'u_shadowMap')
    }
    if (normalProgram.a_position < 0 || normalProgram.a_color < 0 || !normalProgram.u_mvpMatrix || !normalProgram.u_mvpMatrixFromLight || !normalProgram.u_shadowMap) {
      console.log('failed to get the storage location of attribute or uniform variable from normalProgram.')
      return
    }

    let triangleBuffer = initVertexBuffersForTriangle(gl);
    let planeBuffer = initVertexBufferOfPlane(gl)
    if (!triangleBuffer || !planeBuffer) {
      console.log('failed to set vertex information.')
      return
    }

    let fbo = initFrameBufferObject(gl)
    if (!fbo) {
      console.log('failed to intialize frame buffer object.')
      return
    }
    let frameBufferObj = fbo as frameBufferObject
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, fbo.texture)

    gl.clearColor(0,0,0,1)
    gl.enable(gl.DEPTH_TEST)

    let viewProjMatrixFromLight = new Matrix4()
    viewProjMatrixFromLight.setPerspective(70, offsetscreen_width/offsetscreen_height, 1, 100)
    viewProjMatrixFromLight.lookAt(light_x, light_y,light_z, 0, 0, 0, 0, 1, 0)

    let viewProjMatrix = new Matrix4()
    viewProjMatrix.setPerspective(45, canvas.clientWidth/canvas.clientHeight, 1, 100)
    viewProjMatrix.lookAt(0, 7, 9, 0,0,0,0,1,0)

    let currentAngle = 0
    let mvpMatrixFromLight_t = new Matrix4()
    let mvpMatrixFromLight_p = new Matrix4()

    let tick = function() {
      currentAngle = animate(currentAngle)
      gl.bindFramebuffer(gl.FRAMEBUFFER, frameBufferObj.frameBuffer)
      gl.viewport(0, 0, offsetscreen_width, offsetscreen_height)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

      gl.useProgram(shadowProgram.program)
      drawTriangle(gl, shadowProgram, triangleBuffer, currentAngle, viewProjMatrixFromLight)
      mvpMatrixFromLight_t.set(g_mvpMatrix)
      drawPlane(gl, shadowProgram, planeBuffer, viewProjMatrixFromLight)
      mvpMatrixFromLight_p.set(g_mvpMatrix)

      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
      gl.viewport(0,0, (canvas as HTMLCanvasElement).clientWidth, (canvas as HTMLCanvasElement).clientHeight)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

      gl.useProgram(normalProgram.program)
      gl.uniform1i(normalProgram.u_shadowMap, 0)
      gl.uniformMatrix4fv(normalProgram.u_mvpMatrixFromLight, false, mvpMatrixFromLight_t.elements)
      drawTriangle(gl, normalProgram, triangleBuffer, currentAngle, viewProjMatrix)
      gl.uniformMatrix4fv(normalProgram.u_mvpMatrixFromLight, false, mvpMatrixFromLight_p.elements)
      drawPlane(gl, normalProgram, planeBuffer, viewProjMatrix)

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