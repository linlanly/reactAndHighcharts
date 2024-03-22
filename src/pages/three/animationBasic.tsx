import * as THREE from "three"
import Stats from 'three/examples/jsm/libs/stats.module.js';
import {useEffect} from "react"

let stats, clock;
let scene, camera, renderer, mixer;

function init() {
  scene = new THREE.Scene()

  camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 1000)
  camera.position.set(25, 25, 50)
  camera.lookAt(scene.position)

  const axesHelper = new THREE.AxesHelper(10)
  scene.add(axesHelper)

  const geometry = new THREE.BoxGeometry(5, 5, 5)
  const material = new THREE.MeshBasicMaterial({color: 0xffffff, transparent: true})
  const mesh = new THREE.Mesh(geometry, material)
  scene.add(mesh)

  const positionKF = new THREE.VectorKeyframeTrack('.position', [0, 1, 2], [0, 0, 0, 30, 0, 0, 0, 0, 0])

  const scaleKF = new THREE.VectorKeyframeTrack('.scale', [0, 1, 2], [1, 1, 1, 2, 2, 2, 1, 1, 1])
  const xAxis = new THREE.Vector3(1, 0, 0)

  const qInitial = new THREE.Quaternion().setFromAxisAngle(xAxis, 0)
  const qFinal = new THREE.Quaternion().setFromAxisAngle(xAxis, Math.PI)
  const quaternionKF = new THREE.QuaternionKeyframeTrack('.quaternion', [0, 1, 2], [qInitial.x, qInitial.y, qInitial.z, qInitial.w, qFinal.x, qFinal.y, qFinal.z, qFinal.w, qInitial.x, qInitial.y, qInitial.y, qInitial.w])
  const colorKF = new THREE.ColorKeyframeTrack('.material.color', [0, 1, 2], [1, 0, 0, 0, 1, 0, 0, 0, 1], THREE.InterpolateDiscrete)
  const opactityKF = new THREE.NumberKeyframeTrack('.material.opacity', [0, 1, 2], [1, 0, 1])

  const clip = new THREE.AnimationClip('Action', 3, [scaleKF, positionKF, quaternionKF, colorKF, opactityKF])

  mixer = new THREE.AnimationMixer(mesh)

  const clipAction = mixer.clipAction(clip)
  clipAction.play()

  renderer = new THREE.WebGLRenderer({antialis: true})
  renderer.setPixelRatio(window.devicePixelRatio)
  let renderDoc = document.getElementById('sceneFirst')
  if (renderDoc) {
    renderDoc.appendChild(renderer.domElement)
  }

  stats = new Stats()
  if (renderDoc) {
    renderDoc.appendChild(stats.dom)
  }

  clock = new THREE.Clock()
  window.addEventListener('resize', onWindowResize)
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

function animate() {
  requestAnimationFrame(animate)
  render()
}

function render() {
  const delta = clock.getDelta()
  if (mixer) {
    mixer.update(delta)
  }
  renderer.render(scene, camera)
  stats.update()
}

export default function ThreeApp() {
  useEffect(() => {
    init()
    animate()
  }, [])
  return (
    <div id="sceneFirst" style={{ height: '500px', width: '100%' }}></div>
  )
}