const otpTemplate = ({ otp, expiresIn = 10 }) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background:#f4f4f4; padding:20px; }
    .card { background:#fff; padding:24px; border-radius:8px; max-width:480px; margin:auto; }
    .otp { font-size:32px; font-weight:bold; letter-spacing:4px; margin:16px 0; }
    .footer { color:#777; font-size:12px; margin-top:24px; }
  </style>
</head>
<body>
  <div class="card">
    <h2>Verify your email</h2>
    <p>Use the OTP below to continue:</p>
    <div class="otp">${otp}</div>
    <p>This OTP is valid for <strong>${expiresIn} minutes</strong>.</p>
    <div class="footer">
      If you didn’t request this, ignore this email.
    </div>
  </div>
</body>
</html>
`;
export default otpTemplate;
