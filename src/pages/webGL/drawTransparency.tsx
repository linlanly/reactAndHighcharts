import { useEffect } from "react"
function initShader(gl: WebGL2RenderingContext, vertexShaderSource: string, fragShaderSource: string) {
  var vertexShader: WebGLShader = gl.createShader(gl.VERTEX_SHADER)
  var fragmentShader: WebGLShader = gl.createShader(gl.FRAGMENT_SHADER)
  gl.shaderSource(vertexShader, vertexShaderSource)
  gl.shaderSource(fragmentShader, fragShaderSource)
  gl.compileShader(vertexShader)
  gl.compileShader(fragmentShader)

  var program: WebGLProgram = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program)
  gl.useProgram(program)
  return program
}
function bufferBindData(gl: WebGL2RenderingContext, data: Float32Array, param: any, num: number) {
  //创建缓冲区对象
  var buffer = gl.createBuffer();
  //绑定缓冲区对象,激活buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  //顶点数组data数据传入缓冲区
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  //缓冲区中的数据按照一定的规律传递给位置变量apos
  gl.vertexAttribPointer(param, num, gl.FLOAT, false, 0, 0);
  //允许数据传递
  gl.enableVertexAttribArray(param);
}

export default function baseContent() {
  useEffect(() => {
    var canvas = document.getElementById('webgl')
    var gl: WebGL2RenderingContext = canvas?.getContext('webgl')

    var vertexShaderSource = `
    attribute vec4 apos;
    attribute vec4 a_color;
    varying vec4 v_color;
    void main() {
      float radian = radians(30.0);
      float cos = cos(radian);
      float sin = sin(radian);
      mat4 mx = mat4(1,0,0,0, 0,cos,-sin,0, 0,sin,cos,0, 0,0,0,1);
      mat4 my = mat4(cos,0,sin,0, 0,1,0,0, -sin,0,cos,0, 0,0,0,1);
      gl_Position = mx * my * apos;
      v_color = a_color;
    }`

    var fragShaderSource = `
    precision lowp float;
    varying vec4 v_color;
      void main() {
        gl_FragColor = v_color;
      }`
    var program = initShader(gl, vertexShaderSource, fragShaderSource)
    var apos = gl.getAttribLocation(program, 'apos')
    var color = gl.getAttribLocation(program, 'a_color')

    var data = new Float32Array([
      //        立方体1
      .5,.5,.5,-.5,.5,.5,-.5,-.5,.5,.5,.5,.5,-.5,-.5,.5,.5,-.5,.5,      //面1
      .5,.5,.5,.5,-.5,.5,.5,-.5,-.5,.5,.5,.5,.5,-.5,-.5,.5,.5,-.5,      //面2
      .5,.5,.5,.5,.5,-.5,-.5,.5,-.5,.5,.5,.5,-.5,.5,-.5,-.5,.5,.5,      //面3
      -.5,.5,.5,-.5,.5,-.5,-.5,-.5,-.5,-.5,.5,.5,-.5,-.5,-.5,-.5,-.5,.5,//面4
      -.5,-.5,-.5,.5,-.5,-.5,.5,-.5,.5,-.5,-.5,-.5,.5,-.5,.5,-.5,-.5,.5,//面5
      .5,-.5,-.5,-.5,-.5,-.5,-.5,.5,-.5,.5,-.5,-.5,-.5,.5,-.5,.5,.5,-.5, //面6
      //        立方体2
      .2,.2,.2,-.2,.2,.2,-.2,-.2,.2,.2,.2,.2,-.2,-.2,.2,.2,-.2,.2,      //面1
      .2,.2,.2,.2,-.2,.2,.2,-.2,-.2,.2,.2,.2,.2,-.2,-.2,.2,.2,-.2,      //面2
      .2,.2,.2,.2,.2,-.2,-.2,.2,-.2,.2,.2,.2,-.2,.2,-.2,-.2,.2,.2,      //面2
      -.2,.2,.2,-.2,.2,-.2,-.2,-.2,-.2,-.2,.2,.2,-.2,-.2,-.2,-.2,-.2,.2,//面4
      -.2,-.2,-.2,.2,-.2,-.2,.2,-.2,.2,-.2,-.2,-.2,.2,-.2,.2,-.2,-.2,.2,//面2
      .2,-.2,-.2,-.2,-.2,-.2,-.2,.2,-.2,.2,-.2,-.2,-.2,.2,-.2,.2,.2,-.2 //面6
  ]);
    bufferBindData(gl, data, apos, 3)
    var colorData = new Float32Array([
      //        立方体1，透明度0.6
      1,0,0,0.6, 1,0,0,0.6, 1,0,0,0.6, 1,0,0,0.6, 1,0,0,0.6, 1,0,0,0.6,//红色——面1
      0,1,0,0.6, 0,1,0,0.6, 0,1,0,0.6, 0,1,0,0.6, 0,1,0,0.6, 0,1,0,0.6,//绿色——面2
      0,0,1,0.6, 0,0,1,0.6, 0,0,1,0.6, 0,0,1,0.6, 0,0,1,0.6, 0,0,1,0.6,//蓝色——面3
  
      1,1,0,0.6, 1,1,0,0.6, 1,1,0,0.6, 1,1,0,0.6, 1,1,0,0.6, 1,1,0,0.6,//黄色——面4
      0,0,0,0.6, 0,0,0,0.6, 0,0,0,0.6, 0,0,0,0.6, 0,0,0,0.6, 0,0,0,0.6,//黑色——面5
      1,1,1,0.6, 1,1,1,0.6, 1,1,1,0.6, 1,1,1,0.6, 1,1,1,0.6, 1,1,1,0.6, //白色——面6
      //        立方体2，不透明，A分量为1
      1,0,0,1.0, 1,0,0,1.0, 1,0,0,1.0, 1,0,0,1.0, 1,0,0,1.0, 1,0,0,1.0,//红色——面1
      0,1,0,1.0, 0,1,0,1.0, 0,1,0,1.0, 0,1,0,1.0, 0,1,0,1.0, 0,1,0,1.0,//绿色——面2
      0,0,1,1.0, 0,0,1,1.0, 0,0,1,1.0, 0,0,1,1.0, 0,0,1,1.0, 0,0,1,1.0,//蓝色——面3
  
      1,1,0,1.0, 1,1,0,1.0, 1,1,0,1.0, 1,1,0,1.0, 1,1,0,1.0, 1,1,0,1.0,//黄色——面4
      0,0,0,1.0, 0,0,0,1.0, 0,0,0,1.0, 0,0,0,1.0, 0,0,0,1.0, 0,0,0,1.0,//黑色——面5
      1,1,1,1.0, 1,1,1,1.0, 1,1,1,1.0, 1,1,1,1.0, 1,1,1,1.0, 1,1,1,1.0 //白色——面6
  ]);
    bufferBindData(gl, colorData, color, 4)
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    gl.drawArrays(gl.TRIANGLES, 0, 36)
    gl.enable(gl.DEPTH_TEST)
    gl.drawArrays(gl.TRIANGLES, 36, 36)
  }, [])
  return (
    <canvas id="webgl" width={500} height={500} style={{ backgroundColor: 'purple' }}></canvas>
  )
}