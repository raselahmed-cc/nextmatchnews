'use client'

import type { KeyboardEvent } from 'react'
import { useEffect, useRef, useState } from 'react'
import { FieldDescription, FieldError, FieldLabel, useConfig, useDebounce, useField } from '@payloadcms/ui'

type TagOption = { id: number; name: string }

type TagsFieldProps = {
  field?: {
    admin?: { description?: unknown }
    label?: unknown
    required?: boolean
  }
  path?: string
}

// Replaces the default relationship dropdown for Articles.tags — that
// default requires clicking a separate "+" button that opens a full
// document-creation drawer, which isn't the "just type it and go" flow
// editors expect from a tag input. This fetches/creates Tag docs over the
// same REST API the admin already uses (same-origin, cookie-authenticated),
// so no separate collection or field type is needed.
export const TagsField = ({ field, path: pathFromProps }: TagsFieldProps) => {
  const { path, setValue, showError, value } = useField<number[]>({ path: pathFromProps })
  const { config } = useConfig()

  const [selected, setSelected] = useState<TagOption[]>([])
  const [inputValue, setInputValue] = useState('')
  const [suggestions, setSuggestions] = useState<TagOption[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isBusy, setIsBusy] = useState(false)
  const hydratedRef = useRef(false)
  const debouncedInput = useDebounce(inputValue, 300)

  const ids = value ?? []
  const visibleSuggestions = inputValue.trim() ? suggestions : []

  // Resolve the initial IDs (from an existing article) to display names,
  // once — after that this component's own state stays authoritative.
  useEffect(() => {
    if (hydratedRef.current) return
    hydratedRef.current = true
    if (ids.length === 0) return

    ;(async () => {
      const res = await fetch(
        `${config.routes.api}/tags?where[id][in]=${ids.join(',')}&limit=${ids.length}&depth=0`,
        { credentials: 'include' },
      )
      if (!res.ok) return
      const data = (await res.json()) as { docs: TagOption[] }
      setSelected(data.docs.map((doc) => ({ id: doc.id, name: doc.name })))
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Search existing tags as the user types. `suggestions` only ever holds
  // the last fetch result — it's masked to empty at render time (see
  // `visibleSuggestions` below) whenever the input is blank, rather than
  // clearing it here, since setState directly in an effect body (with no
  // async gap) triggers a lint error for cascading-render risk.
  useEffect(() => {
    if (!debouncedInput.trim()) return

    let cancelled = false
    ;(async () => {
      const res = await fetch(
        `${config.routes.api}/tags?where[name][like]=${encodeURIComponent(debouncedInput.trim())}&limit=10&depth=0`,
        { credentials: 'include' },
      )
      if (!res.ok || cancelled) return
      const data = (await res.json()) as { docs: TagOption[] }
      const selectedIds = new Set(selected.map((tag) => tag.id))
      setSuggestions(data.docs.filter((doc) => !selectedIds.has(doc.id)))
    })()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedInput])

  const addTag = (tag: TagOption) => {
    const next = [...selected, tag]
    setSelected(next)
    setValue(next.map((t) => t.id))
    setInputValue('')
    setSuggestions([])
    setIsOpen(false)
  }

  const removeTag = (id: number) => {
    const next = selected.filter((tag) => tag.id !== id)
    setSelected(next)
    setValue(next.map((t) => t.id))
  }

  const createAndAddTag = async (name: string) => {
    setIsBusy(true)
    try {
      const res = await fetch(`${config.routes.api}/tags`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) return
      const data = (await res.json()) as { doc: TagOption }
      addTag({ id: data.doc.id, name: data.doc.name })
    } finally {
      setIsBusy(false)
    }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return
    event.preventDefault()

    const typed = inputValue.trim()
    if (!typed || isBusy) return

    const exactMatch = visibleSuggestions.find((tag) => tag.name.toLowerCase() === typed.toLowerCase())
    if (exactMatch) {
      addTag(exactMatch)
      return
    }
    if (visibleSuggestions.length > 0) {
      addTag(visibleSuggestions[0])
      return
    }
    void createAndAddTag(typed)
  }

  return (
    <div className="field-type" style={{ position: 'relative' }}>
      <FieldLabel label={(field?.label as string) ?? 'Tags'} path={path} required={field?.required} />

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px',
          alignItems: 'center',
          border: '1px solid var(--theme-elevation-150)',
          borderRadius: 'var(--style-radius-s)',
          padding: '6px 8px',
          background: 'var(--theme-input-bg)',
        }}
      >
        {selected.map((tag) => (
          <span
            key={tag.id}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              background: 'var(--theme-elevation-100)',
              borderRadius: 'var(--style-radius-s)',
              padding: '2px 8px',
              fontSize: '13px',
            }}
          >
            {tag.name}
            <button
              type="button"
              onClick={() => removeTag(tag.id)}
              aria-label={`Remove tag ${tag.name}`}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1 }}
            >
              ×
            </button>
          </span>
        ))}

        <input
          type="text"
          value={inputValue}
          disabled={isBusy}
          onChange={(event) => {
            setInputValue(event.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 150)}
          onKeyDown={handleKeyDown}
          placeholder={selected.length === 0 ? 'Type a tag name and press Enter…' : 'Add another…'}
          style={{ flex: 1, minWidth: '140px', border: 'none', outline: 'none', background: 'transparent' }}
        />
      </div>

      {isOpen && (visibleSuggestions.length > 0 || inputValue.trim()) ? (
        <ul
          style={{
            position: 'absolute',
            zIndex: 10,
            marginTop: '4px',
            width: '100%',
            listStyle: 'none',
            padding: '4px',
            background: 'var(--theme-input-bg)',
            border: '1px solid var(--theme-elevation-150)',
            borderRadius: 'var(--style-radius-s)',
            boxShadow: 'var(--shadow-m)',
          }}
        >
          {visibleSuggestions.map((tag) => (
            <li key={tag.id}>
              <button
                type="button"
                onClick={() => addTag(tag)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '6px 8px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {tag.name}
              </button>
            </li>
          ))}
          {inputValue.trim() && !visibleSuggestions.some((tag) => tag.name.toLowerCase() === inputValue.trim().toLowerCase()) ? (
            <li>
              <button
                type="button"
                disabled={isBusy}
                onClick={() => void createAndAddTag(inputValue.trim())}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '6px 8px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontStyle: 'italic',
                }}
              >
                + Create &quot;{inputValue.trim()}&quot;
              </button>
            </li>
          ) : null}
        </ul>
      ) : null}

      {showError ? <FieldError path={path} /> : null}
      {field?.admin?.description ? <FieldDescription description={field.admin.description as string} path={path} /> : null}
    </div>
  )
}
