/**
 * PDFium Error Code.
 */
export enum ErrorCode {
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
 * PDFium Bitmap Format.
 * More DIB formats.
 */
export enum BitmapFormat {
  // Unknown or unsupported format.
  Unknown = 0,
  // Gray scale bitmap, one byte per pixel.
  Gray,
  // 3 bytes per pixel, byte order: blue, green, red.
  BGR,
  // 4 bytes per pixel, byte order: blue, green, red, unused.
  BGRx,
  // 4 bytes per pixel, byte order: blue, green, red, alpha. By default.
  BGRA,
}

/**
 * Metadata Tag.
 */
export enum MetaTag {
  Title = 'Title',
  Author = 'Author',
  Subject = 'Subject',
  Keywords = 'Keywords',
  Creator = 'Creator',
  Producer = 'Producer',
  CreationDate = 'CreationDate',
  ModificationDate = 'ModificationDate',
}
export const MetaTags = Object.values(MetaTag);

/**
 * Metadata.
 */
export type Metadata = Map<MetaTag, string>;

/**
 * Page rendering flags. They can be combined with bit-wise OR.
 */
export enum PageRenderingflags {
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

export enum FileIdentifier {
  Permanent = 0,
  Changing,
}

export enum PageMode {
  // Unknown page mode.
  UNKNOWN = -1,
  // Document outline, and thumbnails hidden.
  USENONE,
  // Document outline visible.
  USEOUTLINES,
  // Thumbnail images visible.
  USETHUMBS,
  // Full-screen mode, no menu bar, window controls, or other decorations visible.
  FULLSCREEN,
  // Optional content group panel visible.
  USEOC,
  // Attachments panel visible.
  USEATTACHMENTS,
}

export const BYTES_PER_PIXEL = 4;
