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
 * PDFium ERR.
 */
enum ErrorCode {
  // No error.
  SUCCESS = 0,
  // Unknown error.
  UNKNOWN,
  // File not found or could not be opened.
  FILE,
  // File not in PDF format or corrupted.
  FORMAT,
  // Password required or incorrect password.
  PASSWORD,
  // Unsupported security scheme.
  SECURITY,
  // Page not found or content error.
  PAGE,
}

/**
 * PDFium BitmapFormat.
 */
enum BitmapFormat {
  Unknown = 0,
  BGRA,
  BRGx,
  BGRx,
  BGR,
}

enum MetaTag {
  Title,
  Author,
  Subject,
  Keywords,
  Creator,
  Producer,
  CreationDate,
  ModificationDate,
}

/**
 * Page rendering flags. They can be combined with bit-wise OR.
 */
enum PageRenderingflags {
  // Set if annotations are to be rendered.
  ANNOT = 0x01,
  // Set if using text rendering optimized for LCD display. This flag will only
  // take effect if anti-aliasing is enabled for text.
  LCD_TEXT = 0x02,
  // Don't use the native text output available on some platforms
  NO_NATIVETEXT = 0x04,
  // Grayscale output.
  GRAYSCALE = 0x08,
  // Obsolete, has no effect, retained for compatibility.
  DEBUG_INFO = 0x80,
  // Obsolete, has no effect, retained for compatibility.
  NO_CATCH = 0x100,
  // Limit image cache size.
  RENDER_LIMITEDIMAGECACHE = 0x200,
  // Always use halftone for image stretching.
  RENDER_FORCEHALFTONE = 0x400,
  // Render for printing.
  PRINTING = 0x800,
  // Set to disable anti-aliasing on text. This flag will also disable LCD
  // optimization for text rendering.
  RENDER_NO_SMOOTHTEXT = 0x1000,
  // Set to disable anti-aliasing on images.
  RENDER_NO_SMOOTHIMAGE = 0x2000,
  // Set to disable anti-aliasing on paths.
  RENDER_NO_SMOOTHPATH = 0x4000,
  // Set whether to render in a reverse Byte order, this flag is only used when
  // rendering to a bitmap.
  REVERSE_BYTE_ORDER = 0x10,
  // Set whether fill paths need to be stroked. This flag is only used when
  // FPDF_COLORSCHEME is passed in, since with a single fill color for paths the
  // boundaries of adjacent fill paths are less visible.
  CONVERT_FILL_TO_STROKE = 0x20,
}

/**
 * PDFium bindings.
 */
export interface FPDF_Bindings {
  FPDF_InitLibraryWithConfig(config: FPDF_Config): void;

  FPDF_GetLastError(): ErrorCode;

  FPDF_LoadMemDocument(
    bufferPtr: number,
    size: number,
    passwordPtr: number
  ): number;
  FPDF_GetPageCount(docPtr: number): number;
  FPDF_GetFileVersion(docPtr: number, version: number): boolean;
  FPDF_GetPageSizeByIndexF(
    docPtr: number,
    pageIdx: number,
    rectPtr: number
  ): boolean;
  FPDF_GetMetaText(
    docPtr: number,
    tag: MetaTag,
    buffer = null,
    size = 0
  ): number;
  FPDF_GetPageLabel(
    docPtr: number,
    pageIdx: number,
    buffer = null,
    size = 0
  ): number;
  FPDF_CloseDocument(docPtr: number): void;

  FPDF_LoadPage(docPtr: number, pageIdx: number): number;
  FPDF_GetPageWidthF(pagePtr: number): number;
  FPDF_GetPageHeightF(pagePtr: number): number;
  FPDF_GetPageBoundingBox(pagePtr: number, bufferPtr: number): boolean;
  FPDF_ClosePage(pagePtr): void;

  FPDFBitmap_Create(width: number, height: number, alpha: number): number;
  FPDFBitmap_CreateEx(
    width: number,
    height: number,
    format: BitmapFormat,
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
  FPDFBitmap_GetFormat(bitmapPtr: number): BitmapFormat;
  // Returns buffer pointer
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
 *
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
  lengthBytesUTF8: typeof lengthBytesUTF8;
}

/**
 * Factory of PDFiumModule.
 */
export default function createPDFium(
  moduleOverrides?: Partial<PDFiumModule>
): Promise<PDFiumModule>;
