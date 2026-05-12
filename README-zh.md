<p align="center">
  <img src="logo.svg" width="200px" align="center" alt="Zod logo" />
  <h1 align="center">Zod</h1>
  <p align="center">
    TypeScript 优先的 schema 验证，支持静态类型推断
    <br/>
    由 <a href="https://x.com/colinhacks">@colinhacks</a> 开发
  </p>
</p>
<br/>

<p align="center">
<a href="https://github.com/colinhacks/zod/actions?query=branch%3Amain"><img src="https://github.com/colinhacks/zod/actions/workflows/test.yml/badge.svg?event=push&branch=main" alt="Zod CI status" /></a>
<a href="https://opensource.org/licenses/MIT" rel="nofollow"><img src="https://img.shields.io/github/license/colinhacks/zod" alt="License"></a>
<a href="https://www.npmjs.com/package/zod" rel="nofollow"><img src="https://img.shields.io/npm/dw/zod.svg" alt="npm"></a>
<a href="https://discord.gg/KaSRdyX2vc" rel="nofollow"><img src="https://img.shields.io/discord/893487829802418277?label=Discord&logo=discord&logoColor=white" alt="discord server"></a>
<a href="https://github.com/colinhacks/zod" rel="nofollow"><img src="https://img.shields.io/github/stars/colinhacks/zod" alt="stars"></a>
</p>

<div align="center">
  <a href="https://zod.dev/api">文档</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://discord.gg/RcG33DQJdf">Discord</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://twitter.com/colinhacks">𝕏</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://bsky.app/profile/zod.dev">Bluesky</a>
  <br />
</div>

<br/>
<br/>

## 简介

Zod 是一个 TypeScript 优先的 schema 验证库，具有静态类型推断功能。

### 特性

- 🎯 **TypeScript 优先**：专为 TypeScript 设计，提供完整的类型推断
- 📦 **零依赖**：没有任何外部依赖
- 🪶 **体积小巧**：核心库只有 8kb（压缩后）
- 🔒 **不可变**：所有 schema 都是不可变的
- 🎨 **函数式 API**：支持链式调用和组合
- 📝 **详细的错误信息**：提供清晰的验证错误信息
- 🚀 **高性能**：优化的验证算法

## 安装

```bash
npm install zod
```

## 快速开始

### 基本用法

```typescript
import { z } from 'zod';

// 定义 schema
const UserSchema = z.object({
  name: z.string(),
  age: z.number().min(0).max(150),
  email: z.string().email(),
});

// 推断类型
type User = z.infer<typeof UserSchema>;

// 验证数据
const user = UserSchema.parse({
  name: 'John',
  age: 30,
  email: 'john@example.com',
});
```

### 错误处理

```typescript
try {
  UserSchema.parse({ name: 123 });
} catch (error) {
  if (error instanceof z.ZodError) {
    console.log(error.errors);
  }
}
```

### 可选字段

```typescript
const UserSchema = z.object({
  name: z.string(),
  age: z.number().optional(),
  email: z.string().email().optional(),
});
```

### 默认值

```typescript
const UserSchema = z.object({
  name: z.string(),
  age: z.number().default(0),
  email: z.string().email().optional(),
});
```

## Schema 类型

### 原始类型

```typescript
z.string();        // 字符串
z.number();        // 数字
z.boolean();       // 布尔值
z.bigint();        // BigInt
z.date();          // 日期
z.symbol();        // Symbol
z.undefined();     // undefined
z.null();          // null
z.any();           // any
z.unknown();       // unknown
z.never();         // never
z.void();          // void
```

### 字符串验证

```typescript
z.string().min(5);           // 最小长度
z.string().max(10);          // 最大长度
z.string().length(5);        // 精确长度
z.string().email();          // 邮箱格式
z.string().url();            // URL 格式
z.string().uuid();           // UUID 格式
z.string().regex(/^[a-z]+$/); // 正则表达式
z.string().startsWith('abc'); // 以 abc 开头
z.string().endsWith('xyz');   // 以 xyz 结尾
z.string().trim();           // 去除空格
z.string().toLowerCase();    // 转换为小写
z.string().toUpperCase();    // 转换为大写
```

### 数字验证

```typescript
z.number().min(0);           // 最小值
z.number().max(100);         // 最大值
z.number().int();            // 整数
z.number().positive();       // 正数
z.number().negative();       // 负数
z.number().nonpositive();    // 非正数
z.number().nonnegative();    // 非负数
z.number().multipleOf(5);    // 5 的倍数
z.number().finite();         // 有限数
z.number().safe();           // 安全整数
```

### 数组

```typescript
z.array(z.string());              // 字符串数组
z.array(z.number()).min(1);       // 至少一个数字
z.array(z.number()).max(10);      // 最多 10 个数字
z.array(z.number()).length(5);    // 精确 5 个数字
z.array(z.number()).nonempty();   // 非空数组
```

### 对象

```typescript
const UserSchema = z.object({
  name: z.string(),
  age: z.number(),
});

// 扩展对象
const ExtendedUserSchema = UserSchema.extend({
  email: z.string().email(),
});

// 选择字段
const NameSchema = UserSchema.pick({ name: true });

// 排除字段
const WithoutAgeSchema = UserSchema.omit({ age: true });

// 部分字段
const PartialUserSchema = UserSchema.partial();

// 必填字段
const RequiredUserSchema = UserSchema.required();
```

### 联合类型

```typescript
const StringOrNumber = z.union([z.string(), z.number()]);

// 或者使用 discriminatedUnion
const ShapeSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('circle'), radius: z.number() }),
  z.object({ type: z.literal('square'), side: z.number() }),
]);
```

### 枚举

```typescript
const DirectionSchema = z.enum(['up', 'down', 'left', 'right']);

// 原生枚举
enum Direction {
  Up = 'UP',
  Down = 'DOWN',
  Left = 'LEFT',
  Right = 'RIGHT',
}
const DirectionSchema = z.nativeEnum(Direction);
```

### 元组

```typescript
const TupleSchema = z.tuple([z.string(), z.number()]);
// 类型: [string, number]
```

### 记录

```typescript
const RecordSchema = z.record(z.string(), z.number());
// 类型: Record<string, number>
```

### 映射

```typescript
const MapSchema = z.map(z.string(), z.number());
// 类型: Map<string, number>
```

### 集合

```typescript
const SetSchema = z.set(z.string());
// 类型: Set<string>
```

## 高级用法

### 自定义验证

```typescript
const UserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
}).refine((data) => {
  // 自定义验证逻辑
  return data.name !== data.email;
}, {
  message: 'Name and email cannot be the same',
});
```

### 转换

```typescript
const StringToNumber = z.string().transform((val) => parseInt(val, 10));

const result = StringToNumber.parse('123'); // 123 (number)
```

### 默认值

```typescript
const UserSchema = z.object({
  name: z.string(),
  age: z.number().default(0),
});

const user = UserSchema.parse({ name: 'John' });
// { name: 'John', age: 0 }
```

### 可选字段

```typescript
const UserSchema = z.object({
  name: z.string(),
  age: z.number().optional(),
});

const user = UserSchema.parse({ name: 'John' });
// { name: 'John', age: undefined }
```

### 可空字段

```typescript
const UserSchema = z.object({
  name: z.string(),
  age: z.number().nullable(),
});

const user = UserSchema.parse({ name: 'John', age: null });
// { name: 'John', age: null }
```

## 与其他库集成

### React Hook Form

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

const { register, handleSubmit } = useForm({
  resolver: zodResolver(schema),
});
```

### Express

```typescript
import express from 'express';
import { z } from 'zod';

const app = express();

const UserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
});

app.post('/users', (req, res) => {
  try {
    const user = UserSchema.parse(req.body);
    // 处理用户数据
    res.json(user);
  } catch (error) {
    res.status(400).json(error);
  }
});
```

## 贡献

欢迎贡献！请阅读 [贡献指南](CONTRIBUTING.md) 了解如何参与。

## 许可证

MIT
