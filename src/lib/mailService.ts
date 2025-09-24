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
  userId?: string;
}

export interface BulkEmailRecipient {
  [name: string]: string; // name: email
}

export interface BulkEmailData {
  to: BulkEmailRecipient[];
  subject: string;
  html: string;
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

export const sendBulkEmails = async (
  recipients: BulkEmailRecipient[],
  surveyName: string,
  users: { userId: string; appraiser: boolean; role: string }[],
  baseSurveyLink?: string,
  surveyId?: string,
  appraiseeeName?: string
) => {
  try {
    // Generate deadline (e.g., 2 weeks from now)
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 14);
    const formattedDeadline = deadline.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Send individual emails to each recipient with their personalized survey link
    const emailPromises = recipients.map(async (recipient) => {
      const recipientName = Object.keys(recipient)[0];
      const recipientEmail = Object.values(recipient)[0];

      // Find the user ID for this recipient by matching email
      // We'll need to get user details from localStorage to match email to userId
      const createdUsers = JSON.parse(
        localStorage.getItem("createdUsers") || "[]"
      );
      const companyUsers = JSON.parse(
        localStorage.getItem("CompanyUsers") || "[]"
      );

      let userId = null;

      // Try to find user ID by matching email
      const userDetail =
        createdUsers.find((user: any) => user.email === recipientEmail) ||
        companyUsers.find((user: any) => user.email === recipientEmail);

      if (userDetail) {
        userId = userDetail.id || userDetail._id || userDetail.manageUserId;
      }

      // If we can't find userId from user details, try to match from the users array
      if (!userId) {
        // This is a fallback - we might need to enhance the data structure
        console.warn(`Could not find userId for email: ${recipientEmail}`);
        userId = "unknown";
      }

      // Create personalized survey link with user ID and token (survey ID)
      let personalizedSurveyLink = `${baseSurveyLink}?userId=${userId}`;
      if (surveyId) {
        personalizedSurveyLink += `&token=${surveyId}`;
      }

      console.log(
        `Generated URL for ${recipientName}: ${personalizedSurveyLink}`
      );

      const individualEmailRequest = {
        to: recipientEmail,
        name: recipientName,
        subject: `Share Your Feedback for ${appraiseeeName || "Your Colleague"}`,
        html: `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>360° Feedback Survey Invitation</title>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #f8f9fa; padding: 20px;">
    <table width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
      <tr>
        <td style="background-color: #059629; padding: 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 22px;">360° Feedback Survey</h1>
        </td>
      </tr>
      <tr>
        <td style="padding: 20px; color: #333333; font-size: 15px; line-height: 1.6;">
          <p>Hi <strong>${recipientName}</strong>,</p>
          <p>
            You've been invited to give feedback for <strong>${appraiseeeName || "your colleague"}</strong> as part of a 360° feedback process. Your input will really help them understand their strengths and where they can grow.
          </p>
          <p>
            The survey is quick (about 2-3 minutes) and your responses will stay confidential. Please complete it by <strong>${formattedDeadline}</strong> using the link below:
          </p>
          <p style="margin: 20px 0; text-align: center;">
            <a href="${personalizedSurveyLink}" target="_blank" style="background-color: #059629; color: #ffffff; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Start Survey
            </a>
          </p>
          <p>
            Thanks so much for taking the time to support your colleague!
          </p>
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

      console.log(
        `Sending personalized email to ${recipientName} (${recipientEmail}) with survey link: ${personalizedSurveyLink} (userId: ${userId}, token: ${surveyId || "not provided"})`
      );
      return apiPost<any>("/email", individualEmailRequest);
    });

    // Wait for all emails to be sent
    const results = await Promise.all(emailPromises);
    console.log(
      `Successfully sent ${results.length} personalized survey invitations`
    );
    return results;
  } catch (error) {
    console.error("Error sending bulk emails:", error);
    throw error;
  }
};
