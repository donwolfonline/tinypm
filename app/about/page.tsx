// app/about/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Github, Twitter } from 'lucide-react';

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
                  href="https://github.com/yourusername/tinypm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm text-[#FFCC00]"
                >
                  <Github className="h-4 w-4" />
                  View on GitHub
                </a>
                <a
                  href="https://twitter.com/yourusername"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border-2 border-black px-4 py-2 text-sm"
                >
                  <Twitter className="h-4 w-4" />
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
