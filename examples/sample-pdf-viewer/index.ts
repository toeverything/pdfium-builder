/// <reference types="vite/client" />

import {
  createPDFium,
  Viewer,
  Runtime,
  PageRenderingflags,
} from '@toeverything/pdf-viewer';
import minimalPDFUrl from '@toeverything/resources/minimal.pdf?url';

async function run() {
  const pdfium = await createPDFium();
  const runtime = new Runtime(pdfium);
  const viewer = new Viewer(runtime);

  const req = await fetch(minimalPDFUrl);
  const blob = await req.blob();
  const doc = await viewer.openWithBlob(blob);
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
  console.log(page.rotation());

  page.close();
  page.reload();

  const originalWidth = page.width();
  const originalHeight = page.height();

  const scale = 2;
  const width = Math.ceil(originalWidth * scale);
  const height = Math.ceil(originalHeight * scale);

  const flags =
    PageRenderingflags.REVERSE_BYTE_ORDER | PageRenderingflags.LCD_TEXT;
  const bitmap = viewer.createBitmap(width, height, 0);
  bitmap.fill(0, 0, width, height);
  page.render(bitmap, 0, 0, width, height, 0, flags);

  const data = bitmap.toUint8Array();

  bitmap.close();
  page.close();
  doc.close();

  const imageData = new ImageData(new Uint8ClampedArray(data), width, height);
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const ctx = canvas!.getContext('2d');
  ctx!.putImageData(imageData, 0, 0);

  viewer.dispose();
}

run();
