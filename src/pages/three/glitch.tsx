import * as THREE from "three"
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from "three/examples/jsm/postprocessing/RenderPass.js"
import {GlitchPass} from "three/examples/jsm/postprocessing/GlitchPass.js"
import {OutputPass} from "three/examples/jsm/postprocessing/OutputPass.js"

let camera, scene, renderer, composer;
let object, light;
let glitchPass;

function updateOptions() {
  const wildGlitch = document.getElementById("wildGlitch")
  glitchPass.goWild = wildGlitch.checked
}

function init() {
  renderer = new THREE.WebGLRenderer()
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  let renderDoc = document.getElementById('sceneFirst')
  if (renderDoc) {
    renderDoc.appendChild(renderer.domElement)
  }

  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000)
  camera.position.z = 400;

  scene = new THREE.Scene()
  scene.fog = new THREE.Fog(0x000000, 1, 1000)

  object = new THREE.Object3D()
  scene.add(object)

  const geometry = new THREE.SphereGeometry(1, 4, 4)
  for(let i = 0; i < 100; i++) {
    const material = new THREE.MeshBasicMaterial({color: 0xffffff * Math.random(), flatShading: true})

    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize()
    mesh.position.multiplyScalar(Math.random() * 400)
    mesh.rotation.set(Math.random() * 2, Math.random() * 2, Math.random() * 2)
    mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 50
    object.add(mesh)
  }

  scene.add(new THREE.AmbientLight(0xcccccc))
  light = new THREE.DirectionalLight(0xffffff, 3)
  light.position.set(1, 1, 1)
  scene.add(light)

  composer = new EffectComposer(renderer)
  composer.addPass(new RenderPass(scene, camera))

  glitchPass = new GlitchPass()
  composer.addPass(glitchPass)

  const outputPass = new OutputPass()
  composer.addPass(outputPass)

  window.addEventListener('resize', onWindowResize)
  const wildGlitchOption = document.getElementById('wildGlitch')
  wildGlitchOption?.addEventListener('change', updateOptions)

  updateOptions()
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight)
  composer.setSize(window.innerWidth, window.innerHeight)
}

function animate() {
  requestAnimationFrame(animate)
  object.rotation.x += 0.005
  object.rotation.y += 0.001

  composer.render()
}

function buttonClick() {
  console.log('click hihihi')
  init()
  animate()
}

export default function ThreeApp() {
  return (
    <div id="sceneFirst" style={{ height: '500px', width: '100%' }}>
      <div><input type="checkbox" id="wildGlitch" /></div>
      <button id="startButton" onClick={buttonClick}>start</button>
    </div>
  )
}