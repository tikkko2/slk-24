import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScriptComponent } from './script.component';

describe('ScriptComponent', () => {
  let component: ScriptComponent;
  let fixture: ComponentFixture<ScriptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScriptComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ScriptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
