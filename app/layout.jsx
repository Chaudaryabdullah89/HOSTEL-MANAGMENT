import "./globals.css";
import { SessionProvider } from "./context/sessiondata";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { AppDataProvider } from "@/lib/contexts/AppDataContext";
import { Toaster } from "@/components/ui/toaster";
import { ToastContainer, toast } from 'react-toastify';

export const metadata = {
  title: "Next.js Session Example",
  description: "Demonstration of context usage in Next.js 15",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {/* Wrap the app in the providers */}
        <QueryProvider>
          <AppDataProvider>
            <SessionProvider>{children}</SessionProvider>
          </AppDataProvider>
        </QueryProvider>
        <ToastContainer />

      </body>
    </html>
  );
}
