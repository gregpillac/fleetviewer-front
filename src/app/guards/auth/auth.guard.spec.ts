import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { UserService } from '../../services/user/user.service';

// Mocks
const mockAuthService = {
  isLoggedIn: jasmine.createSpy('isLoggedIn'),
};

const mockUserService = {
  getCurrentUser: jasmine.createSpy('getCurrentUser'),
};

const mockRouter = {
  navigate: jasmine.createSpy('navigate'),
};

describe('canActivateWithRole', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserService, useValue: mockUserService },
        { provide: Router, useValue: mockRouter },
      ],
    });

    // Reset spies
    mockAuthService.isLoggedIn.calls.reset();
    mockUserService.getCurrentUser.calls.reset();
    mockRouter.navigate.calls.reset();
  });
});
