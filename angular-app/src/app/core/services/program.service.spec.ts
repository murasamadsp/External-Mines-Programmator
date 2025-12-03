import { TestBed } from '@angular/core/testing';
import { ProgramService } from './program.service';
import { SerializerService } from './serializer.service';
import { Instruction, ProgAction } from '../models/program.model';

describe('ProgramService', () => {
  let programService: ProgramService;
  let serializerServiceSpy: {
    encode: (instructions: Instruction[]) => Promise<string>;
    decode: (source: string) => Promise<Instruction[]>;
  };

  beforeEach(() => {
    const spy = {
      encode: vi.fn().mockResolvedValue('dummy_encoded_string'),
      decode: vi.fn().mockResolvedValue([
        { action: ProgAction.None, label: null, value: null },
        { action: ProgAction.Label, label: 'start', value: null },
        { action: ProgAction.Goto, label: 'start', value: null },
      ]),
    };

    TestBed.configureTestingModule({
      providers: [ProgramService, { provide: SerializerService, useValue: spy }],
    });
    programService = TestBed.inject(ProgramService);
    serializerServiceSpy = TestBed.inject(SerializerService) as typeof serializerServiceSpy;
  });

  it('should load a simple program and retrieve instructions', async () => {
    const instructions: Instruction[] = [
      { action: ProgAction.None, label: null, value: null },
      { action: ProgAction.Label, label: 'start', value: null },
      { action: ProgAction.Goto, label: 'start', value: null },
    ];
    const encoded = await serializerServiceSpy.encode(instructions);
    await programService.loadProgram(encoded);
    const loaded = programService.getInstructionAt(0, 0);
    expect(loaded.action).toBe(ProgAction.None);
  });
});
