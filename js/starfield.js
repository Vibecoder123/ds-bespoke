import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

export function initStarfield(canvasId){
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.z = 6;

  const pointCount = () => (window.innerWidth < 640 ? 90 : 190);

  let group = new THREE.Group();
  scene.add(group);
  let material;

  function buildField(){
    scene.remove(group);
    group = new THREE.Group();

    const count = pointCount();
    const positions = new Float32Array(count * 3);
    const phases = new Float32Array(count);
    const sizes = new Float32Array(count);
    const warmth = new Float32Array(count);

    for (let i = 0; i < count; i++){
      positions[i * 3 + 0] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
      phases[i] = Math.random() * Math.PI * 2;
      sizes[i] = 1.4 + Math.random() * 2.6;
      warmth[i] = Math.random();
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('aWarmth', new THREE.BufferAttribute(warmth, 1));

    material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: { uTime: { value: 0 } },
      vertexShader: `
        attribute float aPhase;
        attribute float aSize;
        attribute float aWarmth;
        uniform float uTime;
        varying float vTwinkle;
        varying float vWarmth;
        void main(){
          vWarmth = aWarmth;
          float twinkle = 0.45 + 0.55 * sin(uTime * 0.6 + aPhase);
          vTwinkle = twinkle;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * twinkle * (220.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying float vTwinkle;
        varying float vWarmth;
        void main(){
          vec2 c = gl_PointCoord - 0.5;
          float d = length(c);
          float alpha = smoothstep(0.5, 0.0, d) * vTwinkle;
          vec3 brass = vec3(0.784, 0.608, 0.361);
          vec3 ember = vec3(0.910, 0.651, 0.349);
          vec3 color = mix(brass, ember, vWarmth);
          gl_FragColor = vec4(color, alpha);
        }
      `
    });

    const points = new THREE.Points(geometry, material);
    group.add(points);
    scene.add(group);
  }

  buildField();

  function resize(){
    const { clientWidth: w, clientHeight: h } = canvas;
    renderer.setSize(w, h, false);
    camera.aspect = w / Math.max(h, 1);
    camera.updateProjectionMatrix();
  }

  window.addEventListener('resize', () => { resize(); buildField(); });
  resize();

  const clock = new THREE.Clock();

  function animate(){
    const t = clock.getElapsedTime();
    material.uniforms.uTime.value = t;
    if (!reduceMotion){
      group.rotation.y = t * 0.02;
      group.rotation.x = Math.sin(t * 0.05) * 0.03;
    }
    renderer.render(scene, camera);
    if (!reduceMotion) requestAnimationFrame(animate);
  }

  animate();
  if (reduceMotion) renderer.render(scene, camera);
}
