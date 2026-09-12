declare module "culori" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function wcagContrast(a: any, b: any): number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function formatCss(color: any): string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function formatHex(color: any): string | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function parse(color: string): any;
}
