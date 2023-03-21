"use strict";
import { shopping } from "../../data/shopping.js";
import { setGeometry, setColors } from "./geometryColors.js";
import { m4 } from "./m4.js";

const vShader = `#version 300 es
in vec4 a_position;
in vec3 a_normal;

uniform mat4 u_projection;
uniform mat4 u_view;
uniform mat4 u_world;

out vec3 v_normal;

void main() {
  gl_Position = u_projection * u_view * u_world * a_position;
  v_normal = mat3(u_world) * a_normal;
}
`;

const fShader = `#version 300 es
precision highp float;

in vec3 v_normal;

uniform vec4 u_diffuse;
uniform vec3 u_lightDirection;

out vec4 outColor;

void main () {
  vec3 normal = normalize(v_normal);
  float fakeLight = dot(u_lightDirection, normal) * .5 + .5;
  outColor = vec4(u_diffuse.rgb * fakeLight, u_diffuse.a);
}
    `;

const number_objs = shopping.itens.length;
const NUMBER_OBJS = number_objs;

var objectFiles = [
  "../../../project1/objects/thermos/termos.obj",
  "../../../project1/objects/mugRed/mug.obj",
  "../../../project1/objects/mugBlack/mugblack.obj",
];

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
    twgl.setAttributePrefix("a_");
    const meshProgramInfo = twgl.createProgramInfo(gl, [vShader, fShader]);
    setWebGl(gl, meshProgramInfo, obj);
    drawShape(gl, shapes, i);
  }

  async function setWebGl(gl, meshProgramInfo, obj) {
    const response = await fetch(obj);
    const text = await response.text();
    const obj = parseOBJ(text);

    const parts = obj.geometries.map(({ data }) => {
      // Because data is just named arrays like this
      //
      // {
      //   position: [...],
      //   texcoord: [...],
      //   normal: [...],
      // }
      //
      // and because those names match the attributes in our vertex
      // shader we can pass it directly into `createBufferInfoFromArrays`
      // from the article "less code more fun".

      // create a buffer for each array by calling
      // gl.createBuffer, gl.bindBuffer, gl.bufferData
      const bufferInfo = twgl.createBufferInfoFromArrays(gl, data);
      // fills out a vertex array by calling gl.createVertexArray, gl.bindVertexArray
      // then gl.bindBuffer, gl.enableVertexAttribArray, and gl.vertexAttribPointer for each attribute
      const vao = twgl.createVAOFromBufferInfo(gl, meshProgramInfo, bufferInfo);
      return {
        material: {
          u_diffuse: [Math.random(), Math.random(), Math.random(), 1],
        },
        bufferInfo,
        vao,
      };
    });
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
