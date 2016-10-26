import { FileLocation } from './file-location';
import { IssueSeverity } from './issue-severity';
export { IssueSeverity } from './issue-severity';

/**
* information about an issue
*/
export class Issue {
  message: string;
  severity: IssueSeverity;
  detail?: string;
  location?: FileLocation;

  constructor(opts: { message: string, severity: IssueSeverity, detail?: string, location?: FileLocation }) {
    Object.assign(this, opts);
  }
}
