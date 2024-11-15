import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Provider";


const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  weight: ["400", "700"], 
});

export const metadata: Metadata = {
  title: "Daily Journee",
  description: "Elevate your journaling experience with AI-powered insights and seamless organization.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${nunito.variable} antialiased font-sans`}>
        
         <Providers>
          {children}
          </Providers>
  
      </body>
    </html>
  );
}
