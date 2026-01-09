/**
 * Script de teste para validar integração com a API
 * Use este arquivo no Console do DevTools (F12 → Console)
 * 
 * Copie a função desejada e execute no console
 */

// ==========================================
// TESTE 1: Cities
// ==========================================
async function testCities() {
  console.log('🔄 Testando Cities...');
  try {
    const { citiesService } = await import('./src/core/http/services/citiesService');
    const response = await citiesService.list(1, 10);
    
    console.log('✅ Resposta recebida!');
    console.log('📊 Status:', response.status);
    console.log('💬 Mensagem:', response.message);
    console.log('📦 Dados:', response.data);
    
    if (response.data && response.data.data) {
      console.log(`✨ Total de cidades: ${response.data.totalItems}`);
      console.log('Primeira cidade:', response.data.data[0]);
    }
    
    return response;
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

// ==========================================
// TESTE 2: Exams
// ==========================================
async function testExams() {
  console.log('🔄 Testando Exams...');
  try {
    const { examsService } = await import('./src/core/http/services/examsService');
    const response = await examsService.list(1, 10);
    
    console.log('✅ Resposta recebida!');
    console.log('📊 Status:', response.status);
    console.log('💬 Mensagem:', response.message);
    console.log('📦 Dados:', response.data);
    
    if (response.data && response.data.data) {
      console.log(`✨ Total de exames: ${response.data.totalItems}`);
      console.log('Primeiro exame:', response.data.data[0]);
    }
    
    return response;
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

// ==========================================
// TESTE 3: ENEM Results
// ==========================================
async function testEnemResults() {
  console.log('🔄 Testando ENEM Results...');
  try {
    const { enemResultsService } = await import('./src/core/http/services/enemResultsService');
    const response = await enemResultsService.list(1, 10);
    
    console.log('✅ Resposta recebida!');
    console.log('📊 Status:', response.status);
    console.log('💬 Mensagem:', response.message);
    console.log('📦 Dados:', response.data);
    
    if (response.data && response.data.data) {
      console.log(`✨ Total de resultados ENEM: ${response.data.totalItems}`);
      console.log('Primeiro resultado:', response.data.data[0]);
    }
    
    return response;
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

// ==========================================
// TESTE 4: Exams Scheduled
// ==========================================
async function testExamsScheduled() {
  console.log('🔄 Testando Exams Scheduled...');
  try {
    const { examsScheduledService } = await import('./src/core/http/services/examsScheduledService');
    const response = await examsScheduledService.list(1, 10);
    
    console.log('✅ Resposta recebida!');
    console.log('📊 Status:', response.status);
    console.log('💬 Mensagem:', response.message);
    console.log('📦 Dados:', response.data);
    
    if (response.data && response.data.data) {
      console.log(`✨ Total de exames agendados: ${response.data.totalItems}`);
      console.log('Primeiro agendamento:', response.data.data[0]);
    }
    
    return response;
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

// ==========================================
// TESTE 5: Contracts
// ==========================================
async function testContracts() {
  console.log('🔄 Testando Contracts...');
  try {
    const { contractsService } = await import('./src/core/http/services/contractsService');
    const response = await contractsService.list(1, 10);
    
    console.log('✅ Resposta recebida!');
    console.log('📊 Status:', response.status);
    console.log('💬 Mensagem:', response.message);
    console.log('📦 Dados:', response.data);
    
    if (response.data && response.data.data) {
      console.log(`✨ Total de contratos: ${response.data.totalItems}`);
      console.log('Primeiro contrato:', response.data.data[0]);
    }
    
    return response;
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

// ==========================================
// TESTE 6: Selective
// ==========================================
async function testSelective() {
  console.log('🔄 Testando Selective...');
  try {
    const { selectiveService } = await import('./src/core/http/services/selectiveService');
    const response = await selectiveService.list(1, 10);
    
    console.log('✅ Resposta recebida!');
    console.log('📊 Status:', response.status);
    console.log('💬 Mensagem:', response.message);
    console.log('📦 Dados:', response.data);
    
    if (response.data && response.data.data) {
      console.log(`✨ Total de usuários: ${response.data.totalItems}`);
      console.log('Primeiro usuário:', response.data.data[0]);
    }
    
    return response;
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

// ==========================================
// TESTE 7: Academic Merit
// ==========================================
async function testAcademicMerit() {
  console.log('🔄 Testando Academic Merit...');
  try {
    const { academicMeritService } = await import('./src/core/http/services/academicMeritService');
    const response = await academicMeritService.list(1, 10);
    
    console.log('✅ Resposta recebida!');
    console.log('📊 Status:', response.status);
    console.log('💬 Mensagem:', response.message);
    console.log('📦 Dados:', response.data);
    
    if (response.data && response.data.data) {
      console.log(`✨ Total de documentos: ${response.data.totalItems}`);
      console.log('Primeiro documento:', response.data.data[0]);
    }
    
    return response;
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

// ==========================================
// TESTE TODOS
// ==========================================
async function testAll() {
  console.log('🚀 Iniciando testes de integração...\n');
  
  console.log('--- Teste 1: Cities ---');
  await testCities();
  console.log('\n');
  
  console.log('--- Teste 2: Exams ---');
  await testExams();
  console.log('\n');
  
  console.log('--- Teste 3: ENEM Results ---');
  await testEnemResults();
  console.log('\n');
  
  console.log('--- Teste 4: Exams Scheduled ---');
  await testExamsScheduled();
  console.log('\n');
  
  console.log('--- Teste 5: Contracts ---');
  await testContracts();
  console.log('\n');
  
  console.log('--- Teste 6: Selective ---');
  await testSelective();
  console.log('\n');
  
  console.log('--- Teste 7: Academic Merit ---');
  await testAcademicMerit();
  console.log('\n');
  
  console.log('✅ Testes concluídos!');
}

// ==========================================
// INSTRUÇÕES
// ==========================================
console.log(`
╔════════════════════════════════════════════════════════════════════╗
║          TESTE DE INTEGRAÇÃO - Sprint 4                           ║
║  Teste de Integração dos Hooks com os Serviços da API             ║
╚════════════════════════════════════════════════════════════════════╝

📝 COMO USAR:

1. Abra este arquivo (src/__tests__/test-integration.js)
2. Copie uma função (ou testAll) e cole no Console (F12)
3. Pressione Enter e observe os resultados

📚 FUNÇÕES DISPONÍVEIS:

  testCities()           - Testa Cities
  testExams()            - Testa Exams
  testEnemResults()      - Testa ENEM Results
  testExamsScheduled()   - Testa Exams Scheduled
  testContracts()        - Testa Contracts
  testSelective()        - Testa Selective
  testAcademicMerit()    - Testa Academic Merit
  testAll()              - Testa todos os serviços

✅ ESPERADO:
  - Status: 200 (ou 2xx)
  - Mensagem: Success
  - Data contém array com os dados
  - Dados incluem paginação (currentPage, totalItems, etc)

❌ SE ERRO:
  - Verifique VITE_API_URL no .env
  - Verifique se a API está rodando
  - Verifique o token de autenticação
  - Veja os logs da API backend

═══════════════════════════════════════════════════════════════════════
`);

// Exportar para uso
window.integrationTests = {
  testCities,
  testExams,
  testEnemResults,
  testExamsScheduled,
  testContracts,
  testSelective,
  testAcademicMerit,
  testAll
};
