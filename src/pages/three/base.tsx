import { Component } from 'react';
import * as Three from "three"
import WebGL from "@/utils/WebGL.js"
import { useEffect } from "react"

const scene = new Three.Scene()
const camera = new Three.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const render = new Three.WebGLRenderer()
render.setSize(window.innerWidth, window.innerHeight)
const geometry = new Three.BoxGeometry(.1, .1, .1);
const material = new Three.MeshBasicMaterial({ color: 0x00ff00 })
const cube = new Three.Mesh(geometry, material);

let mesh
const loader = new Three.JSONLoader()
loader.load('src/assets/hand-1.json', function(geometry) {
  console.log('show data info', geometry)
  let mat = new Three.MeshBasicMaterial({color: 0xF0c8c9, skinning: true})
  mesh = new Three.SkinnedMesh(geometry, mat)
  console.log('show json', mesh)
  
  mesh.rotation.x = .5 * Math.PI
  mesh.rotation.z = .7 * Math.PI

  scene.add(mesh)
})

function animate() {
  requestAnimationFrame(() => {
    animate()
  })
  render.render(scene, camera)
}

function drawCube() {
  scene.add(cube)
  camera.position.z = 5
  animate()
}

export default function SceneBase() {
  useEffect(() => {

    if (!WebGL.isWebGLAvailable()) {
      const warning = WebGL.getWebGLErrorMessage()
      alert(warning)
    }
    let renderDoc = document.getElementById('sceneFirst')
    if (renderDoc) {
      renderDoc.appendChild(render.domElement)
      drawCube()
    }
  }, [])
  return <div id="sceneFirst"></div>
}
class SceneFirst extends Component {
  constructor(props: any) {
    super(props);
    this.animate = this.animate.bind(this)
    this.drawCube = this.drawCube.bind(this)
  }
  componentDidMount() {
    if (!WebGL.isWebGLAvailable()) {
      const warning = WebGL.getWebGLErrorMessage()
      alert(warning)
    }
    let renderDoc = document.getElementById('sceneFirst')
    if (renderDoc) {
      renderDoc.appendChild(render.domElement)
      this.drawCube()
    }
  }
  animate(cube: any) {
    if (cube.rotation) {
      cube.rotation.x += 0.01
      cube.rotation.y += 0.01
    }
    requestAnimationFrame(() => {
      this.animate(cube)
    })
    render.render(scene, camera)
  }
  drawCube() {
    const geometry = new Three.BoxGeometry(1, 1, 1);
    const material = new Three.MeshBasicMaterial({ color: 0x00ff00 })
    const cube = new Three.Mesh(geometry, material);
    scene.add(cube)
    camera.position.z = 5
    this.animate(cube)
  }
  render() {
    return (

      <div id="sceneFirst">
      </div>
    )
  }
}
