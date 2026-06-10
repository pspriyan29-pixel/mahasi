import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/lib/context/AppContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FlashWork - Platform Layanan Pendampingan Akademik & Digital",
  description: "Bantuan laporan, makalah, PPT, coding, debugging, dan project digital mahasiswa cepat, rapi, dan terarah dengan sistem antrean teratur dan pembayaran QRIS instan.",
  keywords: ["jasa coding", "jasa pembuatan website", "jasa makalah", "jasa laporan", "pendampingan akademik", "flashwork", "bantuan tugas kuliah", "bimbingan skripsi", "jasa ppt presentasi", "mahasi tech"],
  authors: [{ name: "Riyan Perdhana Putra", url: "https://mahasi.tech" }],
  metadataBase: new URL("https://mahasi.tech"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "FlashWork - Platform Layanan Pendampingan Akademik & Digital",
    description: "Bantuan laporan, makalah, PPT, coding, debugging, dan project digital mahasiswa cepat, rapi, dan terarah dengan sistem antrean teratur dan pembayaran QRIS instan.",
    url: "https://mahasi.tech",
    siteName: "FlashWork",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/favicon.ico",
        width: 512,
        height: 512,
        alt: "FlashWork Logo",
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "FlashWork - Platform Layanan Pendampingan Akademik & Digital",
    description: "Bantuan laporan, makalah, PPT, coding, debugging, dan project digital mahasiswa cepat, rapi, dan terarah dengan sistem antrean teratur dan pembayaran QRIS instan.",
    images: ["/favicon.ico"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.ico", type: "image/x-icon" }
    ],
    shortcut: "/favicon.ico",
    apple: "/favicon.ico"
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  other: {
    "geo.region": "ID-JI",
    "geo.placename": "Surabaya, Indonesia",
    "geo.position": "-7.250445;112.768845",
    "ICBM": "-7.250445, 112.768845"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F8FAFC] text-slate-900 selection:bg-blue-100 selection:text-blue-800">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
