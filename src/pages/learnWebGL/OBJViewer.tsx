import { useEffect } from "react"
import Matrix4, { Vector3 } from "./cuon-matrix.js"
// OBJViewer.js (c) 2012 matsuda and itami
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'attribute vec4 a_Normal;\n' +
  'uniform mat4 u_MvpMatrix;\n' +
  'uniform mat4 u_NormalMatrix;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  vec3 lightDirection = vec3(-0.35, 0.35, 0.87);\n' +
  '  gl_Position = u_MvpMatrix * a_Position;\n' +
  '  vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
  '  float nDotL = max(dot(normal, lightDirection), 0.0);\n' +
  '  v_Color = vec4(a_Color.rgb * nDotL, a_Color.a);\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
  '}\n';
interface modelBuffer {
  vertexBuffer: WebGLBuffer | null,
  normalBuffer: WebGLBuffer | null,
  colorBuffer: WebGLBuffer | null,
  indexBuffer: WebGLBuffer | null
}
function createProgram(gl: WebGLRenderingContext, vsource: string, fsource: string): WebGLProgram | null {
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

let requestAnimationFrameID = 0
function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');
  if (!canvas) return

  // Get the rendering context for WebGL
  var gl = (canvas as HTMLCanvasElement).getContext('webgl');
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  let prorgamBefore = createProgram(gl, VSHADER_SOURCE, FSHADER_SOURCE)
  if (!prorgamBefore) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Set the clear color and enable the depth test
  gl.clearColor(0.2, 0.2, 0.2, 1.0);
  gl.enable(gl.DEPTH_TEST);

  // Get the storage locations of attribute and uniform variables
  var program = {
    program: prorgamBefore,
    a_Position: gl.getAttribLocation(prorgamBefore, 'a_Position'),
    a_Normal: gl.getAttribLocation(prorgamBefore, 'a_Normal'),
    a_Color: gl.getAttribLocation(prorgamBefore, 'a_Color'),
    u_MvpMatrix: gl.getUniformLocation(prorgamBefore, 'u_MvpMatrix'),
    u_NormalMatrix: gl.getUniformLocation(prorgamBefore, 'u_NormalMatrix')
  }

  if (program.a_Position < 0 || program.a_Normal < 0 || program.a_Color < 0 ||
    !program.u_MvpMatrix || !program.u_NormalMatrix) {
    console.log('attribute, uniform変数の格納場所の取得に失敗');
    return;
  }

  // Prepare empty buffer objects for vertex coordinates, colors, and normals
  var model = initVertexBuffers(gl, program);
  if (!model) {
    console.log('Failed to set the vertex information');
    return;
  }

  // ビュー投影行列を計算
  var viewProjMatrix = new Matrix4();
  viewProjMatrix.setPerspective(30.0, canvas.clientWidth / canvas.clientHeight, 1.0, 5000.0);
  viewProjMatrix.lookAt(0.0, 500.0, 200.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);

  // Start reading the OBJ file
  readOBJFile('/src/assets/objs/cube.obj', 60, true);

  var currentAngle = 0.0; // Current rotation angle [degree]
  var tick = function () {   // Start drawing
    currentAngle = animate(currentAngle); // Update current rotation angle
    draw(gl as WebGLRenderingContext, program, currentAngle, viewProjMatrix, model as modelBuffer);
    requestAnimationFrameID = requestAnimationFrame(tick);
  };
  tick();
}

// Create an buffer object and perform an initial configuration
function initVertexBuffers(gl: WebGLRenderingContext, program: any) {
  let o = {
    vertexBuffer: createEmptyArrayBuffer(gl, program.a_Position, 3, gl.FLOAT),
    normalBuffer: createEmptyArrayBuffer(gl, program.a_Normal, 3, gl.FLOAT),
    colorBuffer: createEmptyArrayBuffer(gl, program.a_Color, 4, gl.FLOAT),
    indexBuffer: gl.createBuffer(),
  }
  if (!o.vertexBuffer || !o.normalBuffer || !o.colorBuffer || !o.indexBuffer) { return null; }

  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return o;
}

// Create a buffer object, assign it to attribute variables, and enable the assignment
function createEmptyArrayBuffer(gl: WebGLRenderingContext, a_attribute: any, num: number, type: any) {
  var buffer = gl.createBuffer();  // Create a buffer object
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return null;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);  // Assign the buffer object to the attribute variable
  gl.enableVertexAttribArray(a_attribute);  // Enable the assignment

  return buffer;
}

// Read a file
function readOBJFile(fileName: string, scale: number, reverse: boolean) {
  var request = new XMLHttpRequest();

  request.onreadystatechange = function () {
    if (request.readyState === 4 && request.status !== 404) {
      onReadOBJFile(request.responseText, fileName, scale, reverse);
    }
  }
  request.open('GET', fileName, true); // Create a request to acquire the file
  request.send();                      // Send the request
}

var g_objDoc: OBJDoc | null = null;      // The information of OBJ file
var g_drawingInfo: DrawingInfo | null | undefined = null; // The information for drawing 3D model

// OBJ File has been read
function onReadOBJFile(fileString: string, fileName: string, scale: number, reverse: boolean) {
  var objDoc = new OBJDoc(fileName);  // Create a OBJDoc object
  var result = objDoc.parse(fileString, scale, reverse); // Parse the file
  if (!result) {
    g_objDoc = null; g_drawingInfo = null;
    console.log("OBJ file parsing error.");
    return;
  }
  g_objDoc = objDoc;
}

// Coordinate transformation matrix
var g_modelMatrix = new Matrix4();
var g_mvpMatrix = new Matrix4();
var g_normalMatrix = new Matrix4();

// 描画関数
function draw(gl: WebGLRenderingContext, program: any, angle: number, viewProjMatrix: Matrix4, model: modelBuffer) {
  if (g_objDoc != null && g_objDoc.isMTLComplete()) { // OBJ and all MTLs are available
    g_drawingInfo = onReadComplete(gl, model, g_objDoc);
    g_objDoc = null;
  }
  if (!g_drawingInfo) return;   // モデルを読み込み済みか判定

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);  // Clear color and depth buffers

  g_modelMatrix.setRotate(angle, 1.0, 0.0, 0.0); // 適当に回転
  g_modelMatrix.rotate(angle, 0.0, 1.0, 0.0);
  g_modelMatrix.rotate(angle, 0.0, 0.0, 1.0);

  // Calculate the normal transformation matrix and pass it to u_NormalMatrix
  g_normalMatrix.setInverseOf(g_modelMatrix);
  g_normalMatrix.transpose();
  gl.uniformMatrix4fv(program.u_NormalMatrix, false, g_normalMatrix.elements);

  // Calculate the model view project matrix and pass it to u_MvpMatrix
  g_mvpMatrix.set(viewProjMatrix);
  g_mvpMatrix.multiply(g_modelMatrix);
  gl.uniformMatrix4fv(program.u_MvpMatrix, false, g_mvpMatrix.elements);

  // Draw
  gl.drawElements(gl.TRIANGLES, g_drawingInfo.indices.length, gl.UNSIGNED_SHORT, 0);
}

// OBJ File has been read compreatly
function onReadComplete(gl: WebGLRenderingContext, model: modelBuffer, objDoc: OBJDoc) {
  // Acquire the vertex coordinates and colors from OBJ file
  var drawingInfo = objDoc.getDrawingInfo();
  if (!drawingInfo) return

  // Write date into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, model.vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.vertices, gl.STATIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, model.normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.normals, gl.STATIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, model.colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.colors, gl.STATIC_DRAW);

  // Write the indices to the buffer object
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, drawingInfo.indices, gl.STATIC_DRAW);

  return drawingInfo;
}

var ANGLE_STEP = 30;   // The increments of rotation angle (degrees)

var last = Date.now(); // Last time that this function was called
function animate(angle: number) {
  var now = Date.now();   // Calculate the elapsed time
  var elapsed = now - last;
  last = now;
  // Update the current rotation angle (adjusted by the elapsed time)
  var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
  return newAngle % 360;
}

//------------------------------------------------------------------------------
// OBJParser
//------------------------------------------------------------------------------

// OBJDoc object
// Constructor
class OBJDoc {
  // this.fileName = fileName;
  // this.mtls = new Array(0);      // Initialize the property for MTL
  // this.objects = new Array(0);   // Initialize the property for Object
  // this.vertices = new Array(0);  // Initialize the property for Vertex
  // this.normals = new Array(0);   // Initialize the property for Normal
  fileName: string
  mtls: Array<MTLDoc> = []
  objects: Array<OBJObject> = []
  vertices: Array<Vertex> = []
  normals: Array<Normal> = []
  constructor(fileName: string) {
    this.fileName = fileName
  }
  parse(fileString: string, scale: number, reverse: boolean) {
    var lines: Array<string | null> = fileString.split('\n');  // Break up into lines and store them as array
    lines.push(null); // Append null
    var index = 0;    // Initialize index of line

    var currentObject = null;
    var currentMaterialName = "";

    // Parse line by line
    var line;         // A string in the line to be parsed
    var sp = new StringParser();  // Create StringParser
    while ((line = lines[index++]) != null) {
      sp.init(line);                  // init StringParser
      var command = sp.getWord();     // Get command
      if (command == null) continue;  // check null command

      switch (command) {
        case '#':
          continue;  // Skip comments
        case 'mtllib':     // Read Material chunk
          var path = this.parseMtllib(sp, this.fileName);
          var mtl = new MTLDoc();   // Create MTL instance
          this.mtls.push(mtl);
          var request = new XMLHttpRequest();
          request.onreadystatechange = function () {
            if (request.readyState == 4) {
              if (request.status != 404) {
                onReadMTLFile(request.responseText, mtl);
              } else {
                mtl.complete = true;
              }
            }
          }
          request.open('GET', path, true);  // Create a request to acquire the file
          request.send();                   // Send the request
          continue; // Go to the next line
        case 'o':
        case 'g':   // Read Object name
          var object = this.parseObjectName(sp);
          this.objects.push(object);
          currentObject = object;
          continue; // Go to the next line
        case 'v':   // Read vertex
          var vertex = this.parseVertex(sp, scale);
          this.vertices.push(vertex);
          continue; // Go to the next line
        case 'vn':   // Read normal
          var normal = this.parseNormal(sp);
          this.normals.push(normal);
          continue; // Go to the next line
        case 'usemtl': // Read Material name
          currentMaterialName = this.parseUsemtl(sp) || '';
          continue; // Go to the next line
        case 'f': // Read face
          var face = this.parseFace(sp, currentMaterialName, this.vertices, reverse);
          if (currentObject) {
            currentObject.addFace(face);
          }
          continue; // Go to the next line
      }
    }

    return true;
  }
  parseMtllib(sp: StringParser, fileName: string) {
    // Get directory path
    var i = fileName.lastIndexOf("/");
    var dirPath = "";
    if (i > 0) dirPath = fileName.substr(0, i + 1);

    return dirPath + sp.getWord();   // Get path
  }
  parseObjectName(sp: StringParser) {
    var name = sp.getWord();
    return (new OBJObject(name));
  }
  parseVertex(sp: StringParser, scale: number) {
    var x = sp.getFloat() * scale;
    var y = sp.getFloat() * scale;
    var z = sp.getFloat() * scale;
    return (new Vertex(x, y, z));
  }
  parseNormal(sp: StringParser) {
    var x = sp.getFloat();
    var y = sp.getFloat();
    var z = sp.getFloat();
    return (new Normal(x, y, z));
  }
  parseUsemtl(sp: StringParser) {
    return sp.getWord();
  }
  parseFace = function (sp: StringParser, materialName: string, vertices: Array<Vertex>, reverse: boolean) {
    var face = new Face(materialName);
    // get indices
    for (; ;) {
      var word = sp.getWord();
      if (word == null) break;
      var subWords = word.split('/');
      if (subWords.length >= 1) {
        var vi = parseInt(subWords[0]) - 1;
        face.vIndices.push(vi);
      }
      if (subWords.length >= 3) {
        var ni = parseInt(subWords[2]) - 1;
        face.nIndices.push(ni);
      } else {
        face.nIndices.push(-1);
      }
    }

    // calc normal
    var v0 = [
      vertices[face.vIndices[0]].x,
      vertices[face.vIndices[0]].y,
      vertices[face.vIndices[0]].z];
    var v1 = [
      vertices[face.vIndices[1]].x,
      vertices[face.vIndices[1]].y,
      vertices[face.vIndices[1]].z];
    var v2 = [
      vertices[face.vIndices[2]].x,
      vertices[face.vIndices[2]].y,
      vertices[face.vIndices[2]].z];

    // 面の法線を計算してnormalに設定
    var normal = calcNormal(v0, v1, v2);
    // 法線が正しく求められたか調べる
    if (normal == null) {
      if (face.vIndices.length >= 4) { // 面が四角形なら別の3点の組み合わせで法線計算
        var v3 = [
          vertices[face.vIndices[3]].x,
          vertices[face.vIndices[3]].y,
          vertices[face.vIndices[3]].z];
        normal = calcNormal(v1, v2, v3);
      }
      if (normal == null) {         // 法線が求められなかったのでY軸方向の法線とする
        normal = [0.0, 1.0, 0.0];
      }
    }
    if (reverse) {
      normal[0] = -normal[0];
      normal[1] = -normal[1];
      normal[2] = -normal[2];
    }
    face.normal = new Normal(normal[0], normal[1], normal[2]);

    // Devide to triangles if face contains over 3 points.
    if (face.vIndices.length > 3) {
      var n = face.vIndices.length - 2;
      var newVIndices = new Array(n * 3);
      var newNIndices = new Array(n * 3);
      for (var i = 0; i < n; i++) {
        newVIndices[i * 3 + 0] = face.vIndices[0];
        newVIndices[i * 3 + 1] = face.vIndices[i + 1];
        newVIndices[i * 3 + 2] = face.vIndices[i + 2];
        newNIndices[i * 3 + 0] = face.nIndices[0];
        newNIndices[i * 3 + 1] = face.nIndices[i + 1];
        newNIndices[i * 3 + 2] = face.nIndices[i + 2];
      }
      face.vIndices = newVIndices;
      face.nIndices = newNIndices;
    }
    face.numIndices = face.vIndices.length;

    return face;
  }
  isMTLComplete() {
    if (this.mtls.length == 0) return true;
    for (var i = 0; i < this.mtls.length; i++) {
      if (!this.mtls[i].complete) return false;
    }
    return true;
  }
  findColor(name: string) {
    for (var i = 0; i < this.mtls.length; i++) {
      for (var j = 0; j < this.mtls[i].materials.length; j++) {
        if (this.mtls[i].materials[j].name == name) {
          return (this.mtls[i].materials[j].color)
        }
      }
    }
    return (new Color(0.8, 0.8, 0.8, 1));
  }
  getDrawingInfo() {
    // Create an arrays for vertex coordinates, normals, colors, and indices
    var numIndices = 0;
    for (var i = 0; i < this.objects.length; i++) {
      numIndices += this.objects[i].numIndices;
    }
    var numVertices = numIndices;
    var vertices = new Float32Array(numVertices * 3);
    var normals = new Float32Array(numVertices * 3);
    var colors = new Float32Array(numVertices * 4);
    var indices = new Uint16Array(numIndices);

    // Set vertex, normal and color
    var index_indices = 0;
    for (var i = 0; i < this.objects.length; i++) {
      var object = this.objects[i];
      for (var j = 0; j < object.faces.length; j++) {
        var face = object.faces[j];
        var color = this.findColor(face.materialName);
        var faceNormal = face.normal;
        for (var k = 0; k < face.vIndices.length; k++) {
          // Set index
          indices[index_indices] = index_indices;
          // Copy vertex
          var vIdx = face.vIndices[k];
          var vertex = this.vertices[vIdx];
          vertices[index_indices * 3 + 0] = vertex.x;
          vertices[index_indices * 3 + 1] = vertex.y;
          vertices[index_indices * 3 + 2] = vertex.z;
          // Copy color
          colors[index_indices * 4 + 0] = color.r;
          colors[index_indices * 4 + 1] = color.g;
          colors[index_indices * 4 + 2] = color.b;
          colors[index_indices * 4 + 3] = color.a;
          // Copy normal
          var nIdx = face.nIndices[k];
          if (nIdx >= 0) {
            var normal = this.normals[nIdx];
            normals[index_indices * 3 + 0] = normal.x;
            normals[index_indices * 3 + 1] = normal.y;
            normals[index_indices * 3 + 2] = normal.z;
          } else {
            if (!faceNormal) return;
            normals[index_indices * 3 + 0] = faceNormal.x;
            normals[index_indices * 3 + 1] = faceNormal.y;
            normals[index_indices * 3 + 2] = faceNormal.z;
          }
          index_indices++;
        }
      }
    }

    return new DrawingInfo(vertices, normals, colors, indices);
  }

}

// Analyze the material file
function onReadMTLFile(fileString: string, mtl: MTLDoc) {
  var lines: Array<string | null> = fileString.split('\n');  // Break up into lines and store them as array
  lines.push(null);           // Append null
  var index = 0;              // Initialize index of line

  // Parse line by line
  var line;      // A string in the line to be parsed
  var name: string | null = ""; // Material name
  var sp = new StringParser();  // Create StringParser
  while ((line = lines[index++]) != null) {
    sp.init(line);                  // init StringParser
    var command = sp.getWord();     // Get command
    if (command == null) continue;  // check null command

    switch (command) {
      case '#':
        continue;    // Skip comments
      case 'newmtl': // Read Material chunk
        name = mtl.parseNewmtl(sp);    // Get name
        continue; // Go to the next line
      case 'Kd':   // Read normal
        if (name == "" || name === null) continue; // Go to the next line because of Error
        var material = mtl.parseRGB(sp, name);
        mtl.materials.push(material);
        name = "";
        continue; // Go to the next line
    }
  }
  mtl.complete = true;
}

//------------------------------------------------------------------------------
// MTLDoc Object
//------------------------------------------------------------------------------
class MTLDoc {
  complete: boolean = false
  materials: Array<Material> = []
  parseNewmtl(sp: StringParser) {
    return sp.getWord()
  }
  parseRGB = function (sp: StringParser, name: string) {
    var r = sp.getFloat();
    var g = sp.getFloat();
    var b = sp.getFloat();
    return (new Material(name, r, g, b, 1));
  }
}

//------------------------------------------------------------------------------
// Material Object
//------------------------------------------------------------------------------
class Material {
  name: string
  color: Color
  constructor(name: string, r: number, g: number, b: number, a: number) {
    this.name = name
    this.color = new Color(r, g, b, a)
  }
}

//------------------------------------------------------------------------------
// Vertex Object
//------------------------------------------------------------------------------
class Vertex {
  x: number = 0
  y: number = 0
  z: number = 0
  constructor(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
}

//------------------------------------------------------------------------------
// Normal Object
//------------------------------------------------------------------------------
class Normal {
  x: number = 0
  y: number = 0
  z: number = 0
  constructor(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
}

//------------------------------------------------------------------------------
// Color Object
//------------------------------------------------------------------------------
class Color {
  r: number = 0
  g: number = 0
  b: number = 0
  a: number = 0
  constructor(r: number, g: number, b: number, a: number) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }
}

//------------------------------------------------------------------------------
// OBJObject Object
//------------------------------------------------------------------------------
class OBJObject {
  name: string = ''
  faces: Array<Face> = []
  numIndices: number = 0
  constructor(name: string | null) {
    this.name = name || ''
    this.faces = []
    this.numIndices = 0
  }
  addFace(face: Face) {
    this.faces.push(face)
    this.numIndices += face.numIndices
  }
}

//------------------------------------------------------------------------------
// Face Object
//------------------------------------------------------------------------------
class Face {
  materialName: string = ''
  vIndices = new Array(0);
  nIndices = new Array(0);
  normal: Normal | null = null
  numIndices: number = 0

  constructor(materialName: string) {
    this.materialName = materialName
    if (materialName === null) {
      this.materialName = ""
    }
    this.vIndices = []
    this.nIndices = []
  }

}

//------------------------------------------------------------------------------
// DrawInfo Object
//------------------------------------------------------------------------------
class DrawingInfo {
  vertices: Float32Array
  normals: Float32Array
  colors: Float32Array
  indices: Uint16Array
  constructor(vertices: Float32Array, normals: Float32Array, colors: Float32Array, indices: Uint16Array) {
    this.vertices = vertices;
    this.normals = normals;
    this.colors = colors;
    this.indices = indices;
  }
}

//------------------------------------------------------------------------------
// Constructor
class StringParser {
  str: string = ''
  index: number = 0
  init(str: string) {
    this.str = str
    this.index = 0
  }
  skipDelimiters() {
    for (var i = this.index, len = this.str.length; i < len; i++) {
      var c = this.str.charAt(i);
      // Skip TAB, Space, '(', ')
      if (c == '\t' || c == ' ' || c == '(' || c == ')' || c == '"') continue;
      break;
    }
    this.index = i;
  }
  skipToNextWord() {
    this.skipDelimiters();
    var n = getWordLength(this.str, this.index);
    this.index += (n + 1);
  }
  getWord() {
    this.skipDelimiters();
    var n = getWordLength(this.str, this.index);
    if (n == 0) return null;
    var word = this.str.substr(this.index, n);
    this.index += (n + 1);

    return word;
  }
  getInt() {
    let value = this.getWord()
    return value === null ? 0 : parseInt(value);
  }
  getFloat() {
    let value = this.getWord()
    return value === null ? 0 : parseFloat(value);
  }
}

// Get the length of word
function getWordLength(str: string, start: number) {
  var n = 0;
  for (var i = start, len = str.length; i < len; i++) {
    var c = str.charAt(i);
    if (c == '\t' || c == ' ' || c == '(' || c == ')' || c == '"')
      break;
  }
  return i - start;
}

//------------------------------------------------------------------------------
// Common function
//------------------------------------------------------------------------------
function calcNormal(p0: Array<number>, p1: Array<number>, p2: Array<number>) {
  // v0: a vector from p1 to p0, v1; a vector from p1 to p2
  var v0 = new Float32Array(3);
  var v1 = new Float32Array(3);
  for (var i = 0; i < 3; i++) {
    v0[i] = p0[i] - p1[i];
    v1[i] = p2[i] - p1[i];
  }

  // The cross product of v0 and v1
  var c = new Float32Array(3);
  c[0] = v0[1] * v1[2] - v0[2] * v1[1];
  c[1] = v0[2] * v1[0] - v0[0] * v1[2];
  c[2] = v0[0] * v1[1] - v0[1] * v1[0];

  // Normalize the result
  var v = new Vector3(c);
  v.normalize();
  return v.elements;
}
export default function baseContent() {
  useEffect(() => {
    let doc = document.getElementById('webgl')
    if (doc) {
      doc.addEventListener('webglcontextrestord', function() {
        main()
      }, false)
      doc.addEventListener('webglcontextlost', function (event) {
        window.cancelAnimationFrame(requestAnimationFrameID)
        event.preventDefault()
      }, false)
    }
    main()
  }, [])
  return (
    <>
      <canvas id="webgl" width={500} height={500}></canvas>
    </>

  )
}