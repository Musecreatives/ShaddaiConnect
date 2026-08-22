// Minimal ambient types for the `radius` npm package (no official @types exist).
// Only the encode/decode surface actually used by CoaService is declared.
declare module 'radius' {
  export interface EncodeOptions {
    code: string;
    secret: string;
    identifier?: number;
    attributes?: Array<[string, unknown]>;
  }

  export interface DecodedPacket {
    code: string;
    identifier: number;
    length: number;
    attributes: Record<string, unknown>;
  }

  export interface DecodeOptions {
    packet: Buffer;
    secret: string;
  }

  export function encode(options: EncodeOptions): Buffer;
  export function decode(options: DecodeOptions): DecodedPacket;
}
