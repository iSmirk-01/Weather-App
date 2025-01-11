import type { Metadata } from "next";
import "./globals.css";
import { WeatherProvider } from "./contexts/WeatherContext";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Weather App",
  description: "A simple Weather App",
  keywords: ["Weather", "Forecast", "Weather App"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} min-h-screen w-full overflow-x-hidden`}
      >
        <WeatherProvider>{children}</WeatherProvider>
      </body>
    </html>
  );
}
