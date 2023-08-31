// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  dateTimeFormat: 'DD-MM-YYYY HH:mm',
  dateFormat: 'DD-MM-YYYY',
  shortDateTimeFormat: 'DD.MM.YY HH:mm',
  

  //apiUrl: 'https://49.176.185.39:4000'
  apiUrl: 'https://oloaschedulemebackend.azurewebsites.net/',
  //apiUrl: 'http://localhost:4000',
  //apiUrl: 'http://rejkid.hopto.org:4000'
  //apiUrl: 'https://rejkid.hopto.org:4000',

  //baseUrl: 'https://rejkid.hopto.org:4000',
  baseUrl: 'https://oloaschedulemebackend.azurewebsites.net/'
  //baseUrl: 'http://localhost:4000'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown .
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
