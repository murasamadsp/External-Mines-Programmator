import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ActionPaletteComponent } from "./action-palette";

describe("ActionPaletteComponent", () => {
  let component: ActionPaletteComponent;
  let fixture: ComponentFixture<ActionPaletteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionPaletteComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ActionPaletteComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
