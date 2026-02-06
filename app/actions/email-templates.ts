/**
 * Email HTML Templates
 * 
 * Clean, responsive email templates for notifications.
 */

export function getCompletionEmailHtml(dashboardUrl: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Processing Complete</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="min-height: 100vh;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 480px; background: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 32px 32px 24px; text-align: center;">
                            <div style="width: 64px; height: 64px; margin: 0 auto 16px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                <span style="font-size: 32px;">✓</span>
                            </div>
                            <h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #18181b;">Processing Complete!</h1>
                            <p style="margin: 0; font-size: 15px; color: #71717a;">All candidates have been analyzed</p>
                        </td>
                    </tr>
                    
                    <!-- Body -->
                    <tr>
                        <td style="padding: 0 32px 24px;">
                            <div style="background: #f4f4f5; border-radius: 12px; padding: 20px; text-align: center;">
                                <p style="margin: 0 0 16px; font-size: 14px; color: #52525b; line-height: 1.6;">
                                    Your candidate queue has been fully processed. Review the results on your triage dashboard.
                                </p>
                                <a href="${dashboardUrl}" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600; box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);">
                                    View Triage Dashboard →
                                </a>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 0 32px 32px; text-align: center;">
                            <p style="margin: 0; font-size: 12px; color: #a1a1aa;">
                                TATS - Triage Analysis & Tracking System
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `.trim();
}
