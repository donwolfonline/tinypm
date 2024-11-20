// app/privacy/page.tsx
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | TinyPM'
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#FFCC00]">
      <div className="mx-auto max-w-3xl px-4 py-16">
        <Link 
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-black/60 hover:text-black"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
        
        <h1 className="mb-8 text-4xl font-bold">Privacy Policy</h1>
        
        <div className="space-y-6 rounded-lg border-2 border-black bg-white p-8 text-black/80">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-black">Information We Collect</h2>
            <p>When you use TinyPM, we collect:</p>
            <ul className="list-inside list-disc space-y-2 pl-4">
              <li>Information you provide (name, email, profile links)</li>
              <li>Authentication data through Google sign-in</li>
              <li>Usage statistics (page views, link clicks)</li>
              <li>Technical information (browser type, device info)</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-black">How We Use Your Information</h2>
            <p>We use collected information to:</p>
            <ul className="list-inside list-disc space-y-2 pl-4">
              <li>Provide and maintain TinyPM services</li>
              <li>Improve user experience</li>
              <li>Analyze service usage and performance</li>
              <li>Communicate service updates</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-black">Data Security</h2>
            <p>
              We implement security measures to protect your personal information. However, 
              no method of transmission over the Internet is 100% secure, and we cannot 
              guarantee absolute security.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-black">Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-inside list-disc space-y-2 pl-4">
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of communications</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-black">Contact Us</h2>
            <p>
              For privacy-related questions, contact us at{' '}
              <a href="mailto:privacy@tiny.pm" className="text-black underline">
                privacy@tiny.pm
              </a>
            </p>
          </section>

          <p className="text-sm text-black/60">
            Last updated: {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>
    </main>
  );
}