import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const Molecules = ({ count = 50 }) => {
    const meshRef = useRef()
    
    // Create random positions and rotations on mount
    const particles = useMemo(() => {
        const temp = []
        for (let i = 0; i < count; i++) {
            const t = Math.random() * 100
            const factor = 20 + Math.random() * 100
            const speed = 0.01 + Math.random() / 200
            const xFactor = -50 + Math.random() * 100
            const yFactor = -50 + Math.random() * 100
            const zFactor = -50 + Math.random() * 100
            temp.push({ t, factor, speed, xFactor, yFactor, zFactor })
        }
        return temp
    }, [count])

    const dummy = new THREE.Object3D()

    useFrame((state) => {
        particles.forEach((particle, i) => {
            let { t, factor, speed, xFactor, yFactor, zFactor } = particle
            t = particle.t += speed / 2
            const a = Math.cos(t) + Math.sin(t * 1) / 10
            const b = Math.sin(t) + Math.cos(t * 2) / 10
            const s = Math.cos(t)
            
            dummy.position.set(
                (particle.xFactor + Math.cos(t / 10) * factor) / 10,
                (particle.yFactor + Math.sin(t / 10) * factor) / 10,
                (particle.zFactor + Math.cos(t / 10) * factor) / 10
            )
            dummy.rotation.set(s * 5, s * 5, s * 5)
            dummy.scale.setScalar(s)
            dummy.updateMatrix()
            meshRef.current.setMatrixAt(i, dummy.matrix)
        })
        meshRef.current.instanceMatrix.needsUpdate = true
    })

    return (
        <instancedMesh ref={meshRef} args={[null, null, count]}>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial 
                color="#6366f1" 
                transparent 
                opacity={0.08} 
                depthWrite={false}
            />
        </instancedMesh>
    )
}

const MoleculeBackground = () => {
    // Basic Visibility Check to conserve GPU resources
    const [isVisible, setIsVisible] = React.useState(true)

    React.useEffect(() => {
        const handleVisibility = () => setIsVisible(document.visibilityState === 'visible')
        document.addEventListener('visibilitychange', handleVisibility)
        return () => document.removeEventListener('visibilitychange', handleVisibility)
    }, [])

    if (window.innerWidth < 768) return null

    return (
        <div className="fixed inset-0 z-[-1] pointer-events-none">
            {isVisible && (
                <Canvas camera={{ position: [0, 0, 20], fov: 50 }}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={1} />
                    <Molecules count={80} />
                </Canvas>
            )}
        </div>
    )
}

/**
 * High-Order Component to wrap clinical pages with a molecular atmosphere.
 */
export const withMoleculeBackground = (Component) => {
    return (props) => (
        <>
            <MoleculeBackground />
            <Component {...props} />
        </>
    )
}

export default MoleculeBackground
