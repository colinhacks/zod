import { z } from "zod/v4";

export const TaskListNodeSchema = z.lazy(() =>
  z.strictObject({
    type: z.literal("taskList"),
    attrs: z.strictObject({ localId: z.string() }),
    content: z.array(z.tuple([TaskItemNodeSchema, z.union([TaskItemNodeSchema, TaskListNodeSchema])])).min(1),
  })
);

export const ListItemNodeSchema = z.lazy(() =>
  z.strictObject({
    type: z.literal("listItem"),
    attrs: z.strictObject({ localId: z.string().optional() }).optional(),
    content: z
      .array(
        z.tuple([
          z.union([
            ParagraphWithNoMarksNodeSchema,
            MediaSingleCaptionNodeSchema,
            MediaSingleFullNodeSchema,
            CodeBlockNodeSchema,
            ExtensionWithMarksNodeSchema,
          ]),
          z.union([
            ParagraphWithNoMarksNodeSchema,
            BulletListNodeSchema,
            OrderedListNodeSchema,
            TaskListNodeSchema,
            MediaSingleCaptionNodeSchema,
            MediaSingleFullNodeSchema,
            CodeBlockNodeSchema,
            ExtensionWithMarksNodeSchema,
          ]),
        ])
      )
      .min(1),
  })
);

export const BulletListNodeSchema = z.lazy(() =>
  z.strictObject({
    type: z.literal("bulletList"),
    attrs: z.strictObject({ localId: z.string().optional() }).optional(),
    content: z.array(ListItemNodeSchema).min(1),
  })
);

export const AlignmentMarkSchema = z.strictObject({
  type: z.literal("alignment"),
  attrs: z.strictObject({
    align: z.union([z.literal("center"), z.literal("end")]),
  }),
});

export const AnnotationMarkSchema = z.strictObject({
  type: z.literal("annotation"),
  attrs: z.strictObject({
    id: z.string(),
    annotationType: z.literal("inlineComment"),
  }),
});

export const BackgroundColorMarkSchema = z.strictObject({
  type: z.literal("backgroundColor"),
  attrs: z.strictObject({ color: z.string().regex(/^#[0-9a-fA-F]{6}$/) }),
});

export const BlockCardNodeSchema = z.strictObject({
  type: z.literal("blockCard"),
  attrs: z.union([
    z.strictObject({
      localId: z.string().optional(),
      url: z.string().optional(),
      datasource: z.strictObject({
        id: z.string(),
        parameters: z.unknown(),
        views: z
          .array(
            z.strictObject({
              properties: z.unknown().optional(),
              type: z.string(),
            })
          )
          .min(1),
      }),
      width: z.number().optional(),
      layout: z
        .union([
          z.literal("wide"),
          z.literal("full-width"),
          z.literal("center"),
          z.literal("wrap-right"),
          z.literal("wrap-left"),
          z.literal("align-end"),
          z.literal("align-start"),
        ])
        .optional(),
    }),
    z.strictObject({ url: z.string(), localId: z.string().optional() }),
    z.strictObject({ data: z.unknown(), localId: z.string().optional() }),
  ]),
});

export const TextNodeSchema = z.strictObject({
  type: z.literal("text"),
  marks: z.array(z.unknown()).optional(),
  text: z.string().min(1),
});

export const LinkMarkSchema = z.strictObject({
  type: z.literal("link"),
  attrs: z.strictObject({
    href: z.string(),
    title: z.string().optional(),
    id: z.string().optional(),
    collection: z.string().optional(),
    occurrenceKey: z.string().optional(),
  }),
});

export const EmMarkSchema = z.strictObject({
  type: z.literal("em"),
});

export const StrongMarkSchema = z.strictObject({
  type: z.literal("strong"),
});

export const StrikeMarkSchema = z.strictObject({
  type: z.literal("strike"),
});

export const SubsupMarkSchema = z.strictObject({
  type: z.literal("subsup"),
  attrs: z.strictObject({
    type: z.union([z.literal("sub"), z.literal("sup")]),
  }),
});

export const UnderlineMarkSchema = z.strictObject({
  type: z.literal("underline"),
});

export const TextColorMarkSchema = z.strictObject({
  type: z.literal("textColor"),
  attrs: z.strictObject({ color: z.string().regex(/^#[0-9a-fA-F]{6}$/) }),
});

export const FormattedTextInlineNodeSchema = z.intersection(
  TextNodeSchema,
  z.object({
    marks: z
      .array(
        z.union([
          LinkMarkSchema,
          EmMarkSchema,
          StrongMarkSchema,
          StrikeMarkSchema,
          SubsupMarkSchema,
          UnderlineMarkSchema,
          TextColorMarkSchema,
          AnnotationMarkSchema,
          BackgroundColorMarkSchema,
        ])
      )
      .optional(),
  })
);

export const CodeMarkSchema = z.strictObject({
  type: z.literal("code"),
});

export const CodeInlineNodeSchema = z.intersection(
  TextNodeSchema,
  z.object({
    marks: z.array(z.union([CodeMarkSchema, LinkMarkSchema, AnnotationMarkSchema])).optional(),
  })
);

export const DateNodeSchema = z.strictObject({
  type: z.literal("date"),
  attrs: z.strictObject({
    timestamp: z.string().min(1),
    localId: z.string().optional(),
  }),
});

export const EmojiNodeSchema = z.strictObject({
  type: z.literal("emoji"),
  attrs: z.strictObject({
    shortName: z.string(),
    id: z.string().optional(),
    text: z.string().optional(),
    localId: z.string().optional(),
  }),
});

export const HardBreakNodeSchema = z.strictObject({
  type: z.literal("hardBreak"),
  attrs: z
    .strictObject({
      text: z.literal("\n").optional(),
      localId: z.string().optional(),
    })
    .optional(),
});

export const InlineCardNodeSchema = z.strictObject({
  type: z.literal("inlineCard"),
  attrs: z.union([
    z.strictObject({ url: z.string(), localId: z.string().optional() }),
    z.strictObject({ data: z.unknown(), localId: z.string().optional() }),
  ]),
});

export const MentionNodeSchema = z.strictObject({
  type: z.literal("mention"),
  attrs: z.strictObject({
    id: z.string(),
    localId: z.string().optional(),
    text: z.string().optional(),
    accessLevel: z.string().optional(),
    userType: z.union([z.literal("DEFAULT"), z.literal("SPECIAL"), z.literal("APP")]).optional(),
  }),
});

export const PlaceholderNodeSchema = z.strictObject({
  type: z.literal("placeholder"),
  attrs: z.strictObject({ text: z.string(), localId: z.string().optional() }),
});

export const StatusNodeSchema = z.strictObject({
  type: z.literal("status"),
  attrs: z.strictObject({
    text: z.string().min(1),
    color: z.union([
      z.literal("neutral"),
      z.literal("purple"),
      z.literal("blue"),
      z.literal("red"),
      z.literal("yellow"),
      z.literal("green"),
    ]),
    localId: z.string().optional(),
    style: z.string().optional(),
  }),
});

export const InlineExtensionNodeSchema = z.strictObject({
  type: z.literal("inlineExtension"),
  marks: z.array(z.unknown()).optional(),
  attrs: z.strictObject({
    extensionKey: z.string().min(1),
    extensionType: z.string().min(1),
    parameters: z.unknown().optional(),
    text: z.string().optional(),
    localId: z.string().min(1).optional(),
  }),
});

export const DataConsumerMarkSchema = z.strictObject({
  type: z.literal("dataConsumer"),
  attrs: z.strictObject({ sources: z.array(z.string()).min(1) }),
});

export const FragmentMarkSchema = z.strictObject({
  type: z.literal("fragment"),
  attrs: z.strictObject({
    localId: z.string().min(1),
    name: z.string().optional(),
  }),
});

export const InlineExtensionWithMarksNodeSchema = z.intersection(
  InlineExtensionNodeSchema,
  z.object({
    marks: z.array(z.union([DataConsumerMarkSchema, FragmentMarkSchema])).optional(),
  })
);

export const BorderMarkSchema = z.strictObject({
  type: z.literal("border"),
  attrs: z.strictObject({
    size: z.number().min(1).max(3),
    color: z.string().regex(/^#[0-9a-fA-F]{8}$|^#[0-9a-fA-F]{6}$/),
  }),
});

export const MediaInlineNodeSchema = z.strictObject({
  type: z.literal("mediaInline"),
  marks: z.array(z.union([LinkMarkSchema, AnnotationMarkSchema, BorderMarkSchema])).optional(),
  attrs: z.strictObject({
    type: z.union([z.literal("link"), z.literal("file"), z.literal("image")]).optional(),
    localId: z.string().optional(),
    id: z.string().min(1),
    alt: z.string().optional(),
    collection: z.string(),
    occurrenceKey: z.string().min(1).optional(),
    width: z.number().optional(),
    height: z.number().optional(),
    data: z.unknown().optional(),
  }),
});

export const InlineNodeSchema = z.union([
  FormattedTextInlineNodeSchema,
  CodeInlineNodeSchema,
  DateNodeSchema,
  EmojiNodeSchema,
  HardBreakNodeSchema,
  InlineCardNodeSchema,
  MentionNodeSchema,
  PlaceholderNodeSchema,
  StatusNodeSchema,
  InlineExtensionWithMarksNodeSchema,
  MediaInlineNodeSchema,
]);

export const ParagraphNodeSchema = z.strictObject({
  type: z.literal("paragraph"),
  marks: z.array(z.unknown()).optional(),
  attrs: z.strictObject({ localId: z.string().optional() }).optional(),
  content: z.array(InlineNodeSchema).optional(),
});

export const ParagraphWithNoMarksNodeSchema = z.intersection(
  ParagraphNodeSchema,
  z.object({ marks: z.array(z.unknown()).optional() })
);

export const ParagraphWithAlignmentNodeSchema = z.intersection(
  ParagraphNodeSchema,
  z.object({ marks: z.array(AlignmentMarkSchema).optional() })
);

export const IndentationMarkSchema = z.strictObject({
  type: z.literal("indentation"),
  attrs: z.strictObject({ level: z.number().min(1).max(6) }),
});

export const ParagraphWithIndentationNodeSchema = z.intersection(
  ParagraphNodeSchema,
  z.object({ marks: z.array(IndentationMarkSchema).optional() })
);

export const MediaSingleNodeSchema = z.object({
  type: z.literal("mediaSingle"),
  marks: z.array(LinkMarkSchema).optional(),
  attrs: z
    .union([
      z.strictObject({
        localId: z.string().optional(),
        width: z.number().max(100).optional(),
        layout: z.union([
          z.literal("wide"),
          z.literal("full-width"),
          z.literal("center"),
          z.literal("wrap-right"),
          z.literal("wrap-left"),
          z.literal("align-end"),
          z.literal("align-start"),
        ]),
        widthType: z.literal("percentage").optional(),
      }),
      z.strictObject({
        localId: z.string().optional(),
        width: z.number(),
        widthType: z.literal("pixel"),
        layout: z.union([
          z.literal("wide"),
          z.literal("full-width"),
          z.literal("center"),
          z.literal("wrap-right"),
          z.literal("wrap-left"),
          z.literal("align-end"),
          z.literal("align-start"),
        ]),
      }),
    ])
    .optional(),
});

export const MediaNodeSchema = z.strictObject({
  type: z.literal("media"),
  marks: z.array(z.union([LinkMarkSchema, AnnotationMarkSchema, BorderMarkSchema])).optional(),
  attrs: z.union([
    z.strictObject({
      type: z.union([z.literal("link"), z.literal("file")]),
      localId: z.string().optional(),
      id: z.string().min(1),
      alt: z.string().optional(),
      collection: z.string(),
      height: z.number().optional(),
      occurrenceKey: z.string().min(1).optional(),
      width: z.number().optional(),
    }),
    z.strictObject({
      type: z.literal("external"),
      localId: z.string().optional(),
      alt: z.string().optional(),
      height: z.number().optional(),
      width: z.number().optional(),
      url: z.string(),
    }),
  ]),
});

export const CaptionNodeSchema = z.strictObject({
  type: z.literal("caption"),
  attrs: z.strictObject({ localId: z.string().optional() }).optional(),
  content: z
    .array(
      z.union([
        HardBreakNodeSchema,
        MentionNodeSchema,
        EmojiNodeSchema,
        DateNodeSchema,
        PlaceholderNodeSchema,
        InlineCardNodeSchema,
        StatusNodeSchema,
        FormattedTextInlineNodeSchema,
        CodeInlineNodeSchema,
      ])
    )
    .optional(),
});

export const MediaSingleCaptionNodeSchema = z.intersection(
  MediaSingleNodeSchema,
  z.object({
    content: z
      .array(z.tuple([MediaNodeSchema, CaptionNodeSchema]))
      .min(1)
      .max(2),
  })
);

export const MediaSingleFullNodeSchema = z.intersection(
  MediaSingleNodeSchema,
  z.object({ content: z.array(MediaNodeSchema).min(1).max(1) })
);

export const TextWithNoMarksNodeSchema = z.intersection(
  TextNodeSchema,
  z.object({ marks: z.array(z.unknown()).optional() })
);

export const CodeBlockNodeSchema = z.strictObject({
  type: z.literal("codeBlock"),
  marks: z.array(z.unknown()).optional(),
  attrs: z
    .strictObject({
      language: z.string().optional(),
      uniqueId: z.string().optional(),
      localId: z.string().optional(),
    })
    .optional(),
  content: z.array(TextWithNoMarksNodeSchema).optional(),
});

export const TaskItemNodeSchema = z.strictObject({
  type: z.literal("taskItem"),
  attrs: z.strictObject({
    localId: z.string(),
    state: z.union([z.literal("TODO"), z.literal("DONE")]),
  }),
  content: z.array(InlineNodeSchema).optional(),
});

export const ExtensionNodeSchema = z.strictObject({
  type: z.literal("extension"),
  marks: z.array(z.unknown()).optional(),
  attrs: z.strictObject({
    extensionKey: z.string().min(1),
    extensionType: z.string().min(1),
    parameters: z.unknown().optional(),
    text: z.string().optional(),
    layout: z.union([z.literal("wide"), z.literal("full-width"), z.literal("default")]).optional(),
    localId: z.string().min(1).optional(),
  }),
});

export const ExtensionWithMarksNodeSchema = z.intersection(
  ExtensionNodeSchema,
  z.object({
    marks: z.array(z.union([DataConsumerMarkSchema, FragmentMarkSchema])).optional(),
  })
);

export const OrderedListNodeSchema = z.strictObject({
  type: z.literal("orderedList"),
  attrs: z
    .strictObject({
      order: z.number().optional(),
      localId: z.string().optional(),
    })
    .optional(),
  content: z.array(ListItemNodeSchema).min(1),
});

export const HeadingNodeSchema = z.strictObject({
  type: z.literal("heading"),
  marks: z.array(z.unknown()).optional(),
  attrs: z.strictObject({
    level: z.number().min(1).max(6),
    localId: z.string().optional(),
  }),
  content: z.array(InlineNodeSchema).optional(),
});

export const HeadingWithNoMarksNodeSchema = z.intersection(
  HeadingNodeSchema,
  z.object({ marks: z.array(z.unknown()).optional() })
);

export const HeadingWithAlignmentNodeSchema = z.intersection(
  HeadingNodeSchema,
  z.object({ marks: z.array(AlignmentMarkSchema).optional() })
);

export const HeadingWithIndentationNodeSchema = z.intersection(
  HeadingNodeSchema,
  z.object({ marks: z.array(IndentationMarkSchema).optional() })
);

export const MediaGroupNodeSchema = z.strictObject({
  type: z.literal("mediaGroup"),
  content: z.array(MediaNodeSchema).min(1),
});

export const DecisionItemNodeSchema = z.strictObject({
  type: z.literal("decisionItem"),
  attrs: z.strictObject({ localId: z.string(), state: z.string() }),
  content: z.array(InlineNodeSchema).optional(),
});

export const DecisionListNodeSchema = z.strictObject({
  type: z.literal("decisionList"),
  attrs: z.strictObject({ localId: z.string() }),
  content: z.array(DecisionItemNodeSchema).min(1),
});

export const RuleNodeSchema = z.strictObject({
  type: z.literal("rule"),
  attrs: z.strictObject({ localId: z.string().optional() }).optional(),
});

export const PanelNodeSchema = z.strictObject({
  type: z.literal("panel"),
  attrs: z.strictObject({
    panelType: z.union([
      z.literal("info"),
      z.literal("note"),
      z.literal("tip"),
      z.literal("warning"),
      z.literal("error"),
      z.literal("success"),
      z.literal("custom"),
    ]),
    panelIcon: z.string().optional(),
    panelIconId: z.string().optional(),
    panelIconText: z.string().optional(),
    panelColor: z.string().optional(),
    localId: z.string().optional(),
  }),
  content: z
    .array(
      z.union([
        ParagraphWithNoMarksNodeSchema,
        HeadingWithNoMarksNodeSchema,
        BulletListNodeSchema,
        OrderedListNodeSchema,
        BlockCardNodeSchema,
        MediaGroupNodeSchema,
        MediaSingleCaptionNodeSchema,
        MediaSingleFullNodeSchema,
        CodeBlockNodeSchema,
        TaskListNodeSchema,
        RuleNodeSchema,
        DecisionListNodeSchema,
        ExtensionWithMarksNodeSchema,
      ])
    )
    .min(1),
});

export const BlockquoteNodeSchema = z.strictObject({
  type: z.literal("blockquote"),
  attrs: z.strictObject({ localId: z.string().optional() }).optional(),
  content: z
    .array(
      z.union([
        ParagraphWithNoMarksNodeSchema,
        OrderedListNodeSchema,
        BulletListNodeSchema,
        CodeBlockNodeSchema,
        MediaSingleCaptionNodeSchema,
        MediaSingleFullNodeSchema,
        MediaGroupNodeSchema,
        ExtensionWithMarksNodeSchema,
      ])
    )
    .min(1),
});

export const EmbedCardNodeSchema = z.strictObject({
  type: z.literal("embedCard"),
  attrs: z.strictObject({
    url: z.string(),
    layout: z.union([
      z.literal("wide"),
      z.literal("full-width"),
      z.literal("center"),
      z.literal("wrap-right"),
      z.literal("wrap-left"),
      z.literal("align-end"),
      z.literal("align-start"),
    ]),
    width: z.number().max(100).optional(),
    originalHeight: z.number().optional(),
    originalWidth: z.number().optional(),
    localId: z.string().optional(),
  }),
});

export const NestedExpandContentSchema = z
  .array(
    z.union([
      ParagraphWithNoMarksNodeSchema,
      HeadingWithNoMarksNodeSchema,
      MediaSingleCaptionNodeSchema,
      MediaSingleFullNodeSchema,
      MediaGroupNodeSchema,
      CodeBlockNodeSchema,
      BulletListNodeSchema,
      OrderedListNodeSchema,
      TaskListNodeSchema,
      DecisionListNodeSchema,
      RuleNodeSchema,
      PanelNodeSchema,
      BlockquoteNodeSchema,
      ExtensionWithMarksNodeSchema,
    ])
  )
  .min(1);

export const NestedExpandNodeSchema = z.strictObject({
  type: z.literal("nestedExpand"),
  attrs: z.strictObject({
    title: z.string().optional(),
    localId: z.string().optional(),
  }),
  content: NestedExpandContentSchema,
});

export const NestedExpandWithNoMarksNodeSchema = z.intersection(
  NestedExpandNodeSchema,
  z.object({ marks: z.array(z.unknown()).optional() })
);

export const TableCellContentSchema = z
  .array(
    z.union([
      ParagraphWithNoMarksNodeSchema,
      ParagraphWithAlignmentNodeSchema,
      PanelNodeSchema,
      BlockquoteNodeSchema,
      OrderedListNodeSchema,
      BulletListNodeSchema,
      RuleNodeSchema,
      HeadingWithNoMarksNodeSchema,
      HeadingWithAlignmentNodeSchema,
      HeadingWithIndentationNodeSchema,
      CodeBlockNodeSchema,
      MediaSingleCaptionNodeSchema,
      MediaSingleFullNodeSchema,
      MediaGroupNodeSchema,
      DecisionListNodeSchema,
      TaskListNodeSchema,
      BlockCardNodeSchema,
      EmbedCardNodeSchema,
      ExtensionWithMarksNodeSchema,
      NestedExpandWithNoMarksNodeSchema,
    ])
  )
  .min(1);

export const TableCellNodeSchema = z.strictObject({
  type: z.literal("tableCell"),
  attrs: z
    .strictObject({
      colspan: z.number().optional(),
      rowspan: z.number().optional(),
      colwidth: z.array(z.number()).optional(),
      background: z.string().optional(),
      localId: z.string().optional(),
    })
    .optional(),
  content: TableCellContentSchema,
});

export const TableHeaderNodeSchema = z.strictObject({
  type: z.literal("tableHeader"),
  attrs: z
    .strictObject({
      colspan: z.number().optional(),
      rowspan: z.number().optional(),
      colwidth: z.array(z.number()).optional(),
      background: z.string().optional(),
      localId: z.string().optional(),
    })
    .optional(),
  content: TableCellContentSchema,
});

export const TableRowNodeSchema = z.strictObject({
  type: z.literal("tableRow"),
  attrs: z.strictObject({ localId: z.string().optional() }).optional(),
  content: z.array(z.union([TableCellNodeSchema, TableHeaderNodeSchema])),
});

export const TableNodeSchema = z.strictObject({
  type: z.literal("table"),
  marks: z.array(FragmentMarkSchema).optional(),
  attrs: z
    .strictObject({
      displayMode: z.union([z.literal("default"), z.literal("fixed")]).optional(),
      isNumberColumnEnabled: z.boolean().optional(),
      layout: z
        .union([
          z.literal("wide"),
          z.literal("full-width"),
          z.literal("center"),
          z.literal("align-end"),
          z.literal("align-start"),
          z.literal("default"),
        ])
        .optional(),
      localId: z.string().min(1).optional(),
      width: z.number().optional(),
    })
    .optional(),
  content: z.array(TableRowNodeSchema).min(1),
});

export const NonNestableBlockContentSchema = z.union([
  ParagraphWithNoMarksNodeSchema,
  PanelNodeSchema,
  BlockquoteNodeSchema,
  OrderedListNodeSchema,
  BulletListNodeSchema,
  RuleNodeSchema,
  HeadingWithNoMarksNodeSchema,
  CodeBlockNodeSchema,
  MediaGroupNodeSchema,
  MediaSingleCaptionNodeSchema,
  MediaSingleFullNodeSchema,
  DecisionListNodeSchema,
  TaskListNodeSchema,
  TableNodeSchema,
  BlockCardNodeSchema,
  EmbedCardNodeSchema,
  ExtensionWithMarksNodeSchema,
]);

export const ExpandNodeSchema = z.strictObject({
  type: z.literal("expand"),
  marks: z.array(z.unknown()).optional(),
  attrs: z
    .strictObject({
      title: z.string().optional(),
      localId: z.string().optional(),
    })
    .optional(),
  content: z.array(z.union([NonNestableBlockContentSchema, NestedExpandWithNoMarksNodeSchema])).min(1),
});

export const BodiedExtensionNodeSchema = z.strictObject({
  type: z.literal("bodiedExtension"),
  marks: z.array(z.unknown()).optional(),
  attrs: z.strictObject({
    extensionKey: z.string().min(1),
    extensionType: z.string().min(1),
    parameters: z.unknown().optional(),
    text: z.string().optional(),
    layout: z.union([z.literal("wide"), z.literal("full-width"), z.literal("default")]).optional(),
    localId: z.string().min(1).optional(),
  }),
  content: z.array(NonNestableBlockContentSchema).min(1),
});

export const BodiedExtensionWithMarksNodeSchema = z.intersection(
  BodiedExtensionNodeSchema,
  z.object({
    marks: z.array(z.union([DataConsumerMarkSchema, FragmentMarkSchema])).optional(),
  })
);

export const BlockContentSchema = z.union([
  BlockCardNodeSchema,
  ParagraphWithNoMarksNodeSchema,
  ParagraphWithAlignmentNodeSchema,
  ParagraphWithIndentationNodeSchema,
  MediaSingleCaptionNodeSchema,
  MediaSingleFullNodeSchema,
  CodeBlockNodeSchema,
  TaskListNodeSchema,
  BulletListNodeSchema,
  OrderedListNodeSchema,
  HeadingWithNoMarksNodeSchema,
  HeadingWithAlignmentNodeSchema,
  HeadingWithIndentationNodeSchema,
  MediaGroupNodeSchema,
  DecisionListNodeSchema,
  RuleNodeSchema,
  PanelNodeSchema,
  BlockquoteNodeSchema,
  ExtensionWithMarksNodeSchema,
  EmbedCardNodeSchema,
  TableNodeSchema,
  ExpandNodeSchema,
  BodiedExtensionWithMarksNodeSchema,
]);

export const BreakoutMarkSchema = z.strictObject({
  type: z.literal("breakout"),
  attrs: z.strictObject({
    mode: z.union([z.literal("wide"), z.literal("full-width")]),
    width: z.number().optional(),
  }),
});

export const CodeBlockRootOnlyNodeSchema = z.strictObject({
  type: z.literal("codeBlock"),
  marks: z.array(BreakoutMarkSchema).optional(),
  attrs: z
    .strictObject({
      language: z.string().optional(),
      uniqueId: z.string().optional(),
      localId: z.string().optional(),
    })
    .optional(),
  content: z.array(TextWithNoMarksNodeSchema).optional(),
});

export const LayoutColumnNodeSchema = z.strictObject({
  type: z.literal("layoutColumn"),
  attrs: z.strictObject({
    width: z.number().max(100),
    localId: z.string().optional(),
  }),
  content: z.array(BlockContentSchema).min(1),
});

export const LayoutSectionNodeSchema = z.strictObject({
  type: z.literal("layoutSection"),
  marks: z.array(BreakoutMarkSchema).optional(),
  attrs: z.strictObject({ localId: z.string().optional() }).optional(),
  content: z.array(LayoutColumnNodeSchema),
});

export const LayoutSectionFullNodeSchema = z.intersection(
  LayoutSectionNodeSchema,
  z.object({
    marks: z.array(BreakoutMarkSchema).optional(),
    content: z.array(LayoutColumnNodeSchema).min(2).max(3),
  })
);

export const ExpandRootOnlyNodeSchema = z.strictObject({
  type: z.literal("expand"),
  marks: z.array(BreakoutMarkSchema).optional(),
  attrs: z
    .strictObject({
      title: z.string().optional(),
      localId: z.string().optional(),
    })
    .optional(),
  content: z.array(z.union([NonNestableBlockContentSchema, NestedExpandWithNoMarksNodeSchema])).min(1),
});

export const DocNodeSchema = z.strictObject({
  type: z.literal("doc"),
  content: z.array(
    z.union([
      BlockCardNodeSchema,
      CodeBlockNodeSchema,
      MediaSingleCaptionNodeSchema,
      MediaSingleFullNodeSchema,
      ParagraphWithAlignmentNodeSchema,
      ParagraphWithIndentationNodeSchema,
      ParagraphWithNoMarksNodeSchema,
      TaskListNodeSchema,
      OrderedListNodeSchema,
      BulletListNodeSchema,
      BlockquoteNodeSchema,
      DecisionListNodeSchema,
      EmbedCardNodeSchema,
      ExtensionWithMarksNodeSchema,
      HeadingWithIndentationNodeSchema,
      HeadingWithNoMarksNodeSchema,
      HeadingWithAlignmentNodeSchema,
      MediaGroupNodeSchema,
      RuleNodeSchema,
      PanelNodeSchema,
      TableNodeSchema,
      BodiedExtensionWithMarksNodeSchema,
      ExpandNodeSchema,
      CodeBlockRootOnlyNodeSchema,
      LayoutSectionFullNodeSchema,
      ExpandRootOnlyNodeSchema,
    ])
  ),
  version: z.literal(1),
});

const adf = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [
        {
          text: "Hello everyone!",
          type: "text",
        },
      ],
    },
    {
      type: "extension",
      attrs: {
        layout: "default",
        extensionType: "com.atlassian.confluence.macro.core",
        extensionKey: "recently-updated",
        parameters: {
          macroParams: {
            max: {
              value: "5",
            },
          },
          macroMetadata: {
            macroId: {
              value: "f9d6b4ce776b6df2ba84df23c64944e6",
            },
            schemaVersion: {
              value: "1",
            },
            title: "Recent updates",
          },
        },
        localId: "400db3c0-b048-4f72-9ee1-db2fc607c382",
      },
    },
    {
      type: "heading",
      attrs: {
        level: 2,
      },
      content: [
        {
          text: "🖐 Get in touch",
          type: "text",
        },
      ],
    },
    {
      type: "layoutSection",
      content: [
        {
          type: "layoutColumn",
          attrs: {
            width: 50,
          },
          content: [
            {
              type: "paragraph",
              content: [
                {
                  text: "✉️ MyAmazingEmail.com",
                  type: "text",
                },
              ],
            },
          ],
        },
        {
          type: "layoutColumn",
          attrs: {
            width: 50,
          },
          content: [
            {
              type: "paragraph",
              content: [
                {
                  text: "🔗 @Jonas-Lundahl",
                  type: "text",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          text: "Looking forward to meeting all of you! Happy 2025! Happy April 22nd! Happy June 20th! Happy July 27th!",
          type: "text",
        },
      ],
    },
    {
      type: "paragraph",
    },
  ],
  version: 1,
};

// const test = DocNodeSchema.parse(adf);

// console.log(JSON.stringify(test, null, 2));

TaskListNodeSchema._zod.def.getter();
