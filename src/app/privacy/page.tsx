import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy | Trawlist',
  description: 'Privacy Policy for Trawlist',
}

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-display text-ink mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted">Last updated: July 22, 2026</p>
      </div>

      <div className="space-y-6 text-ink/90 text-sm leading-relaxed border-t border-border pt-6">
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-ink">1. Information We Collect</h2>
          <p>
            When you create an account on Trawlist, we collect basic account information including your email address, display name, username, and profile picture. If you authenticate using Google Sign-In, we receive your email address and profile picture from Google.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-ink">2. How We Use Your Information</h2>
          <p>
            We use your information solely to provide and improve the Trawlist social platform, enable profile customization, track your video watch activity and ratings, and generate personalized recommendations. We do not sell your personal data to third parties.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-ink">3. Data Retention and Account Deletion</h2>
          <p>
            Your profile data and activity are stored securely. You can delete your account at any time directly through your account Settings, which permanently removes all your profile data, ratings, reviews, and activity from our servers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-ink">4. Third-Party Services</h2>
          <p>
            We use Supabase for authentication and database management, and Google OAuth for user authentication. Your data is handled in accordance with their respective security and privacy practices.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-ink">5. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at support@trawlist.com.
          </p>
        </section>
      </div>

      <div className="pt-6 border-t border-border">
        <Link href="/" className="text-xs text-amber font-semibold hover:underline">
          &larr; Back to Trawlist Home
        </Link>
      </div>
    </div>
  )
}
