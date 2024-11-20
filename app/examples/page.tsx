// app/examples/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Examples | TinyPM',
};

const EXAMPLE_PROFILES = [
  {
    username: 'zach',
    name: 'Zach Sims',
    role: 'Creator of TinyPM',
    image: '/images/goose.svg',
    bio: 'Developer, designer, and creator of TinyPM',
  },
  {
    username: 'sarah',
    name: 'Sarah Chen',
    role: 'Food Blogger',
    image: '/images/goose.svg',
    bio: 'Sharing delicious recipes and food photography',
  },
  {
    username: 'alex',
    name: 'Alex Rodriguez',
    role: 'Fitness Coach',
    image: '/images/goose.svg',
    bio: 'Helping you achieve your fitness goals',
  },
];

export default function ExamplesPage() {
  return (
    <main className="min-h-screen bg-[#FFCC00]">
      <div className="mx-auto max-w-4xl px-4 py-16">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-black/60 hover:text-black"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold">Example Profiles</h1>
          <p className="text-xl text-black/80">
            See how others are using TinyPM to share their online presence
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {EXAMPLE_PROFILES.map(profile => (
            <Link
              key={profile.username}
              href={`/${profile.username}`}
              className="group relative overflow-hidden rounded-lg border-2 border-black bg-white p-6 transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mb-4 flex items-center gap-4">
                <Image
                  src={profile.image}
                  alt={profile.name}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
                <div>
                  <h2 className="font-bold">{profile.name}</h2>
                  <p className="text-sm text-black/60">{profile.role}</p>
                </div>
              </div>
              <p className="mb-4 text-black/80">{profile.bio}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-black/60">@{profile.username}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-lg bg-black px-6 py-3 text-[#FFCC00] transition-colors hover:bg-gray-900"
          >
            Create Your Profile
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}
