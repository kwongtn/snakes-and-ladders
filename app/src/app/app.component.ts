import { NzAvatarModule } from "ng-zorro-antd/avatar";
import { NzBreadCrumbModule } from "ng-zorro-antd/breadcrumb";
import { NzButtonModule } from "ng-zorro-antd/button";
import { NzIconModule } from "ng-zorro-antd/icon";
import { NzLayoutModule } from "ng-zorro-antd/layout";
import { NzMenuModule } from "ng-zorro-antd/menu";
import { filter, tap } from "rxjs";

import { CommonModule, DOCUMENT } from "@angular/common";
import { Component, Inject, OnInit } from "@angular/core";
import {
    NavigationCancel,
    NavigationEnd,
    NavigationSkipped,
    NavigationStart,
    Router,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
} from "@angular/router";

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    NzAvatarModule,
    NzBreadCrumbModule,
    NzButtonModule,
    NzIconModule,
    NzLayoutModule,
    NzMenuModule,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
})
export class AppComponent implements OnInit {
  headerMap = [
    {
      title: 'Board',
      href: '/board',
      icon: 'borderless-table',
      loading: false,
    },
    {
      title: 'Settings',
      href: '/settings',
      icon: 'control',
      loading: false,
    },
  ];

  constructor(
    private router: Router,
    @Inject(DOCUMENT) private document: Document
  ) {}

  getMapIndex(path: string | undefined): number {
    return this.headerMap.findIndex((val) => {
      return path?.startsWith(val.href);
    });
  }

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter((event) => {
          return (
            event instanceof NavigationStart ||
            event instanceof NavigationEnd ||
            event instanceof NavigationCancel ||
            event instanceof NavigationSkipped
          );
        }),
        tap((event) => {
          const index = this.getMapIndex(event.url);
          if (index < 0) {
            return;
          } else if (event instanceof NavigationStart) {
            this.headerMap[this.getMapIndex(event.url)].loading = true;
          } else if (
            event instanceof NavigationEnd ||
            event instanceof NavigationCancel ||
            event instanceof NavigationSkipped
          ) {
            this.headerMap[this.getMapIndex(event.url)].loading = false;
          }
        })
      )
      .subscribe();
  }
}
