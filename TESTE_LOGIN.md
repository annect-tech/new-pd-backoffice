# 🧪 Teste de Login - Sprint 1

## ✅ Servidor Iniciado com Sucesso!

**URL:** http://localhost:5100/

---

## 🔑 Credenciais de Teste

- **Email/Credential:** `luke@pectecbh.com.br`
- **Senha:** `qweasd32`

---

## 📝 Passos para Testar

### 1. Acessar Página de Login
Abra o navegador em: **http://localhost:5100/login**

### 2. Preencher Formulário
- Campo "Email, CPF ou Username": `luke@pectecbh.com.br`
- Campo "Senha": `qweasd32`

### 3. Clicar em "Entrar"

### 4. Verificar Resultado Esperado
✅ Login bem-sucedido → Redirecionamento para `/dashboard`

---

## 🔍 O Que Verificar

### No Console do Navegador (F12)

1. **Logs esperados:**
   ```
   [useAuth] login response { status: 200, data: { accessToken: "...", refreshToken: "..." } }
   [store] Novo accessToken definido
   ```

2. **Redux State (Redux DevTools):**
   ```json
   {
     "auth": {
       "accessToken": "eyJhbGci...",
       "refreshToken": "uuid-v4...",
       "user": {
         "id": 123,
         "roles": ["ADMIN", "USER"],
         "tenant_city_id": "..."
       }
     }
   }
   ```

3. **LocalStorage:**
   ```javascript
   localStorage.getItem('persist:root')
   // Deve retornar string criptografada
   ```

### Na Interface

✅ Dashboard carregado
✅ Header mostra avatar do usuário
✅ Sidebar mostra informações do usuário
✅ Sem erros na tela

---

## ❌ Possíveis Erros e Soluções

### Erro: "Credenciais inválidas"
- Verifique se o backend está online: http://186.248.135.172:31535/swagger
- Verifique se as credenciais estão corretas
- Verifique o console para ver a resposta exata do backend

### Erro: "Cannot connect to server"
- Backend pode estar offline
- Verifique a variável `VITE_API_URL` no `.env`

### Erro: "TypeError: Cannot read property 'sub' of undefined"
- Problema ao decodificar JWT
- Verifique o console para ver o token recebido
- Token pode estar em formato inválido

---

## 🐛 Debug Avançado

### Ver Requisição HTTP
1. Abra DevTools (F12)
2. Vá para aba "Network"
3. Clique em "Entrar"
4. Procure por requisição `POST /auth/login`
5. Verifique:
   - **Request Payload:** `{ credential: "...", password: "..." }`
   - **Response:** `{ accessToken: "...", refreshToken: "..." }`
   - **Status Code:** 200

### Ver JWT Decodificado
No console do navegador:
```javascript
// Pegar token do localStorage
const state = JSON.parse(localStorage.getItem('persist:root'))
const auth = JSON.parse(state.auth)
const token = auth.accessToken

// Decodificar (simples, sem validação)
const base64Url = token.split('.')[1]
const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''))
console.log(JSON.parse(jsonPayload))
```

Deve mostrar:
```json
{
  "sub": 123,
  "roles": ["ADMIN", "USER"],
  "tenant_city_id": "...",
  "iat": 1234567890,
  "exp": 1234571490
}
```

---

## ✅ Checklist de Teste

- [ ] Página de login carrega sem erros
- [ ] Campo aceita email como credential
- [ ] Botão "Entrar" funciona
- [ ] Login com credenciais corretas funciona
- [ ] Redirecionamento para dashboard ocorre
- [ ] Tokens são salvos no localStorage
- [ ] User object está no Redux com `id`, `roles`, `tenant_city_id`
- [ ] Header mostra avatar do usuário
- [ ] Console não mostra erros críticos
- [ ] Login com credenciais inválidas mostra erro
- [ ] Mensagem de erro é clara e amigável

---

## 📊 Status do Teste

Após testar, anote aqui os resultados:

**Login bem-sucedido:** [ ] Sim  [ ] Não
**Redirecionamento funcionou:** [ ] Sim  [ ] Não
**Tokens salvos:** [ ] Sim  [ ] Não
**User no Redux:** [ ] Sim  [ ] Não
**Erros encontrados:** _________________

---

**Data do Teste:** 2026-01-08
**Versão:** Sprint 1
**Servidor:** http://localhost:5100/
