"use client"

import React, { useRef, useMemo, useState, useEffect } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import {
  Environment,
  MeshTransmissionMaterial,
  Float,
  PerspectiveCamera,
  ContactShadows,
} from "@react-three/drei"
import * as THREE from "three"
import { motion, AnimatePresence } from "framer-motion"
import { Bloom, EffectComposer, Noise, Vignette, DepthOfField } from "@react-three/postprocessing"

import { useTheme } from "next-themes"

// Constants
const COLORS = ["#00E5FF", "#7F00FF", "#FF1493", "#00FFFF"]

// Component for a single bubble group (instanced for performance)
const InstancedBubbles = ({ count = 40 }: { count?: number }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const { viewport, mouse, camera } = useThree()
  
  // Create initial data for bubbles
  const bubbles = useMemo(() => {
    const temp = []
    for (let i = 0; i < count; i++) {
        const t = Math.random() * 100
        const factor = 20 + Math.random() * 100
        const speed = 0.01 + Math.random() / 200
        const x = (Math.random() - 0.5) * 20
        const y = (Math.random() - 0.5) * 20
        const z = (Math.random() - 0.5) * 10
        const size = 0.1 + Math.random() * 0.7
        const opacity = 0.2 + Math.random() * 0.8
        temp.push({ t, factor, speed, x, y, z, size, opacity })
    }
    return temp
  }, [count])

  const dummy = useMemo(() => new THREE.Object3D(), [])
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    
    bubbles.forEach((bubble, i) => {
        const { t, factor, speed, size } = bubble
        
        // Organic floating motion
        bubble.y += Math.cos(t + time * speed) * 0.01
        bubble.x += Math.sin(t + time * speed) * 0.01
        
        // Mouse repulsion
        const mx = (mouse.x * viewport.width) / 2
        const my = (mouse.y * viewport.height) / 2
        
        const dist = new THREE.Vector2(bubble.x, bubble.y).distanceTo(new THREE.Vector2(mx, my))
        const repulsionLimit = 4
        if (dist < repulsionLimit) {
            const force = (repulsionLimit - dist) * 0.05
            const dirX = bubble.x - mx
            const dirY = bubble.y - my
            bubble.x += dirX * force
            bubble.y += dirY * force
        }

        // Bouncing back logic
        if (Math.abs(bubble.x) > viewport.width) bubble.x *= -0.9
        if (Math.abs(bubble.y) > viewport.height) bubble.y *= -0.9

        dummy.position.set(bubble.x, bubble.y, bubble.z)
        dummy.scale.setScalar(size * (1 + Math.sin(time + t) * 0.1)) // Subtle pulsing
        dummy.rotation.set(time * 0.1, time * 0.1, time * 0.1)
        dummy.updateMatrix()
        meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 32, 32]} />
      <MeshTransmissionMaterial
        backside
        backsideThickness={5}
        thickness={1}
        chromaticAberration={0.05}
        anisotropy={1}
        clearcoat={1}
        clearcoatRoughness={0.1}
        ior={1.2}
        transmission={1}
        roughness={0.1}
        metalness={0.1}
        envMapIntensity={2}
      />
    </instancedMesh>
  )
}

const MovingLights = ({ theme }: { theme?: string }) => {
  const light1 = useRef<THREE.PointLight>(null!)
  const light2 = useRef<THREE.PointLight>(null!)
  const light3 = useRef<THREE.PointLight>(null!)

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    
    light1.current.position.set(Math.sin(time * 0.5) * 10, Math.cos(time * 0.3) * 10, 5)
    light2.current.position.set(Math.cos(time * 0.4) * 10, Math.sin(time * 0.6) * 10, -5)
    light3.current.position.set(Math.sin(time * 0.7) * 5, Math.cos(time * 0.5) * 5, 0)
  })

  const intensity = theme === "light" ? 15 : 10

  return (
    <>
      <pointLight ref={light1} intensity={intensity} color="#00E5FF" />
      <pointLight ref={light2} intensity={intensity} color="#7F00FF" />
      <pointLight ref={light3} intensity={intensity} color="#FF1493" />
    </>
  )
}

const InteractiveCamera = () => {
  const { camera, mouse } = useThree()
  
  useFrame(() => {
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, mouse.x * 3, 0.05)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, mouse.y * 3, 0.05)
    camera.lookAt(0, 0, 0)
  })

  return <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={50} />
}

export const GlassBubbleUniverse = () => {
  const [mounted, setMounted] = useState(false)
  const [bubbleCount, setBubbleCount] = useState(40)
  const { theme } = useTheme()

  useEffect(() => {
    setMounted(true)
    const handleResize = () => {
      setBubbleCount(window.innerWidth < 768 ? 20 : 60)
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  if (!mounted) return null

  const bgColor = theme === "light" ? "#f8faff" : "#020205"
  const fogColor = theme === "light" ? "#f8faff" : "#020205"

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
      className="fixed inset-0 -z-30 w-full h-full pointer-events-none overflow-hidden"
    >
      <Canvas dpr={[1, 2]} gl={{ antialias: false, alpha: true }}>
        <color attach="background" args={[bgColor]} />
        <fog attach="fog" args={[fogColor, 10, 30]} />
        
        <ambientLight intensity={theme === "light" ? 0.8 : 0.4} />
        <MovingLights theme={theme} />
        
        <React.Suspense fallback={null}>
          <Environment preset={theme === "light" ? "apartment" : "night"} />
          <InstancedBubbles count={bubbleCount} />
        </React.Suspense>
        
        <InteractiveCamera />
        
        <ContactShadows
            position={[0, -10, 0]}
            opacity={theme === "light" ? 0.2 : 0.4}
            scale={40}
            blur={2}
            far={10}
            color={theme === "light" ? "#aaccee" : "#000000"}
        />

        <EffectComposer>
          <Bloom 
            intensity={theme === "light" ? 0.5 : 1.5}
            luminanceThreshold={theme === "light" ? 0.8 : 0.1}
            mipmapBlur
            radius={0.8}
          />
          <DepthOfField 
            focusDistance={0.02}
            focalLength={0.02}
            bokehScale={theme === "light" ? 1 : 3}
          />
          <Noise opacity={0.02} />
          <Vignette eskil={false} offset={0.1} darkness={theme === "light" ? 0.8 : 1.2} />
        </EffectComposer>
      </Canvas>
      
      {/* Grainy Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </motion.div>
  )
}

export default GlassBubbleUniverse
