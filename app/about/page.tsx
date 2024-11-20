// app/about/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Github } from 'lucide-react';

export const metadata = {
  title: 'About | TinyPM',
};

export default function AboutPage() {
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

        <div className="rounded-lg border-2 border-black bg-white p-8">
          <div className="mb-8 text-center">
            <Image
              src="/images/goose.svg"
              alt="TinyPM Logo"
              width={80}
              height={80}
              className="mx-auto mb-4"
            />
            <h1 className="mb-4 text-4xl font-bold">About TinyPM</h1>
            <p className="text-xl text-black/80">
              A minimal link-in-bio tool for creators and professionals
            </p>
          </div>

          <div className="space-y-8">
            <section className="space-y-4">
              <h2 className="text-2xl font-bold">Our Story</h2>
              <p className="text-black/80">
                TinyPM was created by{' '}
                <a href="https://zachsi.ms" className="text-black underline">
                  Zach Sims
                </a>{' '}
                as a minimal, beautiful alternative to existing link-in-bio tools. The goal was to
                create something that was both simple to use and visually appealing.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">Features</h2>
              <ul className="list-inside list-disc space-y-2 pl-4 text-black/80">
                <li>Clean, minimal design</li>
                <li>Easy-to-use interface</li>
                <li>Click tracking</li>
                <li>Custom profiles</li>
                <li>Mobile-optimized</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">Open Source</h2>
              <p className="text-black/80">
                TinyPM is built with modern web technologies and is open source. Check out our code
                and contribute on GitHub.
              </p>
              <div className="flex gap-4">
                <a
                  href="https://github.com/Simsz/metinypm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm text-[#FFCC00] transition-transform hover:scale-105"
                >
                  <Github className="h-4 w-4" />
                  View on GitHub
                </a>
                <a
                  href="https://bsky.app/profile/tiny.pm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border-2 border-black px-4 py-2 text-sm transition-transform hover:scale-105"
                >
                  <svg
                    role="img"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                  >
                    <title>Bluesky</title>
                    <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z" />
                  </svg>
                  Follow Updates
                </a>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">Contact</h2>
              <p className="text-black/80">
                Have questions or feedback? Reach out at{' '}
                <a href="mailto:hello@tiny.pm" className="text-black underline">
                  hello@tiny.pm
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
