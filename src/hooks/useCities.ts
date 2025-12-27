import { useState, useCallback } from "react";

// Definindo tipos localmente para evitar problemas de importação
interface CityDataPayload {
  localidade: string;
  uf: string;
  active: boolean;
}

interface City extends CityDataPayload {
  id: number;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "warning" | "info";
}

// Dados mockados iniciais
const MOCK_CITIES: City[] = [
  { id: 1, localidade: "São Paulo", uf: "SP", active: true },
  { id: 2, localidade: "Rio de Janeiro", uf: "RJ", active: true },
  { id: 3, localidade: "Belo Horizonte", uf: "MG", active: true },
  { id: 4, localidade: "Curitiba", uf: "PR", active: false },
  { id: 5, localidade: "Porto Alegre", uf: "RS", active: true },
  { id: 6, localidade: "Brasília", uf: "DF", active: true },
  { id: 7, localidade: "Salvador", uf: "BA", active: false },
  { id: 8, localidade: "Fortaleza", uf: "CE", active: true },
  { id: 9, localidade: "Recife", uf: "PE", active: true },
  { id: 10, localidade: "Manaus", uf: "AM", active: true },
  { id: 11, localidade: "Goiânia", uf: "GO", active: true },
  { id: 12, localidade: "Belém", uf: "PA", active: true },
  { id: 13, localidade: "Guarulhos", uf: "SP", active: true },
  { id: 14, localidade: "Campinas", uf: "SP", active: false },
  { id: 15, localidade: "São Luís", uf: "MA", active: true },
];

export const useCities = () => {
  const [cities, setCities] = useState<City[]>(MOCK_CITIES);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "info",
  });

  const showSnackbar = useCallback(
    (message: string, severity: SnackbarState["severity"] = "info") => {
      setSnackbar({ open: true, message, severity });
    },
    []
  );

  const closeSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  const fetchCities = useCallback(async () => {
    setLoading(true);
    try {
      // TODO: Substituir pelo endpoint real da API
      // const response = await httpClient.get<City[]>(API_URL, "/admin/cities/");
      
      // Simular delay de requisição
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Usar dados mockados
      setCities([...MOCK_CITIES]);
    } catch (error: any) {
      showSnackbar(
        error?.message || "Erro ao buscar cidades",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

  const createCity = useCallback(
    async (payload: CityDataPayload) => {
      try {
        // TODO: Substituir pelo endpoint real da API
        // const response = await httpClient.post<City>(API_URL, "/admin/cities/", payload);
        
        // Mock: criar cidade
        const newCity: City = {
          id: cities.length + 1,
          ...payload,
        };
        
        // Simular delay de requisição
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        setCities((prev) => [...prev, newCity]);
        showSnackbar("Cidade criada com sucesso!", "success");
      } catch (error: any) {
        showSnackbar(
          error?.message || "Erro ao criar cidade",
          "error"
        );
      }
    },
    [cities.length, showSnackbar]
  );

  const updateCity = useCallback(
    async (id: string, payload: CityDataPayload) => {
      try {
        // TODO: Substituir pelo endpoint real da API
        // const response = await httpClient.patch<City>(API_URL, `/admin/cities/${id}/`, payload);
        
        // Mock: atualizar cidade
        // Simular delay de requisição
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        setCities((prev) =>
          prev.map((city) =>
            city.id === Number(id) ? { ...city, ...payload } : city
          )
        );
        showSnackbar("Cidade atualizada com sucesso!", "success");
      } catch (error: any) {
        showSnackbar(
          error?.message || "Erro ao atualizar cidade",
          "error"
        );
      }
    },
    [showSnackbar]
  );

  return {
    cities,
    loading,
    snackbar,
    closeSnackbar,
    fetchCities,
    createCity,
    updateCity,
  };
};

