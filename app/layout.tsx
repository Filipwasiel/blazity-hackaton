import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "One Idea, Every Format",
  description:
    "Expand a single content idea into a tweet, LinkedIn post, newsletter, article outline, video script, and image prompt.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
