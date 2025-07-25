import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Provider from "@/Redux/Provider/Provider";
import Slidebar from "@/components/Common/Slidebar";
import { ToastProvider } from "@/components/Common/Toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Expenss Manager",
  description: "Expenss manager web app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Provider>
          <div className="flex">
            <ToastProvider>
              {/* Fixed Sidebar */}
              <Slidebar />
              {/* Main content with left margin = sidebar width */}
              <div className="ml-0 lg:ml-72 w-full min-h-screen">
                {children}
              </div>
            </ToastProvider>
          </div>
        </Provider>
      </body>
    </html>
  );
}
