import * as z from "../index";

test("array min", async () => {
  expect.assertions(1);
  await z
    .array(z.string())
    .min(4)
    .parseAsync([])
    .catch((err) => {
      expect(err.issues[0].message).toEqual("Should have at least 4 items");
    });
});

test("array max", async () => {
  expect.assertions(1);
  const result = await z
    .array(z.string())
    .max(2)
    .parseAsync(["asdf", "asdf", "asdf"])
    .catch((err) => {
      expect(err.issues[0].message).toEqual("Should have at most 2 items");
    });
  return result;
});

test("string min", async () => {
  expect.assertions(1);
  const result = await z
    .string()
    .min(4)
    .parseAsync("asd")
    .catch((err) => {
      expect(err.issues[0].message).toEqual("Should be at least 4 characters");
    });
  return result;
});

test("string max", async () => {
  expect.assertions(1);
  await z
    .string()
    .max(4)
    .parseAsync("aasdfsdfsd")
    .catch((err) => {
      expect(err.issues[0].message).toEqual(
        "Should be at most 4 characters long"
      );
    });
  return "asdf";
});

test("number min", async () => {
  expect.assertions(1);
  await z
    .number()
    .min(3)
    .parseAsync(2)
    .catch((err) => {
      expect(err.issues[0].message).toEqual(
        "Value should be greater than or equal to 3"
      );
    });
  return "asdf";
});

test("number max", async () => {
  expect.assertions(1);
  await z
    .number()
    .max(3)
    .parseAsync(4)
    .catch((err) => {
      expect(err.issues[0].message).toEqual(
        "Value should be less than or equal to 3"
      );
    });
  return "asdf";
});

test("number nonnegative", async () => {
  expect.assertions(1);
  await z
    .number()
    .nonnegative()
    .parseAsync(-1)
    .catch((err) => {
      expect(err.issues[0].message).toEqual(
        "Value should be greater than or equal to 0"
      );
    });
  return "asdf";
});

test("number nonpositive", async () => {
  expect.assertions(1);
  await z
    .number()
    .nonpositive()
    .parseAsync(1)
    .catch((err) => {
      expect(err.issues[0].message).toEqual(
        "Value should be less than or equal to 0"
      );
    });
  return "asdf";
});

test("number negative", async () => {
  expect.assertions(1);
  await z
    .number()
    .negative()
    .parseAsync(1)
    .catch((err) => {
      expect(err.issues[0].message).toEqual("Value should be less than 0");
    });
  return "asdf";
});

test("number positive", async () => {
  expect.assertions(1);
  await z
    .number()
    .positive()
    .parseAsync(-1)
    .catch((err) => {
      expect(err.issues[0].message).toEqual("Value should be greater than 0");
    });
  return "asdf";
});

test("instantiation", () => {
  z.string().min(5);
  z.string().max(5);
  z.string().length(5);
  z.string().email();
  z.string().url();
  z.string().uuid();
  z.string().min(5, { message: "Must be 5 or more characters long" });
  z.string().max(5, { message: "Must be 5 or fewer characters long" });
  z.string().length(5, { message: "Must be exactly 5 characters long" });
  z.string().email({ message: "Invalid email address." });
  z.string().url({ message: "Invalid url" });
  z.string().uuid({ message: "Invalid UUID" });
});
