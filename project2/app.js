import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";
import gsap from "gsap";
import matcap from "./imgs/sol.png";
import matcap1 from "./imgs/bluesphere.png";

const fragment = `uniform float time;
uniform float progress;
uniform vec2 mouse;
uniform sampler2D matcap, matcap1;
uniform vec4 resolution;
varying vec2 vUv;
float PI = 3.141592653589793238;

//função para rotacionar um vetor em torno de um eixo
mat4 rotationMatrix(vec3 axis, float angle) {
  axis = normalize(axis);
  float s = sin(angle);
  float c = cos(angle);
  float oc = 1.0 - c;
  
  return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
              oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
              oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
              0.0,                                0.0,                                0.0,                                1.0);
}

//função para calcular as coordenadas de textura do matcap
//retorna um vetor com as coordenadas de textura
vec2 getMatcap(vec3 eye, vec3 normal) {
  vec3 reflected = reflect(eye, normal);
  float m = 2.8284271247461903 * sqrt( reflected.z+1.0 );
  return reflected.xy / m + 0.5;
}

vec3 rotate(vec3 v, vec3 axis, float angle) {
mat4 m = rotationMatrix(axis, angle);
return (m * vec4(v, 1.0)).xyz;
}


//função para suavizar as bordas dos objetos
float smin( float a, float b, float k )
{
    float h = a-b;
    return 0.5*( (a+b) - sqrt(h*h+k) );
}

//funções de distância (distance functions) para os objetos
float sdSphere( vec3 p, float r )
{
  return length(p)-r;
}

float sdBox( vec3 p, vec3 b )
{
  vec3 q = abs(p) - b;
  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}

//side distance function (sdf) para a cena inteira
float sdf(vec3 p){
  vec3 p1 = rotate(p, vec3(1.), time/5.);
  float box = sdBox(p1, vec3(0.3));
  float sphere =  sdSphere(p - vec3(mouse, 0.0), 0.2);
  return smin(box, sphere, 0.01);
}

//função para calcular a normal de um ponto para iluminar a cena
vec3 getNormal(vec3 pos){
  vec2 eps = vec2(0.001, 0.0);
  vec3 nor = vec3(
    sdf(pos+eps.xyy) - sdf(pos-eps.xyy),
    sdf(pos+eps.yxy) - sdf(pos-eps.yxy),
    sdf(pos+eps.yyx) - sdf(pos-eps.yyx)
  );
  return normalize(nor);
}


void main(){
  vec2 newUV = (vUv - vec2 (0.5))*resolution.zw + vec2(0.5);

  //rayDir é o vetor normalizado que aponta para o pixel
  //rayPos é a posição da camera e ponto de origem do raio
  //t é um valor escalar que representa a distância entre a camera e o pixel

  vec2 vector = (vUv - vec2(0.5));
  vec2 ratioVector = vector * (resolution.zw);
  //vetor na resolução da tela

  vec3 camPos = vec3(0., 0., 2.);
  vec3 rayDir = normalize(vec3(ratioVector, -1));

  vec3 rayPos = camPos;
  float t = 0.0;
  float tMax = 5.0;


  for(int i = 0; i < 256; ++i){
    vec3 pos = camPos + t*rayDir;
    float d = sdf(pos);
    if(d < 0.001 || t>tMax) break;
    t += d;
  }

  vec3 color = vec3(0.);
  if(t<tMax){
    //aqui é onde acertamos um objeto
    vec3 pos = camPos + t*rayDir;
    color = vec3(1.);
    vec3 normal = getNormal(pos);

    //iluminação
    float diff = dot(vec3(1.), normal);
    vec2 matcapUV = getMatcap(rayDir, normal);
    // color = vec3(matcapUV, 0.0);
    color = texture2D(matcap, matcapUV).rgb;
  }
  
  gl_FragColor = vec4(color, 1.0);
}`;

const vertex = `varying vec2 vUv;
varying vec2 vCoordinates;
attribute vec3 aCoordinates;

void main(){
  vUv = uv;
  vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
  gl_PointSize = 1000.0 * (1.0 / - mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;

  vCoordinates = aCoordinates.xy;
}`;

export default class Sketch {
  constructor(options) {
    this.scene = new THREE.Scene();

    this.container = options.dom;
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio));
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0xeeeeee, 1);
    this.renderer.physicallyCorrectLights = true;
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.001,
      1000
    );

    var frustumSize = 1;
    var aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.OrthographicCamera(
      frustumSize / -2,
      frustumSize / 2,
      frustumSize / 2,
      frustumSize / -2,
      1,
      2000
    );

    this.camera.position.set(0, 0, 2);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.time = 0;

    this.isPlaying = true;

    this.addObjects();
    this.resize();
    this.render();
    this.setupResize();
    this.mouseEvents();
  }

  mouseEvents() {
    this.mouse = new THREE.Vector2();
    document.addEventListener("mousemove", (event) => {
      this.mouse.x = event.pageX / this.width - 0.5;
      this.mouse.y = -event.pageY / this.height + 0.5;
    });
  }

  settings() {
    this.settings = {
      progress: 0,
    };
    this.gui = new dat.GUI();
    this.gui.add(this.settings, "progress", 0, 1, 0.01);
  }

  setupResize() {
    window.addEventListener("resize", this.resize.bind(this));
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;

    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;

    // image convert to plane
    this.imageAspect = 1;
    let a1;
    let a2;
    if (this.height / this.width > this.imageAspect) {
      a1 = (this.width / this.height) * this.imageAspect;
      a2 = 1;
    } else {
      a1 = 1;
      a2 = this.height / this.width / this.imageAspect;
    }

    this.material.uniforms.resolution.value.x = this.width;
    this.material.uniforms.resolution.value.y = this.height;
    this.material.uniforms.resolution.value.z = a1;
    this.material.uniforms.resolution.value.w = a2;

    // // optional - cover width
    // const dist = this.camera.position.z;
    // const height = 1;
    // this.camera.fov = 2 * (180 / Math.PI) * Math.atan(height / (2 * dist));

    // // if(w/h > 1) {
    // //   this.plane.scale.x = this.camera.aspect;
    // // } else {
    // //   this.plane.scale.y = 1/this.camera.aspect;
    // // }

    this.camera.updateProjectionMatrix();
  }

  addObjects() {
    this.material = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives : enable",
      },
      side: THREE.DoubleSide,
      uniforms: {
        time: { value: 0 },
        mouse: { value: new THREE.Vector2(0, 0) },
        matcap: { value: new THREE.TextureLoader().load(matcap) },
        matcap1: { value: new THREE.TextureLoader().load(matcap1) },
        resolution: { value: new THREE.Vector4() },
      },
      vertexShader: vertex,
      fragmentShader: fragment,
    });

    this.geometry = new THREE.PlaneGeometry(1, 1, 1, 1);
    this.plane = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.plane);
  }

  stop() {
    this.isPlaying = false;
  }

  play() {
    if (!this.isPlaying) {
      this.render();
      this.isPlaying = true;
    }
  }

  render() {
    if (!this.isPlaying) return;

    this.time += 0.05;
    this.material.uniforms.time.value = this.time;
    if (this.mouse) {
      this.material.uniforms.mouse.value = this.mouse;
    }

    requestAnimationFrame(this.render.bind(this));
    this.renderer.render(this.scene, this.camera);
  }
}

new Sketch({
  dom: document.getElementById("container"),
});
