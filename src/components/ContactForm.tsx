'use client'

import type { FormEvent } from 'react'
import { useState } from 'react'
import { Button } from './ui/Button'

const inputClasses =
  'w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'

type Status = 'idle' | 'submitting' | 'success' | 'error'

export const ContactForm = () => {
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus('submitting')
    setErrorMessage('')

    const form = event.currentTarget
    const formData = new FormData(form)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          email: formData.get('email'),
          subject: formData.get('subject'),
          message: formData.get('message'),
          website: formData.get('website'), // honeypot — always blank for real visitors
        }),
      })

      const data = (await response.json()) as { error?: string; success?: boolean }

      if (!response.ok || !data.success) {
        setStatus('error')
        setErrorMessage(data.error || 'Something went wrong. Please try again.')
        return
      }

      setStatus('success')
      form.reset()
    } catch {
      setStatus('error')
      setErrorMessage('Something went wrong. Please try again.')
    }
  }

  if (status === 'success') {
    return (
      <div className="rounded-lg border border-border bg-surface-alt p-6 text-center">
        <p className="font-semibold text-ink">Thanks — your message has been sent.</p>
        <p className="mt-1 text-sm text-muted">We aim to respond within a few business days.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Hidden from real visitors via CSS, but present in the DOM for bots that fill every field. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-semibold text-ink">
          Name
        </label>
        <input type="text" id="name" name="name" required className={inputClasses} />
      </div>

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-semibold text-ink">
          Email
        </label>
        <input type="email" id="email" name="email" required className={inputClasses} />
      </div>

      <div>
        <label htmlFor="subject" className="mb-1 block text-sm font-semibold text-ink">
          Subject
        </label>
        <input type="text" id="subject" name="subject" className={inputClasses} />
      </div>

      <div>
        <label htmlFor="message" className="mb-1 block text-sm font-semibold text-ink">
          Message
        </label>
        <textarea id="message" name="message" required rows={6} className={inputClasses} />
      </div>

      {status === 'error' ? <p className="text-sm text-red-600">{errorMessage}</p> : null}

      <Button type="submit" disabled={status === 'submitting'} className="self-start">
        {status === 'submitting' ? 'Sending…' : 'Send Message'}
      </Button>
    </form>
  )
}
