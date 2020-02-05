import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'change-period',
    loadChildren: () => import('./pages/change-period/change-period.module').then( m => m.ChangePeriodPageModule)
  }
  // Adicionado sozinho quando o ionic gera uma pagina. Como estamos utilizando tabs (com lazy loading) é desnecessario.
  // {
  //   path: 'home',
  //   loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule)
  // },
  // {
  //   path: 'calendar',
  //   loadChildren: () => import('./pages/calendar/calendar.module').then( m => m.CalendarPageModule)
  // },
  // {
  //   path: 'about',
  //   loadChildren: () => import('./pages/about/about.module').then( m => m.AboutPageModule)
  // }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
