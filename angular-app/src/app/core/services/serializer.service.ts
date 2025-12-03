import { Injectable, inject } from '@angular/core';
import { LzmaService } from './lzma.service';
import { Instruction, ProgAction } from '../models/program.model';
import { parseLabelParts, asciiToUint8, uint8ToAscii } from './serializer-utils';

export enum ProgramFormatVersion {
  Base64 = 'Base64',
}

@Injectable({
  providedIn: 'root',
})
export class SerializerService {
  private readonly lzmaService = inject(LzmaService);

  probeFormatVersion(source: string): ProgramFormatVersion {
    if (!source || source.trim().length === 0) {
      throw new Error('Program source must be a non-empty string');
    }

    const cleanSource = source.replace(/\s/g, '');

    if (cleanSource.length % 4 === 0 && /^XQAA[\da-zA-Z/+]+={0,2}$/.test(cleanSource)) {
      return ProgramFormatVersion.Base64;
    }

    // Also try to detect if it's just a raw base64 string without strict XQAA check for older versions or variants
    if (cleanSource.length % 4 === 0 && /^[A-Za-z0-9+/]+={0,2}$/.test(cleanSource)) {
      // Check if it decodes to something that looks like LZMA (starts with 0x5d 0x00 0x00)
      try {
        const binary = atob(cleanSource.slice(0, 16));
        if (binary.charCodeAt(0) === 0x5d && binary.charCodeAt(1) === 0x00) {
          return ProgramFormatVersion.Base64;
        }
      } catch {
        // Ignore error
      }
    }

    throw new Error('Only LZMA Base64 format is supported');
  }

  async decode(source: string): Promise<Instruction[]> {
    const cleanSource = source.replace(/\s/g, '');
    const version = this.probeFormatVersion(cleanSource);
    switch (version) {
      case ProgramFormatVersion.Base64:
        return await this.decodeV2(cleanSource);
      default:
        throw new Error('Only LZMA Base64 format is supported');
    }
  }

  async encode(instructions: Instruction[]): Promise<string> {
    return await this.encodeV2(instructions);
  }

  private async decodeV2(source: string): Promise<Instruction[]> {
    const compressed = this.base64Decode(source);
    const decompressed = await this.lzmaService.decompress(compressed);

    if (decompressed.length < 4) {
      throw new Error('Malformed program');
    }

    const length = this.readInt32LE(decompressed, 0);
    if (length < 0 || length > decompressed.length) {
      throw new Error('Malformed program');
    }

    const operators = decompressed.slice(4, 4 + length);
    const labelsRaw = uint8ToAscii(decompressed.slice(4 + length)).split(':');

    const ret = new Array<Instruction>(length);
    for (let i = 0; i < length; i++) {
      const action = operators[i] as ProgAction;

      if (i >= labelsRaw.length) {
        ret[i] = { action, label: null, value: null };
        continue;
      }

      const labelStr = labelsRaw[i];
      const labelInfo = parseLabelParts(labelStr);
      ret[i] = { action, label: labelInfo.label, value: labelInfo.value };
    }
    return ret;
  }

  private async encodeV2(program: Instruction[]): Promise<string> {
    this.validateInstructions(program);
    const labels = program.map((inst) => this.formatLabel(inst.label, inst.value)).join(':');
    const labelBytes = asciiToUint8(labels);
    const buffer = new Uint8Array(4 + program.length + labelBytes.length);
    this.writeInt32LE(buffer, 0, program.length);
    for (const [i, inst] of program.entries()) {
      buffer[4 + i] = inst.action & 0xff;
    }
    buffer.set(labelBytes, 4 + program.length);
    const compressed = await this.lzmaService.compress(buffer);
    return this.base64Encode(compressed);
  }

  private formatLabel(label: string | null, value: string | null): string {
    const labelStr = label ?? '';
    return value !== null && value !== undefined ? `${labelStr}@${value}` : labelStr;
  }

  private validateInstructions(instructions: Instruction[]) {
    if (!Array.isArray(instructions)) {
      throw new Error('Instructions must be an array');
    }
    if (instructions.length === 0) {
      throw new Error('Instructions array cannot be empty');
    }
  }

  private base64Decode(str: string): Uint8Array {
    const binary = atob(str);
    const bytes = new Uint8Array(binary.length);
    for (const [i, char] of binary.split('').entries()) {
      bytes[i] = char.charCodeAt(0);
    }
    return bytes;
  }

  private base64Encode(bytes: Uint8Array): string {
    let binary = '';
    for (const byte of bytes) {
      binary += String.fromCharCode(byte);
    }
    return btoa(binary);
  }

  private readInt32LE(buffer: Uint8Array, offset: number): number {
    return (
      (buffer[offset] & 0xff) |
      ((buffer[offset + 1] & 0xff) << 8) |
      ((buffer[offset + 2] & 0xff) << 16) |
      ((buffer[offset + 3] & 0xff) << 24)
    );
  }

  private writeInt32LE(buffer: Uint8Array, offset: number, value: number) {
    buffer[offset] = value & 0xff;
    buffer[offset + 1] = (value >> 8) & 0xff;
    buffer[offset + 2] = (value >> 16) & 0xff;
    buffer[offset + 3] = (value >> 24) & 0xff;
  }
}
