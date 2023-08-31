import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, ActivatedRoute } from '@angular/router';

import { AccountService } from '../_services';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    constructor(
        private router: Router,
        private accountService: AccountService
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot ) {
        console.log("Parent Path in AuthGuard: " + route.parent.url);
        console.log("Configured Path in AuthGuard: " + this.getConfiguredUrl(route));
        console.log("Resolved Path in AuthGuard: " + this.getResolvedUrl(route));
        console.log("URL from Window Location: " + window.location.href);
        const account = this.accountService.accountValue;
        if (account) {
            // check if route is restricted by role
            if (route.data['roles'] && !route.data['roles'].includes(account.role)) {
                // role not authorized so redirect to home page
                this.router.navigate(['/']);
                console.log("Going to home page");
                return false;
            }

            // authorized so return true
            console.log("Authorized - Going to path: " + this.getResolvedUrl(route));
            return true;
        }

        console.log("not logged in so redirect to login page ");
        // not logged in so redirect to login page with the return url 
        this.router.navigate(['/account/login'], { queryParams: { returnUrl: state.url } });
        return false;
    }
    getConfiguredUrl(route: ActivatedRouteSnapshot): string {
        return '/' + route.pathFromRoot
            .filter(v => v.routeConfig)
            .map(v => v.routeConfig!.path)
            .join('/');
    }
    getResolvedUrl(route: ActivatedRouteSnapshot): string {
        let url = route.pathFromRoot.map((v) => v.url.map((segment) => segment.toString()).join('/')).join('/');
        const queryParam = route.queryParamMap;
        if (queryParam.keys.length > 0) {
            url += '?' + queryParam.keys.map(key => queryParam.getAll(key).map(value => key + '=' + value).join('&')).join('&');
        }
        return url;
    }
    getResolvedUrlFromChildren(route: ActivatedRouteSnapshot): string {
        let url = route.pathFromRoot.map((v) => v.url.map((segment) => segment.toString()).join('/')).join('/');
        const queryParam = route.queryParamMap;
        if (queryParam.keys.length > 0) {
            url += '?' + queryParam.keys.map(key => queryParam.getAll(key).map(value => key + '=' + value).join('&')).join('&');
        }
        return url;
    }
}