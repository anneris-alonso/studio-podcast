"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom, Noise, Vignette } from "@react-three/postprocessing";
import { useRef, Suspense } from "react";
import * as THREE from "three";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";

// --- SHADER PARA EL HUMO MULTICOLOR ---
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
    }`,
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
            float t = uTime * 0.15;
            float n = smoothNoise(uv * 3.0 + t);
            n += smoothNoise(uv * 6.0 - t * 0.5) * 0.5;
            n += smoothNoise(uv * 12.0 + t * 0.2) * 0.25;
            n /= 1.75;
        vec3 finalColor = mix(colorPink, colorPurple, n);
        finalColor = mix(finalColor, colorBlue, smoothstep(0.4, 0.8, n));
        float alpha = smoothstep(0.1, 0.6, n) * 0.2;
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

function AboutScene() {
    return (
        <>
            <color attach="background" args={["#000000"]} />
            <SmokeEffect />
            <EffectComposer>
                <Bloom luminanceThreshold={0.2} mipmapBlur intensity={1.5} radius={0.8} />
                <Noise opacity={0.03} />
                <Vignette eskil={false} offset={0.1} darkness={0.8} />
            </EffectComposer>
        </>
    );
}

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-black text-white relative overflow-hidden">
            <Navbar />
            
            {/* 3D Background */}
            <div className="absolute inset-0 z-0">
                <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                    <Suspense fallback={null}>
                        <AboutScene />
                    </Suspense>
                </Canvas>
            </div>

            {/* Content */}
            <div className="relative z-10 pt-32 pb-20 px-6 max-w-7xl mx-auto">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-5xl md:text-7xl font-bold font-heading mb-6 tracking-tight">
                        Our <span className="premium-gradient-text">Story</span>
                    </h1>
                    <p className="text-xl text-white/60 max-w-2xl mx-auto">
                        Elevating the art of sound through precision engineering and immersive design.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="glass-card-premium p-12 group"
                    >
                        <h2 className="text-4xl font-bold mb-8 leading-tight">The Dubai <br/><span className="premium-gradient-text tracking-tighter">Standard</span></h2>
                        <p className="text-white/60 leading-relaxed mb-10 text-lg">
                            Born from a desire to redefine podcasting, Studio Suite brings the luxury of Dubai's high-tech scene to every creator. We believe that professional quality shouldn't come with friction.
                        </p>
                        <div className="flex gap-6">
                            <div className="flex-1 p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-accent-pink transition-colors">
                                <span className="text-3xl font-bold text-accent-pink">100%</span>
                                <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold mt-2">Acoustic Purity</p>
                            </div>
                            <div className="flex-1 p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-accent-violet transition-colors">
                                <span className="text-3xl font-bold text-accent-violet">4K</span>
                                <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold mt-2">Precision Gear</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative h-[600px] rounded-[40px] overflow-hidden glass-card-premium p-0 border-none shadow-[0_40px_100px_rgba(0,0,0,0.8)]"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-accent-purple/20 to-transparent z-10 pointer-events-none" />
                        <img 
                            src="/images/premium-mic-pro.jpg" 
                            alt="Premium Content Station"
                            className="w-full h-full object-cover transform scale-110 hover:scale-100 transition-transform duration-1000"
                        />
                        <div className="absolute bottom-8 left-8 right-8 p-8 glass-card rounded-3xl z-20 backdrop-blur-3xl border-white/10">
                            <h3 className="text-2xl font-bold mb-1">Elite Infrastructure</h3>
                            <p className="text-white/40 text-[10px] tracking-[0.25em] font-bold uppercase">Business Bay • Dubai Edition</p>
                        </div>
                    </motion.div>
                </div>

                {/* Values Section */}
                <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { title: "Excellence", desc: "No compromises on hardware or software in every session.", color: "accent-pink" },
                        { title: "Immersive", desc: "Environments designed to inspire your best creative content.", color: "accent-violet" },
                        { title: "Instant", desc: "Cloud delivery and instant access at the speed of thought.", color: "accent-blue" }
                    ].map((val, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="glass-card-premium p-10 group relative"
                        >
                            <div className={`absolute top-0 right-10 w-20 h-20 bg-${val.color}/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity`} />
                            <h4 className={`text-2xl font-bold mb-4 text-${val.color}`}>{val.title}</h4>
                            <p className="text-white/50 leading-relaxed">{val.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </main>
    );
}
