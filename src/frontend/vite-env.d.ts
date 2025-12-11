/// <reference types="vite/client" />

interface Window {
  electron?: {
    getServerUrl: () => Promise<string>;
  };
}
