import type { Runtime } from './runtime';
import { Document } from './document';
import { Bitmap } from './bitmap';

export class Viewer {
  constructor(public runtime: Runtime) {}

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
      let msg = 'Document loading failed';
      const code = this.runtime.lastErrorCode();
      if (!code) {
        this.runtime.free(docPtr);
        msg += ` ${code}`;
      }
      console.error(msg);
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
  createBitmap(width: number, height: number, alpha: number) {
    const ptr = this.runtime.createBitmap(width, height, alpha);
    return new Bitmap(this.runtime, ptr);
  }

  /**
   * Creates a bitmap with params.
   */
  createBitmapWith(
    width: number,
    height: number,
    format = Bitmap.format,
    firstScan?: number,
    stride?: number
  ) {
    const ptr = this.runtime.createBitmapWith(
      width,
      height,
      format,
      firstScan,
      stride
    );
    return new Bitmap(this.runtime, ptr, format);
  }
}
