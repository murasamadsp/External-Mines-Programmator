import { ComponentFixture, TestBed } from "@angular/core/testing";

import { DecoderDialogComponent } from "./decoder-dialog";

describe("DecoderDialogComponent", () => {
  let component: DecoderDialogComponent;
  let fixture: ComponentFixture<DecoderDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DecoderDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DecoderDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
