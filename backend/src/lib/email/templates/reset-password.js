export const resetPasswordTemplate = ({ resetLink }) => `
<!DOCTYPE html>
<html>
<body style="font-family:Arial;background:#f4f4f4;padding:20px;">
  <div style="background:#fff;padding:24px;border-radius:8px;max-width:500px;margin:auto;">
    <h2>Password Reset</h2>
    <p>Click the button below to reset your password:</p>

    <a href="${resetLink}" 
       style="display:inline-block;margin-top:16px;padding:12px 20px;
              background:#4f46e5;color:#fff;text-decoration:none;border-radius:6px;">
      Reset Password
    </a>

    <p style="margin-top:24px;color:#777;font-size:12px;">
      If you didn’t request this, ignore this email.
    </p>
  </div>
</body>
</html>
`;
