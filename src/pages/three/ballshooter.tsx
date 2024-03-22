import * as THREE from "three";
import { useEffect } from "react"
import { useRouteLoaderData } from "react-router-dom";
import { BoxLineGeometry } from 'three/examples/jsm/geometries/BoxLineGeometry.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { XRButton } from 'three/examples/jsm/webxr/XRButton.js';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';
import { RapierPhysics } from 'three/examples/jsm/physics/RapierPhysics.js';

let camera: any, scene: any, renderer: any;
let controller1: any, controller2: any;
let controllerGrip1: any, controllerGrip2: any;

let room: any, spheres: any;
let physics: any, velocity = new THREE.Vector3()

let count = 0
function init() {
  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);
  camera.position.set(0, 1.6, 3)

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x505050)

  room = new THREE.LineSegments(
    new BoxLineGeometry(6, 6, 6, 10, 10, 10),
    new THREE.LineBasicMaterial({color: 0x808080})
  )
  console.log('show data info', BoxLineGeometry)
  room.geometry.translate(0, 3, 0)
  scene.add(room)
  scene.add(new THREE.HemisphereLight(0xbbbbbb, 0x888888, 3))

  const light = new THREE.DirectionalLight(0xffffff, 3)
  light.position.set(1, 1, 1).normalize()
  scene.add(light)

  renderer = new THREE.WebGLRenderer({antialias: true})
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setAnimationLoop(render)
  renderer.xr.enabled = true
  let renderDoc = document.getElementById('sceneFirst')
  if (renderDoc) {
    renderDoc.appendChild(renderer.domElement)
  }

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.maxDistance = 10
  controls.target.y = 1.6
  controls.update()
  if (renderDoc) {
    renderDoc.appendChild(XRButton.createButton(renderer, { 'optionalFeatures': ['depth-sensing']}))
  }

  function onSelectStart() {
    this.userData.isSelecting = true
  }

  function onSelectEnd() {
    this.userData.isSelecting = false
  }

  controller1 = renderer.xr.getController(0)
  controller1.addEventListener('selectstart', onSelectStart)
  controller1.addEventListener('selectend', onSelectEnd)
  controller1.addEventListener('connected', function(event) {
    this.add(buildController(event.data))
  })
  controller1.addEventListener('disconnected', function() {
    this.remove(this.children[0])
  })
  scene.add(controller1)
  
  controller2 = renderer.xr.getController(0)
  controller2.addEventListener('selectstart', onSelectStart)
  controller2.addEventListener('selectend', onSelectEnd)
  controller2.addEventListener('connected', function(event) {
    this.add(buildController(event.data))
  })
  controller2.addEventListener('disconnected', function() {
    this.remove(this.children[0])
  })
  scene.add(controller2)

  const controllerModelFactory = new XRControllerModelFactory()

  controllerGrip1 = renderer.xr.getControllerGrip(0)
  controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1))
  scene.add(controllerGrip1)

  controllerGrip2 = renderer.xr.getControllerGrip(1)
  controllerGrip2.add(controllerModelFactory.createControllerModel(controllerGrip2))
  scene.add(controllerGrip2)

  window.addEventListener('resize', onWindowResize)
}

function buildController(data) {
  let geometry, material;
  switch(data.targetRayMode) {
    case 'tracked-pointer':
      geometry = new THREE.BufferGeometry()
      geometry.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, -1], 3))
      geometry.setAttribute('color', new THREE.Float32BufferAttribute([0.5, 0.5, 0.5, 0, 0, 0], 3))

      material = new THREE.LineBasicMaterial({vertexColors: true, blending: THREE.AdditiveBlending})
      return new THREE.Line(geometry, material);
    case 'gaze':
      geometry = new THREE.RingGeometry(0.02, 0.04, 32).translate(0, 0, -1);
      material = new THREE.MeshBasicMaterial({opacity: 0.5, trasparent: true})
      return new THREE.Mesh(geometry, material)
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

async function initPhysics() {
  physics = await RapierPhysics()
  {
    const geometry = new THREE.BoxGeometry()
    const material = new THREE.MeshBasicMaterial({visible: false})

    const floor = new THREE.Mesh(geometry, material)
    floor.position.y = -1
    floor.userData.physics = { mass: 0 }
    scene.add(floor)

    const wallPX = new THREE.Mesh(geometry, material)
    wallPX.position.set(4, 3, 0)
    wallPX.rotation.z = Math.PI / 2
    wallPX.userData.physics = { mass: 0 }
    scene.add(wallPX)

    const wallNX = new THREE.Mesh(geometry, material)
    wallNX.position.set(4, 3, 0)
    wallNX.rotation.z = Math.PI / 2
    wallNX.userData.physics = { mass: 0 }
    scene.add(wallNX)

    const wallPZ = new THREE.Mesh(geometry, material)
    wallPZ.position.set(4, 3, 0)
    wallPZ.rotation.z = Math.PI / 2
    wallPZ.userData.physics = { mass: 0 }
    scene.add(wallPZ)

    const wallNZ = new THREE.Mesh(geometry, material)
    wallNZ.position.set(4, 3, 0)
    wallNZ.rotation.z = Math.PI / 2
    wallNZ.userData.physics = { mass: 0 }
    scene.add(wallNZ)
  }

  const geometry = new THREE.IcosahedronGeometry(0.08, 3)
  const material = new THREE.MeshBasicMaterial()

  spheres = new THREE.InstancedMesh(geometry, material, 800)
  spheres.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
  spheres.userData.physics = { mass: 1, restitution: 1.1 }
  scene.add(spheres)

  const matrix = new THREE.Matrix4()
  const color = new THREE.Color()

  for (let i = 0; i < spheres.count; i++) {
    const x = Math.random() * 4 - 2
    const y = Math.random() * 4
    const z = Math.random() * 4 + 2

    matrix.setPosition(x, y, z)
    spheres.setMatrixAt(i, matrix)
    spheres.setColorAt(i, color.setHex(0xffffff * Math.random()))
  }
  physics.addScene(scene)
}

function handleController(controller) {
  if (controller.userData.isSelecting) {
    physics.setMeshPosition(spheres, controller.position, count)

    velocity.x = (Math.random() - 0.5) * 2
    velocity.y = (Math.random() - 0.5) * 2
    velocity.z = (Math.random() - 9)
    velocity.applyQuaternion(controller.quaternion)

    physics.setMeshVelocity(spheres, velocity, count)
    if (++ count === spheres.count) count = 0
  }
}

function render() {
  handleController(controller1)
  handleController(controller2)

  renderer.render(scene, camera)
}
export default function ThreeApp() {
  useEffect(() => {
    init()
    initPhysics()
  }, [])

  return (
    <div id="sceneFirst" style={{ height: '500px', width: '100%' }}>
    </div>
  )
}