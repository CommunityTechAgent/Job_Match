import type { JobMatch } from './matchingAlgorithm'

// Base email template with common styling
const baseTemplate = (content: string, title: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white;">
    <!-- Header -->
    <div style="background-color: #0F172A; padding: 20px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">JobMatch AI</h1>
      <p style="color: #94A3B8; margin: 5px 0 0 0;">Your AI-powered job matching platform</p>
    </div>
    
    <!-- Content -->
    <div style="padding: 30px;">
      ${content}
    </div>
    
    <!-- Footer -->
    <div style="background-color: #F8FAFC; padding: 20px; border-top: 1px solid #E2E8F0;">
      <div style="text-align: center; color: #64748B; font-size: 12px;">
        <p style="margin: 0 0 10px 0;">
          You're receiving this email because you signed up for JobMatch AI.
        </p>
        <p style="margin: 0;">
          <a href="{{APP_URL}}/settings/notifications" style="color: #0F172A; text-decoration: none;">Manage email preferences</a> | 
          <a href="{{APP_URL}}/unsubscribe?email={{USER_EMAIL}}" style="color: #0F172A; text-decoration: none;">Unsubscribe</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`

// Job match card component
const jobMatchCard = (match: JobMatch, appUrl: string) => `
  <div style="margin-bottom: 20px; padding: 20px; border: 1px solid #E2E8F0; border-radius: 8px; background-color: #FAFAFA;">
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
      <div>
        <h3 style="margin: 0 0 5px 0; color: #0F172A; font-size: 18px;">${match.title}</h3>
        <p style="margin: 0; color: #64748B; font-size: 14px;">${match.company}</p>
      </div>
      <div style="text-align: right;">
        <div style="background-color: #10B981; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">
          ${match.match_score}% Match
        </div>
      </div>
    </div>
    
    <div style="margin-bottom: 15px;">
      <p style="margin: 0 0 5px 0; color: #374151;">
        <strong>📍 Location:</strong> ${match.location}
      </p>
      <p style="margin: 0 0 5px 0; color: #374151;">
        <strong>💰 Salary:</strong> ${match.salary_range}
      </p>
      <p style="margin: 0; color: #374151;">
        <strong>🏢 Type:</strong> ${match.job_type}
      </p>
    </div>
    
    <div style="margin-bottom: 15px;">
      <p style="margin: 0 0 8px 0; color: #374151; font-weight: bold;">Why this matches you:</p>
      <ul style="margin: 0; padding-left: 20px; color: #4B5563;">
        ${match.match_reasons.map(reason => `<li>${reason}</li>`).join('')}
      </ul>
    </div>
    
    <a href="${appUrl}/jobs/${match.id}" 
       style="display: inline-block; padding: 10px 20px; background-color: #0F172A; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
      View Job Details
    </a>
  </div>
`

// Welcome email template
export const welcomeEmailTemplate = (userName: string, appUrl: string) => {
  const content = `
    <h2 style="color: #0F172A; margin-bottom: 20px;">Welcome to JobMatch AI! 🎉</h2>
    
    <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
      Hello ${userName || 'there'},
    </p>
    
    <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
      Welcome to JobMatch AI! We're excited to help you find your next great opportunity using our advanced AI-powered matching system.
    </p>
    
    <div style="background-color: #F0F9FF; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <h3 style="color: #0F172A; margin-top: 0;">What's next?</h3>
      <ul style="color: #374151; line-height: 1.6;">
        <li><strong>Complete your profile</strong> - Add your skills, experience, and preferences</li>
        <li><strong>Upload your resume</strong> - Help us understand your background better</li>
        <li><strong>Get matched</strong> - Receive personalized job recommendations</li>
        <li><strong>Stay updated</strong> - Get notified about new opportunities</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${appUrl}/dashboard" 
         style="display: inline-block; padding: 12px 24px; background-color: #0F172A; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
        Get Started
      </a>
    </div>
    
    <p style="color: #64748B; font-size: 14px; line-height: 1.6;">
      If you have any questions, feel free to reach out to our support team. We're here to help you succeed!
    </p>
  `
  
  return baseTemplate(content, 'Welcome to JobMatch AI')
}

// Job matches email template
export const jobMatchesEmailTemplate = (userName: string, matches: JobMatch[], appUrl: string) => {
  const topMatches = matches.slice(0, 3)
  const matchCount = topMatches.length
  
  const content = `
    <h2 style="color: #0F172A; margin-bottom: 20px;">Your Latest Job Matches 🎯</h2>
    
    <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
      Hello ${userName || 'there'},
    </p>
    
    <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
      We've found <strong>${matchCount} new job matches</strong> that align with your profile and preferences. 
      These opportunities have been carefully selected based on your skills, experience, and career goals.
    </p>
    
    ${topMatches.map(match => jobMatchCard(match, appUrl)).join('')}
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${appUrl}/dashboard" 
         style="display: inline-block; padding: 12px 24px; background-color: #0F172A; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
        View All Matches
      </a>
    </div>
    
    <div style="background-color: #FEF3C7; padding: 15px; border-radius: 6px; margin-top: 20px;">
      <p style="margin: 0; color: #92400E; font-size: 14px;">
        💡 <strong>Tip:</strong> Keep your profile updated to get even better matches. 
        Add new skills, update your experience, or adjust your preferences anytime.
      </p>
    </div>
  `
  
  return baseTemplate(content, `${matchCount} New Job Matches`)
}

// Profile update reminder email template
export const profileUpdateReminderTemplate = (userName: string, appUrl: string) => {
  const content = `
    <h2 style="color: #0F172A; margin-bottom: 20px;">Update Your Profile for Better Matches 📝</h2>
    
    <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
      Hello ${userName || 'there'},
    </p>
    
    <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
      It's been a while since you last updated your profile. Keeping your information current helps us find 
      more relevant job opportunities for you.
    </p>
    
    <div style="background-color: #F0F9FF; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <h3 style="color: #0F172A; margin-top: 0;">What you can update:</h3>
      <ul style="color: #374151; line-height: 1.6;">
        <li><strong>Skills</strong> - Add new technologies or certifications</li>
        <li><strong>Experience</strong> - Update your work history</li>
        <li><strong>Preferences</strong> - Adjust salary expectations or location preferences</li>
        <li><strong>Resume</strong> - Upload your latest resume</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${appUrl}/dashboard/profile" 
         style="display: inline-block; padding: 12px 24px; background-color: #0F172A; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
        Update Profile
      </a>
    </div>
    
    <p style="color: #64748B; font-size: 14px; line-height: 1.6;">
      The more accurate your profile, the better our AI can match you with relevant opportunities!
    </p>
  `
  
  return baseTemplate(content, 'Update Your Profile')
}

// Weekly digest email template
export const weeklyDigestTemplate = (userName: string, stats: {
  totalMatches: number
  newJobs: number
  topSkills: string[]
  averageScore: number
}, appUrl: string) => {
  const content = `
    <h2 style="color: #0F172A; margin-bottom: 20px;">Your Weekly JobMatch Digest 📊</h2>
    
    <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
      Hello ${userName || 'there'},
    </p>
    
    <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
      Here's your weekly summary of job matching activity and opportunities.
    </p>
    
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
      <div style="background-color: #F0F9FF; padding: 15px; border-radius: 6px; text-align: center;">
        <div style="font-size: 24px; font-weight: bold; color: #0F172A;">${stats.totalMatches}</div>
        <div style="color: #64748B; font-size: 12px;">Total Matches</div>
      </div>
      <div style="background-color: #F0FDF4; padding: 15px; border-radius: 6px; text-align: center;">
        <div style="font-size: 24px; font-weight: bold; color: #0F172A;">${stats.newJobs}</div>
        <div style="color: #64748B; font-size: 12px;">New Jobs Added</div>
      </div>
    </div>
    
    <div style="background-color: #FEF3C7; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
      <h3 style="color: #92400E; margin-top: 0;">Your Top Skills in Demand</h3>
      <p style="color: #92400E; margin-bottom: 10px;">
        These skills are currently in high demand:
      </p>
      <div style="display: flex; flex-wrap: wrap; gap: 8px;">
        ${stats.topSkills.map(skill => 
          `<span style="background-color: #F59E0B; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${skill}</span>`
        ).join('')}
      </div>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${appUrl}/dashboard" 
         style="display: inline-block; padding: 12px 24px; background-color: #0F172A; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
        View Dashboard
      </a>
    </div>
    
    <p style="color: #64748B; font-size: 14px; line-height: 1.6;">
      Keep an eye on your dashboard for new matches throughout the week!
    </p>
  `
  
  return baseTemplate(content, 'Weekly JobMatch Digest')
}

// Utility function to replace template variables
export const replaceTemplateVariables = (template: string, variables: Record<string, string>) => {
  let result = template
  Object.entries(variables).forEach(([key, value]) => {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value)
  })
  return result
} 