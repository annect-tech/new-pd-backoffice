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
  PROFILE: "/usuario/:id",
  PROFILE_EDIT: "/usuario/:id/editar",
  USER_DETAIL: "/usuario/",
  USER_EDIT: "/usuario/",
  MY_PROFILE: "/meu-perfil",
};

export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    REFRESH_TOKEN: "/auth/refresh-token",
    LOGOUT: "/auth/logout",
  },

  // Admin endpoints
  ADMIN: {
    USERS: "/admin/users",
    USER_PROFILES: "/admin/user-profiles",
    TENANT_CITIES: "/admin/tenant-cities",
    ACADEMIC_MERIT: "/admin/academic-merit-documents",
    ENEM_RESULTS: "/admin/enem-results",
    ADDRESSES: "/admin/addresses",
    EXAM_LOCAL: "/admin/exam",
    EXAM_DATES: "/admin/exam/dates",
    EXAM_HOURS: "/admin/exam/hours",
    STUDENT_EXAMS: "/admin/student-exams",
    CONTRACTS: "/admin/contract",
    CANDIDATE_DOCUMENTS: "/admin/candidate-documents",
    USER_DATA: "/admin/user-data",
    ALLOWED_CITIES: "/admin/allowed-cities",
    GUARDIANS: "/admin/guardians",
    REGISTRATION_DATA: "/admin/registration-data",
    STUDENT_DATA: "/admin/student-data",
  },

  // User endpoints
  USER: {
    USERS: "/user/users",
    USER_PROFILES: "/user/user-profiles",
    TENANT_CITIES: "/user/tenant-cities",
    ACADEMIC_MERIT: "/user/academic-merit-documents",
    ENEM_RESULTS: "/user/enem-results",
    ADDRESSES: "/user/addresses",
    EXAM_LOCAL: "/user/exam",
    EXAM_DATES: "/user/exam/dates",
    EXAM_HOURS: "/user/exam/hours",
    STUDENT_EXAMS: "/user/student-exams",
    CONTRACTS: "/user/contract",
    CANDIDATE_DOCUMENTS: "/user/candidate-documents",
    USER_DATA: "/user/user-data",
  },

  // Endpoints compartilhados
  EMAIL_VERIFICATION: {
    CODE: "/email-verification/code",
    VERIFY: "/email-verification/verify",
    SEND_CODE: "/email-verification/send-code",
    RESEND: "/email-verification/resend",
  },

  UPLOAD: {
    SINGLE: "/upload-file/single",
    ARRAY: "/upload-file/array",
  },

  HEALTH: "/health",
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
