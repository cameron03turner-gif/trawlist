import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service | Trawlist',
  description: 'Terms of Service for Trawlist',
}

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-display text-ink mb-2">Terms of Service</h1>
        <p className="text-sm text-muted">Last updated: July 22, 2026</p>
      </div>

      <div className="space-y-6 text-ink/90 text-sm leading-relaxed border-t border-amber/30 pt-6">
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-ink">1. Agreement to Terms</h2>
          <p>
            By accessing or using Trawlist, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-ink">2. User Accounts</h2>
          <p>
            You are responsible for maintaining the security of your account and password. Trawlist cannot and will not be liable for any loss or damage from your failure to comply with this security obligation.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-ink">3. Acceptable Use</h2>
          <p>
            You agree not to post objectionable content, engage in harassment, or use the service for unauthorized commercial purposes.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-ink">4. Termination</h2>
          <p>
            You may delete your account at any time. We reserve the right to suspend or terminate accounts that violate our terms.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-ink">5. Contact Information</h2>
          <p>
            Questions about the Terms of Service should be sent to support@trawlist.com.
          </p>
        </section>
      </div>

      <div className="pt-6 border-t border-amber/30">
        <Link href="/" className="text-xs text-amber font-semibold hover:underline">
          &larr; Back to Trawlist Home
        </Link>
      </div>
    </div>
  )
}
