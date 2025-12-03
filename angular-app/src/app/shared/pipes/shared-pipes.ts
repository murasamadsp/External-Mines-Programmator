import { FilterPipe } from './filter.pipe';
import { SafeHtmlPipe } from './safe-html.pipe';
import { TruncatePipe } from './truncate.pipe';

export const SHARED_PIPES = [
  FilterPipe,
  SafeHtmlPipe,
  TruncatePipe,
];

export { FilterPipe, SafeHtmlPipe, TruncatePipe };