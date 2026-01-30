import { ENDPOINTS } from "../../../util/constants";
import { httpClient } from "../httpClient";

const API_URL = import.meta.env.VITE_API_URL as string || "http://186.248.135.172:31535";

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
