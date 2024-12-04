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

export interface CustomDomain {
  id: string;
  domain: string;
  userId: string;
  status: 'PENDING' | 'DNS_VERIFICATION' | 'ACTIVE' | 'FAILED' | 'SUSPENDED';
  verificationCode: string;
  verifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  primary: boolean;
}

export type ContentType = 'LINK' | 'TITLE' | 'DIVIDER' | 'TEXT';

interface BaseContent {
  id: string;
  type: ContentType;
  order: number;
  enabled: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LinkContent extends BaseContent {
  type: 'LINK';
  title: string;
  url: string;
  emoji?: string | null;
  clicks: number;
}

export interface TitleContent extends BaseContent {
  type: 'TITLE';
  title: string;
  emoji?: string | null;
}

export interface DividerContent extends BaseContent {
  type: 'DIVIDER';
}

export interface TextContent extends BaseContent {
  type: 'TEXT';
  text: string;
}

export type Content = LinkContent | TitleContent | DividerContent | TextContent;

// Update User interface to include both links and content
export interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  username: string | null;
  theme?: Theme | null;
  content: Content[];
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
