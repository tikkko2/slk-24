import { CanActivateFn } from '@angular/router';

export const confirmExitGuard: CanActivateFn = (route, state) => {
  return true;
};
