import {
  ChangeDetectionStrategy,
  Component,
  TrackByFunction,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { RxState } from '@rx-angular/state';
import { distinctUntilChanged, filter, map } from 'rxjs';
import { TMDBMovieGenreModel } from '../data-access/api/model/movie-genre.model';
import { trackByProp } from '../shared/utils/track-by';
import { getActions } from '../shared/rxa-custom/actions';
import { RouterState } from '../shared/state/router.state';
import { getIdentifierOfTypeAndLayout } from '../shared/state/utils';
import { GenreState } from '../shared/state/genre.state';

@Component({
  selector: 'app-shell',
  templateUrl: './app-shell.component.html',
  styleUrls: ['./app-shell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  providers: [RxState],
})
export class AppShellComponent {
  search$ = this.routerState.select(
    getIdentifierOfTypeAndLayout('search', 'list')
  );

  constructor(
    private readonly state: RxState<{
      sideDrawerOpen: boolean;
    }>,
    public routerState: RouterState,
    public genreState: GenreState,
    private router: Router
  ) {
    this.init();
    /**
     * **🚀 Perf Tip for TBT:**
     *
     * Disable initial sync navigation in router config and schedule it in router-outlet container component.
     * We use a scheduling API (setTimeout) to run it in a separate task from the bootstrap phase
     */
    // @TODO !!!BUG!!! use current URL
    setTimeout(() => this.router.navigate(['list/category/popular']));
  }

  init() {
    this.state.set({ sideDrawerOpen: false });
    this.state.connect('sideDrawerOpen', this.ui.sideDrawerOpenToggle$);

    this.state.hold(
      this.router.events.pipe(
        filter((e) => e instanceof NavigationEnd),
        map((e) => (e as NavigationEnd).urlAfterRedirects),
        distinctUntilChanged()
      ),
      () => this.closeSidenav()
    );
  }

  readonly genres$ = this.genreState.genresNames$;
  @ViewChild('snav') snav: any;

  readonly viewState$ = this.state.select();

  readonly ui = getActions<{
    sideDrawerOpenToggle: boolean;
  }>();

  readonly trackByGenre: TrackByFunction<TMDBMovieGenreModel> =
    trackByProp<TMDBMovieGenreModel>('name');

  searchMovie(term: string) {
    term === ''
      ? this.router.navigate(['list/category/popular'])
      : this.router.navigate([`list/search/${term}`]);
  }

  closeSidenav() {
    this.ui.sideDrawerOpenToggle(false);
  }
}
