import "@testing-library/jest-dom/vitest";
import "./mocks/firebase";

import { initializeApp } from "firebase/app";
import { vi } from "vitest";

// Global mock: firebase
vi.mock("@/config/firebase", () => ({
  auth: {},
  db: {},
  storage: {},
  functions: {},
}));

initializeApp({
  apiKey:  "fake",
  appId:   "demo",
  projectId: "demo",
});
