import { httpClient } from "../httpClient";
import { getEndpointPrefix } from "../utils/endpointPrefix";
import { getApiUrl } from "../apiUrl";

const API_URL = getApiUrl();

export interface StudentData {
  id: number;
  registration: string;
  corp_email: string;
  monitor: string;
  status: string;
  first_name?: string;
  last_name?: string;
  completeName?: string;
  cpf?: string;
  birth_date?: string;
  username?: string;
  user_id?: number;
  user_data_id?: number;
  defaultPassword?: string;
  created_at?: string;
  updated_at?: string;
}

export interface StudentReadyToEnrolledCsvDto {
  id: string;                    // ID do student_data (usado na confirmação)
  student_data_id?: string;      // Alternativo (caso a API retorne assim)
  registration: string;
  corp_email: string;
  first_name: string;
  last_name: string;
  personal_email: string;
  defaultPassword: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

export const studentDataService = {
  /**
   * Lista todos os alunos com paginação
   * @param page - Número da página (padrão: 1)
   * @param size - Itens por página (padrão: 10)
   * @param search - Termo de busca opcional
   */
  list: (page: number = 1, size: number = 10, search?: string) => {
    const prefix = getEndpointPrefix();
    return httpClient.get<PaginatedResponse<StudentData>>(
      API_URL,
      `/${prefix}/student-data`,
      {
        queryParams: {
          page,
          size,
          ...(search ? { search } : {}),
        },
      }
    );
  },

  /**
   * Obtém detalhes de um aluno específico
   * @param id - ID do aluno
   */
  getById: (id: string | number) => {
    const prefix = getEndpointPrefix();
    return httpClient.get<StudentData>(
      API_URL,
      `/${prefix}/student-data/${id}`
    );
  },

  /**
   * Cria um novo aluno
   * @param payload - Dados do aluno
   */
  create: (payload: Partial<StudentData>) => {
    const prefix = getEndpointPrefix();
    return httpClient.post<{ id: number; message: string }>(
      API_URL,
      `/${prefix}/student-data`,
      payload
    );
  },

  /**
   * Atualiza dados de um aluno
   * @param id - ID do aluno
   * @param payload - Dados atualizados
   */
  update: (id: string | number, payload: Partial<StudentData>) => {
    const prefix = getEndpointPrefix();
    return httpClient.patch<{ message: string }>(
      API_URL,
      `/${prefix}/student-data`,
      id,
      payload
    );
  },

  /**
   * Deleta um aluno
   * @param id - ID do aluno
   */
  delete: (id: string | number) => {
    const prefix = getEndpointPrefix();
    return httpClient.delete<{ message: string }>(
      API_URL,
      `/${prefix}/student-data`,
      id
    );
  },

  /**
   * Deleta dados de estudante por user_data_id.
   * Tenta o endpoint dedicado primeiro; se retornar 404, busca na listagem e deleta pelo id.
   * @param userDataId - ID do user_data
   */
  deleteByUserDataId: async (userDataId: string | number) => {
    const prefix = getEndpointPrefix();

    // Tentar endpoint dedicado
    const directResponse = await httpClient.request<{ message: string }>(
      "DELETE",
      API_URL,
      `/${prefix}/student-data/by-user-data-id/${userDataId}`
    );

    if (directResponse.status === 200 || directResponse.status === 204) {
      return directResponse;
    }

    // Fallback: buscar na listagem e deletar pelo id
    if (directResponse.status === 404) {
      let currentPage = 1;
      const pageSize = 100;

      while (true) {
        const listResponse = await httpClient.get<any>(
          API_URL,
          `/${prefix}/student-data`,
          { queryParams: { page: currentPage, size: pageSize } }
        );

        if (listResponse.status !== 200 || !listResponse.data) break;

        // A resposta pode ter a lista em .data.data ou diretamente em .data (array)
        const responseData = listResponse.data;
        const items: any[] = Array.isArray(responseData)
          ? responseData
          : Array.isArray(responseData?.data)
            ? responseData.data
            : [];
        const totalPages = responseData?.totalPages || 1;

        console.log(`[deleteByUserDataId] Buscando user_data_id=${userDataId} na página ${currentPage}/${totalPages}, ${items.length} itens`);

        const match = items.find(
          (item: any) => String(item.user_data_id) === String(userDataId)
        );

        if (match) {
          console.log(`[deleteByUserDataId] Encontrado: student_data id=${match.id} para user_data_id=${userDataId}`);
          return httpClient.delete<{ message: string }>(
            API_URL,
            `/${prefix}/student-data`,
            match.id
          );
        }

        if (currentPage >= totalPages || items.length === 0) break;
        currentPage++;
      }

      return {
        status: 404,
        message: "Dados do estudante não encontrados para este user_data_id.",
        data: undefined,
      };
    }

    return directResponse;
  },

  /**
   * Lista estudantes prontos para matrícula via CSV
   * @param page - Número da página (padrão: 1)
   * @param size - Itens por página (padrão: 10)
   */
  listReadyToEnrolledCsv: (page: number = 1, size: number = 10) => {
    const prefix = getEndpointPrefix();
    return httpClient.get<PaginatedResponse<StudentReadyToEnrolledCsvDto>>(
      API_URL,
      `/${prefix}/student-data/ready-to-enrolled-csv`,
      {
        queryParams: {
          page,
          size,
        },
      }
    );
  },

  /**
   * Matrícula um único estudante via CSV
   * Reutiliza o endpoint de confirmação em lote com um único ID
   * @param studentId - ID do estudante para matricular (ID do student_data)
   */
  enrollSingleStudent: (studentId: string | number) => {
    const prefix = getEndpointPrefix();
    const numericId = typeof studentId === 'string' ? parseInt(studentId, 10) : studentId;
    return httpClient.request<{ message: string }>(
      "PATCH",
      API_URL,
      `/${prefix}/student-data/confirm-enrolled-students`,
      { ids: [numericId] }
    );
  },

  /**
   * Matrícula múltiplos estudantes via CSV
   * @param studentIds - Array de IDs dos estudantes para matricular (IDs do student_data)
   */
  enrollMultipleStudents: (studentIds: (string | number)[]) => {
    const prefix = getEndpointPrefix();
    const numericIds = studentIds.map(id => typeof id === 'string' ? parseInt(id, 10) : id);
    return httpClient.request<{ message: string }>(
      "PATCH",
      API_URL,
      `/${prefix}/student-data/confirm-enrolled-students`,
      { ids: numericIds }
    );
  },
};
