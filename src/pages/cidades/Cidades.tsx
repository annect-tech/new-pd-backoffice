import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  Toolbar,
  Snackbar,
  Alert,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Breadcrumbs,
  Link,
  Chip,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  NavigateNext as NavigateNextIcon,
  Image as ImageIcon,
  PictureAsPdf as PictureAsPdfIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router";
import { useCities } from "../../hooks/useCities";
import { APP_ROUTES } from "../../util/constants";

// Definindo tipos localmente para evitar problemas de importação
interface CityDataPayload {
  localidade: string;
  uf: string;
  active: boolean;
}

interface City extends CityDataPayload {
  id: number;
}

type Mode = "create" | "edit";

const Cidades: React.FC = () => {
  const navigate = useNavigate();
  const {
    cities,
    loading,
    createCity,
    updateCity,
    snackbar,
    closeSnackbar,
    fetchCities,
  } = useCities();

  const [searchTerm, setSearchTerm] = useState("");
  const [mode, setMode] = useState<Mode>("create");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CityDataPayload>({
    localidade: "",
    uf: "",
    active: true,
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [editalFile, setEditalFile] = useState<File | null>(null);
  const [logoError, setLogoError] = useState<string>("");
  const [editalError, setEditalError] = useState<string>("");

  const filtered = useMemo(() => {
    return cities.filter(
      (c) =>
        c.localidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.uf.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [cities, searchTerm]);

  const paginatedData = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filtered.slice(startIndex, startIndex + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpen = (m: Mode, city?: City) => {
    setMode(m);
    if (m === "edit" && city) {
      setForm({
        localidade: city.localidade,
        uf: city.uf,
        active: city.active,
      });
      setEditingId(city.id);
    } else {
      setForm({ localidade: "", uf: "", active: true });
      setEditingId(null);
    }
    setLogoFile(null);
    setEditalFile(null);
    setLogoError("");
    setEditalError("");
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setLogoFile(null);
    setEditalFile(null);
    setLogoError("");
    setEditalError("");
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setLogoFile(null);
      setLogoError("");
      return;
    }

    // Validar se é imagem
    if (!file.type.startsWith("image/")) {
      setLogoError("Por favor, selecione apenas arquivos de imagem.");
      setLogoFile(null);
      return;
    }

    setLogoFile(file);
    setLogoError("");
  };

  const handleEditalChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setEditalFile(null);
      setEditalError("");
      return;
    }

    // Validar se é PDF
    if (file.type !== "application/pdf") {
      setEditalError("Por favor, selecione apenas arquivos PDF.");
      setEditalFile(null);
      return;
    }

    setEditalFile(file);
    setEditalError("");
  };

  const handleSave = async () => {
    if (mode === "create") {
      // TODO: Quando integrar com API, enviar logoFile e editalFile junto com form
      // const formData = new FormData();
      // formData.append("localidade", form.localidade);
      // formData.append("uf", form.uf);
      // formData.append("active", form.active.toString());
      // if (logoFile) formData.append("logo", logoFile);
      // if (editalFile) formData.append("edital", editalFile);
      
      // Por enquanto, apenas log dos arquivos (mockado)
      if (logoFile) {
        console.log("Logo selecionado:", logoFile.name, logoFile.size, "bytes");
      }
      if (editalFile) {
        console.log("Edital selecionado:", editalFile.name, editalFile.size, "bytes");
      }
      
      await createCity(form);
    } else if (editingId != null) {
      await updateCity(editingId.toString(), form);
    }
    await fetchCities();
    handleClose();
  };

  return (
    <Box p={2}>
      {/* Breadcrumb */}
      <Breadcrumbs
        aria-label="breadcrumb"
        separator={<NavigateNextIcon fontSize="small" />}
        sx={{ mb: 3 }}
      >
        <Link
          component="button"
          variant="body1"
          onClick={() => navigate(APP_ROUTES.DASHBOARD)}
          sx={{
            color: "#A650F0",
            textDecoration: "none",
            cursor: "pointer",
            "&:hover": {
              textDecoration: "underline",
            },
          }}
        >
          Dashboard
        </Link>
        <Typography color="text.primary">Cidades</Typography>
      </Breadcrumbs>

      {/* Título e Texto Explicativo */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          sx={{
            color: "#A650F0",
            fontWeight: 600,
            mb: 2,
          }}
        >
          Gerenciamento de Cidades
        </Typography>
        <Paper
          elevation={1}
          sx={{
            p: 2,
            backgroundColor: "#F3E5F5",
            borderRadius: 2,
            borderLeft: "4px solid #A650F0",
          }}
        >
          <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
            <strong>Gerenciamento de Cidades</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Esta página permite gerenciar as cidades disponíveis no sistema. Você pode criar novas cidades,
            editar informações existentes, ativar ou desativar cidades, e pesquisar por nome ou UF.
            Utilize a barra de pesquisa para filtrar cidades e os botões de ação para gerenciar cada registro.
          </Typography>
        </Paper>
      </Box>

      <Paper elevation={2} sx={{ borderRadius: 2, overflow: "hidden" }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
          <Box display="flex" alignItems="center" sx={{ flex: 1, maxWidth: 400 }}>
            <SearchIcon sx={{ mr: 1, color: "#A650F0" }} />
            <TextField
              placeholder="Pesquisar por cidade ou UF..."
              variant="standard"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              fullWidth
              sx={{
                "& .MuiInput-underline:before": {
                  borderBottomColor: "#A650F0",
                },
                "& .MuiInput-underline:hover:before": {
                  borderBottomColor: "#A650F0",
                },
                "& .MuiInput-underline:after": {
                  borderBottomColor: "#A650F0",
                },
              }}
            />
          </Box>
          <Box>
            <IconButton onClick={fetchCities} title="Atualizar lista">
              <RefreshIcon />
            </IconButton>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpen("create")}
              sx={{
                backgroundColor: "#A650F0",
                "&:hover": { backgroundColor: "#8B3DD9" },
              }}
            >
              Adicionar
            </Button>
          </Box>
        </Toolbar>

        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        backgroundColor: "#A650F0",
                        color: "white",
                        fontWeight: 600,
                      }}
                    >
                      ID
                    </TableCell>
                    <TableCell
                      sx={{
                        backgroundColor: "#A650F0",
                        color: "white",
                        fontWeight: 600,
                      }}
                    >
                      Cidade
                    </TableCell>
                    <TableCell
                      sx={{
                        backgroundColor: "#A650F0",
                        color: "white",
                        fontWeight: 600,
                      }}
                    >
                      UF
                    </TableCell>
                    <TableCell
                      sx={{
                        backgroundColor: "#A650F0",
                        color: "white",
                        fontWeight: 600,
                      }}
                    >
                      Status
                    </TableCell>
                    <TableCell
                      sx={{
                        backgroundColor: "#A650F0",
                        color: "white",
                        fontWeight: 600,
                      }}
                    >
                      Ações
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          Nenhuma cidade encontrada
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((city, index) => (
                      <TableRow
                        key={city.id}
                        sx={{
                          backgroundColor:
                            index % 2 === 0 ? "#F5F5F5" : "white",
                          "&:hover": {
                            backgroundColor: "#E1BEE7",
                            cursor: "pointer",
                          },
                        }}
                      >
                        <TableCell>{city.id}</TableCell>
                        <TableCell>{city.localidade}</TableCell>
                        <TableCell>{city.uf}</TableCell>
                        <TableCell>
                          <Chip
                            label={city.active ? "Ativo" : "Inativo"}
                            color={city.active ? "success" : "default"}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => handleOpen("edit", city)}
                            sx={{ color: "#A650F0" }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={filtered.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
              labelRowsPerPage="Linhas por página:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} de ${count}`
              }
            />
          </>
        )}
      </Paper>

      {/* Modal */}
      <Dialog 
        open={open} 
        onClose={handleClose} 
        fullWidth 
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle sx={{ m: 0, p: 2, backgroundColor: "#A650F0", color: "white" }}>
          {mode === "create" ? "Criar Cidade" : "Editar Cidade"}
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: "white",
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <TextField
            fullWidth
            label="Cidade"
            margin="normal"
            value={form.localidade}
            onChange={(e) =>
              setForm((f) => ({ ...f, localidade: e.target.value }))
            }
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": {
                  borderColor: "#A650F0",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#A650F0",
                },
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: "#A650F0",
              },
            }}
          />
          <TextField
            fullWidth
            label="UF"
            margin="normal"
            value={form.uf}
            onChange={(e) =>
              setForm((f) => ({ ...f, uf: e.target.value.toUpperCase() }))
            }
            inputProps={{ maxLength: 2 }}
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": {
                  borderColor: "#A650F0",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#A650F0",
                },
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: "#A650F0",
              },
            }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={form.active}
                onChange={(e) =>
                  setForm((f) => ({ ...f, active: e.target.checked }))
                }
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": {
                    color: "#A650F0",
                  },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    backgroundColor: "#A650F0",
                  },
                }}
              />
            }
            label="Ativo"
          />

          {/* Campos de upload apenas no modo create */}
          {mode === "create" && (
            <>
              <Box sx={{ mt: 3 }}>
                <Typography
                  variant="h6"
                  sx={{ mb: 2, color: "#A650F0", fontWeight: 600 }}
                >
                  Partes WhiteLabel's do Seletivo:
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 1, color: "#A650F0", fontWeight: 600 }}
                >
                  Logo da Cidade
                </Typography>
                <input
                  accept="image/*"
                  style={{ display: "none" }}
                  id="logo-upload"
                  type="file"
                  onChange={handleLogoChange}
                />
                <label htmlFor="logo-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<ImageIcon />}
                    fullWidth
                    sx={{
                      borderColor: "#A650F0",
                      color: "#A650F0",
                      "&:hover": {
                        borderColor: "#8B3DD9",
                        backgroundColor: "#F3E5F5",
                      },
                      py: 1.5,
                    }}
                  >
                    {logoFile ? logoFile.name : "Selecionar Logo (Apenas Imagens)"}
                  </Button>
                </label>
                {logoError && (
                  <Typography
                    variant="caption"
                    sx={{ color: "error.main", mt: 0.5, display: "block" }}
                  >
                    {logoError}
                  </Typography>
                )}
                {logoFile && (
                  <Typography
                    variant="caption"
                    sx={{ color: "success.main", mt: 0.5, display: "block" }}
                  >
                    Arquivo selecionado: {logoFile.name} ({(logoFile.size / 1024).toFixed(2)} KB)
                  </Typography>
                )}
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 1, color: "#A650F0", fontWeight: 600 }}
                >
                  Edital
                </Typography>
                <input
                  accept="application/pdf"
                  style={{ display: "none" }}
                  id="edital-upload"
                  type="file"
                  onChange={handleEditalChange}
                />
                <label htmlFor="edital-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<PictureAsPdfIcon />}
                    fullWidth
                    sx={{
                      borderColor: "#A650F0",
                      color: "#A650F0",
                      "&:hover": {
                        borderColor: "#8B3DD9",
                        backgroundColor: "#F3E5F5",
                      },
                      py: 1.5,
                    }}
                  >
                    {editalFile ? editalFile.name : "Selecionar Edital (Apenas PDF)"}
                  </Button>
                </label>
                {editalError && (
                  <Typography
                    variant="caption"
                    sx={{ color: "error.main", mt: 0.5, display: "block" }}
                  >
                    {editalError}
                  </Typography>
                )}
                {editalFile && (
                  <Typography
                    variant="caption"
                    sx={{ color: "success.main", mt: 0.5, display: "block" }}
                  >
                    Arquivo selecionado: {editalFile.name} ({(editalFile.size / 1024).toFixed(2)} KB)
                  </Typography>
                )}
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={handleClose}
            sx={{
              color: "#A650F0",
              "&:hover": {
                backgroundColor: "#F3E5F5",
              },
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            sx={{
              backgroundColor: "#A650F0",
              "&:hover": { backgroundColor: "#8B3DD9" },
            }}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={closeSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Cidades;
