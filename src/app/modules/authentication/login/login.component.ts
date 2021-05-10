import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import * as AOS from 'aos';
import { Subject } from 'rxjs';
import { AuthServiceService } from 'src/app/core/services/auth-service.service';
import { takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { UserLogged } from 'src/app/core/interfaces/login';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit, OnDestroy {
  formGroup: FormGroup;
  destroyed$ = new Subject<void>();

  constructor(
    private authService: AuthServiceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    AOS.init();
    this.initForm();
  }

  initForm(): void {
    this.formGroup = new FormGroup({
      userName: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
    });
  }

  login(): void {
    if (this.formGroup.valid) {
      this.authService
        .login(this.formGroup.value)
        .pipe(takeUntil(this.destroyed$))
        .subscribe(
          (loginInfo: UserLogged) => {
            this.authService.userLogged = loginInfo;
            this.router.navigateByUrl('/dashboard');
          },
          (error: HttpErrorResponse) => {
            Swal.fire(error.error.message, 'error');
          }
        );
    }
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
