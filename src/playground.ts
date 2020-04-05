// import * as z from '.';

// const fish = z.object({
//   name: z.string(),
//   properties: z
//     .object({
//       color: z.string(),
//       numScales: z.number(),
//     })
//     .nonstrict(),
// });

// const fishList = z.array(fish);
// const numList = z.array(z.string());
// const modnumList = numList.whitelist(true);

// const modFishList = fishList.whitelist({
//   // properties: true,
//   name:true,
//   properties: {
//     color:true
//   }
// });
// const modFish = fish.blacklist({
//   name: true,
// });

// const modFishList = fishList.blacklist({
//   name: true,
//   properties: {
//     numScales: true,
//   },
// });
// type nonameFish = z.infer<typeof nonameFish>;
