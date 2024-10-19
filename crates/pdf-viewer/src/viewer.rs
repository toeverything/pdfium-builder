use js_sys::Uint8Array;
use pdfium_render::prelude::Pdfium;
use std::collections::HashMap;
use std::sync::{Arc, RwLock};
use wasm_bindgen::prelude::*;

use crate::Document;

#[wasm_bindgen]
#[derive(Debug)]
pub struct Viewer {
    engine: Arc<Pdfium>,
    docs: Arc<RwLock<HashMap<String, Document>>>,
}

#[wasm_bindgen]
impl Viewer {
    pub fn new() -> Self {
        Self {
            engine: Arc::new(Pdfium::default()),
            docs: Default::default(),
        }
    }

    pub fn close(&self) {}

    pub fn open(
        &self,
        id: String,
        bytes: Uint8Array,
        // password: Option<JsString>,
    ) -> Result<Document, JsValue> {
        let doc_ptr = self
            .engine
            .load_pdf_from_byte_vec(bytes.to_vec(), None)
            .map(|doc| doc.handle())
            .map_err(|e| e.to_string())?;

        let mut docs = self.docs.write().map_err(|e| e.to_string())?;

        let doc = Document::new(self.engine.clone(), doc_ptr);

        docs.insert(id, doc.clone());

        Ok(doc)
    }
}
