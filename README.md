# PD Backoffice

> Sistema de backoffice para gerenciamento do processo seletivo e administração de candidatos.

**Backend API:** configurável via `VITE_API_URL` (em dev/local, aponte para seu backend, ex.: `http://localhost:31535`)

---

## 📖 Descrição

O **PD Backoffice** é uma aplicação administrativa desenvolvida com **Vite**, **React**, **TypeScript** e **Material-UI**, para gerenciamento completo do processo seletivo, incluindo:

* **Gerenciamento de Candidatos**: Listagem, busca e visualização de dados de candidatos
* **Documentação**: Upload, validação e gerenciamento de documentos (RG, comprovante de endereço, histórico escolar)
* **Provas e Avaliações**: Gerenciamento de notas, horários e resultados de provas
* **Mérito Acadêmico**: Aprovação/rejeição de documentos de mérito
* **Cidades e Locais**: Gerenciamento de cidades permitidas e locais de prova
* **Autenticação JWT**: Login seguro com renovação automática de tokens
* **Arquitetura em Camadas**: Separação clara entre UI (pages), lógica (hooks) e comunicação HTTP (services)

### 🔍 Detalhes de implementação

1. **Core HTTP** (`src/core/http/httpClient.ts`):

   * Wrapper para `fetch` com tratamento de JSON e cabeçalhos automáticos (`Content-Type` + `Authorization: Bearer <token>`).
   * Interceptor de resposta: ao receber `401 Unauthorized`, dispara callback para renovação de token.
   * Método genérico `request<T>(method, baseUrl, endpoint, payload?)` e helpers (`get`, `post`, `put`, `delete`, `patch`).

2. **Services** (`src/core/http/services/authService.ts`):

   * Encapsula chamadas ao backend usando `ENDPOINTS.AUTH` e a `VITE_API_URL`.
   * Fornece métodos `login`, `register`, `refreshToken` com payloads tipados em `src/interfaces/authInterfaces.ts`.

3. **Store Redux** (`src/core/store`):

   * **Slice `auth`** cuida de `accessToken`, `refreshToken` e dados de `User`.
   * **PersistConfig**: persiste apenas `auth` em `localStorage`, com criptografia usando `VITE_PERSIST_SECRET`.
   * **onUnauthorized**: configura `httpClient.setOnUnauthorized` para disparar `authService.refreshToken` e automaticamente atualizar o token no store, ou limpar credenciais em caso de falha.

4. **Contexto de Autenticação** (`src/app/providers/AuthProvider.tsx` + `src/hooks/useAuth.ts`):

   * **AuthProvider** expõe `accessToken`, `refreshToken`, `user`, além de `login`, `register`, `logout` via contexto React.
   * **useAuth** encapsula chamadas a `authService`, gerencia estados de `loading` e `error`, e invoca `setCredentials` no sucesso.

5. **Routing** (`src/app/routes/routes.tsx`):

   * Configuração de rotas com **React Router v6**.
   * **AuthLayout** para telas de login/registro (tema toggle + formulário animado).
   * **AuthMiddleware**: componente que verifica `accessToken` antes de renderizar **AppLayout**.
   * Áreas públicas (`/login`, `/register`) e privadas (`/home`, `*` para `NotFound`).

6. **Layouts & Componentes**:

   * **AuthLayout**: provê MUI `ThemeProvider`, `CssBaseline`, toggle de tema, e container responsivo para formulários.
   * **AppLayout**: barra lateral (`LayoutSidebar`) com navegação, topo (`Header`) e zona de rendering (`<Outlet/>`).
   * **UI reproducível**: `AuthCard`, `Header`, `LayoutSidebar`, `LanguageSwitcher` para alternância de idioma.

7. **Páginas** (`src/pages`):

   * **authPages**: `Login.tsx`, `Register.tsx` com validação via **Yup** e **Formik**, controle de visibilidade de senha e feedback de erro.
   * **appPages**: diretórios `publicPages` e `privatePages` prontos para expansão (ex.: `/home`, `/dashboard`).
   * **NotFound**: fallback para rotas não definidas.

8. **Internacionalização & Estilos**:

   * **i18n** configurado em `src/assets/i18n`, com tradução PT-BR padrão.
   * **Tema MUI** customizado em `src/assets/styles/theme.ts` (paletas primárias/segundárias, tipografia Ubuntu).

9. **Utilitários** (`src/util/constants.ts`):

   * **ENDPOINTS**: rotas de API (`AUTH`, `CRM`, `LICENSE`).
   * **VALIDATION\_PATTERNS**: expressões regulares para e‑mail, CPF, senha etc.

---

## 🛠️ Tecnologias

* **Front-end:** React, Vite, Redux Toolkit
* **Validação:** Yup, Formik
* **Persistência:** redux-persist, redux-persist-transform-encrypt
* **Estilização:** CSS Modules / Styled Components (ou outra de sua escolha)

---

## 🚀 Como executar

1. Clone o repositório:

   ```bash
   git clone https://github.com/Fer-Magalhaes/mockup-web.git
   cd mockup-web
   ```
2. Instale as dependências:

   ```bash
   npm install
   # ou
   yarn install
   ```
3. Crie um arquivo de ambiente `.env.local` na raiz do projeto com as variáveis (**recomendado em dev/local para evitar usar um backend inesperado**):

   ```bash
   VITE_API_URL=http://localhost:31535
   VITE_PERSIST_SECRET=SEU_SECRET_PARA_CRIPTOGRAFIA
   ```
4. Inicie o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```
5. Acesse `http://localhost:5100` no navegador.

---

## 📦 Build para produção

Para gerar os arquivos otimizados para produção:

```bash
npm run build
# ou
yarn build
```

O resultado ficará na pasta `dist/`.

---

## 🤝 Contribuição

1. Faça um fork deste repositório.
2. Crie uma branch com sua feature: `git checkout -b feature/nome-da-feature`
3. Commit suas alterações: `git commit -m 'Adiciona nova feature'`
4. Envie para a branch original: `git push origin feature/nome-da-feature`
5. Abra um Pull Request.

---

## 📝 Licença

Este projeto está licenciado sob a [MIT License](https://opensource.org/licenses/MIT).
