import { Routes } from "@angular/router";

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/board' },
  {
    path: 'board',
    loadComponent: async () => {
      return import('./pages/board/board.component').then((c) => {
        return c.BoardComponent;
      });
    },
  },
];
