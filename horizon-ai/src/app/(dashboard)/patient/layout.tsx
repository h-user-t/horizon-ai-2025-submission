// app/patient/layout.tsx
'use client'

import { Inter } from "next/font/google"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { PatientSidebar } from "@/components/dashboard/app-sidebar-patient"
import { useAuth } from '@/hooks/useAuth'
import { AuthLoadingScreen } from "@/components/auth/AuthLoadingScreen"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

const inter = Inter({ subsets: ["latin"] })

export default function PatientRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isLoading, user, role } = useAuth('patient')
  const router = useRouter()

  useEffect(() => {
    // If not loading and either no user or wrong role, redirect
    if (!isLoading && (!user || role !== 'patient')) {
      router.replace('/signin')
    }
  }, [isLoading, user, role, router])

  // Show loading screen while checking auth or if not authenticated
  if (isLoading || !user || role !== 'patient') {
    return <AuthLoadingScreen />
  }

  return (
    <div className={inter.className}>
      <SidebarProvider>
        <PatientSidebar />
        <SidebarTrigger className="ml-3 mt-3" />
        <main className="flex-1 overflow-auto p-8 pt-16">{children}</main>
      </SidebarProvider>
    </div>
  )
}

