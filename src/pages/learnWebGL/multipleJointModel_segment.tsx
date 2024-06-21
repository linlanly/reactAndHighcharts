import { KeyboardEvent } from "react";
import { useEffect } from "react"
import Matrix4 from "./cuon-matrix.js";

function initShader(gl: WebGL2RenderingContext): WebGLShader | null {
  let vsource = `
    attribute vec4 a_position;
    attribute vec4 a_normal;
    uniform mat4 u_mvpMatrix;
    uniform mat4 u_normalMatrix;
    varying vec4 v_color;
    void main() {
      gl_Position = u_mvpMatrix * a_position;
      vec3 lightDirection = normalize(vec3(0.0, 0.5, 0.7));
      vec4 color = vec4(1.0, 0.4, 0.0, 1.0);
      vec3 normal = normalize((u_normalMatrix * a_normal).xyz);
      float nDotL = max(dot(normal, lightDirection), 0.0);
      v_color = vec4(color.rgb * nDotL + vec3(0.1), color.a);
    }`
  let fsource = `
    #ifdef GL_ES
    precision mediump float;
    #endif
    varying vec4 v_color;
    void main() {
      gl_FragColor = v_color;
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
    console.log('VERTEX_SHADER compile error：' + error)
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

function bindBuffer(gl: WebGL2RenderingContext, data: Float32Array | Uint8Array, type: any) {
  let buffer = gl.createBuffer()
  gl.bindBuffer(type, buffer)
  gl.bufferData(type, data, gl.STATIC_DRAW)
  return buffer
}

function activeData(gl: WebGL2RenderingContext, program: WebGLProgram, size: number, attrib: any, count: number, arrNumber: number = 0, offset: number = 0) {
  let dealAttrib = attrib
  if (typeof attrib === 'string') {
    dealAttrib = gl.getAttribLocation(program, attrib)
  }
  gl.vertexAttribPointer(dealAttrib, count, gl.FLOAT, false, arrNumber * size, offset * size)
  gl.enableVertexAttribArray(dealAttrib)
}
var g_baseBuffer = null;     // Buffer object for a base
var g_arm1Buffer = null;     // Buffer object for arm1
var g_arm2Buffer = null;     // Buffer object for arm2
var g_palmBuffer = null;     // Buffer object for a palm
var g_fingerBuffer = null;   // Buffer object for fingers
function initVertexBuffer(gl: WebGL2RenderingContext, program: WebGLProgram) {
  
  var vertices_base = new Float32Array([ // Base(10x2x10)
     5.0, 2.0, 5.0, -5.0, 2.0, 5.0, -5.0, 0.0, 5.0,  5.0, 0.0, 5.0, // v0-v1-v2-v3 front
     5.0, 2.0, 5.0,  5.0, 0.0, 5.0,  5.0, 0.0,-5.0,  5.0, 2.0,-5.0, // v0-v3-v4-v5 right
     5.0, 2.0, 5.0,  5.0, 2.0,-5.0, -5.0, 2.0,-5.0, -5.0, 2.0, 5.0, // v0-v5-v6-v1 up
    -5.0, 2.0, 5.0, -5.0, 2.0,-5.0, -5.0, 0.0,-5.0, -5.0, 0.0, 5.0, // v1-v6-v7-v2 left
    -5.0, 0.0,-5.0,  5.0, 0.0,-5.0,  5.0, 0.0, 5.0, -5.0, 0.0, 5.0, // v7-v4-v3-v2 down
     5.0, 0.0,-5.0, -5.0, 0.0,-5.0, -5.0, 2.0,-5.0,  5.0, 2.0,-5.0  // v4-v7-v6-v5 back
  ]);

  var vertices_arm1 = new Float32Array([  // Arm1(3x10x3)
     1.5, 10.0, 1.5, -1.5, 10.0, 1.5, -1.5,  0.0, 1.5,  1.5,  0.0, 1.5, // v0-v1-v2-v3 front
     1.5, 10.0, 1.5,  1.5,  0.0, 1.5,  1.5,  0.0,-1.5,  1.5, 10.0,-1.5, // v0-v3-v4-v5 right
     1.5, 10.0, 1.5,  1.5, 10.0,-1.5, -1.5, 10.0,-1.5, -1.5, 10.0, 1.5, // v0-v5-v6-v1 up
    -1.5, 10.0, 1.5, -1.5, 10.0,-1.5, -1.5,  0.0,-1.5, -1.5,  0.0, 1.5, // v1-v6-v7-v2 left
    -1.5,  0.0,-1.5,  1.5,  0.0,-1.5,  1.5,  0.0, 1.5, -1.5,  0.0, 1.5, // v7-v4-v3-v2 down
     1.5,  0.0,-1.5, -1.5,  0.0,-1.5, -1.5, 10.0,-1.5,  1.5, 10.0,-1.5  // v4-v7-v6-v5 back
  ]);

  var vertices_arm2 = new Float32Array([  // Arm2(4x10x4)
     2.0, 10.0, 2.0, -2.0, 10.0, 2.0, -2.0,  0.0, 2.0,  2.0,  0.0, 2.0, // v0-v1-v2-v3 front
     2.0, 10.0, 2.0,  2.0,  0.0, 2.0,  2.0,  0.0,-2.0,  2.0, 10.0,-2.0, // v0-v3-v4-v5 right
     2.0, 10.0, 2.0,  2.0, 10.0,-2.0, -2.0, 10.0,-2.0, -2.0, 10.0, 2.0, // v0-v5-v6-v1 up
    -2.0, 10.0, 2.0, -2.0, 10.0,-2.0, -2.0,  0.0,-2.0, -2.0,  0.0, 2.0, // v1-v6-v7-v2 left
    -2.0,  0.0,-2.0,  2.0,  0.0,-2.0,  2.0,  0.0, 2.0, -2.0,  0.0, 2.0, // v7-v4-v3-v2 down
     2.0,  0.0,-2.0, -2.0,  0.0,-2.0, -2.0, 10.0,-2.0,  2.0, 10.0,-2.0  // v4-v7-v6-v5 back
  ]);

  var vertices_palm = new Float32Array([  // Palm(2x2x6)
     1.0, 2.0, 3.0, -1.0, 2.0, 3.0, -1.0, 0.0, 3.0,  1.0, 0.0, 3.0, // v0-v1-v2-v3 front
     1.0, 2.0, 3.0,  1.0, 0.0, 3.0,  1.0, 0.0,-3.0,  1.0, 2.0,-3.0, // v0-v3-v4-v5 right
     1.0, 2.0, 3.0,  1.0, 2.0,-3.0, -1.0, 2.0,-3.0, -1.0, 2.0, 3.0, // v0-v5-v6-v1 up
    -1.0, 2.0, 3.0, -1.0, 2.0,-3.0, -1.0, 0.0,-3.0, -1.0, 0.0, 3.0, // v1-v6-v7-v2 left
    -1.0, 0.0,-3.0,  1.0, 0.0,-3.0,  1.0, 0.0, 3.0, -1.0, 0.0, 3.0, // v7-v4-v3-v2 down
     1.0, 0.0,-3.0, -1.0, 0.0,-3.0, -1.0, 2.0,-3.0,  1.0, 2.0,-3.0  // v4-v7-v6-v5 back
  ]);

  var vertices_finger = new Float32Array([  // Fingers(1x2x1)
     0.5, 2.0, 0.5, -0.5, 2.0, 0.5, -0.5, 0.0, 0.5,  0.5, 0.0, 0.5, // v0-v1-v2-v3 front
     0.5, 2.0, 0.5,  0.5, 0.0, 0.5,  0.5, 0.0,-0.5,  0.5, 2.0,-0.5, // v0-v3-v4-v5 right
     0.5, 2.0, 0.5,  0.5, 2.0,-0.5, -0.5, 2.0,-0.5, -0.5, 2.0, 0.5, // v0-v5-v6-v1 up
    -0.5, 2.0, 0.5, -0.5, 2.0,-0.5, -0.5, 0.0,-0.5, -0.5, 0.0, 0.5, // v1-v6-v7-v2 left
    -0.5, 0.0,-0.5,  0.5, 0.0,-0.5,  0.5, 0.0, 0.5, -0.5, 0.0, 0.5, // v7-v4-v3-v2 down
     0.5, 0.0,-0.5, -0.5, 0.0,-0.5, -0.5, 2.0,-0.5,  0.5, 2.0,-0.5  // v4-v7-v6-v5 back
  ]);
  
  let normals = new Float32Array([
    0.0, 0.0, 1.0,  0.0, 0.0, 1.0,  0.0, 0.0, 1.0,  0.0, 0.0, 1.0, // v0-v1-v2-v3 front
    1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0, // v0-v3-v4-v5 right
    0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0, // v0-v5-v6-v1 up
   -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, // v1-v6-v7-v2 left
    0.0,-1.0, 0.0,  0.0,-1.0, 0.0,  0.0,-1.0, 0.0,  0.0,-1.0, 0.0, // v7-v4-v3-v2 down
    0.0, 0.0,-1.0,  0.0, 0.0,-1.0,  0.0, 0.0,-1.0,  0.0, 0.0,-1.0  // v4-v7-v6-v5 back
  ]);

  let indices = new Uint8Array([
    0, 1, 2,   0, 2, 3,    // front
    4, 5, 6,   4, 6, 7,    // right
    8, 9,10,   8,10,11,    // up
   12,13,14,  12,14,15,    // left
   16,17,18,  16,18,19,    // down
   20,21,22,  20,22,23     // back
 ]);
 g_baseBuffer = bindBuffer(gl, vertices_base, gl.ARRAY_BUFFER)
 g_arm1Buffer = bindBuffer(gl, vertices_arm1, gl.ARRAY_BUFFER)
 g_arm2Buffer = bindBuffer(gl, vertices_arm2, gl.ARRAY_BUFFER)
 g_palmBuffer = bindBuffer(gl, vertices_palm, gl.ARRAY_BUFFER)
 g_fingerBuffer = bindBuffer(gl, vertices_finger, gl.ARRAY_BUFFER)
 bindBuffer(gl, normals, gl.ARRAY_BUFFER)
 activeData(gl, program, normals.BYTES_PER_ELEMENT, 'a_normal', 3)
 bindBuffer(gl, indices, gl.ELEMENT_ARRAY_BUFFER)
}

let angle_step = 3.0;
let g_arm1Angle = -90;
let g_join1Angle = 45;
let g_join2Angle = 0;
let g_join3Angle = 0;
function keydown(ev: KeyboardEvent, gl: WebGL2RenderingContext, n: number, viewProjMatrix: Matrix4, a_position: any, u_mvpMatrix: WebGLUniformLocation, u_normalMatrix: WebGLUniformLocation) {
  
  switch (ev.keyCode) {
    case 38: // Up arrow key -> the positive rotation of joint1 around the z-axis
      if (g_join1Angle < 135.0) g_join1Angle += angle_step;
      break;
    case 40: // Down arrow key -> the negative rotation of joint1 around the z-axis
      if (g_join1Angle > -135.0) g_join1Angle -= angle_step;
      break;
    case 39: // Right arrow key -> the positive rotation of arm1 around the y-axis
      g_arm1Angle = (g_arm1Angle + angle_step) % 360;
      break;
    case 37: // Left arrow key -> the negative rotation of arm1 around the y-axis
      g_arm1Angle = (g_arm1Angle - angle_step) % 360;
      break;
    case 90:
      g_join2Angle = (g_join2Angle + angle_step) % 360;
      break;
    case 88:
      g_join2Angle = (g_join2Angle - angle_step) % 360;
      break;
    case 86:
      if (g_join3Angle < 60) g_join3Angle = (g_join3Angle + angle_step) % 360;
      break;
    case 67:
      if (g_join3Angle > -60) g_join3Angle = (g_join3Angle - angle_step) % 360;
      break;
    default: return; // Skip drawing at no effective action
  }
  // Draw the robot arm
  draw(gl, n, viewProjMatrix, a_position, u_mvpMatrix, u_normalMatrix);
}

let g_modeMatrix = new Matrix4(), g_mvpMatrix = new Matrix4();
function draw(gl: WebGL2RenderingContext, n: number, viewProjMatrix: Matrix4, a_position: any, u_mvpMatrix: WebGLUniformLocation, u_normalMatrix: WebGLUniformLocation) {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  let baseHeight = 2
  g_modeMatrix.setTranslate(0, -12, 0)
  drawBox(gl, n, g_baseBuffer as WebGLBuffer, viewProjMatrix, a_position, u_mvpMatrix, u_normalMatrix)

  let arm1Length = 10;
  g_modeMatrix.setTranslate(0, -12, 0)
  g_modeMatrix.rotate(g_arm1Angle, 0, 1, 0)
  drawBox(gl, n, g_arm1Buffer as WebGLBuffer, viewProjMatrix, a_position, u_mvpMatrix, u_normalMatrix)

  g_modeMatrix.translate(0, arm1Length, 0)
  g_modeMatrix.rotate(g_join1Angle, 0, 0, 1)
  g_modeMatrix.scale(1.3, 1.0, 1.3)
  drawBox(gl, n, g_arm2Buffer as WebGLBuffer, viewProjMatrix, a_position, u_mvpMatrix, u_normalMatrix)

  let palmLength = 2
  g_modeMatrix.translate(0, arm1Length, 0)
  g_modeMatrix.rotate(g_join2Angle, 0, 1, 0)
  drawBox(gl, n, g_palmBuffer as WebGLBuffer, viewProjMatrix, a_position, u_mvpMatrix, u_normalMatrix)

  g_modeMatrix.translate(0, palmLength, 0)

  pushMatrix(g_modeMatrix);
  g_modeMatrix.translate(0, 0, 2)
  g_modeMatrix.rotate(g_join3Angle, 1, 0, 0)
  drawBox(gl, n, g_fingerBuffer as WebGLBuffer, viewProjMatrix, a_position, u_mvpMatrix, u_normalMatrix)
  g_modeMatrix = popMatrix()
  
  g_modeMatrix.translate(0, 0, -2)
  g_modeMatrix.rotate(-g_join3Angle, 1, 0, 0)
  drawBox(gl, n, g_fingerBuffer as WebGLBuffer, viewProjMatrix, a_position, u_mvpMatrix, u_normalMatrix)
}


var g_matrixStack:Array<Matrix4> = []; // Array for storing a matrix
function pushMatrix(m: Matrix4) { // Store the specified matrix to the array
  var m2 = new Matrix4(m);
  g_matrixStack.push(m2);
}

function popMatrix() { // Retrieve the matrix from the array
  return g_matrixStack.pop();
}

let g_normalMatrix = new Matrix4()
function drawBox(gl: WebGL2RenderingContext, n: number, buffer: WebGLBuffer, viewProjMatrix: Matrix4, a_position: any, u_mvpMatrix: WebGLUniformLocation, u_normalMatrix: WebGLUniformLocation) {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.vertexAttribPointer(a_position, 3, gl.FLOAT, false, 0, 0)
  gl.enableVertexAttribArray(a_position)

  g_mvpMatrix.set(viewProjMatrix)
  g_mvpMatrix.multiply(g_modeMatrix)
  gl.uniformMatrix4fv(u_mvpMatrix, false, g_mvpMatrix.elements)
  g_normalMatrix.setInverseOf(g_modeMatrix)
  g_normalMatrix.transpose()
  gl.uniformMatrix4fv(u_normalMatrix, false, g_normalMatrix.elements)
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0)
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
    initVertexBuffer(gl, program)
    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.enable(gl.DEPTH_TEST)

    let u_mvpMatrix = gl.getUniformLocation(program, 'u_mvpMatrix')
    let u_normalMatrix = gl.getUniformLocation(program, 'u_normalMatrix')
    let a_position = gl.getAttribLocation(program, 'a_position')

    let viewProjMatrix = new Matrix4()
    viewProjMatrix.setPerspective(50.0, canvas?.clientWidth / canvas?.clientHeight, 1.0, 100)
    viewProjMatrix.lookAt(20, 10, 30, 0, 0, 0, 0, 1, 0)
    document.onkeydown = function(ev) {
      keydown(ev, gl, 36, viewProjMatrix, a_position, u_mvpMatrix as WebGLUniformLocation, u_normalMatrix as WebGLUniformLocation)
    }
  }, [])
  return (
    <>
      <canvas id="webgl" width={500} height={500}></canvas>
    </>

  )
}