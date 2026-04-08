import React, { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { 
    OrbitControls, 
    Text, 
    Sphere, 
    Line, 
    Float,
    PerspectiveCamera,
    Center
} from '@react-three/drei'
import * as THREE from 'three'

/**
 * Node representing a clinical molecule in the 3D network.
 */
const DrugNode = ({ name, position, riskColor, isCenter }) => {
    const mesh = useRef()
    useFrame((state) => {
        const t = state.clock.getElapsedTime()
        mesh.current.scale.setScalar(1 + Math.sin(t * 2 + Math.PI * Math.random()) * 0.05)
    })

    return (
        <group position={position}>
            <Sphere ref={mesh} args={[isCenter ? 0.8 : 0.6, 32, 32]}>
                <meshStandardMaterial 
                    color={riskColor} 
                    emissive={riskColor} 
                    emissiveIntensity={0.5} 
                    roughness={0.2}
                />
            </Sphere>
            <Text
                position={[0, isCenter ? 1.2 : 0.9, 0]}
                fontSize={0.2}
                color="#0f172a"
                font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
                anchorX="center"
                anchorY="middle"
            >
                {name.toUpperCase()}
            </Text>
        </group>
    )
}

/**
 * Edge representing an AI-predicted interaction between molecules.
 */
const InteractionEdge = ({ start, end, severity }) => {
    const colors = {
        NONE: '#cbd5e1',
        MINOR: '#fde047',
        MODERATE: '#fb923c',
        MAJOR: '#f43f5e',
        CONTRAINDICATED: '#991b1b'
    }

    const color = colors[severity] || colors.NONE
    const points = useMemo(() => [new THREE.Vector3(...start), new THREE.Vector3(...end)], [start, end])

    return (
        <Line
            points={points}
            color={color}
            lineWidth={severity === 'CONTRAINDICATED' ? 4 : 2}
            transparent
            opacity={0.8}
        />
    )
}

const InteractionVisualization = ({ drugs = [], interactionResults = [] }) => {
    // 1. Calculate Spatial Layout (Circular/Radial for UI clarity)
    const nodes = useMemo(() => {
        if (drugs.length === 0) return []
        return drugs.map((drug, i) => {
            if (i === 0) return { ...drug, pos: [0, 0, 0], isCenter: true }
            const angle = (i / (drugs.length - 1)) * Math.PI * 2
            const radius = 4
            return {
                ...drug,
                pos: [Math.cos(angle) * radius, Math.sin(angle) * radius, 0],
                isCenter: false
            }
        })
    }, [drugs])

    // 2. Identify Interaction Links
    const edges = useMemo(() => {
        return interactionResults.map(res => {
            const nodeA = nodes.find(n => n.name === res.drug_a_name)
            const nodeB = nodes.find(n => n.name === res.drug_b_name)
            if (!nodeA || !nodeB) return null
            return {
                start: nodeA.pos,
                end: nodeB.pos,
                severity: res.severity
            }
        }).filter(Boolean)
    }, [nodes, interactionResults])

    return (
        <div className="w-full h-[600px] bg-white rounded-[40px] border border-slate-100 shadow-sm relative shadow-inner">
            <Canvas dpr={[1, 2]}>
                <PerspectiveCamera makeDefault position={[0, 0, 10]} />
                <ambientLight intensity={0.7} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                
                <Center>
                    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
                        <group>
                            {edges.map((edge, i) => (
                                <InteractionEdge key={i} {...edge} />
                            ))}
                            {nodes.map((node, i) => (
                                <DrugNode 
                                    key={i} 
                                    name={node.name} 
                                    position={node.pos} 
                                    isCenter={node.isCenter}
                                    riskColor={node.isCenter ? '#6366f1' : '#94a3b8'}
                                />
                            ))}
                        </group>
                    </Float>
                </Center>

                <OrbitControls enableZoom={true} enablePan={true} />
            </Canvas>

            {/* Legend Overlay */}
            <div className="absolute bottom-10 right-10 flex flex-col gap-2 p-6 bg-white/80 backdrop-blur-md rounded-3xl border border-slate-100 shadow-xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Internal Interaction Map</p>
                {['CONTRAINDICATED', 'MAJOR', 'MODERATE', 'MINOR', 'NONE'].map(lvl => (
                    <div key={lvl} className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                            lvl === 'CONTRAINDICATED' ? 'bg-red-800' :
                            lvl === 'MAJOR' ? 'bg-rose-500' :
                            lvl === 'MODERATE' ? 'bg-orange-400' :
                            lvl === 'MINOR' ? 'bg-yellow-400' : 'bg-slate-300'
                        }`} />
                        <span className="text-[10px] font-bold text-slate-700 uppercase tracking-tighter">{lvl}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default InteractionVisualization
