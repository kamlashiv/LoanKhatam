// Bridges the imperative Android hardware back-button listener (registered in
// App.tsx via Capacitor) with React components that need to intercept a back
// press — e.g. the loan form warning before discarding unsaved edits.
//
// A component registers an interceptor while it wants to handle back presses.
// When the back button fires, App.tsx calls `runBackInterceptor()` first; if an
// interceptor is active and returns `true`, it has handled the press (typically
// by showing a confirm dialog) and the default in-app navigation is skipped.

type BackInterceptor = () => boolean;

let interceptor: BackInterceptor | null = null;

export function registerBackInterceptor(fn: BackInterceptor): () => void {
  interceptor = fn;
  return () => {
    if (interceptor === fn) {
      interceptor = null;
    }
  };
}

export function runBackInterceptor(): boolean {
  return interceptor ? interceptor() : false;
}
