import { ClientModal } from './ClientModal'

export default async function InterceptedVideoPageLocal({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  return <ClientModal id={resolvedParams.id} />
}
