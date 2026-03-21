"use client"

import React, { useMemo, useRef, useState } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Points, PointMaterial, Float, Sphere, MeshDistortMaterial, PerspectiveCamera } from "@react-three/drei"
import * as THREE from "three"
import { Bloom, EffectComposer, Noise, Vignette } from "@react-three/postprocessing"

const ParticleField = ({ count = 5000 }) => {
  const points = useMemo(() => {
    const p = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 10
      p[i * 3 + 1] = (Math.random() - 0.5) * 10
      p[i * 3 + 2] = (Math.random() - 0.5) * 10
    }
    return p
  }, [count])

  const ref = useRef<THREE.Points>(null!)

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    ref.current.rotation.y = time * 0.05
    ref.current.rotation.x = time * 0.02
  })

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={points} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#00E5FF"
          size={0.015}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>
    </group>
  )
}

const FloatingShapes = () => {
  return (
    <group>
      <Float speed={2} rotationIntensity={1} floatIntensity={2}>
        <Sphere args={[0.5, 32, 32]} position={[-2, 1, -2]}>
          <MeshDistortMaterial
            color="#7F00FF"
            speed={3}
            distort={0.4}
            radius={1}
            emissive="#7F00FF"
            emissiveIntensity={2}
          />
        </Sphere>
      </Float>
      
      <Float speed={1.5} rotationIntensity={2} floatIntensity={1.5}>
        <mesh position={[2, -1, -3]} rotation={[Math.PI / 4, 0, 0]}>
          <torusKnotGeometry args={[0.4, 0.1, 100, 16]} />
          <MeshDistortMaterial
            color="#FF1493"
            speed={2}
            distort={0.5}
            emissive="#FF1493"
            emissiveIntensity={1.5}
          />
        </mesh>
      </Float>

      <Float speed={3} rotationIntensity={0.5} floatIntensity={1}>
        <Sphere args={[0.3, 32, 32]} position={[0, -2, -1]}>
          <MeshDistortMaterial
            color="#00E5FF"
            speed={4}
            distort={0.3}
            emissive="#00E5FF"
            emissiveIntensity={2}
          />
        </Sphere>
      </Float>
    </group>
  )
}

const NeuralConnections = ({ count = 20 }) => {
  const lines = useMemo(() => {
    const temp = []
    for (let i = 0; i < count; i++) {
        const start = new THREE.Vector3(
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 8
        )
        const end = new THREE.Vector3(
            start.x + (Math.random() - 0.5) * 2,
            start.y + (Math.random() - 0.5) * 2,
            start.z + (Math.random() - 0.5) * 2
        )
        temp.push({ start, end })
    }
    return temp
  }, [count])

  const ref = useRef<THREE.Group>(null!)

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    ref.current.rotation.y = time * 0.03
  })

  return (
    <group ref={ref}>
      {lines.map((line, i) => (
        <line key={i}>
          <bufferGeometry attach="geometry">
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([line.start.x, line.start.y, line.start.z, line.end.x, line.end.y, line.end.z])}
              itemSize={3}
              args={[new Float32Array([line.start.x, line.start.y, line.start.z, line.end.x, line.end.y, line.end.z]), 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial attach="material" color="#FF1493" transparent opacity={0.2} linewidth={1} />
        </line>
      ))}
    </group>
  )
}

const InteractiveCamera = () => {
  const { camera, mouse } = useThree()
  const target = new THREE.Vector3()

  useFrame(() => {
    target.set(mouse.x * 0.5, mouse.y * 0.5, camera.position.z)
    camera.position.lerp(target, 0.05)
    camera.lookAt(0, 0, 0)
  })

  return <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={75} />
}

const Crazy3DBackground = () => {
  return (
    <div className="fixed inset-0 -z-30 w-full h-full bg-[#050505]">
        <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 5], fov: 75 }}>
            <color attach="background" args={["#050505"]} />
            <fog attach="fog" args={["#050505", 5, 15]} />
            
            <ambientLight intensity={0.2} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#7F00FF" />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00E5FF" />
            
            <ParticleField count={6000} />
            <FloatingShapes />
            <NeuralConnections count={40} />
            <InteractiveCamera />

            <EffectComposer>
                <Bloom 
                    luminanceThreshold={0.2} 
                    mipmapBlur 
                    intensity={1.2} 
                    radius={0.4}
                />
                <Noise opacity={0.05} />
                <Vignette eskil={false} offset={0.1} darkness={1.1} />
            </EffectComposer>
        </Canvas>
        
        {/* Subtle Overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />
        <div className="absolute inset-0 backdrop-blur-[2px] opacity-20 pointer-events-none" />
    </div>
  )
}

export default Crazy3DBackground
