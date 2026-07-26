export const welcomeTemplate = ({ name }) => `
<!DOCTYPE html>
<html>
<body style="font-family:Arial;background:#f9f9f9;padding:20px;">
  <div style="background:#fff;padding:24px;border-radius:8px;max-width:500px;margin:auto;">
    <h2>Welcome, ${name} 👋</h2>
    <p>Your account has been successfully created.</p>
    <p>We’re excited to have you onboard.</p>
    <p style="margin-top:24px;color:#777;font-size:12px;">
      © ${new Date().getFullYear()} Your App
    </p>
  </div>
</body>
</html>
`;
