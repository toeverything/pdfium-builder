import type { FPDF_Config, PDFiumModule } from '@toeverything/pdfium';
import type {
  ErrorCode,
  BitmapFormat,
  FileIdentifier,
  PageMode,
  Rotation,
} from '@toeverything/pdf-viewer-types';

export const DefaultConfig: FPDF_Config = {
  version: 3,
  m_pIsolate: null,
  m_pPlatform: null,
  m_pUserFontPaths: null,
  m_v8EmbedderSlot: 0,
};

/**
 * PDFium runtime.
 */
export class Runtime {
  constructor(public engine: PDFiumModule) {
    this.init(DefaultConfig);
  }

  get wasm() {
    return this.engine.wasmExports;
  }

  get HEAPU8() {
    return this.engine.HEAPU8;
  }

  malloc(size: number) {
    return this.wasm.malloc(size);
  }

  free(ptr: number) {
    this.wasm.free(ptr);
  }

  stringToUTF8(str: string, strPtr: number, maxBytesToRead?: number) {
    this.engine.stringToUTF8(str, strPtr, maxBytesToRead);
  }

  stringToNewUTF8(str: string) {
    return this.engine.stringToNewUTF8(str);
  }

  UTF8ToString(ptr: number, maxBytesToRead?: number) {
    return this.engine.UTF8ToString(ptr, maxBytesToRead);
  }

  UTF16ToString(ptr: number, maxBytesToRead?: number) {
    return this.engine.UTF16ToString(ptr, maxBytesToRead);
  }

  getValue(ptr: number, type: Emscripten.CType) {
    return this.engine.getValue(ptr, type);
  }

  setValue(ptr: number, value: any, type: Emscripten.CType, noSafe?: boolean) {
    return this.engine.setValue(ptr, value, type, noSafe);
  }

  /**
   * Copys bytes to WASM.
   */
  copyBytesTo(bytes: Uint8Array) {
    const size = bytes.length;
    const bytesPtr = this.malloc(size);
    this.HEAPU8.set(bytes, bytesPtr);
    return bytesPtr;
  }

  /**
   * Initialize the PDFium library and allocate global resources for it.
   */
  init = this.wasm.FPDF_InitLibraryWithConfig;
  deinit = this.wasm.FPDF_DestroyLibrary;

  /**
   * Gets last error code when a function fails.
   */
  lastErrorCode = this.wasm.FPDF_GetLastError<ErrorCode>;

  version = this.wasm.FPDF_GetFileVersion;

  fileIdentifier = this.wasm.FPDF_GetFileIdentifier<FileIdentifier>;

  metaText = this.wasm.FPDF_GetMetaText;

  openDocument = this.wasm.FPDF_LoadMemDocument64;

  pageMode = this.wasm.FPDFDoc_GetPageMode<PageMode>;

  closeDocument(ptr: number) {
    this.wasm.FPDF_CloseDocument(ptr);
    this.free(ptr);
  }

  pageCount = this.wasm.FPDF_GetPageCount;

  loadPage = this.wasm.FPDF_LoadPage;
  closePage = this.wasm.FPDF_ClosePage;
  pageLabel = this.wasm.FPDF_GetPageLabel;
  pageWidth = this.wasm.FPDF_GetPageWidthF;
  pageHeight = this.wasm.FPDF_GetPageHeightF;
  pageSize = this.wasm.FPDF_GetPageSizeByIndexF;
  pageRotation = this.wasm.FPDFPage_GetRotation<Rotation>;
  pageTransparency = this.wasm.FPDFPage_HasTransparency;
  renderPageBitmap = this.wasm.FPDF_RenderPageBitmap;

  pointFromDeviceToPage = this.wasm.FPDF_DeviceToPage;
  pointFromPageToDevice = this.wasm.FPDF_PageToDevice;

  createBitmap = this.wasm.FPDFBitmap_Create;
  createBitmapWith = this.wasm.FPDFBitmap_CreateEx<BitmapFormat>;
  fillBitmap = this.wasm.FPDFBitmap_FillRect;
  closeBitmap = this.wasm.FPDFBitmap_Destroy;

  bitmapWidth = this.wasm.FPDFBitmap_GetWidth;
  bitmapHeight = this.wasm.FPDFBitmap_GetHeight;
  bitmapStride = this.wasm.FPDFBitmap_GetStride;
  bitmapBuffer = this.wasm.FPDFBitmap_GetBuffer;
}
