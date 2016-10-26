/** 
 * Issue Severity
 */
export enum IssueSeverity {
  Debug = -1, 
  /* information on a better way */
  Info = 0,
  /* an issue that may result in odd results */
  Warning = 1,
  /* an issue that will result in missing/broken content */
  Error = 2,
  /* an issue that breaks the entire document/template */
  Fatal = 3
}
