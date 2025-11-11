namespace MinesServer.Game.Programmator;

public enum ProgramFormatVersion
{
    /// <summary>
    /// 1st version of the program format. Unsupported version. Decoder implemented for backwards compatibility
    /// </summary>
    Version1,
    /// <summary>
    /// 2nd version of the program format, encoded in Base64
    /// </summary>
    Base64,
    /// <summary>
    /// 3rd version of the program format, human readable
    /// </summary>
    Version3,
    /// <summary>
    /// 4th version of the program format, compressed for better memory efficiency
    /// </summary>
    Packed
}
