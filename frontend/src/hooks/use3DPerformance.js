import { useState, useEffect, useMemo } from 'react'
import * as THREE from 'three'

/**
 * Advanced GPU Capability Detection for Clinical Visualizations.
 */
export const use3DPerformance = () => {
    const [config, setConfig] = useState({
        highQuality: true,
        particleCount: 500,
        enablePostProcessing: true,
        tier: 3
    })

    useEffect(() => {
        const canvas = document.createElement('canvas')
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
        
        if (!gl) {
            setConfig({ highQuality: false, particleCount: 0, enablePostProcessing: false, tier: 0 })
            return
        }

        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
        const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : ''
        
        // Basic heuristic for GPU Tiering
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
        const isIntegrated = /Intel|Iris|Graphics/i.test(renderer)
        const isDiscrete = /NVIDIA|AMD|Radeon|GeForce/i.test(renderer)

        let tier = 2
        if (isDiscrete && !isMobile) tier = 3
        if (isMobile || isIntegrated) tier = 1
        
        setConfig({
            highQuality: tier >= 2,
            particleCount: tier * 150,
            enablePostProcessing: tier === 3,
            tier
        })

        // Cleanup
        return () => {
            canvas.remove()
        }
    }, [])

    return config
}
