import '@testing-library/jest-dom'
import { beforeAll, afterEach, afterAll } from 'vitest'
import { setupServer } from 'msw/node'
import { handlers } from './mocks/handlers'

// Initialize the Mock Service Worker server with clinical handlers
export const server = setupServer(...handlers)

// Establish API mocking before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

// Reset any runtime handlers tests may use
afterEach(() => server.resetHandlers())

// Clean up after the laboratory tests are complete
afterAll(() => server.close())

// Mock window.matchMedia for responsive UI tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
})
