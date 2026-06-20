/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.test.ts"],
  moduleNameMapper: {
    "^pdfjs-dist$": "<rootDir>/src/lib/__mocks__/pdfjs.ts",
    "pdf\\.worker\\.min\\.mjs\\?url$": "<rootDir>/src/lib/__mocks__/pdfWorkerUrl.ts",
  },
  transform: {
    "^.+\\.ts$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.jest.json" }],
  },
};
