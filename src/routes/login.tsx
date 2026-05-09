import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { SignIn, useUser } from '@clerk/clerk-react'
import { useEffect } from 'react'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const { isSignedIn, isLoaded } = useUser()
  const navigate = useNavigate()

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      navigate({ to: '/admin/dashboard', replace: true })
    }
  }, [isLoaded, isSignedIn, navigate])

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <SignIn routing="hash" forceRedirectUrl="/admin/dashboard" />
    </div>
  )
}
