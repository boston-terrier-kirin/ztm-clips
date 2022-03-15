import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css'],
})
export class AlertComponent implements OnInit {
  @Input() color = 'blue';

  constructor() {}

  ngOnInit(): void {}

  get bgColor() {
    // 動的クラスはtailwindがコンパイル時に理解してくれないので、tailwind.config.jsを修正する。
    return `bg-${this.color}-400`;
  }
}
