import { useEffect } from "react"
import Matrix4 from "./cuon-matrix.js";

function initShader(gl: WebGLRenderingContext): WebGLShader | null {
  let vsource = `
    attribute vec4 a_position;
    attribute vec2 a_texcoord;
    attribute float a_face;
    uniform mat4 u_mvpMatrix;
    varying vec2 v_texcoord;
    varying float v_face;
    void main() {
      gl_Position = u_mvpMatrix * a_position;
      v_texcoord = a_texcoord;
      v_face = a_face;
    }`
  let fsource = `
  precision mediump float;
  varying vec2 v_texcoord;
  uniform sampler2D sampler;
  uniform bool u_clicked;
  uniform int u_face;
  varying float v_face;
  void main() {
    if (u_clicked) {
      gl_FragColor = vec4(1.0, 0.0, 0.0, v_face / 255.0);
    } else {
      if (int(v_face) == u_face) {
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
      } else {
        vec4 color0 = texture2D(sampler, v_texcoord);
        gl_FragColor = color0;
      }
    }
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
  let normals = new Float32Array([   // Texture coordinates
    1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,    // v0-v1-v2-v3 front
    0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0,    // v0-v3-v4-v5 right
    1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0,    // v0-v5-v6-v1 up
    1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,    // v1-v6-v7-v2 left
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,    // v7-v4-v3-v2 down
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0     // v4-v7-v6-v5 back
  ]);

  let faces = new Uint8Array([
    1, 1, 1, 1,
    2, 2, 2, 2,
    3, 3, 3, 3,
    4, 4, 4, 4,
    5, 5, 5, 5,
    6, 6, 6, 6
  ])

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
  activeData(gl, program, normals.BYTES_PER_ELEMENT, 'a_texcoord', 2)

  bindBuffer(gl, faces, gl.ARRAY_BUFFER)
  activeData(gl, program, normals.BYTES_PER_ELEMENT, 'a_face', 1, gl.UNSIGNED_BYTE)

  bindBuffer(gl, indices, gl.ELEMENT_ARRAY_BUFFER)
}

let g_mvpMatrix = new Matrix4()
function draw(gl: WebGLRenderingContext, viewProjMatrix: Matrix4, u_mvpMatrix: WebGLUniformLocation, currentAngle: Array<number>) {
  g_mvpMatrix.set(viewProjMatrix)
  g_mvpMatrix.rotate(currentAngle[0], 1, 0, 0).rotate(currentAngle[1], 0, 1, 0)
  gl.uniformMatrix4fv(u_mvpMatrix, false, g_mvpMatrix.elements)

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_BYTE, 0)
}

function translateParems(gl: WebGLRenderingContext, viewProjMatrix: Matrix4, u_mvpMatrix: WebGLUniformLocation, currentAngle: Array<number>) {
  function drawBefore() {
    draw(gl, viewProjMatrix, u_mvpMatrix, currentAngle)
    requestAnimationFrame(drawBefore)
  }
  drawBefore()
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
    loadTexture(gl, texture as WebGLTexture, u_sampler as WebGLUniformLocation, image)
  }
  image.onerror = function () {
    console.log('load image failed')
  }
  image.src = '/src/assets/images/map.png'
}

function loadTexture(gl: WebGLRenderingContext, texture: WebGLTexture, u_sampler: WebGLUniformLocation, image: HTMLImageElement) {
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image)
  gl.uniform1i(u_sampler, 0)
}

function isSelectedCube(gl: WebGLRenderingContext, x: number, y: number, currentAngle: Array<number>, viewProjMatrix: Matrix4, u_mvpMatrix: WebGLUniformLocation, u_clicked: WebGLUniformLocation, u_face: WebGLUniformLocation | null = null) {
  let picked = false;
  gl.uniform1i(u_clicked, 1)
  draw(gl, viewProjMatrix, u_mvpMatrix, currentAngle)
  let pixels = new Uint8Array(4)
  gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
  if (pixels[0] === 255) {
    picked = true
  }
  gl.uniform1i(u_clicked, 0)
  if (u_face) {
    gl.uniform1i(u_face, pixels[3])
  }
  draw(gl, viewProjMatrix, u_mvpMatrix, currentAngle)
  return picked
}

function draw2d(ctx: CanvasRenderingContext2D, currentAngle: Array<number>) {
  ctx.clearRect(0,0, 500, 500)
  ctx.beginPath()
  ctx.moveTo(120, 10);
  ctx.lineTo(200, 150);
  ctx.lineTo(40, 150);
  ctx.closePath()
  ctx.strokeStyle = 'rgba(225, 255, 255, 1)';
  ctx.stroke();

  ctx.font = '18px "Times New Roman"';
  ctx.fillStyle = 'rgba(225, 255, 255, 1)';
  ctx.fillText('HUD: Head Up Display', 40, 180)
  ctx.fillText('Triangle is drawn by Hud API.', 40, 200);
  ctx.fillText('Cube is drawn by WebGL API', 40, 220)
  ctx.fillText(`Current Angle: x axis(${Math.floor(currentAngle[0])}), y axis(${Math.floor(currentAngle[1])})`, 40, 240);

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
    let hub = document.getElementById('canvas2D')
    if (!hub) return
    let ctxbefore: CanvasRenderingContext2D | null = (hub as HTMLCanvasElement).getContext('2d')
    let ctx = ctxbefore as CanvasRenderingContext2D;
    if (!ctx) return
    let program = initShader(gl)
    if (!program) {
      return
    }
    initVertexBuffer(gl, program)
    // gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.enable(gl.DEPTH_TEST)

    let u_mvpMatrix = gl.getUniformLocation(program, 'u_mvpMatrix')
    let u_clicked = gl.getUniformLocation(program, 'u_clicked')
    let u_face = gl.getUniformLocation(program, 'u_face')

    gl.uniform1i(u_clicked, 0)

    let viewProjMatrix = new Matrix4()
    viewProjMatrix.setPerspective(30.0, canvas?.clientWidth / canvas?.clientHeight, 1.0, 100)
    viewProjMatrix.lookAt(3.0, 3.0, 7.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);

    let lastX = -1, lastY = -1, dragging = false, currentAngle = [0, 0];
    hub.onmousedown = function (event) {
      let x = event.clientX, y = event.clientY;
      let rect = event.target.getBoundingClientRect();
      if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
        lastX = x;
        lastY = y;
        dragging = true;
        let x_in_canvas = x - rect.left, y_in_canvas = rect.bottom - y;
        let picked = isSelectedCube(gl, x_in_canvas, y_in_canvas, currentAngle, viewProjMatrix, u_mvpMatrix as WebGLUniformLocation, u_clicked as WebGLUniformLocation, u_face as WebGLUniformLocation)
      }
    }

    hub.onmouseup = function () {
      dragging = false
    }

    hub.onmousemove = function (event) {
      let x = event.clientX, y = event.clientY;
      if (dragging) {
        let factore = 100 / canvas?.clientHeight;
        let dx = factore * (x - lastX);
        let dy = factore * (y - lastY);
        currentAngle[0] = Math.max(Math.min(currentAngle[0] + dy, 90), -90);
        currentAngle[1] += dx;
      }
      lastX = x, lastY = y;
      draw2d(ctx, currentAngle)
    }

    initTextures(gl, program)
    translateParems(gl, viewProjMatrix, u_mvpMatrix as WebGLUniformLocation, currentAngle)
  }, [])
  return (
    <>
    <h1>1</h1>
    <h1>2</h1>
    <h2>我们都有一个家，名字叫中国，兄弟姐妹都很多，景色也不错，家里盘着两条龙啊，是长江与黄河，还有珠穆朗玛峰儿是最高山坡，我们的大中国呀，其实一个家，永远那个永远，我要伴随她，中国，祝福你，你永远在我心里，中国，祝福你</h2>
      <h2>这一路上，走走停停，也有了几分的距离，不知是那近乡情怯，仍无可避免，而昨夜的天，依旧那么暖，风吹起的从前，从前走过这世间，一直留恋，翻过岁月不同侧脸，猝不及防涌现你的笑脸，我曾难自拔于世界之大，</h2>
      <canvas id="webgl" width={500} height={500}></canvas>
      <canvas id="canvas2D" width={500} height={500}></canvas>
    </>

  )
}