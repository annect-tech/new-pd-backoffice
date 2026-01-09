# Design System - Backoffice

Este documento descreve o design system implementado no sistema, baseado na página `/seletivo`.

## 📋 Índice

- [Paleta de Cores](#paleta-de-cores)
- [Componentes Reutilizáveis](#componentes-reutilizáveis)
- [Padrões de Layout](#padrões-de-layout)
- [Exemplos de Uso](#exemplos-de-uso)

## 🎨 Paleta de Cores

### Cores Primárias (Roxo/Purple)
- **Main**: `#A650F0` - Cor principal do sistema
- **Dark**: `#9333EA` - Versão mais escura
- **Darker**: `#8B3DD9` - Versão ainda mais escura
- **Light**: `#C084FC` - Versão mais clara
- **Lighter**: `#F3E8FF` - Versão bem clara
- **Lightest**: `#FAF5FF` - Versão mais clara possível (backgrounds hover)

### Cores de Texto
- **Primary**: `#1F2937` - Texto principal (títulos, nomes)
- **Secondary**: `#374151` - Texto secundário
- **Tertiary**: `#4B5563` - Texto terciário
- **Disabled**: `#6B7280` - Texto desabilitado/menos importante
- **Hint**: `#9CA3AF` - Dicas e placeholders

### Cores de Background
- **Primary**: `#FFFFFF` - Background principal (branco)
- **Secondary**: `#F9FAFB` - Background secundário (cinza bem claro)
- **Tertiary**: `#F3F4F6` - Background terciário

### Cores de Borda
- **Main**: `#E5E7EB` - Borda principal
- **Light**: `#D1D5DB` - Borda clara
- **Dark**: `#9CA3AF` - Borda escura

### Cores de Status
- **Success**: `#10B981` (Verde)
- **Error**: `#EF4444` (Vermelho)
- **Warning**: `#F59E0B` (Amarelo/Laranja)
- **Info**: `#3B82F6` (Azul)

## 🧩 Componentes Reutilizáveis

### 1. PageHeader

Componente para cabeçalho de página com breadcrumbs, título, subtítulo e card informativo.

**Localização**: `src/components/ui/page/PageHeader.tsx`

**Props**:
```typescript
interface PageHeaderProps {
  title: string;              // Título principal
  subtitle?: string;          // Subtítulo (opcional)
  description?: string;       // Descrição no card informativo (opcional)
  breadcrumbs?: BreadcrumbItem[]; // Lista de breadcrumbs (opcional)
  showInfoCard?: boolean;     // Mostrar card informativo (padrão: true)
}
```

**Exemplo de uso**:
```tsx
<PageHeader
  title="Cidades"
  subtitle="Gerencie as cidades disponíveis no sistema."
  description="Esta página permite gerenciar as cidades..."
  breadcrumbs={[
    { label: "Dashboard", path: APP_ROUTES.DASHBOARD },
    { label: "Cidades" },
  ]}
/>
```

### 2. Design System Styles

Conjunto de estilos pré-configurados para componentes MUI.

**Localização**: `src/styles/designSystem.ts`

**Exports disponíveis**:
- `designSystem` - Objeto com todas as cores, espaçamentos, sombras, etc.
- `paperStyles` - Estilos para Paper/Card
- `toolbarStyles` - Estilos para Toolbar
- `tableHeadStyles` - Estilos para cabeçalhos de tabela
- `tableRowHoverStyles` - Estilos para linhas de tabela com hover
- `iconButtonStyles` - Estilos para IconButton
- `textFieldStyles` - Estilos para TextField
- `primaryButtonStyles` - Estilos para Button primário
- `progressStyles` - Estilos para CircularProgress

## 📐 Padrões de Layout

### Estrutura Base de Página

```tsx
<Box
  sx={{
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
  }}
>
  {/* Conteúdo Principal */}
  <Box
    sx={{
      flex: 1,
      p: { xs: 2, sm: 3, md: 4 },
      display: "flex",
      flexDirection: "column",
      overflow: "auto",
    }}
  >
    <Box
      sx={{
        maxWidth: 1400,
        width: "100%",
        margin: "0 auto",
      }}
    >
      {/* Header da Página */}
      <PageHeader {...props} />

      {/* Conteúdo */}
      <Fade in timeout={1000}>
        <Paper {...paperStyles}>
          {/* Seu conteúdo aqui */}
        </Paper>
      </Fade>
    </Box>
  </Box>
</Box>
```

### Toolbar de Pesquisa

```tsx
<Toolbar {...toolbarStyles}>
  <Box display="flex" alignItems="center" sx={{ flex: 1, maxWidth: 500 }}>
    <SearchIcon sx={{ mr: 1, color: designSystem.colors.text.disabled }} />
    <TextField
      placeholder="Pesquisar..."
      variant="standard"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      fullWidth
      {...textFieldStyles}
    />
  </Box>
  <Box display="flex" gap={1}>
    <IconButton onClick={refresh} {...iconButtonStyles}>
      <RefreshIcon />
    </IconButton>
    <Button onClick={add} {...primaryButtonStyles}>
      Adicionar
    </Button>
  </Box>
</Toolbar>
```

### Tabela Estilizada

```tsx
<Table>
  <TableHead>
    <TableRow>
      <TableCell {...tableHeadStyles}>Coluna 1</TableCell>
      <TableCell {...tableHeadStyles}>Coluna 2</TableCell>
    </TableRow>
  </TableHead>
  <TableBody>
    {data.map((item) => (
      <TableRow key={item.id} {...tableRowHoverStyles}>
        <TableCell sx={{ color: designSystem.colors.text.secondary }}>
          {item.value1}
        </TableCell>
        <TableCell sx={{ color: designSystem.colors.text.secondary }}>
          {item.value2}
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### Modal/Dialog

```tsx
<Dialog
  open={open}
  onClose={handleClose}
  fullWidth
  maxWidth="sm"
  slotProps={{
    paper: {
      sx: {
        borderRadius: 3,
      },
    },
  }}
>
  <DialogTitle sx={{
    fontWeight: 600,
    color: designSystem.colors.text.primary,
  }}>
    Título do Modal
  </DialogTitle>
  <DialogContent dividers sx={{ p: 3 }}>
    {/* Conteúdo */}
  </DialogContent>
  <DialogActions sx={{ p: 2 }}>
    <Button
      onClick={handleClose}
      sx={{
        color: designSystem.colors.primary.main,
        fontWeight: 600,
        "&:hover": {
          backgroundColor: designSystem.colors.primary.lightest,
        },
      }}
    >
      Cancelar
    </Button>
    <Button onClick={handleSave} {...primaryButtonStyles}>
      Salvar
    </Button>
  </DialogActions>
</Dialog>
```

## 🎯 Exemplos de Uso

### Páginas já atualizadas com o novo design:

1. ✅ **Seletivo** (`/seletivo`) - Página de referência original
2. ✅ **Cidades** (`/cidades`) - Atualizada com PageHeader e design system
3. ✅ **Usuários** (`/usuarios`) - Atualizada com lista de cards
4. ✅ **Contratos** (`/contratos`) - Atualizada com DataGrid estilizado

### Como aplicar em outras páginas:

1. **Importe os componentes necessários**:
```tsx
import PageHeader from "../../components/ui/page/PageHeader";
import {
  designSystem,
  paperStyles,
  toolbarStyles,
  tableHeadStyles,
  tableRowHoverStyles,
  iconButtonStyles,
  textFieldStyles,
  primaryButtonStyles,
  progressStyles,
} from "../../styles/designSystem";
```

2. **Use a estrutura base de layout** mostrada acima

3. **Adicione o PageHeader** no topo do conteúdo

4. **Envolva o conteúdo principal com Fade e Paper**:
```tsx
<Fade in timeout={1000}>
  <Paper {...paperStyles}>
    {/* Seu conteúdo */}
  </Paper>
</Fade>
```

5. **Use os estilos pré-configurados** nos componentes MUI

## 📝 Notas Importantes

- **Animações**: Use `<Fade in timeout={...}>` para animações suaves (600ms para breadcrumbs, 800ms para título, 1000ms para conteúdo)
- **Responsividade**: O sistema usa breakpoints do MUI (`xs`, `sm`, `md`, `lg`)
- **MaxWidth**: O conteúdo tem largura máxima de 1400px para manter legibilidade
- **Spacing**: Use o sistema de spacing do MUI (números de 1-5 multiplicados por 8px)
- **Hover States**: Todos os elementos interativos devem ter hover roxo claro (`#FAF5FF`)
- **Border Radius**: Use 2 para pequenos, 3 para médios, 5 para grandes elementos

## 🚀 Próximos Passos

Para aplicar o design nas páginas restantes:
- Cadastro de Alunos
- Dados de Alunos
- Aprovação Mérito
- Resultados (Provas, Mérito, ENEM)
- Retenção
- Documentos
- Lista de Presença
- Dashboard (ajustes finos)

Basta seguir os padrões documentados acima!
