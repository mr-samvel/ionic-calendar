import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { NewEventFormPage } from './new-event-form.page';

describe('NewEventFormPage', () => {
  let component: NewEventFormPage;
  let fixture: ComponentFixture<NewEventFormPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewEventFormPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(NewEventFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
