// src/hooks/useAuth.ts
import { useState } from 'react'
import { authService } from '../core/http/services/authService'
import { useAuthContext } from '../app/providers/AuthProvider'
import { decodeJWT } from '../util/jwt'

export function useAuth() {
  const { setCredentials, logout, accessToken, refreshToken, user } = useAuthContext()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const login = async ({ credential, password }: { credential: string; password: string }) => {
    setLoading(true)
    setError(null)
    try {
      console.log('[useAuth] Tentando login com:', { credential, password: '***' })
      const response = await authService.login({ credential, password })
      console.log('[useAuth] login response completo:', response)

      // Verificar se o login foi bem-sucedido (status 200)
      if (response.status !== 200) {
        const errorMsg = (response.data as any)?.message || response.message || 'Erro ao fazer login'
        throw new Error(errorMsg)
      }

      if (response && response.data && response.data.accessToken) {
        const { accessToken, refreshToken } = response.data

        console.log('[useAuth] Tokens recebidos - AccessToken:', accessToken?.substring(0, 20) + '...')

        // Decodificar JWT para extrair informações do usuário
        const jwtPayload = decodeJWT(accessToken)
        console.log('[useAuth] JWT decodificado:', jwtPayload)

        // Criar objeto user a partir do JWT
        const user = {
          id: jwtPayload.sub,
          roles: jwtPayload.roles,
          tenant_city_id: jwtPayload.tenant_city_id,
        }

        setCredentials({
          accessToken,
          refreshToken,
          user
        })

        console.log('[useAuth] Login bem-sucedido! User:', user)
        return { success: true }
      } else {
        throw new Error('Resposta inválida do servidor - tokens não encontrados')
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao fazer login'
      console.error('[useAuth] Erro no login:', errorMessage)
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
