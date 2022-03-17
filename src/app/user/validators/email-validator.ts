import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  AbstractControl,
  AsyncValidator,
  ValidationErrors,
} from '@angular/forms';
import { Observable } from 'rxjs';

// AngularFireAuthがInjectされるようにするために、@Injectableが必要
@Injectable({
  providedIn: 'root',
})
export class EmailValidator implements AsyncValidator {
  constructor(private auth: AngularFireAuth) {}

  /**
   * arrow funtionにしないとエラーになってしまう件。
   * うまく理解できず。
   */
  validate = (control: AbstractControl): Promise<ValidationErrors | null> => {
    return this.auth
      .fetchSignInMethodsForEmail(control.value)
      .then((res) => (res.length ? { emailTaken: true } : null));
  };
}
