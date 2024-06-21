import { useEffect } from "react"

function initShader(gl: WebGL2RenderingContext): WebGLShader | null {
  let vsource = `
  attribute vec4 position;
  attribute float size;
  attribute vec4 color;
  varying vec4 v_color;
  void main() {
    gl_PointSize = size;
    gl_Position = position;
    v_color = color;
  }`
  let fsource = `
  precision mediump float;
  varying vec4 v_color;
  void main() {
    float dist = distance(gl_PointCoord, vec2(0.5, 0.5));
    if (dist < 0.5) {
      gl_FragColor = v_color;
    } else {
      discard;
    }
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
  gl.vertexAttribPointer(attrib, 3, gl.FLOAT, false, size * count, 0)
  gl.enableVertexAttribArray(attrib)
  console.log('show colors', data)
}

let points: Array<number> = [], colors: Array<number> = [], count: number = 4

function clickCanvas(gl: WebGL2RenderingContext, program: WebGLProgram) {
  var canvas = document.getElementById('webgl')
  if (canvas) {
    let boxWidth = canvas.clientWidth / 2
    let boxHeight = canvas.clientHeight / 2
    let rect = canvas.getBoundingClientRect()
    canvas.addEventListener('click', (event) => {
      // let clickX = event.offsetX - boxWidth
      // let clickY = boxHeight - event.offsetY
      // let percentageX = clickX / boxWidth
      // let percentageY = clickY / boxHeight
      
      let clickX = event.clientX
      let clickY = event.clientY
      let percentageX = ((clickX - rect.left) - boxWidth) / boxWidth
      let percentageY = (boxHeight - (clickY - rect.top)) / boxHeight
      
      if (percentageX > 0 && percentageY > 0) {
        colors.push(...[1.0, 0.0, 0.0])
      } else if (percentageX > 0 && percentageY < 0) {
        colors.push(...[0.0, 1.0, 0.0])
      } else if (percentageX < 0 && percentageY > 0) {
        colors.push(...[0.0, 0.0, 1.0])
      } else {
        colors.push(...[1.0, 1.0, 1.0])
      }
      let position = gl.getAttribLocation(program, 'position')
      let size = gl.getAttribLocation(program, 'size')
      let color = gl.getAttribLocation(program, 'color')
      points.push(...[percentageX, percentageY, 0.0, Math.random() * 10 + 10])
      let point = new Float32Array(points)
      let pointSize = point.BYTES_PER_ELEMENT
      bindBuffer(gl, point, position, count)
      gl.vertexAttribPointer(size, 1, gl.FLOAT, false, pointSize * count, pointSize * 3)
      gl.enableVertexAttribArray(size)
      
      bindBuffer(gl, new Float32Array(colors), color, 0)
      gl.clearColor(1.0, 0.5, 0.3, 1.0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.POINTS, 0, points.length / count)
    })
  }
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
    clickCanvas(gl, program)
  }, [])
  return (
    <>
      <canvas id="webgl" width={500} height={300}></canvas>
    </>

  )
}