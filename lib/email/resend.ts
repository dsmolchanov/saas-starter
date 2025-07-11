import { Resend } from 'resend';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

interface TeacherApplicationEmailData {
  applicantName: string;
  applicantEmail: string;
  experienceLevel: string;
  trainingBackground: string;
  offlinePractice?: string;
  regularStudentsCount?: string;
  revenueModel: string;
  motivation?: string;
  additionalInfo?: string;
  submittedAt: Date;
}

export async function sendTeacherApplicationNotification(data: TeacherApplicationEmailData) {
  try {
    // Email to admin (dk@dzen.yoga)
    const adminEmailResult = await resend.emails.send({
      from: 'noreply@dzen.yoga',
      to: ['dk@dzen.yoga'],
      subject: `New Teacher Application from ${data.applicantName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">New Teacher Application Received</h2>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Applicant Information</h3>
            <p><strong>Name:</strong> ${data.applicantName}</p>
            <p><strong>Email:</strong> ${data.applicantEmail}</p>
            <p><strong>Submitted:</strong> ${data.submittedAt.toLocaleDateString()}</p>
          </div>

          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Application Details</h3>
            <p><strong>Experience Level:</strong> ${data.experienceLevel}</p>
            <p><strong>Training Background:</strong><br>${data.trainingBackground}</p>
            ${data.offlinePractice ? `<p><strong>Current Practice:</strong><br>${data.offlinePractice}</p>` : ''}
            ${data.regularStudentsCount ? `<p><strong>Regular Students:</strong> ${data.regularStudentsCount}</p>` : ''}
            <p><strong>Revenue Model:</strong> ${data.revenueModel}</p>
            ${data.motivation ? `<p><strong>Motivation:</strong><br>${data.motivation}</p>` : ''}
            ${data.additionalInfo ? `<p><strong>Additional Info:</strong><br>${data.additionalInfo}</p>` : ''}
          </div>

          <div style="margin: 30px 0; text-align: center;">
            <a href="https://dzen.yoga/admin/teacher-applications" 
               style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Review Application
            </a>
          </div>

          <p style="color: #6b7280; font-size: 14px;">
            Please review this application within 2-3 business days as promised to the applicant.
          </p>
        </div>
      `
    });

    // Email to applicant
    const applicantEmailResult = await resend.emails.send({
      from: 'team@dzen.yoga',
      to: [data.applicantEmail],
      subject: 'Your Dzen Yoga Teacher Application Has Been Received',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Thank You for Your Application!</h2>
          
          <p>Dear ${data.applicantName},</p>
          
          <p>We're excited to let you know that we've received your teacher application for Dzen Yoga. Thank you for your interest in joining our community of passionate yoga instructors!</p>

          <div style="background: #f0f9ff; border: 1px solid #0ea5e9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #0ea5e9;">What Happens Next?</h3>
            <ul style="margin: 0;">
              <li>Our team will review your application within 2-3 business days</li>
              <li>We'll thoroughly evaluate your experience and background</li>
              <li>You'll receive an email notification with our decision</li>
              <li>If approved, you'll get immediate access to our teacher dashboard</li>
            </ul>
          </div>

          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Your Application Summary</h3>
            <p><strong>Experience Level:</strong> ${data.experienceLevel}</p>
            <p><strong>Revenue Model:</strong> ${data.revenueModel}</p>
            <p><strong>Submitted:</strong> ${data.submittedAt.toLocaleDateString()}</p>
          </div>

          <p>In the meantime, feel free to explore our platform and get familiar with the courses and teaching styles that resonate with our community.</p>

          <p>If you have any questions or need to update your application, please don't hesitate to reach out to us.</p>

          <p style="margin-top: 30px;">
            Warm regards,<br>
            <strong>The Dzen Yoga Team</strong>
          </p>

          <div style="border-top: 1px solid #e5e7eb; margin-top: 30px; padding-top: 20px; color: #6b7280; font-size: 14px;">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>For support, contact us at team@dzen.yoga</p>
          </div>
        </div>
      `
    });

    console.log('Email notifications sent:', {
      admin: adminEmailResult.data?.id,
      applicant: applicantEmailResult.data?.id
    });

    return {
      success: true,
      adminEmailId: adminEmailResult.data?.id,
      applicantEmailId: applicantEmailResult.data?.id
    };
  } catch (error) {
    console.error('Failed to send teacher application emails:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function sendTeacherApplicationStatusUpdate(
  applicantEmail: string,
  applicantName: string,
  status: 'approved' | 'rejected',
  reviewNotes?: string
) {
  try {
    const subject = status === 'approved' 
      ? '🎉 Your Dzen Yoga Teacher Application Has Been Approved!'
      : 'Update on Your Dzen Yoga Teacher Application';

    const html = status === 'approved' ? `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">Congratulations, ${applicantName}!</h2>
        
        <p>We're thrilled to welcome you to the Dzen Yoga teaching community! Your application has been approved, and you now have access to all our teacher features.</p>

        <div style="background: #f0fdf4; border: 1px solid #16a34a; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #16a34a;">🚀 Getting Started</h3>
          <ol style="margin: 0;">
            <li>Access your teacher dashboard at <a href="https://dzen.yoga/my_practice">dzen.yoga/my_practice</a></li>
            <li>Complete your teacher profile</li>
            <li>Create your first course or individual class</li>
            <li>Start building your student community!</li>
          </ol>
        </div>

        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">💰 Revenue Sharing</h3>
          <p>Remember, you'll earn 70% of subscription revenue from students who attend your classes each month. The more engaging your content, the more you earn!</p>
        </div>

        <div style="margin: 30px 0; text-align: center;">
          <a href="https://dzen.yoga/my_practice" 
             style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Access Teacher Dashboard
          </a>
        </div>

        <p>Our team is here to support you every step of the way. If you need any help getting started, don't hesitate to reach out!</p>

        <p style="margin-top: 30px;">
          Welcome to the family!<br>
          <strong>The Dzen Yoga Team</strong>
        </p>
      </div>
    ` : `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Thank You for Your Interest</h2>
        
        <p>Dear ${applicantName},</p>
        
        <p>Thank you for taking the time to apply to become a teacher on Dzen Yoga. After careful consideration, we've decided not to move forward with your application at this time.</p>

        ${reviewNotes ? `
          <div style="background: #fef2f2; border: 1px solid #ef4444; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #dc2626;">Feedback</h3>
            <p>${reviewNotes}</p>
          </div>
        ` : ''}

        <div style="background: #f0f9ff; border: 1px solid #0ea5e9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #0ea5e9;">Apply Again</h3>
          <p>We encourage you to continue developing your teaching practice and apply again in the future. Each application is evaluated independently, and we'd love to hear from you again when you feel ready.</p>
        </div>

        <p>We truly appreciate your passion for yoga and your interest in our platform. Keep practicing, keep teaching, and keep spreading the joy of yoga!</p>

        <p style="margin-top: 30px;">
          Best wishes,<br>
          <strong>The Dzen Yoga Team</strong>
        </p>
      </div>
    `;

    const result = await resend.emails.send({
      from: 'team@dzen.yoga',
      to: [applicantEmail],
      subject,
      html
    });

    console.log('Status update email sent:', result.data?.id);

    return {
      success: true,
      emailId: result.data?.id
    };
  } catch (error) {
    console.error('Failed to send status update email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
} 