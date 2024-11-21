import { createWorker, type Worker } from 'tesseract.js';
import { billTemplates } from './billTemplates';

let worker: Worker | null = null;

export async function initializeOCR(): Promise<Worker> {
  if (!worker) {
    try {
      worker = await createWorker();
      
      // Configure worker after creation
      await worker.loadLanguage('deu+eng');
      await worker.initialize('deu+eng');
      await worker.setParameters({
        tessedit_char_whitelist: '0123456789.,€$£¥EURUSDGBPeuroTOALGESMBRAZHLNtotalgesumbetrg ',
        preserve_interword_spaces: '1',
        tessedit_pageseg_mode: '6',
        tessedit_ocr_engine_mode: '2',
        textord_heavy_nr: '1',
        textord_min_linesize: '2.5',
      });
    } catch (error) {
      console.error('Failed to initialize OCR:', error);
      throw new Error('Failed to initialize OCR system');
    }
  }
  return worker;
}

export async function terminateOCR() {
  if (worker) {
    await worker.terminate();
    worker = null;
  }
}

function findAmountInText(text: string, template: BillTemplate): string | null {
  for (const pattern of template.patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const amount = match[1].trim();
      if (template.validate(amount, text)) {
        return amount;
      }
    }
  }
  return null;
}

export async function scanImage(imageData: Blob | File): Promise<{ amount: string | null; text: string }> {
  try {
    const ocrWorker = await initializeOCR();
    const result = await ocrWorker.recognize(imageData);
    const text = result.data.text;

    // Try each template
    for (const template of billTemplates) {
      const amount = findAmountInText(text, template);
      if (amount) {
        return { amount, text };
      }
    }

    return { amount: null, text };
  } catch (error) {
    console.error('OCR Error:', error);
    throw error;
  }
}