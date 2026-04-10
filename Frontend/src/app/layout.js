import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "DataHub - Khoa CNTT Văn Lang",
  description: "Nền tảng chia sẻ tài liệu học thuật cho sinh viên IT Văn Lang",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="vi"
      className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} h-full antialiased font-inter`}
    >
      <body className="min-h-full flex flex-col bg-white">
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
