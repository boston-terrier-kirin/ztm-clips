import { Component, Input, OnInit } from '@angular/core';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css'],
})
export class ModalComponent implements OnInit {
  @Input() modalId = '';

  constructor(public modalService: ModalService) {}

  ngOnInit(): void {}

  closeModal() {
    this.modalService.toggleModal(this.modalId);
  }
}
