#!/bin/bash

# Script de teste de autenticação
# Uso: ./test-auth.sh [email] [password]

API_URL="http://186.248.135.172:31535"

echo "=========================================="
echo "Teste de Autenticação - API Backend"
echo "=========================================="
echo ""

# Pegar credenciais dos argumentos ou usar padrão
EMAIL=${1:-"test@example.com"}
PASSWORD=${2:-"password123"}

echo "1. Testando endpoint de login..."
echo "URL: $API_URL/auth/login"
echo "Email: $EMAIL"
echo ""

# Fazer requisição de login
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\"}")

echo "Resposta do Login:"
echo "$LOGIN_RESPONSE" | jq '.' 2>/dev/null || echo "$LOGIN_RESPONSE"
echo ""

# Extrair tokens (se jq estiver disponível)
if command -v jq &> /dev/null; then
  ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.access // empty')
  REFRESH_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.refresh // empty')

  if [ -n "$ACCESS_TOKEN" ]; then
    echo "✓ Access Token obtido com sucesso!"
    echo "Token (primeiros 50 caracteres): ${ACCESS_TOKEN:0:50}..."
    echo ""

    # Testar endpoint protegido
    echo "2. Testando endpoint protegido (User Profiles)..."
    echo "URL: $API_URL/admin/user-profiles"
    echo ""

    PROFILE_RESPONSE=$(curl -s -X GET "$API_URL/admin/user-profiles" \
      -H "Authorization: Bearer $ACCESS_TOKEN" \
      -H "Content-Type: application/json")

    echo "Resposta do User Profiles:"
    echo "$PROFILE_RESPONSE" | jq '.' 2>/dev/null || echo "$PROFILE_RESPONSE"
    echo ""

    # Testar refresh token
    echo "3. Testando refresh token..."
    echo "URL: $API_URL/auth/refresh-token"
    echo ""

    REFRESH_RESPONSE=$(curl -s -X POST "$API_URL/auth/refresh-token" \
      -H "Content-Type: application/json" \
      -d "{\"refresh\": \"$REFRESH_TOKEN\"}")

    echo "Resposta do Refresh Token:"
    echo "$REFRESH_RESPONSE" | jq '.' 2>/dev/null || echo "$REFRESH_RESPONSE"
    echo ""

  else
    echo "✗ Falha no login - Token não obtido"
    echo "Verifique as credenciais e tente novamente"
  fi
else
  echo "⚠ jq não está instalado - Instalando para análise JSON..."
  echo "Execute: brew install jq (macOS) ou apt-get install jq (Linux)"
fi

echo "=========================================="
echo "Teste finalizado"
echo "=========================================="
