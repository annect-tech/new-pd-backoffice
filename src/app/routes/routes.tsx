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
import Cidades from "../../pages/cidades/Cidades";
import Contratos from "../../pages/contratos/Contratos";
import Documentos from "../../pages/documentos/Documentos";
import Usuarios from "../../pages/usuarios/Usuarios";
import Perfil from "../../pages/perfil/Perfil";
import EditarPerfil from "../../pages/perfil/EditarPerfil";
import MeuPerfil from "../../pages/meuPerfil/MeuPerfil";

export const AppRoutes = () => (
  <Routes>
    <Route element={<AppLayout />}>
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
      <Route path={APP_ROUTES.CITIES} element={<Cidades />} />
      <Route path={APP_ROUTES.CONTRACTS} element={<Contratos />} />
      <Route path={APP_ROUTES.DOCUMENTS} element={<Documentos />} />
      <Route path={APP_ROUTES.USERS_LIST} element={<Usuarios />} />
      <Route path="/usuario/:id" element={<Perfil />} />
      <Route path="/usuario/:id/editar" element={<EditarPerfil />} />
      <Route path={APP_ROUTES.MY_PROFILE} element={<MeuPerfil />} />
      
      <Route path={APP_ROUTES.NOTFOUND} element={<NotFound />} />
    </Route>
  </Routes>
);
