import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import fs from 'fs/promises';
import dotenv from "dotenv";
dotenv.config();
import express from "express";
/**
 * Parse resume from PDF or DOCX file
 * @param {string} filePath - Path to the resume file
 * @param {string} mimeType - MIME type of the file
 * @returns {Promise<string>} - Extracted text content
 */
export async function parseResume(filePath, mimeType) {
  try {
    if (mimeType === 'application/pdf') {
      return await parsePDF(filePath);
    } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return await parseDOCX(filePath);
    } else {
      throw new Error('Unsupported file type. Please upload PDF or DOCX.');
    }
  } catch (error) {
    console.error('Error parsing resume:', error);
    throw new Error('Failed to parse resume. Please ensure the file is not corrupted.');
  }
}

/**
 * Parse PDF file
 */
async function parsePDF(filePath) {
  const dataBuffer = await fs.readFile(filePath);
  const data = await pdfParse(dataBuffer);
  return cleanText(data.text);
}

/**
 * Parse DOCX file
 */
async function parseDOCX(filePath) {
  const result = await mammoth.extractRawText({ path: filePath });
  return cleanText(result.value);
}

/**
 * Clean and normalize extracted text
 */
function cleanText(text) {
  return text
    .replace(/\r\n/g, '\n')  // Normalize line breaks
    .replace(/\s+/g, ' ')     // Normalize whitespace
    .replace(/\n\s*\n/g, '\n') // Remove extra blank lines
    .trim();
}
