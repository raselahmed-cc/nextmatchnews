import { NextResponse } from 'next/server'
import { getContactPage } from '@/lib/contact'
import { getPayloadClient } from '@/lib/payload'
import { checkAndIncrementQuota } from '@/lib/redis'

export const dynamic = 'force-dynamic'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DAILY_SUBMISSIONS_PER_IP = 5

const getClientIP = (request: Request): string =>
  request.headers.get('cf-connecting-ip') ||
  request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
  'unknown'

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const { name, email, subject, message, website } = body as Record<string, unknown>

  // Honeypot: a real visitor never fills this hidden field in; a bot
  // filling every input on the form does. Reply with a fake success so the
  // bot doesn't learn to skip it — no data is written either way.
  if (typeof website === 'string' && website.trim().length > 0) {
    return NextResponse.json({ success: true })
  }

  if (typeof name !== 'string' || !name.trim()) {
    return NextResponse.json({ error: 'Name is required.' }, { status: 400 })
  }
  if (typeof email !== 'string' || !EMAIL_PATTERN.test(email.trim())) {
    return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 })
  }
  if (typeof message !== 'string' || !message.trim()) {
    return NextResponse.json({ error: 'Message is required.' }, { status: 400 })
  }
  if (subject !== undefined && typeof subject !== 'string') {
    return NextResponse.json({ error: 'Invalid subject.' }, { status: 400 })
  }

  const ip = getClientIP(request)
  const allowed = await checkAndIncrementQuota(`contact-form:${ip}`, DAILY_SUBMISSIONS_PER_IP)
  if (!allowed) {
    return NextResponse.json(
      { error: "You've submitted the maximum number of messages for today. Please try again tomorrow." },
      { status: 429 },
    )
  }

  const payload = await getPayloadClient()
  const trimmedSubject = typeof subject === 'string' ? subject.trim() : undefined

  await payload.create({
    collection: 'contact-submissions',
    data: {
      name: name.trim(),
      email: email.trim(),
      subject: trimmedSubject,
      message: message.trim(),
    },
  })

  // The submission is already saved at this point, which is what actually
  // matters — a failed notification email should never turn into a failed
  // submission for the visitor. Log it and move on rather than swallowing
  // it silently (CLAUDE.md §34).
  try {
    const contactPage = await getContactPage()
    await payload.sendEmail({
      to: contactPage.contactEmail,
      replyTo: email.trim(),
      subject: `New contact form message${trimmedSubject ? `: ${trimmedSubject}` : ''}`,
      text: `From: ${name.trim()} <${email.trim()}>\n\n${message.trim()}`,
    })
  } catch (error) {
    console.error('[contact] failed to send notification email:', error)
  }

  return NextResponse.json({ success: true })
}
