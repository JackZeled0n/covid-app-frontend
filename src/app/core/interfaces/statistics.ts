import { Cases } from './cases';
import { Deaths } from './deaths';
import { Tests } from './tests';

export interface Statistics {
  cases: Cases;
  death: Deaths;
  tests: Tests;
  population: number;
  continent: string;
  country: string;
}
