
import Layout from "../../components/layout"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
        <Layout >
            {children}
        </Layout>
    </div>
  )
}
