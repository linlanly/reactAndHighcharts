import { useEffect } from "react"
function textureHanlder(gl: WebGL2RenderingContext, img: HTMLImageElement) {
  var texture = gl.createTexture();//创建纹理图像缓冲区
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false); //纹理图片上下反转
  gl.activeTexture(gl.TEXTURE0);//激活0号纹理单元TEXTURE0
  gl.bindTexture(gl.TEXTURE_2D, texture);//绑定纹理缓冲区
  //设置纹理贴图填充方式(纹理贴图像素尺寸大于顶点绘制区域像素尺寸)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  //设置纹理贴图填充方式(纹理贴图像素尺寸小于顶点绘制区域像素尺寸)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  //设置纹素格式，jpg格式对应gl.RGB
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
  // 进行绘制
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}


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

var vertexShaderSource = `
  attribute vec4 apos;//attribute声明vec4类型变量apos
  attribute vec4 a_color;// attribute声明顶点颜色变量
  attribute vec4 a_normal;//顶点法向量变量
  uniform vec3 u_lightColor;// uniform声明平行光颜色变量
  uniform vec3 u_lightPosition;// uniform声明平行光颜色变量
  varying vec4 v_color;//varying声明顶点颜色插值后变量
  uniform float angle;
  void main() {
    float radian = radians(angle);
    float cos = cos(radian);
    float sin = sin(radian);
    mat4 mx = mat4(1,0,0,0, 0,cos,-sin,0, 0,sin,cos,0, 0,0,0,1);
    mat4 my = mat4(cos,0,sin,0, 0,1,0,0, -sin,0,cos,0, 0,0,0,1);

    //两个旋转矩阵、顶点齐次坐标连乘
    gl_Position = mx*my*apos;
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

var vertexShaderSource1 = `
      attribute vec4 a_Position;//顶点位置坐标
      attribute vec2 a_TexCoord;//纹理坐标
      varying vec2 v_TexCoord;//插值后纹理坐标
      uniform float angle;
      void main() {
        float radian = radians(angle);
        float cos = cos(radian);
        float sin = sin(radian);
        mat4 mx = mat4(1,0,0,0, 0,cos,-sin,0, 0,sin,cos,0, 0,0,0,1);
        mat4 my = mat4(cos,0,sin,0, 0,1,0,0, -sin,0,cos,0, 0,0,0,1);
        //顶点坐标apos赋值给内置变量gl_Position
        gl_Position = mx*my*a_Position;
        //纹理坐标插值计算
        v_TexCoord = a_TexCoord;
      }`

var fragShaderSource1 = `
      //所有float类型数据的精度是highp
      precision highp float;
      // 接收插值后的纹理坐标
      varying vec2 v_TexCoord;
      // 纹理图片像素数据
      uniform sampler2D u_Sampler;
      void main() {
        vec4 texture = texture2D(u_Sampler,v_TexCoord);
        float luminance = 0.099*texture.r + 0.987*texture.g + 0.214*texture.b;
        // 采集纹素，逐片元赋值像素值
        gl_FragColor = texture;
      }`

var cubeData = new Float32Array([
  .3, .3, .3, -.3, .3, .3, -.3, -.3, .3, .3, .3, .3, -.3, -.3, .3, .3, -.3, .3,      //面1
  .3, .3, .3, .3, -.3, .3, .3, -.3, -.3, .3, .3, .3, .3, -.3, -.3, .3, .3, -.3,      //面2
  .3, .3, .3, .3, .3, -.3, -.3, .3, -.3, .3, .3, .3, -.3, .3, -.3, -.3, .3, .3,      //面3
  -.3, .3, .3, -.3, .3, -.3, -.3, -.3, -.3, -.3, .3, .3, -.3, -.3, -.3, -.3, -.3, .3,//面4
  -.3, -.3, -.3, .3, -.3, -.3, .3, -.3, .3, -.3, -.3, -.3, .3, -.3, .3, -.3, -.3, .3,//面5
  .3, -.3, -.3, -.3, -.3, -.3, -.3, .3, -.3, .3, -.3, -.3, -.3, .3, -.3, .3, .3, -.3 //面6
])

var cubeColor = new Float32Array([
  1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,      //红色——面1
  0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,//R=00——面2
  0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,//R=00——面3
  1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0,      //黄色——面4
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,      //黑色——面5
  1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,      //R=1——面6
])
var cubeNormal = new Float32Array([
  0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,//z轴正方向——面1
  1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,//x轴正方向——面2
  0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,//y轴正方向——面3
  -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,//x轴负方向——面4
  0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,//y轴负方向——面5
  0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1//z轴负方向——面6
])

var pointData = new Float32Array([
  -0.3, 0.3, -0.301,//左上角——v0
  -0.3, -0.3, -0.301,//左下角——v1
  0.3, 0.3, -0.301,//右上角——v2
  0.3, -0.3, -0.301//右下角——v3
])
var textureData = new Float32Array([
  0, 1,
  0, 0,
  1, 1,
  1, 0,
])
function drawRectangle(gl: WebGL2RenderingContext) {
  var program = initShader(gl, vertexShaderSource, fragShaderSource)
  gl.useProgram(program)

  var a_Position = gl.getAttribLocation(program, 'apos');
  var a_TexCoord = gl.getAttribLocation(program, 'a_color');
  var aNormal = gl.getAttribLocation(program, 'a_normal');
  var uLightColor = gl.getUniformLocation(program, 'u_lightColor');
  var uLightPosition = gl.getUniformLocation(program, 'u_lightPosition');
  var uAngle = gl.getUniformLocation(program, 'angle');
  gl.uniform1f(uAngle, 30);//纹理缓冲区单元TEXTURE0中的颜色数据传入片元着色器
  bufferBindData(gl, cubeData, a_Position, 3)

  gl.enable(gl.DEPTH_TEST);
  bufferBindData(gl, cubeColor, a_TexCoord, 3)

  gl.uniform3f(uLightColor, 1.0, 1.0, 1.0);
  //保证向量(x,y,-z)的长度为1，即单位向量
  // 如果不是单位向量，也可以再来着色器代码中进行归一化
  // var x = 1 / Math.sqrt(14), y = 2 / Math.sqrt(14), z = 3 / Math.sqrt(14);
  gl.uniform3f(uLightPosition, 2.0, 0, 4.0);
  bufferBindData(gl, cubeNormal, aNormal, 3)
  gl.drawArrays(gl.TRIANGLES, 0, 36)
}

function drawTexture(gl: WebGL2RenderingContext) {
  var program = initShader(gl, vertexShaderSource1, fragShaderSource1)
  gl.useProgram(program)
  var a_Position = gl.getAttribLocation(program, 'a_Position');
  var a_TexCoord = gl.getAttribLocation(program, 'a_TexCoord');
  var u_Sampler = gl.getUniformLocation(program, 'u_Sampler');
  var angle = gl.getUniformLocation(program, 'angle');
  gl.uniform1f(angle, 30);//纹理缓冲区单元TEXTURE0中的颜色数据传入片元着色器
  bufferBindData(gl, pointData, a_Position, 3)


  bufferBindData(gl, textureData, a_TexCoord, 3)
  gl.enable(gl.DEPTH_TEST);
  var img = new Image()
  img.src = '/src/assets/images/map.png'
  img.onload = function () {
    textureHanlder(gl, u_Sampler as WebGLUniformLocation, img);
  }
}
// drawTexture(gl)
// drawRectangle(gl)
export default function baseContent() {
  useEffect(() => {
    var canvas = document.getElementById('webgl')
    var gl: WebGL2RenderingContext = canvas?.getContext('webgl')
    var img = new Image()
    img.src = '/src/assets/images/map.png'
    textureHanlder(gl, img);
    img.onload = function () {
      var program = initShader(gl, vertexShaderSource, fragShaderSource)
      var program1 = initShader(gl, vertexShaderSource1, fragShaderSource1)

      gl.useProgram(program)
      var a_Position = gl.getAttribLocation(program, 'apos');
      var a_TexCoord = gl.getAttribLocation(program, 'a_color');
      var aNormal = gl.getAttribLocation(program, 'a_normal');
      var uLightColor = gl.getUniformLocation(program, 'u_lightColor');
      var uLightPosition = gl.getUniformLocation(program, 'u_lightPosition');
      var uAngle = gl.getUniformLocation(program, 'angle');
      gl.uniform1f(uAngle, 30);//纹理缓冲区单元TEXTURE0中的颜色数据传入片元着色器
      bufferBindData(gl, cubeData, a_Position, 3)
      bufferBindData(gl, cubeColor, a_TexCoord, 3)

      gl.uniform3f(uLightColor, 1.0, 1.0, 1.0);
      //保证向量(x,y,-z)的长度为1，即单位向量
      // 如果不是单位向量，也可以再来着色器代码中进行归一化
      // var x = 1 / Math.sqrt(14), y = 2 / Math.sqrt(14), z = 3 / Math.sqrt(14);
      gl.uniform3f(uLightPosition, 2.0, 0, 4.0);
      bufferBindData(gl, cubeNormal, aNormal, 3)
      gl.enable(gl.DEPTH_TEST);
      gl.drawArrays(gl.TRIANGLES, 0, 36)

      gl.useProgram(program1)
      var a_Position = gl.getAttribLocation(program1, 'a_Position');
      var a_TexCoord = gl.getAttribLocation(program1, 'a_TexCoord');
      var u_Sampler = gl.getUniformLocation(program1, 'u_Sampler');
      var angle = gl.getUniformLocation(program1, 'angle');
      gl.uniform1f(angle, 30);//纹理缓冲区单元TEXTURE0中的颜色数据传入片元着色器
      gl.uniform1i(u_Sampler, 0);//纹理缓冲区单元TEXTURE0中的颜色数据传入片元着色器
      bufferBindData(gl, pointData, a_Position, 3)
      bufferBindData(gl, textureData, a_TexCoord, 2)
      textureHanlder(gl, img);
    }
  }, [])
  return (
    <canvas id="webgl" width={500} height={500} style={{ backgroundColor: 'purple' }}></canvas>
  )
}