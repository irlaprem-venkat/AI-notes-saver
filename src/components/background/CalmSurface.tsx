"use client"

import React, { useMemo, useRef, useEffect } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"

// GLSL Noise functions (Simplex 3D)
const noiseGLSL = `
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  float snoise(vec3 v) {
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 =   v - i + dot(i, C.xxx) ;
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute( permute( permute(
               i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
             + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
    float n_ = 0.142857142857;
    vec3  ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
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

const Surface = () => {
    const meshRef = useRef<THREE.Mesh>(null!)
    const materialRef = useRef<THREE.ShaderMaterial>(null!)
    const { pointer, size } = useThree()
    
    // Internal state for interactions
    const interaction = useRef({
        scroll: 0,
        clickPulse: 0,
        clickPos: new THREE.Vector2(0, 0)
    })

    useEffect(() => {
        const handleScroll = () => {
            interaction.current.scroll = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)
        }
        const handleClick = (e: MouseEvent) => {
            interaction.current.clickPulse = 1.0
            interaction.current.clickPos.set(
                (e.clientX / window.innerWidth) * 2 - 1,
                -(e.clientY / window.innerHeight) * 2 + 1
            )
        }
        window.addEventListener("scroll", handleScroll)
        window.addEventListener("mousedown", handleClick)
        return () => {
            window.removeEventListener("scroll", handleScroll)
            window.removeEventListener("mousedown", handleClick)
        }
    }, [])

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uScroll: { value: 0 },
        uClickPulse: { value: 0 },
        uClickPos: { value: new THREE.Vector2(0, 0) },
        uColor1: { value: new THREE.Color("#030412") },
        uColor2: { value: new THREE.Color("#1a103c") },
        uColor3: { value: new THREE.Color("#0f3d59") },
        uResolution: { value: new THREE.Vector2(size.width, size.height) }
    }), [size])

    useFrame((state) => {
        const { clock } = state
        if (materialRef.current) {
            const t = clock.getElapsedTime()
            materialRef.current.uniforms.uTime.value = t
            materialRef.current.uniforms.uMouse.value.lerp(pointer, 0.05)
            materialRef.current.uniforms.uScroll.value = THREE.MathUtils.lerp(materialRef.current.uniforms.uScroll.value, interaction.current.scroll, 0.05)
            
            // Decaying click pulse
            interaction.current.clickPulse *= 0.96
            if (interaction.current.clickPulse < 0.01) interaction.current.clickPulse = 0
            materialRef.current.uniforms.uClickPulse.value = interaction.current.clickPulse
            materialRef.current.uniforms.uClickPos.value.lerp(interaction.current.clickPos, 0.1)
        }
    })

    const vertexShader = `
        varying vec2 vUv;
        varying float vElevation;
        varying vec3 vNormal;
        uniform float uTime;
        uniform vec2 uMouse;
        uniform float uScroll;
        uniform float uClickPulse;
        uniform vec2 uClickPos;

        ${noiseGLSL}

        void main() {
            vUv = uv;
            
            vec3 pos = position;
            
            // Base wave motion - extremely slow and calm
            float noiseFreq = 0.3;
            float noiseAmp = 0.15 + uScroll * 0.1;
            float elevation = snoise(vec3(pos.xy * noiseFreq, uTime * 0.08)) * noiseAmp;
            
            // Secondary layer for complexity without clutter
            elevation += snoise(vec3(pos.xy * 0.15, uTime * 0.05)) * 0.1;
            
            // Mouse interaction - soft ripple
            float mouseDist = distance(pos.xy, uMouse * vec2(6.0, 4.0));
            float mouseInfluence = smoothstep(2.5, 0.0, mouseDist);
            elevation += mouseInfluence * 0.08 * sin(uTime * 1.5 - mouseDist * 3.0);
            
            // Click pulse - gentle wave
            float clickDist = distance(pos.xy, uClickPos * vec2(6.0, 4.0));
            float pulseWave = sin(clickDist * 5.0 - uTime * 12.0) * uClickPulse;
            elevation += pulseWave * smoothstep(3.0, 0.0, clickDist) * 0.15;

            pos.z += elevation;
            vElevation = elevation;
            vNormal = normal; // Simplification for now

            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
    `

    const fragmentShader = `
        varying vec2 vUv;
        varying float vElevation;
        varying vec3 vNormal;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        uniform vec3 uColor3;
        uniform float uTime;

        void main() {
            // Smooth gradient mixing based on UVs and elevation
            float mixVal = smoothstep(0.0, 1.0, vUv.y + vElevation * 1.5);
            vec3 color = mix(uColor1, uColor2, mixVal);
            
            // Subtle cyan/blue glow based on horizontal UV and a slow sine wave
            float glowMix = smoothstep(0.0, 1.0, vUv.x * 0.6 + sin(uTime * 0.1) * 0.2 + vElevation);
            color = mix(color, uColor3, glowMix * 0.6);
            
            // Premium Matte + Soft Glossy Illusion
            // Calculate a fake rim light / gloss from the elevation peaks
            float gloss = smoothstep(0.0, 0.15, vElevation);
            color += vec3(gloss * 0.08);
            
            // "Breathing" effect - subtle overall brightness pulse
            float breathe = (sin(uTime * 0.5) * 0.5 + 0.5) * 0.02;
            color += vec3(breathe);
            
            // Micro-silk effect to make it feel tangible (barely visible)
            float silk = sin(vUv.x * 120.0 + vElevation * 20.0) * 0.006;
            color += vec3(silk);

            gl_FragColor = vec4(color, 1.0);
        }
    `

    return (
        <mesh ref={meshRef} rotation={[-Math.PI / 12, 0, 0]} position={[0, 0, -1]}>
            <planeGeometry args={[18, 12, 160, 160]} />
            <shaderMaterial
                ref={materialRef}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                transparent={true}
                side={THREE.DoubleSide}
            />
        </mesh>
    )
}

const CalmSurface = () => {
    const [hasError, setHasError] = React.useState(false)

    if (hasError) {
        return <div className="fixed inset-0 -z-30 w-full h-full bg-gradient-to-br from-[#050510] via-[#0a0a1a] to-[#1a1b3a]" />
    }

    return (
        <div className="fixed inset-0 -z-30 w-full h-full bg-[#030308]">
            <Canvas 
                camera={{ position: [0, 0, 6], fov: 65 }}
                onError={() => setHasError(true)}
                dpr={[1, 1.5]} // Limit DPR for performance
            >
                <Surface />
            </Canvas>
            {/* Soft Ambient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 pointer-events-none" />
            <div className="absolute inset-0 backdrop-blur-[0.5px] opacity-[0.05] pointer-events-none" />
        </div>
    )
}


export default CalmSurface
