import { t } from "i18next";

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
  REGISTER: "/register",
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
};

export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login/",
    OTP_VERIFY: "/auth/otp-verify/",
    RECOVERY: "/auth/recovery/",
    REGISTER: "/auth/register/",
    RESET_PASSWORD: "/auth/reset-password/",
    REFRESH_TOKEN: "/auth/refresh/",
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
    columnMenuSortAsc: t("table.columnMenuSortAsc"),
    columnMenuSortDesc: t("table.columnMenuSortDesc"),
    columnMenuFilter: t("table.columnMenuFilter"),
    columnMenuHideColumn: t("table.columnMenuHideColumn"),
    columnMenuShowColumns: t("table.columnMenuShowColumns"),
    columnMenuUnsort: t("table.columnMenuUnsort"),
    columnMenuManageColumns: t("table.columnMenuManageColumns"),
    filterPanelAddFilter: t("table.filterPanelAddFilter"),
    filterPanelRemoveAll: t("table.filterPanelRemoveAll"),
    filterPanelDeleteIconLabel: t("table.filterPanelDeleteIconLabel"),
    filterPanelLogicOperator: t("table.filterPanelLogicOperator"),
    filterPanelOperator: t("table.filterPanelOperator"),
    filterPanelOperatorAnd: t("table.filterPanelOperatorAnd"),
    filterPanelOperatorOr: t("table.filterPanelOperatorOr"),
    filterPanelColumns: t("table.filterPanelColumns"),
    filterPanelInputLabel: t("table.filterPanelInputLabel"),
    filterPanelInputPlaceholder: t("table.filterPanelInputPlaceholder"),
    filterOperatorContains: t("table.filterOperatorContains"),
    filterOperatorEquals: t("table.filterOperatorEquals"),
    filterOperatorStartsWith: t("table.filterOperatorStartsWith"),
    filterOperatorEndsWith: t("table.filterOperatorEndsWith"),
    filterOperatorIsEmpty: t("table.filterOperatorIsEmpty"),
    filterOperatorIsNotEmpty: t("table.filterOperatorIsNotEmpty"),
    filterOperatorIsAnyOf: t("table.filterOperatorIsAnyOf"),
    filterOperatorDoesNotContain: t("table.filterOperatorDoesNotContain"),
    filterOperatorDoesNotEqual: t("table.filterOperatorDoesNotEqual"),
  },
});
