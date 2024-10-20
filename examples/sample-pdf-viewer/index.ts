import { createPDFium, Viewer, Runtime } from '@toeverything/pdf-viewer';
import minimalPDFUrl from '@toeverything/resources/minimal.pdf?url';

async function run() {
  const pdfium = await createPDFium();
  const runtime = new Runtime(pdfium);
  const viewer = new Viewer(runtime);

  const req = await fetch(minimalPDFUrl);
  const buffer = await req.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  const doc = viewer.open(bytes);
  if (!doc) return;

  console.log(doc.pageMode());
  console.log(doc.version());
  console.log(doc.metadata());
  console.log(doc.pageCount());
  console.log(doc.fileIdentifier(0));
  console.log(doc.fileIdentifier(1));

  let page = doc.page(0);
  if (!page) return;

  console.log(page.label());
  console.log(page.width());
  console.log(page.height());

  page.close();
  page.reload();

  const originalWidth = page.width();
  const originalHeight = page.height();

  const scale = 2;
  const format = 4;
  const bytesPerPixel = 4;
  const width = Math.ceil(originalWidth * scale);
  const height = Math.ceil(originalHeight * scale);
  const bitmapHeapLength = width * height * bytesPerPixel;

  const bitmapHeapPtr = runtime.malloc(bitmapHeapLength);
  runtime.HEAPU8.fill(0, bitmapHeapPtr, bitmapHeapPtr + bitmapHeapLength);
  const bitmapPtr = runtime.wasm.FPDFBitmap_CreateEx(
    width,
    height,
    format,
    bitmapHeapPtr,
    width * bytesPerPixel
  );
  runtime.wasm.FPDFBitmap_FillRect(bitmapPtr, 0, 0, width, height, 0xffffffff);
  runtime.wasm.FPDF_RenderPageBitmap(
    bitmapPtr,
    page.pointer,
    0,
    0,
    width,
    height,
    0,
    0x10 | 0x01
  );

  runtime.wasm.FPDFBitmap_Destroy(bitmapPtr);

  const data = runtime.HEAPU8.subarray(
    bitmapHeapPtr,
    bitmapHeapPtr + bitmapHeapLength
  );
  runtime.free(bitmapHeapPtr);

  page.close();
  doc.close();

  const imageData = new ImageData(new Uint8ClampedArray(data), width, height);
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const ctx = canvas!.getContext('2d');
  ctx!.putImageData(imageData, 0, 0);
}

run();
