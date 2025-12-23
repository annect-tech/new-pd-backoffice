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
            color: "#A650F0",
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
                <SearchIcon sx={{ color: "#A650F0" }} />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: "#A650F0",
              },
              "&:hover fieldset": {
                borderColor: "#A650F0",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#A650F0",
              },
            },
          }}
        />
      </Box>
      <TableContainer
        component={Paper}
        sx={{
          maxHeight: 600,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          borderRadius: 2,
        }}
      >
        <Table stickyHeader aria-label="tabela pesquisável">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || "left"}
                  style={{
                    minWidth: column.minWidth,
                    backgroundColor: "#A650F0",
                    color: "#FFFFFF",
                    fontWeight: 600,
                    fontSize: "0.875rem",
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
                  sx={{ py: 3, color: "#666" }}
                >
                  {searchTerm
                    ? "Nenhum resultado encontrado"
                    : "Nenhum dado disponível"}
                </TableCell>
              </TableRow>
            ) : (
              filteredRows.map((row, index) => (
                <TableRow
                  key={index}
                  hover
                  sx={{
                    "&:nth-of-type(odd)": {
                      backgroundColor: "#F9F9F9",
                    },
                    "&:hover": {
                      backgroundColor: "#F3E5F5",
                    },
                  }}
                >
                  {columns.map((column) => {
                    const value = row[column.id];
                    return (
                      <TableCell
                        key={column.id}
                        align={column.align || "left"}
                        sx={{
                          fontSize: "0.875rem",
                          color: "#333",
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
            color: "#666",
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


