import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AuthProvider } from '../../context/AuthContext'
import { ThemeProvider } from '../../context/ThemeContext'
import LoginPage from '../LoginPage'

describe('LoginPage', () => {
  beforeEach(() => {
    vi.spyOn(global, 'fetch').mockImplementation(async (_url, options = {}) => {
      const body = JSON.parse(options.body || '{}')
      const isValid = body.email === 'admin@smartads.com' && body.password === 'Admin@123'

      return new Response(JSON.stringify(isValid
        ? { success: true, user: { id: 'admin-1', email: body.email, fullName: 'Admin User', role: 'Admin' } }
        : { success: false, error: 'Invalid credentials' }), {
        status: isValid ? 200 : 401,
        headers: { 'Content-Type': 'application/json' },
      })
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('successful login navigates to dashboard', async () => {
    const onNavigate = vi.fn()

    render(
      <ThemeProvider>
        <AuthProvider>
          <LoginPage onNavigate={onNavigate} />
        </AuthProvider>
      </ThemeProvider>
    )

    const emailInput = screen.getByPlaceholderText(/name@company.com/i)
    const passwordInput = screen.getByPlaceholderText(/••••••••/i)
    const signInBtns = screen.getAllByRole('button', { name: /sign in/i })
    const signInBtn = signInBtns.find(b => b.closest('form')) || signInBtns[0]

    fireEvent.change(emailInput, { target: { value: 'admin@smartads.com' } })
    fireEvent.change(passwordInput, { target: { value: 'Admin@123' } })
    fireEvent.click(signInBtn)

    await waitFor(() => expect(onNavigate).toHaveBeenCalled())
    expect(onNavigate.mock.calls[0][0]).toBe('dashboard')
  })

  test('shows error on invalid credentials', async () => {
    const onNavigate = vi.fn()
    render(
      <ThemeProvider>
        <AuthProvider>
          <LoginPage onNavigate={onNavigate} />
        </AuthProvider>
      </ThemeProvider>
    )

    const emailInput = screen.getByPlaceholderText(/name@company.com/i)
    const passwordInput = screen.getByPlaceholderText(/••••••••/i)
    const signInBtns = screen.getAllByRole('button', { name: /sign in/i })
    const signInBtn = signInBtns.find(b => b.closest('form')) || signInBtns[0]

    fireEvent.change(emailInput, { target: { value: 'noone@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } })
    fireEvent.click(signInBtn)

    const err = await screen.findByText(/invalid credentials/i)
    expect(err).toBeInTheDocument()
    expect(onNavigate).not.toHaveBeenCalled()
  })
})
