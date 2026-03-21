"use client"

import React, { useRef, useMemo, useState, useEffect } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import {
  PerspectiveCamera,
  MeshTransmissionMaterial,
  Environment,
  Float,
  Text,
} from "@react-three/drei"
import * as THREE from "three"
import { Bloom, EffectComposer, Noise, Vignette, ChromaticAberration } from "@react-three/postprocessing"
import { useTheme } from "next-themes"

// GLSL Noise functions
const noiseGLSL = `
  // Simplex 3D Noise by Ian McEwan, Ashima Arts
  vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

  float snoise(vec3 v){ 
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 =   v - i + dot(i, C.xxx) ;

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );

    vec3 x1 = x0 - i1 + 1.0 * C.xxx;
    vec3 x2 = x0 - i2 + 2.0 * C.xxx;
    vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

    i = mod(i, 289.0); 
    vec4 p = permute( permute( permute( 
               i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
             + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

    float n_ = 1.0/7.0;
    vec3  ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z *ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                  dot(p2,x2), dot(p3,x3) ) );
  }
`

const FluidBlob = ({ color, position, scale, speed, noiseStrength, mouseResponse }: any) => {
  const meshRef = useRef<THREE.Mesh>(null!)
  const { viewport } = useThree()
  
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uNoiseStrength: { value: noiseStrength },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uMouseResponse: { value: mouseResponse },
    }),
    [color, noiseStrength, mouseResponse]
  )

  useFrame((state) => {
    const { clock, mouse } = state
    meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, position[0] + mouse.x * 2, 0.05)
    meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, position[1] + mouse.y * 2, 0.05)
    
    // @ts-ignore
    meshRef.current.material.uniforms.uTime.value = clock.getElapsedTime() * speed
    // @ts-ignore
    meshRef.current.material.uniforms.uMouse.value.set(mouse.x, mouse.y)
  })

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <icosahedronGeometry args={[1, 64]} />
      <shaderMaterial
        vertexShader={`
          ${noiseGLSL}
          varying vec3 vNormal;
          varying vec3 vViewPosition;
          varying float vNoise;
          uniform float uTime;
          uniform float uNoiseStrength;
          uniform vec2 uMouse;
          uniform float uMouseResponse;

          void main() {
            vNormal = normalize(normalMatrix * normal);
            
            // Calculate noise-based displacement
            float noise = snoise(position * 0.5 + uTime * 0.2);
            vNoise = noise;
            
            // Mouse interaction displacement
            float dist = distance(uv, uMouse * 0.5 + 0.5);
            float mouseEffect = (1.0 - smoothstep(0.0, 0.5, dist)) * uMouseResponse;
            
            vec3 newPosition = position + normal * (noise * uNoiseStrength + mouseEffect * 0.5);
            
            vec4 mvPosition = modelViewMatrix * vec4(newPosition, 1.0);
            vViewPosition = -mvPosition.xyz;
            gl_Position = projectionMatrix * mvPosition;
          }
        `}
        fragmentShader={`
          varying vec3 vNormal;
          varying vec3 vViewPosition;
          varying float vNoise;
          uniform vec3 uColor;
          uniform float uTime;

          void main() {
            vec3 viewDir = normalize(vViewPosition);
            float fresnel = pow(1.0 - dot(viewDir, vNormal), 3.0);
            
            // Color based on noise and fresnel
            vec3 color = mix(uColor, vec3(1.0), fresnel * 0.5);
            color += vec3(0.0, 0.5, 1.0) * vNoise * 0.2; // Add some internal highlights
            
            float alpha = 0.8 + fresnel * 0.2;
            gl_FragColor = vec4(color, alpha);
          }
        `}
        transparent
        uniforms={uniforms}
      />
    </mesh>
  )
}

const GlassPanels = () => {
    const groupRef = useRef<THREE.Group>(null!)
    const { viewport } = useThree()
    
    useFrame((state) => {
        const time = state.clock.getElapsedTime()
        groupRef.current.rotation.y = Math.sin(time * 0.1) * 0.1
        groupRef.current.rotation.x = Math.cos(time * 0.1) * 0.05
    })

    return (
        <group ref={groupRef}>
            {Array.from({ length: 5 }).map((_, i) => (
                <mesh key={i} position={[(Math.random() - 0.5) * 15, (Math.random() - 0.5) * 10, -5 - i * 2]}>
                    <planeGeometry args={[4, 6]} />
                    <MeshTransmissionMaterial
                        backside
                        thickness={2}
                        roughness={0.1}
                        transmission={1}
                        ior={1.2}
                        chromaticAberration={0.1}
                        anisotropy={1}
                        distortion={0.5}
                        distortionScale={0.5}
                        temporalDistortion={0.1}
                    />
                </mesh>
            ))}
        </group>
    )
}

const InteractiveCamera = () => {
  const { camera, mouse } = useThree()
  
  useFrame(() => {
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, mouse.x * 2, 0.05)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, mouse.y * 2, 0.05)
    camera.lookAt(0, 0, 0)
  })

  return <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={45} />
}

export const FluidIntelligence = () => {
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const bgColor = theme === "dark" ? "#030308" : "#f8faff"

  return (
    <div className="fixed inset-0 -z-50 w-full h-full pointer-events-none">
      <Canvas dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
        <color attach="background" args={[bgColor]} />
        <PerspectiveCamera makeDefault position={[0, 0, 12]} fov={45} />
        
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#00E5FF" />
        <pointLight position={[-10, -10, 10]} intensity={1.5} color="#7F00FF" />
        
        <React.Suspense fallback={null}>
          <Environment preset="city" />
          
          <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <FluidBlob 
              color={theme === "dark" ? "#00E5FF" : "#0099FF"} 
              position={[-4, 2, 0]} 
              scale={2.5} 
              speed={1.2} 
              noiseStrength={0.4}
              mouseResponse={0.3}
            />
          </Float>

          <Float speed={1.5} rotationIntensity={0.8} floatIntensity={0.8}>
            <FluidBlob 
              color={theme === "dark" ? "#7F00FF" : "#6600CC"} 
              position={[4, -2, -2]} 
              scale={3} 
              speed={0.8} 
              noiseStrength={0.5}
              mouseResponse={0.4}
            />
          </Float>

          <Float speed={2.5} rotationIntensity={0.3} floatIntensity={0.5}>
              <FluidBlob 
                color={theme === "dark" ? "#FF1493" : "#FF0066"} 
                position={[0, 0, -4]} 
                scale={2} 
                speed={1.5} 
                noiseStrength={0.3}
                mouseResponse={0.2}
              />
          </Float>

          <GlassPanels />
        </React.Suspense>
        
        <InteractiveCamera />

        <EffectComposer>
          <Bloom 
            intensity={1.2}
            luminanceThreshold={0.1}
            mipmapBlur
            radius={0.7}
          />
          <ChromaticAberration 
              offset={new THREE.Vector2(0.002, 0.002)} 
          />
          <Noise opacity={0.03} />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>
      </Canvas>
      
      {/* Post-overlay for glassmorphism vibes */}
      <div className="absolute inset-0 pointer-events-none backdrop-blur-[2px] opacity-30" />
    </div>
  )
}

export default FluidIntelligence
