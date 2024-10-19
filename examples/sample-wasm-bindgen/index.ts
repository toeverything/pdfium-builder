/// <reference types="vite/client" />

import createPDFium from '@toeverything/pdfium';
import wasmUrl from '@toeverything/pdfium/wasm?url';
import minimalPDFUrl from '@toeverything/resources/minimal.pdf?url';
import { MetaTag } from '@toeverything/pdf-viewer-types';
import wasm_bindgen, * as bindings from './dist/sample_wasm_bindgen';

async function run() {
  const pdfium = await createPDFium({
    locateFile: () => wasmUrl,
  });

  const wasmExports = pdfium.wasmExports;

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

  const pdfviewer = await wasm_bindgen();

  console.log(bindings.initialize_pdfium_render(pdfium, pdfviewer, true, true));

  console.log(pdfviewer, bindings);
  console.dir(bindings.Viewer);
  const viewer = bindings.Viewer.new();
  console.log(typeof viewer.close(), 11111111111);
  console.log(233);

  const doc = viewer.open('0', bytes);

  const width = 1190;
  const height = 1184;

  const count = doc.page_count();
  console.log(count);

  const data = doc.page(width, height);

  const imageData = new ImageData(data, width, height);
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const ctx = canvas!.getContext('2d');
  ctx!.putImageData(imageData, 0, 0);
}

run();
