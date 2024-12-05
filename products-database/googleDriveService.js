import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Definir __filename e __dirname para ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminho para o arquivo de credenciais do Google Drive
const KEYFILEPATH = path.join(__dirname, '../google-key-api.json'); // Ajuste o caminho conforme necessário

// Autenticação com a API do Google
const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: ['https://www.googleapis.com/auth/drive'],
});

const drive = google.drive({ version: 'v3', auth });

/**
 * Função para enviar arquivos para o Google Drive
 * @param {string} filePath - Caminho do arquivo local
 * @param {string} fileName - Nome do arquivo no Google Drive
 * @param {string} folderId - ID da pasta no Google Drive (opcional)
 * @returns {object} - Informações do arquivo no Google Drive
 */
export const uploadFile = async (filePath, fileName, folderId = null) => {
  try {
    const fileMetadata = {
      name: fileName,
      parents: folderId ? [folderId] : [], // Opcional: armazenar em uma pasta específica
    };

    const media = {
      mimeType: 'image/jpeg', // Altere para o tipo do seu arquivo
      body: fs.createReadStream(filePath),
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, name, webViewLink, webContentLink',
    });

    return response.data;
  } catch (error) {
    console.error('Erro ao enviar arquivo para o Google Drive:', error);
    throw new Error('Erro ao enviar arquivo');
  }
};
