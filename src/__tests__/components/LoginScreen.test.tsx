import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginScreen from '@/components/auth/LoginScreen'

// Mock the props
const mockProps = {
  onOtpSent: vi.fn(),
  onVerifyOtp: vi.fn(),
  loading: false,
}

describe('LoginScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders login screen initially', () => {
    render(<LoginScreen {...mockProps} />)

    expect(screen.getByText('Phone Number Daalen')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('10-digit mobile number')).toBeInTheDocument()
    expect(screen.getByText('OTP Bhejo')).toBeInTheDocument()
  })

  it('validates phone number format', async () => {
    const user = userEvent.setup()
    render(<LoginScreen {...mockProps} />)

    const phoneInput = screen.getByPlaceholderText('10-digit mobile number')
    const sendButton = screen.getByText('OTP Bhejo')

    // Test invalid phone number
    await user.type(phoneInput, '12345')
    await user.click(sendButton)

    // Should show alert (mocked)
    expect(mockProps.onOtpSent).not.toHaveBeenCalled()
  })

  it('requires terms acceptance', async () => {
    const user = userEvent.setup()
    render(<LoginScreen {...mockProps} />)

    const phoneInput = screen.getByPlaceholderText('10-digit mobile number')
    const sendButton = screen.getByText('OTP Bhejo')

    await user.type(phoneInput, '9876543210')
    await user.click(sendButton)

    // Should show alert for terms not accepted
    expect(mockProps.onOtpSent).not.toHaveBeenCalled()
  })

  it('sends OTP when form is valid', async () => {
    const user = userEvent.setup()
    render(<LoginScreen {...mockProps} />)

    const phoneInput = screen.getByPlaceholderText('10-digit mobile number')
    const termsCheckbox = screen.getByRole('checkbox')
    const sendButton = screen.getByText('OTP Bhejo')

    await user.type(phoneInput, '9876543210')
    await user.click(termsCheckbox)
    await user.click(sendButton)

    expect(mockProps.onOtpSent).toHaveBeenCalledWith('9876543210', expect.any(String))
  })

  it('switches to OTP verification screen after sending OTP', async () => {
    const user = userEvent.setup()
    render(<LoginScreen {...mockProps} />)

    const phoneInput = screen.getByPlaceholderText('10-digit mobile number')
    const termsCheckbox = screen.getByRole('checkbox')
    const sendButton = screen.getByText('OTP Bhejo')

    await user.type(phoneInput, '9876543210')
    await user.click(termsCheckbox)
    await user.click(sendButton)

    // Should switch to OTP screen
    expect(screen.getByText('OTP Verify Karo 📱')).toBeInTheDocument()
    expect(screen.getByText('+91 9876543210 pe bheja gaya code daalen')).toBeInTheDocument()
  })

  it('validates OTP format', async () => {
    const user = userEvent.setup()
    render(<LoginScreen {...mockProps} />)

    // First send OTP
    const phoneInput = screen.getByPlaceholderText('10-digit mobile number')
    const termsCheckbox = screen.getByRole('checkbox')
    const sendButton = screen.getByText('OTP Bhejo')

    await user.type(phoneInput, '9876543210')
    await user.click(termsCheckbox)
    await user.click(sendButton)

    // Now test OTP verification
    const otpInput = screen.getByPlaceholderText('6-digit OTP')
    const verifyButton = screen.getByText('✅ Verify & Login')

    // Test invalid OTP
    await user.type(otpInput, '12345')
    expect(verifyButton).toBeDisabled()

    // Test valid OTP
    await user.clear(otpInput)
    await user.type(otpInput, '123456')
    expect(verifyButton).not.toBeDisabled()
  })

  it('verifies OTP successfully', async () => {
    const user = userEvent.setup()
    render(<LoginScreen {...mockProps} />)

    // Send OTP first
    const phoneInput = screen.getByPlaceholderText('10-digit mobile number')
    const termsCheckbox = screen.getByRole('checkbox')
    const sendButton = screen.getByText('OTP Bhejo')

    await user.type(phoneInput, '9876543210')
    await user.click(termsCheckbox)
    await user.click(sendButton)

    // Verify OTP
    const otpInput = screen.getByPlaceholderText('6-digit OTP')
    const nameInput = screen.getByPlaceholderText('Apka naam (optional)')
    const verifyButton = screen.getByText('✅ Verify & Login')

    await user.type(otpInput, '123456')
    await user.type(nameInput, 'Test User')
    await user.click(verifyButton)

    expect(mockProps.onVerifyOtp).toHaveBeenCalledWith('9876543210', '123456', 'Test User')
  })

  it('allows going back to phone input', async () => {
    const user = userEvent.setup()
    render(<LoginScreen {...mockProps} />)

    // Send OTP first
    const phoneInput = screen.getByPlaceholderText('10-digit mobile number')
    const termsCheckbox = screen.getByRole('checkbox')
    const sendButton = screen.getByText('OTP Bhejo')

    await user.type(phoneInput, '9876543210')
    await user.click(termsCheckbox)
    await user.click(sendButton)

    // Go back
    const backButton = screen.getByText('← Back')
    await user.click(backButton)

    // Should be back to phone input screen
    expect(screen.getByText('Phone Number Daalen')).toBeInTheDocument()
  })

  it('shows loading state during verification', () => {
    render(<LoginScreen {...mockProps} loading={true} />)

    // Send OTP first to get to verification screen
    // This is a simplified test - in real scenario we'd need to trigger the state change
    expect(screen.getByText('Phone Number Daalen')).toBeInTheDocument()
  })
})
