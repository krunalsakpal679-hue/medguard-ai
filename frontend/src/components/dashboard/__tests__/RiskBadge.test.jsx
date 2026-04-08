import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import RiskBadge from '../RiskBadge'

describe('RiskBadge Visual Integrity', () => {
    it('renders the SAFE state for NONE severity', () => {
        render(<RiskBadge severity="NONE" />)
        // Check for SAFE text instead of class matching which is tricky due to nested DOM
        expect(screen.getByText(/SAFE/i)).toBeInTheDocument()
    })

    it('renders the CRITICAL alert for MAJOR severity', () => {
        render(<RiskBadge severity="MAJOR" />)
        expect(screen.getAllByText(/MAJOR/i)[0]).toBeInTheDocument()
    })

    it('renders the LETHAL alert for CONTRAINDICATED severity', () => {
        render(<RiskBadge severity="CONTRAINDICATED" />)
        expect(screen.getAllByText(/FATAL RISK/i)[0]).toBeInTheDocument()
    })

    it('displays the correct subtitle for clinical context', () => {
        render(<RiskBadge severity="MODERATE" />)
        expect(screen.getByText(/Clinical Protocol:/i)).toBeInTheDocument()
    })
})
