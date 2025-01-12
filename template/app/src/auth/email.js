export const getVerificationEmailContent = ({ verificationLink }) => ({
  subject: 'Verify your MGMT.golf email',
  html: `
    <p>Welcome to MGMT.golf!</p>
    <p>Click the link below to verify your email address:</p>
    <a href="${verificationLink}">${verificationLink}</a>
    <p>If you didn't create this account, you can safely ignore this email.</p>
  `,
  text: `
    Welcome to MGMT.golf!
    
    Click this link to verify your email address: ${verificationLink}
    
    If you didn't create this account, you can safely ignore this email.
  `
})

export const getPasswordResetEmailContent = ({ passwordResetLink }) => ({
  subject: 'Reset your MGMT.golf password',
  html: `
    <p>Click the link below to reset your password:</p>
    <a href="${passwordResetLink}">${passwordResetLink}</a>
    <p>If you didn't request a password reset, you can safely ignore this email.</p>
  `,
  text: `
    Click this link to reset your password: ${passwordResetLink}
    
    If you didn't request a password reset, you can safely ignore this email.
  `
})