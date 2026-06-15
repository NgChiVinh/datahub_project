import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Providers } from "@/components/Providers";
import { Toaster } from "react-hot-toast";

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
  description: "Hệ thống chia sẻ tri thức số hóa dành riêng cho sinh viên IT Văn Lang. Khám phá kho tài liệu, bài giảng và đồ án chất lượng cao.",
  keywords: ["DataHub", "VLU", "IT Văn Lang", "Tài liệu CNTT", "Đại học Văn Lang"],
  icons: {
    icon: "/images/favicon.png",
  },
  openGraph: {
    title: "DataHub - Trạm Tri Thức IT Văn Lang",
    description: "Nền tảng chia sẻ tài liệu và video bài giảng hàng đầu cho sinh viên IT VLU.",
    url: "https://datahub-vlu.edu.vn", // Thay bằng domain thật của bạn sau này
    siteName: "DataHub VLU",
    images: [
      {
        url: "/images/banner_datahub.jpg",
        width: 1200,
        height: 630,
        alt: "DataHub - Trạm Tri Thức IT Văn Lang",
      },
    ],
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DataHub - Trạm Tri Thức IT Văn Lang",
    description: "Khám phá kho tri thức số dành riêng cho sinh viên IT VLU.",
    images: ["/images/banner_datahub.jpg"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="vi"
      className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} h-full antialiased font-inter`}
    >
      <body className="min-h-full flex flex-col bg-white">
        <Toaster position="top-center" reverseOrder={false} />
        <Providers>
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
