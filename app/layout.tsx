import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GeekShop - Tienda Geek Online",
  description: "Remeras, impresiones 3D y accesorios geek",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <nav className="border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-xl font-bold">
                GeekShop
              </Link>
              
              <div className="flex gap-4">
                <Link href="/auth/login" className="hover:underline">
                  Login
                </Link>
                <Link href="/auth/register" className="hover:underline">
                  Registro
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}