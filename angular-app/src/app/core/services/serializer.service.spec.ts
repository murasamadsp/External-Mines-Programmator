import { TestBed } from '@angular/core/testing';
import { SerializerService } from './serializer.service';
import { Instruction, ProgAction } from '../models/program.model';
import { LzmaService } from './lzma.service';

describe('SerializerService', () => {
  let service: SerializerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SerializerService, LzmaService],
    });
    service = TestBed.inject(SerializerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('probeFormatVersion', () => {
    it('should detect Base64 format with XQAA header', () => {
      const version = service.probeFormatVersion('XQAA1234567890ABCDEFGHIJKLMNOP==');
      expect(version).toBe('Base64');
    });

    it('should throw error for empty string', () => {
      expect(() => service.probeFormatVersion('')).toThrow();
    });

    it('should throw error for whitespace-only string', () => {
      expect(() => service.probeFormatVersion('   ')).toThrow();
    });

    it('should detect LZMA Base64 without explicit XQAA', () => {
      const lzmaBase64 = 'XQAAAAHwAQAA';
      const version = service.probeFormatVersion(lzmaBase64);
      expect(version).toBe('Base64');
    });

    it('should throw for non-Base64 format', () => {
      expect(() => service.probeFormatVersion('invalid!@#$')).toThrow(
        'Only LZMA Base64 format is supported',
      );
    });
  });

  describe('encode/decode round-trip', () => {
    it('should encode and decode simple program correctly', async () => {
      const originalProgram: Instruction[] = [
        { action: ProgAction.SetStart, label: null, value: null },
        { action: ProgAction.MoveUp, label: null, value: null },
        { action: ProgAction.Dig, label: null, value: null },
        { action: ProgAction.Terminate, label: null, value: null },
      ];

      const encoded = await service.encode(originalProgram);
      const decoded = await service.decode(encoded);

      expect(decoded).toEqual(originalProgram);
    });

    it('should preserve labels in round-trip', async () => {
      const programWithLabels: Instruction[] = [
        { action: ProgAction.Label, label: 'START', value: null },
        { action: ProgAction.MoveUp, label: null, value: null },
        { action: ProgAction.Goto, label: 'START', value: null },
      ];

      const encoded = await service.encode(programWithLabels);
      const decoded = await service.decode(encoded);

      expect(decoded).toEqual(programWithLabels);
    });

    it('should preserve values in round-trip', async () => {
      const programWithValues: Instruction[] = [
        { action: ProgAction.VarEqualsNumber, label: 'count', value: '42' },
        { action: ProgAction.VarGreaterThanNumber, label: 'health', value: '100' },
      ];

      const encoded = await service.encode(programWithValues);
      const decoded = await service.decode(encoded);

      expect(decoded).toEqual(programWithValues);
    });

    it('should handle empty labels correctly', async () => {
      const program: Instruction[] = [
        { action: ProgAction.MoveUp, label: '', value: null },
        { action: ProgAction.Dig, label: null, value: null },
      ];

      const encoded = await service.encode(program);
      const decoded = await service.decode(encoded);

      expect(decoded[0].label).toBe(null);
      expect(decoded[1].label).toBe(null);
    });

    it('should handle large programs efficiently', async () => {
      const largeProgram: Instruction[] = Array(1000)
        .fill(null)
        .map((_, i) => ({
          action: i % 2 === 0 ? ProgAction.MoveUp : ProgAction.MoveDown,
          label: i % 10 === 0 ? `label_${i}` : null,
          value: null,
        }));

      const startTime = performance.now();
      const encoded = await service.encode(largeProgram);
      const decoded = await service.decode(encoded);
      const endTime = performance.now();

      expect(decoded).toEqual(largeProgram);
      expect(endTime - startTime).toBeLessThan(1000);
      expect(encoded.length).toBeLessThan(largeProgram.length * 10);
    });
  });

  describe('error handling', () => {
    it('should throw on invalid Base64', async () => {
      await expect(service.decode('!!!invalid!!!')).rejects.toThrow();
    });

    it('should throw on corrupted data', async () => {
      const corrupted = 'XQAA' + 'A'.repeat(100);
      await expect(service.decode(corrupted)).rejects.toThrow();
    });

    it('should validate instructions before encoding', async () => {
      await expect(service.encode(null as unknown as Instruction[])).rejects.toThrow();
      await expect(service.encode([])).rejects.toThrow();
    });
  });

  describe('edge cases', () => {
    it('should handle program with multiple action types', async () => {
      const program: Instruction[] = [
        { action: ProgAction.None, label: null, value: null },
        { action: ProgAction.NextLine, label: null, value: null },
        { action: ProgAction.SetStart, label: null, value: null },
        { action: ProgAction.Terminate, label: null, value: null },
        { action: ProgAction.MoveUp, label: null, value: null },
        { action: ProgAction.MoveDown, label: null, value: null },
        { action: ProgAction.MoveLeft, label: null, value: null },
        { action: ProgAction.MoveRight, label: null, value: null },
        { action: ProgAction.Dig, label: null, value: null },
        { action: ProgAction.BuildBlock, label: null, value: null },
      ];

      const encoded = await service.encode(program);
      const decoded = await service.decode(encoded);
      expect(decoded).toEqual(program);
    });

    it('should handle Unicode labels correctly', async () => {
      const program: Instruction[] = [
        { action: ProgAction.Label, label: 'Привіт', value: null },
        { action: ProgAction.Label, label: '你好', value: null },
        { action: ProgAction.Label, label: '🚀', value: null },
      ];

      const encoded = await service.encode(program);
      const decoded = await service.decode(encoded);
      expect(decoded).toEqual(program);
    });
  });
});
