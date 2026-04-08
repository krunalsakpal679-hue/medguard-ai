import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import GoogleLoginButton from '../GoogleLoginButton'

// Mocking external Google script
vi.mock('@react-oauth/google', () => ({
  GoogleLogin: ({ onSuccess, onError }) => (
    <button onClick={() => onSuccess({ credential: 'fake_jwt' })}>
      Google Identity Sign In
    </button>
  )
}))

describe('GoogleLoginButton Core', () => {
    it('renders the clinical identity entry point', () => {
        render(<GoogleLoginButton />)
        expect(screen.getByText(/Google Identity Sign In/i)).toBeInTheDocument()
    })

    it('displays the corporate security subtitle', () => {
        render(<GoogleLoginButton />)
        expect(screen.getByText(/Secure Clinical Access/i)).toBeInTheDocument()
    })
})
