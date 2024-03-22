import { useEffect } from "react"

function initShader(gl:WebGL2RenderingContext, vertexShaderSource: string, fragShaderSource: string) {
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

function drawBefore(gl:WebGL2RenderingContext, uMx: WebGLUniformLocation, uMy: WebGLUniformLocation, uTx: WebGLUniformLocation, x: Number) {
  var angle = 145
  function draw() {
    angle += 10
    let radian = angle * Math.PI / 180;
    let cos = Math.cos(radian);
    let sin = Math.sin(radian);
    let mx = new Float32Array([1,0,0,0, 0,cos,-sin,0, 0,sin,cos,0, 0,0,0,1]);
    let my = new Float32Array([cos,0,sin,0, 0,1,0,0, -sin,0,cos,0, 0,0,0,1]);
    let tx = new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, parseFloat(x + ''),0,0,1]);

    gl.uniformMatrix4fv(uMx, false, mx)
    gl.uniformMatrix4fv(uMy, false, my)
    gl.uniformMatrix4fv(uTx, false, tx)
    // requestAnimationFrame(draw)
    gl.drawArrays(gl.TRIANGLES, 0, 36)
  }
  draw()
}
var angle = 145
function changeDrawBefore(gl:WebGL2RenderingContext, uMx: WebGLUniformLocation, uMy: WebGLUniformLocation, uTx: WebGLUniformLocation, x: Number) {
  // function draw() {
    angle += 20
    let radian = angle * Math.PI / 180;
    let cos = Math.cos(radian);
    let sin = Math.sin(radian);
    let mx = new Float32Array([1,0,0,0, 0,cos,-sin,0, 0,sin,cos,0, 0,0,0,1]);
    let my = new Float32Array([cos,0,sin,0, 0,1,0,0, -sin,0,cos,0, 0,0,0,1]);
    let tx = new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, parseFloat(x + ''),0,0,1]);

    gl.uniformMatrix4fv(uMx, false, mx)
    gl.uniformMatrix4fv(uMy, false, my)
    gl.uniformMatrix4fv(uTx, false, tx)
    // requestAnimationFrame(draw)
    gl.drawArrays(gl.TRIANGLES, 0, 36)
  // }
  // draw()
}
export default function baseContent() {
  useEffect(() => {
    var canvas = document.getElementById('webgl')
    var gl = canvas?.getContext('webgl')
    var pointData = [
      .3, .3, .3, -.3, .3, .3, -.3, -.3, .3, .3, .3, .3, -.3, -.3, .3, .3, -.3, .3,      //面1
      .3, .3, .3, .3, -.3, .3, .3, -.3, -.3, .3, .3, .3, .3, -.3, -.3, .3, .3, -.3,      //面2
      .3, .3, .3, .3, .3, -.3, -.3, .3, -.3, .3, .3, .3, -.3, .3, -.3, -.3, .3, .3,      //面3
      -.3, .3, .3, -.3, .3, -.3, -.3, -.3, -.3, -.3, .3, .3, -.3, -.3, -.3, -.3, -.3, .3,//面4
      -.3, -.3, -.3, .3, -.3, -.3, .3, -.3, .3, -.3, -.3, -.3, .3, -.3, .3, -.3, -.3, .3,//面5
      .3, -.3, -.3, -.3, -.3, -.3, -.3, .3, -.3, .3, -.3, -.3, -.3, .3, -.3, .3, .3, -.3 //面6
    ];
    var data = new Float32Array(pointData)

    var vertexShaderSource = `
    attribute vec4 apos;//attribute声明vec4类型变量apos
    attribute vec4 a_color;// attribute声明顶点颜色变量
    attribute vec4 a_normal;//顶点法向量变量
    uniform vec3 u_lightColor;// uniform声明平行光颜色变量
    uniform vec3 u_lightPosition;// uniform声明平行光颜色变量
    varying vec4 v_color;//varying声明顶点颜色插值后变量
    uniform float angle;
    uniform mat4 mx;
    uniform mat4 my;
    uniform mat4 tx;
    void main() {

      //两个旋转矩阵、顶点齐次坐标连乘
      gl_Position = mx*my*tx*apos;
      // 顶点法向量进行矩阵变换，然后归一化
      vec3 normal = normalize((mx*my*a_normal).xyz);
      // 计算点光源照射顶点的方向并归一化
      vec3 lightDirection = normalize(vec3(gl_Position) - u_lightPosition);
      // 计算平行光方向向量和顶点法向量的点积
      float dot = max(dot(lightDirection, normal), 0.0);
      // 计算反射后的颜色
      vec3 reflectedLight = u_lightColor * a_color.rgb * dot;
      //颜色插值计算
      v_color = vec4(reflectedLight, a_color.a);
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
    var aNormal = gl.getAttribLocation(program, 'a_normal');
    var uLightColor = gl.getUniformLocation(program, 'u_lightColor');
    var uLightPosition = gl.getUniformLocation(program, 'u_lightPosition');
    var uAngle = gl.getUniformLocation(program, 'angle');
    var uMx = gl.getUniformLocation(program, 'mx');
    var uMy = gl.getUniformLocation(program, 'my');
    var uTx = gl.getUniformLocation(program, 'tx');
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

    var colors = [
      1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,      //红色——面1
      0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,//R=00——面2
      0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,//R=00——面3
      1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0,      //黄色——面4
      1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,      //黑色——面5
      1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,      //R=1——面6
    ]
    var colorData = new Float32Array(colors)
    var colorBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, colorData, gl.STATIC_DRAW);
    gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(aColor)

    gl.uniform3f(uLightColor, 1.0, 1.0, 1.0);
    //保证向量(x,y,-z)的长度为1，即单位向量
    // 如果不是单位向量，也可以再来着色器代码中进行归一化
    // var x = 1 / Math.sqrt(14), y = 2 / Math.sqrt(14), z = 3 / Math.sqrt(14);
    gl.uniform3f(uLightPosition, 2.0, 0, 4.0);

    var normals = [
      0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,//z轴正方向——面1
      1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,//x轴正方向——面2
      0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,//y轴正方向——面3
      -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,//x轴负方向——面4
      0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,//y轴负方向——面5
      0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1//z轴负方向——面6
    ]
    var normalData = new Float32Array(normals)
    var normalBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, normalData, gl.STATIC_DRAW);
    gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(aNormal);
    gl.enable(gl.DEPTH_TEST);
    // changeDrawBefore(gl, uMx, uMy, uTx, 0)
    // changeDrawBefore(gl, uMx, uMy, uTx, 0)
    // for(let i = 0; i < 4; i++) {
    //   changeDrawBefore(gl, uMx, uMy, uTx, 0)
    // }
    let time = 60
    let timeout = setTimeout(() => {
      if (time !== 0) {
        time--
        changeDrawBefore(gl, uMx, uMy, uTx, 0)
        timeout = setTimeout(() => {
          changeDrawBefore(gl, uMx, uMy, uTx, 0)
        }, 500)
      }
    }, 500)
  }, [])
  return (
    <canvas id="webgl" width={400} height={300} style={{ backgroundColor: 'purple' }}></canvas>
  )
}