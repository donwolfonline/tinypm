// components/ContentRenderer.tsx
import { Content, Theme } from '@/types';
import LinkButton from './LinkButton';
import { themes } from '@/lib/themes';

interface TitleBlockProps {
  title: string;
  emoji?: string | null;
  theme: Theme;
}

function TitleBlock({ title, emoji, theme }: TitleBlockProps) {
  const themeConfig = themes[theme];
  return (
    <div className={`text-center mb-4 ${themeConfig.text}`}>
      {emoji && <span className="text-2xl mb-2 block">{emoji}</span>}
      <h2 className="text-xl font-bold">{title}</h2>
    </div>
  );
}

interface TextBlockProps {
  text: string;
  theme: Theme;
}

function TextBlock({ text, theme }: TextBlockProps) {
  const themeConfig = themes[theme];
  return (
    <div className={`mb-4 ${themeConfig.text}`}>
      <p className="text-center whitespace-pre-wrap">{text}</p>
    </div>
  );
}

interface DividerProps {
  theme: Theme;
}

function Divider({ theme }: DividerProps) {
  const themeConfig = themes[theme];
  return (
    <div className="my-4">
      <hr className={`border-t-2 ${themeConfig.buttonBorder}`} />
    </div>
  );
}

interface ContentRendererProps {
  content: Content[];
  theme: Theme;
}

export function ContentRenderer({ content, theme }: ContentRendererProps) {
  return (
    <div className="space-y-4">
      {content.map((item) => {
        switch (item.type) {
          case 'LINK':
            return (
              <LinkButton
                key={item.id}
                id={item.id}
                href={item.url}
                title={item.title}
                theme={theme}
                emoji={item.emoji}
              />
            );
          case 'TITLE':
            return (
              <TitleBlock
                key={item.id}
                title={item.title}
                emoji={item.emoji}
                theme={theme}
              />
            );
          case 'TEXT':
            return (
              <TextBlock
                key={item.id}
                text={item.text}
                theme={theme}
              />
            );
          case 'DIVIDER':
            return <Divider key={item.id} theme={theme} />;
          default:
            return null;
        }
      })}
    </div>
  );
}