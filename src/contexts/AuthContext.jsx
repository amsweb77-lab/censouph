import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for changes on auth state (log in, log out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Verifica se o usuário logado é administrador:
  // 1) e-mail configurado via VITE_ADMIN_EMAIL
  // 2) user_metadata.role === 'admin'
  // 3) app_metadata.role === 'admin'
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL
  const isAdmin =
    (adminEmail && user?.email === adminEmail) ||
    user?.user_metadata?.role === 'admin' ||
    user?.app_metadata?.role === 'admin'


  const value = {
    session,
    user,
    isAdmin,
    loading,
    signOut: () => supabase.auth.signOut(),
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
