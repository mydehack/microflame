import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Flame in Freefall — AI-Assisted Microgravity Combustion Research Platform",
  description:
    "An advanced scientific research platform for investigating, simulating, and visualizing combustion kinetics, droplet burning, and flame behavior under microgravity and freefall conditions.",
  keywords: [
    "Microgravity Combustion",
    "NASA FLEX",
    "Freefall Simulation",
    "Droplet Burning",
    "Cantera",
    "CFD",
    "Flame Physics",
    "Chemical Kinetics",
    "Spacecraft Fire Safety",
  ],
  authors: [{ name: "Flame in Freefall Scientific Software Team" }],
};

export const viewport: Viewport = {
  themeColor: "#070F21",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#070F21] text-[#D9E0EE] min-h-screen selection:bg-[#2694EE]/30 selection:text-white font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
