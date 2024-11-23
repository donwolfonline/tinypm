// app/[username]/qr/page.tsx
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { getThemeStyles } from '@/lib/themes';
import { QRCodeDisplay } from './QRCodeDisplay';

async function getUser(username: string) {
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      name: true,
      image: true,
      theme: true,
      username: true,
    },
  });

  if (!user || !user.username) notFound();
  
  return {
    ...user,
    username: user.username,
    theme: user.theme || 'YELLOW'
  };
}

type PageProps = {
  params: Promise<{ username: string }>;
};

export default async function QRPage(props: PageProps) {
  const { username } = await props.params;
  const user = await getUser(username);

  return (
    <div className="min-h-screen p-8" style={getThemeStyles(user.theme)}>
      <QRCodeDisplay user={user} />
    </div>
  );
}