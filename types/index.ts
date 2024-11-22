// types/index.ts

export interface Link {
  id: string;
  title: string;
  url: string;
  enabled: boolean;
  emoji?: string | null;
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
  theme?: Theme | null;
  links: Link[];
  pageTitle?: string | null;
  pageDesc?: string | null;
  createdAt: Date;
  updatedAt: Date;
  emailVerified: Date | null;
}

export interface Session {
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    username?: string | null;
    theme?: Theme | null;
  };
}

export const Themes = {
  YELLOW: 'YELLOW',
  BLUE: 'BLUE',
  GREEN: 'GREEN',
  PURPLE: 'PURPLE',
  DARK: 'DARK',
  DAISY: 'DAISY',
  ROSE: 'ROSE',
  SLATE: 'SLATE',
} as const;

export type Theme = (typeof Themes)[keyof typeof Themes];
