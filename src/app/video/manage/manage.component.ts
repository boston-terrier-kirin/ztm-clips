import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { Clip } from 'src/app/models/clip.model';
import { ClipService } from 'src/app/services/clip.service';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.css'],
})
export class ManageComponent implements OnInit {
  videoOrder = '1';
  clips: Clip[] = [];
  activeClip: Clip | null = null;

  sort$: BehaviorSubject<string>;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private clipService: ClipService,
    private modalService: ModalService
  ) {
    this.sort$ = new BehaviorSubject(this.videoOrder);
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params: Params) => {
      this.videoOrder = params['sort'] === '2' ? params['sort'] : '1';
      this.sort$.next(this.videoOrder);
    });

    this.clipService.getUserClips(this.sort$).subscribe((docs) => {
      this.clips = [];

      docs.forEach((doc) => {
        this.clips.push({
          docId: doc.id,
          ...doc.data(),
        });
      });
    });
  }

  sort(e: Event) {
    const { value } = e.target as HTMLSelectElement;

    // this.router.navigateByUrl(`/manage?sort=${value}`);
    // navigate + relativeTo を使えば、URL直書きを減らせる。
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        sort: value,
      },
    });
  }

  openModal(e: Event, clip: Clip) {
    e.preventDefault();

    this.activeClip = clip;
    this.modalService.toggleModal('editClip');
  }

  deleteClip(e: Event, clip: Clip) {
    e.preventDefault();

    this.clipService.deleteClip(clip);

    this.clips.forEach((element, index) => {
      if (element.docId === clip.docId) {
        this.clips.splice(index, 1);
      }
    });
  }

  update(e: Clip) {
    this.clips.forEach((clip, index) => {
      if (clip.docId === e.docId) {
        this.clips[index].title = e.title;
      }
    });
  }
}
