declare module 'farm'
{
  export interface Animal {
    name: string;
    age: number;
  }

  export class Pig implements Animal {
    name: string;
    age: number;
  }
}