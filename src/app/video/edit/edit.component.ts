import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Clip } from 'src/app/models/clip.model';
import { ClipService } from 'src/app/services/clip.service';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css'],
})
export class EditComponent implements OnInit, OnChanges, OnDestroy {
  @Input() activeClip: Clip | null = null;
  @Output() update = new EventEmitter();

  showAlert = false;
  inSubmission = false;
  alertColor = 'blue';
  alertMessage = 'Please wait! Updating clip.';

  clipId = new FormControl('');
  title = new FormControl('', [Validators.required]);
  form = new FormGroup({
    id: this.clipId,
    title: this.title,
  });

  constructor(
    private modalService: ModalService,
    private clipService: ClipService
  ) {}

  ngOnInit(): void {
    this.modalService.register('editClip');

    // ngOnInitは、manage.componentのタイミングで呼ばれる。
    // この時はまだactiveClipはnullのまま。
    console.log('ngOnInit', this.activeClip);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.activeClip) {
      return;
    }

    // modalが開いて、ngOnChangesが呼ばれたタイミングで、formの初期値をセットする。
    console.log('ngOnChanges', this.activeClip);

    this.showAlert = false;
    this.inSubmission = false;
    this.clipId.setValue(this.activeClip.docId);
    this.title.setValue(this.activeClip.title);
  }

  ngOnDestroy(): void {
    this.modalService.unregister('editClip');
  }

  async submit() {
    if (!this.activeClip) {
      return;
    }

    this.showAlert = true;
    this.inSubmission = true;
    this.alertColor = 'blue';
    this.alertMessage = 'Please wait! Your clip is being uploaded.';

    try {
      await this.clipService.updateClip(this.clipId.value, this.title.value);
    } catch (e) {
      this.inSubmission = false;
      this.alertColor = 'red';
      this.alertMessage = 'Something went wrong. Try again later';
      return;
    }

    this.activeClip.title = this.title.value;
    this.update.emit(this.activeClip);

    this.inSubmission = false;
    this.alertColor = 'green';
    this.alertMessage = 'Success!';
  }
}
