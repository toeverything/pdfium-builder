import init from '@toeverything/pdfium';
import wasmUrl from '@toeverything/pdfium/wasm?url';
import minimalPdf from '@toeverything/resources/minimal.pdf?url';

async function run() {
  const module = await init({
    locateFile: () => wasmUrl,
  });

  const wasmExports = module.wasmExports;

  wasmExports.FPDF_InitLibraryWithConfig({
    version: 3,
    m_pIsolate: null,
    m_pPlatform: null,
    m_pUserFontPaths: null,
    m_v8EmbedderSlot: 0,
  });

  const req = await fetch(minimalPdf);
  const buffer = await req.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const size = bytes.length;
  const password = '';

  const documentPtr = wasmExports.malloc(size);
  module.HEAPU8.set(bytes, documentPtr);

  let passwordPtr = 0;
  if (password) {
    const length = new TextEncoder().encode(password).length + 1;
    const passwordPtr = wasmExports.malloc(length);
    module.stringToUTF8(password, passwordPtr, length);
  }

  const documentIdx = wasmExports.FPDF_LoadMemDocument(
    documentPtr,
    size,
    passwordPtr
  );

  wasmExports.free(passwordPtr);

  const errorCode = wasmExports.FPDF_GetLastError();
  if (errorCode) {
    throw new Error(`PDFium error code: ${errorCode}`);
  }

  const pageIdx = 0;
  const pagePtr = wasmExports.FPDF_LoadPage(documentIdx, pageIdx);
  const originalWidth = wasmExports.FPDF_GetPageWidth(pagePtr);
  const originalHeight = wasmExports.FPDF_GetPageHeight(pagePtr);

  const scale = 2;
  const format = 4;
  const bytesPerPixel = 4;
  const width = Math.ceil(originalWidth * scale);
  const height = Math.ceil(originalHeight * scale);
  const bitmapHeapLength = width * height * bytesPerPixel;

  const bitmapHeapPtr = wasmExports.malloc(bitmapHeapLength);
  module.HEAPU8.fill(0, bitmapHeapPtr, bitmapHeapPtr + bitmapHeapLength);

  const bitmapPtr = wasmExports.FPDFBitmap_CreateEx(
    width,
    height,
    format,
    bitmapHeapPtr,
    width * bytesPerPixel
  );

  wasmExports.FPDFBitmap_FillRect(bitmapPtr, 0, 0, width, height, 0xffffffff);

  wasmExports.FPDF_RenderPageBitmap(
    bitmapPtr,
    pagePtr,
    0,
    0,
    width,
    height,
    0,
    0x10 | 0x01
  );
  wasmExports.FPDFBitmap_Destroy(bitmapPtr);
  wasmExports.FPDF_ClosePage(pagePtr);

  const data = module.HEAPU8.subarray(
    bitmapHeapPtr,
    bitmapHeapPtr + bitmapHeapLength
  );

  wasmExports.free(bitmapHeapPtr);

  const imageData = new ImageData(new Uint8ClampedArray(data), width, height);
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const ctx = canvas!.getContext('2d');
  ctx!.putImageData(imageData, 0, 0);
}

run();
