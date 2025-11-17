// Program Actions - Core action definitions based on C# ProgAction enum
export const ProgAction = {
  None
: 0,
  NextLine
: 1,
  SetStart
: 2,
  Terminate
: 3,
  MoveUp
: 4,
  MoveLeft
: 5,
  MoveDown
: 6,
  MoveRight
: 7,
  Dig
: 8,
  RotateUp
: 9,
  RotateLeft
: 10,
  RotateDown
: 11,
  RotateRight
: 12,
  RepeatLastAction
: 13,
  MoveForward
: 14,
  RotateLefthand
: 15,
  RotateRighthand
: 16,
  BuildBlock
: 17,
  UseGeo
: 18,
  BuildRoad
: 19,
  Heal
: 20,
  BuildQuadro
: 21,
  RotateRandom
: 22,
  PlaySound
: 23,
  Goto
: 24,
  Call
: 25,
  CallArg
: 26,
  Return
: 27,
  ReturnArg
: 28,
  CellUpLeft
: 29,
  CellDownRight
: 30,
  CellUp
: 31,
  CellUpRight
: 32,
  CellLeft
: 33,
  Cell
: 34,
  CellRight
: 35,
  CellDownLeft
: 36,
  CellDown
: 37,
  BooleanOR
: 38,
  BooleanAND
: 39,
  Label
: 40,
  YesNoReturn
: 41,
  NoYesReturn
: 42,
  IsNotEmpty
: 43,
  IsEmpty
: 44,
  IsFalling
: 45,
  IsCrystal
: 46,
  IsAliveCrystal
: 47,
  IsFallingLikeBoulder
: 48,
  IsFallingLikeLiquid
: 49,
  IsBreakable
: 50,
  IsUnbreakable
: 51,
  IsRedRock
: 52,
  IsBlackRock
: 53,
  IsAcid
: 54,
  UNKNOWN_CONDITION
: 55,
  IsSand
: 56,
  IsQuadro
: 57,
  IsRoad
: 58,
  IsRedBlock
: 59,
  IsYellowBlock
: 60,
  UNKNOWN_MINUS_HEALTH
: 61,
  UNKNOWN_LESS_HEALTH
: 62,
  IsAcidRock
: 63,
  IsBoulder
: 64,
  IsLava
: 65,
  IsCyanAlive
: 66,
  IsWhiteAlive
: 67,
  IsRedAlive
: 68,
  IsVioletAlive
: 69,
  IsBlackAlive
: 70,
  IsBlueAlive
: 71,
  IsRainbowAlive
: 72,
  UNKNOWN_73
: 73,
  IsBox
: 74,
  UNKNOWN_75
: 75,
  IsStructure
: 76,
  IsGreenBlock
: 77,
  IsBasketFull
: 78,
  IsGeoFull
: 79,
  UNKNOWN_80
: 80,
  SetStartWhenDied
: 81,
  SetStartWhenHurt
: 82,
  SetStartWhenBotNearby
: 83,
  UNKNOWN_84
: 84,
  UNKNOWN_85
: 85,
  ShiftLefthand
: 86,
  ShiftRighthand
: 87,
  ShiftBackwards
: 88,
  BoxAll
: 89,
  BoxHalf
: 90,
  BoxWhite
: 91,
  BoxGreen
: 92,
  BoxRed
: 93,
  BoxBlue
: 94,
  BoxCyan
: 95,
  BoxViolet
: 96,
  WriteStateToVar
: 97,
  ReadVarToState
: 98,
  SetNumberToVar
: 104,
  AddNumberToVar
: 105,
  MultNumberToVar
: 106,
  DivNumberToVar
: 107,
  SubNumberToVar
: 108,
  AddStateToVar
: 109,
  MultStateToVar
: 110,
  DivStateToVar
: 111,
  SubStateToVar
: 112,
  AddVarToVar
: 113,
  MultVarToVar
: 114,
  DivVarToVar
: 115,
  SubVarToVar
: 116,
  VarLessThanState
: 117,
  VarGreaterThanState
: 118,
  VarGreaterThanOrEqualsState
: 119,
  VarLessThanOrEqualState
: 120,
  VarEqualsState
: 121,
  VarNotEqualsState
: 122,
  UNKNOWN_118
: 123,
  VarGreaterThanNumber
: 124,
  VarLessThanNumber
: 125,
  VarGreaterThanOrEqualNumber
: 126,
  VarLessThanOrEqualNumber
: 127,
  VarEqualsNumber
: 128,
  VarNotEqualsNumber
: 129,
  VarRound
: 130,
  VarCeil
: 131,
  VarFloor
: 132,
  Var_UNK_128
: 133,
  Var_UNK_129
: 134,
  Var_UNK_130
: 135,
  ShiftUp
: 136,
  ShiftLeft
: 137,
  ShiftDown
: 138,
  ShiftRight
: 139,
  CellForward
: 140,
  ShiftForward
: 141,
  CallState
: 142,
  ReturnState
: 143,
  YesNoGoto
: 144,
  NoYesGoto
: 145,
  STDDig
: 146,
  STDBlock
: 147,
  STDHeal
: 148,
  Flip
: 149,
  STDTunnel
: 150,
  IsInsideGun
: 151,
  ChargeGun
: 152,
  IsHealthNotFull
: 153,
  IsHealthLessThanHalf
: 154,
  YesNoNextRow
: 155,
  NoYesNextRow
: 156,
  YesNoGotoStart
: 157,
  NoYesGotoStart
: 158,
  YesNoTerminate
: 159,
  NoYesTerminate
: 160,
  CellLefthand
: 161,
  CellRighthand
: 162,
  EnableAutoDig
: 158,
  DisableAutoDig
: 159,
  EnableAggression
: 160,
  DisableAggression
: 161,
  UseBoom
: 162,
  UseRaz
: 163,
  UseProt
: 164,
  BuildWar
: 165,
  CallWhenDied
: 166,
  UseGeopack
: 167,
  UseZZ
: 168,
  UseC190
: 169,
  UsePoly
: 170,
  Upgrade
: 171,
  RefillCraft
: 172,
  UseNano
: 173,
  UseRem
: 174,
  InventoryUp
: 175,
  InventoryLeft
: 176,
  InventoryDown
: 177,
  InventoryRight
: 178,
  EnableHand
: 179,
  DisableHand
: 180,
  DebugPause
: 181,
  DebugShow
: 182,
  UNUSED_183
: 183,
  UNUSED_184
: 184,
  UNUSED_185
: 185,
  UNUSED_186
: 186,
  UNUSED_187
: 187,
  UNUSED_188
: 188,
  UNUSED_189
: 189,
  UNUSED_190
: 190,
  UNUSED_191
: 191,
  UNUSED_192
: 192,
  UNUSED_193
: 193,
  UNUSED_194
: 194,
  UNUSED_195
: 195,
  UNUSED_196
: 196,
  UNUSED_197
: 197,
  UNUSED_198
: 198,
  UNUSED_199
: 199,
  UNUSED_200
: 200,
  UNUSED_201
: 201,
  UNUSED_202
: 202,
  UNUSED_203
: 203,
  UNUSED_204
: 204,
  UNUSED_205
: 205,
  UNUSED_206
: 206,
  UNUSED_207
: 207,
  UNUSED_208
: 208,
  UNUSED_209
: 209,
  UNUSED_210
: 210,
  UNUSED_211
: 211,
  UNUSED_212
: 212,
  UNUSED_213
: 213,
  UNUSED_214
: 214,
  UNUSED_215
: 215,
  UNUSED_216
: 216,
  UNUSED_217
: 217,
  UNUSED_218
: 218,
  UNUSED_219
: 219,
  UNUSED_220
: 220,
  UNUSED_221
: 221,
  UNUSED_222
: 222,
  UNUSED_223
: 223,
  UNUSED_224
: 224,
  UNUSED_225
: 225,
  UNUSED_226
: 226,
  UNUSED_227
: 227,
  UNUSED_228
: 228,
  UNUSED_229
: 229,
  UNUSED_230
: 230,
  UNUSED_231
: 231,
  UNUSED_232
: 232,
  UNUSED_233
: 233,
  UNUSED_234
: 234,
  UNUSED_235
: 235,
  UNUSED_236
: 236,
  UNUSED_237
: 237,
  UNUSED_238
: 238,
  UNUSED_239
: 239,
  UNUSED_240
: 240,
  UNUSED_241
: 241,
  UNUSED_242
: 242,
  UNUSED_243
: 243,
  UNUSED_244
: 244,
  UNUSED_245
: 245,
  UNUSED_246
: 246,
  UNUSED_247
: 247,
  UNUSED_248
: 248,
  UNUSED_249
: 249,
  UNUSED_250
: 250,
  UNUSED_251
: 251,
  UNUSED_252
: 252,
  UNUSED_253
: 253,
  UNUSED_254
: 254,
};

// Helper functions for working with ProgAction
export const getActionCode = (actionName) => ProgAction[actionName];
export const getActionByCode = (code) => {
  for (const [name, value] of Object.entries(ProgAction)) {
    if (value === code) return { name, code };
  }
  return null;
};
