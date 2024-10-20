/**
 * PDFium Config.
 */
export interface FPDF_Config {
  version: number;
  m_pIsolate: null;
  m_pPlatform: null;
  m_pUserFontPaths: null;
  m_v8EmbedderSlot: number;
}

/**
 * PDFium Bindings.
 */
export interface FPDF_Bindings {
  FPDF_InitLibraryWithConfig(config: FPDF_Config): void;

  FPDF_GetLastError<T extends number>(): T;

  // Returns document pointer.
  FPDF_LoadMemDocument(
    bytesPtr: number,
    size: number,
    passwordPtr: number
  ): number;
  // Returns document pointer.
  FPDF_LoadMemDocument64(
    bytesPtr: number,
    size: number,
    passwordPtr: number
  ): number;
  FPDF_GetPageCount(docPtr: number): number;
  FPDF_GetFileVersion(docPtr: number, versionPtr: number): number;
  FPDF_GetFileIdentifier<T extends number>(
    docPtr: number,
    idType: T,
    bytesPtr?: number,
    size?: number
  ): number;
  FPDF_GetPageSizeByIndexF(
    docPtr: numbern,
    pageIdx: number,
    rectPtr: number
  ): boolean;
  FPDF_GetMetaText(
    docPtr: number,
    tagPtr: number,
    bytesPtr?: number,
    size?: number
  ): number;
  FPDF_GetPageLabel(
    docPtr: number,
    pageIdx: number,
    bytesPtr?: number,
    size?: number
  ): number;
  FPDFDoc_GetPageMode<T extends number>(docPtr: number): T;
  FPDF_CloseDocument(docPtr: number): void;

  // Returns page pointer.
  FPDF_LoadPage(docPtr: number, pageIdx: number): number;
  FPDF_GetPageWidthF(pagePtr: number): number;
  FPDF_GetPageHeightF(pagePtr: number): number;
  FPDF_GetPageBoundingBox(pagePtr: number, bytesPtr: number): boolean;
  FPDF_ClosePage(pagePtr: number): void;

  FPDFBitmap_Create(width: number, height: number, alpha: number): number;
  FPDFBitmap_CreateEx<T extends number>(
    width: number,
    height: number,
    format: T,
    firstScan?: number,
    stride?: number
  ): number;
  FPDFBitmap_FillRect(
    bitmapPtr: number,
    left: number,
    top: number,
    width: number,
    height: number,
    color: number
  ): number;
  FPDFBitmap_GetFormat<T extends number>(bitmapPtr: number): T;
  // Returns buffer pointer.
  FPDFBitmap_GetBuffer(bitmapPtr: number): number;
  FPDFBitmap_GetWidth(bitmapPtr: number): number;
  FPDFBitmap_GetHeight(bitmapPtr: number): number;
  FPDFBitmap_GetStride(bitmapPtr: number): number;
  FPDFBitmap_Destroy(bitmapPtr: number): void;

  FPDF_RenderPageBitmap(
    bitmapPtr: number,
    pagePtr: number,
    startX: number,
    startY: number,
    sizeX: number,
    sizeY: number,
    rotate: number,
    flags: number
  ): void;
  FPDF_RenderPageBitmapWithMatrix(
    bitmapPtr: number,
    pagePtr: number,
    matrixPtr: number,
    clippingRectPtr: number,
    flags: number
  ): void;
}

/**
 * PDFium WASM.
 */
export interface WasmExports extends FPDF_Bindings {
  malloc: (size: number) => number;
  free: (ptr: number) => void;
}

/**
 * PDFium module.
 */
export interface PDFiumModule extends EmscriptenModule {
  wasmExports: WasmExports;
  ccall: typeof ccall;
  cwrap: typeof cwrap;
  stringToUTF8: typeof stringToUTF8;
  stringToNewUTF8: (str: string) => number;
  lengthBytesUTF8: typeof lengthBytesUTF8;
  UTF8ToString: (ptr: number, maxBytesToRead?: number) => string;
  UTF16ToString: (ptr: number, maxBytesToRead?: number) => string;
  getValue: typeof getValue;
}

/**
 * Factory of PDFium module.
 */
export default function createPDFium(
  moduleOverrides?: Partial<PDFiumModule>
): Promise<PDFiumModule>;
