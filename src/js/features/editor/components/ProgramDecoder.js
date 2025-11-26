/**
 * ProgramDecoder - веб-інтерфейс для декодування програм Mines
 * Реалізує функціональність Python скрипта decypher.py
 */
import { Component } from "../../../core/utils/Component.js";
import { ProgAction } from "../../../core/constants/actions.js";
import { loggers } from "../../../utils/logging/logger.js";

export class ProgramDecoder {
  constructor() {
    this.logger = loggers.core.child("ProgramDecoder");
    this.actionCodes = this.buildActionCodes();
  }

  /**
   * Створює карту кодів дій на основі ProgAction enum
   * @returns {Map<string, number>} Мапа символів до кодів дій
   */
  buildActionCodes() {
    const codes = new Map();

    // Mine_Cods dictionary from decypher.py - mapping operators to numeric codes
    codes.set("_", "0"); // None
    codes.set("\\", "1"); // NextLine
    codes.set(">", "2"); // SetStart
    codes.set("<", "3"); // Terminate
    codes.set("W", "4"); // MoveUp
    codes.set("A", "5"); // MoveLeft
    codes.set("S", "6"); // MoveDown
    codes.set("D", "7"); // MoveRight
    codes.set("Z0", "8"); // Dig
    codes.set("w", "9"); // RotateUp
    codes.set("a", "10"); // RotateLeft
    codes.set("s", "11"); // RotateDown
    codes.set("d", "12"); // RotateRight
    codes.set("Z1", "13"); // RepeatLastAction
    codes.set("Z2", "14"); // MoveForward
    codes.set("Z3", "15"); // RotateLefthand
    codes.set("Z4", "16"); // RotateRighthand
    codes.set("Zc", "17"); // BuildBlock
    codes.set("Ze", "18"); // UseGeo
    codes.set("Zd", "19"); // BuildRoad
    codes.set("Zf", "20"); // Heal
    codes.set("Zg", "21"); // BuildQuadro
    codes.set("Z5", "22"); // RotateRandom
    codes.set("Zh", "23"); // PlaySound
    codes.set("R0", "24"); // Return
    codes.set("R1", "25"); // ReturnArg
    codes.set("G0", "84"); // YesNoGoto
    codes.set("G1", "85"); // NoYesGoto
    codes.set("G2", "86"); // Goto
    codes.set("G3", "87"); // Call
    codes.set("G4", "88"); // CallArg
    codes.set("C0", "26"); // CellUpLeft
    codes.set("C8", "27"); // CellDownRight
    codes.set("C1", "28"); // CellUp
    codes.set("C2", "29"); // CellUpRight
    codes.set("C3", "30"); // CellLeft
    codes.set("C4", "31"); // Cell
    codes.set("C5", "32"); // CellRight
    codes.set("C6", "33"); // CellDownLeft
    codes.set("C7", "34"); // CellDown
    codes.set("cO", "35"); // CellForward
    codes.set("M0", "36"); // BooleanOR
    codes.set("M1", "37"); // BooleanAND
    codes.set("c0", "38"); // IsNotEmpty
    codes.set("c1", "39"); // IsEmpty
    codes.set("c2", "40"); // IsFalling
    codes.set("cs", "41"); // IsCrystal
    codes.set("ct", "42"); // IsBreakable
    codes.set("cu", "43"); // IsUnbreakable
    codes.set("cv", "44"); // IsRedRock
    codes.set("ca", "45"); // IsBlackRock
    codes.set("cd", "46"); // IsSand
    codes.set("cw", "47"); // IsQuadro
    codes.set("cf", "48"); // IsRoad
    codes.set("ce", "49"); // IsRedBlock
    codes.set("ch", "50"); // IsYellowBlock
    codes.set("ci", "51"); // IsAcidRock
    codes.set("cj", "52"); // IsBoulder
    codes.set("ck", "53"); // IsLava
    codes.set("cl", "54"); // IsCyanAlive
    codes.set("cm", "55"); // IsWhiteAlive
    codes.set("cn", "56"); // IsRedAlive
    codes.set("co", "57"); // IsVioletAlive
    codes.set("cp", "58"); // IsBlackAlive
    codes.set("cq", "59"); // IsBlueAlive
    codes.set("cr", "60"); // IsRainbowAlive
    codes.set("cg", "61"); // IsGreenBlock
    codes.set("cQ", "62"); // IsBasketFull
    codes.set("cR", "63"); // IsGeoFull
    codes.set("@", "64"); // SetStartWhenDied
    codes.set("+", "65"); // SetStartWhenHurt
    codes.set("&", "66"); // SetStartWhenBotNearby
    codes.set("Zi", "67"); // BoxAll
    codes.set("Zj", "68"); // BoxHalf
    codes.set("Zk", "69"); // BoxWhite
    codes.set("Zl", "70"); // BoxGreen
    codes.set("Zm", "71"); // BoxRed
    codes.set("Zn", "72"); // BoxBlue
    codes.set("Zo", "73"); // BoxCyan
    codes.set("Zp", "74"); // BoxViolet
    codes.set("C9", "75"); // ShiftUp
    codes.set("Ca", "76"); // ShiftLeft
    codes.set("Cb", "77"); // ShiftDown
    codes.set("Cc", "78"); // ShiftRight
    codes.set("Cd", "79"); // IsNotEmpty
    codes.set("Ce", "80"); // ShiftForward
    codes.set("cS", "81"); // IsHealthNotFull
    codes.set("cP", "82"); // IsHealthLessThanHalf
    codes.set("L", "83"); // Label
    codes.set("c3", "89"); // None (COND: Ценная порода)
    codes.set("c4", "90"); // None (COND: Зелёный кри)
    codes.set("c5", "91"); // None (COND: Красный кри)
    codes.set("c6", "92"); // None (COND: Фиолетовый кри)
    codes.set("c7", "93"); // None (COND: Синий кри)
    codes.set("c8", "94"); // None (COND: Белый кри)
    codes.set("c9", "95"); // None (COND: Голубой кри)
    codes.set("cb", "96"); // None (COND: Золотоскал)
    codes.set("cc", "97"); // None (COND: Пустоскал)
    codes.set("=hp50", "98"); // IsHealthLessThanHalf
    codes.set("=hp-", "99"); // IsHealthNotFull
    codes.set("AGR-", "100"); // DisableAggression
    codes.set("AGR+", "101"); // EnableAggression
    codes.set("AUT-", "102"); // DisableAutoDig
    codes.set("AUT+", "103"); // EnableAutoDig
    codes.set("HAND-", "104"); // DisableHand
    codes.set("HAND+", "105"); // EnableHand
    codes.set("AND", "106"); // BooleanAND
    codes.set("OR", "107"); // BooleanOR
    codes.set("RESTART;", "108"); // UNUSED_200
    codes.set("BEEP;", "109"); // PlaySound
    codes.set("FLIP;", "110"); // Flip
    codes.set("MINE;", "111"); // STDTunnel
    codes.set("HEAL;", "112"); // STDHeal
    codes.set("BUILD;", "113"); // STDBlock
    codes.set("DIGG;", "114"); // STDDig
    codes.set("VB;", "115"); // BuildWar
    codes.set("RAND;", "116"); // RotateRandom
    codes.set("CCW;", "117"); // RotateLefthand
    codes.set("CW;", "118"); // RotateRighthand
    codes.set("CRAFT;", "119"); // RefillCraft
    codes.set("C190;", "120"); // UseC190
    codes.set("FILL;", "121"); // ChargeGun
    codes.set("REM;", "122"); // UseRem
    codes.set("NANO;", "123"); // UseNano
    codes.set("ZZ;", "124"); // UseZZ
    codes.set("B1;", "125"); // UseBoom
    codes.set("B2;", "126"); // UseRaz
    codes.set("B3;", "127"); // UseProt
    codes.set("^W", "128"); // MoveUp
    codes.set("^A", "129"); // MoveLeft
    codes.set("^S", "130"); // MoveDown
    codes.set("^D", "131"); // MoveRight
    codes.set("^F", "132"); // MoveForward
    codes.set("<|", "133"); // Return
    codes.set("<-|", "134"); // ReturnArg
    codes.set("<=|", "135"); // ReturnState
    codes.set("=n", "136"); // IsNotEmpty
    codes.set("=e", "137"); // IsEmpty
    codes.set("=f", "138"); // IsFalling
    codes.set("=c", "139"); // IsCrystal
    codes.set("=a", "140"); // IsAliveCrystal
    codes.set("=b", "141"); // IsFallingLikeBoulder
    codes.set("=s", "142"); // IsFallingLikeLiquid
    codes.set("=k", "143"); // IsBreakable
    codes.set("=d", "144"); // IsUnbreakable
    codes.set("=A", "145"); // IsAcid
    codes.set("=B", "146"); // IsRedRock
    codes.set("=K", "147"); // IsBlackRock
    codes.set("=g", "148"); // IsGreenBlock
    codes.set("=y", "149"); // IsYellowBlock
    codes.set("=r", "150"); // IsRedBlock
    codes.set("=o", "151"); // IsStructure
    codes.set("=q", "152"); // IsQuadro
    codes.set("=R", "153"); // IsRoad
    codes.set("=x", "154"); // IsBox
    codes.set("=G", "155"); // IsInsideGun
    codes.set("#S", "156"); // Terminate
    codes.set("#E", "157"); // SetStart
    codes.set("[W]", "158"); // CellUp
    codes.set("[A]", "159"); // CellLeft
    codes.set("[S]", "160"); // CellDown
    codes.set("[D]", "161"); // CellRight
    codes.set("[WA]", "162"); // CellUpLeft
    codes.set("[WD]", "163"); // CellUpRight
    codes.set("[SA]", "164"); // CellDownLeft
    codes.set("[SD]", "165"); // CellDownRight
    codes.set("[AW]", "166"); // CellUpLeft
    codes.set("[DW]", "167"); // CellUpRight
    codes.set("[AS]", "168"); // CellDownLeft
    codes.set("[DS]", "169"); // CellDownRight
    codes.set("[F]", "170"); // CellForward
    codes.set("[r]", "171"); // CellRighthand
    codes.set("[l]", "172"); // CellLefthand
    codes.set("[w]", "173"); // ShiftUp
    codes.set("[a]", "174"); // ShiftLeft
    codes.set("[s]", "175"); // ShiftDown
    codes.set("[d]", "176"); // ShiftRight
    codes.set("[f]", "177"); // ShiftForward
    codes.set(",", "178"); // NextLine
    codes.set("h", "179"); // Heal
    codes.set("g", "180"); // UseGeo
    codes.set("r", "181"); // BuildRoad
    codes.set("q", "182"); // BuildQuadro
    codes.set("b", "183"); // BuildBlock
    codes.set("z", "184"); // Dig
    codes.set("w", "185"); // RotateUp
    codes.set("a", "186"); // RotateLeft
    codes.set("s", "187"); // RotateDown
    codes.set("d", "188"); // RotateRight
    codes.set(" ", "189"); // None
    codes.set("iw", "190"); // InventoryUp
    codes.set("ia", "191"); // InventoryLeft
    codes.set("is", "192"); // InventoryDown
    codes.set("id", "193"); // InventoryRight

    return codes;
  }

  /**
   * Створює UI компонент декодера програм
   * @returns {HTMLElement} DOM елемент інтерфейсу
   */
  createUI() {
    const container = Component.create("div").class("program-decoder").render();

    const title = Component.create("h3")
      .text("🎯 Декодер програм Mines")
      .render();

    const description = Component.create("p")
      .class("decoder-description")
      .text(
        "Введіть оператори через пробіл для перетворення в цифровий формат програм Mines",
      )
      .render();

    const inputGroup = Component.create("div").class("input-group").render();

    const inputLabel = Component.create("label")
      .attr("for", "program-input")
      .text("Оператори:")
      .render();

    const input = Component.create("textarea")
      .id("program-input")
      .attr("placeholder", "W A S D Z0 w a s d")
      .attr("rows", "3")
      .render();

    const button = Component.create("button")
      .class("decode-btn")
      .text("🔄 Декодувати")
      .on("click", () => this.decodeProgram())
      .render();

    const outputGroup = Component.create("div").class("output-group").render();

    const outputLabel = Component.create("label").text("Результат:").render();

    const output = Component.create("div")
      .id("program-output")
      .class("program-output")
      .text("Тут з'явиться результат декодування...")
      .render();

    // Додаємо елементи до контейнерів
    inputGroup.appendChild(inputLabel);
    inputGroup.appendChild(input);
    inputGroup.appendChild(button);

    outputGroup.appendChild(outputLabel);
    outputGroup.appendChild(output);

    container.appendChild(title);
    container.appendChild(description);
    container.appendChild(inputGroup);
    container.appendChild(outputGroup);

    this.inputElement = input;
    this.outputElement = output;

    return container;
  }

  /**
   * Декодує введену програму в цифровий формат
   */
  decodeProgram() {
    try {
      const input = this.inputElement.value.trim();
      if (!input) {
        this.showResult("❌ Будь ласка, введіть оператори", "error");
        return;
      }

      const operators = input.split(/\s+/).filter(op => op.length > 0);
      const codes = [];

      for (const op of operators) {
        const code = this.actionCodes.get(op);
        if (code === undefined) {
          this.showResult(`❌ Невідомий оператор: "${op}"`, "error");
          return;
        }
        codes.push(code);
      }

      const result = codes.join(" ");
      this.showResult(`✅ Результат: ${result}`, "success");

      this.logger.info("Програма успішно декодована", { operators, codes });
    } catch (error) {
      this.showResult(`❌ Помилка декодування: ${error.message}`, "error");
      this.logger.error("Помилка декодування програми", error);
    }
  }

  /**
   * Відображає результат декодування
   * @param {string} message - Повідомлення для відображення
   * @param {string} type - Тип повідомлення ('success' | 'error')
   */
  showResult(message, type = "info") {
    this.outputElement.textContent = message;
    this.outputElement.className = `program-output ${type}`;
  }
}
