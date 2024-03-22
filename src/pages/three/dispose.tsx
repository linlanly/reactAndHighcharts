import * as THREE from "three";
import { useEffect } from "react"
let camera: any, scene: any, renderer: any;
function init() {
  const container = document.createElement('div')
  document.getElementById('sceneFirst')?.appendChild(container)

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 10000);
  camera.position.z = 200

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xffffff)

  renderer = new THREE.WebGLRenderer()
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  container.appendChild(renderer.domElement)
}

function createImage() {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256

  const context = canvas.getContext('2d');
  context.fillStyle = `rgb(${getColor()}, ${getColor()}, ${getColor()})`;
  context?.fillRect(0, 0, 256, 256);

  return canvas
}

function getColor() {
  return Math.floor(Math.random() * 256)
}

function animate() {
  requestAnimationFrame(animate)
  render()
}
function render() {
  const geometry = new THREE.SphereGeometry(50, Math.random() * 64, Math.random() * 32);
  const texture = new THREE.CanvasTexture(createImage())
  const material = new THREE.MeshBasicMaterial({ map: texture, wireframe: true })
  const mesh = new THREE.Mesh(geometry, material)
  scene.add(mesh)
  renderer.render(scene, camera)
  scene.remove(mesh)

  geometry.dispose()
  material.dispose()
  texture.dispose()
}
export default function ThreeApp() {
  useEffect(() => {
    init()
    animate()
  }, [])

  return (
    <div id="sceneFirst" style={{ height: '500px', width: '100%' }}>
    </div>
  )
}