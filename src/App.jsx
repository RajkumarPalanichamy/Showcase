import { Canvas, useFrame } from '@react-three/fiber'
import { PointerLockControls, useGLTF, Environment } from '@react-three/drei'
import { Physics, RigidBody } from '@react-three/rapier'
import { useRef, useState, useEffect } from 'react'
import * as THREE from 'three'

function Player() {
  const ref = useRef()
  const [keys, setKeys] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
  })
  
  useEffect(() => {
    const onKeyDown = (event) => {
      switch (event.code) {
        case 'KeyW': setKeys(keys => ({ ...keys, forward: true })); break
        case 'KeyS': setKeys(keys => ({ ...keys, backward: true })); break
        case 'KeyA': setKeys(keys => ({ ...keys, left: true })); break
        case 'KeyD': setKeys(keys => ({ ...keys, right: true })); break
      }
    }

    const onKeyUp = (event) => {
      switch (event.code) {
        case 'KeyW': setKeys(keys => ({ ...keys, forward: false })); break
        case 'KeyS': setKeys(keys => ({ ...keys, backward: false })); break
        case 'KeyA': setKeys(keys => ({ ...keys, left: false })); break
        case 'KeyD': setKeys(keys => ({ ...keys, right: false })); break
      }
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [])

  const direction = new THREE.Vector3()
  const frontVector = new THREE.Vector3()
  const sideVector = new THREE.Vector3()
  const speed = 5

  useFrame((state) => {
    if (!ref.current) return

    frontVector.set(0, 0, Number(keys.backward) - Number(keys.forward))
    sideVector.set(Number(keys.left) - Number(keys.right), 0, 0)
    direction
      .subVectors(frontVector, sideVector)
      .normalize()
      .multiplyScalar(speed)
      .applyEuler(state.camera.rotation)

    ref.current.setLinvel({ x: direction.x, y: ref.current.linvel().y, z: direction.z })

    const position = ref.current.translation()
    
    state.camera.position.set(
      position.x,
      position.y + 1.7,
      position.z
    )
  })

  return (
    <RigidBody 
      ref={ref} 
      position={[0, 1, 10]} 
      enabledRotations={[false, false, false]} 
      type="dynamic"
      colliders="hull"
      mass={1}
      lockRotations
    >
      <mesh visible={false}>
        <capsuleGeometry args={[0.5, 1]} />
      </mesh>
    </RigidBody>
  )
}

function Room() {
  const room = useGLTF('/room.glb')
  return (
    <RigidBody type="fixed">
      <primitive object={room.scene} position={[0, 0, 0]} scale={100} />
    </RigidBody>
  )
}

function Floor() {
  return (
    <RigidBody type="fixed">
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>
    </RigidBody>
  )
}

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas camera={{ position: [0, 1.7, 5], fov: 60, near: 0.001, far: 9999 }}>
        <Environment files="/hdr.hdr" background />
        <Physics>
          <PointerLockControls />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <Player />
          <Room />
          <Floor />
        </Physics>
      </Canvas>
      {/* <div style={{ 
        position: 'absolute', 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)',
        color: 'white',
        userSelect: 'none'
      }}>
        Click to start<br/>
        WASD to move<br/>
        Mouse to look<br/>
        ESC to exit
      </div> */}
    </div>
  )
}

export default App
