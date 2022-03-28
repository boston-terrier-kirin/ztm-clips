import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import firebase from 'firebase/compat/app';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  AngularFireStorage,
  AngularFireUploadTask,
} from '@angular/fire/compat/storage';
import { v4 as uuid } from 'uuid';
import { combineLatest, forkJoin } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ClipService } from 'src/app/services/clip.service';
import { Router } from '@angular/router';
import { FfmpegService } from 'src/app/services/ffmpeg.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css'],
})
export class UploadComponent implements OnInit, OnDestroy {
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
  task?: AngularFireUploadTask;
  screenShotTask?: AngularFireUploadTask;
  screenShots: string[] = [];
  selectedScreenShot = '';

  title = new FormControl('', [Validators.required]);
  form = new FormGroup({
    title: this.title,
  });

  constructor(
    private fireAuth: AngularFireAuth,
    private fireStorage: AngularFireStorage,
    private router: Router,
    private clipService: ClipService,
    public ffmpegService: FfmpegService
  ) {
    this.fireAuth.user.subscribe((user) => (this.user = user));
    this.ffmpegService.init();
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    // アップロード中に他の画面に遷移した場合、キャンセルする。
    this.task?.cancel();
  }

  async storeFile(event: Event) {
    if (this.ffmpegService.isRunning) {
      return;
    }

    this.isDragover = false;

    if ((event as DragEvent).dataTransfer) {
      // Drap & Dropの場合
      this.file = (event as DragEvent).dataTransfer?.files.item(0) ?? null;
    } else {
      // File選択の場合
      this.file = (event.target as HTMLInputElement).files?.item(0) ?? null;
    }

    if (!this.file || this.file.type !== 'video/mp4') {
      return;
    }

    this.screenShots = await this.ffmpegService.getScreenShots(this.file);
    this.selectedScreenShot = this.screenShots[0];

    this.title.setValue(
      // 拡張子なし
      this.file.name.replace(/\.[^/.]/, '')
    );
    this.nextStep = true;
  }

  async uploadFile() {
    this.form.disable();
    this.showAlert = true;
    this.alertColor = 'blue';
    this.alertMessage = 'Please wait! Your clip is being uploaded.';
    this.inSubmission = true;
    this.showPercentage = true;

    const clipFileName = uuid();

    // mp4のアップロード
    const clipPath = `clips/${clipFileName}.mp4`;
    this.task = this.fireStorage.upload(clipPath, this.file);
    const clipRef = this.fireStorage.ref(clipPath);

    // サムネのアップロード
    const screenShotPath = `screenShots/${clipFileName}.png`;
    const screenShotBlob = await this.ffmpegService.blobFromURL(
      this.selectedScreenShot
    );
    this.screenShotTask = this.fireStorage.upload(
      screenShotPath,
      screenShotBlob
    );
    const screenShotRef = this.fireStorage.ref(screenShotPath);

    // mp4＋サムネの両方でパーセンテージを計算する
    combineLatest([
      this.task.percentageChanges(),
      this.screenShotTask.percentageChanges(),
    ]).subscribe((progress) => {
      const [clipProgress, screenShotProgress] = progress;

      if (!clipProgress || !screenShotProgress) {
        return;
      }

      const total = clipProgress + screenShotProgress;
      this.percentage = (total as number) / 200;
    });

    forkJoin([
      this.task.snapshotChanges(),
      this.screenShotTask.snapshotChanges(),
    ])
      .pipe(
        // forkJoinを適用したことでlastは使わなくなった。
        // complete/errorするまでの値は無視する。
        // last(),
        switchMap(() =>
          forkJoin([clipRef.getDownloadURL(), screenShotRef.getDownloadURL()])
        )
      )
      .subscribe({
        next: async (urls) => {
          const [clipUrl, screenShotUrl] = urls;

          const clip = {
            // as stringをつけることで、
            // Type 'string | undefined' is not assignable to type 'string'. のエラーを回避できる。
            uid: this.user?.uid as string,
            displayName: this.user?.displayName as string,
            title: this.title.value,
            fileName: `${clipFileName}.mp4`,
            url: clipUrl,
            screenShotUrl: screenShotUrl,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          };

          const clipDocRef = await this.clipService.createClip(clip);

          this.alertColor = 'green';
          this.alertMessage =
            'Success! Your clip is now ready to share with the world.';
          this.showPercentage = false;

          setTimeout(() => {
            // https://firebase.google.com/docs/reference/node/firebase.firestore.DocumentReference
            this.router.navigate(['clip', clipDocRef.id]);
          }, 1000);
        },
        error: (error) => {
          // https://firebase.google.com/docs/storage/web/handle-errors
          this.alertColor = 'red';
          this.alertMessage = 'Upload failed! Please try again later.';
          this.inSubmission = true;
          this.showPercentage = false;
          this.form.enable();
          console.error(error);
        },
      });
  }
}
