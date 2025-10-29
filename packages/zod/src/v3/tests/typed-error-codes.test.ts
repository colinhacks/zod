import { describe, expect, test } from "vitest";
import * as z from "../index.js";

describe("Typed Error Codes for i18n Support", () => {
  describe("Built-in validators with custom codes", () => {
    test("string.min() with custom code", () => {
      const schema = z.string().min(5, {
        message: "Username must be at least 5 characters",
        code: "USERNAME_TOO_SHORT",
      });

      const result = schema.safeParse("abc");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]).toMatchObject({
          code: "too_small",
          customCode: "USERNAME_TOO_SHORT",
          message: "Username must be at least 5 characters",
        });
      }
    });

    test("string.max() with custom code", () => {
      const schema = z.string().max(10, {
        message: "Username cannot exceed 10 characters",
        code: "USERNAME_TOO_LONG",
      });

      const result = schema.safeParse("verylongusername");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]).toMatchObject({
          code: "too_big",
          customCode: "USERNAME_TOO_LONG",
        });
      }
    });

    test("string.email() with custom code", () => {
      const schema = z.string().email({
        message: "Invalid email format",
        code: "EMAIL_INVALID",
      });

      const result = schema.safeParse("notanemail");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]).toMatchObject({
          code: "invalid_string",
          customCode: "EMAIL_INVALID",
        });
      }
    });

    test("string.url() with custom code", () => {
      const schema = z.string().url({
        message: "Invalid URL",
        code: "URL_INVALID",
      });

      const result = schema.safeParse("not-a-url");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]).toMatchObject({
          code: "invalid_string",
          customCode: "URL_INVALID",
        });
      }
    });

    test("multiple validations with different custom codes", () => {
      const schema = z
        .string()
        .min(3, { code: "MIN_LENGTH" })
        .max(20, { code: "MAX_LENGTH" })
        .email({ code: "INVALID_EMAIL" });

      const result = schema.safeParse("ab");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].customCode).toBe("MIN_LENGTH");
      }
    });
  });

  describe(".refine() with custom error codes", () => {
    test("simple refine with custom code", () => {
      const schema = z.array(z.number()).refine((arr) => arr.length === new Set(arr).size, {
        message: "Array must contain unique values",
        customCode: "ARRAY_NOT_UNIQUE",
      });

      const result = schema.safeParse([1, 2, 2, 3]);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]).toMatchObject({
          code: "custom",
          customCode: "ARRAY_NOT_UNIQUE",
          message: "Array must contain unique values",
        });
      }
    });

    test("refine with function returning custom code", () => {
      const schema = z.number().refine(
        (n) => n % 2 === 0,
        (val) => ({
          message: `${val} is not an even number`,
          customCode: "NOT_EVEN_NUMBER",
        })
      );

      const result = schema.safeParse(5);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]).toMatchObject({
          code: "custom",
          customCode: "NOT_EVEN_NUMBER",
        });
      }
    });

    test("multiple refine validations with different codes", () => {
      const schema = z
        .string()
        .refine((s) => s.length >= 8, {
          customCode: "PASSWORD_TOO_SHORT",
        })
        .refine((s) => /[A-Z]/.test(s), {
          customCode: "PASSWORD_NO_UPPERCASE",
        })
        .refine((s) => /[0-9]/.test(s), {
          customCode: "PASSWORD_NO_NUMBER",
        });

      const result = schema.safeParse("short");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].customCode).toBe("PASSWORD_TOO_SHORT");
      }

      const result2 = schema.safeParse("longenough");
      expect(result2.success).toBe(false);
      if (!result2.success) {
        expect(result2.error.issues[0].customCode).toBe("PASSWORD_NO_UPPERCASE");
      }
    });
  });

  describe("Cross-field validation with custom codes", () => {
    test("password confirmation with custom code", () => {
      const schema = z
        .object({
          password: z.string(),
          confirmPassword: z.string(),
        })
        .refine((data) => data.password === data.confirmPassword, {
          message: "Passwords do not match",
          customCode: "PASSWORDS_DONT_MATCH",
          path: ["confirmPassword"],
        });

      const result = schema.safeParse({
        password: "secret123",
        confirmPassword: "different",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]).toMatchObject({
          code: "custom",
          customCode: "PASSWORDS_DONT_MATCH",
          path: ["confirmPassword"],
        });
      }
    });

    test("date range validation with custom code", () => {
      const schema = z
        .object({
          startDate: z.date(),
          endDate: z.date(),
        })
        .refine((data) => data.endDate > data.startDate, {
          message: "End date must be after start date",
          customCode: "INVALID_DATE_RANGE",
          path: ["endDate"],
        });

      const result = schema.safeParse({
        startDate: new Date("2024-12-31"),
        endDate: new Date("2024-01-01"),
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]).toMatchObject({
          code: "custom",
          customCode: "INVALID_DATE_RANGE",
        });
      }
    });
  });

  describe("Async validation with custom codes", () => {
    test("async refine with custom code", async () => {
      const checkEmailExists = async (email: string): Promise<boolean> => {
        // Simulate async check
        await new Promise((resolve) => setTimeout(resolve, 10));
        return email === "taken@example.com";
      };

      const schema = z
        .string()
        .email()
        .refine(async (email) => !(await checkEmailExists(email)), {
          message: "Email is already taken",
          customCode: "EMAIL_ALREADY_EXISTS",
        });

      const result = await schema.safeParseAsync("taken@example.com");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]).toMatchObject({
          code: "custom",
          customCode: "EMAIL_ALREADY_EXISTS",
        });
      }
    });
  });

  describe("i18n usage patterns", () => {
    test("error code can be mapped to translations", () => {
      const translations = {
        en: {
          USERNAME_TOO_SHORT: "Username must be at least 5 characters",
          USERNAME_TOO_LONG: "Username cannot exceed 20 characters",
          EMAIL_INVALID: "Please enter a valid email address",
        },
        es: {
          USERNAME_TOO_SHORT: "El nombre de usuario debe tener al menos 5 caracteres",
          USERNAME_TOO_LONG: "El nombre de usuario no puede exceder 20 caracteres",
          EMAIL_INVALID: "Por favor ingrese un correo electrónico válido",
        },
      };

      const schema = z
        .string()
        .min(5, { code: "USERNAME_TOO_SHORT" })
        .max(20, { code: "USERNAME_TOO_LONG" })
        .email({ code: "EMAIL_INVALID" });

      const result = schema.safeParse("abc");
      expect(result.success).toBe(false);

      if (!result.success) {
        const errorCode = result.error.issues[0].customCode as keyof typeof translations.en;
        const englishMessage = translations.en[errorCode];
        const spanishMessage = translations.es[errorCode];

        expect(englishMessage).toBe("Username must be at least 5 characters");
        expect(spanishMessage).toBe("El nombre de usuario debe tener al menos 5 caracteres");
      }
    });

    test("backend API can return error codes for frontend i18n", () => {
      const userSchema = z.object({
        username: z.string().min(1, { code: "USERNAME_REQUIRED" }),
        email: z.string().email({ code: "EMAIL_INVALID" }),
        password: z.string().min(8, { code: "PASSWORD_TOO_SHORT" }),
      });

      const result = userSchema.safeParse({
        username: "",
        email: "invalid",
        password: "123",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        // Simulate API error response
        const apiErrors = result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          code: issue.customCode,
        }));

        expect(apiErrors).toContainEqual({
          field: "username",
          code: "USERNAME_REQUIRED",
        });
        expect(apiErrors).toContainEqual({
          field: "email",
          code: "EMAIL_INVALID",
        });
        expect(apiErrors).toContainEqual({
          field: "password",
          code: "PASSWORD_TOO_SHORT",
        });
      }
    });
  });

  describe("Custom codes with params", () => {
    test("refine with custom code and params", () => {
      const schema = z.number().refine((n) => n <= 100, {
        message: "Value exceeds maximum",
        customCode: "VALUE_TOO_LARGE",
        params: { max: 100 },
      });

      const result = schema.safeParse(150);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]).toMatchObject({
          code: "custom",
          customCode: "VALUE_TOO_LARGE",
          params: { max: 100 },
        });
      }
    });
  });

  describe("Typed error code inference", () => {
    test("custom codes should be accessible on error issues", () => {
      const schema = z
        .string()
        .min(1, { code: "REQUIRED" as const })
        .refine((s) => s.length > 0, { customCode: "NOT_EMPTY" as const });

      const result = schema.safeParse("");
      expect(result.success).toBe(false);
      if (!result.success) {
        const issue = result.error.issues[0];
        // TypeScript should infer customCode as string | undefined
        const customCode: string | undefined = issue.customCode;
        expect(typeof customCode).toBe("string");
      }
    });
  });

  describe("Backwards compatibility", () => {
    test("validators without custom codes still work", () => {
      const schema = z.string().min(5).email();
      const result = schema.safeParse("abc");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe("too_small");
        expect(result.error.issues[0].customCode).toBeUndefined();
      }
    });

    test("refine without custom code still works", () => {
      const schema = z.number().refine((n) => n > 0, {
        message: "Must be positive",
      });

      const result = schema.safeParse(-5);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe("custom");
        expect(result.error.issues[0].customCode).toBeUndefined();
      }
    });
  });

  describe("Complex real-world scenarios", () => {
    test("user registration form with multiple custom codes", () => {
      const registrationSchema = z
        .object({
          username: z
            .string()
            .min(3, { code: "USERNAME_TOO_SHORT" })
            .max(20, { code: "USERNAME_TOO_LONG" })
            .regex(/^[a-zA-Z0-9_]+$/, { code: "USERNAME_INVALID_CHARS" }),
          email: z.string().email({ code: "EMAIL_INVALID" }),
          password: z
            .string()
            .min(8, { code: "PASSWORD_TOO_SHORT" })
            .refine((pwd) => /[A-Z]/.test(pwd), {
              customCode: "PASSWORD_NO_UPPERCASE",
            })
            .refine((pwd) => /[a-z]/.test(pwd), {
              customCode: "PASSWORD_NO_LOWERCASE",
            })
            .refine((pwd) => /[0-9]/.test(pwd), {
              customCode: "PASSWORD_NO_NUMBER",
            }),
          confirmPassword: z.string(),
          age: z.number().min(18, { code: "AGE_TOO_YOUNG" }),
        })
        .refine((data) => data.password === data.confirmPassword, {
          customCode: "PASSWORDS_DONT_MATCH",
          path: ["confirmPassword"],
        });

      const result = registrationSchema.safeParse({
        username: "ab",
        email: "invalid-email",
        password: "weak",
        confirmPassword: "different",
        age: 16,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const codes = result.error.issues.map((i) => i.customCode).filter(Boolean);
        expect(codes.length).toBeGreaterThan(0);
        expect(codes).toContain("USERNAME_TOO_SHORT");
        expect(codes).toContain("EMAIL_INVALID");
        expect(codes).toContain("PASSWORD_TOO_SHORT");
        expect(codes).toContain("AGE_TOO_YOUNG");
      }
    });

    test("e-commerce price validation with custom codes", () => {
      const priceOptionsSchema = z
        .array(z.number().positive({ code: "PRICE_NOT_POSITIVE" }))
        .min(1, { code: "PRICE_OPTIONS_MIN_LENGTH" })
        .refine((arr) => arr.length === new Set(arr).size, {
          message: "Price options must be unique",
          customCode: "PRICE_OPTIONS_NOT_UNIQUE",
        })
        .refine((arr) => arr.every((price) => price <= 10000), {
          message: "Price cannot exceed 10000",
          customCode: "PRICE_TOO_HIGH",
        });

      const result = priceOptionsSchema.safeParse([100, 100, 200]);
      expect(result.success).toBe(false);
      if (!result.success) {
        const issue = result.error.issues.find((i) => i.customCode === "PRICE_OPTIONS_NOT_UNIQUE");
        expect(issue).toBeDefined();
      }
    });
  });
});
