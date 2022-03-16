import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  showAlert = false;
  alertMessage = 'Please wait! Your account is being created.';
  alertColor = 'blue';
  inSubmission = false;

  name = new FormControl('', [Validators.required, Validators.minLength(3)]);
  email = new FormControl('', [Validators.required, Validators.email]);
  age = new FormControl('', [
    Validators.required,
    Validators.min(18),
    Validators.max(120),
  ]);
  password = new FormControl('', [
    Validators.required,
    // エラーになってしまうのでいったんコメントアウト
    // Validators.pattern(
    //   '/^(?=.*d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm'
    // ),
  ]);
  confirmPassword = new FormControl('', [
    Validators.required,
    // エラーになってしまうのでいったんコメントアウト
    // Validators.pattern(
    //   '/^(?=.*d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm'
    // ),
  ]);
  phoneNumber = new FormControl('', [
    Validators.required,
    Validators.minLength(14),
    Validators.maxLength(14),
  ]);

  form = new FormGroup({
    name: this.name,
    email: this.email,
    age: this.age,
    password: this.password,
    confirmPassword: this.confirmPassword,
    phoneNumber: this.phoneNumber,
  });

  constructor(private auth: AngularFireAuth) {}

  ngOnInit(): void {}

  async register() {
    this.showAlert = true;
    this.alertMessage = 'Please wait! Your account is being created.';
    this.alertColor = 'blue';
    this.inSubmission = true;

    try {
      const userCredentials = await this.auth.createUserWithEmailAndPassword(
        this.email.value,
        this.password.value
      );
      console.log(userCredentials);
    } catch (e) {
      console.error(e);

      this.alertMessage =
        'An unexpected error occurred. Please try again later';
      this.alertColor = 'red';
      this.inSubmission = false;
      return;
    }

    this.alertMessage = 'Success! Your account has been created.';
    this.alertColor = 'green';
    this.inSubmission = false;
  }
}
