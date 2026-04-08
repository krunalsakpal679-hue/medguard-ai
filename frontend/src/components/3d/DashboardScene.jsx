/* eslint-disable react/no-unknown-property */
import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { 
    OrbitControls, 
    Float, 
    Sphere, 
    Torus, 
    MeshDistortMaterial,
    PointMaterial,
    Points
} from '@react-three/drei'


/**
 * Animated Molecular Lattice Unit.
 */
const FloatingMolecule = ({ position, color, speed = 1 }) => {
    const meshRef = useRef()
    
    useFrame((state) => {
        const t = state.clock.getElapsedTime() * speed
        meshRef.current.rotation.x = Math.sin(t / 4)
        meshRef.current.rotation.y = Math.cos(t / 4)
    })

    return (
        <group position={position} ref={meshRef}>
            <Sphere args={[1, 64, 64]}>
                <MeshDistortMaterial 
                    color={color} 
                    speed={2} 
                    distort={0.4} 
                    radius={1} 
                    envMapIntensity={2}
                />
            </Sphere>
            {/* Orbiting Nucleotides */}
            <Torus args={[1.5, 0.02, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
                <meshStandardMaterial color={color} opacity={0.3} transparent />
            </Torus>
            <Torus args={[1.8, 0.01, 16, 100]} rotation={[0, Math.PI / 4, 0]}>
                <meshStandardMaterial color={color} opacity={0.2} transparent />
            </Torus>
        </group>
    )
}

/**
 * Double Helix Geometric Path.
 */
const DNAHelix = ({ position }) => {
    const groupRef = useRef()
    const strandCount = 24
    
    useFrame((state) => {
        groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.5
    })

    const spheres = useMemo(() => {
        const items = []
        for (let i = 0; i < strandCount; i++) {
            const y = (i - strandCount / 2) * 0.5
            const angle = i * 0.5
            // Strand A
            items.push({ pos: [Math.sin(angle) * 1.5, y, Math.cos(angle) * 1.5], color: '#14b8a6' })
            // Strand B (180 deg offset)
            items.push({ pos: [Math.sin(angle + Math.PI) * 1.5, y, Math.cos(angle + Math.PI) * 1.5], color: '#3b82f6' })
        }
        return items
    }, [])

    return (
        <group position={position} ref={groupRef}>
            {spheres.map((s, i) => (
                <Sphere key={i} position={s.pos} args={[0.15, 16, 16]}>
                    <meshStandardMaterial color={s.color} emissive={s.color} emissiveIntensity={0.5} />
                </Sphere>
            ))}
        </group>
    )
}

/**
 * Clinical Capsule Geometry.
 */
const FloatingPill = ({ position, color }) => {
    const ref = useRef()
    useFrame((state) => {
        const t = state.clock.getElapsedTime()
        ref.current.rotation.set(t * 0.5, t * 0.2, t * 0.3)
    })

    return (
        <group position={position} ref={ref}>
            <mesh position={[0, 0.4, 0]}>
                <cylinderGeometry args={[0.3, 0.3, 0.8, 32]} />
                <meshStandardMaterial color={color} />
            </mesh>
            <mesh position={[0, -0.4, 0]}>
                <cylinderGeometry args={[0.3, 0.3, 0.8, 32]} />
                <meshStandardMaterial color="#FFFFFF" />
            </mesh>
            <Sphere position={[0, 0.8, 0]} args={[0.3, 32, 32]}>
                <meshStandardMaterial color={color} />
            </Sphere>
            <Sphere position={[0, -0.8, 0]} args={[0.3, 32, 32]}>
                <meshStandardMaterial color="#FFFFFF" />
            </Sphere>
        </group>
    )
}

/**
 * Atmospheric Particle System.
 */
const AtmosphericParticles = ({ count = 200 }) => {
    const points = useMemo(() => {
        const p = new Float32Array(count * 3)
        for (let i = 0; i < count; i++) {
            p[i * 3] = (Math.random() - 0.5) * 25
            p[i * 3 + 1] = (Math.random() - 0.5) * 25
            p[i * 3 + 2] = (Math.random() - 0.5) * 25
        }
        return p
    }, [count])

    const ref = useRef()
    useFrame((state) => {
        ref.current.rotation.y = state.clock.getElapsedTime() * 0.05
    })

    return (
        <Points ref={ref} positions={points} stride={3} frustumCulled={false}>
            <PointMaterial
                transparent
                color="#818cf8"
                size={0.08}
                sizeAttenuation={true}
                depthWrite={false}
                opacity={0.4}
            />
        </Points>
    )
}

const DashboardScene = () => {
    return (
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#F8FAFC] to-[#EEF2FF]">
            <Canvas camera={{ position: [0, 0, 15], fov: 50 }} dpr={[1, 2]}>
                <color attach="background" args={['#ffffff']} />
                <fog attach="fog" args={['#ffffff', 10, 30]} />
                
                <ambientLight intensity={0.8} />
                <pointLight position={[10, 10, 10]} intensity={1.5} color="#indigo" />
                <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />

                <AtmosphericParticles count={300} />

                <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
                    <FloatingMolecule position={[-5, 2, -2]} color="#14b8a6" speed={1.2} />
                    <FloatingMolecule position={[5, -3, 0]} color="#6366f1" speed={0.8} />
                    <FloatingMolecule position={[2, 4, -5]} color="#f59e0b" speed={1.5} />
                </Float>

                <DNAHelix position={[-8, -4, -4]} />
                <DNAHelix position={[8, 4, -8]} />

                <Float speed={4} rotationIntensity={2} floatIntensity={2}>
                    <FloatingPill position={[-6, 0, 2]} color="#ef4444" />
                    <FloatingPill position={[7, 1, 3]} color="#22c55e" />
                </Float>

                <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
            </Canvas>
        </div>
    )
}

export default DashboardScene
