import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import * as AOS from 'aos';
import { AuthServiceService } from 'src/app/core/services/auth-service.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  formGroupRegister: FormGroup;

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
      this.authService.register(this.formGroupRegister.value).subscribe(
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
}
