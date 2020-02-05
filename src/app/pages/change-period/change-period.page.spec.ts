import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ChangePeriodPage } from './change-period.page';

describe('ChangePeriodPage', () => {
  let component: ChangePeriodPage;
  let fixture: ComponentFixture<ChangePeriodPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangePeriodPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ChangePeriodPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
