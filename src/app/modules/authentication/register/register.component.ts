import { HttpErrorResponse } from '@angular/common/http';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import * as AOS from 'aos';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthServiceService } from 'src/app/core/services/auth-service.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit, OnDestroy {
  formGroupRegister: FormGroup;
  destroyed$ = new Subject<void>();

  constructor(private authService: AuthServiceService) {}

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
            console.log(result);
            alert(result);
          },
          (error: HttpErrorResponse) => {
            console.log(error);
            console.log(error.error.message);
          }
        );
    }
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
