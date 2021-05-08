import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './modules/authentication/login/login.component';
import { RegisterComponent } from './modules/authentication/register/register.component';
import { DashboardComponent } from './modules/dashboard/dashboard.component';

const routes: Routes = [
    {
        path: ''
        , component: LoginComponent
    },
    {
        path: 'login'
        , component: LoginComponent
    },
    {
        path: 'dashboard'
        , component: DashboardComponent
    },
    {
        path: 'register'
        , component: RegisterComponent
    }
];

@NgModule({
    declarations: [],
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
  })
  export class AppRoutingModule {}