import { getPayloadClient } from '@/lib/payload'

export const getContactPage = async () => {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'contact-page', depth: 1 })
}
