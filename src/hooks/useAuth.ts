// src/hooks/useAuth.ts
import { useState } from 'react'
import { useAuthContext } from '../app/providers/AuthProvider'
import { accountProfileService } from '../core/http/services/accountProfileService'
import { authService } from '../core/http/services/authService'
import type { User } from '../interfaces/authInterfaces'
import { decodeJWT } from '../util/jwt'

export function useAuth() {
  const { setCredentials, logout, accessToken, refreshToken, user } = useAuthContext()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const login = async ({ credential, password }: { credential: string; password: string }) => {
    setLoading(true)
    setError(null)
    try {
      const response = await authService.login({ credential, password })
      if (response.status !== 200) {
        const errorMsg = (response.data as any)?.message || response.message || 'Erro ao fazer login'
        throw new Error(errorMsg)
      }

      if (response && response.data && response.data.accessToken) {
        const { accessToken, refreshToken } = response.data

        const jwtPayload = decodeJWT(accessToken)

        const user: User = {
          id: jwtPayload.sub,
          roles: jwtPayload.roles,
          tenant_city_id: jwtPayload.tenant_city_id,
        }
        setCredentials({
          accessToken,
          refreshToken,
          user
        })

        const myself = await accountProfileService.getMyself()
        
        const userWithMoreData: User = {
          id: jwtPayload.sub,
          roles: jwtPayload.roles,
          tenant_city_id: jwtPayload.tenant_city_id,
          first_name: myself.data?.firstName,
          last_name: myself.data?.lastName,
          email: myself.data?.email,
        }
        setCredentials({
          accessToken,
          refreshToken,
          user: userWithMoreData
        })

        return { success: true }
      } else {
        throw new Error('Resposta inválida do servidor - tokens não encontrados')
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao fazer login'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Registro removido - não existe no backend
  // Apenas administradores podem criar usuários

  return {
    login,
    logout,
    accessToken,
    refreshToken,
    user,
    loading,
    error
  }
}
