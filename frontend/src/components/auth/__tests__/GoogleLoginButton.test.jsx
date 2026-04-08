import { render, screen, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import GoogleLoginButton from '../GoogleLoginButton'

// Mock the Auth Store
vi.mock('../../store/authStore', () => ({
  useAuthStore: vi.fn(() => ({
    loginWithGoogle: vi.fn(),
    error: null,
    clearError: vi.fn()
  }))
}))

describe('GoogleLoginButton Core', () => {
    beforeEach(() => {
        // Mock window.google for GSI script
        window.google = {
            accounts: {
                id: {
                    initialize: vi.fn(),
                    renderButton: vi.fn(),
                }
            }
        }
    })

    it('renders the google button container', () => {
        const { container } = render(<GoogleLoginButton />)
        // Check if the script was appended and container exists
        expect(container.querySelector('div')).toBeInTheDocument()
    })
})
