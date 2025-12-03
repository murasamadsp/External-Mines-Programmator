import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter',
  standalone: true,
  pure: false,
})
export class FilterPipe implements PipeTransform {
  transform(items: unknown[], searchTerm: string, property?: string): unknown[] {
    if (!items || !searchTerm) return items;

    return items.filter((item) => {
      let value: unknown;
      if (property && typeof item === 'object' && item !== null && property in item) {
        value = (item as Record<string, unknown>)[property];
      } else {
        value = item;
      }

      if (typeof value === 'string') {
        return value.toLowerCase().includes(searchTerm.toLowerCase());
      }

      return String(value).toLowerCase().includes(searchTerm.toLowerCase());
    });
  }
}
