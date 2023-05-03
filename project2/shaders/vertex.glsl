varying vec2 vUv;

void main(){
  vUv = uv;
  vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
  //para particulas precisamos setar glPointSize, quando as particulas estiverem longe da camera serão menores
  gl_PointSize = 5000. * (1. / -mvPosition.z)
  gl_Position = projectionMatrix * mvPosition;
}