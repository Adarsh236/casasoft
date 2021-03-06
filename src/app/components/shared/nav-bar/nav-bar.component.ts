import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss'],
})
export class NavBarComponent implements OnInit {
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {}

  signOut() {
    const isSignedOut = this.authService.signOut();

    if (isSignedOut) {
      this.router.navigate(['auth']);
    } else {
      //console.log('signOut Error');
    }
  }
}
