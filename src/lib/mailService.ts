import { apiPost } from "./apiService";

export interface SendEmailData {
  to: string;
  name: string;
  subject: string;
  html: string;
}

export interface userData {
  username: string;
  surveyLink: string;
  deadline: string;
}

export const sendEmail = async (userData?: userData) => {
  try {
    // Use default data if none provided (for backward compatibility)
    const emailRequest = {
      to: "nimsaradineth63@gmail.com",
      name: "Dineth",
      subject: "Invitation: 360° Feedback Survey",
      html: `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>360° Feedback Survey Invitation</title>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #f8f9fa; padding: 20px;">
    <table width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
      <tr>
        <td style="background-color: #2b6cb0; padding: 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 22px;">360° Feedback Survey</h1>
        </td>
      </tr>
      <tr>
        <td style="padding: 20px; color: #333333; font-size: 15px; line-height: 1.6;">
          <p>Dear <strong>${userData?.username}</strong>,</p>
          <p>
            You have been invited to participate in our <strong>360° Feedback Survey</strong>. Your input is valuable and will help us build a better feedback culture.
          </p>
          <p style="margin: 20px 0; text-align: center;">
            <a href="${userData?.surveyLink}" target="_blank" style="background-color: #2b6cb0; color: #ffffff; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Start Survey
            </a>
          </p>
          <p>
            Please complete the survey by <strong>${userData?.deadline}</strong>. If you have any questions, feel free to contact us.
          </p>
          <p>Thank you for your time and valuable contribution.</p>
        </td>
      </tr>
      <tr>
        <td style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #555555;">
          © 2025 Talentboozt · This is an automated message, please do not reply.
        </td>
      </tr>
    </table>
  </body>
</html>`,
    };

    const data = await apiPost<any>("/email", emailRequest);
    console.log("Mail API response:", data);
    return data;
  } catch (error) {
    console.error("Error sending mail:", error);
    throw error;
  }
};
