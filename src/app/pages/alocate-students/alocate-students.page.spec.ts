import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AlocateStudentsPage } from './alocate-students.page';

describe('AlocateStudentsPage', () => {
  let component: AlocateStudentsPage;
  let fixture: ComponentFixture<AlocateStudentsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AlocateStudentsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AlocateStudentsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
