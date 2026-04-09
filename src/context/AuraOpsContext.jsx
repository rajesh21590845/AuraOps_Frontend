/**
 * AuraOps React Context
 * Thin wrapper around Zustand stores for components
 * that prefer useContext pattern.
 */
import { createContext, useContext } from 'react'
import { useAuthStore, useProjectStore } from '../store'

const AuraOpsContext = createContext(null)

export function AuraOpsProvider({ children }) {
  // This provider is a no-op — all state lives in Zustand.
  // It's here as an extension point for future context-dependent logic
  // (e.g. theme switching, feature flags).
  return (
    <AuraOpsContext.Provider value={null}>
      {children}
    </AuraOpsContext.Provider>
  )
}

/**
 * Convenience hooks re-exported with context semantics.
 */
export function useAuth() {
  return useAuthStore()
}

export function useProjects() {
  return useProjectStore()
}
