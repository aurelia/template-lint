import {Person} from './my-types/person';
import {Item} from './my-types/item';
import {Car} from 'my-lib';

export class FooViewModel {
  person: Person;
  items: Item[];
  car: Car;
  width:number;
  height:number;
}