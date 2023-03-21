"use strict";
import { shopping } from "../../data/shopping.js";
import { setGeometry, setColors } from "./geometryColors.js";
import { m4 } from "./m4.js";

const vShader = `#version 300 es
  in vec4 a_position;
  uniform mat4 u_matrix;

  in vec4 a_color;
  out vec4 v_color;
  
  void main() {
    gl_Position = u_matrix * a_position;
    v_color = a_color;
  }
`;

const fShader = `#version 300 es
    precision highp float;
    
    in vec4 v_color;
    out vec4 outColor;

    void main() {
      outColor = v_color;
    }
    `;

const number_objs = shopping.itens.length;
const NUMBER_OBJS = number_objs;

var cardShapes; // html: webgl

var program = null;
var vao = null;
var colorAttribLocation = null;
var positionAttribLocation = null;
var matrixLocation = null;
var then = 0;
var deltaTime;

function main(NUMBER_OBJS, shapes) {
  // cards shapes
  var gl;
  for (let i = 0; i < NUMBER_OBJS; ++i) {
    gl = getGLContext(`object${i}`);
    program = createProgram(gl, vShader, fShader);
    setWebGl(gl, program);
    drawShape(gl, shapes, i);
  }

  function setWebGl(gl, program) {
    positionAttribLocation = gl.getAttribLocation(program, "a_position");
    colorAttribLocation = gl.getAttribLocation(program, "a_color");
    matrixLocation = gl.getUniformLocation(program, "u_matrix");

    var positionBuffer = gl.createBuffer();
    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.enableVertexAttribArray(positionAttribLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    setGeometry(gl);

    var size = 3; // 2 components per iteration
    var type = gl.FLOAT; // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0; // start at the beginning of the buffer
    gl.vertexAttribPointer(
      positionAttribLocation,
      size,
      type,
      normalize,
      stride,
      offset
    );

    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    setColors(gl);
    gl.enableVertexAttribArray(colorAttribLocation);
    gl.vertexAttribPointer(
      colorAttribLocation,
      3,
      gl.UNSIGNED_BYTE,
      true,
      0,
      0
    );
  }

  //função para toacionar, mas n consigo chamar quando da o hover
  function drawScene(now) {
    console.log(shapes[index]);
    now *= 0.001;
    deltaTime = now - then;
    then = now;

    shapes[index].rotation[0] += Math.sin(0.2 * deltaTime);
    shapes[index].rotation[1] += 0.3 * deltaTime;

    webglUtils.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clearColor(0, 0, 0, 0); // Clear the canvas
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    gl.useProgram(program);
    gl.bindVertexArray(vao);

    var matrix = m4.projection(
      gl.canvas.clientWidth,
      gl.canvas.clientHeight,
      500
    );
    matrix = m4.translate(
      matrix,
      shapes[index].translation[0],
      shapes[index].translation[1],
      shapes[index].translation[2]
    );
    matrix = m4.xRotate(matrix, shapes[index].rotation[0]);
    matrix = m4.yRotate(matrix, shapes[index].rotation[1]);
    matrix = m4.zRotate(matrix, shapes[index].rotation[2]);
    matrix = m4.scale(
      matrix,
      shapes[index].scale[0],
      shapes[index].scale[1],
      shapes[index].scale[2]
    );

    gl.uniformMatrix4fv(matrixLocation, false, matrix);

    gl.drawArrays(gl.TRIANGLES, 0, 12 * 3);

    requestAnimationFrame(drawScene);
  }
}

function drawShape(gl, shapes, index) {
  webglUtils.resizeCanvasToDisplaySize(gl.canvas);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  gl.clearColor(0, 0, 0, 0); // Clear the canvas
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);

  gl.useProgram(program);
  gl.bindVertexArray(vao);

  var matrix = m4.projection(
    gl.canvas.clientWidth,
    gl.canvas.clientHeight,
    500
  );
  matrix = m4.translate(
    matrix,
    shapes[index].translation[0],
    shapes[index].translation[1],
    shapes[index].translation[2]
  );
  matrix = m4.xRotate(matrix, shapes[index].rotation[0]);
  matrix = m4.yRotate(matrix, shapes[index].rotation[1]);
  matrix = m4.zRotate(matrix, shapes[index].rotation[2]);
  matrix = m4.scale(
    matrix,
    shapes[index].scale[0],
    shapes[index].scale[1],
    shapes[index].scale[2]
  );

  gl.uniformMatrix4fv(matrixLocation, false, matrix);

  gl.drawArrays(gl.TRIANGLES, 0, 12 * 3);
}

function getGLContext(canvas) {
  var gl = document.getElementById(canvas).getContext("webgl2");
  if (!gl) {
    console.log("WebGL não encontrado.");
    return undefined;
  }
  return gl;
}

function createProgram(gl, vertex, fragment) {
  var vShader = createShader(gl, vertex, gl.VERTEX_SHADER);
  var fShader = createShader(gl, fragment, gl.FRAGMENT_SHADER);

  var program = gl.createProgram();
  gl.attachShader(program, vShader);
  gl.attachShader(program, fShader);
  gl.linkProgram(program);
  var success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) return program;

  console.log("Problema com programa WebGL.");
  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
  return undefined;

  function createShader(gl, source, type) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) return shader;

    console.log(`Problema com Shader WebGL: ${type}.`);
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return undefined;
  }
}

function radToDeg(r) {
  return (r * 180) / Math.PI;
}

function degToRad(d) {
  return (d * Math.PI) / 180;
}

function generateShapes(number, mult1, mult2) {
  var shapes = [];
  for (let i = 0; i < number; ++i) {
    shapes.push({
      translation: [1 * mult1, 1 * mult1, 0],
      rotation: [
        degToRad(Math.random() * 75),
        degToRad(Math.random() * 75),
        degToRad(Math.random() * 75),
      ],
      scale: [0.2 * mult2, 0.2 * mult2, 0.2 * mult2],
      // color: [Math.random(), Math.random(), Math.random(), 1],
      price: Math.round(Math.random() * 50),
    });
  }
  return shapes;
}

function start() {
  cardShapes = generateShapes(NUMBER_OBJS, 125, 1);
  main(NUMBER_OBJS, cardShapes);
}

start();
