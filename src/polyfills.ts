if (typeof window !== "undefined" && typeof window.matchMedia !== "function") {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener:   () => {},
    removeListener:() => {},
    addEventListener:    () => {},
    removeEventListener: () => {},
    dispatchEvent:       () => false,
  });
}
console.log("polyfills.ts: matchMedia polyfill installed");