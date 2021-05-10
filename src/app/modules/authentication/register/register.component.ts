import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import * as AOS from 'aos';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthServiceService } from 'src/app/core/services/auth-service.service';
import Swal from 'sweetalert2';
import getError from '../../utils/error';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit, OnDestroy {
  formGroupRegister: FormGroup;
  destroyed$ = new Subject<void>();

  constructor(
    private authService: AuthServiceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    AOS.init();
    this.initFormRegistro();
  }

  initFormRegistro(): void {
    this.formGroupRegister = new FormGroup({
      userName: new FormControl('', [Validators.required]),
      name: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
    });
  }

  register(): void {
    if (this.formGroupRegister.valid) {
      this.authService
        .register(this.formGroupRegister.value)
        .pipe(takeUntil(this.destroyed$))
        .subscribe(
          (result) => {
            Swal.fire({
              title: 'Do you want to login?',
              text: 'You have been registered',
              icon: 'success',
              showCancelButton: true,
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#d33',
              confirmButtonText: 'Yes, login!',
            }).then((result) => {
              if (result.isConfirmed) {
                this.router.navigateByUrl('/login');
              }
            });
          },
          (error: HttpErrorResponse) => {
            const errorMessage = getError(error);
            Swal.fire('Register', errorMessage, 'error');
          }
        );
    }
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
