import "./globals.css";
import { SessionProvider } from "./context/sessiondata";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { AppDataProvider } from "@/lib/contexts/AppDataContext";
import { Toaster } from "@/components/ui/toaster";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
        {/* Toast notifications - react-hot-toast (used by most pages) */}
        <Toaster />
        {/* Toast notifications - react-toastify (used by some pages) */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </body>
    </html>
  );
}
