// app/[username]/page.tsx
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import Image from 'next/image';
import Link from 'next/link';
import LinkButton from '../components/LinkButton';
import EditButton from '../components/EditButton';
import type { Link as LinkType, User } from '@/types';

async function getUser(username: string) {
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      links: {
        where: { enabled: true },
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!user) notFound();
  return user as User;
}

// Use the Props type directly in the component
export default async function UserPage({ params: { username } }: { params: { username: string } }) {
  const user = await getUser(username);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFCC00] to-[#FFA500] p-8">
      <EditButton username={username} />
      <div className="mx-auto max-w-2xl">
        {/* Profile Header */}
        <div className="mb-8 text-center">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name || ''}
              width={80}
              height={80}
              className="mx-auto mb-4 rounded-full"
            />
          ) : (
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-black text-2xl text-[#FFCC00]">
              {user.name?.[0]?.toUpperCase() || '?'}
            </div>
          )}
          <h1 className="mb-2 text-2xl font-bold text-black">{user.name}</h1>
        </div>

        {/* Links */}
        <div className="space-y-4">
          {user.links.map((link: LinkType) => (
            <LinkButton key={link.id} id={link.id} href={link.url} title={link.title} />
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-black/60 hover:text-black"
          >
            <Image
              src="/images/goose.svg"
              alt="TinyPM"
              width={16}
              height={16}
              className="opacity-60"
            />
            tiny.pm
          </Link>
        </div>
      </div>
    </div>
  );
}