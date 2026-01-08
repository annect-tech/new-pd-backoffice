# Guia de Teste de Autenticação

## Status da API

A API está acessível em: `http://186.248.135.172:31535`

✅ **Health Check:** Funcionando
- Database: UP
- Queues: UP
- Alguns endpoints requerem autenticação (401)

## Passo a Passo para Teste Manual

### 1. Usando o Script de Teste Automático

```bash
# Teste com credenciais padrão
./test-auth.sh

# Teste com credenciais específicas
./test-auth.sh "seu-email@example.com" "sua-senha"
```

### 2. Teste Manual com cURL

#### 2.1. Testar Login

```bash
curl -X POST http://186.248.135.172:31535/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seu-email@example.com",
    "password": "sua-senha"
  }'
```

**Resposta esperada:**
```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "first_name": "Nome",
    "last_name": "Sobrenome",
    "email": "seu-email@example.com",
    "role": "admin"
  }
}
```

#### 2.2. Testar Endpoint Protegido

```bash
# Substitua {ACCESS_TOKEN} pelo token obtido no login
curl -X GET http://186.248.135.172:31535/admin/user-profiles \
  -H "Authorization: Bearer {ACCESS_TOKEN}" \
  -H "Content-Type: application/json"
```

#### 2.3. Testar Refresh Token

```bash
# Substitua {REFRESH_TOKEN} pelo refresh token obtido no login
curl -X POST http://186.248.135.172:31535/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refresh": "{REFRESH_TOKEN}"
  }'
```

**Resposta esperada:**
```json
{
  "access": "novo_access_token...",
  "refresh": "novo_refresh_token..."
}
```

#### 2.4. Testar Logout

```bash
# Substitua {REFRESH_TOKEN} pelo refresh token
curl -X POST http://186.248.135.172:31535/auth/logout \
  -H "Content-Type: application/json" \
  -d '{
    "refresh": "{REFRESH_TOKEN}"
  }'
```

## Próximos Passos

### 1. Obter Credenciais de Teste
- Solicite ao backend credenciais de teste válidas
- Ou crie um novo usuário se houver endpoint de registro

### 2. Verificar Estrutura da Resposta
- Confirme se a estrutura do `user` na resposta de login corresponde à interface `User` em [authInterfaces.ts](src/interfaces/authInterfaces.ts)
- Verifique se todos os campos necessários estão presentes

### 3. Testar Integração com o Frontend
- Após confirmar que a API funciona via cURL
- Teste o login através da aplicação React
- Verifique se o token é armazenado corretamente
- Teste navegação em rotas protegidas

## Observações Importantes

1. **Endpoints que Requerem Autenticação:**
   - `/admin/*` - Todos os endpoints admin requerem token
   - `/user/*` - Endpoints de usuário requerem token

2. **Formato do Token:**
   - Usar `Bearer {token}` no header Authorization
   - Tokens são JWT (JSON Web Tokens)

3. **Erros Comuns:**
   - 401 Unauthorized: Token inválido ou expirado
   - 403 Forbidden: Token válido mas sem permissão
   - 404 Not Found: Endpoint não existe

## Estrutura de Dados Atualizada

### Login Payload
```typescript
{
  email: string;
  password: string;
}
```

### Login Response
```typescript
{
  access: string;
  refresh: string;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    profile_photo?: string;
  }
}
```

## Arquivos Atualizados

1. ✅ [constants.ts](src/util/constants.ts) - Novos endpoints mapeados
2. ✅ [authInterfaces.ts](src/interfaces/authInterfaces.ts) - Interfaces de autenticação
3. ✅ [authService.ts](src/core/http/services/authService.ts) - Serviço de autenticação
4. ✅ [userService.ts](src/core/http/services/userService.ts) - Novo serviço de usuário
