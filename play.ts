import * as z from "zod";

/**
 * ============================================================================
 * TYPED ERROR CODES FOR i18n SUPPORT - FULL-STACK EXAMPLE
 * ============================================================================
 * 
 * This example demonstrates how to use typed error codes with Zod for
 * internationalization (i18n) in a full-stack application.
 * 
 * Benefits:
 * - ✅ Type-safe error codes for better DX
 * - ✅ Separation of validation logic and error messages
 * - ✅ Easy internationalization support
 * - ✅ Consistent error handling across frontend and backend
 * - ✅ Custom error codes for .refine() validations
 */

// ============================================================================
// BACKEND: Define validation schema with custom error codes
// ============================================================================

const createUserSchema = z
  .object({
    username: z
      .string()
      .min(1, {
        message: "Username is required",
        code: "USERNAME_REQUIRED",
      })
      .min(3, {
        message: "Username must be at least 3 characters",
        code: "USERNAME_TOO_SHORT",
      })
      .max(20, {
        message: "Username cannot exceed 20 characters",
        code: "USERNAME_TOO_LONG",
      })
      .regex(/^[a-zA-Z0-9_]+$/, {
        message: "Username can only contain letters, numbers, and underscores",
        code: "USERNAME_INVALID_CHARS",
      }),

    email: z.string().email({
      message: "Please enter a valid email address",
      code: "EMAIL_INVALID",
    }),

    password: z
      .string()
      .min(8, {
        message: "Password must be at least 8 characters",
        code: "PASSWORD_TOO_SHORT",
      })
      .refine((pwd: string) => /[A-Z]/.test(pwd), {
        message: "Password must contain at least one uppercase letter",
        customCode: "PASSWORD_NO_UPPERCASE",
      })
      .refine((pwd: string) => /[a-z]/.test(pwd), {
        message: "Password must contain at least one lowercase letter",
        customCode: "PASSWORD_NO_LOWERCASE",
      })
      .refine((pwd: string) => /[0-9]/.test(pwd), {
        message: "Password must contain at least one number",
        customCode: "PASSWORD_NO_NUMBER",
      })
      .refine((pwd: string) => /[!@#$%^&*]/.test(pwd), {
        message: "Password must contain at least one special character (!@#$%^&*)",
        customCode: "PASSWORD_NO_SPECIAL_CHAR",
      }),

    confirmPassword: z.string(),

    age: z.number().min(18, {
      message: "You must be at least 18 years old",
      code: "AGE_TOO_YOUNG",
    }),

    termsAccepted: z.literal(true, {
      errorMap: () => ({
        message: "You must accept the terms and conditions",
      }),
    }),
  })
  .refine((data: any) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    customCode: "PASSWORDS_DONT_MATCH",
    path: ["confirmPassword"],
  });

// ============================================================================
// BACKEND: Simulate API endpoint
// ============================================================================

function createUserEndpoint(requestBody: unknown) {
  const result = createUserSchema.safeParse(requestBody);

  if (!result.success) {
    // Return structured error response with error codes
    return {
      status: 400,
      body: {
        success: false,
        errors: result.error.issues.map((issue: any) => ({
          field: issue.path.join("."),
          code: issue.customCode || issue.code, // Prefer customCode, fallback to code
          message: issue.message, // Optional: can be omitted for pure i18n approach
        })),
      },
    };
  }

  return {
    status: 200,
    body: {
      success: true,
      data: {
        id: "user-123",
        username: result.data.username,
        email: result.data.email,
      },
    },
  };
}

// ============================================================================
// FRONTEND: Translation files
// ============================================================================

const translations = {
  en: {
    validation: {
      USERNAME_REQUIRED: "Username is required",
      USERNAME_TOO_SHORT: "Username must be at least 3 characters",
      USERNAME_TOO_LONG: "Username cannot exceed 20 characters",
      USERNAME_INVALID_CHARS: "Username can only contain letters, numbers, and underscores",
      EMAIL_INVALID: "Please enter a valid email address",
      PASSWORD_TOO_SHORT: "Password must be at least 8 characters",
      PASSWORD_NO_UPPERCASE: "Password must contain at least one uppercase letter",
      PASSWORD_NO_LOWERCASE: "Password must contain at least one lowercase letter",
      PASSWORD_NO_NUMBER: "Password must contain at least one number",
      PASSWORD_NO_SPECIAL_CHAR: "Password must contain at least one special character",
      PASSWORDS_DONT_MATCH: "Passwords do not match",
      AGE_TOO_YOUNG: "You must be at least 18 years old",
    },
  },
  es: {
    validation: {
      USERNAME_REQUIRED: "El nombre de usuario es obligatorio",
      USERNAME_TOO_SHORT: "El nombre de usuario debe tener al menos 3 caracteres",
      USERNAME_TOO_LONG: "El nombre de usuario no puede exceder 20 caracteres",
      USERNAME_INVALID_CHARS: "El nombre de usuario solo puede contener letras, números y guiones bajos",
      EMAIL_INVALID: "Por favor ingrese una dirección de correo electrónico válida",
      PASSWORD_TOO_SHORT: "La contraseña debe tener al menos 8 caracteres",
      PASSWORD_NO_UPPERCASE: "La contraseña debe contener al menos una letra mayúscula",
      PASSWORD_NO_LOWERCASE: "La contraseña debe contener al menos una letra minúscula",
      PASSWORD_NO_NUMBER: "La contraseña debe contener al menos un número",
      PASSWORD_NO_SPECIAL_CHAR: "La contraseña debe contener al menos un carácter especial",
      PASSWORDS_DONT_MATCH: "Las contraseñas no coinciden",
      AGE_TOO_YOUNG: "Debes tener al menos 18 años",
    },
  },
  fr: {
    validation: {
      USERNAME_REQUIRED: "Le nom d'utilisateur est requis",
      USERNAME_TOO_SHORT: "Le nom d'utilisateur doit comporter au moins 3 caractères",
      USERNAME_TOO_LONG: "Le nom d'utilisateur ne peut pas dépasser 20 caractères",
      USERNAME_INVALID_CHARS: "Le nom d'utilisateur ne peut contenir que des lettres, des chiffres et des traits de soulignement",
      EMAIL_INVALID: "Veuillez entrer une adresse e-mail valide",
      PASSWORD_TOO_SHORT: "Le mot de passe doit comporter au moins 8 caractères",
      PASSWORD_NO_UPPERCASE: "Le mot de passe doit contenir au moins une lettre majuscule",
      PASSWORD_NO_LOWERCASE: "Le mot de passe doit contenir au moins une lettre minuscule",
      PASSWORD_NO_NUMBER: "Le mot de passe doit contenir au moins un chiffre",
      PASSWORD_NO_SPECIAL_CHAR: "Le mot de passe doit contenir au moins un caractère spécial",
      PASSWORDS_DONT_MATCH: "Les mots de passe ne correspondent pas",
      AGE_TOO_YOUNG: "Vous devez avoir au moins 18 ans",
    },
  },
  de: {
    validation: {
      USERNAME_REQUIRED: "Benutzername ist erforderlich",
      USERNAME_TOO_SHORT: "Der Benutzername muss mindestens 3 Zeichen lang sein",
      USERNAME_TOO_LONG: "Der Benutzername darf 20 Zeichen nicht überschreiten",
      USERNAME_INVALID_CHARS: "Der Benutzername darf nur Buchstaben, Zahlen und Unterstriche enthalten",
      EMAIL_INVALID: "Bitte geben Sie eine gültige E-Mail-Adresse ein",
      PASSWORD_TOO_SHORT: "Das Passwort muss mindestens 8 Zeichen lang sein",
      PASSWORD_NO_UPPERCASE: "Das Passwort muss mindestens einen Großbuchstaben enthalten",
      PASSWORD_NO_LOWERCASE: "Das Passwort muss mindestens einen Kleinbuchstaben enthalten",
      PASSWORD_NO_NUMBER: "Das Passwort muss mindestens eine Zahl enthalten",
      PASSWORD_NO_SPECIAL_CHAR: "Das Passwort muss mindestens ein Sonderzeichen enthalten",
      PASSWORDS_DONT_MATCH: "Passwörter stimmen nicht überein",
      AGE_TOO_YOUNG: "Sie müssen mindestens 18 Jahre alt sein",
    },
  },
};

type Language = keyof typeof translations;

function translate(code: string, language: Language = "en"): string {
  const langTranslations = translations[language].validation;
  return langTranslations[code as keyof typeof langTranslations] || code;
}

// ============================================================================
// FRONTEND: Error handling with i18n
// ============================================================================

function handleFormSubmit(formData: unknown, language: Language = "en") {
  const response = createUserEndpoint(formData);

  if (!response.body.success) {
    console.log(`\n=== Validation Errors (${language.toUpperCase()}) ===`);

    response.body.errors.forEach((error: any) => {
      const translatedMessage = translate(error.code, language);
      console.log(`❌ ${error.field}: ${translatedMessage}`);
    });

    return { success: false };
  }

  console.log(`\n✅ User created successfully!`);
  console.log(response.body.data);
  return { success: true };
}

// ============================================================================
// EXAMPLES: Test different scenarios
// ============================================================================

console.log("╔═══════════════════════════════════════════════════════════════╗");
console.log("║   TYPED ERROR CODES FOR i18n SUPPORT - DEMONSTRATION          ║");
console.log("╚═══════════════════════════════════════════════════════════════╝");

// Example 1: Multiple validation errors in English
console.log("\n📝 Example 1: Multiple validation errors (English)");
handleFormSubmit({
  username: "ab",
  email: "not-an-email",
  password: "weak",
  confirmPassword: "different",
  age: 16,
  termsAccepted: false,
}, "en");

// Example 2: Same errors in Spanish
console.log("\n📝 Example 2: Same validation errors (Spanish)");
handleFormSubmit({
  username: "ab",
  email: "not-an-email",
  password: "weak",
  confirmPassword: "different",
  age: 16,
  termsAccepted: false,
}, "es");

// Example 3: Password requirements in French
console.log("\n📝 Example 3: Password validation (French)");
handleFormSubmit({
  username: "validuser",
  email: "user@example.com",
  password: "lowercaseonly",
  confirmPassword: "lowercaseonly",
  age: 25,
  termsAccepted: true,
}, "fr");

// Example 4: Password requirements in German
console.log("\n📝 Example 4: Password validation (German)");
handleFormSubmit({
  username: "validuser",
  email: "user@example.com",
  password: "NoNumber!",
  confirmPassword: "NoNumber!",
  age: 25,
  termsAccepted: true,
}, "de");

// Example 5: Successful validation
console.log("\n📝 Example 5: Successful validation");
handleFormSubmit({
  username: "valid_user123",
  email: "user@example.com",
  password: "SecurePass123!",
  confirmPassword: "SecurePass123!",
  age: 25,
  termsAccepted: true,
});

// ============================================================================
// ADVANCED EXAMPLE: E-commerce price validation
// ============================================================================

console.log("\n\n╔═══════════════════════════════════════════════════════════════╗");
console.log("║   ADVANCED EXAMPLE: E-COMMERCE PRICE VALIDATION               ║");
console.log("╚═══════════════════════════════════════════════════════════════╝");

const priceOptionsSchema = z
  .array(z.number().positive({ code: "PRICE_NOT_POSITIVE" }))
  .min(1, {
    message: "At least one price option is required",
    code: "PRICE_OPTIONS_MIN_LENGTH",
  })
  .max(5, {
    message: "Cannot have more than 5 price options",
    code: "PRICE_OPTIONS_MAX_LENGTH",
  })
  .refine((arr: number[]) => arr.length === new Set(arr).size, {
    message: "Price options must be unique",
    customCode: "PRICE_OPTIONS_NOT_UNIQUE",
  })
  .refine((arr: number[]) => arr.every((price: number) => price <= 10000), {
    message: "Price cannot exceed $10,000",
    customCode: "PRICE_TOO_HIGH",
  })
  .refine((arr: number[]) => {
    const sorted = [...arr].sort((a, b) => a - b);
    return sorted[sorted.length - 1] - sorted[0] <= 5000;
  }, {
    message: "Price range cannot exceed $5,000",
    customCode: "PRICE_RANGE_TOO_LARGE",
  });

const priceTranslations = {
  en: {
    PRICE_OPTIONS_MIN_LENGTH: "At least one price option is required",
    PRICE_OPTIONS_NOT_UNIQUE: "Price options must be unique",
    PRICE_TOO_HIGH: "Price cannot exceed $10,000",
    PRICE_RANGE_TOO_LARGE: "Price range cannot exceed $5,000",
  },
  es: {
    PRICE_OPTIONS_MIN_LENGTH: "Se requiere al menos una opción de precio",
    PRICE_OPTIONS_NOT_UNIQUE: "Las opciones de precio deben ser únicas",
    PRICE_TOO_HIGH: "El precio no puede exceder $10,000",
    PRICE_RANGE_TOO_LARGE: "El rango de precios no puede exceder $5,000",
  },
};

function validatePrices(prices: number[], language: "en" | "es" = "en") {
  const result = priceOptionsSchema.safeParse(prices);

  if (!result.success) {
    console.log(`\n❌ Price validation failed (${language.toUpperCase()}):`);
    result.error.issues.forEach((issue: any) => {
      const code = issue.customCode || issue.code;
      const message = priceTranslations[language][code as keyof typeof priceTranslations.en] || code;
      console.log(`   - ${message}`);
    });
    return false;
  }

  console.log(`\n✅ Price validation successful!`);
  console.log(`   Prices: $${prices.join(", $")}`);
  return true;
}

console.log("\n📝 Example: Duplicate prices (English)");
validatePrices([100, 100, 200], "en");

console.log("\n📝 Example: Duplicate prices (Spanish)");
validatePrices([100, 100, 200], "es");

console.log("\n📝 Example: Price range too large");
validatePrices([100, 6000], "en");

console.log("\n📝 Example: Valid prices");
validatePrices([100, 200, 300], "en");

console.log("\n\n✨ Demonstration complete! ✨\n");
