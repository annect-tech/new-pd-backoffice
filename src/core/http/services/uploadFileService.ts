import { httpClient } from "../httpClient";
import { getApiUrl } from "../apiUrl";

const API_URL = getApiUrl();

export interface UploadSingleResponse {
  url: string;
  message?: string;
}

export interface UploadArrayResponse {
  urls: string[];
  message?: string;
}

export const uploadFileService = {
  /**
   * Faz upload de um único arquivo
   * @param file - Arquivo a ser enviado
   * @param additionalData - Dados adicionais opcionais
   */
  uploadSingle: (file: File, additionalData?: Record<string, any>) =>
    httpClient.uploadFile<UploadSingleResponse>(
      API_URL,
      "/upload-file/single",
      file,
      additionalData
    ),

  /**
   * Faz upload de múltiplos arquivos
   * @param files - Array de arquivos a serem enviados
   * @param additionalData - Dados adicionais opcionais
   */
  uploadArray: (files: File[], additionalData?: Record<string, any>) =>
    httpClient.uploadFiles<UploadArrayResponse>(
      API_URL,
      "/upload-file/array",
      files,
      additionalData
    ),
};
