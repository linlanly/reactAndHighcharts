import { useEffect } from "react"

export default function baseContent() {
  useEffect(() => {
    var canvas = document.getElementById('webgl')
    var gl = canvas?.getContext('webgl')
    var data = new Float32Array([
      0.5, 0.5, 0.5,
      -0.5, 0.5, 0.5,
      -0.5, -0.5, 0.5,
      0.5, -0.5, 0.5,
      0.5, 0.5, -0.5,
      -0.5, 0.5, -0.5,
      -0.5, -0.5, -0.5,
      0.5, -0.5, -0.5]);
    // data = data.map((item, index) => {
    //   let radian = 45
    //   let moveX = 0.6 * Math.sin(radian * Math.PI / 180), moveY = 0.6 * Math.cos(radian * Math.PI / 180)
    //   if (index < 4 * 3) {
    //     return item
    //   } else {
    //     if (index % 3 === 0) {
    //       return item + moveX
    //     } else if (index % 3 === 1) {
    //       return item + moveY
    //     } else {
    //       return item
    //     }
    //   }
    // })
    var orderArr = new Uint8Array([
      0, 1, 2, 3,
      4, 5, 6, 7,
      0, 4,
      1, 5,
      2, 6,
      3, 7
    ])
    // const pointNumber = 8
    // const cols = Math.ceil(data.length / pointNumber)
    // let dealArr = Array.from({length: pointNumber}, (_, i) => {
    //   return data.slice(i * cols, (i + 1) * cols)
    // })
    // let newData = [...data]
    // for (let i = 0; i < 4; i++) {
    //   dealArr[i].forEach(item => {
    //     newData[newData.length] = item
    //   })
    //   dealArr[i + 4].forEach(item => {
    //     newData[newData.length] = item
    //   })
    // }
    // data = new Float32Array(newData)

    var vertexShaderSource = `
    attribute vec4 apos;
    attribute vec4 a_color;
    varying vec4 v_color;
    void main() {
      //顶点坐标apos赋值给内置变量gl_Position
      //逐顶点处理数据
      float radian = radians(180.0);
      float cos = cos(radian);
      float sin = sin(radian);
      mat4 m4 = mat4(cos,sin,-sin,0, -sin,cos,sin,0, sin,-sin,cos,0, 0,0,0,1);
      mat4 tx = mat4(1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0.2,1);
      gl_Position = tx*apos;
      v_color = a_color;
    }
`
      // mat4 m4 = mat4(cos,0,sin,0, 0,cos,-sin,0, -sin,sin,cos,0, 0,0,0,1);

    var fragShaderSource = `
    precision lowp float;
    varying vec4 v_color;
      void main() {
        gl_FragColor = v_color;
      }`
    var program = initShader(gl, vertexShaderSource, fragShaderSource)
    var aposLocation = gl.getAttribLocation(program, 'apos');
    var aTranslate = gl.getAttribLocation(program, 'aTranslate');
    //创建缓冲区对象
    var buffer = gl.createBuffer();
    //绑定缓冲区对象,激活buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    //顶点数组data数据传入缓冲区
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    //缓冲区中的数据按照一定的规律传递给位置变量apos
    gl.vertexAttribPointer(aposLocation, 3, gl.FLOAT, false, 0, 0);
    //允许数据传递
    gl.enableVertexAttribArray(aposLocation);

    //创建缓冲区对象
    var indexesBuffer = gl.createBuffer();
    //绑定缓冲区对象
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexesBuffer);
    //索引数组indexes数据传入缓冲区
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, orderArr, gl.STATIC_DRAW);


    var aColor = gl.getAttribLocation(program, 'a_color');
    var colorData = new Float32Array([
      1,0,0, 0,1,0, 0,0,1, 1,1,0, 1,0,1, 0,1,1,      //红色——面1
      1,1,1, 0,0,0
  ])
    var colorBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, colorData, gl.STATIC_DRAW);
    gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(aColor)
    gl.enable(gl.DEPTH_TEST);

    //LINE_LOOP模式绘制前四个点
    gl.drawElements(gl.LINE_LOOP, 4, gl.UNSIGNED_BYTE, 0);
    //LINE_LOOP模式从第五个点开始绘制四个点
    gl.drawElements(gl.LINE_LOOP, 4, gl.UNSIGNED_BYTE, 4);
    //LINES模式绘制后8个点
    gl.drawElements(gl.LINES, 8, gl.UNSIGNED_BYTE, 8);

    function initShader(gl, vertexShaderSource, fragShaderSource) {
      var vertexShader = gl.createShader(gl.VERTEX_SHADER)
      var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
      gl.shaderSource(vertexShader, vertexShaderSource)
      gl.shaderSource(fragmentShader, fragShaderSource)
      gl.compileShader(vertexShader)
      gl.compileShader(fragmentShader)

      var program = gl.createProgram();
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program)
      gl.useProgram(program)
      return program
    }
  }, [])
  return (
    <canvas id="webgl" width={300} height={300} style={{ backgroundColor: 'purple' }}></canvas>
  )
}