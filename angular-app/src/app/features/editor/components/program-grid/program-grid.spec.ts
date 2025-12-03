import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ProgramGridComponent } from "./program-grid";

describe("ProgramGridComponent", () => {
  let component: ProgramGridComponent;
  let fixture: ComponentFixture<ProgramGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgramGridComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProgramGridComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
