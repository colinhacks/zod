import * as z from '..';

test('object augmentation', () => {
  const Animal = z
    .object({
      species: z.string(),
    })
    .augment({
      population: z.number(),
    });
  // overwrites `species`
  const ModifiedAnimal = Animal.augment({
    species: z.array(z.string()),
  });
  ModifiedAnimal.parse({
    species: ['asd'],
    population: 1324,
  });

  const bad = () =>
    ModifiedAnimal.parse({
      species: 'asdf',
      population: 1324,
    } as any);
  expect(bad).toThrow();
});
