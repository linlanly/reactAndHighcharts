import { useEffect } from "react"
import Matrix4, { Vector4 } from "./cuon-matrix.js";

function initShader(gl: WebGLRenderingContext): WebGLShader | null {
  let vsource = `
    attribute vec4 a_position;
    attribute vec4 a_color;
    uniform mat4 u_mvpMatrix;
    uniform mat4 u_modelMatrix;
    uniform vec4 u_eye;
    varying vec4 v_color;
    varying float v_dist;
    void main() {
      gl_Position = u_mvpMatrix * a_position;
      v_color = a_color;
      v_dist = gl_Position.w;
    }`
  let fsource = `
  precision mediump float;
  uniform vec3 u_fogColor;
  uniform vec2 u_fogDist;
  varying vec4 v_color;
  varying float v_dist;
  void main() {
    float fogFactor = clamp((u_fogDist.y - v_dist) / (u_fogDist.y - u_fogDist.x), 0.0, 1.0);
    vec3 color = mix(u_fogColor, vec3(v_color), fogFactor);
    gl_FragColor = vec4(color, v_color.a);
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

function activeData(gl: WebGLRenderingContext, program: WebGLProgram, size: number, attrib: any, count: number, type: any = gl.FLOAT,arrNumber: number = 0, offset: number = 0) {
  let dealAttrib = attrib
  if (typeof attrib === 'string') {
    dealAttrib = gl.getAttribLocation(program, attrib)
  }
  gl.vertexAttribPointer(dealAttrib, count, type, false, arrNumber * size, offset * size)
  gl.enableVertexAttribArray(dealAttrib)
}
function initVertexBuffer(gl: WebGLRenderingContext, program: WebGLProgram) {
  let vertices = new Float32Array([   // Vertex coordinates
    1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0,    // v0-v1-v2-v3 front
    1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0,    // v0-v3-v4-v5 right
    1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0,    // v0-v5-v6-v1 up
    -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0,    // v1-v6-v7-v2 left
    -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,    // v7-v4-v3-v2 down
    1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0     // v4-v7-v6-v5 back
  ])
  let normals = new Float32Array([    // Colors
  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // v0-v1-v2-v3 front
  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  // v0-v3-v4-v5 right
  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  // v0-v5-v6-v1 up
  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  // v1-v6-v7-v2 left
  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  // v7-v4-v3-v2 down
  0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0   // v4-v7-v6-v5 back
  ]);

  let indices = new Uint8Array([
    0, 1, 2, 0, 2, 3,    // front
    4, 5, 6, 4, 6, 7,    // right
    8, 9, 10, 8, 10, 11,    // up
    12, 13, 14, 12, 14, 15,    // left
    16, 17, 18, 16, 18, 19,    // down
    20, 21, 22, 20, 22, 23     // back
  ]);
  bindBuffer(gl, vertices, gl.ARRAY_BUFFER)
  activeData(gl, program, normals.BYTES_PER_ELEMENT, 'a_position', 3)

  bindBuffer(gl, normals, gl.ARRAY_BUFFER)
  activeData(gl, program, normals.BYTES_PER_ELEMENT, 'a_color', 2)

  bindBuffer(gl, indices, gl.ELEMENT_ARRAY_BUFFER)
}

function keydown(event: KeyboardEvent, gl: WebGLRenderingContext, u_fogDist: WebGLUniformLocation, fogDist: Float32Array) {
  switch(event.code) {
    case 'ArrowRight':
      fogDist[1] += 1;
      break;
    case 'ArrowLeft':
      if (fogDist[1] > fogDist[0]) fogDist[1] -= 1;
      break;
    default: return;
  }
  gl.uniform2fv(u_fogDist, fogDist)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_BYTE, 0)
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
    let program = initShader(gl)
    if (!program) {
      return
    }
    initVertexBuffer(gl, program)
    let fogColor = new Float32Array([.137, .231, .423]);
    let fogDist = new Float32Array([55, 80])
    let eye = new Float32Array([25, 65, 35, 1])

    let u_mvpMatrix = gl.getUniformLocation(program, 'u_mvpMatrix')
    let u_modelMatrix = gl.getUniformLocation(program, 'u_modelMatrix')
    let u_eye = gl.getUniformLocation(program, 'u_eye')
    let u_fogColor = gl.getUniformLocation(program, 'u_fogColor')
    let u_fogDist = gl.getUniformLocation(program, 'u_fogDist')
    if (!u_mvpMatrix || !u_modelMatrix || !u_eye || !u_fogColor || !u_fogDist) {
      console.log('failed to get the storage location')
      return
    }

    gl.uniform3fv(u_fogColor, fogColor)
    gl.uniform2fv(u_fogDist, fogDist)
    gl.uniform4fv(u_eye, eye)

    gl.clearColor(fogColor[0], fogColor[1], fogColor[2], 1)
    gl.enable(gl.DEPTH_TEST)

    let modelMatrix = new Matrix4()
    modelMatrix.setScale(10, 10, 10)
    gl.uniformMatrix4fv(u_modelMatrix, false, modelMatrix.elements)

    let mvpMatrix = new Matrix4()
    mvpMatrix.setPerspective(20, canvas.clientWidth / canvas.clientHeight, 1, 100)
    mvpMatrix.lookAt(eye[0], eye[1], eye[2], 0, 2, 0, 0, 1, 0)
    mvpMatrix.multiply(modelMatrix)
    gl.uniformMatrix4fv(u_mvpMatrix, false, mvpMatrix.elements)
    document.onkeydown = function(ev) {
      keydown(ev, gl, u_fogDist as WebGLUniformLocation, fogDist)
    }

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_BYTE, 0)

    let modeViewMatrix = new Matrix4()
    modeViewMatrix.setLookAt(eye[0], eye[1], eye[2], 0, 2, 0, 0, 1, 0)
    modeViewMatrix.multiply(modelMatrix)
    modeViewMatrix.multiplyVector4(new Vector4([1, 1, 1, 1]))
    modeViewMatrix.multiplyVector4(new Vector4([-1, 1, 1, 1]))
    mvpMatrix.multiplyVector4(new Vector4([1, 1, 1, 1]))
    mvpMatrix.multiplyVector4(new Vector4([-1, 1, 1, 1]))
  }, [])
  return (
    <>
      <canvas id="webgl" width={500} height={500}></canvas>
    </>

  )
}