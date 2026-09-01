import { Container } from './ui/Container'
import { Button } from './ui/Button'

export const ComingSoon = ({ title, description }: { title: string; description: string }) => (
  <Container className="flex flex-col items-start gap-4 py-16 sm:py-24">
    <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent-dark">
      Coming soon
    </span>
    <h1 className="text-3xl font-extrabold text-ink sm:text-4xl">{title}</h1>
    <p className="max-w-xl text-base text-muted">{description}</p>
    <Button href="/news" variant="ghost">
      Read the latest news
    </Button>
  </Container>
)
