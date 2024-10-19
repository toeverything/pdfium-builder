import { ErrorCode } from '@toeverything/pdf-viewer-types';
import { type PDFiumModule } from '@toeverything/pdfium';
import { Document } from './document';

export class Viewer {
  #engine: PDFiumModule;

  constructor(engine: PDFiumModule) {
    this.#engine = engine;
  }

  /**
   * Gets PDFium bindings.
   */
  get #bindings() {
    return this.#engine.wasmExports;
  }

  /**
   * Gets last error code when a function fails.
   */
  lastErrorCode() {
    return this.#bindings.FPDF_GetLastError<ErrorCode>();
  }

  copyBytesToPDFium(bytes: Uint8Array) {
    const size = bytes.length;
    const bytesPtr = this.#bindings.malloc(size);
    this.#engine.HEAPU8.set(bytes, bytesPtr);
    return bytesPtr;
  }

  /**
   * Opens and load a PDF document from memory.
   */
  open(bytes: Uint8Array, password?: string) {
    const size = bytes.length;
    const bytesPtr = this.copyBytesToPDFium(bytes);

    let passwordPtr = 0;
    const passwordLength = password?.length ?? 0;
    if (passwordLength) {
      passwordPtr = this.#bindings.malloc(passwordLength);
      this.#engine.stringToUTF8(password!, passwordPtr, passwordLength + 1);
    }

    const docPtr = this.#bindings.FPDF_LoadMemDocument64(
      bytesPtr,
      size,
      passwordPtr
    );

    if (passwordLength) {
      this.#bindings.free(passwordPtr);
    }

    if (!docPtr) {
      const code = this.lastErrorCode();
      if (!code) {
        this.#bindings.free(docPtr);
        console.error(code);
      }
      return;
    }

    return new Document(this.#engine, docPtr);
  }

  /**
   * Opens and load a PDF document from memory with Blob format.
   */
  async openWithBlob(blob: Blob, password?: string) {
    const buffer = new Uint8Array(await blob.arrayBuffer());
    return this.open(buffer, password);
  }

  /**
   * Closes a PDF document.
   */
  close(docPtr: number) {
    this.#bindings.FPDF_CloseDocument(docPtr);
    this.#bindings.free(docPtr);
  }
}
