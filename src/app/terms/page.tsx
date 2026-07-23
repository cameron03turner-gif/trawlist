import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service | Trawlist',
  description: 'Terms of Service governing the use of Trawlist website, services, and browser extension.',
}

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto py-8 sm:py-12 px-4 space-y-8">
      {/* Header */}
      <div className="border-b border-amber/30 pb-6">
        <h1 className="text-3xl font-bold font-display text-ink tracking-tight mb-2">Terms of Service</h1>
        <p className="text-xs text-muted">Effective Date: July 22, 2026 | Last updated: July 22, 2026</p>
      </div>

      {/* Main Legal Content */}
      <div className="space-y-8 text-ink/90 text-sm leading-relaxed">
        
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold font-display text-ink flex items-center gap-2">
            1. Agreement to Terms
          </h2>
          <p>
            Welcome to <strong>Trawlist</strong> (&quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). These Terms of Service (&quot;Terms&quot;) constitute a legally binding agreement between you (&quot;User,&quot; &quot;you,&quot; or &quot;your&quot;) and Trawlist regarding your access to and use of the Trawlist website located at <span className="text-amber">trawlist.com</span>, our browser extensions, mobile applications, APIs, and all associated services (collectively, the &quot;Service&quot;).
          </p>
          <p>
            By creating an account, accessing our site, downloading or installing the Trawlist Chrome Extension, or using any part of the Service, you confirm that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. If you do not agree with all of these Terms, you are expressly prohibited from using the Service and must discontinue use immediately.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3 pt-4 border-t border-amber/20">
          <h2 className="text-lg font-bold font-display text-ink flex items-center gap-2">
            2. Eligibility & Account Registration
          </h2>
          <p>
            You must be at least 13 years of age (or the legal age of majority in your jurisdiction) to use Trawlist. By using the Service, you represent and warrant that you meet these eligibility requirements.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-muted text-xs">
            <li><strong>Account Accuracy:</strong> You agree to provide accurate, current, and complete information during registration (whether registering via email or Google OAuth).</li>
            <li><strong>Account Security:</strong> You are solely responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</li>
            <li><strong>Notification of Breach:</strong> You agree to notify us immediately at <span className="text-amber">support@trawlist.com</span> of any unauthorized access to or use of your account.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3 pt-4 border-t border-amber/20">
          <h2 className="text-lg font-bold font-display text-ink flex items-center gap-2">
            3. User-Generated Content (UGC) & Licenses
          </h2>
          <p>
            Trawlist allows users to log watch activity, rate videos, write public reviews, keep private notes, create custom playlists (&quot;Lists&quot;), and upload profile avatars (collectively, &quot;User Content&quot;).
          </p>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-ink">3.1 Ownership & License Grant</h3>
            <p>
              You retain all ownership rights in your User Content. However, by submitting, posting, or displaying User Content on or through the Service, you grant Trawlist a worldwide, non-exclusive, royalty-free, perpetual, sublicensable, and transferable license to use, reproduce, modify, adapt, publish, translate, create derivative works from, distribute, and display such User Content across our platform and marketing materials.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-ink">3.2 Content Responsibilities & Warranties</h3>
            <p>You represent and warrant that:</p>
            <ul className="list-disc pl-5 space-y-1 text-muted text-xs">
              <li>You own or have obtained all necessary rights, licenses, and permissions to post your User Content.</li>
              <li>Your User Content does not infringe, misappropriate, or violate any third-party intellectual property, privacy, publicity, or proprietary rights.</li>
              <li>Your User Content does not contain material that is unlawful, defamatory, abusive, obscene, discriminatory, harassing, or hate speech.</li>
            </ul>
          </div>
        </section>

        {/* Section 4 */}
        <section className="space-y-3 pt-4 border-t border-amber/20">
          <h2 className="text-lg font-bold font-display text-ink flex items-center gap-2">
            4. Acceptable Use & Prohibited Conduct
          </h2>
          <p>
            You agree to use Trawlist strictly for personal, non-commercial, and lawful social video logging purposes. You agree <strong>NOT</strong> to:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-muted">
            <li>Engage in automated data scraping, crawling, indexing, or harvesting of platform content without explicit written consent from Trawlist.</li>
            <li>Artificially manipulate video ratings, review scores, upvotes, or follower counts using bots, automated scripts, or fake accounts.</li>
            <li>Post spam, commercial advertisements, affiliate marketing links, or unauthorized solicitations in reviews, notes, or list descriptions.</li>
            <li>Attempt to probe, scan, or test the vulnerability of Trawlist servers, databases, or API infrastructure.</li>
            <li>Impersonate any individual, creator, brand, or entity, or misrepresent your affiliation with a person or entity.</li>
            <li>Interfere with or disrupt the operation of the Service, servers, or networks connected to the Service.</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section className="space-y-3 pt-4 border-t border-amber/20">
          <h2 className="text-lg font-bold font-display text-ink flex items-center gap-2">
            5. Browser Extension & Third-Party Platforms
          </h2>
          <p>
            Trawlist offers a Chrome Browser Extension designed to enhance your video logging experience directly on YouTube.
          </p>
          <div className="bg-surface-alt border border-amber/30 rounded-xl p-4 space-y-2 text-xs">
            <h3 className="font-semibold text-amber uppercase tracking-wider">Trademark & Affiliation Disclaimer</h3>
            <p className="text-ink/90">
              YouTube™ is a registered trademark of Google LLC. Trawlist is an independent social tracking platform and extension, and is <strong>NOT</strong> affiliated with, associated with, authorized by, endorsed by, or in any way officially connected with Google LLC, YouTube, or any of their subsidiaries.
            </p>
          </div>
          <p className="text-xs text-muted">
            The extension operates solely by reading YouTube video IDs and active video page titles to display and save your personal watch log. Trawlist does not monitor or store browsing history outside of YouTube.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-3 pt-4 border-t border-amber/20">
          <h2 className="text-lg font-bold font-display text-ink flex items-center gap-2">
            6. Intellectual Property Rights
          </h2>
          <p>
            The Service and its original content, features, layout, branding, logos, visual graphics, computer code, software, and interactive tools are the exclusive property of Trawlist and its licensors, protected by international copyright, trademark, trade secret, and other intellectual property laws.
          </p>
        </section>

        {/* Section 7 */}
        <section className="space-y-3 pt-4 border-t border-amber/20">
          <h2 className="text-lg font-bold font-display text-ink flex items-center gap-2">
            7. DMCA & Copyright Infringement Policy
          </h2>
          <p>
            We respect the intellectual property rights of others. If you believe that any content hosted on Trawlist infringes upon your copyright, please send a written notification to our designated Copyright Agent at <span className="text-amber font-semibold">legal@trawlist.com</span> containing the following details:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-muted">
            <li>Identification of the copyrighted work claimed to have been infringed.</li>
            <li>Identification of the material claimed to be infringing and its location (URL) on Trawlist.</li>
            <li>Your contact information (name, address, telephone number, and email address).</li>
            <li>A statement that you have a good faith belief that the use of the material is not authorized.</li>
            <li>A statement under penalty of perjury that the information in the notification is accurate.</li>
          </ul>
        </section>

        {/* Section 8 */}
        <section className="space-y-3 pt-4 border-t border-amber/20">
          <h2 className="text-lg font-bold font-display text-ink flex items-center gap-2">
            8. Disclaimer of Warranties
          </h2>
          <p className="uppercase text-xs font-semibold text-amber">
            PLEASE READ THIS SECTION CAREFULLY AS IT LIMITS OUR LIABILITY.
          </p>
          <p>
            THE SERVICE IS PROVIDED ON AN <strong>&quot;AS IS&quot;</strong> AND <strong>&quot;AS AVAILABLE&quot;</strong> BASIS WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, OR COURSE OF PERFORMANCE.
          </p>
          <p className="text-xs text-muted">
            TRAWLIST DOES NOT WARRANT THAT (A) THE SERVICE WILL FUNCTION UNINTERRUPTED, SECURE, OR ERROR-FREE; (B) ANY DEFECTS OR ERRORS WILL BE CORRECTED; (C) THE SERVICE IS FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS; OR (D) THE RESULTS OBTAINED FROM USING THE SERVICE WILL BE ACCURATE OR RELIABLE.
          </p>
        </section>

        {/* Section 9 */}
        <section className="space-y-3 pt-4 border-t border-amber/20">
          <h2 className="text-lg font-bold font-display text-ink flex items-center gap-2">
            9. Limitation of Liability
          </h2>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL TRAWLIST, ITS DIRECTORS, EMPLOYEES, PARTNERS, AGENTS, OR AFFILIATES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM (I) YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICE; (II) ANY CONDUCT OR CONTENT OF ANY THIRD PARTY ON THE SERVICE; (III) ANY CONTENT OBTAINED FROM THE SERVICE; OR (IV) UNAUTHORIZED ACCESS, USE, OR ALTERATION OF YOUR TRANSMISSIONS OR CONTENT.
          </p>
        </section>

        {/* Section 10 */}
        <section className="space-y-3 pt-4 border-t border-amber/20">
          <h2 className="text-lg font-bold font-display text-ink flex items-center gap-2">
            10. Indemnification
          </h2>
          <p>
            You agree to defend, indemnify, and hold harmless Trawlist, its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, costs, or expenses (including reasonable attorney fees) arising out of or in any way connected with (a) your access to or use of the Service; (b) your User Content; or (c) your violation of these Terms or applicable law.
          </p>
        </section>

        {/* Section 11 */}
        <section className="space-y-3 pt-4 border-t border-amber/20">
          <h2 className="text-lg font-bold font-display text-ink flex items-center gap-2">
            11. Account Termination & Deletion
          </h2>
          <p>
            <strong>Voluntary Account Deletion:</strong> You may delete your account at any time directly through your account Settings under &quot;Delete Account.&quot; Upon deletion, your profile data, ratings, reviews, notes, and activity history will be permanently deleted from our primary databases.
          </p>
          <p>
            <strong>Termination by Trawlist:</strong> We reserve the right, in our sole discretion, to suspend or terminate your account or restrict access to the Service at any time, with or without notice, for conduct that we believe violates these Terms or is harmful to other users or the platform.
          </p>
        </section>

        {/* Section 12 */}
        <section className="space-y-3 pt-4 border-t border-amber/20">
          <h2 className="text-lg font-bold font-display text-ink flex items-center gap-2">
            12. Modifications to Terms & Service
          </h2>
          <p>
            We reserve the right to modify or replace these Terms at any time in our sole discretion. We will provide notice of significant changes by updating the &quot;Last updated&quot; date at the top of this page. Your continued use of the Service following the posting of any changes constitutes acceptance of those changes.
          </p>
        </section>

        {/* Section 13 */}
        <section className="space-y-3 pt-4 border-t border-amber/20">
          <h2 className="text-lg font-bold font-display text-ink flex items-center gap-2">
            13. Governing Law & Dispute Resolution
          </h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of your applicable jurisdiction, without regard to its conflict of law principles. Any legal action or proceeding arising under these Terms shall be resolved through informal negotiations prior to initiating formal litigation.
          </p>
        </section>

        {/* Section 14 */}
        <section className="space-y-3 pt-4 border-t border-amber/20">
          <h2 className="text-lg font-bold font-display text-ink flex items-center gap-2">
            14. Contact Information
          </h2>
          <p>
            If you have any questions, concerns, or legal inquiries regarding these Terms of Service, please contact us at:
          </p>
          <div className="bg-surface-alt border border-amber/20 rounded-xl p-4 text-xs space-y-1">
            <p className="font-semibold text-ink">Trawlist Legal Support</p>
            <p className="text-muted">Email: <span className="text-amber font-semibold">legal@trawlist.com</span> or <span className="text-amber font-semibold">support@trawlist.com</span></p>
            <p className="text-muted">Website: <Link href="/" className="text-amber hover:underline">https://www.trawlist.com</Link></p>
          </div>
        </section>
      </div>

      {/* Footer Back Link */}
      <div className="pt-6 border-t border-amber/30 flex items-center justify-between text-xs">
        <Link href="/" className="text-amber font-semibold hover:underline">
          &larr; Back to Trawlist Home
        </Link>
        <Link href="/privacy" className="text-muted hover:text-ink transition">
          Privacy Policy
        </Link>
      </div>
    </div>
  )
}
