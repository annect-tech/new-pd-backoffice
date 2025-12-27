import { useState, useEffect } from 'react';

interface Document {
  id: number;
  user_data: number;
  user_name?: string;
  id_doc: string | null;
  id_doc_status: string;
  address_doc: string | null;
  address_doc_status: string;
  school_history_doc: string | null;
  school_history_doc_status: string;
  contract_doc: string | null;
  contract_doc_status: string;
  created_at: string;
}

// Dados mockados
const MOCK_DOCUMENTS: Document[] = [
  {
    id: 1,
    user_data: 1,
    user_name: 'João Silva',
    id_doc: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    id_doc_status: 'aprovado',
    address_doc: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    address_doc_status: 'aprovado',
    school_history_doc: null,
    school_history_doc_status: 'pendente',
    contract_doc: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    contract_doc_status: 'aprovado',
    created_at: '2024-01-15T10:30:00Z',
  },
  {
    id: 2,
    user_data: 2,
    user_name: 'Maria Santos',
    id_doc: null,
    id_doc_status: 'pendente',
    address_doc: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    address_doc_status: 'aprovado',
    school_history_doc: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    school_history_doc_status: 'aprovado',
    contract_doc: null,
    contract_doc_status: 'pendente',
    created_at: '2024-01-16T14:20:00Z',
  },
  {
    id: 3,
    user_data: 3,
    user_name: 'Pedro Oliveira',
    id_doc: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    id_doc_status: 'aprovado',
    address_doc: null,
    address_doc_status: 'pendente',
    school_history_doc: null,
    school_history_doc_status: 'pendente',
    contract_doc: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    contract_doc_status: 'aprovado',
    created_at: '2024-01-17T09:15:00Z',
  },
  {
    id: 4,
    user_data: 4,
    user_name: 'Ana Costa',
    id_doc: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    id_doc_status: 'reprovado',
    address_doc: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    address_doc_status: 'aprovado',
    school_history_doc: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    school_history_doc_status: 'aprovado',
    contract_doc: null,
    contract_doc_status: 'pendente',
    created_at: '2024-01-18T11:45:00Z',
  },
  {
    id: 5,
    user_data: 5,
    user_name: 'Carlos Ferreira',
    id_doc: null,
    id_doc_status: 'pendente',
    address_doc: null,
    address_doc_status: 'pendente',
    school_history_doc: null,
    school_history_doc_status: 'pendente',
    contract_doc: null,
    contract_doc_status: 'pendente',
    created_at: '2024-01-19T16:00:00Z',
  },
];

export const useDocuments = () => {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);

  useEffect(() => {
    // Simula carregamento de dados
    setTimeout(() => {
      setDocs(MOCK_DOCUMENTS);
      setLoading(false);
    }, 500);
  }, []);

  const uploadId = (userId: number, fileName: string, file: File) => {
    // Simula upload - apenas atualiza o estado local
    setDocs((prevDocs) =>
      prevDocs.map((doc) =>
        doc.user_data === userId
          ? {
              ...doc,
              id_doc: URL.createObjectURL(file),
              id_doc_status: 'pendente',
            }
          : doc
      )
    );
    console.log('Upload ID:', { userId, fileName, file });
  };

  const uploadAddress = (userId: number, fileName: string, file: File) => {
    // Simula upload - apenas atualiza o estado local
    setDocs((prevDocs) =>
      prevDocs.map((doc) =>
        doc.user_data === userId
          ? {
              ...doc,
              address_doc: URL.createObjectURL(file),
              address_doc_status: 'pendente',
            }
          : doc
      )
    );
    console.log('Upload Address:', { userId, fileName, file });
  };

  const uploadSchoolHistory = (userId: number, fileName: string, file: File) => {
    // Simula upload - apenas atualiza o estado local
    setDocs((prevDocs) =>
      prevDocs.map((doc) =>
        doc.user_data === userId
          ? {
              ...doc,
              school_history_doc: URL.createObjectURL(file),
              school_history_doc_status: 'pendente',
            }
          : doc
      )
    );
    console.log('Upload School History:', { userId, fileName, file });
  };

  return {
    docs,
    loading,
    error,
    uploadId,
    uploadAddress,
    uploadSchoolHistory,
  };
};

