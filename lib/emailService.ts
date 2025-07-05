import { Resend } from 'resend'
import type { JobMatch } from './matchingAlgorithm'
import { 
  jobMatchesEmailTemplate, 
  welcomeEmailTemplate, 
  profileUpdateReminderTemplate, 
  weeklyDigestTemplate,
  replaceTemplateVariables 
} from './emailTemplates'

let resend: Resend | null = null;

function getResendClient() {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("Missing API key. Pass it to the constructor `new Resend(\"re_123\")`");
    }
    resend = new Resend(apiKey);
  }
  return resend;
}

const FROM_EMAIL = 'notifications@jobmatchai.com'
const APP_URL = typeof window === 'undefined' ? ((globalThis as any)?.process?.env?.NEXT_PUBLIC_APP_URL || 'http://localhost:3000') : 'http://localhost:3000'

export async function sendMatchNotification(user: { email: string, name?: string }, matches: JobMatch[]) {
  if (!user.email || matches.length === 0) return null

  try {
    const client = getResendClient();
    const html = jobMatchesEmailTemplate(user.name || 'there', matches, APP_URL)
    const finalHtml = replaceTemplateVariables(html, {
      APP_URL: APP_URL,
      USER_EMAIL: user.email
    })

    const { data, error } = await client.emails.send({
      from: FROM_EMAIL,
      to: user.email,
      subject: `${matches.length} New Job Matches for You`,
      html: finalHtml
    })
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Email send error:', error)
    throw error
  }
}

export async function sendWelcomeEmail(user: { email: string, name?: string }) {
  if (!user.email) return null

  try {
    const client = getResendClient();
    const html = welcomeEmailTemplate(user.name || 'there', APP_URL)
    const finalHtml = replaceTemplateVariables(html, {
      APP_URL: APP_URL,
      USER_EMAIL: user.email
    })

    const { data, error } = await client.emails.send({
      from: FROM_EMAIL,
      to: user.email,
      subject: 'Welcome to JobMatch AI! 🎉',
      html: finalHtml
    })
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Welcome email send error:', error)
    throw error
  }
}

export async function sendProfileUpdateReminder(user: { email: string, name?: string }) {
  if (!user.email) return null

  try {
    const client = getResendClient();
    const html = profileUpdateReminderTemplate(user.name || 'there', APP_URL)
    const finalHtml = replaceTemplateVariables(html, {
      APP_URL: APP_URL,
      USER_EMAIL: user.email
    })

    const { data, error } = await client.emails.send({
      from: FROM_EMAIL,
      to: user.email,
      subject: 'Update Your Profile for Better Matches 📝',
      html: finalHtml
    })
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Profile update reminder email send error:', error)
    throw error
  }
}

export async function sendWeeklyDigest(user: { email: string, name?: string }, stats: {
  totalMatches: number
  newJobs: number
  topSkills: string[]
  averageScore: number
}) {
  if (!user.email) return null

  try {
    const client = getResendClient();
    const html = weeklyDigestTemplate(user.name || 'there', stats, APP_URL)
    const finalHtml = replaceTemplateVariables(html, {
      APP_URL: APP_URL,
      USER_EMAIL: user.email
    })

    const { data, error } = await client.emails.send({
      from: FROM_EMAIL,
      to: user.email,
      subject: 'Your Weekly JobMatch Digest 📊',
      html: finalHtml
    })
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Weekly digest email send error:', error)
    throw error
  }
}
