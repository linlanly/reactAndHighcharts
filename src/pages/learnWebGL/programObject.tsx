import { useEffect } from "react"
import Matrix4 from "./cuon-matrix.js";

let SOLID_VSHADER_SOURCE = `
  attribute vec4 a_position;
  attribute vec4 a_normal;
  uniform mat4 u_mvpMatrix;
  uniform mat4 u_normalMatrix;
  varying vec4 v_color;
  void main() {
    vec3 lightDirection = vec3(0.0, 0.0, 1.0);
    vec4 color = vec4(0.5, 0.3, 1.0, 1.0);
    gl_Position = u_mvpMatrix * a_position;
    vec3 normal = normalize(vec3(u_normalMatrix * a_normal));
    float v_nDotL = max(dot(normal, lightDirection), 0.0);
    v_color = vec4(color.rgb * v_nDotL, color.a);
  }
`
let SOLID_FSHADER_SOURCE = `
  #ifdef GL_ES
  precision mediump float;
  #endif
  varying vec4 v_color;
  void main() {
    gl_FragColor = v_color;
  }`

let TEXTURE_VSHADER_SOURCE = `
  attribute vec4 a_position;
  attribute vec4 a_normal;
  attribute vec2 a_texCoord;
  uniform mat4 u_mvpMatrix;
  uniform mat4 u_normalMatrix;
  varying float v_nDotL;
  varying vec2 v_texCoord;
  void main() {
    vec3 lightDirection = vec3(0.0, 0.0, 1.0);
    gl_Position = u_mvpMatrix * a_position;
    vec3 normal = normalize(vec3(u_normalMatrix * a_normal));
    v_nDotL = max(dot(normal, lightDirection), 0.0);
    v_texCoord = a_texCoord;
  }`
let TEXTURE_FSHADER_SOURCE = `
  #ifdef GL_ES
  precision mediump float;
  #endif
  uniform sampler2D u_sampler;
  varying vec2 v_texCoord;
  varying float v_nDotL;
  void main() {
    vec4 color = texture2D(u_sampler, v_texCoord);
    gl_FragColor = vec4(color.rgb * v_nDotL, color.a);
  }
  `
function createProgram(gl: WebGLRenderingContext, vertexSource: string, fragmentSource: string) {
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
  gl.shaderSource(vshader, vertexSource)
  gl.compileShader(vshader)
  if (!gl.getShaderParameter(vshader, gl.COMPILE_STATUS)) {
    let error = gl.getShaderInfoLog(vshader)
    console.log('VERTEX_SHADER compile error：' + error)
  }
  gl.shaderSource(fshader, fragmentSource)
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
function initVertexBuffer(gl: WebGLRenderingContext) {
  
  var vertices = new Float32Array([   // Vertex coordinates
     1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,    // v0-v1-v2-v3 front
     1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0,    // v0-v3-v4-v5 right
     1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,    // v0-v5-v6-v1 up
    -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,    // v1-v6-v7-v2 left
    -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,    // v7-v4-v3-v2 down
     1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0     // v4-v7-v6-v5 back
  ]);

  var normals = new Float32Array([   // Normal
     0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,     // v0-v1-v2-v3 front
     1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,     // v0-v3-v4-v5 right
     0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,     // v0-v5-v6-v1 up
    -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,     // v1-v6-v7-v2 left
     0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,     // v7-v4-v3-v2 down
     0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0      // v4-v7-v6-v5 back
  ]);

  var texCoords = new Float32Array([   // Texture coordinates
     1.0, 1.0,   0.0, 1.0,   0.0, 0.0,   1.0, 0.0,    // v0-v1-v2-v3 front
     0.0, 1.0,   0.0, 0.0,   1.0, 0.0,   1.0, 1.0,    // v0-v3-v4-v5 right
     1.0, 0.0,   1.0, 1.0,   0.0, 1.0,   0.0, 0.0,    // v0-v5-v6-v1 up
     1.0, 1.0,   0.0, 1.0,   0.0, 0.0,   1.0, 0.0,    // v1-v6-v7-v2 left
     0.0, 0.0,   1.0, 0.0,   1.0, 1.0,   0.0, 1.0,    // v7-v4-v3-v2 down
     0.0, 0.0,   1.0, 0.0,   1.0, 1.0,   0.0, 1.0     // v4-v7-v6-v5 back
  ]);

  var indices = new Uint8Array([        // Indices of the vertices
     0, 1, 2,   0, 2, 3,    // front
     4, 5, 6,   4, 6, 7,    // right
     8, 9,10,   8,10,11,    // up
    12,13,14,  12,14,15,    // left
    16,17,18,  16,18,19,    // down
    20,21,22,  20,22,23     // back
  ]);
  let pointsBuffer = bindBuffer(gl, vertices, gl.ARRAY_BUFFER)
  let normalsBuffer = bindBuffer(gl, normals, gl.ARRAY_BUFFER)
  let texCoordsBuffer = bindBuffer(gl, texCoords, gl.ARRAY_BUFFER)
  let indicesBuffer = bindBuffer(gl, indices, gl.ELEMENT_ARRAY_BUFFER)
  let bufferList = {
    points: pointsBuffer,
    normals: normalsBuffer,
    texCoords: texCoordsBuffer,
    indices: indicesBuffer
  }
  return bufferList
}

function initTextures(gl: WebGLRenderingContext, program: any) {
  let texture = gl.createTexture()
  if (!texture) {
    console.log('failed to create texture object.')
    return null
  }
  let image = new Image();
  image.onload = function () {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)

    gl.useProgram(program.program)
    gl.uniform1i(program.u_sampler, 0)
    gl.bindTexture(gl.TEXTURE_2D, null)
  }
  image.onerror = function() {
    console.log('failed to load image.')
  }
  image.src = 'src/assets/images/map.png'
  return texture
}

let last = Date.now(), ANGLE_STEP = 20;
function animate(currentAngle: number) {
  let now = Date.now()
  let elapsed = now - last;
  last = now;
  let newAngle = currentAngle + (ANGLE_STEP * elapsed) / 1000
  return newAngle % 360;
}

let g_modelMatrix = new Matrix4()
let g_mvpMatrix = new Matrix4()
let g_normalMatrix = new Matrix4()
function drawCube(gl: WebGLRenderingContext, program: any, x: number, angle: number, viewProjMatrix: Matrix4) {
  g_modelMatrix.setTranslate(x, 0, 0)
  g_modelMatrix.rotate(20, 1, 0, 0)
  g_modelMatrix.rotate(angle, 0, 1, 1)

  g_normalMatrix.setInverseOf(g_modelMatrix)
  g_normalMatrix.transpose()
  gl.uniformMatrix4fv(program.u_normalMatrix, false, g_normalMatrix.elements)

  g_mvpMatrix.set(viewProjMatrix)
  g_mvpMatrix.multiply(g_modelMatrix)
  gl.uniformMatrix4fv(program.u_mvpMatrix, false, g_mvpMatrix.elements)

  gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_BYTE, 0)
}

function drawCubeOfSolid(gl: WebGLRenderingContext, program: any, bufferList: any, x: number, angle: number, viewProjMatrix: Matrix4) {
  gl.useProgram(program.program)
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferList.points)
  activeData(gl, program.a_position, 3)

  gl.bindBuffer(gl.ARRAY_BUFFER, bufferList.normals)
  activeData(gl, program.a_noraml, 3)

  drawCube(gl, program, x, angle, viewProjMatrix)
}

function drawCubeOfTexture(gl: WebGLRenderingContext, program: any, texture: WebGLTexture, bufferList: any, x: number, angle: number, viewProjMatrix: Matrix4) {
  gl.useProgram(program.program)

  gl.bindBuffer(gl.ARRAY_BUFFER, bufferList.points)
  activeData(gl, program.a_position, 3)

  gl.bindBuffer(gl.ARRAY_BUFFER, bufferList.normals)
  activeData(gl, program.a_noraml, 3)

  gl.bindBuffer(gl.ARRAY_BUFFER, bufferList.texCoords)
  activeData(gl, program.a_texCoord, 2)

  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, texture)

  drawCube(gl, program, x, angle, viewProjMatrix)
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
    let solidProgramBefore = createProgram(gl, SOLID_VSHADER_SOURCE, SOLID_FSHADER_SOURCE)
    if (!solidProgramBefore) {
      console.log('failed to intialze shaders of solid.')
      return
    }
    let solidProgram = 
    {
      program: solidProgramBefore as WebGLProgram,
      a_position: gl.getAttribLocation(solidProgramBefore, 'a_position'),
      a_noraml: gl.getAttribLocation(solidProgramBefore, 'a_normal'),
      u_mvpMatrix: gl.getUniformLocation(solidProgramBefore, 'u_mvpMatrix'),
      u_normalMatrix: gl.getUniformLocation(solidProgramBefore, 'u_normalMatrix')
    }
    if (solidProgram.a_position < 0) {
      console.log('failed to get the storage location of attribute or uniform variable of solid.')
      return
    }
    let textProgramBefore = createProgram(gl, TEXTURE_VSHADER_SOURCE, TEXTURE_FSHADER_SOURCE)
    if (!textProgramBefore) {
      console.log('failed to intialize shaders of texture.')
      return
    }
    let textProgram = {
      program: textProgramBefore as WebGLProgram,
      a_position: gl.getAttribLocation(textProgramBefore, 'a_position'),
      a_noraml: gl.getAttribLocation(textProgramBefore, 'a_normal'),
      u_mvpMatrix: gl.getUniformLocation(textProgramBefore, 'u_mvpMatrix'),
      u_normalMatrix: gl.getUniformLocation(textProgramBefore, 'u_normalMatrix'),
      a_texCoord: gl.getAttribLocation(textProgramBefore, 'a_texCoord'),
      u_sampler: gl.getUniformLocation(textProgramBefore, 'u_sampler')
    }
    if (textProgram.a_position < 0 || textProgram.a_noraml < 0 || !textProgram.u_mvpMatrix || !textProgram.u_normalMatrix || textProgram.a_texCoord < 0 || !textProgram.u_sampler) {
      console.log('failed to get the storage location of attribute or uniform variable of texture.')
      return
    }
    let bufferList = initVertexBuffer(gl)
    if (!bufferList) {
      console.log('failed to create buffer.')
      return
    }

    let texture = initTextures(gl, textProgram)
    if (!texture) {
      console.log('failed to create texture')
      return
    }

    gl.enable(gl.DEPTH_TEST)
    gl.clearColor(1.0, 1.0, 0.0, 1.0)

    var viewProjMatrix = new Matrix4()
    viewProjMatrix.setPerspective(30, canvas.clientWidth / canvas.clientHeight, 1, 100)
    viewProjMatrix.lookAt(0, 0, 15, 0, 0, 0, 0, 1, 0)

    let currentAngle = 0;
    let tick = function() {
      currentAngle = animate(currentAngle)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

      drawCubeOfSolid(gl, solidProgram, bufferList, -2.0, currentAngle, viewProjMatrix)
      drawCubeOfTexture(gl, textProgram, texture as WebGLTexture, bufferList, 2, currentAngle, viewProjMatrix)

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