import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import ThemeToggle from '../ThemeToggle'
import { ThemeProvider } from '../../../context/ThemeContext'

describe('ThemeToggle', () => {
  test('renders and toggles without error', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    )

    const btn = screen.getByRole('button', { name: /toggle theme/i })
    expect(btn).toBeInTheDocument()
    fireEvent.click(btn)
    // no explicit assertions about DOM change — ensure no errors
    expect(btn).toBeInTheDocument()
  })
})
