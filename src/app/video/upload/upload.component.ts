import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { v4 as uuid } from 'uuid';
import { last } from 'rxjs/operators';

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

  title = new FormControl('', [Validators.required]);
  form = new FormGroup({
    title: this.title,
  });

  constructor(private fireStorage: AngularFireStorage) {}

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
    task.percentageChanges().subscribe((progress) => {
      this.percentage = (progress as number) / 100;
    });
    task
      .snapshotChanges()
      .pipe(
        // complete/errorするまでの値は無視する。
        last()
      )
      .subscribe({
        next: (snapshot) => {
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
