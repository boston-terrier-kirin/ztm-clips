import { Injectable } from '@angular/core';

interface Modal {
  id: string;
  visible: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private modals: Modal[] = [];

  constructor() {}

  isModalOpen(id: string): boolean {
    return this.modals.find((modal) => modal.id === id)?.visible ?? false;
  }

  toggleModal(id: string) {
    const modal = this.modals.find((modal) => modal.id === id);
    if (modal) {
      modal.visible = !modal.visible;
    }
  }

  register(id: string) {
    this.modals.push({
      id,
      visible: false,
    });
  }
}
