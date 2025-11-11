Mine_Cods={
    '_': '0',        # None
    '\\\\': '1',     # NextLine
    '>': '2',        # SetStart
    '<': '3',        # Terminate
    'W': '4',        # MoveUp
    'A': '5',        # MoveLeft
    'S': '6',        # MoveDown
    'D': '7',        # MoveRight
    'Z0': '8',       # Dig
    'w': '9',        # RotateUp
    'a': '10',       # RotateLeft
    's': '11',       # RotateDown
    'd': '12',       # RotateRight
    'Z1': '13',      # RepeatLastAction
    'Z2': '14',      # MoveForward
    'Z3': '15',      # RotateLefthand
    'Z4': '16',      # RotateRighthand
    'Zc': '17',      # BuildBlock
    'Ze': '18',      # UseGeo
    'Zd': '19',      # BuildRoad
    'Zf': '20',      # Heal
    'Zg': '21',      # BuildQuadro
    'Z5': '22',      # RotateRandom
    'Zh': '23',      # PlaySound
    'R0': '24',      # Return
    'R1': '25',      # ReturnArg
    'C0': '26',      # CellUpLeft
    'C8': '27',      # CellDownRight
    'C1': '28',      # CellUp
    'C2': '29',      # CellUpRight
    'C3': '30',      # CellLeft
    'C4': '31',      # Cell
    'C5': '32',      # CellRight
    'C6': '33',      # CellDownLeft
    'C7': '34',      # CellDown
    'cO': '35',      # CellForward
    'M0': '36',      # BooleanOR
    'M1': '37',      # BooleanAND
    'c0': '38',      # IsNotEmpty
    'c1': '39',      # IsEmpty
    'c2': '40',      # IsFalling
    'cs': '41',      # IsCrystal
    'ct': '42',      # IsBreakable
    'cu': '43',      # IsUnbreakable
    'cv': '44',      # IsRedRock
    'ca': '45',      # IsBlackRock
    'cd': '46',      # IsSand
    'cw': '47',      # IsQuadro
    'cf': '48',      # IsRoad
    'ce': '49',      # IsRedBlock
    'ch': '50',      # IsYellowBlock
    'ci': '51',      # IsAcidRock
    'cj': '52',      # IsBoulder
    'ck': '53',      # IsLava
    'cl': '54',      # IsCyanAlive
    'cm': '55',      # IsWhiteAlive
    'cn': '56',      # IsRedAlive
    'co': '57',      # IsVioletAlive
    'cp': '58',      # IsBlackAlive
    'cq': '59',      # IsBlueAlive
    'cr': '60',      # IsRainbowAlive
    'cg': '61',      # IsGreenBlock
    'cQ': '62',      # IsBasketFull
    'cR': '63',      # IsGeoFull
    '@': '64',       # SetStartWhenDied
    '+': '65',       # SetStartWhenHurt
    '&': '66',       # SetStartWhenBotNearby
    'Zi': '67',      # BoxAll
    'Zj': '68',      # BoxHalf
    'Zk': '69',      # BoxWhite
    'Zl': '70',      # BoxGreen
    'Zm': '71',      # BoxRed
    'Zn': '72',      # BoxBlue
    'Zo': '73',      # BoxCyan
    'Zp': '74',      # BoxViolet
    'C9': '75',      # ShiftUp
    'Ca': '76',      # ShiftLeft
    'Cb': '77',      # ShiftDown
    'Cc': '78',      # ShiftRight
    'Cd': '79',      # IsNotEmpty
    'Ce': '80',      # ShiftForward
    'cS': '81',      # IsHealthNotFull
    'cP': '82',      # IsHealthLessThanHalf
    'L': '83',       # Label
    'G0': '84',      # YesNoGoto
    'G1': '85',      # NoYesGoto
    'G2': '86',      # Goto
    'G3': '87',      # Call
    'G4': '88',      # CallArg
    'c3': '89',      # None (COND: Ценная порода)
    'c4': '90',      # None (COND: Зелёный кри)
    'c5': '91',      # None (COND: Красный кри)
    'c6': '92',      # None (COND: Фиолетовый кри)
    'c7': '93',      # None (COND: Синий кри)
    'c8': '94',      # None (COND: Белый кри)
    'c9': '95',      # None (COND: Голубой кри)
    'cb': '96',      # None (COND: Золотоскал)
    'cc': '97',      # None (COND: Пустоскал)
    '=hp50': '98',   # IsHealthLessThanHalf
    '=hp-': '99',    # IsHealthNotFull
    'AGR-': '100',   # DisableAggression
    'AGR+': '101',   # EnableAggression
    'AUT-': '102',   # DisableAutoDig
    'AUT+': '103',   # EnableAutoDig
    'HAND-': '104',  # DisableHand
    'HAND+': '105',  # EnableHand
    'AND': '106',    # BooleanAND
    'OR': '107',     # BooleanOR
    'RESTART;': '108', # UNUSED_200
    'BEEP;': '109',  # PlaySound
    'FLIP;': '110',  # Flip
    'MINE;': '111',  # STDTunnel
    'HEAL;': '112',  # STDHeal
    'BUILD;': '113', # STDBlock
    'DIGG;': '114',  # STDDig
    'VB;': '115',    # BuildWar
    'RAND;': '116',  # RotateRandom
    'CCW;': '117',   # RotateLefthand
    'CW;': '118',    # RotateRighthand
    'CRAFT;': '119', # RefillCraft
    'C190;': '120',  # UseC190
    'FILL;': '121',  # ChargeGun
    'REM;': '122',   # UseRem
    'NANO;': '123',  # UseNano
    'ZZ;': '124',    # UseZZ
    'B1;': '125',    # UseBoom
    'B2;': '126',    # UseProt
    'B3;': '127',    # UseRaz
    '^W': '128',     # MoveUp
    '^A': '129',     # MoveLeft
    '^S': '130',     # MoveDown
    '^D': '131',     # MoveRight
    '^F': '132',     # MoveForward
    '<|': '133',     # Return
    '<-|': '134',    # ReturnArg
    '<=|': '135',    # ReturnState
    '=n': '136',     # IsNotEmpty
    '=e': '137',     # IsEmpty
    '=f': '138',     # IsFalling
    '=c': '139',     # IsCrystal
    '=a': '140',     # IsAliveCrystal
    '=b': '141',     # IsFallingLikeBoulder
    '=s': '142',     # IsFallingLikeLiquid
    '=k': '143',     # IsBreakable
    '=d': '144',     # IsUnbreakable
    '=A': '145',     # IsAcid
    '=B': '146',     # IsRedRock
    '=K': '147',     # IsBlackRock
    '=g': '148',     # IsGreenBlock
    '=y': '149',     # IsYellowBlock
    '=r': '150',     # IsRedBlock
    '=o': '151',     # IsStructure
    '=q': '152',     # IsQuadro
    '=R': '153',     # IsRoad
    '=x': '154',     # IsBox
    '=G': '155',     # IsInsideGun
    '#S': '156',     # Terminate
    '#E': '157',     # SetStart
    '[W]': '158',    # CellUp
    '[A]': '159',    # CellLeft
    '[S]': '160',    # CellDown
    '[D]': '161',    # CellRight
    '[WA]': '162',   # CellUpLeft
    '[WD]': '163',   # CellUpRight
    '[SA]': '164',   # CellDownLeft
    '[SD]': '165',   # CellDownRight
    '[AW]': '166',   # CellUpLeft
    '[DW]': '167',   # CellUpRight
    '[AS]': '168',   # CellDownLeft
    '[DS]': '169',   # CellDownRight
    '[F]': '170',    # CellForward
    '[r]': '171',    # CellRighthand
    '[l]': '172',    # CellLefthand
    '[w]': '173',    # ShiftUp
    '[a]': '174',    # ShiftLeft
    '[s]': '175',    # ShiftDown
    '[d]': '176',    # ShiftRight
    '[f]': '177',    # ShiftForward
    ',': '178',      # NextLine
    'h': '179',      # Heal
    'g': '180',      # UseGeo
    'r': '181',      # BuildRoad
    'q': '182',      # BuildQuadro
    'b': '183',      # BuildBlock
    'z': '184',      # Dig
    'w': '185',      # RotateUp
    'a': '186',      # RotateLeft
    's': '187',      # RotateDown
    'd': '188',      # RotateRight
    ' ': '189',      # None
    'iw': '190',     # InventoryUp
    'ia': '191',     # InventoryLeft
    'is': '192',     # InventoryDown
    'id': '193'      # InventoryRight
}

print('Какие операторы вы хотите добавить в программу?')
New_Operator=input().split()
New_Operator=[Mine_Cods[item] for item in New_Operator]
print(New_Operator)
print(' '.join(New_Operator))
Cods={
    '0': ' '.join(New_Operator)
}
Program=input('Запишите сюда прогу в виде кода из Cyber Chef: ').split()
Program_A=Program[:4]
print(Program_A)
Program_B=Program[4:]
print(Program_B)
Program_B_expanded = []
for item in Program_B:
    if item == '0':
        Program_B_expanded.extend(New_Operator)
    else:
        Program_B_expanded.append(item)
Program_B = Program_B_expanded
print(' '.join(Program_A), ' '.join(Program_B))