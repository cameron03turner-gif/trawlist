import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Log | Trawlist',
}

export default function LogLayout({ children }: { children: React.ReactNode }) {
  return children
}
