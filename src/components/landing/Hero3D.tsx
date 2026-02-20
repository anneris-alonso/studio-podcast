import { useThree, useFrame } from "@react-three/fiber";
import { useGLTF, Environment, Float, Sparkles, ContactShadows, Lightformer } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom, Noise, Vignette } from "@react-three/postprocessing";
import { useRef, useState, useEffect, Suspense } from "react";
import * as THREE from "three";
import { motion } from "framer-motion";

// --- SHADER PARA EL HUMO MULTICOLOR (Opcional para otras secciones) ---
const SmokeShader = {
  uniforms: {
    uTime: { value: 0 },
    colorPink: { value: new THREE.Color("#D936F1") },
    colorPurple: { value: new THREE.Color("#6A47F2") },
    colorBlue: { value: new THREE.Color("#3B82F6") },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    uniform float uTime;
    uniform vec3 colorPink;
    uniform vec3 colorPurple;
    uniform vec3 colorBlue;

    float noise(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    float smoothNoise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      float a = noise(i);
      float b = noise(i + vec2(1.0, 0.0));
      float c = noise(i + vec2(0.0, 1.0));
      float d = noise(i + vec2(1.0, 1.0));
      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }

    void main() {
      vec2 uv = vUv;
      float t = uTime * 0.2;
      float n = smoothNoise(uv * 3.0 + t);
      n += smoothNoise(uv * 6.0 - t * 0.5) * 0.5;
      n += smoothNoise(uv * 12.0 + t * 0.2) * 0.25;
      n /= 1.75;
      vec3 finalColor = mix(colorPink, colorPurple, n);
      finalColor = mix(finalColor, colorBlue, smoothstep(0.4, 0.8, n));
      float alpha = smoothstep(0.1, 0.6, n) * 0.15;
      gl_FragColor = vec4(finalColor, alpha);
    }
  `
};

function SmokeEffect() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });
  return (
    <mesh position={[0, 0, -5]} scale={[25, 15, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        args={[SmokeShader]}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

function MicrophoneModel(props: any) {
  const { scene } = useGLTF("/models/microphone.glb");
  const meshRef = useRef<THREE.Group>(null);

  return (
    <group {...props} dispose={null}>
        <group ref={meshRef} position={[-1, 2.5, 0]} rotation={[0, 0, 0]}>
            
            {/* 1. EL MICRÓFONO (Cambia estos valores para mover solo el micro) */}
            <primitive object={scene} scale={45} position={[0, -2, 0]} rotation={[0.6, 3.7, 0]} />
            
            {/* 2. EL ARO NEÓN (Cambia estos valores para mover solo el aro) */}
            <mesh position={[0, 0.5, -2]} rotation={[0, 0, 0]}>
              <torusGeometry args={[1.8, 0.09, 32, 100]} /> 
              <shaderMaterial
                transparent
                uniforms={{
                  color1: { value: new THREE.Color("#D936F1") }, // Rosa
                  color2: { value: new THREE.Color("#6A47F2") }, // Morado
                  color3: { value: new THREE.Color("#3B82F6") }, // Azul
                }}
                vertexShader={`
                  varying vec2 vUv;
                  void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                  }
                `}
                fragmentShader={`
                  varying vec2 vUv;
                  uniform vec3 color1;
                  uniform vec3 color2;
                  uniform vec3 color3;
                  void main() {
                    vec3 finalColor;
                    if (vUv.x < 0.5) {
                      finalColor = mix(color1, color2, vUv.x * 2.0);
                    } else {
                      finalColor = mix(color2, color3, (vUv.x - 0.5) * 2.0);
                    }
                    float edgeSoftness = pow(sin(vUv.y * 3.14159), 3.0);
                    gl_FragColor = vec4(finalColor * 5.0, edgeSoftness); 
                  }
                `}
              />
            </mesh>
        </group>
    </group>
  );
}

function Scene({ dpr }: { dpr: number }) {
  return (
    <>
      <color attach="background" args={["#050508"]} />
      
      <Environment resolution={256}>
        <group rotation={[-Math.PI / 3, 0, 1]}>
          <Lightformer form="circle" intensity={10} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={2} />
          <Lightformer form="circle" intensity={4} rotation-y={Math.PI / 2} position={[-5, 1, -1]} scale={2} />
        </group>
      </Environment>

      {/* Luces de Color para integrar el Micro con el Aro */}
      <pointLight position={[1, 1, 2]} intensity={50} color="#D936F1" distance={10} />
      <pointLight position={[6, 1, 2]} intensity={50} color="#3B82F6" distance={10} />
      <spotLight position={[3.5, 5, -2]} angle={0.8} penumbra={1} intensity={100} color="#6A47F2" />
      <spotLight position={[5, 5, 10]} angle={0.5} penumbra={1} intensity={10} color="#ffffff" shadow-bias={-0.0001} />
      
      <Sparkles count={40} scale={10} size={1} speed={0.2} opacity={0.4} color="#a78bfa" />

      <Suspense fallback={null}>
        <MicrophoneModel position={[3.5, -2, 0]} />
      </Suspense>

      <ContactShadows resolution={1024} scale={20} blur={2} opacity={0.5} far={10} color="#000000" />
      
      <EffectComposer>
        <Bloom luminanceThreshold={0.5} mipmapBlur intensity={1.2} radius={0.6} /> 
        <Noise opacity={0.05} />
        <Vignette eskil={false} offset={0.1} darkness={0.9} />
      </EffectComposer>
    </>
  );
}

export function Hero3D() {
    const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1;
    const videoRef = useRef<HTMLVideoElement>(null);

    // Ajustar velocidad de reproducción (más lento para el humo)
    useEffect(() => {
        if (videoRef.current) {
            // 0.5 es la mitad de la velocidad original. 
            // Cámbialo a 0.7 o 0.3 si quieres ajustar la lentitud.
            videoRef.current.playbackRate = 0.5;
        }
    }, []);

    return (
        <div className="absolute inset-0 z-0 w-full h-full pointer-events-none bg-black">
            {/* 
                SCENA 3D (Comentada temporalmente)
                Descomenta el bloque <Canvas> para volver al micro 3D
            */}
            {/* 
            <Canvas
             dpr={[1, 2]}
             gl={{ 
                 powerPreference: "high-performance",
                 antialias: true,
                 toneMapping: THREE.ACESFilmicToneMapping,
                 outputColorSpace: THREE.SRGBColorSpace,
                 alpha: true 
             }}
             camera={{ position: [0, 0, 6], fov: 45 }}
            >
                <Scene dpr={dpr} />
            </Canvas> 
            */}

            {/* VIDEO DE FONDO TOTALMENTE TRANSPARENTE (100% OPACIDAD, SIN CAPAS) */}
            <video
                ref={videoRef}
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 w-full h-full object-cover scale-[1.05]"
            >
                <source src="/video/hero.mp4" type="video/mp4" />
            </video>

            {/* TOTALMENTE TRANSPARENTE: SE ELIMINAN TODOS LOS DEGRADADOS Y HALOS NEGROS */}
        </div>
    );
}
