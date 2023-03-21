"use strict";

export function setGeometry(gl) {
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
export function setColors(gl) {
  var r1 = Math.random() * 255;
  var r2 = Math.random() * 255;
  var g1 = Math.random() * 255;
  var g2 = Math.random() * 255;
  var b1 = Math.random() * 255;
  var b2 = Math.random() * 255;

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
