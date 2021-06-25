import { Injectable, OnDestroy } from '@angular/core';
import {
  Observable,
  Observer,
  BehaviorSubject,
  of,
  Subscription,
  throwError,
} from 'rxjs';
import {
  CognitoUserPool,
  AuthenticationDetails,
  CognitoUser,
  CognitoUserSession,
  CognitoAccessToken,
  CognitoIdToken,
} from 'amazon-cognito-identity-js';

import { environment } from 'src/environments/environment';

const POOLDATA = {
  UserPoolId: environment.AWS_UserPoolId,
  ClientId: environment.AWS_ClientId,
};

@Injectable({
  providedIn: 'root',
})
export class AuthService implements OnDestroy {
  // private fields
  private unsubscribe: Subscription[] = [];

  // public fields
  user: CognitoUser;
  isLoading$: Observable<boolean>;
  isLoadingSubject: BehaviorSubject<boolean>;

  constructor() {
    this.isLoadingSubject = new BehaviorSubject<boolean>(false);
    this.isLoading$ = this.isLoadingSubject.asObservable();
  }

  getUserPool(): CognitoUserPool {
    return new CognitoUserPool(POOLDATA);
  }

  // public methods
  login(email: string, password: string): Observable<CognitoUserSession> {
    this.isLoadingSubject.next(true);

    const userPool = this.getUserPool();
    const authDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });
    const userData = {
      Username: email,
      Pool: userPool,
    };

    this.user = new CognitoUser(userData);

    return new Observable((observer: Observer<any>) => {
      this.user.authenticateUser(authDetails, {
        onSuccess: (result) => {
          observer.next(result);
        },
        onFailure: (err) => {
          observer.error(err);
        },
        mfaRequired: () => {
          return observer.error('MFA :D');
        },
      });
      this.isLoadingSubject.next(false);
    });
  }

  getCurrentUser(): Observable<CognitoUser | null> {
    return of(this.getUserPool().getCurrentUser());
  }

  getSessionValidity(): Observable<boolean> {
    const user: CognitoUser = this.getUserPool().getCurrentUser();

    if (user) {
      return new Observable((observer: Observer<any>) => {
        user.getSession((err, session) => {
          if (err) {
            return observer.error(err);
          }
          observer.next(session.isValid());
        });
      });
    } else {
      return of(false);
    }
  }

  getSession(): Observable<CognitoUserSession | null> {
    const user: CognitoUser = this.getUserPool().getCurrentUser();

    if (user) {
      return new Observable((observer: Observer<any>) => {
        user.getSession((err, session) => {
          if (err) {
            return observer.error(err);
          }
          observer.next(session);
        });
      });
    } else {
      return throwError(null);
    }
  }

  getAccessToken(): Observable<CognitoAccessToken> {
    const user: CognitoUser = this.getUserPool().getCurrentUser();

    if (user) {
      return new Observable((observer: Observer<any>) => {
        user.getSession((err, session: CognitoUserSession) => {
          if (err) {
            return observer.error(err);
          }
          observer.next(session.getAccessToken());
        });
      });
    } else {
      return throwError(null);
    }
  }

  getIdToken(): Observable<CognitoIdToken> {
    const user: CognitoUser = this.getUserPool().getCurrentUser();

    if (user) {
      return new Observable((observer: Observer<any>) => {
        user.getSession((err, session: CognitoUserSession) => {
          if (err) {
            return observer.error(err);
          }
          observer.next(session.getIdToken());
        });
      });
    } else {
      return throwError(null);
    }
  }

  signOut(): boolean {
    const user: CognitoUser = this.getUserPool().getCurrentUser();
    if (user != null) {
      user.signOut();
      return true;
    } else {
      return false;
    }
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
