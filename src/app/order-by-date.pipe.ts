import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'orderByDate'
})
export class OrderByDatePipe implements PipeTransform {

  transform(array: any[], property: string, order: 'asc' | 'desc'): any[] {
    if (!Array.isArray(array) || !property) {
      return array;
    }

    // Use index signatures
    if (property == "date") {
      array.sort((a, b) => {
        const dateA = new Date(a[property]);
        const dateB = new Date(b[property]);
        if (order === 'asc') {
          return dateA.getTime() - dateB.getTime();
        } else {
          return dateB.getTime() - dateA.getTime();
        }
      });
      return array;
    } else if (property == "function") {
      array.sort((a, b) => {
        if (order === 'asc') {
          if (a[property] > b[property]) return 1;
          if (a[property] < b[property]) return -1;
          return 0;
        } else {
          if (a[property] < b[property]) return 1;
          if (a[property] > b[property]) return -1;
          return 0;
        }
      });
      return array;
    }
    else {
      return array;
    }
  }

}
