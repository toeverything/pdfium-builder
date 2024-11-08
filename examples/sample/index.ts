/// <reference types="vite/client" />

import createPDFium from '@toeverything/pdfium';
import wasmUrl from '@toeverything/pdfium/wasm?url';
import minimalPDFUrl from '@toeverything/resources/minimal.pdf?url';
import { MetaTag } from '@toeverything/pdf-viewer-types';

async function run() {
  const module = await createPDFium({
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

  const req = await fetch(minimalPDFUrl);
  const buffer = await req.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const size = bytes.length;
  const password = '';

  const bufferPtr = wasmExports.malloc(size);
  module.HEAPU8.set(bytes, bufferPtr);

  let passwordPtr = 0;
  if (password) {
    const length = new TextEncoder().encode(password).length;
    const passwordPtr = wasmExports.malloc(length);
    module.stringToUTF8(password, passwordPtr, length + 1);
  }

  const docPtr = wasmExports.FPDF_LoadMemDocument(bufferPtr, size, passwordPtr);
  wasmExports.free(passwordPtr);

  const errorCode = wasmExports.FPDF_GetLastError();
  if (errorCode) {
    throw new Error(`PDFium error code: ${errorCode}`);
  }

  const titleBuffer = new TextEncoder().encode(MetaTag.Producer);
  const titleBufferPtr = wasmExports.malloc(titleBuffer.length);
  module.stringToUTF8(MetaTag.Producer, titleBufferPtr, titleBuffer.length + 1);
  const bufferLength = wasmExports.FPDF_GetMetaText(docPtr, titleBufferPtr);
  if (bufferLength > 0) {
    console.log(1, bufferLength);
    const tempBuffer = new Uint8Array({ length: bufferLength });
    const tempBufferPtr = wasmExports.malloc(tempBuffer.length);
    const bufferLength2 = wasmExports.FPDF_GetMetaText(
      docPtr,
      titleBufferPtr,
      tempBufferPtr,
      tempBuffer.length
    );
    console.log(2, bufferLength2);
    console.log(MetaTag.Producer, module.UTF16ToString(tempBufferPtr));

    wasmExports.free(tempBufferPtr);
    wasmExports.free(titleBufferPtr);
  }

  const pageIdx = 0;
  const pagePtr = wasmExports.FPDF_LoadPage(docPtr, pageIdx);
  const originalWidth = wasmExports.FPDF_GetPageWidthF(pagePtr);
  const originalHeight = wasmExports.FPDF_GetPageHeightF(pagePtr);

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
  wasmExports.FPDF_CloseDocument(docPtr);

  const data = module.HEAPU8.subarray(
    bitmapHeapPtr,
    bitmapHeapPtr + bitmapHeapLength
  );

  wasmExports.free(bitmapHeapPtr);

  const imageData = new ImageData(new Uint8ClampedArray(data), width, height);
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const ctx = canvas!.getContext('2d');
  ctx!.putImageData(imageData, 0, 0);

  wasmExports.FPDF_DestroyLibrary();
}

run();
