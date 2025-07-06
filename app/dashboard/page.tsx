import { ProtectedRoute } from "@/components/auth/protected-route"
import { PremiumDashboard } from "@/components/dashboard/premium-dashboard"

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <PremiumDashboard />
    </ProtectedRoute>
  )
}
