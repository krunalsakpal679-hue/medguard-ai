import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import RiskBadge from '../RiskBadge'

describe('RiskBadge Visual Integrity', () => {
    it('renders the SAFE state for NONE severity', () => {
        render(<RiskBadge severity="NONE" />)
        const badge = screen.getByText(/SAFE/i)
        expect(badge).toBeInTheDocument()
        expect(badge).toHaveClass('text-emerald-600')
    })

    it('renders the CRITICAL alert for MAJOR severity', () => {
        render(<RiskBadge severity="MAJOR" />)
        const badge = screen.getByText(/MAJOR/i)
        expect(badge).toBeInTheDocument()
        expect(badge).toHaveClass('text-rose-600')
    })

    it('renders the LETHAL alert for CONTRAINDICATED severity', () => {
        render(<RiskBadge severity="CONTRAINDICATED" />)
        const badge = screen.getByText(/CONTRAINDICATED/i)
        expect(badge).toBeInTheDocument()
        expect(badge).toHaveClass('bg-slate-900')
    })

    it('displays the correct subtitle for clinical context', () => {
        render(<RiskBadge severity="MODERATE" />)
        expect(screen.getByText(/Risk Index/i)).toBeInTheDocument()
    })
})
