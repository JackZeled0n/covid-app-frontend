import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthServiceService } from '../services/auth-service.service';
import { UserLogged } from '../interfaces/login';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthServiceService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> | boolean {
    return this.authService.me().pipe(
      map((user: UserLogged) => {
        this.authService.userLogged = user;
        return true;
      }),
      catchError((err) => {
        this.router.navigateByUrl('/');
        return of(false);
      })
    );
  }
}
