use std::sync::Arc;

use pdfium_render::{
    bindgen::FPDF_DOCUMENT,
    prelude::{PdfDocument, Pdfium},
};
use wasm_bindgen::prelude::wasm_bindgen;

#[wasm_bindgen]
#[derive(Clone, Debug)]
pub struct Document {
    engine: Arc<Pdfium>,
    inner: FPDF_DOCUMENT,
}

impl Document {
    pub fn new(engine: Arc<Pdfium>, inner: FPDF_DOCUMENT) -> Self {
        Self { engine, inner }
    }
}

#[wasm_bindgen]
impl Document {
    #[wasm_bindgen]
    pub fn page_count(&self) -> u16 {
        PdfDocument::from_pdfium(self.inner, self.engine.bindings())
            .pages()
            .len()
    }

    #[wasm_bindgen]
    pub fn page(
        &self,
        width: i32,
        height: i32,
        // rotation: Option<i32>,
    ) -> js_sys::Uint8ClampedArray {
        PdfDocument::from_pdfium(self.inner, self.engine.bindings())
            .pages()
            .first()
            .unwrap()
            .render(width, height, None)
            .map(|bitmap| unsafe { js_sys::Uint8ClampedArray::view(&bitmap.as_rgba_bytes()) })
            .unwrap()
    }
}
