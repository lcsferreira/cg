"use strict";

// https://webgl2fundamentals.org/webgl/lessons/webgl-3d-perspective.html
"use strict";

var m3 = {
  translation: function translation(tx, ty) {
    return [1, 0, 0, 0, 1, 0, tx, ty, 1];
  },

  rotation: function rotation(angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);
    return [c, -s, 0, s, c, 0, 0, 0, 1];
  },

  scaling: function scaling(sx, sy) {
    return [sx, 0, 0, 0, sy, 0, 0, 0, 1];
  },

  multiply: function multiply(a, b) {
    var a00 = a[0 * 3 + 0];
    var a01 = a[0 * 3 + 1];
    var a02 = a[0 * 3 + 2];
    var a10 = a[1 * 3 + 0];
    var a11 = a[1 * 3 + 1];
    var a12 = a[1 * 3 + 2];
    var a20 = a[2 * 3 + 0];
    var a21 = a[2 * 3 + 1];
    var a22 = a[2 * 3 + 2];
    var b00 = b[0 * 3 + 0];
    var b01 = b[0 * 3 + 1];
    var b02 = b[0 * 3 + 2];
    var b10 = b[1 * 3 + 0];
    var b11 = b[1 * 3 + 1];
    var b12 = b[1 * 3 + 2];
    var b20 = b[2 * 3 + 0];
    var b21 = b[2 * 3 + 1];
    var b22 = b[2 * 3 + 2];
    return [
      b00 * a00 + b01 * a10 + b02 * a20,
      b00 * a01 + b01 * a11 + b02 * a21,
      b00 * a02 + b01 * a12 + b02 * a22,
      b10 * a00 + b11 * a10 + b12 * a20,
      b10 * a01 + b11 * a11 + b12 * a21,
      b10 * a02 + b11 * a12 + b12 * a22,
      b20 * a00 + b21 * a10 + b22 * a20,
      b20 * a01 + b21 * a11 + b22 * a21,
      b20 * a02 + b21 * a12 + b22 * a22,
    ];
  },
};

var m4 = {
  perspective: function (fieldOfViewInRadians, aspect, near, far) {
    var f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians);
    var rangeInv = 1.0 / (near - far);

    return [
      f / aspect,
      0,
      0,
      0,
      0,
      f,
      0,
      0,
      0,
      0,
      (near + far) * rangeInv,
      -1,
      0,
      0,
      near * far * rangeInv * 2,
      0,
    ];
  },

  projection: function (width, height, depth) {
    // Note: This matrix flips the Y axis so 0 is at the top.
    return [
      2 / width,
      0,
      0,
      0,
      0,
      -2 / height,
      0,
      0,
      0,
      0,
      2 / depth,
      0,
      -1,
      1,
      0,
      1,
    ];
  },

  multiply: function (a, b) {
    var a00 = a[0 * 4 + 0];
    var a01 = a[0 * 4 + 1];
    var a02 = a[0 * 4 + 2];
    var a03 = a[0 * 4 + 3];
    var a10 = a[1 * 4 + 0];
    var a11 = a[1 * 4 + 1];
    var a12 = a[1 * 4 + 2];
    var a13 = a[1 * 4 + 3];
    var a20 = a[2 * 4 + 0];
    var a21 = a[2 * 4 + 1];
    var a22 = a[2 * 4 + 2];
    var a23 = a[2 * 4 + 3];
    var a30 = a[3 * 4 + 0];
    var a31 = a[3 * 4 + 1];
    var a32 = a[3 * 4 + 2];
    var a33 = a[3 * 4 + 3];
    var b00 = b[0 * 4 + 0];
    var b01 = b[0 * 4 + 1];
    var b02 = b[0 * 4 + 2];
    var b03 = b[0 * 4 + 3];
    var b10 = b[1 * 4 + 0];
    var b11 = b[1 * 4 + 1];
    var b12 = b[1 * 4 + 2];
    var b13 = b[1 * 4 + 3];
    var b20 = b[2 * 4 + 0];
    var b21 = b[2 * 4 + 1];
    var b22 = b[2 * 4 + 2];
    var b23 = b[2 * 4 + 3];
    var b30 = b[3 * 4 + 0];
    var b31 = b[3 * 4 + 1];
    var b32 = b[3 * 4 + 2];
    var b33 = b[3 * 4 + 3];
    return [
      b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
      b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
      b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
      b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
      b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
      b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
      b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
      b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
      b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
      b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
      b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
      b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
      b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
      b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
      b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
      b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
    ];
  },

  translation: function (tx, ty, tz) {
    return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, tx, ty, tz, 1];
  },

  xRotation: function (angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    return [1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1];
  },

  yRotation: function (angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    return [c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1];
  },

  zRotation: function (angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    return [c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  },

  scaling: function (sx, sy, sz) {
    return [sx, 0, 0, 0, 0, sy, 0, 0, 0, 0, sz, 0, 0, 0, 0, 1];
  },

  translate: function (m, tx, ty, tz) {
    return m4.multiply(m, m4.translation(tx, ty, tz));
  },

  xRotate: function (m, angleInRadians) {
    return m4.multiply(m, m4.xRotation(angleInRadians));
  },

  yRotate: function (m, angleInRadians) {
    return m4.multiply(m, m4.yRotation(angleInRadians));
  },

  zRotate: function (m, angleInRadians) {
    return m4.multiply(m, m4.zRotation(angleInRadians));
  },

  scale: function (m, sx, sy, sz) {
    return m4.multiply(m, m4.scaling(sx, sy, sz));
  },
};

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

function setGeometry(gl) {
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      // front face
      -150, -150, 0.0, -150, 150, 0.0, 150, 150, 0.0,

      -150, -150, 0.0, 150, 150, 0.0, 150, -150, 0.0,

      // left face
      -150, -150, 150, -150, 150, 150, -150, 150, 0.0,

      -150, -150, 150, -150, 150, 0.0, -150, -150, 0.0,

      // bottom face
      -150, -150, 0.0, 150, -150, 0.0, 150, -150, 150,

      150, -150, 150, -150, -150, 150, -150, -150, 0.0,

      //back face
      150, 150, 150, 150, -150, 150, -150, -150, 150,

      -150, -150, 150, -150, 150, 150, 150, 150, 150,

      // right face
      150, 150, 0.0, 150, -150, 0.0, 150, -150, 150,

      150, -150, 150, 150, 150, 150, 150, 150, 0.0,

      // up face
      -150, 150, 0.0, 150, 150, 150, -150, 150, 150,

      150, 150, 0.0, 150, 150, 150, -150, 150, 0.0,
    ]),
    gl.STATIC_DRAW
  );
}

// Fill the current ARRAY_BUFFER buffer with colors for the 'F'.
function setColors(gl) {
  var r1 = 49;
  var g1 = 71;
  var b1 = 94;
  var r2 = r1;
  var g2 = g1;
  var b2 = b1;

  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Uint8Array([
      // front face
      r1,
      g1,
      b1,
      r1,
      g1,
      b1,
      r1,
      g1,
      b1,

      r1,
      g1,
      b1,
      r1,
      g1,
      b1,
      r1,
      g1,
      b1,

      // right face
      r2,
      g2,
      b2,
      r2,
      g2,
      b2,
      r2,
      g2,
      b2,

      r2,
      g2,
      b2,
      r2,
      g2,
      b2,
      r2,
      g2,
      b2,

      //back face
      r1,
      g2,
      b1,
      r1,
      g2,
      b1,
      r1,
      g2,
      b1,

      r1,
      g2,
      b1,
      r1,
      g2,
      b1,
      r1,
      g2,
      b1,

      // up face
      r2,
      g1,
      b2,
      r2,
      g1,
      b2,
      r2,
      g1,
      b2,

      r2,
      g1,
      b2,
      r2,
      g1,
      b2,
      r2,
      g1,
      b2,

      // left face
      r1,
      g1,
      b2,
      r1,
      g1,
      b2,
      r1,
      g1,
      b2,

      r1,
      g1,
      b2,
      r1,
      g1,
      b2,
      r1,
      g1,
      b2,

      // bottom face :: ORANGE
      r1,
      g2,
      b2,
      r1,
      g2,
      b2,
      r1,
      g2,
      b2,

      r1,
      g2,
      b2,
      r1,
      g2,
      b2,
      r1,
      g2,
      b2,
    ]),
    gl.STATIC_DRAW
  );
}

("use strict");

const vShader2 = `#version 300 es
  uniform mat4 u_matrix;
  uniform float u_PointSize;

  in vec4 a_position;
  in vec4 a_color;
  out vec4 v_color;

  void main() {
    gl_Position = u_matrix * a_position;
    gl_PointSize = u_PointSize;
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

var program = null;
var vao = null;
var positionAttribLocation = null;
var matrixLocation = null;
var colorAttribLocation = null;
var u_PointSize = null;
// var resolutionUniformLocation = null;

var shape = {
  translation: [500, 500, 0],
  rotation: [degToRad(180), degToRad(120), degToRad(150)],
  scale: [1.5, 1.5, 1.5],
  color: [Math.random(), Math.random(), Math.random(), 1],
};

function main() {
  var gl = getGLContext("background");
  program = createProgram(gl, vShader2, fShader);

  // const pointSize = 10.0; // set point size to 10 pixels
  u_PointSize = gl.getUniformLocation(program, "u_PointSize");
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

  size = 3; // 3 components per iteration
  type = gl.UNSIGNED_BYTE; // the data is 8bit unsigned bytes
  normalize = true; // convert from 0-255 to 0.0-1.0
  stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next color
  offset = 0; // start at the beginning of the buffer
  gl.vertexAttribPointer(
    colorAttribLocation,
    size,
    type,
    normalize,
    stride,
    offset
  );
  // draw scene

  // drawScene(gl);

  // var startTime = new Date().getTime();
  // var currentTime;
  var deltaTime;
  // var previousTime = new Date().getTime();
  var then = 0;

  // requestAnimationFrame(function() { drawScene(gl)});
  requestAnimationFrame(drawScene);

  function drawScene(now) {
    now *= 0.001;
    deltaTime = now - then;
    // console.log(deltaTime)
    then = now;

    // var currentTime = new Date().getTime();
    // var deltaTime = (currentTime - previousTime) * 0.001;
    // previousTime = currentTime;

    // shape.rotation[0] += 1.2 * deltaTime;
    // shape.rotation[1] += 1.8 * deltaTime;
    shape.rotation[0] += Math.sin(0.2 * deltaTime);
    shape.rotation[1] += 0.3 * deltaTime;
    // shape.rotation[2] += 1.4 * deltaTime;

    webglUtils.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    // gl.enable(gl.CULL_FACE);
    gl.useProgram(program);
    gl.bindVertexArray(vao);
    // gl.uniform4fv(colorLocation, shape.color);
    gl.uniform1f(u_PointSize, 10);

    var matrix = m4.projection(
      gl.canvas.clientWidth,
      gl.canvas.clientHeight,
      1000
    );
    matrix = m4.translate(
      matrix,
      shape.translation[0],
      shape.translation[1],
      shape.translation[2]
    );
    matrix = m4.xRotate(matrix, shape.rotation[0]);
    matrix = m4.yRotate(matrix, shape.rotation[1]);
    matrix = m4.zRotate(matrix, shape.rotation[2]);
    matrix = m4.scale(matrix, shape.scale[0], shape.scale[1], shape.scale[2]);

    gl.uniformMatrix4fv(matrixLocation, false, matrix);

    gl.drawArrays(gl.TRIANGLES, 0, 12 * 3);

    // requestAnimationFrame(function() { drawScene(gl)});
    requestAnimationFrame(drawScene);
  }
}

main();
