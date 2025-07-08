import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountSecurityModalComponent } from './account-security-modal.component';

describe('AccountSecurityModalComponent', () => {
  let component: AccountSecurityModalComponent;
  let fixture: ComponentFixture<AccountSecurityModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountSecurityModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountSecurityModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
