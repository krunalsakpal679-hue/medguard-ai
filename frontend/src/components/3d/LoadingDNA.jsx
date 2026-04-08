import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sphere, Float } from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
import * as THREE from 'three'

const HelixStrand = ({ count = 12 }) => {
    const ref = useRef()
    useFrame((state) => {
        ref.current.rotation.y = state.clock.getElapsedTime() * 2
    })

    const points = useMemo(() => {
        const p = []
        for (let i = 0; i < count; i++) {
            const y = (i - count / 2) * 0.4
            const angle = i * 0.8
            p.push({ pos: [Math.sin(angle) * 0.6, y, Math.cos(angle) * 0.6], color: '#6366f1' })
            p.push({ pos: [Math.sin(angle + Math.PI) * 0.6, y, Math.cos(angle + Math.PI) * 0.6], color: '#14b8a6' })
        }
        return p
    }, [count])

    return (
        <group ref={ref}>
            {points.map((pt, i) => (
                <Sphere key={i} position={pt.pos} args={[0.08, 16, 16]}>
                    <meshStandardMaterial color={pt.color} emissive={pt.color} emissiveIntensity={1} />
                </Sphere>
            ))}
        </group>
    )
}

const LoadingDNA = ({ progress = 0, message = "Analyzing Molecular Pattern" }) => {
    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center justify-center p-12 bg-white/80 backdrop-blur-2xl rounded-[40px] shadow-2xl border border-white/20"
            >
                <div className="w-48 h-48 mb-6">
                    <Canvas camera={{ position: [0, 0, 5], fov: 40 }}>
                        <ambientLight intensity={0.5} />
                        <pointLight position={[10, 10, 10]} intensity={1} />
                        <Float speed={5} rotationIntensity={1} floatIntensity={1}>
                            <HelixStrand />
                        </Float>
                    </Canvas>
                </div>
                
                <div className="text-center">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-1">{message}</h3>
                    <div className="flex items-center justify-center gap-3">
                        <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                className="h-full bg-indigo-600 rounded-full"
                            />
                        </div>
                        <span className="text-[10px] font-black text-indigo-600 tabular-nums">{Math.round(progress)}%</span>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}

export default LoadingDNA
