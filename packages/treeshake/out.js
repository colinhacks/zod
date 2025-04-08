// src/storages/globalConfig/globalConfig.ts
var store;
// @__NO_SIDE_EFFECTS__
function getGlobalConfig(config2) {
  return {
    lang: store?.lang,
    message: config2?.message,
    abortEarly: store?.abortEarly,
    abortPipeEarly: store?.abortPipeEarly,
  };
}

// src/storages/globalMessage/globalMessage.ts
var store2;
// @__NO_SIDE_EFFECTS__
function getGlobalMessage(lang) {
  return store2?.get(lang);
}

// src/storages/schemaMessage/schemaMessage.ts
var store3;
// @__NO_SIDE_EFFECTS__
function getSchemaMessage(lang) {
  return store3?.get(lang);
}

// src/storages/specificMessage/specificMessage.ts
var store4;
// @__NO_SIDE_EFFECTS__
function getSpecificMessage(reference, lang) {
  return store4?.get(reference)?.get(lang);
}

// src/utils/_stringify/_stringify.ts
// @__NO_SIDE_EFFECTS__
function _stringify(input) {
  const type = typeof input;
  if (type === "string") {
    return `"${input}"`;
  }
  if (type === "number" || type === "bigint" || type === "boolean") {
    return `${input}`;
  }
  if (type === "object" || type === "function") {
    return (input && Object.getPrototypeOf(input)?.constructor?.name) ?? "null";
  }
  return type;
}

// src/utils/_addIssue/_addIssue.ts
function _addIssue(context, label, dataset, config2, other) {
  const input = other && "input" in other ? other.input : dataset.value;
  const expected = other?.expected ?? context.expects ?? null;
  const received = other?.received ?? _stringify(input);
  const issue = {
    kind: context.kind,
    type: context.type,
    input,
    expected,
    received,
    message: `Invalid ${label}: ${expected ? `Expected ${expected} but r` : "R"}eceived ${received}`,
    requirement: context.requirement,
    path: other?.path,
    issues: other?.issues,
    lang: config2.lang,
    abortEarly: config2.abortEarly,
    abortPipeEarly: config2.abortPipeEarly,
  };
  const isSchema = context.kind === "schema";
  const message =
    other?.message ??
    context.message ??
    getSpecificMessage(context.reference, issue.lang) ??
    (isSchema ? getSchemaMessage(issue.lang) : null) ??
    config2.message ??
    getGlobalMessage(issue.lang);
  if (message !== void 0) {
    issue.message =
      typeof message === "function"
        ? // @ts-expect-error
          message(issue)
        : message;
  }
  if (isSchema) {
    dataset.typed = false;
  }
  if (dataset.issues) {
    dataset.issues.push(issue);
  } else {
    dataset.issues = [issue];
  }
}

// src/utils/_getStandardProps/_getStandardProps.ts
// @__NO_SIDE_EFFECTS__
function _getStandardProps(context) {
  return {
    version: 1,
    vendor: "valibot",
    validate(value2) {
      return context["~run"]({ value: value2 }, getGlobalConfig());
    },
  };
}

// src/utils/ValiError/ValiError.ts
var ValiError = class extends Error {
  /**
   * Creates a Valibot error with useful information.
   *
   * @param issues The error issues.
   */
  constructor(issues) {
    super(issues[0].message);
    this.name = "ValiError";
    this.issues = issues;
  }
};

// src/actions/minLength/minLength.ts
// @__NO_SIDE_EFFECTS__
function minLength(requirement, message) {
  return {
    kind: "validation",
    type: "min_length",
    reference: minLength,
    async: false,
    expects: `>=${requirement}`,
    requirement,
    message,
    "~run"(dataset, config2) {
      if (dataset.typed && dataset.value.length < this.requirement) {
        _addIssue(this, "length", dataset, config2, {
          received: `${dataset.value.length}`,
        });
      }
      return dataset;
    },
  };
}

// src/schemas/string/string.ts
// @__NO_SIDE_EFFECTS__
function string(message) {
  return {
    kind: "schema",
    type: "string",
    reference: string,
    expects: "string",
    async: false,
    message,
    get "~standard"() {
      return _getStandardProps(this);
    },
    "~run"(dataset, config2) {
      if (typeof dataset.value === "string") {
        dataset.typed = true;
      } else {
        _addIssue(this, "type", dataset, config2);
      }
      return dataset;
    },
  };
}

// src/methods/parse/parse.ts
function parse(schema, input, config2) {
  const dataset = schema["~run"]({ value: input }, getGlobalConfig(config2));
  if (dataset.issues) {
    throw new ValiError(dataset.issues);
  }
  return dataset.value;
}

// src/methods/pipe/pipe.ts
// @__NO_SIDE_EFFECTS__
function pipe(...pipe2) {
  return {
    ...pipe2[0],
    pipe: pipe2,
    get "~standard"() {
      return _getStandardProps(this);
    },
    "~run"(dataset, config2) {
      for (const item of pipe2) {
        if (item.kind !== "metadata") {
          if (dataset.issues && (item.kind === "schema" || item.kind === "transformation")) {
            dataset.typed = false;
            break;
          }
          if (!dataset.issues || (!config2.abortEarly && !config2.abortPipeEarly)) {
            dataset = item["~run"](dataset, config2);
          }
        }
      }
      return dataset;
    },
  };
}

var schema = pipe(string(), minLength(1));
console.log(parse(schema, "hi"));
