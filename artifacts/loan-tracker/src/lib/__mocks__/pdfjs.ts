// Jest stub for pdfjs-dist. file-extract.ts only touches GlobalWorkerOptions at
// import time and getDocument() inside extractFromFile (not exercised by unit
// tests), so a minimal shape is enough to load the module under test.
export const GlobalWorkerOptions = { workerSrc: "" };

export function getDocument(): { promise: Promise<unknown> } {
  return { promise: Promise.resolve(null) };
}
