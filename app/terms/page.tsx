// app/terms/page.tsx
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service | TinyPM'
};

export default function TermsPage() {
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
        
        <h1 className="mb-8 text-4xl font-bold">Terms of Service</h1>
        
        <div className="space-y-6 rounded-lg border-2 border-black bg-white p-8 text-black/80">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-black">1. Acceptance of Terms</h2>
            <p>
              By accessing TinyPM, you agree to be bound by these Terms of Service
              and our Privacy Policy. If you disagree with any part of these terms,
              you may not access the service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-black">2. Account Terms</h2>
            <ul className="list-inside list-disc space-y-2 pl-4">
              <li>You must be 13 years or older to use this service</li>
              <li>You must provide accurate information during registration</li>
              <li>You are responsible for maintaining account security</li>
              <li>You must not use the service for any illegal purposes</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-black">3. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-inside list-disc space-y-2 pl-4">
              <li>Share harmful or malicious content</li>
              <li>Impersonate others</li>
              <li>Abuse or exploit the service</li>
              <li>Violate any applicable laws or regulations</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-black">4. Termination</h2>
            <p>
              We reserve the right to terminate or suspend access to our service
              immediately, without prior notice, for any violation of these Terms.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-black">5. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. We will notify
              users of any material changes via email or service notification.
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