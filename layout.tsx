export const metadata = {
  title: "高齢者虐待防止・権利擁護 e-learning",
  description: "社内向けe-learning（全20問から15問ランダム出題）",
};

import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
