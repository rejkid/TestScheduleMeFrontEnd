import { TeardownLogic } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AccountService } from '../_services';

export function appInitializer(accountService: AccountService) {
  return () => new Promise((resolve: any) => {
    // attempt to refresh token on app start up to auto authenticate
    //alert("Failed refreshing");
    accountService.refreshToken()
      .subscribe({
        next: (value: any) => {
          console.log("appInitializer success: " + value.firstName, value.lastName, value.email);
        },
        error: (error: string) => {
          
          console.log("Error in appInitializer");
        }
      })
      .add(resolve);
  }).then((message) => {
    console.log("appInitializer in then");
  }).catch((message) => {
    console.log("Error in appInitializer in catch");
  });
}

/* export function appInitializer(accountService: AccountService) {
      // attempt to refresh token on app start up to auto authenticate
      return () => accountService.refreshToken();
} */