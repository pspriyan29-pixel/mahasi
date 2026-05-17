import * as pdfjsLib from "pdfjs-dist";

// Set worker source for PDF.js (vite environment)
// In Vite, we can usually rely on the default worker or import it as a URL
// For simplicity, we'll configure the GlobalWorkerOptions dynamically or let it fallback.
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export type UploadStatus = "idle" | "processing" | "ready" | "error";
export type AttachmentType = "image" | "audio" | "document";

export interface Attachment {
  id: string;
  type: AttachmentType;
  name: string;
  mimeType: string;
  base64?: string;
  url?: string;
  content?: string; // For extracted text or transcriptions
  size: number;
  status: UploadStatus;
}

const MAX_IMAGE_SIZE_MB = 5;

/**
 * Compresses an image if it's too large, returning a base64 Data URL.
 */
export async function compressImageBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // If file is already small enough, just return original base64
        if (file.size < MAX_IMAGE_SIZE_MB * 1024 * 1024) {
          resolve(e.target?.result as string);
          return;
        }

        // Compress
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Extracts text from a PDF file locally.
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";
    
    // We limit to 20 pages to prevent local freezing on massive documents
    const maxPages = Math.min(pdf.numPages, 20);
    for (let i = 1; i <= maxPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(" ");
      fullText += pageText + "\n";
    }
    
    if (pdf.numPages > 20) {
      fullText += "\n[Note: Document truncated after 20 pages to preserve memory.]";
    }
    return fullText.trim();
  } catch (error) {
    console.error("PDF Parsing Error:", error);
    throw new Error("Failed to extract text from PDF");
  }
}

/**
 * Mocks audio transcription (Placeholder for Whisper API)
 */
export async function transcribeAudio(file: File): Promise<string> {
  // Simulate network delay for API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`[Transcribed Audio from ${file.name}]: I am an audio message that was converted to text.`);
    }, 2000);
  });
}

/**
 * Main pipeline orchestrator for a single file
 */
export async function processAttachment(
  file: File, 
  onStatusUpdate?: (status: UploadStatus) => void
): Promise<Attachment> {
  const id = Math.random().toString(36).substr(2, 9);
  const attachment: Attachment = {
    id,
    name: file.name,
    mimeType: file.type,
    size: file.size,
    type: "document",
    status: "processing"
  };

  if (onStatusUpdate) onStatusUpdate("processing");

  try {
    if (file.type.startsWith("image/")) {
      attachment.type = "image";
      attachment.base64 = await compressImageBase64(file);
    } 
    else if (file.type === "application/pdf") {
      attachment.type = "document";
      attachment.content = await extractTextFromPDF(file);
    }
    else if (file.type.startsWith("audio/")) {
      attachment.type = "audio";
      attachment.content = await transcribeAudio(file);
    }
    else if (file.type === "text/plain" || file.type === "text/markdown") {
      attachment.type = "document";
      attachment.content = await file.text();
    }
    else {
      // Fallback for unsupported
      attachment.status = "error";
      if (onStatusUpdate) onStatusUpdate("error");
      return attachment;
    }

    attachment.status = "ready";
    if (onStatusUpdate) onStatusUpdate("ready");
    return attachment;
  } catch (err) {
    attachment.status = "error";
    if (onStatusUpdate) onStatusUpdate("error");
    return attachment;
  }
}
