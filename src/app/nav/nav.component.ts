import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ModalService } from '../services/modal.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css'],
})
export class NavComponent implements OnInit {
  constructor(
    public modalService: ModalService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {}

  openModal(e: Event) {
    e.preventDefault();

    this.modalService.toggleModal('auth');
  }
}
