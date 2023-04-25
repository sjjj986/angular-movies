import { LetModule } from '@rx-angular/template/let';
import { RxState } from '@rx-angular/state';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RxActionFactory } from '@rx-angular/state/actions';
import { AuthEffects } from '../../shared/auth/auth.effects';
import { AuthState } from '../../state/auth.state';
import { map } from 'rxjs';
import { RouterModule } from '@angular/router';

import { RxEffects } from '@rx-angular/state/effects';
import { IfModule } from '@rx-angular/template/if';

export const imports = [RouterModule, LetModule, IfModule];

type Actions = {
  signOut: Event;
  signIn: Event;
};

@Component({
  standalone: true,
  imports: [RouterModule, LetModule, IfModule],
  selector: 'ct-account-menu',
  templateUrl: './account-menu.component.html',
  styleUrls: ['./account-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [RxState, RxEffects],
})
export class AccountMenuComponent {
  ui = this.actionsF.create();

  loggedIn$ = this.state.select('loggedIn');

  constructor(
    private authEffects: AuthEffects,
    private authState: AuthState,
    private state: RxState<{ loggedIn: boolean }>,
    private effects: RxEffects,
    private actionsF: RxActionFactory<Actions>
  ) {
    this.state.connect(
      'loggedIn',
      this.authState.accountId$.pipe(map((s) => s !== null))
    );
    this.effects.register(this.ui.signOut$, this.authEffects.signOut);
    this.effects.register(
      this.ui.signIn$,
      this.authEffects.approveRequestToken
    );
  }
}
