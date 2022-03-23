import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Clip } from 'src/app/models/clip.model';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css'],
})
export class EditComponent implements OnInit, OnChanges, OnDestroy {
  @Input() activeClip: Clip | null = null;

  clipId = new FormControl('');
  title = new FormControl('', [Validators.required]);
  form = new FormGroup({
    id: this.clipId,
    title: this.title,
  });

  constructor(private modalService: ModalService) {}

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

    this.clipId.setValue(this.activeClip.docId);
    this.title.setValue(this.activeClip.title);
  }

  ngOnDestroy(): void {
    this.modalService.unregister('editClip');
  }
}
