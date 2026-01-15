import React, { useEffect, useState } from "react";
import { Box, Paper, Typography, Button, CircularProgress } from "@mui/material";
import { useSelector } from "react-redux";
import type { RootState } from "../../core/store";

const DiagnosticoCidades: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const auth = useSelector((state: RootState) => state.auth);

  const testarEndpoint = async () => {
    setLoading(true);
    const token = auth.accessToken;
    const testes = [];

    // Teste 1: Sem query params
    try {
      const url1 = "http://186.248.135.172:31535/admin/allowed-cities";
      const response1 = await fetch(url1, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data1 = await response1.json();
      testes.push({
        teste: "1. GET sem query params",
        url: url1,
        status: response1.status,
        data: data1,
      });
    } catch (error: any) {
      testes.push({
        teste: "1. GET sem query params",
        error: error.message,
      });
    }

    // Teste 2: Com page e size como números
    try {
      const url2 = "http://186.248.135.172:31535/admin/allowed-cities?page=1&size=10";
      const response2 = await fetch(url2, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data2 = await response2.json();
      testes.push({
        teste: "2. GET com page=1&size=10",
        url: url2,
        status: response2.status,
        data: data2,
      });
    } catch (error: any) {
      testes.push({
        teste: "2. GET com page=1&size=10",
        error: error.message,
      });
    }

    // Teste 3: Apenas com page
    try {
      const url3 = "http://186.248.135.172:31535/admin/allowed-cities?page=1";
      const response3 = await fetch(url3, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data3 = await response3.json();
      testes.push({
        teste: "3. GET apenas com page=1",
        url: url3,
        status: response3.status,
        data: data3,
      });
    } catch (error: any) {
      testes.push({
        teste: "3. GET apenas com page=1",
        error: error.message,
      });
    }

    // Teste 4: Com valores inválidos propositalmente
    try {
      const url4 = "http://186.248.135.172:31535/admin/allowed-cities?page=abc&size=xyz";
      const response4 = await fetch(url4, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data4 = await response4.json();
      testes.push({
        teste: "4. GET com valores inválidos (page=abc&size=xyz)",
        url: url4,
        status: response4.status,
        data: data4,
      });
    } catch (error: any) {
      testes.push({
        teste: "4. GET com valores inválidos",
        error: error.message,
      });
    }

    setResult({
      testes,
      userInfo: {
        id: auth.user?.id,
        username: auth.user?.username,
        roles: auth.user?.roles,
        tenant_city_id: (auth.user as any)?.tenant_city_id,
      },
    });

    setLoading(false);
  };

  useEffect(() => {
    console.log("🔐 Estado de autenticação:", {
      isAuthenticated: !!auth.accessToken,
      user: auth.user,
    });
  }, [auth]);

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Diagnóstico - Endpoint de Cidades
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Informações do Usuário Logado
        </Typography>
        <pre style={{ backgroundColor: "#f5f5f5", padding: 16, borderRadius: 8, overflow: "auto" }}>
          {JSON.stringify(auth.user, null, 2)}
        </pre>
      </Paper>

      <Button 
        variant="contained" 
        onClick={testarEndpoint}
        disabled={loading}
        sx={{ mb: 3 }}
      >
        {loading ? <CircularProgress size={24} /> : "Testar Endpoint"}
      </Button>

      {result && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Resultado do Teste
          </Typography>
          <pre style={{ backgroundColor: "#f5f5f5", padding: 16, borderRadius: 8, overflow: "auto" }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </Paper>
      )}
    </Box>
  );
};

export default DiagnosticoCidades;
