/* eslint-disable @typescript-eslint/no-explicit-any */
interface Window {
  html2pdf: (element: HTMLElement, options: any) => Promise<void>;
}
