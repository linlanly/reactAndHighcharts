import * as THREE from "three"
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

  const MAX_POINTS = 500

  const points = new Float32Array(MAX_POINTS * 3)
  const geometry = new THREE.BufferGeometry()
  geometry.attributes.position = new THREE.BufferAttribute(points, 3)

  const drawCount = 2
  geometry.setDrawRange(0, drawCount)
  const line = new THREE.Line(geometry, material);
  scene.add(line);
  updatePositions(line, MAX_POINTS)

  animate(renderer, scene, camera, line, drawCount, MAX_POINTS);

  return (
    <div id="sceneFirst" style={{ height: '500px', width: '100%' }}>
    </div>
  )
}

function updatePositions(line, MAX_POINTS) {
  const positions = line.geometry.attributes.position.array
  let x, y, z, index
  x = y = z = index = 0;
  for (let i = 0; i < MAX_POINTS; i++) {
    positions[index++] = x;
    positions[index++] = y;
    positions[index++] = z;
    x += (Math.random() - 0.5) * 30
    y += (Math.random() - 0.5) * 30
    z += (Math.random() - 0.5) * 30
  }
}

function animate(renderer, scene, camera, line, drawCount, MAX_POINTS) {
  requestAnimationFrame(() => {
    animate(renderer, scene, camera, line, drawCount, MAX_POINTS)
  })
  drawCount = (drawCount + 1) % MAX_POINTS
  if (line) {
    line.geometry.setDrawRange(0, drawCount)
    if (drawCount === 0) {
      let color = Math.random()
      updatePositions(line, MAX_POINTS)
      line.geometry.attributes.position.needsUpdate = true;
      line.material.color.setHSL(color, 1, 0.5)
      console.log('change color', color)
    }
  }
  if (typeof renderer.render === 'function') {
    renderer.render(scene, camera);
  }
}