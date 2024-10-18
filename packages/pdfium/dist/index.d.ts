/**
 * PDFium Config.
 */
interface FPDF_Config {
  version: number;
  m_pIsolate: null;
  m_pPlatform: null;
  m_pUserFontPaths: null;
  m_v8EmbedderSlot: number;
}

/**
 * PDFium bindings.
 */
export interface FPDF {
  FPDF_InitLibraryWithConfig(config: FPDF_Config): void;

  FPDF_GetLastError(): number;

  FPDF_LoadMemDocument(
    dataBufPtr: number,
    size: number,
    passwordPtr: number
  ): number;

  FPDF_LoadPage(docPtr: number, pageIdx: number): number;
  FPDF_GetPageWidth(pagePtr: number): number;
  FPDF_GetPageHeight(pagePtr: number): number;
  FPDF_ClosePage(pagePtr): void;

  FPDFBitmap_CreateEx(
    width: number,
    height: number,
    format: number,
    firstScan: number,
    stride: number
  ): number;
  FPDFBitmap_FillRect(
    bitmapPtr: number,
    left: number,
    top: number,
    width: number,
    height: number,
    color: number
  ): number;
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
  FPDFBitmap_Destroy(bitmapPtr: number): void;
}

/**
 *
 * PDFium WASM.
 */
export interface WasmExports extends FPDF {
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
}

/**
 * Factory of PDFiumModule.
 */
export default function createPDFium(
  moduleOverrides?: Partial<PDFiumModule>
): Promise<PDFiumModule>;
