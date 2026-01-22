import { Route, Routes } from "react-router";
import { APP_ROUTES } from "../../util/constants";
import NotFound from "../../pages/notFound/NotFound";
import AppLayout from "../../components/layout/AppLayout";
import Dashboard from "../../pages/dashboard/Dashboard";
import Seletivo from "../../pages/seletivo/Seletivo";
import ListaPresenca from "../../pages/listaPresenca/ListaPresenca";
import AprovacaoMerito from "../../pages/aprovacaoMerito/AprovacaoMerito";
import ResultadoProvas from "../../pages/resultadoProvas/ResultadoProvas";
import ResultadosMerito from "../../pages/resultadosMerito/ResultadosMerito";
import ResultadosEnem from "../../pages/resultadosEnem/ResultadosEnem";
import DadosAlunos from "../../pages/dadosAlunos/DadosAlunos";
import CadastroAlunos from "../../pages/cadastroAlunos/CadastroAlunos";
import Retencao from "../../pages/retencao/Retencao";
import TenantCities from "../../pages/tenantCities/TenantCities";
import AllowedCities from "../../pages/allowedCities/AllowedCities";
import Addresses from "../../pages/addresses/Addresses";
import Contratos from "../../pages/contratos/Contratos";
import Documentos from "../../pages/documentos/Documentos";
import DocumentosCotas from "../../pages/documentosCotas/DocumentosCotas";
import Usuarios from "../../pages/usuarios/Usuarios";
import Perfil from "../../pages/perfil/Perfil";
import EditarPerfil from "../../pages/perfil/EditarPerfil";
import MeuPerfil from "../../pages/meuPerfil/MeuPerfil";
import ApiExplorer from "../../pages/apiExplorer/ApiExplorer";
import Login from "../../pages/authPages/Login";
import { AuthMiddleware } from "../../core/middleware/AuthMiddleware";
import { RoleGuard } from "../../core/middleware/RoleGuard";
import Unauthorized from "../../pages/unauthorized/Unauthorized";

export const AppRoutes = () => (
  <Routes>
    {/* Rotas Públicas (sem AppLayout) */}
    <Route path={APP_ROUTES.LOGIN} element={<Login />} />

    {/* Rotas Protegidas (com AuthMiddleware + AppLayout) */}
    <Route
      element={
        <AuthMiddleware>
          <AppLayout />
        </AuthMiddleware>
      }
    >
      {/* Dashboard como página inicial */}
      <Route path={APP_ROUTES.HOME} element={<Dashboard />} />
      <Route path={APP_ROUTES.DASHBOARD} element={<Dashboard />} />

      {/* Rotas dos Cards Gerais */}
      <Route path={APP_ROUTES.SELECTIVE} element={<Seletivo />} />
      <Route path={APP_ROUTES.EXAM_SCHEDULED} element={<ListaPresenca />} />
      <Route path={APP_ROUTES.MERIT_VALIDATION} element={<AprovacaoMerito />} />
      <Route path={APP_ROUTES.EXAMS} element={<ResultadoProvas />} />
      <Route path={APP_ROUTES.MERIT_RESULTS} element={<ResultadosMerito />} />
      <Route path={APP_ROUTES.ENEM_RESULTS} element={<ResultadosEnem />} />
      <Route path={APP_ROUTES.STUDENTS} element={<DadosAlunos />} />
      <Route path={APP_ROUTES.STUDENT_CREATE} element={<CadastroAlunos />} />
      <Route path={APP_ROUTES.RETENTION} element={<Retencao />} />

      {/* Rotas dos Cards de Admin */}
      <Route
        path={APP_ROUTES.TENANT_CITIES}
        element={
          <RoleGuard allowedRoles={["ADMIN", "ADMIN_MASTER"]}>
            <TenantCities />
          </RoleGuard>
        }
      />
      <Route
        path={APP_ROUTES.ALLOWED_CITIES}
        element={
          <RoleGuard allowedRoles={["ADMIN", "ADMIN_MASTER"]}>
            <AllowedCities />
          </RoleGuard>
        }
      />
      <Route
        path={APP_ROUTES.ADDRESSES}
        element={<Addresses />}
      />
      <Route
        path={APP_ROUTES.CONTRACTS}
        element={
          <RoleGuard allowedRoles={["ADMIN", "ADMIN_MASTER"]}>
            <Contratos />
          </RoleGuard>
        }
      />
      <Route
        path={APP_ROUTES.DOCUMENTS}
        element={
          <RoleGuard allowedRoles={["ADMIN", "ADMIN_MASTER"]}>
            <Documentos />
          </RoleGuard>
        }
      />
      <Route
        path={APP_ROUTES.QUOTA_DOCUMENTS}
        element={
          <RoleGuard allowedRoles={["ADMIN", "ADMIN_MASTER"]}>
            <DocumentosCotas />
          </RoleGuard>
        }
      />
      <Route
        path={APP_ROUTES.USERS_LIST}
        element={
          <RoleGuard allowedRoles={["ADMIN", "ADMIN_MASTER"]}>
            <Usuarios />
          </RoleGuard>
        }
      />
      <Route
        path="/api-explorer"
        element={
          <RoleGuard allowedRoles={["ADMIN", "ADMIN_MASTER"]}>
            <ApiExplorer />
          </RoleGuard>
        }
      />
      <Route path={APP_ROUTES.UNAUTHORIZED} element={<Unauthorized />} />
      <Route path="/usuario/:id" element={<Perfil />} />
      <Route path="/usuario/:id/editar" element={<EditarPerfil />} />
      <Route path={APP_ROUTES.MY_PROFILE} element={<MeuPerfil />} />

      <Route path={APP_ROUTES.NOTFOUND} element={<NotFound />} />
    </Route>
  </Routes>
);
