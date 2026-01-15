# Documentação: Inventário de Rotas (pd-backoffice-api)

Este arquivo foi gerado automaticamente a partir dos **controllers NestJS** em `src/**/.controller.ts`.

## 🎯 Objetivo
Servir como referência rápida (para humanos e para IA) para implementar o front-end: **quais rotas existem**, quais são `admin`/`user`/`auth`, e onde está o controller correspondente.

## 🌐 Base URL
- **Produção/ambiente atual (conforme docs antigas)**: `http://186.248.135.172:31535`
- **Local (setup)**: `http://localhost:3000`

## 🔐 Autenticação (resumo)
- **Header**: `Authorization: Bearer {accessToken}`
- **Login**: `POST /auth/login` (retorna `accessToken` e `refreshToken`)
- **Refresh**: `POST /auth/refresh-token` (troca por novos tokens)
- **Logout**: não há endpoint — é no front removendo tokens do storage.

## 👥 Convenção de prefixos
- **`/auth/*`**: público (autenticação)
- **`/health`**: público (health-check)
- **`/admin/*`**: endpoints administrativos (tipicamente requer `ADMIN` ou `ADMIN_MASTER`)
- **`/user/*`**: endpoints para usuário autenticado (regras variam por role/tenant)

> Observação: permissões exatas (guards/roles) e shapes completos (DTOs) devem ser conferidos no controller/DTO do módulo ou no Swagger quando disponível.

## 📋 Índice (por grupo)
1. [admin/academic-merit-documents](#admin-academic-merit-documents)
2. [admin/addresses](#admin-addresses)
3. [admin/allowed-cities](#admin-allowed-cities)
4. [admin/candidate-documents](#admin-candidate-documents)
5. [admin/cities](#admin-cities)
6. [admin/contract](#admin-contract)
7. [admin/enem-results](#admin-enem-results)
8. [admin/exam](#admin-exam)
9. [admin/faqs](#admin-faqs)
10. [admin/guardians](#admin-guardians)
11. [admin/persona](#admin-persona)
12. [admin/registration-data](#admin-registration-data)
13. [admin/student-data](#admin-student-data)
14. [admin/student-exams](#admin-student-exams)
15. [admin/tenant-cities](#admin-tenant-cities)
16. [admin/user-data](#admin-user-data)
17. [admin/user-profiles](#admin-user-profiles)
18. [admin/users](#admin-users)
19. [auth](#auth)
20. [email-verification](#email-verification)
21. [health](#health)
22. [upload-file](#upload-file)
23. [user/academic-merit-documents](#user-academic-merit-documents)
24. [user/addresses](#user-addresses)
25. [user/candidate-documents](#user-candidate-documents)
26. [user/contract](#user-contract)
27. [user/enem-results](#user-enem-results)
28. [user/exam](#user-exam)
29. [user/faqs](#user-faqs)
30. [user/persona](#user-persona)
31. [user/student-exams](#user-student-exams)
32. [user/tenant-cities](#user-tenant-cities)
33. [user/user-data](#user-user-data)
34. [user/users](#user-users)

---

## admin/academic-merit-documents

| Método | Rota | Controller |
|---|---|---|
| `GET` | `/admin/academic-merit-documents` | `src/modules/academic-merit-document/infra/http/admin/academic-merit-admin.controller.ts` |
| `POST` | `/admin/academic-merit-documents` | `src/modules/academic-merit-document/infra/http/admin/academic-merit-admin.controller.ts` |
| `DELETE` | `/admin/academic-merit-documents/:id` | `src/modules/academic-merit-document/infra/http/admin/academic-merit-admin.controller.ts` |
| `PUT` | `/admin/academic-merit-documents/:id` | `src/modules/academic-merit-document/infra/http/admin/academic-merit-admin.controller.ts` |
| `POST` | `/admin/academic-merit-documents/upload` | `src/modules/academic-merit-document/infra/http/admin/academic-merit-admin.controller.ts` |

## admin/addresses

| Método | Rota | Controller |
|---|---|---|
| `GET` | `/admin/addresses` | `src/modules/seletivo-address/infra/http/admin/address-admin.controller.ts` |
| `POST` | `/admin/addresses` | `src/modules/seletivo-address/infra/http/admin/address-admin.controller.ts` |
| `DELETE` | `/admin/addresses/:id` | `src/modules/seletivo-address/infra/http/admin/address-admin.controller.ts` |
| `GET` | `/admin/addresses/:id` | `src/modules/seletivo-address/infra/http/admin/address-admin.controller.ts` |
| `PATCH` | `/admin/addresses/:id` | `src/modules/seletivo-address/infra/http/admin/address-admin.controller.ts` |

## admin/allowed-cities

| Método | Rota | Controller |
|---|---|---|
| `GET` | `/admin/allowed-cities` | `src/modules/seletivo-allowed-city/infra/http/admin/allowed-city-admin.controller.ts` |
| `POST` | `/admin/allowed-cities` | `src/modules/seletivo-allowed-city/infra/http/admin/allowed-city-admin.controller.ts` |
| `DELETE` | `/admin/allowed-cities/:id` | `src/modules/seletivo-allowed-city/infra/http/admin/allowed-city-admin.controller.ts` |
| `GET` | `/admin/allowed-cities/:id` | `src/modules/seletivo-allowed-city/infra/http/admin/allowed-city-admin.controller.ts` |
| `PATCH` | `/admin/allowed-cities/:id` | `src/modules/seletivo-allowed-city/infra/http/admin/allowed-city-admin.controller.ts` |

## admin/candidate-documents

| Método | Rota | Controller |
|---|---|---|
| `GET` | `/admin/candidate-documents` | `src/modules/candidate-document/infra/http/admin/candidate-document-admin.controller.ts` |
| `DELETE` | `/admin/candidate-documents/:userDataId` | `src/modules/candidate-document/infra/http/admin/candidate-document-admin.controller.ts` |
| `GET` | `/admin/candidate-documents/:userDataId` | `src/modules/candidate-document/infra/http/admin/candidate-document-admin.controller.ts` |
| `PATCH` | `/admin/candidate-documents/:userDataId` | `src/modules/candidate-document/infra/http/admin/candidate-document-admin.controller.ts` |
| `POST` | `/admin/candidate-documents/upload` | `src/modules/candidate-document/infra/http/admin/candidate-document-admin.controller.ts` |

## admin/cities

| Método | Rota | Controller |
|---|---|---|
| `GET` | `/admin/cities` | `src/modules/city-creation/infra/http/admin/city-creation-admin.controller.ts` |
| `POST` | `/admin/cities` | `src/modules/city-creation/infra/http/admin/city-creation-admin.controller.ts` |
| `DELETE` | `/admin/cities/:id` | `src/modules/city-creation/infra/http/admin/city-creation-admin.controller.ts` |
| `GET` | `/admin/cities/:id` | `src/modules/city-creation/infra/http/admin/city-creation-admin.controller.ts` |
| `PATCH` | `/admin/cities/:id` | `src/modules/city-creation/infra/http/admin/city-creation-admin.controller.ts` |

## admin/contract

| Método | Rota | Controller |
|---|---|---|
| `GET` | `/admin/contract` | `src/modules/seletivo-contract/infra/http/admin/contract-admin.controller.ts` |
| `POST` | `/admin/contract` | `src/modules/seletivo-contract/infra/http/admin/contract-admin.controller.ts` |
| `DELETE` | `/admin/contract/:id` | `src/modules/seletivo-contract/infra/http/admin/contract-admin.controller.ts` |
| `GET` | `/admin/contract/:id` | `src/modules/seletivo-contract/infra/http/admin/contract-admin.controller.ts` |
| `PATCH` | `/admin/contract/:id` | `src/modules/seletivo-contract/infra/http/admin/contract-admin.controller.ts` |

## admin/enem-results

| Método | Rota | Controller |
|---|---|---|
| `GET` | `/admin/enem-results` | `src/modules/enem-result/infra/http/admin/enem-result-admin.controller.ts` |
| `POST` | `/admin/enem-results` | `src/modules/enem-result/infra/http/admin/enem-result-admin.controller.ts` |
| `DELETE` | `/admin/enem-results/:id` | `src/modules/enem-result/infra/http/admin/enem-result-admin.controller.ts` |
| `GET` | `/admin/enem-results/:id` | `src/modules/enem-result/infra/http/admin/enem-result-admin.controller.ts` |
| `PATCH` | `/admin/enem-results/:id` | `src/modules/enem-result/infra/http/admin/enem-result-admin.controller.ts` |

## admin/exam

| Método | Rota | Controller |
|---|---|---|
| `GET` | `/admin/exam` | `src/modules/seletivo-exam/infra/http/admin/exam-management-admin.controller.ts` |
| `POST` | `/admin/exam` | `src/modules/seletivo-exam/infra/http/admin/exam-management-admin.controller.ts` |
| `DELETE` | `/admin/exam/:id` | `src/modules/seletivo-exam/infra/http/admin/exam-management-admin.controller.ts` |
| `GET` | `/admin/exam/:id` | `src/modules/seletivo-exam/infra/http/admin/exam-management-admin.controller.ts` |
| `PATCH` | `/admin/exam/:id` | `src/modules/seletivo-exam/infra/http/admin/exam-management-admin.controller.ts` |
| `GET` | `/admin/exam/date-by-id/:id` | `src/modules/seletivo-exam/infra/http/admin/exam-management-admin.controller.ts` |
| `POST` | `/admin/exam/dates` | `src/modules/seletivo-exam/infra/http/admin/exam-management-admin.controller.ts` |
| `DELETE` | `/admin/exam/dates/:id` | `src/modules/seletivo-exam/infra/http/admin/exam-management-admin.controller.ts` |
| `PATCH` | `/admin/exam/dates/:id` | `src/modules/seletivo-exam/infra/http/admin/exam-management-admin.controller.ts` |
| `GET` | `/admin/exam/dates/:localId` | `src/modules/seletivo-exam/infra/http/admin/exam-management-admin.controller.ts` |
| `GET` | `/admin/exam/hour-by-id/:id` | `src/modules/seletivo-exam/infra/http/admin/exam-management-admin.controller.ts` |
| `POST` | `/admin/exam/hours` | `src/modules/seletivo-exam/infra/http/admin/exam-management-admin.controller.ts` |
| `GET` | `/admin/exam/hours/:dateId` | `src/modules/seletivo-exam/infra/http/admin/exam-management-admin.controller.ts` |
| `DELETE` | `/admin/exam/hours/:id` | `src/modules/seletivo-exam/infra/http/admin/exam-management-admin.controller.ts` |
| `PATCH` | `/admin/exam/hours/:id` | `src/modules/seletivo-exam/infra/http/admin/exam-management-admin.controller.ts` |

## admin/faqs

| Método | Rota | Controller |
|---|---|---|
| `GET` | `/admin/faqs` | `src/modules/faq/infra/http/admin/faq-admin.controller.ts` |
| `POST` | `/admin/faqs` | `src/modules/faq/infra/http/admin/faq-admin.controller.ts` |
| `DELETE` | `/admin/faqs/:id` | `src/modules/faq/infra/http/admin/faq-admin.controller.ts` |
| `PUT` | `/admin/faqs/:id` | `src/modules/faq/infra/http/admin/faq-admin.controller.ts` |

## admin/guardians

| Método | Rota | Controller |
|---|---|---|
| `GET` | `/admin/guardians` | `src/modules/seletivo-guardian/infra/http/admin/guardian-admin.controller.ts` |
| `POST` | `/admin/guardians` | `src/modules/seletivo-guardian/infra/http/admin/guardian-admin.controller.ts` |
| `DELETE` | `/admin/guardians/:id` | `src/modules/seletivo-guardian/infra/http/admin/guardian-admin.controller.ts` |
| `PATCH` | `/admin/guardians/:id` | `src/modules/seletivo-guardian/infra/http/admin/guardian-admin.controller.ts` |

## admin/persona

| Método | Rota | Controller |
|---|---|---|
| `GET` | `/admin/persona` | `src/modules/seletivo-persona/infra/http/admin/persona-admin.controller.ts` |
| `DELETE` | `/admin/persona/:id` | `src/modules/seletivo-persona/infra/http/admin/persona-admin.controller.ts` |
| `PUT` | `/admin/persona/:id` | `src/modules/seletivo-persona/infra/http/admin/persona-admin.controller.ts` |

## admin/registration-data

| Método | Rota | Controller |
|---|---|---|
| `GET` | `/admin/registration-data` | `src/modules/seletivo-registration-data/infra/http/admin/registration-data-admin.controller.ts` |
| `POST` | `/admin/registration-data` | `src/modules/seletivo-registration-data/infra/http/admin/registration-data-admin.controller.ts` |
| `DELETE` | `/admin/registration-data/:id` | `src/modules/seletivo-registration-data/infra/http/admin/registration-data-admin.controller.ts` |
| `PATCH` | `/admin/registration-data/:id` | `src/modules/seletivo-registration-data/infra/http/admin/registration-data-admin.controller.ts` |

## admin/student-data

| Método | Rota | Controller |
|---|---|---|
| `GET` | `/admin/student-data` | `src/modules/student-data/infra/http/admin/student-data-admin.controller.ts` |
| `POST` | `/admin/student-data` | `src/modules/student-data/infra/http/admin/student-data-admin.controller.ts` |
| `DELETE` | `/admin/student-data/:id` | `src/modules/student-data/infra/http/admin/student-data-admin.controller.ts` |
| `PATCH` | `/admin/student-data/:id` | `src/modules/student-data/infra/http/admin/student-data-admin.controller.ts` |

## admin/student-exams

| Método | Rota | Controller |
|---|---|---|
| `GET` | `/admin/student-exams` | `src/modules/seletivo-exam-student/infra/http/admin/student-exam-admin.controller.ts` |
| `POST` | `/admin/student-exams` | `src/modules/seletivo-exam-student/infra/http/admin/student-exam-admin.controller.ts` |
| `DELETE` | `/admin/student-exams/:id` | `src/modules/seletivo-exam-student/infra/http/admin/student-exam-admin.controller.ts` |
| `PATCH` | `/admin/student-exams/:id` | `src/modules/seletivo-exam-student/infra/http/admin/student-exam-admin.controller.ts` |
| `GET` | `/admin/student-exams/schedule/:localId/:dateId` | `src/modules/seletivo-exam-student/infra/http/admin/student-exam-admin.controller.ts` |

## admin/tenant-cities

| Método | Rota | Controller |
|---|---|---|
| `GET` | `/admin/tenant-cities` | `src/modules/tenant-city/infra/http/admin/tenant-city-admin.controller.ts` |
| `POST` | `/admin/tenant-cities` | `src/modules/tenant-city/infra/http/admin/tenant-city-admin.controller.ts` |
| `DELETE` | `/admin/tenant-cities/:id` | `src/modules/tenant-city/infra/http/admin/tenant-city-admin.controller.ts` |
| `PATCH` | `/admin/tenant-cities/:id` | `src/modules/tenant-city/infra/http/admin/tenant-city-admin.controller.ts` |

## admin/user-data

| Método | Rota | Controller |
|---|---|---|
| `GET` | `/admin/user-data` | `src/modules/seletivo-user-data/infra/http/admin/user-data-admin.controller.ts` |
| `POST` | `/admin/user-data` | `src/modules/seletivo-user-data/infra/http/admin/user-data-admin.controller.ts` |
| `DELETE` | `/admin/user-data/:id` | `src/modules/seletivo-user-data/infra/http/admin/user-data-admin.controller.ts` |
| `GET` | `/admin/user-data/:id` | `src/modules/seletivo-user-data/infra/http/admin/user-data-admin.controller.ts` |
| `PATCH` | `/admin/user-data/:id` | `src/modules/seletivo-user-data/infra/http/admin/user-data-admin.controller.ts` |
| `GET` | `/admin/user-data/search-student` | `src/modules/seletivo-user-data/infra/http/admin/user-data-admin.controller.ts` |

## admin/user-profiles

| Método | Rota | Controller |
|---|---|---|
| `GET` | `/admin/user-profiles` | `src/modules/user-profile/infra/http/admin/user-profile-admin.controller.ts` |
| `POST` | `/admin/user-profiles` | `src/modules/user-profile/infra/http/admin/user-profile-admin.controller.ts` |
| `DELETE` | `/admin/user-profiles/:id` | `src/modules/user-profile/infra/http/admin/user-profile-admin.controller.ts` |
| `PATCH` | `/admin/user-profiles/:id` | `src/modules/user-profile/infra/http/admin/user-profile-admin.controller.ts` |
| `POST` | `/admin/user-profiles/upload-photo` | `src/modules/user-profile/infra/http/admin/user-profile-admin.controller.ts` |

## admin/users

| Método | Rota | Controller |
|---|---|---|
| `GET` | `/admin/users` | `src/modules/auth_user/infra/http/admin/auth-user-admin.controller.ts` |
| `POST` | `/admin/users` | `src/modules/auth_user/infra/http/admin/auth-user-admin.controller.ts` |
| `DELETE` | `/admin/users/:id` | `src/modules/auth_user/infra/http/admin/auth-user-admin.controller.ts` |
| `PUT` | `/admin/users/active/:email` | `src/modules/auth_user/infra/http/admin/auth-user-admin.controller.ts` |
| `GET` | `/admin/users/admin-master` | `src/modules/auth_user/infra/http/admin/auth-user-admin.controller.ts` |

## auth

| Método | Rota | Controller |
|---|---|---|
| `POST` | `/auth/forgot-password` | `src/modules/authentication/infra/drivers/http/authentication.controller.ts` |
| `POST` | `/auth/login` | `src/modules/authentication/infra/drivers/http/authentication.controller.ts` |
| `POST` | `/auth/refresh-token` | `src/modules/authentication/infra/drivers/http/authentication.controller.ts` |
| `POST` | `/auth/reset-password` | `src/modules/authentication/infra/drivers/http/authentication.controller.ts` |

## email-verification

| Método | Rota | Controller |
|---|---|---|
| `POST` | `/email-verification/code` | `src/modules/email-verification/infra/http/email-verfication.controller.ts` |
| `POST` | `/email-verification/resend` | `src/modules/email-verification/infra/http/email-verfication.controller.ts` |
| `POST` | `/email-verification/send-code` | `src/modules/email-verification/infra/http/email-verfication.controller.ts` |
| `PATCH` | `/email-verification/verify` | `src/modules/email-verification/infra/http/email-verfication.controller.ts` |

## health

| Método | Rota | Controller |
|---|---|---|
| `GET` | `/health` | `src/modules/health/infra/http/health.controller.ts` |
| `GET` | `/health` | `src/modules/health/infra/http/health.controller.ts` |

## upload-file

| Método | Rota | Controller |
|---|---|---|
| `POST` | `/upload-file/array` | `src/modules/upload-file/infra/drivers/http/upload-file.controller.ts` |
| `POST` | `/upload-file/single` | `src/modules/upload-file/infra/drivers/http/upload-file.controller.ts` |

## user/academic-merit-documents

| Método | Rota | Controller |
|---|---|---|
| `POST` | `/user/academic-merit-documents` | `src/modules/academic-merit-document/infra/http/user/academic-merit-user.controller.ts` |
| `GET` | `/user/academic-merit-documents/:id` | `src/modules/academic-merit-document/infra/http/user/academic-merit-user.controller.ts` |
| `PUT` | `/user/academic-merit-documents/:id` | `src/modules/academic-merit-document/infra/http/user/academic-merit-user.controller.ts` |
| `POST` | `/user/academic-merit-documents/upload` | `src/modules/academic-merit-document/infra/http/user/academic-merit-user.controller.ts` |

## user/addresses

| Método | Rota | Controller |
|---|---|---|
| `GET` | `/user/addresses` | `src/modules/seletivo-address/infra/http/user/address-user.controller.ts` |
| `POST` | `/user/addresses` | `src/modules/seletivo-address/infra/http/user/address-user.controller.ts` |
| `DELETE` | `/user/addresses/:id` | `src/modules/seletivo-address/infra/http/user/address-user.controller.ts` |
| `GET` | `/user/addresses/:id` | `src/modules/seletivo-address/infra/http/user/address-user.controller.ts` |
| `PATCH` | `/user/addresses/:id` | `src/modules/seletivo-address/infra/http/user/address-user.controller.ts` |

## user/candidate-documents

| Método | Rota | Controller |
|---|---|---|
| `GET` | `/user/candidate-documents` | `src/modules/candidate-document/infra/http/user/candidate-document-user.controller.ts` |
| `DELETE` | `/user/candidate-documents/:userDataId` | `src/modules/candidate-document/infra/http/user/candidate-document-user.controller.ts` |
| `GET` | `/user/candidate-documents/:userDataId` | `src/modules/candidate-document/infra/http/user/candidate-document-user.controller.ts` |
| `PATCH` | `/user/candidate-documents/:userDataId` | `src/modules/candidate-document/infra/http/user/candidate-document-user.controller.ts` |
| `POST` | `/user/candidate-documents/upload` | `src/modules/candidate-document/infra/http/user/candidate-document-user.controller.ts` |

## user/contract

| Método | Rota | Controller |
|---|---|---|
| `GET` | `/user/contract` | `src/modules/seletivo-contract/infra/http/user/contract-user.controller.ts` |
| `POST` | `/user/contract` | `src/modules/seletivo-contract/infra/http/user/contract-user.controller.ts` |
| `DELETE` | `/user/contract/:id` | `src/modules/seletivo-contract/infra/http/user/contract-user.controller.ts` |
| `GET` | `/user/contract/:id` | `src/modules/seletivo-contract/infra/http/user/contract-user.controller.ts` |
| `PATCH` | `/user/contract/:id` | `src/modules/seletivo-contract/infra/http/user/contract-user.controller.ts` |

## user/enem-results

| Método | Rota | Controller |
|---|---|---|
| `GET` | `/user/enem-results` | `src/modules/enem-result/infra/http/user/enem-result-user.controller.ts` |
| `POST` | `/user/enem-results` | `src/modules/enem-result/infra/http/user/enem-result-user.controller.ts` |
| `DELETE` | `/user/enem-results/:id` | `src/modules/enem-result/infra/http/user/enem-result-user.controller.ts` |
| `GET` | `/user/enem-results/:id` | `src/modules/enem-result/infra/http/user/enem-result-user.controller.ts` |
| `PATCH` | `/user/enem-results/:id` | `src/modules/enem-result/infra/http/user/enem-result-user.controller.ts` |

## user/exam

| Método | Rota | Controller |
|---|---|---|
| `GET` | `/user/exam` | `src/modules/seletivo-exam/infra/http/user/exam-management-user.controller.ts` |
| `POST` | `/user/exam` | `src/modules/seletivo-exam/infra/http/user/exam-management-user.controller.ts` |
| `DELETE` | `/user/exam/:id` | `src/modules/seletivo-exam/infra/http/user/exam-management-user.controller.ts` |
| `GET` | `/user/exam/:id` | `src/modules/seletivo-exam/infra/http/user/exam-management-user.controller.ts` |
| `PATCH` | `/user/exam/:id` | `src/modules/seletivo-exam/infra/http/user/exam-management-user.controller.ts` |
| `GET` | `/user/exam/date-by-id/:id` | `src/modules/seletivo-exam/infra/http/user/exam-management-user.controller.ts` |
| `POST` | `/user/exam/dates` | `src/modules/seletivo-exam/infra/http/user/exam-management-user.controller.ts` |
| `DELETE` | `/user/exam/dates/:id` | `src/modules/seletivo-exam/infra/http/user/exam-management-user.controller.ts` |
| `PATCH` | `/user/exam/dates/:id` | `src/modules/seletivo-exam/infra/http/user/exam-management-user.controller.ts` |
| `GET` | `/user/exam/dates/:localId` | `src/modules/seletivo-exam/infra/http/user/exam-management-user.controller.ts` |
| `GET` | `/user/exam/hour-by-id/:id` | `src/modules/seletivo-exam/infra/http/user/exam-management-user.controller.ts` |
| `POST` | `/user/exam/hours` | `src/modules/seletivo-exam/infra/http/user/exam-management-user.controller.ts` |
| `GET` | `/user/exam/hours/:dateId` | `src/modules/seletivo-exam/infra/http/user/exam-management-user.controller.ts` |
| `DELETE` | `/user/exam/hours/:id` | `src/modules/seletivo-exam/infra/http/user/exam-management-user.controller.ts` |
| `PATCH` | `/user/exam/hours/:id` | `src/modules/seletivo-exam/infra/http/user/exam-management-user.controller.ts` |

## user/faqs

| Método | Rota | Controller |
|---|---|---|
| `GET` | `/user/faqs` | `src/modules/faq/infra/http/user/faq-user.controller.ts` |

## user/persona

| Método | Rota | Controller |
|---|---|---|
| `GET` | `/user/persona` | `src/modules/seletivo-persona/infra/http/user/persona-user.controller.ts` |
| `POST` | `/user/persona` | `src/modules/seletivo-persona/infra/http/user/persona-user.controller.ts` |
| `DELETE` | `/user/persona/:id` | `src/modules/seletivo-persona/infra/http/user/persona-user.controller.ts` |
| `GET` | `/user/persona/:id` | `src/modules/seletivo-persona/infra/http/user/persona-user.controller.ts` |
| `PUT` | `/user/persona/:id` | `src/modules/seletivo-persona/infra/http/user/persona-user.controller.ts` |

## user/student-exams

| Método | Rota | Controller |
|---|---|---|
| `GET` | `/user/student-exams` | `src/modules/seletivo-exam-student/infra/http/user/student-exam-user.controller.ts` |
| `POST` | `/user/student-exams` | `src/modules/seletivo-exam-student/infra/http/user/student-exam-user.controller.ts` |
| `DELETE` | `/user/student-exams/:id` | `src/modules/seletivo-exam-student/infra/http/user/student-exam-user.controller.ts` |
| `PATCH` | `/user/student-exams/:id` | `src/modules/seletivo-exam-student/infra/http/user/student-exam-user.controller.ts` |
| `GET` | `/user/student-exams/schedule/:localId/:dateId` | `src/modules/seletivo-exam-student/infra/http/user/student-exam-user.controller.ts` |

## user/tenant-cities

| Método | Rota | Controller |
|---|---|---|
| `GET` | `/user/tenant-cities` | `src/modules/tenant-city/infra/http/user/tenant-city-user.controller.ts` |
| `POST` | `/user/tenant-cities` | `src/modules/tenant-city/infra/http/user/tenant-city-user.controller.ts` |
| `DELETE` | `/user/tenant-cities/:id` | `src/modules/tenant-city/infra/http/user/tenant-city-user.controller.ts` |
| `PATCH` | `/user/tenant-cities/:id` | `src/modules/tenant-city/infra/http/user/tenant-city-user.controller.ts` |

## user/user-data

| Método | Rota | Controller |
|---|---|---|
| `GET` | `/user/user-data` | `src/modules/seletivo-user-data/infra/http/user/user-data-user.controller.ts` |
| `POST` | `/user/user-data` | `src/modules/seletivo-user-data/infra/http/user/user-data-user.controller.ts` |
| `DELETE` | `/user/user-data/:id` | `src/modules/seletivo-user-data/infra/http/user/user-data-user.controller.ts` |
| `GET` | `/user/user-data/:id` | `src/modules/seletivo-user-data/infra/http/user/user-data-user.controller.ts` |
| `PATCH` | `/user/user-data/:id` | `src/modules/seletivo-user-data/infra/http/user/user-data-user.controller.ts` |
| `GET` | `/user/user-data/search-student` | `src/modules/seletivo-user-data/infra/http/user/user-data-user.controller.ts` |

## user/users

| Método | Rota | Controller |
|---|---|---|
| `GET` | `/user/users` | `src/modules/auth_user/infra/http/user/auth-user-user.controller.ts` |

---

**Gerado em:** 2026-01-14T15:28:01.922Z

**Total de controllers:** 34  
**Total de rotas:** 167
