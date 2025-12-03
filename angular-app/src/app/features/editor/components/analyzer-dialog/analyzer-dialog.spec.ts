import { ComponentFixture, TestBed } from "@angular/core/testing";

import { AnalyzerDialogComponent } from "./analyzer-dialog";

describe("AnalyzerDialogComponent", () => {
  let component: AnalyzerDialogComponent;
  let fixture: ComponentFixture<AnalyzerDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalyzerDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AnalyzerDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
