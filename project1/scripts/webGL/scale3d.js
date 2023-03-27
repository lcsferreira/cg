import { m4 } from "./m4.js";
import { setGeometry, setColors } from "./geometryColors.js";
import {
  vertexShaderSource,
  fragmentShaderSource,
} from "../shaders/shaderCube.js";

("use strict");

export function scale3D(canvasId, index) {
  // Get A WebGL context
  /** @type {HTMLCanvasElement} */
  var canvas = document.getElementById(canvasId);
  var gl = canvas.getContext("webgl2");
  if (!gl) {
    return;
  }

  // Use our boilerplate utils to compile the shaders and link into a program
  var program = webglUtils.createProgramFromSources(gl, [
    vertexShaderSource,
    fragmentShaderSource,
  ]);

  // look up where the vertex data needs to go.
  var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  var colorAttributeLocation = gl.getAttribLocation(program, "a_color");

  // look up uniform locations
  var matrixLocation = gl.getUniformLocation(program, "u_matrix");

  // Create a buffer
  var positionBuffer = gl.createBuffer();

  // Create a vertex array object (attribute state)
  var vao = gl.createVertexArray();

  // and make it the one we're currently working with
  gl.bindVertexArray(vao);

  // Turn on the attribute
  gl.enableVertexAttribArray(positionAttributeLocation);

  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  // Set Geometry.
  setGeometry(gl);

  // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  var size = 3; // 3 components per iteration
  var type = gl.FLOAT; // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = 0; // start at the beginning of the buffer
  gl.vertexAttribPointer(
    positionAttributeLocation,
    size,
    type,
    normalize,
    stride,
    offset
  );

  // create the color buffer, make it the current ARRAY_BUFFER
  // and copy in the color values
  var colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  setColors(gl);

  // Turn on the attribute
  gl.enableVertexAttribArray(colorAttributeLocation);

  // Tell the attribute how to get data out of colorBuffer (ARRAY_BUFFER)
  var size = 3; // 3 components per iteration
  var type = gl.UNSIGNED_BYTE; // the data is 8bit unsigned bytes
  var normalize = true; // convert from 0-255 to 0.0-1.0
  var stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next color
  var offset = 0; // start at the beginning of the buffer
  gl.vertexAttribPointer(
    colorAttributeLocation,
    size,
    type,
    normalize,
    stride,
    offset
  );

  function radToDeg(r) {
    return (r * 180) / Math.PI;
  }

  function degToRad(d) {
    return (d * Math.PI) / 180;
  }

  // First let's make some variables
  // to hold the translation,
  var translation = [125, 125, 0];
  var rotation = [degToRad(45), degToRad(180), degToRad(45)];
  var scale = [0.2, 0.2, 0.2];

  drawScene();

  webglLessonsUI.setupSlider("#x" + index, {
    value: translation[0],
    slide: updatePosition(0),
    max: gl.canvas.width,
  });
  webglLessonsUI.setupSlider("#y" + index, {
    value: translation[1],
    slide: updatePosition(1),
    max: gl.canvas.height,
  });
  webglLessonsUI.setupSlider("#angleX" + index, {
    value: radToDeg(rotation[0]),
    slide: updateRotation(0),
    max: 360,
  });
  webglLessonsUI.setupSlider("#angleY" + index, {
    value: radToDeg(rotation[1]),
    slide: updateRotation(1),
    max: 360,
  });
  webglLessonsUI.setupSlider("#angleZ" + index, {
    value: radToDeg(rotation[2]),
    slide: updateRotation(2),
    max: 360,
  });

  function updatePosition(index) {
    return function (event, ui) {
      translation[index] = ui.value;
      drawScene();
    };
  }

  function updateRotation(index) {
    return function (event, ui) {
      var angleInDegrees = ui.value;
      var angleInRadians = degToRad(angleInDegrees);
      rotation[index] = angleInRadians;
      drawScene();
    };
  }

  // Draw the scene.
  function drawScene() {
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // tell webgl to cull faces
    // gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    // Bind the attribute/buffer set we want.
    gl.bindVertexArray(vao);

    // Compute the matrix
    var matrix = m4.projection(
      gl.canvas.clientWidth,
      gl.canvas.clientHeight,
      400
    );
    matrix = m4.translate(
      matrix,
      translation[0],
      translation[1],
      translation[2]
    );
    matrix = m4.xRotate(matrix, rotation[0]);
    matrix = m4.yRotate(matrix, rotation[1]);
    matrix = m4.zRotate(matrix, rotation[2]);
    matrix = m4.scale(matrix, scale[0], scale[1], scale[2]);

    // Set the matrix.
    gl.uniformMatrix4fv(matrixLocation, false, matrix);

    // Draw the geometry.
    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = 12 * 3;
    gl.drawArrays(primitiveType, offset, count);
  }
}
