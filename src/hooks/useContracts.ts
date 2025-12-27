import { useState, useCallback } from "react";

// Definindo tipos localmente
interface Contract {
  id: number;
  status: string;
  user_data: {
    cpf: string;
    user: {
      first_name: string;
      last_name: string;
    };
  };
}

// Dados mockados
const MOCK_CONTRACTS: Contract[] = [
  {
    id: 1,
    status: "ativo",
    user_data: {
      cpf: "123.456.789-00",
      user: {
        first_name: "João",
        last_name: "Silva",
      },
    },
  },
  {
    id: 2,
    status: "pendente",
    user_data: {
      cpf: "987.654.321-00",
      user: {
        first_name: "Maria",
        last_name: "Santos",
      },
    },
  },
  {
    id: 3,
    status: "cancelado",
    user_data: {
      cpf: "111.222.333-44",
      user: {
        first_name: "Pedro",
        last_name: "Oliveira",
      },
    },
  },
  {
    id: 4,
    status: "ativo",
    user_data: {
      cpf: "555.666.777-88",
      user: {
        first_name: "Ana",
        last_name: "Costa",
      },
    },
  },
  {
    id: 5,
    status: "pendente",
    user_data: {
      cpf: "999.888.777-66",
      user: {
        first_name: "Carlos",
        last_name: "Ferreira",
      },
    },
  },
  {
    id: 6,
    status: "ativo",
    user_data: {
      cpf: "444.333.222-11",
      user: {
        first_name: "Julia",
        last_name: "Rodrigues",
      },
    },
  },
  {
    id: 7,
    status: "cancelado",
    user_data: {
      cpf: "777.888.999-00",
      user: {
        first_name: "Lucas",
        last_name: "Almeida",
      },
    },
  },
  {
    id: 8,
    status: "ativo",
    user_data: {
      cpf: "222.333.444-55",
      user: {
        first_name: "Fernanda",
        last_name: "Lima",
      },
    },
  },
];

export const useContracts = () => {
  const [contracts, setContracts] = useState<Contract[]>(MOCK_CONTRACTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContracts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Substituir pelo endpoint real da API
      // const response = await httpClient.get<Contract[]>(API_URL, "/contracts/");
      
      // Simular delay de requisição
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Usar dados mockados
      setContracts([...MOCK_CONTRACTS]);
    } catch (err: any) {
      setError(err?.message || "Erro ao buscar contratos");
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    contracts,
    loading,
    error,
    fetchContracts,
  };
};


