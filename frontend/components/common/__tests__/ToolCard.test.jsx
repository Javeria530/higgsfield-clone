import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import ToolCard from '../ToolCard'

const DummyIcon = () => <span>Icon</span>

describe('ToolCard', () => {
  test('displays tool info and triggers action', () => {
    const action = vi.fn()
    const tool = {
      icon: DummyIcon,
      name: 'Test Tool',
      description: 'Does testing',
      color: '#123456',
      action,
    }

    const colors = { cardBg: '#fff', border: '#eee', text1: '#000', text2: '#666' }

    render(<ToolCard tool={tool} colors={colors} />)

    expect(screen.getByText(/Test Tool/i)).toBeInTheDocument()
    expect(screen.getByText(/Does testing/i)).toBeInTheDocument()

    // click container
    fireEvent.click(screen.getByText(/Test Tool/i))
    expect(action).toHaveBeenCalled()
  })
})
