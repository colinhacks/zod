export function isEqual(a: any, b: any): boolean {
  if (a === b) {
    return true;
  }

  if (typeof a === "object" && typeof b === "object") {
    // eslint-disable-next-line ban/ban
    const aKeys = Object.keys(a);
    // eslint-disable-next-line ban/ban
    const bKeys = Object.keys(b);

    if (aKeys.length !== bKeys.length) {
      return false;
    }

    return aKeys.every(
      (key) =>
        Object.prototype.hasOwnProperty.call(b, key) && isEqual(a[key], b[key])
    );
  }

  return false;
}

console.log(isEqual({ a: 1, b: undefined }, { a: 1, c: 1 }));

function checkDuplicateDoubleLoop(list: any[]) {
  return (() => {
    for (let i = 0; i < list.length; i++) {
      const a = list[i];

      for (let j = 0; j < i; j++) {
        if (a === list[j]) {
          return false;
        }
      }
    }
    return true;
  })();
}

function checkDuplicateSet(list: any[]) {
  return new Set(list).size >= list.length;
}

function checkDuplicateObject(list: any[]) {
  return (() => {
    const obj: any = {};
    for (const elem of list) {
      if (obj[elem]) {
        return false;
      } else {
        obj[elem] = true;
      }
    }
    return true;
  })();
}

function checkDeepDuplicateDoubleLoop(list: any[]) {
  return (() => {
    for (let i = 0; i < list.length; i++) {
      const a = list[i];

      for (let j = 0; j < i; j++) {
        if (isEqual(a, list[j])) {
          return false;
        }
      }
    }
    return true;
  })();
}

(() => {
  const list = [];

  for (let i = 0; i < 10000000; i++) {
    list.push(i);
  }

  // commented because too long

  // console.time('noDupDoubleLoop');
  // console.log('noDupDoubleLoop: ', checkDuplicateDoubleLoop(list) === true ? "good" : "bad");
  // console.timeEnd('noDupDoubleLoop');

  console.log("noDupDoubleLoop: Too long");

  console.time("noDupSet");
  console.log("noDupSet: ", checkDuplicateSet(list) === true ? "good" : "bad");
  console.timeEnd("noDupSet");

  console.time("noDupObject");
  console.log(
    "noDupObject: ",
    checkDuplicateObject(list) === true ? "good" : "bad"
  );
  console.timeEnd("noDupObject");

  list.unshift(0);

  console.time("dupDoubleLoop");
  console.log(
    "dupDoubleLoop: ",
    checkDuplicateDoubleLoop(list) === false ? "good" : "bad"
  );
  console.timeEnd("dupDoubleLoop");

  console.time("dupSet");
  console.log("dupSet: ", checkDuplicateSet(list) === false ? "good" : "bad");
  console.timeEnd("dupSet");

  console.time("dupObject");
  console.log(
    "dupObject: ",
    checkDuplicateObject(list) === false ? "good" : "bad"
  );
  console.timeEnd("dupObject");
})();

(() => {
  const list = [];

  for (let i = 0; i < 10000; i++) {
    list.push({ i });
  }

  console.time("noDeepDupDoubleLoop");
  console.log(
    "noDeepDupDoubleLoop: ",
    checkDeepDuplicateDoubleLoop(list) === true ? "good" : "bad"
  );
  console.timeEnd("noDeepDupDoubleLoop");

  console.time("noDeepDupSet");
  console.log(
    "noDeepDupSet: ",
    checkDuplicateSet(list) === true ? "good" : "bad"
  );
  console.timeEnd("noDeepDupSet");

  console.time("noDeepDupObject");
  console.log(
    "noDeepDupObject: ",
    checkDuplicateObject(list) === true ? "good" : "bad"
  );
  console.timeEnd("noDeepDupObject");

  list.unshift({ i: 0 });

  console.time("deepDupDoubleLoop");
  console.log(
    "deepDupDoubleLoop: ",
    checkDeepDuplicateDoubleLoop(list) === false ? "good" : "bad"
  );
  console.timeEnd("deepDupDoubleLoop");

  console.time("deepDupSet");
  console.log(
    "deepDupSet: ",
    checkDuplicateSet(list) === false ? "good" : "bad"
  );
  console.timeEnd("deepDupSet");

  console.time("deepDupObject");
  console.log(
    "deepDupObject: ",
    checkDuplicateObject(list) === false ? "good" : "bad"
  );
  console.timeEnd("deepDupObject");
})();

(() => {
  const list1 = [
    { a: 1, b: undefined },
    { a: 1, c: 1 },
  ];

  const list2 = [
    { a: 1, b: undefined },
    { a: 1, b: undefined },
  ];

  const list3 = [{ a: 1, b: undefined }, { a: 1 }];

  console.log(
    "hardDupDoubleLoop: ",
    checkDuplicateDoubleLoop(list1) &&
      !checkDuplicateDoubleLoop(list2) &&
      checkDuplicateDoubleLoop(list3)
      ? "good"
      : "bad"
  );
  console.log(
    "hardDeepDupDoubleLoop: ",
    checkDeepDuplicateDoubleLoop(list1) &&
      !checkDeepDuplicateDoubleLoop(list2) &&
      checkDeepDuplicateDoubleLoop(list3)
      ? "good"
      : "bad"
  );
  console.log(
    "hardDupSet: ",
    checkDuplicateSet(list1) &&
      !checkDuplicateSet(list2) &&
      checkDuplicateSet(list3)
      ? "good"
      : "bad"
  );
  console.log(
    "hardDupObject: ",
    checkDuplicateObject(list1) &&
      !checkDuplicateObject(list2) &&
      checkDuplicateObject(list3)
      ? "good"
      : "bad"
  );
})();
