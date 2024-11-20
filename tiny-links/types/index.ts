// types/index.ts
export interface Link {
  id: string;
  title: string;
  url: string;
  enabled: boolean;
  order: number;
  clicks: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  username: string | null;
  links: Link[];
}

export interface Session {
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    username?: string | null;
  };
}
