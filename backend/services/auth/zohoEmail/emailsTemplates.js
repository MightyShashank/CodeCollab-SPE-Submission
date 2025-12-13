export const VERIFICATION_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Verify Your Email</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f2f2f2;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f2f2f2;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; margin-top: 20px;">
            <tr>
              <td style="background: linear-gradient(to right, #6d28d9, #4f46e5); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0;">CodeCollab</h1>
                <p style="color: #ddd; margin: 5px 0 0;">Collaborative Coding Platform</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 30px; color: #333333;">
                <h2 style="margin-top: 0;">Verify your email address</h2>
                <p>
                  Thanks for signing up for <strong>codeCollab</strong>! To complete your registration and start collaborating on amazing projects, please verify your email address using the code below.
                </p>

                <div style="margin: 30px 0; text-align: center;">
                  <p style="margin: 0; color: #6b7280;">VERIFICATION CODE</p>
                  <p style="font-size: 36px; letter-spacing: 10px; color: #4f46e5; margin: 10px 0;">{verificationCode}</p>
                  <p style="color: #9ca3af; font-size: 14px;">This code expires in 15 minutes</p>
                </div>

                <p>
                  Enter this code in the verification screen to activate your account and join the codeCollab community.
                </p>

                <div style="margin-top: 30px; padding: 15px; background-color: #fcd34d; border-radius: 6px; color: #92400e;">
                  <strong>Security Notice:</strong> If you didn't create an account with CodeCollab, please ignore this email. Never share this verification code with anyone.
                </div>
              </td>
            </tr>
            <tr>
              <td style="background-color: #1f2937; color: #d1d5db; text-align: center; padding: 20px; font-size: 12px;">
                This email was sent to: <a href="mailto:{email}" style="color: #93c5fd;">{email}</a><br /><br />
                Need help? Contact our support team<br /><br />
                <a href="codecollab.co.in" style="color: #60a5fa; text-decoration: none;">Visit CodeCollab</a> |
                <a href="#" style="color: #60a5fa; text-decoration: none;">Support</a> |
                <a href="#" style="color: #60a5fa; text-decoration: none;">Privacy Policy</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Automated Message Notice -->
    <p style="text-align: center; font-size: 12px; color: #6b7280; margin: 20px 0;">
      This is an automated message, please do not reply to this email.
    </p>
  </body>
</html>
`;

export const WELCOME_EMAIL = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to codeCollab</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f2f2f2; font-family: Arial, sans-serif; color: #333333;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f2f2f2;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="margin: 20px auto; background-color: #ffffff; border-radius: 10px; overflow: hidden;">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(to right, #6d28d9, #4f46e5); text-align: center; padding: 40px 20px;">
              <img src="https://em-content.zobj.net/source/microsoft-teams/363/party-popper_1f389.png" alt="🎉" width="48" height="48">
              <h1 style="margin: 10px 0 5px; color: white;">codeCollab</h1>
              <p style="margin: 0; color: #e5e7eb;">Master DSA & Competitive Programming Together</p>
            </td>
          </tr>

          <!-- Welcome Text -->
          <tr>
            <td style="padding: 20px; text-align: center;">
              <h2 style="color: #111827;">Welcome aboard, <strong>{username}</strong>!</h2>
              <p style="color: #4b5563;">We're thrilled to have you join the codeCollab community. You're now part of a platform where developers collaborate in real-time to solve Data Structures & Algorithms problems and tackle competitive programming challenges together.</p>
            </td>
          </tr>

          <!-- Features -->
          <tr>
            <td style="padding: 0 30px;">
              <h3 style="color: #111827;">What you can do with codeCollab</h3>

              <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin-top: 10px;">
                <strong>🎥 Live Audio/Video Collaboration</strong>
                <p style="margin: 5px 0; color: #4b5563;">Solve coding problems together with real-time audio and video chat, share your screen, and discuss solutions face-to-face.</p>
              </div>

              <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin-top: 10px;">
                <strong>💻 Interactive Code Editor</strong>
                <p style="margin: 5px 0; color: #4b5563;">Code together in real-time with syntax highlighting, auto-completion, and instant execution for multiple programming languages.</p>
              </div>

              <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin-top: 10px;">
                <strong>🧠 DSA Problem Library</strong>
                <p style="margin: 5px 0; color: #4b5563;">Access thousands of curated Data Structures & Algorithms problems from easy to advanced levels, organized by topics and difficulty.</p>
              </div>

              <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin-top: 10px;">
                <strong>🏆 Competitive Programming</strong>
                <p style="margin: 5px 0; color: #4b5563;">Practice contest problems, participate in mock competitions, and improve your CP skills with detailed editorial solutions.</p>
              </div>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="text-align: center; padding: 30px;">
              <p style="margin-bottom: 30px;">Ready to start solving problems together?</p>
              <a href="https://codecollab.co.in/start" style="background-color: #6366f1; color: white; padding: 12px 20px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-right: 10px;">Start Coding</a>
              <a href="https://codecollab.co.in/problems" style="background-color: #4b5563; color: white; padding: 12px 20px; border-radius: 6px; text-decoration: none; font-weight: bold;">Browse Problems</a>
            </td>
          </tr>

          <!-- Quick Tips -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <div style="background-color: #fef9c3; border-radius: 8px; padding: 20px; color: #92400e;">
                <h4 style="margin-top: 0;">💡 Quick Tips to Get Started</h4>
                <ul style="color: #92400e; padding-left: 20px; margin: 10px 0;">
                  <li>Complete your coding profile and showcase your preferred languages</li>
                  <li>Join study rooms for DSA topics like trees, graphs, DP</li>
                  <li>Start easy and work up to advanced challenges</li>
                  <li>Use voice/video chat to explain your approach</li>
                  <li>Participate in weekly mocks and daily challenges</li>
                </ul>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="text-align: center; padding: 20px; font-size: 12px; color: #6b7280;">
              Welcome to CodeCollab, <strong>{email}</strong><br><br>
              Follow us for updates, tips, and community highlights.<br><br>
              <a href="https://codecollab.co.in" style="color: #4f46e5; text-decoration: none;">Visit CodeCollab</a> |
              <a href="https://codecollab.co.in/docs" style="color: #4f46e5; text-decoration: none;">Documentation</a> |
              <a href="https://codecollab.co.in/support" style="color: #4f46e5; text-decoration: none;">Support</a> |
              <a href="https://codecollab.co.in/privacy" style="color: #4f46e5; text-decoration: none;">Privacy Policy</a>
            </td>
          </tr>

        </table>

        <!-- Automated Message Notice -->
        <p style="text-align: center; font-size: 12px; color: #9ca3af; margin: 20px 0;">
          This is an automated message, please do not reply to this email.
        </p>
      </td>
    </tr>
  </table>

</body>
</html>


`

export const PASSWORD_RESET_SUCCESS_TEMPLATE = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Password Reset Successful</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f2f2f2;">

    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f2f2f2;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; margin-top: 20px;">
            <!-- Header -->
            <tr>
              <td style="background: linear-gradient(to right, #6d28d9, #4f46e5); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0;">CodeCollab</h1>
                <p style="color: #ddd; margin: 5px 0 0;">Collaborative Coding Platform</p>
              </td>
            </tr>

            <!-- Main Content -->
            <tr>
              <td style="padding: 30px; color: #333;">
                <h2 style="margin-top: 0;">Password Reset Successful</h2>
                <p>Hello,</p>
                <p>We're writing to confirm that your password has been successfully reset.</p>

                <div style="text-align: center; margin: 30px 0;">
                  <div style="background-color: #22c55e; color: white; width: 60px; height: 60px; line-height: 60px; border-radius: 50%; display: inline-block; font-size: 32px;">
                    ✓
                  </div>
                </div>

                <p>If you did not initiate this password reset, please contact our support team immediately.</p>
                <p>For your security, we recommend the following:</p>
                <ul style="padding-left: 20px; margin-top: 10px;">
                  <li>Use a strong, unique password</li>
                  <li>Enable two-factor authentication (2FA)</li>
                  <li>Avoid reusing passwords across sites</li>
                </ul>

                <p>Thank you for helping us keep your account secure.</p>
                <p>Best regards,<br>CodeCollab Team</p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color: #1f2937; color: #d1d5db; text-align: center; padding: 20px; font-size: 12px;">
                This email was sent to: <a href="mailto:{email}" style="color: #93c5fd;">{email}</a><br /><br />
                Need help? Contact our support team<br /><br />
                <a href="https://codecollab.co.in" style="color: #60a5fa; text-decoration: none;">Visit CodeCollab</a> |
                <a href="#" style="color: #60a5fa; text-decoration: none;">Support</a> |
                <a href="#" style="color: #60a5fa; text-decoration: none;">Privacy Policy</a>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>

    <!-- Automated Message Notice -->
    <p style="text-align: center; font-size: 12px; color: #6b7280; margin: 20px 0;">
      This is an automated message, please do not reply to this email.
    </p>

  </body>
</html>

`;

export const PASSWORD_RESET_REQUEST_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Password Reset</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f2f2f2;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f2f2f2;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; margin-top: 20px;">
            <!-- Header -->
            <tr>
              <td style="background: linear-gradient(to right, #6d28d9, #4f46e5); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0;">CodeCollab</h1>
                <p style="color: #ddd; margin: 5px 0 0;">Collaborative Coding Platform</p>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding: 30px; color: #333333;">
                <h2 style="margin-top: 0;">Reset Your Password</h2>
                <p>
                  We received a request to reset your password. If you didn’t make this request, you can safely ignore this email.
                </p>
                <p>
                  Otherwise, click the button below to create a new password:
                </p>

                <div style="margin: 30px 0; text-align: center;">
                  <a href="{resetURL}" style="display: inline-block; background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold;">
                    Reset Password
                  </a>
                </div>

                <p style="color: #6b7280; font-size: 14px;">This link will expire in 1 hour for security reasons.</p>

                <div style="margin-top: 30px; padding: 15px; background-color: #fcd34d; border-radius: 6px; color: #92400e;">
                  <strong>Security Notice:</strong> If you didn’t request a password reset, no changes have been made to your account.
                </div>

                <p style="margin-top: 30px;">
                  Thanks,<br />
                  The CodeCollab Team
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color: #1f2937; color: #d1d5db; text-align: center; padding: 20px; font-size: 12px;">
                This email was sent to: <a href="mailto:{email}" style="color: #93c5fd;">{email}</a><br /><br />
                Need help? Contact our support team<br /><br />
                <a href="https://codecollab.co.in" style="color: #60a5fa; text-decoration: none;">Visit CodeCollab</a> |
                <a href="#" style="color: #60a5fa; text-decoration: none;">Support</a> |
                <a href="#" style="color: #60a5fa; text-decoration: none;">Privacy Policy</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Automated Message Notice -->
    <p style="text-align: center; font-size: 12px; color: #6b7280; margin: 20px 0;">
      This is an automated message, please do not reply to this email.
    </p>
  </body>
</html>

`;