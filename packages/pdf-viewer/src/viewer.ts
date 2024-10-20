import type { Runtime } from './runtime';
import { Document } from './document';
import { Bitmap } from './bitmap';

export class Viewer {
  /**
   * Gets PDFium runtime instance.
   */
  runtime: Runtime;

  constructor(runtime: Runtime) {
    this.runtime = runtime;
  }

  /**
   * Opens and load a PDF document from memory.
   */
  open(bytes: Uint8Array, password?: string) {
    const size = bytes.length;
    const bytesPtr = this.runtime.copyBytesTo(bytes);

    let passwordPtr = 0;
    if (password?.length) {
      passwordPtr = this.runtime.stringToNewUTF8(password);
    }

    const docPtr = this.runtime.openDocument(bytesPtr, size, passwordPtr);

    if (passwordPtr) {
      this.runtime.free(passwordPtr);
    }

    if (!docPtr) {
      const code = this.runtime.lastErrorCode();
      if (!code) {
        this.runtime.free(docPtr);
        console.error(code);
      }
      console.error(`Document loading failed`);
      return;
    }

    return new Document(this.runtime, docPtr);
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
    this.runtime.closeDocument(docPtr);
  }

  /**
   * Creates an empty bitmap.
   */
  createEmptyBitmap(width: number, height: number, format = Bitmap.format) {
    const ptr = this.runtime.createBitmap(width, height, format);
    return new Bitmap(this.runtime, ptr, format);
  }
}
