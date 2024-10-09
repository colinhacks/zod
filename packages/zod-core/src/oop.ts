// Define a type for the Animal constructor
interface AnimalType {
  name: string;
  speak(): void;
}

// Animal constructor function
function Animal(this: AnimalType, name: string): AnimalType {
  this.name = name;
  this.speak = function () {
    console.log(`${this.name} makes a sound.`);
  };
  return this;
}

// Add method to Animal's prototype
// Animal.prototype.speak = function () {
//   console.log(`${this.name} makes a sound.`);
// };

// Define a type for Dog constructor
interface DogType extends AnimalType {
  speak(): void;
}

// Dog constructor function
function Dog(_this: DogType, name: string): DogType {
  console.log(this);
  const dog = Animal.call(this, name); // Inherit properties from Animal
  dog.speak = function () {
    console.log(`${this.name} barks.`);
  };
  return dog;
}

type ConstrAsserts<T> = (input: Partial<T>) => asserts input is T;

// Set up inheritance from Animal
// Dog.prototype = Object.create(Animal.prototype);
// Dog.prototype.constructor = Dog;

// Override the speak method for Dog
// Dog.prototype.speak = function () {
//   console.log(`${this.name} barks.`);
// };

// Usage

const dog = Dog.bind({} as any)("Rex"); // TypeScript casting required here
dog.speak(); // Rex barks.
