//tinypm/app/page.tsx

import { Rocket, Link as LucideLink, Share2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { HomeNav } from './components/HomeNav';
import TestimonialGrid from './components/TestimonialGrid';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Navigation */}
      <HomeNav />

      {/* Hero Section */}
      <section className="bg-[#FFCC00] px-4 pb-24 pt-32">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-5xl font-bold text-black sm:text-6xl">
            One link to share <br className="hidden sm:block" />
            all your socials.
          </h1>
          <p className="mb-8 text-xl text-black/80">
            Create a beautiful, customizable page that houses all your important links. Share your
            digital presence effortlessly.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/login"
              className="group flex items-center justify-center gap-2 rounded-lg bg-black px-8 py-4 text-lg font-medium text-[#FFCC00] transition-colors hover:bg-gray-900"
            >
              Create Your Page
              <ArrowRight className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/examples"
              className="rounded-lg border-2 border-black bg-[#FFCC00] px-8 py-4 text-lg font-medium text-black transition-colors hover:bg-[#FFD700]"
            >
              See Examples
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-black py-24 text-[#FFCC00]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 md:grid-cols-3">
            <div className="group text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 transform items-center justify-center rounded-lg bg-[#FFCC00] transition-transform group-hover:rotate-6">
                <LucideLink className="h-8 w-8 text-black" />
              </div>
              <h3 className="mb-3 text-2xl font-semibold">Custom Links</h3>
              <p className="text-[#FFCC00]/80">
                Add any social media profile or custom link you want to share
              </p>
            </div>
            <div className="group text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 transform items-center justify-center rounded-lg bg-[#FFCC00] transition-transform group-hover:rotate-6">
                <Share2 className="h-8 w-8 text-black" />
              </div>
              <h3 className="mb-3 text-2xl font-semibold">Easy Sharing</h3>
              <p className="text-[#FFCC00]/80">
                One simple link to share all your social media profiles
              </p>
            </div>
            <div className="group text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 transform items-center justify-center rounded-lg bg-[#FFCC00] transition-transform group-hover:rotate-6">
                <Rocket className="h-8 w-8 text-black" />
              </div>
              <h3 className="mb-3 text-2xl font-semibold">Analytics</h3>
              <p className="text-[#FFCC00]/80">Track visits and clicks to optimize your profile</p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <TestimonialGrid />

      {/* CTA Section */}
      <section className="bg-black py-24">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="mb-6 text-4xl font-bold text-[#FFCC00]">
            Ready to centralize your online presence?
          </h2>
          <p className="mb-8 text-xl text-[#FFCC00]/80">
            Join thousands of creators who use tiny.pm to share their social media profiles
          </p>
          <Link
            href="/login"
            className="group mx-auto inline-flex items-center gap-2 rounded-lg bg-[#FFCC00] px-8 py-4 text-lg font-medium text-black transition-colors hover:bg-[#FFD700]"
          >
            Get Started — It&apos;s Free
            <ArrowRight className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-black bg-[#FFCC00] py-12 text-black">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-y-8 text-center md:grid-cols-4 md:gap-x-12 md:gap-y-0">
            <div className="flex flex-col">
              <h3 className="mb-4 font-bold">Product</h3>
              <ul className="flex flex-1 flex-col space-y-2">
                <li>
                  <Link href="/pricing" className="hover:underline">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/examples" className="hover:underline">
                    Examples
                  </Link>
                </li>
                <li>
                  <a
                    href="https://status.tiny.pm"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    Site Status
                  </a>
                </li>
              </ul>
            </div>
            <div className="flex flex-col">
              <h3 className="mb-4 font-bold">Company</h3>
              <ul className="flex flex-1 flex-col space-y-2">
                <li>
                  <Link href="/about" className="hover:underline">
                    About
                  </Link>
                </li>
                <li>
                  <a
                    href="https://zachsi.ms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a href="mailto:hello@tiny.pm" className="hover:underline">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div className="flex flex-col">
              <h3 className="mb-4 font-bold">Legal</h3>
              <ul className="flex flex-1 flex-col space-y-2">
                <li>
                  <Link href="/privacy" className="hover:underline">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:underline">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
            <div className="flex flex-col">
              <h3 className="mb-4 font-bold">Social</h3>
              <ul className="flex flex-1 flex-col space-y-2">
                <li>
                  <a
                    href="https://bsky.app/profile/tiny.pm"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    BlueSky
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/Simsz/metinypm"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    GitHub
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.linkedin.com/in/zachesims/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    LinkedIn
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t-2 border-black pt-8 text-center">
            <div className="mx-auto mb-4 h-8 w-8">
              <Image
                src="/images/goose.svg"
                alt="TinyPM Logo"
                width={0}
                height={0}
                sizes="100vw"
                style={{ width: '100%', height: 'auto' }}
              />
            </div>
            <p>&copy; {new Date().getFullYear()} tiny.pm. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
