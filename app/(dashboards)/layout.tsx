
import { ThemeProvider } from "next-themes"
import Layout from "../../components/layout"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <ThemeProvider>

        <Layout >
            {children}
        </Layout>
      </ThemeProvider>
    </div>
  )
}
