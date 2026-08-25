import { metabench } from "./metabench.js";

// Test data
const simpleObject = { name: "Alice", age: 30 };
const objectWithExtra = { name: "Alice", age: 30, extra: true, foo: "bar" };
const nestedObject = {
  user: {
    name: "Alice",
    profile: {
      email: "alice@example.com",
      settings: { theme: "dark", notifications: true },
    },
  },
};
const smallArray = [1, 2, 3, 4, 5];
const mediumArray = Array.from({ length: 100 }, (_, i) => i);
const arrayOfObjects = Array.from({ length: 50 }, (_, i) => ({ id: i, name: `Item ${i}` }));

// ============================================
// VALIDATE-ONLY FUNCTIONS (return boolean)
// ============================================

function validateSimpleObject(input: unknown): boolean {
  if (typeof input !== "object" || input === null || Array.isArray(input)) return false;
  const obj = input as Record<string, unknown>;
  if (typeof obj.name !== "string") return false;
  if (typeof obj.age !== "number" || Number.isNaN(obj.age)) return false;
  return true;
}

function validateNestedObject(input: unknown): boolean {
  if (typeof input !== "object" || input === null || Array.isArray(input)) return false;
  const obj = input as Record<string, unknown>;
  const user = obj.user;
  if (typeof user !== "object" || user === null || Array.isArray(user)) return false;
  const userObj = user as Record<string, unknown>;
  if (typeof userObj.name !== "string") return false;
  const profile = userObj.profile;
  if (typeof profile !== "object" || profile === null || Array.isArray(profile)) return false;
  const profileObj = profile as Record<string, unknown>;
  if (typeof profileObj.email !== "string") return false;
  const settings = profileObj.settings;
  if (typeof settings !== "object" || settings === null || Array.isArray(settings)) return false;
  const settingsObj = settings as Record<string, unknown>;
  if (typeof settingsObj.theme !== "string") return false;
  if (typeof settingsObj.notifications !== "boolean") return false;
  return true;
}

function validateNumberArray(input: unknown): boolean {
  if (!Array.isArray(input)) return false;
  for (let i = 0; i < input.length; i++) {
    if (typeof input[i] !== "number" || Number.isNaN(input[i])) return false;
  }
  return true;
}

function validateObjectArray(input: unknown): boolean {
  if (!Array.isArray(input)) return false;
  for (let i = 0; i < input.length; i++) {
    const item = input[i];
    if (typeof item !== "object" || item === null || Array.isArray(item)) return false;
    const obj = item as Record<string, unknown>;
    if (typeof obj.id !== "number") return false;
    if (typeof obj.name !== "string") return false;
  }
  return true;
}

// ============================================
// PARSE FUNCTIONS (return new object)
// ============================================

const INVALID = Symbol("invalid");

function parseSimpleObject(input: unknown): { name: string; age: number } | typeof INVALID {
  if (typeof input !== "object" || input === null || Array.isArray(input)) return INVALID;
  const obj = input as Record<string, unknown>;
  if (typeof obj.name !== "string") return INVALID;
  if (typeof obj.age !== "number" || Number.isNaN(obj.age)) return INVALID;
  return { name: obj.name, age: obj.age };
}

function parseNestedObject(input: unknown): any | typeof INVALID {
  if (typeof input !== "object" || input === null || Array.isArray(input)) return INVALID;
  const obj = input as Record<string, unknown>;
  const user = obj.user;
  if (typeof user !== "object" || user === null || Array.isArray(user)) return INVALID;
  const userObj = user as Record<string, unknown>;
  if (typeof userObj.name !== "string") return INVALID;
  const profile = userObj.profile;
  if (typeof profile !== "object" || profile === null || Array.isArray(profile)) return INVALID;
  const profileObj = profile as Record<string, unknown>;
  if (typeof profileObj.email !== "string") return INVALID;
  const settings = profileObj.settings;
  if (typeof settings !== "object" || settings === null || Array.isArray(settings)) return INVALID;
  const settingsObj = settings as Record<string, unknown>;
  if (typeof settingsObj.theme !== "string") return INVALID;
  if (typeof settingsObj.notifications !== "boolean") return INVALID;
  return {
    user: {
      name: userObj.name,
      profile: {
        email: profileObj.email,
        settings: {
          theme: settingsObj.theme,
          notifications: settingsObj.notifications,
        },
      },
    },
  };
}

function parseNumberArray(input: unknown): number[] | typeof INVALID {
  if (!Array.isArray(input)) return INVALID;
  const result = new Array(input.length);
  for (let i = 0; i < input.length; i++) {
    if (typeof input[i] !== "number" || Number.isNaN(input[i])) return INVALID;
    result[i] = input[i];
  }
  return result;
}

function parseObjectArray(input: unknown): Array<{ id: number; name: string }> | typeof INVALID {
  if (!Array.isArray(input)) return INVALID;
  const result = new Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const item = input[i];
    if (typeof item !== "object" || item === null || Array.isArray(item)) return INVALID;
    const obj = item as Record<string, unknown>;
    if (typeof obj.id !== "number") return INVALID;
    if (typeof obj.name !== "string") return INVALID;
    result[i] = { id: obj.id, name: obj.name };
  }
  return result;
}

// ============================================
// BENCHMARKS
// ============================================

metabench("simple object (2 props)", {
  "validate-only"() {
    return validateSimpleObject(simpleObject);
  },
  "parse (new obj)"() {
    return parseSimpleObject(simpleObject);
  },
}).run();

metabench("simple object with extra keys (strip)", {
  "validate-only"() {
    return validateSimpleObject(objectWithExtra);
  },
  "parse (new obj)"() {
    return parseSimpleObject(objectWithExtra);
  },
}).run();

metabench("nested object (4 levels)", {
  "validate-only"() {
    return validateNestedObject(nestedObject);
  },
  "parse (new obj)"() {
    return parseNestedObject(nestedObject);
  },
}).run();

metabench("array of 5 numbers", {
  "validate-only"() {
    return validateNumberArray(smallArray);
  },
  "parse (new arr)"() {
    return parseNumberArray(smallArray);
  },
}).run();

metabench("array of 100 numbers", {
  "validate-only"() {
    return validateNumberArray(mediumArray);
  },
  "parse (new arr)"() {
    return parseNumberArray(mediumArray);
  },
}).run();

metabench("array of 50 objects", {
  "validate-only"() {
    return validateObjectArray(arrayOfObjects);
  },
  "parse (new arr)"() {
    return parseObjectArray(arrayOfObjects);
  },
}).run();
