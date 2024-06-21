import { useEffect } from "react"

export default function baseContent() {
  useEffect(() => {
    var canvas = document.getElementById('webgl')
    var gl = canvas?.getContext('webgl')

    var vertexShaderSource = `
    void main() {
      gl_PointSize = 90.0;
      gl_Position = vec4(0.5, -0.5, 0.0, 1.0);
    }`

    var fragShaderSource = `
      void changeColor(inout lowp float color) {
        lowp float color = 0.2;
      }
      void main() {
        changeColor(color);
        gl_FragColor = vec4(0.0, 0.0, color, 1.0);
      }`
    var program = initShader(gl, vertexShaderSource, fragShaderSource)
    gl.drawArrays(gl.POINTS, 0, 1)

    function initShader(gl) {
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
    <canvas id="webgl" width={500} height={500} style={{backgroundColor: 'purple'}}></canvas>
  )
}