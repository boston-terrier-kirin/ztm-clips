import { Component, ElementRef, Input, OnInit } from '@angular/core';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css'],
})
export class ModalComponent implements OnInit {
  @Input() modalId = '';

  constructor(
    public modalService: ModalService,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    // これでapp-modalがbody直下にくるので、親要素のCSS引き継ぎ問題を解決できる。
    document.body.appendChild(this.elementRef.nativeElement);
  }

  closeModal() {
    this.modalService.toggleModal(this.modalId);
  }
}
