import { IssueSeverity } from './issue-severity';
export { IssueSeverity } from './issue-severity';
/**
* information about an issue
*/
export interface Issue {
  message: string;
  severity: IssueSeverity;
  line?: number;
  column?: number;
  start?: number;
  end?: number;
  detail?: string;
}
