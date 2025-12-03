import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SnippetsPanelComponent } from "./snippets-panel";

describe("SnippetsPanelComponent", () => {
  let component: SnippetsPanelComponent;
  let fixture: ComponentFixture<SnippetsPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SnippetsPanelComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SnippetsPanelComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
