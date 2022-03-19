import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-clip',
  templateUrl: './clip.component.html',
  styleUrls: ['./clip.component.css'],
})
export class ClipComponent implements OnInit {
  id = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    // snapshotでは、同一コンポーネントで /:param の部分が変わった場合に、新しい値が取れない。
    // this.id = this.route.snapshot.params['id'];
    this.route.params.subscribe((params: Params) => {
      this.id = params['id'];
    });
  }
}
