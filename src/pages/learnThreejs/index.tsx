
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
 
const SpotLightComponent = () => {
  const sceneRef = useRef();
  const cameraRef = useRef();
  const rendererRef = useRef();
 
  useEffect(() => {
    // 初始化场景、相机和渲染器
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0xff0000)
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
 
    // 创建点光源
    const spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(10, 10, 20);
    scene.add(spotLight);
 
    // 创建模型和添加到场景
    // ...
 
    // 设置相机位置
    camera.position.z = 50;
    renderer.render(scene, camera);
    console.log('.....')
 
    // 渲染循环
    // const animate = () => {
    //   requestAnimationFrame(animate);
    //   renderer.render(scene, camera);
    // };
    // animate();
  }, []);
 
  return (
    <div
    className='more'
      ref={rendererRef}
      style={{ width: '100%', height: '100%', backgroundColor: '#282c34' }}
    />
  );
};
 
export default SpotLightComponent;