import { type PDFiumModule } from '@toeverything/pdfium';

export class Document {
  #engine: PDFiumModule;

  constructor(
    engine: PDFiumModule,
    public ptr: number
  ) {
    this.#engine = engine;
  }

  /**
   * Gets PDFium bindings.
   */
  get #bindings() {
    return this.#engine.wasmExports;
  }

  destroy() {
    this.#bindings.FPDF_CloseDocument(this.ptr);
    this.#bindings.free(this.ptr);
  }
}
