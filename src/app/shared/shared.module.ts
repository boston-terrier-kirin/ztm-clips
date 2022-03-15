import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from './modal/modal.component';
import { InputComponent } from './input/input.component';
import { ReactiveFormsModule } from '@angular/forms';
import { TabContainerComponent } from './tab-container/tab-container.component';
import { TabComponent } from './tab/tab.component';
import { NgxMaskModule } from 'ngx-mask';

@NgModule({
  declarations: [
    ModalComponent,
    TabContainerComponent,
    TabComponent,
    InputComponent,
  ],
  imports: [CommonModule, ReactiveFormsModule, NgxMaskModule.forRoot()],
  exports: [
    ModalComponent,
    TabContainerComponent,
    TabComponent,
    InputComponent,
  ],
})
export class SharedModule {}
