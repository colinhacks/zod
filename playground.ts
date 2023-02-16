import { z } from "./src";

// const emoji = z.string().emoji();

const emojiRegex =
  /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff]|\uFE0E|\uFE0F)/;

function isEmoji(val: string) {
  return [...val].every((char) => emojiRegex.test(char));
}
console.log(isEmoji("🍺👩‍🚀🫡"));
console.log(isEmoji("💚💙💜💛❤️"));
console.log(isEmoji(":-)"));
console.log(isEmoji("asdf"));
console.log(isEmoji("😀stuff"));
console.log(isEmoji("stuff😀"));
