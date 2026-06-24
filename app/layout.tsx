import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "histori. | 認知症ケアのためのデジタル回想法",
  description: "大切な人の記憶を、物語に。認知症ケアのためのデジタル回想法プラットフォーム。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full">
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
