import { httpClient } from "../httpClient";
import { getEndpointPrefix } from "../utils/endpointPrefix";
import { getApiUrl } from "../apiUrl";

const API_URL = getApiUrl();

export interface CandidateDocument {
  id: string;
  user_data_id: string;
  student_name: string;
  student_email: string;
  id_doc: string | null;
  id_doc_status: string;
  address_doc: string | null;
  address_doc_status: string;
  school_history_doc: string | null;
  school_history_doc_status: string;
  contract_doc: string | null;
  contract_doc_status: string;
  created_at: string;
}

export interface CandidateDocumentPayload {
  user_data_id: number;
  document_type: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

export interface UploadDocumentResponse {
  url: string;
  message: string;
}

export const candidateDocumentsService = {
  /**
   * Lista todos os documentos de candidatos (admin)
   * @param page - Número da página (padrão: 1)
   * @param size - Itens por página (padrão: 10)
   */
  list: (page: number = 1, size: number = 10) => {
    const prefix = getEndpointPrefix();
    return httpClient.get<PaginatedResponse<CandidateDocument>>(
      API_URL,
      `/${prefix}/candidate-documents`,
      {
        queryParams: {
          page,
          size,
        },
      }
    );
  },

  /**
   * Obtém documentos de um candidato específico (admin)
   * @param userDataId - ID dos dados do usuário
   */
  getByUserDataId: (userDataId: string | number) => {
    const prefix = getEndpointPrefix();
    return httpClient.get<CandidateDocument>(
      API_URL,
      `/${prefix}/candidate-documents/${userDataId}`
    );
  },

  /**
   * Atualiza um documento de candidato (admin)
   * @param userDataId - ID do user_data (usado na URL)
   * @param payload - Dados atualizados (status, URLs, etc.)
   */
  update: (userDataId: string | number, payload: {
    id_doc_status?: string;
    id_doc?: string;
    id_doc_refuse_reason?: string;
    address_doc_status?: string;
    address_doc?: string;
    address_doc_refuse_reason?: string;
    school_history_doc_status?: string;
    school_history_doc?: string;
    school_history_doc_refuse_reason?: string;
    contract_doc_status?: string;
    contract_doc?: string;
    contract_doc_refuse_reason?: string;
  }) => {
    const prefix = getEndpointPrefix();
    return httpClient.patch<{ message: string }>(
      API_URL,
      `/${prefix}/candidate-documents`,
      userDataId,
      payload
    );
  },

  /**
   * Deleta um documento de candidato (admin)
   * @param userDataId - ID dos dados do usuário
   */
  delete: (userDataId: string | number) => {
    const prefix = getEndpointPrefix();
    return httpClient.delete<{ message: string }>(
      API_URL,
      `/${prefix}/candidate-documents`,
      userDataId
    );
  },

  /**
   * Faz upload de documento de candidato (admin)
   * @param file - Arquivo a ser enviado
   * @param userDataId - ID dos dados do usuário
   * @param documentType - Tipo do documento
   */
  upload: (file: File, userDataId: string | number, documentType: string) => {
    const prefix = getEndpointPrefix();
    return httpClient.uploadFile<UploadDocumentResponse>(
      API_URL,
      `/${prefix}/candidate-documents/upload`,
      file,
      {
        user_data_id: String(userDataId),
        document_type: documentType,
      }
    );
  },

  // ========== USER ENDPOINTS ==========

  /**
   * Lista documentos do usuário logado (user)
   */
  listUser: (page: number = 1, size: number = 10) => {
    return httpClient.get<PaginatedResponse<CandidateDocument>>(
      API_URL,
      "/user/candidate-documents",
      {
        queryParams: {
          page,
          size,
        },
      }
    );
  },

  /**
   * Obtém documentos do usuário logado por userDataId (user)
   * @param userDataId - ID dos dados do usuário
   */
  getUserByUserDataId: (userDataId: string | number) =>
    httpClient.get<CandidateDocument>(
      API_URL,
      `/user/candidate-documents/${userDataId}`
    ),

  /**
   * Atualiza um documento do usuário logado (user)
   * @param userDataId - ID dos dados do usuário
   * @param payload - Dados atualizados (status, URLs, etc.)
   */
  updateUser: (userDataId: string | number, payload: {
    id_doc_status?: string;
    id_doc?: string;
    id_doc_refuse_reason?: string;
    address_doc_status?: string;
    address_doc?: string;
    address_doc_refuse_reason?: string;
    school_history_doc_status?: string;
    school_history_doc?: string;
    school_history_doc_refuse_reason?: string;
    contract_doc_status?: string;
    contract_doc?: string;
    contract_doc_refuse_reason?: string;
  }) =>
    httpClient.patch<{ message: string }>(
      API_URL,
      `/user/candidate-documents`,
      userDataId,
      payload
    ),

  /**
   * Deleta um documento do usuário logado (user)
   * @param userDataId - ID dos dados do usuário
   */
  deleteUser: (userDataId: string | number) =>
    httpClient.delete<{ message: string }>(
      API_URL,
      `/user/candidate-documents`,
      userDataId
    ),

  /**
   * Faz upload de documento do usuário logado (user)
   * @param file - Arquivo a ser enviado
   * @param userDataId - ID dos dados do usuário
   * @param documentType - Tipo do documento
   */
  uploadUser: (file: File, userDataId: string | number, documentType: string) =>
    httpClient.uploadFile<UploadDocumentResponse>(
      API_URL,
      "/user/candidate-documents/upload",
      file,
      {
        user_data_id: String(userDataId),
        document_type: documentType,
      }
    ),
};
