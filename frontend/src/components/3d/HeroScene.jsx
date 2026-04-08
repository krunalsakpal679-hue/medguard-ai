import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { 
    Text, 
    Float, 
    Sphere, 
    OrbitControls, 
    PerspectiveCamera,
    Stars,
    MeshDistortMaterial
} from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'
import { use3DPerformance } from '../../hooks/use3DPerformance'

/**
 * Animated DNA Strand for the Hero Section.
 */
const MainDNA = ({ count = 28 }) => {
    const ref = useRef()
    
    useFrame((state) => {
        ref.current.rotation.y = state.clock.getElapsedTime() * 0.3
    })

    const strand = useMemo(() => {
        const points = []
        for (let i = 0; i < count; i++) {
            const y = (i - count / 2) * 0.4
            const angle = i * 0.4
            // Two strands
            points.push({ pos: [Math.sin(angle) * 1.5, y, Math.cos(angle) * 1.5], color: '#6366f1' })
            points.push({ pos: [Math.sin(angle + Math.PI) * 1.5, y, Math.cos(angle + Math.PI) * 1.5], color: '#14b8a6' })
        }
        return points
    }, [count])

    return (
        <group ref={ref}>
            {strand.map((p, i) => (
                <Sphere key={i} position={p.pos} args={[0.08, 16, 16]}>
                    <meshStandardMaterial color={p.color} emissive={p.color} emissiveIntensity={2} />
                </Sphere>
            ))}
        </group>
    )
}

/**
 * Floating Medical Crosses as Particles.
 */
const MedicalParticles = ({ count = 50 }) => {
    const group = useRef()
    const { particleCount, tier } = use3DPerformance()
    
    useFrame((state) => {
        const t = state.clock.getElapsedTime()
        group.current.children.forEach((child, i) => {
            const orbit = i * 1.2
            child.position.y += Math.sin(t + orbit) * 0.01
            child.rotation.z += 0.01
        })
    })

    const spread = useMemo(() => {
        return Array.from({ length: tier * 20 }, () => ({
            pos: [(Math.random() - 0.5) * 15, (Math.random() - 0.5) * 15, (Math.random() - 0.5) * 15],
            scale: 0.1 + Math.random() * 0.2
        }))
    }, [tier])

    return (
        <group ref={group}>
            {spread.map((p, i) => (
                <group key={i} position={p.pos} scale={p.scale}>
                    <mesh rotation={[0, 0, 0]}>
                        <boxGeometry args={[1, 0.3, 0.3]} />
                        <meshStandardMaterial color="#ffffff" opacity={0.3} transparent />
                    </mesh>
                    <mesh rotation={[0, 0, Math.PI / 2]}>
                        <boxGeometry args={[1, 0.3, 0.3]} />
                        <meshStandardMaterial color="#ffffff" opacity={0.3} transparent />
                    </mesh>
                </group>
            ))}
        </group>
    )
}

const HeroScene = () => {
    const { enablePostProcessing, highQuality } = use3DPerformance()

    return (
        <div className="absolute inset-0 cursor-grab active:cursor-grabbing">
            <Canvas dpr={[1, 2]}>
                <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={50} />
                <color attach="background" args={['#0f172a']} />
                <fogExp2 attach="fog" args={['#0f172a', 0.05]} />
                
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={2} color="#6366f1" />
                <pointLight position={[-10, -10, -10]} intensity={1} color="#14b8a6" />

                <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
                    <MainDNA />
                    
                    <Text
                        position={[0, 0.5, 3]}
                        fontSize={0.8}
                        color="white"
                        font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
                        anchorX="center"
                        anchorY="middle"
                        outlineWidth={0.02}
                        outlineColor="#6366f1"
                    >
                        MEDGUARD AI
                    </Text>
                    <Text
                        position={[0, -0.4, 3]}
                        fontSize={0.15}
                        color="#94a3b8"
                        font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
                        anchorX="center"
                        anchorY="middle"
                    >
                        The Future of Clinical Molecule Interaction
                    </Text>
                </Float>

                <MedicalParticles />
                
                {highQuality && <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />}

                {enablePostProcessing && (
                    <EffectComposer multisampling={0}>
                        <Bloom intensity={1.5} luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} />
                    </EffectComposer>
                )}

                <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.2} />
            </Canvas>
        </div>
    )
}

export default HeroScene
