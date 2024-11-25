// app/[username]/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import Image from 'next/image';
import Link from 'next/link';
import { themes, getThemeStyles } from '@/lib/themes';
import type { Content, User, ContentType } from '@/types';
import EditButton from '../components/EditButton';
import { unstable_cache } from 'next/cache';
import { ProxiedImage } from '../components/ProxiedImage';
import { ContentRenderer } from '../components/ContentRenderer';

type PageParams = Promise<{ username: string }>;

type PrismaContent = {
  id: string;
  type: ContentType;
  title: string | null;
  url: string | null;
  text: string | null;
  emoji: string | null;
  enabled: boolean;
  order: number;
  clicks: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

// In your UserPage's generateMetadata function
export async function generateMetadata(props: { params: PageParams }): Promise<Metadata> {
  const { username } = await props.params;
  const user = await getUser(username);
  const userTheme = user.theme || 'YELLOW';
  const themeConfig = themes[userTheme];

  return {
    title: user.pageTitle || `${user.name || username} | tiny.pm`,
    description: user.pageDesc || `Check out ${user.name || username}'s links on tiny.pm`,
    openGraph: {
      title: user.pageTitle || `${user.name || username} | tiny.pm`,
      description: user.pageDesc || `Check out ${user.name || username}'s links on tiny.pm`,
    },
    twitter: {
      title: user.pageTitle || `${user.name || username} | tiny.pm`,
      description: user.pageDesc || `Check out ${user.name || username}'s links on tiny.pm`,
    },
    // Add themeColor to metadata
    themeColor: themeConfig.themeColor || '#FFCC00',
  };
}

function transformPrismaContent(prismaContent: PrismaContent[]): Content[] {
  return prismaContent.map(item => {
    const base = {
      id: item.id,
      type: item.type,
      order: item.order,
      enabled: item.enabled,
      userId: item.userId,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };

    switch (item.type) {
      case 'LINK':
        return {
          ...base,
          type: 'LINK' as const,
          title: item.title || '',
          url: item.url || '',
          emoji: item.emoji,
          clicks: item.clicks,
        };
      case 'TITLE':
        return {
          ...base,
          type: 'TITLE' as const,
          title: item.title || '',
          emoji: item.emoji,
        };
      case 'TEXT':
        return {
          ...base,
          type: 'TEXT' as const,
          text: item.text || '',
        };
      case 'DIVIDER':
        return {
          ...base,
          type: 'DIVIDER' as const,
        };
      default:
        throw new Error(`Unknown content type: ${item.type}`);
    }
  });
}

const getCachedUser = (username: string) =>
  unstable_cache(
    async () => {
      const user = await prisma.user.findUnique({
        where: { username },
        include: {
          content: {
            where: { enabled: true },
            orderBy: { order: 'asc' },
            select: {
              id: true,
              type: true,
              title: true,
              url: true,
              text: true,
              emoji: true,
              enabled: true,
              order: true,
              clicks: true,
              userId: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });

      if (!user) return null;

      return {
        ...user,
        content: transformPrismaContent(user.content),
      };
    },
    [`user-${username}`],
    {
      revalidate: 60,
      tags: [`user-${username}`],
    }
  )();

async function getUser(username: string): Promise<User> {
  const user = await getCachedUser(username);
  if (!user) notFound();
  return user;
}

// For the page component, we also await the params
export default async function UserPage(props: { params: PageParams }) {
  const { username } = await props.params;
  const user = await getUser(username);
  const userTheme = user.theme || 'YELLOW';
  const themeConfig = themes[userTheme];

  return (
    <div className="min-h-screen p-8" style={getThemeStyles(userTheme)}>
      <EditButton username={username} theme={userTheme} />
      <div className="mx-auto max-w-2xl">
        {/* Profile Header */}
        <div className="mb-8 text-center">
          {user.image ? (
            <ProxiedImage
              src={user.image}
              alt={user.name || ''}
              width={80}
              height={80}
              className="mx-auto mb-4 rounded-full border-2 shadow-lg"
              style={{ borderColor: themeConfig.buttonBg === 'bg-white' ? 'white' : 'black' }}
            />
          ) : (
            <div
              className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border-2 text-xl font-bold shadow-lg ${themeConfig.buttonBg} ${themeConfig.buttonText} ${themeConfig.buttonBorder}`}
            >
              {user.name?.[0]?.toUpperCase() || '?'}
            </div>
          )}
          <h1 className={`mb-2 text-2xl font-bold ${themeConfig.text}`}>{user.name}</h1>
        </div>

        {/* Content */}
        <ContentRenderer content={user.content} theme={userTheme} />

        {/* Footer */}
        {/* Footer */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className={`inline-flex items-center gap-2 text-sm ${themeConfig.subtext} hover:${themeConfig.text} group transform transition-all duration-200 hover:-translate-y-1`}
          >
            <Image
              src="/images/goose.svg"
              alt="TinyPM"
              width={16}
              height={16}
              className={`${themeConfig.text} opacity-60 transition-all duration-200 group-hover:scale-110 group-hover:opacity-100`}
            />
            <span>tiny.pm</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
