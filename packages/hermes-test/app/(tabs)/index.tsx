import React, { useEffect, useState } from "react";
import { FlatList, Platform, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// Import from the built distribution files (how an external app would do it)
import * as z from "zod/v4";
// Explicitly import types needed for instanceof checks

// This is how it would be imported in a real app:
// import * as z from "zod/v4";
// Or simply: import { z } from "zod";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

// Test categories focused on Hermes compatibility issues
const TEST_CATEGORIES = [
  "Basic Schema Creation",
  "Constructor and instanceof",
  "Dynamic Property Access",
  "Method Binding",
  "Symbol Usage",
  "Object.defineProperty",
  "Prototype Methods",
  "Trait System",
  "Complex Schemas",
];

// Test result type
type TestResult = {
  name: string;
  category: string;
  success: boolean;
  error?: string;
};

export default function ZodHermesTestScreen() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isHermes, setIsHermes] = useState(false);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ passed: 0, failed: 0 });

  useEffect(() => {
    // Check if running on Hermes (with type assertion to avoid TS error)
    setIsHermes(!!(globalThis as any).HermesInternal);

    // Run the tests
    runAllTests();
  }, []);

  const runTest = (name: string, category: string, testFn: () => void): TestResult => {
    try {
      testFn();
      return { name, category, success: true };
    } catch (error) {
      return {
        name,
        category,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  };

  const runAllTests = () => {
    setLoading(true);
    const testResults: TestResult[] = [];

    // Basic Schema Creation
    testResults.push(
      runTest("Create Object Schema", "Basic Schema Creation", () => {
        const schema = z.object({
          name: z.string(),
          age: z.number(),
        });
        if (!schema || typeof schema !== "object") {
          throw new Error("Schema not created properly");
        }
      })
    );

    // Constructor and instanceof
    testResults.push(
      runTest("instanceof ZodString", "Constructor and instanceof", () => {
        const schema = z.string();
        if (!(schema instanceof z.ZodString)) {
          throw new Error("instanceof check failed for schema");
        }
      })
    );

    // Dynamic Property Access
    testResults.push(
      runTest("_zod property access", "Dynamic Property Access", () => {
        const schema = z.string();
        if (!schema._zod || typeof schema._zod !== "object") {
          throw new Error("_zod property not accessible");
        }
      })
    );

    testResults.push(
      runTest("def property access", "Dynamic Property Access", () => {
        const schema = z.string();
        if (schema.def === undefined) {
          throw new Error("def property not accessible");
        }
      })
    );

    // Method Binding
    testResults.push(
      runTest("Method chaining", "Method Binding", () => {
        const schema = z.string();
        const optional = schema.optional();
        if (!optional) {
          throw new Error("Method chaining failed");
        }
      })
    );

    testResults.push(
      runTest("Method returns correct type", "Method Binding", () => {
        const schema = z.string();
        const optional = schema.optional();
        if (!(optional instanceof z.ZodOptional)) {
          throw new Error("Method did not return correct type instance");
        }
      })
    );

    // Symbol Usage
    testResults.push(
      runTest("Symbol.hasInstance", "Symbol Usage", () => {
        const schema = z.string();
        // Use a type assertion to avoid TypeScript error with Symbol access
        const hasInstance = (schema as any)[Symbol.hasInstance];
        if (typeof hasInstance !== "function") {
          throw new Error("Symbol.hasInstance is not a function");
        }
      }),
    );

    testResults.push(
      runTest("Symbol brand", "Symbol Usage", () => {
        try {
          const schema = z.string().brand("custom");
          const parsed = schema.parse("hello");
          if (!parsed) {
            throw new Error("Failed to parse with branded schema");
          }
        } catch (e) {
          throw new Error(
            `Branding failed: ${e instanceof Error ? e.message : String(e)}`,
          );
        }
      }),
    );

    // Object.defineProperty
    testResults.push(
      runTest("defineProperty basic", "Object.defineProperty", () => {
        const obj = {} as any; // Use type assertion to avoid TypeScript errors
        Object.defineProperty(obj, "_zod", {
          value: {},
          enumerable: false,
        });

        if (!obj._zod) {
          throw new Error("Failed to define non-enumerable property");
        }
      })
    );

    testResults.push(
      runTest("defineProperty enumerable", "Object.defineProperty", () => {
        const obj = {} as any; // Use type assertion to avoid TypeScript errors
        Object.defineProperty(obj, "_zod", {
          value: {},
          enumerable: false,
        });

        const keys = Object.keys(obj);
        if (keys.includes("_zod")) {
          throw new Error("Property should be non-enumerable but is enumerable");
        }
      })
    );

    // Prototype Methods
    testResults.push(
      runTest("Prototype method binding", "Prototype Methods", () => {
        // Fixed type declaration to avoid TS errors
        const proto = {
          testMethod(): number {
            return (this as any).value;
          },
        };

        const obj = { value: 42 };
        Object.defineProperty(obj, "boundMethod", {
          value: proto.testMethod.bind(obj),
        });

        if ((obj as any).boundMethod() !== 42) {
          throw new Error('Method binding failed to preserve "this" context');
        }
      })
    );

    // Trait System
    testResults.push(
      runTest("Traits initialization", "Trait System", () => {
        const schema = z.string();
        if (!schema._zod.traits || !(schema._zod.traits instanceof Set)) {
          throw new Error("Traits not properly initialized as a Set");
        }
      })
    );

    testResults.push(
      runTest("Traits contains ZodString", "Trait System", () => {
        const schema = z.string();
        if (!schema._zod.traits.has("ZodString")) {
          throw new Error("Expected trait ZodString not found");
        }
      })
    );

    // Complex Schemas
    testResults.push(
      runTest("Complex nested schema", "Complex Schemas", () => {
        // Create a complex nested schema
        const nestedSchema = z.object({
          user: z.object({
            details: z.object({
              preferences: z.array(z.string()),
            }),
          }),
        });

        const validData = {
          user: {
            details: {
              preferences: ["dark mode", "notifications off"],
            },
          },
        };

        const result = nestedSchema.safeParse(validData);
        if (!result.success) {
          throw new Error(`Nested schema validation failed`);
        }
      })
    );

    // Update state with results
    setResults(testResults);
    setSummary({
      passed: testResults.filter((r) => r.success).length,
      failed: testResults.filter((r) => !r.success).length,
    });
    setLoading(false);
  };

  // Group results by category
  const resultsByCategory = TEST_CATEGORIES.map((category) => {
    return {
      category,
      tests: results.filter((r) => r.category === category),
      passed: results.filter((r) => r.category === category && r.success).length,
      failed: results.filter((r) => r.category === category && !r.success).length,
    };
  });

  // Prepare header and summary components
  const HeaderComponent = () => (
    <>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Zod Tests</ThemedText>
        <ThemedView style={styles.engineBadge}>
          <Text style={styles.engineText}>{isHermes ? "Hermes Engine ✓" : "JavaScriptCore"}</Text>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.summaryContainer}>
        <ThemedText type="subtitle">Test Summary</ThemedText>
        <ThemedText>
          Passed:{" "}
          <ThemedText type="defaultSemiBold" style={{ color: "#4caf50" }}>
            {summary.passed}
          </ThemedText>
          {" | "}
          Failed:{" "}
          <ThemedText type="defaultSemiBold" style={{ color: "#f44336" }}>
            {summary.failed}
          </ThemedText>
        </ThemedText>
      </ThemedView>

      {loading && (
        <ThemedView style={styles.loadingContainer}>
          <ThemedText>Running tests...</ThemedText>
        </ThemedView>
      )}
    </>
  );

  // For FlatList rendering
  const renderCategory = ({
    item: category,
  }: {
    item: (typeof resultsByCategory)[0];
  }) => (
    <ThemedView style={styles.categoryContainer}>
      <ThemedView style={styles.categoryHeader}>
        <ThemedText type="subtitle">{category.category}</ThemedText>
        <ThemedText
          style={{
            color: category.failed > 0 ? "#f44336" : "#4caf50",
          }}
        >
          {category.passed} / {category.passed + category.failed}
        </ThemedText>
      </ThemedView>

      {category.tests.map((test: TestResult, index: number) => (
        <ThemedView key={`${test.category}-${index}`} style={styles.testItem}>
          <View style={styles.testHeader}>
            <ThemedText type="defaultSemiBold">
              {test.success ? "✅" : "❌"} {test.name}
            </ThemedText>
          </View>
          {!test.success && test.error && <ThemedText style={styles.errorText}>{test.error}</ThemedText>}
        </ThemedView>
      ))}
    </ThemedView>
  );

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <FlatList
        data={loading ? [] : resultsByCategory}
        renderItem={renderCategory}
        keyExtractor={(item) => item.category}
        ListHeaderComponent={HeaderComponent}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        initialNumToRender={3}
        style={styles.flatList}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: "100%",
  },
  flatList: {
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120, // Extra padding at the bottom to ensure scrollability
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingTop: Platform.OS === "ios" ? 44 : 16,
    backgroundColor: "transparent",
  },
  engineBadge: {
    backgroundColor: "#e0f7fa",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  engineText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#006064",
  },
  summaryContainer: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  loadingContainer: {
    padding: 16,
    alignItems: "center",
  },
  categoryContainer: {
    marginBottom: 16,
    borderRadius: 8,
    padding: 16,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  testItem: {
    padding: 12,
    borderRadius: 6,
    marginVertical: 4,
  },
  testHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  errorText: {
    color: "#f44336",
    fontSize: 13,
    marginTop: 6,
  },
});
