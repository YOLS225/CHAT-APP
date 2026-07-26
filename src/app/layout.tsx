import type { Metadata } from "next";
import {Poppins} from "next/font/google";
import "./globals.css";
import { Providers } from "./core/providers";
import {Toaster} from "@/app/core/components/ui/sonner";


const poppins = Poppins({
    variable: '--font-poppins',
    subsets:['latin'],
    weight:['100','200','300','400','500','600','700','800','900'],
})
export const metadata: Metadata = {
  title: "Parley",
  description: "Application de messagerie pour conversations directes et salles de groupe",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${poppins.variable} antialiased`}
      >
        <Providers>
            <Toaster />
          {children}
        </Providers>
      </body>
    </html>
  );
}
