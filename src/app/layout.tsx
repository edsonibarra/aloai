import type { Metadata } from "next";
import { Chakra_Petch, Exo_2, JetBrains_Mono } from "next/font/google";
import { MotionProvider } from "@/components/MotionProvider";
import "./globals.css";

const display = Chakra_Petch({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});
const body = Exo_2({ variable: "--font-body", subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const code = JetBrains_Mono({ variable: "--font-code", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AloAI: Ace Senior Python Interviews",
  description:
    "AloAI is the way to ace senior Python technical interviews, with questions curated by expert Python software engineers. Level up with Alo, your AI tutor.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} ${code.variable}`}>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
