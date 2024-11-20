import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma' // Update the import path based on your file structure
import Image from 'next/image'

// Define the Link type
type Link = {
  id: string
  title: string
  url: string
  enabled: boolean
  order: number
}

// Define the User type
type User = {
  id: string
  name: string | null
  email: string | null
  image: string | null
  username: string | null
  links: Link[]
}

async function getUser(username: string) {
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      links: {
        where: { enabled: true },
        orderBy: { order: 'asc' },
      },
    },
  })

  if (!user) notFound()
  return user as User
}

export default async function UserPage({ params }: { params: { username: string } }) {
  const user = await getUser(params.username)

  const handleLinkClick = async (linkId: string) => {
    await fetch(`/api/links/${linkId}/click`, { method: 'POST' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFCC00] to-[#FFA500] p-8">
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
          {user.links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleLinkClick(link.id)}
              className="block rounded-lg border-2 border-black bg-white p-4 text-center text-lg font-medium shadow-md transition-transform hover:-translate-y-0.5 hover:shadow-lg"
            >
              {link.title}
            </a>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm text-black/60 hover:text-black"
          >
            <Image 
              src="/images/TinyPM.svg" 
              alt="TinyPM" 
              width={16} 
              height={16} 
              className="opacity-60" 
            />
            tiny.pm
          </a>
        </div>
      </div>
    </div>
  )
}