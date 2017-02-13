import { expect } from 'chai';
import { ReflectionHost } from '../src/reflection';

import { triage } from './linter-triage';
import { examples } from './linter-examples';

describe("Linter", () => {
  triage();
  examples();
});
