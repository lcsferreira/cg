import * as THREE from "three";
import * as dat from "dat.gui";
import matcap from "./imgs/darkmatter.png";
import matcap1 from "./imgs/fosco.jpg";
import matcap2 from "./imgs/darkmatter.png";

const fragment = `uniform float time;
uniform float progress;
uniform vec2 mouse;
uniform float fire;
uniform sampler2D matcap, matcap1, matcap2;
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
  float h = clamp( 0.5+0.5*(b-a)/k, 0.0, 1.0 );
  return mix( b, a, h ) - k*h*(1.0-h);
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

float rand(vec2 co){
  return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

vec3 GetColorAmount(vec3 p, vec2 matcapUV){
  float amount = clamp((7. - length(p))/6., 0., 0.3);
  vec3 col = 0.5 + 0.5*cos(6.28318*vec3(0.00, 0.25, 0.25)+amount+vec3(0.00, 0.25, 0.25));
  // vec3 col = texture2D(matcap, matcapUV).rgb;
  return col*amount;
}

//side distance function (sdf) para a cena inteira
vec2 sdf(vec3 p){
  float type = 0.;
  vec3 p1 = rotate(p, vec3(1.), time/5.);

  float s = 0.3 + 0.01*cos(time/0.5) + 0.02*cos(time/0.5);
  float box = smin(sdBox(p1, vec3(s)),sdSphere(p, s), s);

  float realsphere = sdSphere(p1, 0.3);
  float final = mix(box, realsphere, progress);

  float randOffset = rand(vec2(0.06, 0.07));
  
  float progr = 1. - fract(-(fire*2.5)/1.5  +randOffset);
  float progr2 = 1. - fract(time/2.  - randOffset);
  float progr2inv = 1.*fract(time/2.  - randOffset);


  vec3 pos = vec3(mouse*4., 0.);
  float gotoCenter = sdSphere(p - pos*progr, 0.05);
  
  vec3 p2 = rotate(p, vec3(1.), time/2.);
  vec3 p3 = rotate(p, vec3(1.), time/1.5);
  vec3 p4 = rotate(p, vec3(1.), time/3.);

  for(float i = 1.; i <= 30.; i++){
    vec3 randomVec3 = mix(-vec3(4.0), vec3(4.0), fract(vec3(rand(vec2(i, 0.0)), rand(vec2(0.0, i)), rand(vec2(i, i*0.5)))));

    if(mod(i, 3.) == 0.){
      final = smin(final, sdSphere(p2 - randomVec3*progr2, 0.1), 0.1);
    } else if (mod(i, 3.) == 1.){
      final = smin(final, sdSphere(p4 - randomVec3*progr2, 0.1), 0.1);
    } else {
      final = smin(final, sdSphere(p3 - randomVec3*progr2, 0.1), 0.1);
    }
  }
  
  for(float i = 1.; i <= 30.; i++){
    vec3 randomVec3 = mix(-vec3(4.0), vec3(4.0), fract(vec3(rand(vec2(i, 0.0)), rand(vec2(0.0, i)), rand(vec2(i, i*0.5)))));

    if(mod(i, 3.) == 0.){
      final = smin(final, sdSphere(p2 - randomVec3*progr2inv, 0.1), 0.1);
    } else if (mod(i, 3.) == 1.){
      final = smin(final, sdSphere(p4 - randomVec3*progr2inv, 0.1), 0.1);
    } else {
      final = smin(final, sdSphere(p3 - randomVec3*progr2inv, 0.1), 0.1);
    }
  }

  float mouseSphere =  sdSphere(p - vec3(mouse*resolution.zw*3., 0.), 0.2);
  if(mouseSphere < final) type = 1.;

  return vec2(smin(final, mouseSphere, 0.5), type);
}

//função para calcular a normal de um ponto para iluminar a cena
vec3 getNormal(in vec3 p){
  const float eps = 0.0001;
  const vec2 h = vec2(eps, 0);

  return normalize(vec3(
    sdf(p + h.xyy).x - sdf(p - h.xyy).x,
    sdf(p + h.yxy).x - sdf(p - h.yxy).x,
    sdf(p + h.yyx).x - sdf(p - h.yyx).x
  ));
}

void main(){
  float dist = length(vUv - vec2(0.5));
  vec3 bg = mix(vec3(0.), vec3(0.), dist);
  bg = mix(vec3(0.4, 0.1, 0.2), bg, 0.8);
  vec2 newUV = (vUv - vec2 (0.5))*resolution.zw + vec2(0.5);

  //rayDir é o vetor normalizado que aponta para o pixel
  //rayPos é a posição da camera e ponto de origem do raio
  //t é um valor escalar que representa a distância entre a camera e o pixel

  vec2 vector = (vUv - vec2(0.5));
  vec2 ratioVector = vector * (resolution.zw);

  //vetor na resolução da tela
  vec3 camPos = vec3(0., 0., 2.);
  vec3 rayDir = normalize(vec3(ratioVector, -1.));

  vec3 rayPos = camPos;
  float t = 0.0;
  float tMax = 5.0;
  float type = -1.;

  for(int i = 0; i < 1024; ++i){
    vec3 pos = camPos + t*rayDir;
    float d = sdf(pos).x;
    type = sdf(pos).y;
    if(d < 0.0001 || t>tMax) break;
    t += d;
  }

  vec3 color = bg;
  if(t<tMax){
    //aqui é onde acertamos um objeto
    //iluminação, cor e textura
    
    vec3 pos = camPos + t*rayDir;
    rayDir += 0.6*sdf(pos).x;

    vec3 normal = getNormal(pos);
    float diff = dot(vec3(0.5), normal);

    // float diff = dot(normal, vec3(-1., -1., -1.));
    
    // color = mix(vec3(0.), vec3(1.), diff);

    
    vec2 matcapUV = getMatcap(rayDir, normal);
    // if(type < 0.5){
    //   color = texture2D(matcap, matcapUV).rgb;
    // }else{
    //   color = texture2D(matcap, matcapUV).rgb;
    // }

    // color = mix(color, vec3(0.), 0.);
    
    color += 3.*GetColorAmount(pos, matcapUV);
    float fresnel = pow(0.3 + dot(rayDir, normal), 1.0);
    color = mix(color, bg, diff);

  }
  
  gl_FragColor = vec4(color, 1.);
}`;

const vertex = `varying vec2 vUv;
varying vec2 vCoordinates;
attribute vec3 aCoordinates;

void main(){
  vUv = uv;
  vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
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
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    var frustumSize = 1;

    this.camera = new THREE.OrthographicCamera(
      frustumSize / -2,
      frustumSize / 2,
      frustumSize / 2,
      frustumSize / -2,
      1,
      2000
    );

    this.camera.position.set(0, 0, 2);

    this.time = 0;

    this.isPlaying = true;
    this.audio = new Audio();
    this.audio.volume;
    this.addObjects();
    this.resize();
    this.render();
    this.setupResize();
    this.mouseEvents();

    this.settings();
  }

  mouseEvents() {
    this.mouse = new THREE.Vector2();
    document.addEventListener("mousemove", (event) => {
      this.mouse.x = event.pageX / this.width - 0.5;
      this.mouse.y = -event.pageY / this.height + 0.5;
    });

    document.addEventListener("click", (event) => {
      let mousex = event.pageX / this.width - 0.5;
      let mousey = -event.pageY / this.height + 0.5;
      this.fire(mousex, mousey);
    });
  }

  fire(mousex, mousey) {
    if (this.settings.fire > 0) return;
    //get the distance between the mouse and the center of the screen
    let dist = Math.sqrt(mousex * mousex + mousey * mousey);

    //set the fire to the distance
    this.settings.fire = dist;

    //subtact the distance each frame to make the fire go out
    let interval = setInterval(() => {
      this.settings.fire -= 0.003;
      if (this.settings.fire < 0) {
        this.settings.fire = 0;
        clearInterval(interval);
      }
    }, 10);
  }

  settings() {
    this.settings = {
      progress: 0,
      fire: 0,
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
        progress: { value: 0 },
        texture: { value: new THREE.TextureLoader().load(matcap) },
        fire: { value: 0 },
        audioValue: { value: 0 },
        mouse: { value: new THREE.Vector2(0, 0) },
        matcap: { value: new THREE.TextureLoader().load(matcap) },
        matcap1: { value: new THREE.TextureLoader().load(matcap1) },
        matcap2: { value: new THREE.TextureLoader().load(matcap2) },
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

    this.time += 0.01;
    this.material.uniforms.time.value = this.time;
    this.material.uniforms.progress.value = this.settings.progress;

    this.material.uniforms.fire.value = this.settings.fire;
    this.material.uniforms.texture.value = this.settings.texture;
    this.material.uniforms.audioValue.value = this.audio.volume;
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
