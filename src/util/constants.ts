export const CACHE_CONFIG = {
  DEFAULT_TTL: 300000, // 5 minutos
  AUTH_CACHE_KEY: "auth_cache",
  USER_DATA_KEY: "user_data",
};

export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  CPF: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
  PASSWORD: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
  CELLPHONE: /^(\d{0,2})(\d{0,5})(\d{0,4})$/,
  CEP: /^\d{5}-\d{3}$/,
};

export const APP_ROUTES = {
  NOTFOUND: "*",
  HOME: "/",
  DASHBOARD: "/dashboard",
  LOGIN: "/login",
  // REGISTER: "/register", // Removido - não existe no backend
  // Rotas dos Cards
  SELECTIVE: "/seletivo",
  EXAM_SCHEDULED: "/lista-presenca",
  MERIT_VALIDATION: "/aprovacao-merito",
  EXAMS: "/resultado-provas",
  MERIT_RESULTS: "/resultados-merito",
  ENEM_RESULTS: "/resultados-enem",
  STUDENTS: "/dados-alunos",
  STUDENT_CREATE: "/cadastro-alunos",
  RETENTION: "/retencao",
  CITIES: "/cidades",
  CONTRACTS: "/contratos",
  EXAM_DATES: "/datas-prova",
  DOCUMENTS: "/documentos",
  USERS_LIST: "/usuarios",
  PROFILE: "/usuario/:id",
  PROFILE_EDIT: "/usuario/:id/editar",
  USER_DETAIL: "/usuario/",
  USER_EDIT: "/usuario/",
  MY_PROFILE: "/meu-perfil",
};

export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login", // Removida barra final
    OTP_VERIFY: "/auth/otp-verify/",
    RECOVERY: "/auth/recovery/",
    // REGISTER: Não existe no backend - apenas admin pode criar usuários
    RESET_PASSWORD: "/auth/reset-password/",
    REFRESH_TOKEN: "/auth/refresh-token", // Endpoint correto do backend
  },
  CRM: {
    CLIENTS: "/crm/clientes/",
    DOCUMENTS: "/crm/documentos/",
    ACCESS: "/crm/acessos/",
  },
  LICENSE: "/license/",
};

export const getTableConfig = () => ({
  initialState: {
    pagination: { paginationModel: { pageSize: 5 } },
  },
  pageSizeOptions: [5, 10, 25],
  localeText: {
    // Paginação
    MuiTablePagination: {
      labelRowsPerPage: "Linhas por página:",
      labelDisplayedRows: ({ from, to, count }: { from: number; to: number; count: number }) =>
        `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`,
    },
    footerRowSelected: (count: number) =>
      count !== 1
        ? `${count.toLocaleString()} linhas selecionadas`
        : `${count.toLocaleString()} linha selecionada`,
    // Menu de colunas
    columnMenuSortAsc: "Ordenar crescente",
    columnMenuSortDesc: "Ordenar decrescente",
    columnMenuFilter: "Filtrar",
    columnMenuHideColumn: "Ocultar coluna",
    columnMenuShowColumns: "Exibir colunas",
    columnMenuUnsort: "Desfazer ordenação",
    columnMenuManageColumns: "Gerenciar colunas",
    // Painel de filtros
    filterPanelAddFilter: "Adicionar filtro",
    filterPanelRemoveAll: "Remover todos",
    filterPanelDeleteIconLabel: "Remover",
    filterPanelLogicOperator: "Operador lógico",
    filterPanelOperator: "Operador",
    filterPanelOperatorAnd: "E",
    filterPanelOperatorOr: "Ou",
    filterPanelColumns: "Colunas",
    filterPanelInputLabel: "Valor",
    filterPanelInputPlaceholder: "Filtrar valor",
    // Operadores de filtro
    filterOperatorContains: "contém",
    filterOperatorEquals: "é igual a",
    filterOperatorStartsWith: "começa com",
    filterOperatorEndsWith: "termina com",
    filterOperatorIsEmpty: "está vazio",
    filterOperatorIsNotEmpty: "não está vazio",
    filterOperatorIsAnyOf: "é qualquer um de",
    filterOperatorDoesNotContain: "não contém",
    filterOperatorDoesNotEqual: "não é igual a",
  },
});
