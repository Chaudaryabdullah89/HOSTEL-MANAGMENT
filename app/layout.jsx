import "./globals.css";
import { SessionProvider } from "./context/sessiondata";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { AppDataProvider } from "@/lib/contexts/AppDataContext";
import { Toaster } from "@/components/ui/toaster";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider } from "next-themes"

export const metadata = {
  title: "Hostel Management System",
  description: "Demonstration of context usage in Next.js 15",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('hostel-theme') || 'light';
                if (theme === 'dark' || (!('hostel-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        {/* Wrap the app in the providers */}
        <ThemeProvider 
          attribute="class" 
          defaultTheme="light" 
          enableSystem
          storageKey="hostel-theme"
        >
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
        </ThemeProvider>
      </body>
    </html>
  );
}
