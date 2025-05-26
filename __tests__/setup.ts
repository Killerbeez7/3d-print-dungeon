import "@testing-library/jest-dom/vitest";
import "./mocks/firebase";

import { initializeApp } from "firebase/app";

initializeApp({
  apiKey:  "fake",
  appId:   "demo",
  projectId: "demo",
});
