import { ENDPOINTS } from "../../../util/constants";
import { httpClient } from "../httpClient";
import { getApiUrl } from "../apiUrl";

const API_URL = getApiUrl();

export interface MylselfResponse {
  id: number,
  username: string,
  email: string,
  cellphone: string,
  cpf: string,
  tenantCityId: string,
  firstName: string,
  lastName: string,
  birth_date: Date
  isActive: boolean,
  isSuperuser: boolean,
  isStaff: boolean,
  dateJoined: Date
  tenant_city_id: string,
  progress_status: string,
  seletivo_userdata: {
    id: number
  },
  user_roles: [
    {
      role: {
        id: string,
        name: string,
        description: string
      }
    }
  ]
}

export const accountProfileService = {
  getMyself: async () => {
    return httpClient.get<MylselfResponse>(
      API_URL,
      ENDPOINTS.AUTH.MYSELF,
    );
  },
};
