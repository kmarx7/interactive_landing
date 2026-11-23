import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'ILS — Interactive Landing Studio',
  description: '콘텐츠에서 경험으로. 코딩 없이 만드는 인터랙티브 랜딩페이지.',
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
