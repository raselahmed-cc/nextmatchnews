// Replaces Payload's default wordmark on the admin login screen with the
// site's own brand — same "NextMatch" + accent "News" treatment used in
// the frontend header (see src/components/Header.tsx). `--theme-elevation-1000`
// is Payload's own text-color token, so this stays legible if the admin
// theme is ever switched to light mode.
export const Logo = () => (
  <span
    style={{
      fontFamily: 'ui-sans-serif, system-ui, sans-serif',
      fontSize: '28px',
      fontWeight: 800,
      letterSpacing: '-0.02em',
      textTransform: 'uppercase',
      color: 'var(--theme-elevation-1000)',
      whiteSpace: 'nowrap',
    }}
  >
    NextMatch<span style={{ color: '#ea580c' }}>News</span>
  </span>
)
