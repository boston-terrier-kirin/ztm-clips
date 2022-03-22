import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import firebase from 'firebase/compat/app';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { v4 as uuid } from 'uuid';
import { last, switchMap } from 'rxjs/operators';
import { ClipService } from 'src/app/services/clip.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css'],
})
export class UploadComponent implements OnInit {
  isDragover = false;
  file: File | null = null;
  nextStep = false;
  showAlert = false;
  alertColor = 'blue';
  alertMessage = 'Please wait! Your clip is being uploaded.';
  inSubmission = false;
  showPercentage = false;
  percentage = 0;
  user: firebase.User | null = null;

  title = new FormControl('', [Validators.required]);
  form = new FormGroup({
    title: this.title,
  });

  constructor(
    private fireAuth: AngularFireAuth,
    private fireStorage: AngularFireStorage,
    private clipService: ClipService
  ) {
    this.fireAuth.user.subscribe((user) => (this.user = user));
  }

  ngOnInit(): void {}

  storeFile(event: Event) {
    this.isDragover = false;

    this.file = (event as DragEvent).dataTransfer?.files.item(0) ?? null;
    console.log(this.file);

    if (!this.file || this.file.type !== 'video/mp4') {
      return;
    }

    this.title.setValue(
      // 拡張子なし
      this.file.name.replace(/\.[^/.]/, '')
    );
    this.nextStep = true;
  }

  uploadFile() {
    this.showAlert = true;
    this.alertColor = 'blue';
    this.alertMessage = 'Please wait! Your clip is being uploaded.';
    this.inSubmission = true;
    this.showPercentage = true;

    const clipFileName = uuid();
    const clipPath = `clips/${clipFileName}.mp4`;

    const task = this.fireStorage.upload(clipPath, this.file);
    const clipRef = this.fireStorage.ref(clipPath);

    task.percentageChanges().subscribe((progress) => {
      this.percentage = (progress as number) / 100;
    });

    task
      .snapshotChanges()
      .pipe(
        // complete/errorするまでの値は無視する。
        last(),
        // 【消化不良】switchMapしているので、アップロードを無視するのでは？⇒一応、ちゃんと動くっぽい。
        switchMap(() => clipRef.getDownloadURL())
      )
      .subscribe({
        next: (url) => {
          const clip = {
            // as stringをつけることで、
            // Type 'string | undefined' is not assignable to type 'string'. のエラーを回避できる。
            uid: this.user?.uid as string,
            displayName: this.user?.displayName as string,
            title: this.title.value,
            fileName: `${clipFileName}.mp4`,
            url,
          };

          console.log(clip);
          this.clipService.createClip(clip);

          this.alertColor = 'green';
          this.alertMessage =
            'Success! Your clip is now ready to share with the world.';
          this.showPercentage = false;
        },
        error: (error) => {
          // https://firebase.google.com/docs/storage/web/handle-errors
          this.alertColor = 'red';
          this.alertMessage = 'Upload failed! Please try again later.';
          this.inSubmission = true;
          this.showPercentage = false;
          console.error(error);
        },
      });
  }
}
