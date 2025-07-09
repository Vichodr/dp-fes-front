import { apiRequest, Document } from './api';

export class DocumentService {
  // Obtener documentos del usuario
  static async getUserDocuments(): Promise<{ documents: Document[] }> {
    return await apiRequest<{ documents: Document[] }>('/documents');
  }

  // Subir un documento
  static async uploadDocument(file: File): Promise<{ message: string; document_id: number }> {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('accessToken');
    
    const response = await fetch('http://localhost:8000/documents/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Rechazar un documento
  static async rejectDocument(documentId: number): Promise<{ message: string }> {
    return await apiRequest<{ message: string }>(`/documents/${documentId}/reject`, {
      method: 'POST',
    });
  }

  // Obtener un documento específico
  static async getDocument(documentId: number): Promise<Document> {
    // Intentar obtener todos los documentos y filtrar por id
    const { documents } = await this.getUserDocuments();
    const doc = documents.find((d) => d.id === documentId);
    if (!doc) {
      throw new Error('Documento no encontrado');
    }
    return doc;
  }

  // Descargar un documento
  static async downloadDocument(documentId: number): Promise<Blob> {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(`http://localhost:8000/documents/${documentId}/download`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
    }

    return response.blob();
  }

  // Firmar un documento
  static async signDocument(documentId: number): Promise<any> {
    return await apiRequest<any>(`/documents/${documentId}/sign`, {
      method: 'POST',
    });
  }
} 