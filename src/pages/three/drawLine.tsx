import * as THREE from "three"
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import {FontLoader} from "three/examples/jsm/loaders/FontLoader.js"
export default function ThreeApp() {
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);

  setTimeout(() => {
    let renderDoc = document.getElementById('sceneFirst')
    if (renderDoc) {
      renderDoc.appendChild(renderer.domElement)
    }
  }, 1000);

  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 500);
  camera.position.set(0, 0, 100);
  camera.lookAt(0, 0, 0);

  const scene = new THREE.Scene();

  const material = new THREE.LineBasicMaterial({ color: 0x0000ff });

  const points = new Float32Array([
    -10, 0, 0, // 0
    0, 10, 0, // 
    10, 0, 0, // 
  ])


  const geometry = new THREE.BufferGeometry()
  geometry.attributes.position = new THREE.BufferAttribute(points, 3)
  const line = new THREE.Line(geometry, material);
  scene.add(line);

  const loader = new FontLoader()
  loader.load('/src/utils/typeface.json', function (font: any) {
    console.log('show data', font)
    const geometry = new TextGeometry('hello three.js', {
      font: font,
      size: 10,
      height: 1,
      curveSegments: 1,
      bevelEnabled: true,
      bevelThickness: 1,
      bevelSize: 1,
      bevelSegments: 1
    })
    const mat = new THREE.MeshBasicMaterial({
      color: 'white',
      opacity: 0.8,
      shininess: 1
    })
    const mesh = new THREE.Mesh(geometry, mat)
    scene.add(mesh)
    renderer.render(scene, camera);
  })

  return (
    <div id="sceneFirst" style={{ height: '500px', width: '100%' }}></div>
  )
}