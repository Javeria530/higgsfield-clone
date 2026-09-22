import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AuthProvider } from '../../context/AuthContext'
import { ThemeProvider } from '../../context/ThemeContext'
// Mock Google OAuth hook since components expect a provider in the app
vi.mock('@react-oauth/google', () => ({ useGoogleLogin: () => null }))
import SignupPage from '../SignupPage'

describe('SignupPage', () => {
  test('signup posts to API and navigates to login', async () => {
    const onNavigate = vi.fn()

    // Mock fetch for the signup POST
    const fetchMock = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true }) }))
    vi.stubGlobal('fetch', fetchMock)

    const { container } = render(
      <ThemeProvider>
        <AuthProvider>
          <SignupPage onNavigate={onNavigate} />
        </AuthProvider>
      </ThemeProvider>
    )

    fireEvent.change(screen.getByPlaceholderText(/John Doe/i), { target: { value: 'Test User' } })
    fireEvent.change(screen.getByPlaceholderText(/john@example.com/i), { target: { value: 'testuser@example.com' } })
    // First password input has a placeholder; confirm password has no placeholder so select by DOM
    const pwdInput = screen.getByPlaceholderText(/••••••••/i)
    fireEvent.change(pwdInput, { target: { value: 'Password1!' } })
    const passwordFields = container.querySelectorAll('input[type="password"]')
    const confirmInput = passwordFields[1]
    fireEvent.change(confirmInput, { target: { value: 'Password1!' } })

    // Click the create account button (unique text)
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => expect(fetchMock).toHaveBeenCalled())
    expect(onNavigate).toHaveBeenCalledWith('login')

    vi.unstubAllGlobals()
  })
})
