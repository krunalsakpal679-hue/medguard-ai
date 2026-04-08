import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { 
    MeshDistortMaterial, 
    Sphere, 
    Float, 
    Torus, 
    PerspectiveCamera,
    PresentationControls
} from '@react-three/drei'
import * as THREE from 'three'

/**
 * Animated clinical synergy orb with dynamic distortion.
 */
const SynergyOrb = ({ synergyScore = 0.5, severity = 'NONE' }) => {
    const sphereRef = useRef()
    
    // Severity-based color mapping
    const getSeverityColor = (sev) => {
        switch (sev.toUpperCase()) {
            case 'CONTRAINDICATED': return '#991b1b'
            case 'MAJOR': return '#f43f5e'
            case 'MODERATE': return '#fb923c'
            case 'MINOR': return '#fde047'
            default: return '#14b8a6'
        }
    }

    const baseColor = getSeverityColor(severity)

    return (
        <div className="w-80 h-80 relative group">
            <Canvas dpr={[1, 2]}>
                <PerspectiveCamera makeDefault position={[0, 0, 5]} />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <spotLight position={[-5, 5, 5]} intensity={1} angle={0.3} penumbra={1} />

                <PresentationControls
                    global={false}
                    cursor={true}
                    snap={true}
                    speed={2}
                    zoom={1}
                    rotation={[0, 0, 0]}
                    polar={[-Math.PI / 4, Math.PI / 4]}
                    azimuth={[-Math.PI / 4, Math.PI / 4]}
                >
                    <Float speed={5} rotationIntensity={1} floatIntensity={1}>
                        {/* The Core Synergy Orb */}
                        <Sphere ref={sphereRef} args={[1, 100, 100]}>
                            <MeshDistortMaterial
                                color={baseColor}
                                speed={4}
                                distort={synergyScore * 0.6}
                                radius={1}
                                metalness={0.8}
                                roughness={0.2}
                                envMapIntensity={1}
                            />
                        </Sphere>
                        
                        {/* Orbiting Interaction Rings */}
                        <Torus rotation={[Math.PI / 2, 0, 0]} args={[1.4, 0.02, 16, 100]}>
                            <meshStandardMaterial color={baseColor} opacity={0.4} transparent />
                        </Torus>
                        <Torus rotation={[0, Math.PI / 4, 0]} args={[1.7, 0.01, 16, 100]}>
                            <meshStandardMaterial color={baseColor} opacity={0.2} transparent />
                        </Torus>
                    </Float>
                </PresentationControls>
            </Canvas>

            {/* Synergy Overlay Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-[10px] font-black text-white mix-blend-difference uppercase tracking-[0.4em] translate-y-24 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    Synergy Index
                </p>
                <h3 className="text-3xl font-black text-white mix-blend-difference translate-y-24 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    {(synergyScore * 100).toFixed(0)}%
                </h3>
            </div>
            
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-40 text-center">
                <div className={`h-1 w-full rounded-full transition-all duration-700 ${
                    severity === 'MAJOR' || severity === 'CONTRAINDICATED' ? 'bg-rose-500' : 'bg-indigo-500'
                } scale-x-${Math.round(synergyScore * 10) * 10}`} style={{ transform: `scaleX(${synergyScore})` }} />
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">{severity} POTENCY</p>
            </div>
        </div>
    )
}

export default SynergyOrb
