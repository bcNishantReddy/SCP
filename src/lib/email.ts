import { supabase } from "@/integrations/supabase/client";

export const sendEmail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) => {
  try {
    const { data: functionData, error: functionError } = await supabase.functions.invoke(
      "send-email",
      {
        body: { to, subject, html },
      }
    );

    if (functionError) {
      console.error("Error sending email:", functionError);
      throw functionError;
    }

    return functionData;
  } catch (error) {
    console.error("Error in sendEmail:", error);
    throw error;
  }
};

export const sendApprovalEmail = async (userEmail: string, userName: string) => {
  return sendEmail({
    to: userEmail,
    subject: "Your Boss-y Account Has Been Approved!",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Welcome to Boss-y!</h1>
        <p>Hello ${userName},</p>
        <p>Great news! Your Boss-y account has been approved. You now have full access to all platform features.</p>
        <p>You can now:</p>
        <ul>
          <li>Create and view projects</li>
          <li>Connect with other members</li>
          <li>Participate in events</li>
          <li>And much more!</li>
        </ul>
        <p>Get started by logging in to your account.</p>
        <p>Best regards,<br>The Boss-y Team</p>
      </div>
    `,
  });
};

export const sendWelcomeEmail = async (userEmail: string, userName: string) => {
  return sendEmail({
    to: userEmail,
    subject: "Welcome to Boss-y - Account Pending Approval",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Welcome to Boss-y!</h1>
        <p>Hello ${userName},</p>
        <p>Thank you for signing up for Boss-y! Your account is currently pending approval from our administrators.</p>
        <p>You'll receive another email once your account has been approved.</p>
        <p>In the meantime, if you have any questions, please don't hesitate to contact us.</p>
        <p>Best regards,<br>The Boss-y Team</p>
      </div>
    `,
  });
};