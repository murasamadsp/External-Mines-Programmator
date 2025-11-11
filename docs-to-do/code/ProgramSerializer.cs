using EasyCompressor;
using MinesServer.Network;
using System.Buffers.Binary;
using System.Collections.Immutable;
using System.Runtime.CompilerServices;
using System.Runtime.InteropServices;
using System.Text;
using System.Text.RegularExpressions;
using static MinesServer.Game.Programmator.ProgAction;

namespace MinesServer.Game.Programmator;

public static class ProgramSerializer
{
    public static ProgramFormatVersion ProbeFormatVersion(string source)
    {
        if ((source.Length - 2) % 4 == 0 && Regex.IsMatch(source, @"^*\d[\da-zA-Z/+]+={0,2}$"))
            // Modern format versions
            return source[1] switch
            {
                '4' => ProgramFormatVersion.Packed,// V4, @ version_number Base64_program
                _ => throw new InvalidPayloadException("Malformed program"),
            };
        if (Regex.IsMatch(source, @"^\$[][\w()=<>|+~,:#! ^;?{}\n-]+$"))
            // V3, $ text-based_program
            return ProgramFormatVersion.Version3;
        if(source.Length % 4 == 0 && Regex.IsMatch(source, @"^XQAA[\da-zA-Z/+]+={0,2}$"))
            // V2, Base64_program, with "XQAA" LZMA header
            return ProgramFormatVersion.Base64;
        // V1, text-based_program
        return ProgramFormatVersion.Version1;
    }

    public static Instruction[] Decode(string source)
    {
        return Decode(source, ProbeFormatVersion(source));
    }

    public static Instruction[] Decode(string source, ProgramFormatVersion formatVersion)
    {
        switch(formatVersion)
        {
            case ProgramFormatVersion.Version1:
                return DecodeV1(source);
            case ProgramFormatVersion.Base64:
                return DecodeV2(source);
            case ProgramFormatVersion.Version3:
                return DecodeV3(source);
            case ProgramFormatVersion.Packed:
                return DecodeV4(source);
            default:
                throw new NotImplementedException("This format version cannot be decoded, the handler is not implemented.");
        }
    }

    public static Instruction[] DecodeV1(string source)
    {
        List<Instruction> ret = [];
        var column = 0;
        while(source.Length > 0)
        {
            Instruction item = default;
            if(column >= V1PageWidth)
            {
                item.action = None;
                for(int i = column; i < ModernPageWidth; i++)
                    ret.Add(item);
                column = 0;
            }
            var match = Regex.Match(source, @"^(L|G[0-4])\((.+?)\)");
            if(match.Success)
            {
                item.label = match.Groups[2].Value;
                item.action = V1Mappings[match.Groups[1].Value];
                source = source[match.Length..];
                ret.Add(item);
                column++;
                continue;
            }
            if (source[0] == '/')
            {
                // Skip to the next page
                var skipUntil = (ret.Count / (ModernPageWidth * ModernPageHeight) + 1) * ModernPageWidth * ModernPageHeight;
                item.action = None;
                do
                {
                    ret.Add(item);
                    column++;
                    if (column >= V1PageWidth)
                    {
                        for (int j = column; j < ModernPageWidth; j++)
                            ret.Add((None, null, null));
                        column = 0;
                    }
                } while (ret.Count < skipUntil);
                source = source[1..];
                continue;
            }
            match = Regex.Match(source, @$"^-[{alphabet}]");
            if(match.Success)
            {
                var skip = alphabet.IndexOf(source[1]);
                item.action = None;
                for(int i = 0;i < skip;i++)
                {
                    ret.Add(item);
                    column++;
                    if (column >= V1PageWidth)
                    {
                        for (int j = column; j < ModernPageWidth; j++)
                            ret.Add((None, null, null));
                        column = 0;
                    }
                }
                source = source[2..];
                continue;
            }
            var mapping = V1Mappings.First(x => source.StartsWith(x.Key));
            item.action = mapping.Value;
            source = source[mapping.Key.Length..];
            ret.Add(item);
        }
        return ret.ToArray();
    }

    public static Instruction[] DecodeV2(string source)
    {
        var tmp = Convert.FromBase64String(source);
        tmp = LZMACompressor.Shared.Decompress(tmp);
        var length = BinaryPrimitives.ReadInt32LittleEndian(tmp);
        if (length < 0 || length > tmp.Length)
            throw new InvalidPayloadException("Malformed program");
        var labels = Encoding.ASCII.GetString(tmp[(length + 4)..]).ToUpper().Split(':');
        // Клиент криво кодирует программу, поэтому проверка выключена.
        // В идеале длина меток должна совпадать с длиной операторов.
        //if(labels.Length != length)
        //    throw new InvalidPayloadException("Malformed program");
        var ret = new Instruction[length];
        for(int index = 0;index < length;index++)
        {
            var oper = (ProgAction)tmp[index + 4];
            ret[index].action = oper;
            if (labels.Length <= index)
                continue;
            var lbl = labels[index].Split('@');
            ret[index].label = lbl[0];
            if(lbl.Length > 2)
                throw new InvalidPayloadException("Malformed program");
            if (lbl.Length == 2)
                ret[index].value = int.Parse(lbl[1]);
        }
        return ret;
    }

    public static Instruction[] DecodeV3(string source)
    {
        List<Instruction> ret = new();
        if (source[0] == '$')
            source = source[1..];
        source = source
            .Replace(".0.", "\n\n\n\n\n\n\n\n\n")
            .Replace(".9.", "\n\n\n\n\n\n\n\n")
            .Replace(".8.", "\n\n\n\n\n\n\n")
            .Replace(".7.", "\n\n\n\n\n\n")
            .Replace(".6.", "\n\n\n\n\n")
            .Replace(".5.", "\n\n\n\n")
            .Replace(".", "\n")
            .Replace("_", "   ");
        while (source.Length > 0)
        {
            Instruction item = default;
            if (source[0] == '~')
            {
                // Skip to the next page
                var skipUntil = (ret.Count / (ModernPageWidth * ModernPageHeight) + 1) * ModernPageWidth * ModernPageHeight;
                item.action = None;
                do
                {
                    ret.Add(item);
                } while (ret.Count < skipUntil);
                source = source[1..];
                continue;
            }
            if (source[0] == '\n')
            {
                // Skip to the next line
                var skipUntil = (ret.Count / ModernPageWidth + 1) * ModernPageWidth;
                item.action = None;
                do
                {
                    ret.Add(item);
                } while (ret.Count < skipUntil);
                source = source[1..];
                continue;
            }
            var conditionalGoto = Regex.Match(source, @"^!?\?(.+?)<");
            if (conditionalGoto.Success)
            {
                item.label = conditionalGoto.Groups[1].Value;
                item.action = source[0] == '!' ? YesNoGoto : NoYesGoto;
                source = source[conditionalGoto.Length..];
                ret.Add(item);
                continue;
            }
            var dbg = Regex.Match(source, @"^!?{(.+?)}");
            if (dbg.Success)
            {
                item.label = dbg.Groups[1].Value;
                item.action = source[0] == '!' ? DebugPause : DebugShow;
                source = source[dbg.Length..];
                ret.Add(item);
                continue;
            }
            var label = Regex.Match(source, @"^\|(.+?):");
            if (label.Success)
            {
                item.label = label.Groups[1].Value;
                item.action = Label;
                source = source[label.Length..];
                ret.Add(item);
                continue;
            }
            var sub = Regex.Match(source, @"^(#R|[:=-])(.+?)>");
            if (sub.Success)
            {
                item.label = sub.Groups[2].Value;
                item.action = source[0] switch
                {
                    '#' => CallWhenDied,
                    ':' => Call,
                    '-' => CallArg,
                    '=' => CallState
                };
                source = source[sub.Length..];
                ret.Add(item);
                continue;
            }
            var jmp = Regex.Match(source, @"^>(.+?)\|");
            if (jmp.Success)
            {
                item.label = jmp.Groups[1].Value;
                item.action = Goto;
                source = source[jmp.Length..];
                ret.Add(item);
                continue;
            }
            var variable = Regex.Match(source, @"^\((.+?)(<[>=]?|>?=?)(-?\d+)\)");
            if (variable.Success)
            {
                item.label = variable.Groups[1].Value;
                item.value = int.Parse(variable.Groups[3].Value);
                item.action = variable.Groups[2].Value switch
                {
                    "=" => VarEqualsNumber,
                    ">=" => VarGreaterThanOrEqualNumber,
                    ">" => VarGreaterThanNumber,
                    "<=" => VarLessThanOrEqualNumber,
                    "<" => VarLessThanNumber,
                    "<>" => VarNotEqualsNumber,
                    _ => throw new InvalidOperationException()
                };
                source = source[variable.Length..];
                ret.Add(item);
                continue;
            }
            var mapping = V3Mappings.First(x => source.StartsWith(x.Key));
            item.action = mapping.Value;
            source = source[mapping.Key.Length..];
            ret.Add(item);
        }
        return ret.ToArray();
    }

    public static Instruction[] DecodeV4(string source)
    {
        return Array.Empty<Instruction>(); // NYI
    }

    public static string Encode(Instruction[] program, ProgramFormatVersion formatVersion)
    {
        switch (formatVersion)
        {
            case ProgramFormatVersion.Version1:
                throw new NotSupportedException("Cannot encode in the Version1 format. Try a more modern format.");
            case ProgramFormatVersion.Base64:
                return EncodeV2(program);
            case ProgramFormatVersion.Version3:
                return EncodeV3(program);
            case ProgramFormatVersion.Packed:
                return EncodeV4(program);
        }
        throw new NotImplementedException("Unknown format version");
    }

    public static string EncodeV2(Instruction[] program)
    {
        var labels = string.Join(":", program.Select(x => x.label + (x.value.HasValue ? "@" + x.value : "")));
        Span<byte> output = stackalloc byte[sizeof(int) + program.Length + labels.Length];
        BinaryPrimitives.WriteInt32LittleEndian(output, program.Length);
        Unsafe.CopyBlockUnaligned(ref MemoryMarshal.GetReference(output[sizeof(int)..]), ref MemoryMarshal.GetArrayDataReference(program.Select(x => (byte)x.action).ToArray()), (uint)program.Length);
        Encoding.ASCII.GetBytes(labels, output[(sizeof(int) + program.Length)..]);
        return Convert.ToBase64String(LZMACompressor.Shared.Compress(output.ToArray()));
    }

    public static string EncodeV3(Instruction[] program)
    {
        var sb = new StringBuilder();

        var spacesBacktrack = 0;
        var linesBacktrack = 0;
        for (int i = 0; i < program.Length; i++)
        {
            int col = i % ModernPageWidth;
            int row = i / ModernPageWidth % ModernPageHeight;

            if (program[i].action != None)
                linesBacktrack = spacesBacktrack = 0;
            switch (program[i].action)
            {
                case None: 
                    sb.Append(' ');
                    spacesBacktrack++;
                    break;
                case NextLine: sb.Append(','); break;
                case SetStart: sb.Append("#S"); break;
                case Terminate: sb.Append("#E"); break;
                case MoveUp: sb.Append("^W"); break;
                case MoveLeft: sb.Append("^A"); break;
                case MoveDown: sb.Append("^S"); break;
                case MoveRight: sb.Append("^D"); break;
                case Dig: sb.Append('z'); break;
                case RotateUp: sb.Append('w'); break;
                case RotateLeft: sb.Append('a'); break;
                case RotateDown: sb.Append('s'); break;
                case RotateRight: sb.Append('d'); break;
                case RepeatLastAction: sb.Append('l'); break;
                case MoveForward: sb.Append("^F"); break;
                case RotateLefthand: sb.Append("CCW;"); break;
                case RotateRighthand: sb.Append("CW;"); break;
                case BuildBlock: sb.Append('b'); break;
                case UseGeo: sb.Append('g'); break;
                case BuildRoad: sb.Append('r'); break;
                case Heal: sb.Append('h'); break;
                case BuildQuadro: sb.Append('q'); break;
                case RotateRandom: sb.Append("RAND;"); break;
                case PlaySound: sb.Append("BEEP;"); break;
                case Goto: sb.Append($">{program[i].label}|"); break;
                case Call: sb.Append($":>{program[i].label}>"); break;
                case CallArg: sb.Append($"->{program[i].label}>"); break;
                case Return: sb.Append("<|"); break;
                case ReturnArg: sb.Append("<-|"); break;
                case CellUpLeft: sb.Append("[WA]"); break;
                case CellDownRight: sb.Append("[SD]"); break;
                case CellUp: sb.Append("[W]"); break;
                case CellUpRight: sb.Append("[DW]"); break;
                case CellLeft: sb.Append("[A]"); break;
                case CellRight: sb.Append("[D]"); break;
                case CellDownLeft: sb.Append("[AS]"); break;
                case CellDown: sb.Append("[S]"); break;
                case BooleanOR: sb.Append("OR"); break;
                case BooleanAND: sb.Append("AND"); break;
                case Label: sb.Append($"|{program[i].label}:"); break;
                case IsNotEmpty: sb.Append("=n"); break;
                case IsEmpty: sb.Append("=e"); break;
                case IsFalling: sb.Append("=f"); break;
                case IsCrystal: sb.Append("=c"); break;
                case IsAliveCrystal: sb.Append("=a"); break;
                case IsFallingLikeBoulder: sb.Append("=b"); break;
                case IsFallingLikeLiquid: sb.Append("=s"); break;
                case IsBreakable: sb.Append("=k"); break;
                case IsUnbreakable: sb.Append("=d"); break;
                case IsRedRock: sb.Append("=K"); break;
                case IsBlackRock: sb.Append("=B"); break;
                case IsAcid: sb.Append("=A"); break;
                case IsQuadro: sb.Append("=q"); break;
                case IsRoad: sb.Append("=R"); break;
                case IsRedBlock: sb.Append("=r"); break;
                case IsYellowBlock: sb.Append("=y"); break;
                case IsBox: sb.Append("=x"); break;
                case IsStructure: sb.Append("=o"); break;
                case IsGreenBlock: sb.Append("=g"); break;
                case VarGreaterThanNumber: sb.Append($"({program[i].label}>{program[i].value})"); break;
                case VarLessThanNumber: sb.Append($"({program[i].label}<{program[i].value})"); break;
                case VarEqualsNumber: sb.Append($"({program[i].label}={program[i].value})"); break;
                case ShiftUp: sb.Append("[w]"); break;
                case ShiftLeft: sb.Append("[a]"); break;
                case ShiftDown: sb.Append("[s]"); break;
                case ShiftRight: sb.Append("[d]"); break;
                case CellForward: sb.Append("[F]"); break;
                case ShiftForward: sb.Append("[f]"); break;
                case CallState: sb.Append($"=>{program[i].label}>"); break;
                case ReturnState: sb.Append("<=|"); break;
                case NoYesGoto: sb.Append($"?{program[i].label}<"); break;
                case YesNoGoto: sb.Append($"!?{program[i].label}<"); break;
                case STDDig: sb.Append("DIGG;"); break;
                case STDBlock: sb.Append("BUILD;"); break;
                case STDHeal: sb.Append("HEAL;"); break;
                case Flip: sb.Append("FLIP;"); break;
                case STDTunnel: sb.Append("MINE;"); break;
                case IsInsideGun: sb.Append("=G"); break;
                case ChargeGun: sb.Append("FILL;"); break;
                case IsHealthNotFull: sb.Append("=hp-"); break;
                case IsHealthLessThanHalf: sb.Append("=hp50"); break;
                case CellRighthand: sb.Append("[r]"); break;
                case CellLefthand: sb.Append("[l]"); break;
                case EnableAutoDig: sb.Append("AUT+"); break;
                case DisableAutoDig: sb.Append("AUT-"); break;
                case EnableAggression: sb.Append("AGR+"); break;
                case DisableAggression: sb.Append("AGR-"); break;
                case UseBoom: sb.Append("B1;"); break;
                case UseRaz: sb.Append("B2;"); break;
                case UseProt: sb.Append("B3;"); break;
                case BuildWar: sb.Append("VB;"); break;
                case CallWhenDied: sb.Append($"#R{program[i].label}<"); break;
                case UseGeopack: sb.Append("GEO;"); break;
                case UseZZ: sb.Append("ZZ;"); break;
                case UseC190: sb.Append("C190;"); break;
                case UsePoly: sb.Append("POLY;"); break;
                case Upgrade: sb.Append("UP;"); break;
                case RefillCraft: sb.Append("CRAFT;"); break;
                case UseNano: sb.Append("NANO;"); break;
                case UseRem: sb.Append("REM;"); break;
                case InventoryUp: sb.Append("iw"); break;
                case InventoryLeft: sb.Append("ia"); break;
                case InventoryDown: sb.Append("is"); break;
                case InventoryRight: sb.Append("id"); break;
                case EnableHand: sb.Append("Hand+"); break;
                case DisableHand: sb.Append("Hand-"); break;
                case DebugPause: sb.Append($"!{{{program[i].label}}}"); break;
                case DebugShow: sb.Append($"{{{program[i].label}}}"); break;
                case UNUSED_200: sb.Append("RESTART;"); break;
            }

            if (col == ModernPageWidth - 1)
            {
                // Collapse no-op's into a newline
                sb.Remove(sb.Length - spacesBacktrack, spacesBacktrack);
                sb.Append('\n');
                linesBacktrack++;
                spacesBacktrack = 0;
                if (row == ModernPageHeight - 1)
                {
                    // Collapse newlines into a new page
                    sb.Remove(sb.Length - linesBacktrack, linesBacktrack);
                    sb.Append('~');
                    linesBacktrack = 0;
                }
            }
        }

        // Remove trailing ~ if present
        if (sb[^1] == '~')
            sb.Remove(sb.Length - 1, 1);

        sb.Replace("   ", "_")
            .Replace("\n\n\n\n\n\n\n\n\n\n\n", "\n.0.\n")
            .Replace("\n\n\n\n\n\n\n\n\n\n", "\n.9.\n")
            .Replace("\n\n\n\n\n\n\n\n\n", "\n.8.\n")
            .Replace("\n\n\n\n\n\n\n\n", "\n.7.\n")
            .Replace("\n\n\n\n\n\n\n", "\n.6.\n")
            .Replace("\n\n\n\n\n\n", "\n.5.\n")
            .Replace("\n\n\n\n\n", "\n...\n")
            .Replace("\n\n\n\n", "\n..\n")
            .Replace("\n\n\n", "\n.\n")
            .Replace("~", "~\n");

        return $"${sb}";
    }

    public static string EncodeV4(Instruction[] program)
    {
        return "NYI";
    }

    private static readonly ImmutableDictionary<string, ProgAction> V1Mappings = new Dictionary<string, ProgAction>() { 
        { "_", None },
        { "\\", NextLine },
        { ">", SetStart },
        { "<", Terminate },
        { "W", MoveUp },
        { "A", MoveLeft },
        { "S", MoveDown },
        { "D", MoveRight },
        { "Z0", Dig },
        { "w", RotateUp },
        { "a", RotateLeft },
        { "s", RotateDown },
        { "d", RotateRight },
        { "Z1", RepeatLastAction },
        { "Z2", MoveForward },
        { "Z3", RotateLefthand },
        { "Z4", RotateRighthand },
        { "Zc", BuildBlock },
        { "Ze", UseGeo },
        { "Zd", BuildRoad },
        { "Zf", Heal },
        { "Zg", BuildQuadro },
        { "Z5", RotateRandom },
        { "Zh", PlaySound },
        { "R0", Return },
        { "R1", ReturnArg },
        { "C0", CellUpLeft },
        { "C8", CellDownRight },
        { "C1", CellUp },
        { "C2", CellUpRight },
        { "C3", CellLeft },
        { "C4", Cell },
        { "C5", CellRight },
        { "C6", CellDownLeft },
        { "C7", CellDown },
        { "cO", CellForward },
        { "M0", BooleanOR },
        { "M1", BooleanAND },
        { "c0", IsNotEmpty },
        { "c1", IsEmpty },
        { "c2", IsFalling },
        { "cs", IsCrystal },
        { "ct", IsBreakable },
        { "cu", IsUnbreakable },
        { "cv", IsRedRock },
        { "ca", IsBlackRock },
        { "cd", IsSand },
        { "cw", IsQuadro },
        { "cf", IsRoad },
        { "ce", IsRedBlock },
        { "ch", IsYellowBlock },
        { "ci", IsAcidRock },
        { "cj", IsBoulder },
        { "ck", IsLava },
        { "cl", IsCyanAlive },
        { "cm", IsWhiteAlive },
        { "cn", IsRedAlive },
        { "co", IsVioletAlive },
        { "cp", IsBlackAlive },
        { "cq", IsBlueAlive },
        { "cr", IsRainbowAlive },
        { "cg", IsGreenBlock },
        { "cQ", IsBasketFull },
        { "cR", IsGeoFull },
        { "@", SetStartWhenDied },
        { "+", SetStartWhenHurt },
        { "&", SetStartWhenBotNearby },
        { "Zi", BoxAll },
        { "Zj", BoxHalf },
        { "Zk", BoxWhite },
        { "Zl", BoxGreen },
        { "Zm", BoxRed },
        { "Zn", BoxBlue },
        { "Zo", BoxCyan },
        { "Zp", BoxViolet },
        { "C9", ShiftUp },
        { "Ca", ShiftLeft },
        { "Cb", ShiftDown },
        { "Cc", ShiftRight },
        { "Cd", IsNotEmpty },
        { "Ce", ShiftForward },
        { "cS", IsHealthNotFull },
        { "cP", IsHealthLessThanHalf },
        { "L", Label },
        { "G0", YesNoGoto },
        { "G1", NoYesGoto },
        { "G2", Goto },
        { "G3", Call },
        { "G4", CallArg },
        #region Утерянные операторы
        { "c3", None }, // COND: Ценная порода
        { "c4", None }, // COND: Зелёный кри
        { "c5", None }, // COND: Красный кри
        { "c6", None }, // COND: Фиолетовый кри
        { "c7", None }, // COND: Синий кри
        { "c8", None }, // COND: Белый кри
        { "c9", None }, // COND: Голубой кри
        { "cb", None }, // COND: Золотоскал
        { "cc", None }, // COND: Пустоскал
        #endregion
    }.ToImmutableDictionary();

    private static readonly ImmutableDictionary<string, ProgAction> V3Mappings = new Dictionary<string, ProgAction>()
    {
        { "=hp50", IsHealthLessThanHalf },
        { "=hp-", IsHealthNotFull },
        { "AGR-", DisableAggression },
        { "AGR+", EnableAggression },
        { "AUT-", DisableAutoDig },
        { "AUT+", EnableAutoDig },
        { "HAND-", DisableHand },
        { "HAND+", EnableHand },
        { "AND", BooleanAND },
        { "OR", BooleanOR },
        { "RESTART;", UNUSED_200 },
        { "BEEP;", PlaySound },
        { "FLIP;", Flip },
        { "MINE;", STDTunnel },
        { "HEAL;", STDHeal },
        { "BUILD;", STDBlock },
        { "DIGG;", STDDig },
        { "VB;", BuildWar },
        { "RAND;", RotateRandom },
        { "CCW;", RotateLefthand },
        { "CW;", RotateRighthand },
        { "CRAFT;", RefillCraft },
        { "C190;", UseC190 },
        { "FILL;", ChargeGun },
        { "REM;", UseRem },
        { "NANO;", UseNano },
        { "ZZ;", UseZZ },
        { "B1;", UseBoom },
        { "B2;", UseProt },
        { "B3;", UseRaz },
        { "^W", MoveUp },
        { "^A", MoveLeft },
        { "^S", MoveDown },
        { "^D", MoveRight },
        { "^F", MoveForward },
        { "<|", Return },
        { "<-|", ReturnArg },
        { "<=|", ReturnState },
        { "=n", IsNotEmpty },
        { "=e", IsEmpty },
        { "=f", IsFalling },
        { "=c", IsCrystal },
        { "=a", IsAliveCrystal },
        { "=b", IsFallingLikeBoulder },
        { "=s", IsFallingLikeLiquid },
        { "=k", IsBreakable },
        { "=d", IsUnbreakable },
        { "=A", IsAcid },
        { "=B", IsRedRock },
        { "=K", IsBlackRock },
        { "=g", IsGreenBlock },
        { "=y", IsYellowBlock },
        { "=r", IsRedBlock },
        { "=o", IsStructure },
        { "=q", IsQuadro },
        { "=R", IsRoad },
        { "=x", IsBox },
        { "=G", IsInsideGun },
        { "#S", Terminate },
        { "#E", SetStart },
        { "[W]", CellUp },
        { "[A]", CellLeft },
        { "[S]", CellDown },
        { "[D]", CellRight },
        { "[WA]", CellUpLeft },
        { "[WD]", CellUpRight },
        { "[SA]", CellDownLeft },
        { "[SD]", CellDownRight },
        { "[AW]", CellUpLeft },
        { "[DW]", CellUpRight },
        { "[AS]", CellDownLeft },
        { "[DS]", CellDownRight },
        { "[F]", CellForward },
        { "[r]", CellRighthand },
        { "[l]", CellLefthand },
        { "[w]", ShiftUp },
        { "[a]", ShiftLeft },
        { "[s]", ShiftDown },
        { "[d]", ShiftRight },
        { "[f]", ShiftForward },
        { ",", NextLine },
        { "h", Heal },
        { "g", UseGeo },
        { "r", BuildRoad },
        { "q", BuildQuadro },
        { "b", BuildBlock },
        { "z", Dig },
        { "w", RotateUp },
        { "a", RotateLeft },
        { "s", RotateDown },
        { "d", RotateRight },
        { " ", None },
        { "iw", InventoryUp },
        { "ia", InventoryLeft },
        { "is", InventoryDown },
        { "id", InventoryRight },
    }.ToImmutableDictionary();

    public const string alphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

    public const int V1PageWidth = 14;
    public const int ModernPageWidth = 16;
    public const int ModernPageHeight = 12;
}
