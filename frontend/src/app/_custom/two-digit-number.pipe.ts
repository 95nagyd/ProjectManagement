import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'twoDigitNumber'
})
export class TwoDigitNumberPipe implements PipeTransform {

  transform(value: number): string {
    return value < 10 ? '0' + value.toString() : value.toString();
  }
}
