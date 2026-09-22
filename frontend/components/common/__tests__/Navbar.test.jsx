import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import Navbar from '../Navbar'
import { ThemeProvider } from '../../../context/ThemeContext'

describe('Navbar', () => {
  test('renders and navigates on button clicks', () => {
    const onNavigate = vi.fn()
    render(
      <ThemeProvider>
        <Navbar onNavigate={onNavigate} />
      </ThemeProvider>
    )

    // Check that brand text is present
    expect(screen.getByText(/SmartAds/i)).toBeInTheDocument()

    // Click Sign In
    const signIn = screen.getByText(/Sign In/i)
    fireEvent.click(signIn)
    expect(onNavigate).toHaveBeenCalledWith('login')

    // Click Get Started
    const getStarted = screen.getByText(/Get Started/i)
    fireEvent.click(getStarted)
    expect(onNavigate).toHaveBeenCalledWith('signup')
  })
})
