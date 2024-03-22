import { useEffect } from "react"

export default function baseContent() {
  useEffect(() => {
    var canvas = document.getElementById('webgl')
    var gl = canvas?.getContext('webgl')
    var data = new Float32Array([-0.2, 0.4, -0.3, 0.7, -0.6, -0.8, -0.9, -0.5, 0.7, -0.8]);

    var vertexShaderSource = `
    attribute vec4 apos;
    attribute vec4 a_color;
    varying vec4 v_color;
    void main() {
      //顶点坐标apos赋值给内置变量gl_Position
      //逐顶点处理数据
      gl_Position = apos;
      v_color = a_color;
    }
`

    var fragShaderSource = `
    precision lowp float;
    varying vec4 v_color;
      void main() {
        gl_FragColor = v_color;
      }`
    var program = initShader(gl, vertexShaderSource, fragShaderSource)
    var aposLocation = gl.getAttribLocation(program, 'apos');
    var aColor = gl.getAttribLocation(program, 'a_color');
    var colorData = new Float32Array([
      0.1, 0.4, 0,
      0.2, 0.4, 0,
      0.2, 0.8, 0,
      0.3, 0.4, 0.5,
      0.6, 0.7, 0.8,
      0.1, 0.5, 0.8])
    //创建缓冲区对象
    var buffer = gl.createBuffer();
    //绑定缓冲区对象,激活buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    //顶点数组data数据传入缓冲区
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    gl.bufferData(gl.ARRAY_BUFFER, colorData, gl.STATIC_DRAW);
    
    gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(aColor)

    //缓冲区中的数据按照一定的规律传递给位置变量apos
    gl.vertexAttribPointer(aposLocation, 2, gl.FLOAT, false, 0, 0);
    //允许数据传递
    gl.enableVertexAttribArray(aposLocation);

    var orderArr = new Int8Array([0, 1, 2, 3, 4, 5])
    var indexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, orderArr, gl.STATIC_DRAW)

    // var data = new Float32Array([
    //   -0.5, 0.5,
    //   0, 0, 1,
    //   0.5, 0.5,
    //   1, 0, 0
    // ]);
    /**
     创建缓冲区buffer，传入顶点颜色、位置数据data
     **/
    // var buffer = gl.createBuffer();
    // gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    // gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    // //4表示data数组一个元素占据的字节数
    // //倒数第二个参数4*5表示每5个元素是一个选择单元
    // //第2个参数2表示从5元素组成的一个选择单元中选择前2个作为顶点位置数据
    // gl.vertexAttribPointer(aposLocation, 2, gl.FLOAT, false, 4 * 5, 0);
    // //最后一个参数4*2表示5元素组成的一个选择单元中偏移2个元素
    // //第2个参数3表示从5元素组成的一个选择单元中选择后三个作为顶点颜色数据
    // gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 4 * 5, 4 * 2);
    // gl.enableVertexAttribArray(aposLocation);
    // gl.enableVertexAttribArray(aColor);

    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0);

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
    <canvas id="webgl" width={400} height={300} style={{ backgroundColor: 'purple' }}></canvas>
  )
}