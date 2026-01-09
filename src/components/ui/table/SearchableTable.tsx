import React, { useState, useMemo } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  InputAdornment,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import {
  designSystem,
  paperStyles,
  tableHeadStyles,
  tableRowHoverStyles,
} from "../../../styles/designSystem";

export interface Column {
  id: string;
  label: string;
  minWidth?: number;
  align?: "right" | "left" | "center";
  format?: (value: any) => string;
}

export interface SearchableTableProps {
  columns: Column[];
  rows: any[];
  searchPlaceholder?: string;
  title?: string;
}

const SearchableTable: React.FC<SearchableTableProps> = ({
  columns,
  rows,
  searchPlaceholder = "Pesquisar...",
  title,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRows = useMemo(() => {
    if (!searchTerm) return rows;

    return rows.filter((row) =>
      columns.some((column) => {
        const value = row[column.id];
        if (value === null || value === undefined) return false;
        return String(value)
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      })
    );
  }, [rows, searchTerm, columns]);

  return (
    <Box sx={{ width: "100%", height: "100%" }}>
      {title && (
        <Typography
          variant="h6"
          sx={{
            mb: 2,
            color: designSystem.colors.primary.main,
            fontWeight: 600,
            fontSize: "1rem",
          }}
        >
          {title}
        </Typography>
      )}
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: designSystem.colors.primary.main }} />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: designSystem.colors.primary.main,
              },
              "&:hover fieldset": {
                borderColor: designSystem.colors.primary.main,
              },
              "&.Mui-focused fieldset": {
                borderColor: designSystem.colors.primary.main,
              },
            },
          }}
        />
      </Box>
      <TableContainer
        component={Paper}
        {...paperStyles}
        sx={{
          ...paperStyles.sx,
          maxHeight: 600,
        }}
      >
        <Table stickyHeader aria-label="tabela pesquisável">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || "left"}
                  {...tableHeadStyles}
                  sx={{
                    ...tableHeadStyles.sx,
                    minWidth: column.minWidth,
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  align="center"
                  sx={{ py: 3, color: designSystem.colors.text.disabled }}
                >
                  {searchTerm
                    ? "Nenhum resultado encontrado"
                    : "Nenhum dado disponível"}
                </TableCell>
              </TableRow>
            ) : (
              filteredRows.map((row, index) => (
                <TableRow key={index} {...tableRowHoverStyles}>
                  {columns.map((column) => {
                    const value = row[column.id];
                    return (
                      <TableCell
                        key={column.id}
                        align={column.align || "left"}
                        sx={{
                          fontSize: "0.875rem",
                          color: designSystem.colors.text.secondary,
                        }}
                      >
                        {column.format ? column.format(value) : value}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {searchTerm && (
        <Typography
          variant="caption"
          sx={{
            mt: 1,
            display: "block",
            color: designSystem.colors.text.disabled,
            textAlign: "right",
          }}
        >
          {filteredRows.length} resultado(s) encontrado(s)
        </Typography>
      )}
    </Box>
  );
};

export default SearchableTable;


