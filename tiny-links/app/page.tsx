import { Rocket, Link as LucideLink, Share2, ArrowRight } from 'lucide-react';
import Link from 'next/link'; 
import Image from 'next/image';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed z-50 w-full border-b border-black bg-[#FFCC00]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8">
              <Image src="/images/goose.svg" alt="TinyPM Logo" width={0} height={0} sizes="100vw" style={{ width: '100%', height: 'auto' }}/>
              </div>
              <span className="text-xl font-bold text-black">tiny.pm</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="rounded-lg px-4 py-2 text-black transition-colors hover:bg-black hover:text-[#FFCC00]"
              >
                Login
              </Link>
              <Link
                href="/login"
                className="rounded-lg bg-black px-4 py-2 text-[#FFCC00] transition-colors hover:bg-gray-900"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

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
            <button className="group flex items-center justify-center gap-2 rounded-lg bg-black px-8 py-4 text-lg font-medium text-[#FFCC00] transition-colors hover:bg-gray-900">
              Create Your Page
              <ArrowRight className="transition-transform group-hover:translate-x-1" />
            </button>
            <button className="rounded-lg border-2 border-black bg-[#FFCC00] px-8 py-4 text-lg font-medium text-black transition-colors hover:bg-[#FFD700]">
              See Examples
            </button>
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
      <section className="bg-[#FFE566] py-24">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-12 text-3xl font-bold text-black">Trusted by creators worldwide</h2>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="flex h-24 transform items-center justify-center rounded-lg border-2 border-black bg-white/90 shadow-lg transition-transform hover:-rotate-2"
              >
                <span className="font-medium text-black">Logo {i + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-black py-24">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="mb-6 text-4xl font-bold text-[#FFCC00]">
            Ready to centralize your online presence?
          </h2>
          <p className="mb-8 text-xl text-[#FFCC00]/80">
            Join thousands of creators who use tiny.pm to share their social media profiles
          </p>
          <button className="group mx-auto flex items-center gap-2 rounded-lg bg-[#FFCC00] px-8 py-4 text-lg font-medium text-black transition-colors hover:bg-[#FFD700]">
            Get Started — It's Free
            <ArrowRight className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-black bg-[#FFCC00] py-12 text-black">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div>
              <h3 className="mb-4 font-bold">Product</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:underline">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Examples
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-bold">Company</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:underline">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-bold">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:underline">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-bold">Social</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:underline">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Instagram
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    LinkedIn
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t-2 border-black pt-8 text-center">
            <div className="mx-auto mb-4 h-8 w-8">
              <svg viewBox="0 0 100 100" className="h-full w-full">
                <path
                  d="M35.5 70.5c-3-15-2-27.5 4.5-34.5 6-6.5 14-8.5 19-8.5 8.5 0 15 3.5 18.5 7.5 4 4.5 5.5 10 5.5 14 0 6.5-3 11.5-6.5 15-4 4-9 6.5-13 7.5-2.5.5-5.5 1-9 1-7 0-13.5-1-19-2z"
                  fill="black"
                />
              </svg>
            </div>
            <p>&copy; 2024 tiny.pm. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
