<p align="center">
  <img src="logo.svg" width="200px" align="center" alt="Zod 로고" />
  <h1 align="center">Zod</h1>
  <p align="center">
    ✨ <a href="https://zod.dev">https://zod.dev</a> ✨
    <br/>
    정적 타입 추론을 지원하는 TypeScript 기반 스키마 검증 라이브러리
  </p>
</p>
<br/>
<p align="center">
<a href="https://github.com/colinhacks/zod/actions?query=branch%3Amain"><img src="https://github.com/colinhacks/zod/actions/workflows/test.yml/badge.svg?event=push&branch=main" alt="Zod CI 상태" /></a>
<a href="https://twitter.com/colinhacks" rel="nofollow"><img src="https://img.shields.io/badge/created%20by-@colinhacks-4BBAAB.svg" alt="Created by Colin McDonnell"></a>
<a href="https://opensource.org/licenses/MIT" rel="nofollow"><img src="https://img.shields.io/github/license/colinhacks/zod" alt="라이선스"></a>
<a href="https://www.npmjs.com/package/zod" rel="nofollow"><img src="https://img.shields.io/npm/dw/zod.svg" alt="npm"></a>
<a href="https://github.com/colinhacks/zod" rel="nofollow"><img src="https://img.shields.io/github/stars/colinhacks/zod" alt="스타"></a>
</p>

<div align="center">
  <a href="https://zod.dev">문서</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://discord.gg/RcG33DQJdf">Discord</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://www.npmjs.com/package/zod">npm</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://deno.land/x/zod">deno</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://github.com/colinhacks/zod/issues/new">이슈</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://twitter.com/colinhacks">@colinhacks</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://trpc.io">tRPC</a>
  <br />
</div>

<br/>
<br/>

<!-- <p><strong>공지 ✨</strong> Zod가 <a href="https://go.clerk.com/zod-clerk">Clerk</a> OSS 펠로우십을 받았습니다!<br/>공지 포스트 읽기 👉 <a href="https://go.clerk.com/zod-clerk">clerk.com/blog/zod-fellowship</a></p> -->

![clerk 공지](https://github.com/colinhacks/zod/assets/3084745/6327cf99-8d82-4b44-a5b1-ba2b5c2ff6ad)

<br/>

## 목차

> 이 문서는 [중국어](./README_ZH.md)로도 번역되었습니다.

- [Zod](#zod)
  - [목차](#목차)
  - [소개](#소개)
  - [스폰서](#스폰서)
    - [생태계](#생태계)
      - [리소스](#리소스)
      - [API 라이브러리](#api-라이브러리)
      - [폼 통합 라이브러리](#폼-통합-라이브러리)
      - [Zod를 활용한 다양한 도구들](#zod를-활용한-다양한-도구들)
      - [X to Zod](#x-to-zod)
      - [목킹(Mocking)](#목킹mocking)
      - [Zod로 구동되는 프로젝트들](#zod로-구동되는-프로젝트들)
      - [Zod 유틸리티 모음](#zod-유틸리티-모음)
  - [설치](#설치)
    - [요구사항](#요구사항)
    - [`npm`에서 설치하기](#npm에서-설치하기)
  - [기본 사용법](#기본-사용법)
    - [간단한 문자열 스키마 생성하기](#간단한-문자열-스키마-생성하기)
    - [객체 스키마 생성하기](#객체-스키마-생성하기)
  - [기본 타입(Primitives)](#기본-타입primitives)
  - [기본 타입 강제 변환(Coercion)](#기본-타입-강제-변환coercion)
  - [리터럴(Literals)](#리터럴literals)
  - [문자열](#문자열)
    - [날짜와 시간](#날짜와-시간)
    - [날짜](#날짜)
    - [시간 형식 검증](#시간-형식-검증)
    - [IP 주소](#ip-주소)
    - [IP 범위 (CIDR)](#ip-범위-cidr)
  - [숫자](#숫자)
  - [BigInts](#bigints)
  - [NaN (Not a Number)](#nan-not-a-number)
  - [불리언(Booleans)](#불리언booleans)
  - [날짜](#날짜)
  - [Zod 열거형(enum)](#zod-열거형enum)
  - [네이티브 열거형(Native Enums)](#네이티브-열거형native-enums)
  - [옵셔널(Optional)](#옵셔널optional)
  - [Nullable 타입](#nullable-타입)
  - [객체](#객체)
    - [`.shape`](#shape)
    - [`.keyof`](#keyof)
    - [`.extend`](#extend)
    - [`.merge`](#merge)
    - [`.pick` / `.omit`](#pick--omit)
    - [`.partial`](#partial)
    - [`.deepPartial`](#deeppartial)
    - [`.required`](#required)
    - [`.passthrough`](#passthrough)
    - [`.strict`](#strict)
    - [`.strip` 메서드](#strip-메서드)
    - [`.catchall`](#catchall)
  - [배열](#배열)
    - [`.element`](#element)
    - [`.nonempty`](#nonempty)
    - [`.min` / `.max` / `.length`](#min--max--length)
  - [튜플(Tuples)](#튜플tuples)
  - [유니온 타입](#유니온-타입)
  - [구별된 유니온(Discriminated Unions)](#구별된-유니온discriminated-unions)
  - [레코드(Records)](#레코드records)
  - [맵(Map)](#맵map)
  - [Set(집합)](#set집합)
  - [교차 타입(Intersections)](#교차-타입intersections)
  - [재귀 타입](#재귀-타입)
    - [ZodType과 ZodEffects 함께 사용하기](#zodtype과-zodeffects-함께-사용하기)
    - [JSON 타입 검증](#json-타입-검증)
    - [순환 객체](#순환-객체)
  - [Promise](#promise)
  - [Instanceof](#instanceof)
  - [함수](#함수)
  - [전처리(Preprocess)](#전처리preprocess)
  - [커스텀 스키마](#커스텀-스키마)
  - [스키마 메서드](#스키마-메서드)
    - [`.parse`](#parse)
    - [`.parseAsync`](#parseasync)
    - [`.safeParse`](#safeparse)
    - [`.safeParseAsync`](#safeparseasync)
    - [`.refine`](#refine)
      - [인자](#인자)
      - [에러 경로 커스텀하기](#에러-경로-커스텀하기)
      - [비동기 정제(Refinements)](#비동기-정제refinements)
      - [transform과 refine의 관계](#transform과-refine의-관계)
    - [`.superRefine`](#superrefine)
      - [조기 중단](#조기-중단)
      - [타입 정제](#타입-정제)
    - [`.transform`](#transform)
      - [체이닝 순서](#체이닝-순서)
      - [변환 중에 유효성 검사하기](#변환-중에-유효성-검사하기)
      - [변환과 정제의 관계](#변환과-정제의-관계)
      - [비동기 변환(Async Transforms)](#비동기-변환async-transforms)
    - [`.default`](#default)
    - [`.describe`](#describe)
    - [`.catch`](#catch)
    - [`.optional`](#optional)
    - [`.nullable`](#nullable)
    - [`.nullish`](#nullish)
    - [`.array()`](#array)
    - [`.promise`](#promise)
    - [`.or`](#or)
    - [`.and`](#and)
    - [`.brand`](#brand)
    - [`.readonly`](#readonly)
    - [`.pipe`](#pipe)
      - [`.pipe()`를 사용하여 `z.coerce`의 일반적인 문제를 해결할 수 있습니다.](#pipe를-사용하여-zcoerce의-일반적인-문제를-해결할-수-있습니다)
  - [Guides and concepts](#guides-and-concepts)
    - [타입 추론](#타입-추론)
    - [제네릭 함수 작성하기](#제네릭-함수-작성하기)
      - [추론된 타입 유추하기](#추론된-타입-유추하기)
      - [허용 가능한 입력 제한하기](#허용-가능한-입력-제한하기)
    - [에러 처리](#에러-처리)
    - [에러 포맷팅](#에러-포맷팅)
  - [비교](#비교)
    - [Joi](#joi)
    - [Yup](#yup)
    - [io-ts](#io-ts)
    - [Runtypes](#runtypes)
    - [Ow](#ow)
  - [변경 내역](#변경-내역)

## 소개

Zod는 TypeScript를 우선으로 하는 스키마 선언 및 검증 라이브러리입니다. 여기서 "스키마"라는 용어는 단순한 `string`부터 복잡한 중첩 객체까지 모든 데이터 타입을 포괄적으로 의미합니다.

Zod는 개발자 친화적으로 설계되었습니다. 목표는 중복된 타입 선언을 없애는 것입니다. Zod를 사용하면 검증기를 **한 번만** 선언하면, Zod가 자동으로 정적 TypeScript 타입을 추론합니다. 간단한 타입을 복잡한 데이터 구조로 합성하기도 쉽습니다.

Zod의 주요 특징은 다음과 같습니다:

- **의존성 없음**: 외부 라이브러리에 의존하지 않습니다.
- **범용성**: Node.js와 모든 최신 브라우저에서 동작합니다.
- **경량화**: 압축 후 8KB로 매우 작습니다.
- **불변성**: `.optional()`과 같은 메서드는 새로운 인스턴스를 반환합니다.
- **간결한 체인 인터페이스**: 메서드 체이닝을 통해 코드를 간결하게 작성할 수 있습니다.
- **함수형 접근**: ["검증하지 말고 파싱하라"](https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/) 철학을 따릅니다.
- **JavaScript 지원**: TypeScript를 사용하지 않아도 됩니다. 일반 JavaScript에서도 동작합니다.

## 스폰서

어떤 수준의 스폰서십도 환영하며 권장합니다. Zod를 사용해 유료 제품을 개발했다면, [기업용 티어](https://github.com/sponsors/colinhacks) 중 하나를 고려해 보세요.

<br/>
<h3 align="center">다이아몬드</h3>

<br/>

<div align="center">
  <a href="https://go.clerk.com/PKHrcwh">
    <picture width="100%">
      <source media="(prefers-color-scheme: dark)" srcset="https://github.com/colinhacks/zod/assets/3084745/15c8c8be-189d-44ed-b3db-59bf2a21cbe3">
      <img alt="clerk 로고" src="https://github.com/colinhacks/zod/assets/3084745/15c8c8be-189d-44ed-b3db-59bf2a21cbe3">
    </picture>
  </a>
  <br/>
  <br/>
  <p>
    가장 포괄적인 사용자 관리 플랫폼
    <br/>
    <a style="text-decoration:none;" href="https://go.clerk.com/PKHrcwh" target="_blank">clerk.com</a>
  </p>
</div>

<br/>
<br/>

<h3 align="center">플래티넘</h3>

<table align="center" style="justify-content: center;align-items: center;display: flex;">
  <tr>
    <td align="center">
      <p></p>
      <p>
      <a href="https://liblab.com/?utm_source=zod">
        <picture height="62px">
          <source media="(prefers-color-scheme: dark)" srcset="https://github.com/user-attachments/assets/34dfa1a2-ce94-46f4-8902-fbfac3e1a9bc">
          <img alt="LibLab" height="62px" src="https://github.com/user-attachments/assets/3de0b617-5137-49c4-b72d-a033cbe602d8">
        </picture>
      </a>
      <br  />   
      API를 위한 더 나은 SDK 생성
      <br/>
      <a href="https://liblab.com/?utm_source=zod" style="text-decoration:none;">liblab.com</a>
      </p>
      <p></p>
    </td>
  </tr>
  <tr>
    <td align="center">
      <p></p>
      <p>
      <a href="https://neon.tech">
        <picture height="68px">
          <source media="(prefers-color-scheme: dark)" srcset="https://github.com/user-attachments/assets/83b4b1b1-a9ab-4ae5-a632-56d282f0c444">
          <img alt="Neon" height="68px" src="https://github.com/user-attachments/assets/b5799fc8-81ff-4053-a1c3-b29adf85e7a1">
        </picture>
      </a>
      <br  />   
      서버리스 Postgres — 더 빠르게 배포
      <br/>
      <a href="https://neon.tech" style="text-decoration:none;">neon.tech</a>
      </p>
      <p></p>
    </td>
  </tr>
  <tr>
    <td align="center">
      <p></p>
      <p>
      <a href="https://retool.com/?utm_source=github&utm_medium=referral&utm_campaign=zod">
        <picture height="45px">
          <source media="(prefers-color-scheme: dark)" srcset="https://github.com/colinhacks/zod/assets/3084745/ac65013f-aeb4-48dd-a2ee-41040b69cbe6">
          <img alt="stainless" height="45px" src="https://github.com/colinhacks/zod/assets/3084745/5ef4c11b-efeb-4495-90a8-41b83f798600">
        </picture>
      </a>
      <br  />   
      <a href="https://retool.com/products/ai?utm_source=github&utm_medium=referral&utm_campaign=zod">Retool AI</a>로 AI 앱과 워크플로우 구축
      <br/>
      <a href="https://retool.com/?utm_source=github&utm_medium=referral&utm_campaign=zod" style="text-decoration:none;">retool.com</a>
      </p>
      <p></p>
    </td>
  </tr>
  <tr>
    <td align="center">
      <p></p>
      <p>
      <a href="https://stainlessapi.com">
        <picture height="45px">
          <source media="(prefers-color-scheme: dark)" srcset="https://github.com/colinhacks/zod/assets/3084745/f20759c1-3e51-49d0-a31e-bbc43abec665">
          <img alt="stainless" height="45px" src="https://github.com/colinhacks/zod/assets/3084745/e9444e44-d991-4bba-a697-dbcfad608e47">
        </picture>
      </a>
      <br  />   
      최고 수준의 SDK 생성
      <br/>
      <a href="https://stainlessapi.com" style="text-decoration:none;">stainlessapi.com</a>
      </p>
      <p></p>
    </td>
  </tr>
  <tr>
    <td align="center">
      <p></p>
      <p>
      <a href="https://speakeasy.com/?utm_source=zod+docs">
        <picture height="40px">
          <source media="(prefers-color-scheme: dark)" srcset="https://github.com/colinhacks/zod/assets/3084745/b1d86601-c7fb-483c-9927-5dc24ce8b737">
          <img alt="speakeasy" height="40px" src="https://github.com/colinhacks/zod/assets/3084745/647524a4-22bb-4199-be70-404207a5a2b5">
        </picture>
      </a>
      <br  />   
      API를 위한 SDK 및 Terraform 프로바이더
      <br/>
      <a href="https://speakeasy.com/?utm_source=zod+docs" style="text-decoration:none;">speakeasy.com</a>
      </p>
      <p></p>
    </td>
  </tr>
</table>

<br/>

<h3 align="center">골드</h3>

<table align="center" style="justify-content: center;align-items: center;display: flex;">
  <tr>
    <td align="center">
      <img src="https://avatars.githubusercontent.com/u/89474619?s=200&v=4" height="50px;" alt="PropelAuth" />
      <br />
      <a style="text-decoration:none;" href="https://www.propelauth.com/" target="_blank">PropelAuth</a>
    </td>
    <td align="center">
      <img src="https://avatars.githubusercontent.com/u/80861386?s=200&v=4" height="50px;" alt="Cerbos" />
      <br />
      <a style="text-decoration:none;" href="https://cerbos.dev/" target="_blank">Cerbos</a>
    </td>
    <td align="center">
      <img src="https://avatars.githubusercontent.com/u/301879?s=200&v=4" height="50px;" alt="Scalar.com 로고" />
      <br />
      <a style="text-decoration:none;" href="https://scalar.com/" target="_blank">Scalar</a>
    </td>
    <td align="center">
      <img src="https://avatars.githubusercontent.com/u/95297378?s=200&v=4" height="50px;" alt="Trigger.dev 로고" />
      <br />
      <a style="text-decoration:none;" href="https://trigger.dev" target="_blank">Trigger.dev</a>
    </td>
    </tr><tr>
    <td align="center">
      <img src="https://avatars.githubusercontent.com/u/125754?s=200&v=4" height="50px;" alt="Transloadit 로고" />
      <br />
      <a style="text-decoration:none;" href="https://transloadit.com/?utm_source=zod&utm_medium=refe
    rral&utm_campaign=sponsorship&utm_content=github" target="_blank">Transloadit</a>
    </td>
    <td align="center">
      <img src="https://avatars.githubusercontent.com/u/107880645?s=200&v=4" height="50px;" alt="Infisical 로고" />
      <br />
      <a style="text-decoration:none;" href="https://infisical.com" target="_blank">Infisical</a>
    </td>
    <td align="center">
      <img src="https://avatars.githubusercontent.com/u/91036480?s=200&v=4" height="50px;" alt="Whop 로고" />
      <br />
      <a style="text-decoration:none;" href="https://whop.com/" target="_blank">Whop</a>
    </td>
    <td align="center">
      <img src="https://avatars.githubusercontent.com/u/36402888?s=200&v=4" height="50px;" alt="CryptoJobsList 로고" />
      <br />
      <a style="text-decoration:none;" href="https://cryptojobslist.com/" target="_blank">CryptoJobsList</a>
    </td>
    </tr><tr>
    <td align="center">
      <img src="https://avatars.githubusercontent.com/u/70170949?s=200&v=4" height="50px;" alt="Plain 로고" />
      <br />
      <a style="text-decoration:none;" href="https://plain.com/" target="_blank">Plain.</a>
    </td>
    <td align="center">
      <img src="https://avatars.githubusercontent.com/u/78935958?s=200&v=4" height="50px;" alt="Inngest 로고" />
      <br />
      <a style="text-decoration:none;" href="https://inngest.com/" target="_blank">Inngest</a>
    </td>
    <td align="center">
      <img src="https://avatars.githubusercontent.com/u/13880908?s=200&v=4" height="50px;" alt="Storyblok CMS" />
      <br />
      <a style="text-decoration:none;" href="https://storyblok.com/" target="_blank">Storyblok</a>
    </td>
    <td align="center">
      <img src="https://avatars.githubusercontent.com/u/16199997?s=200&v=4" height="50px;" alt="Mux 로고" />
      <br />
      <a style="text-decoration:none;" href="https://mux.link/zod" target="_blank">Mux</a>
    </td>
  </tr>
</table>

<br/>

<h3 align="center">실버</h3>

<table align="center" style="justify-content: center;align-items: center;display: flex;">
  <tr>
    <td align="center">
      <a href="https://www.val.town/">
        <picture width="100%" height="40px">
          <source media="(prefers-color-scheme: dark)" srcset="https://github.com/user-attachments/assets/36961d2e-d92e-42af-9031-a41885ece5f4">
          <img alt="val town 로고" src="https://github.com/user-attachments/assets/95305fc4-4da6-4bf8-aea4-bae8f5893e5d" height="40px">
        </picture>
      </a>
    </td>
    <td align="center">
      <a href="https://www.route4me.com/">
        <img src="https://avatars.githubusercontent.com/u/7936820?s=200&v=4" height="40px;" alt="route4me 로고" />
      </a>
    </td>
    <td align="center">
      <a href="https://encore.dev">
        <img src="https://github.com/colinhacks/zod/assets/3084745/5ad94e73-cd34-4957-9979-37da85fcf9cd" height="40px;" alt="Encore.dev 로고" />
      </a>
    </td>
    <td align="center">
      <a href="https://www.replay.io/">
        <img src="https://avatars.githubusercontent.com/u/60818315?s=200&v=4" height="40px;" alt="Replay.io 로고" />
      </a>
    </td>
  </tr>
  <tr>
    <td align="center">
      <a href="https://www.numeric.io">
        <img src="https://i.imgur.com/kTiLtZt.png" height="40px;" alt="Numeric 로고" />
      </a>
    </td>
    <td align="center">
      <a href="https://marcatopartners.com">
        <img src="https://avatars.githubusercontent.com/u/84106192?s=200&v=4" height="40px;" alt="Marcato Partners" />
      </a>
    </td>
    <td align="center">
      <a href="https://interval.com">
        <img src="https://avatars.githubusercontent.com/u/67802063?s=200&v=4" height="40px;" alt="" />
      </a>
    </td>
    <td align="center">
      <a href="https://seasoned.cc">
        <img src="https://avatars.githubusercontent.com/u/33913103?s=200&v=4" height="40px;" alt="" />
      </a>
    </td>
  </tr>
  <tr>
    <td align="center">
      <a href="https://www.bamboocreative.nz/">
        <img src="https://avatars.githubusercontent.com/u/41406870?v=4" height="40px;" alt="Bamboo Creative 로고" />
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/jasonLaster">
        <img src="https://avatars.githubusercontent.com/u/254562?v=4" height="40px;" alt="Jason Laster" />
      </a>
    </td>
  </tr>
</table>

<h3 align="center">브론즈</h3>

<table align="center" style="justify-content: center;align-items: center;display: flex;">
  <tr>
    <td>Brandon Bayer</td>
    <td>Jiří Brabec</td>
    <td>Alex Johansson</td>
    <td>Fungible Systems</td>
  </tr>
  <tr>
    <td>Adaptable</td>
    <td>Avana Wallet</td>
    <td>Jason Lengstorf</td>
    <td>Global Illumination, Inc.</td>
  </tr>
  <tr>
    <td>MasterBorn</td>
    <td>Ryan Palmer</td>
    <td>Michael Sweeney</td>
    <td>Nextbase</td>
  </tr>
  <tr>
    <td>Remotion</td>
    <td>Connor Sinnott</td>
    <td>Mohammad-Ali A'râbi</td>
    <td>Supatool</td>
  </tr>
</table>

### 생태계

Zod를 기반으로 구축되거나 Zod를 기본적으로 지원하는 도구들이 점점 늘어나고 있습니다! 여러분이 Zod를 기반으로 도구나 라이브러리를 만들었다면, [트위터](https://twitter.com/colinhacks)로 알려주거나 [GitHub Discussions](https://github.com/colinhacks/zod/discussions)에 글을 남겨주세요. 아래에 추가하고 트윗으로 알리겠습니다.

#### 리소스

- [Total TypeScript Zod 튜토리얼](https://www.totaltypescript.com/tutorials/zod) by [@mattpocockuk](https://twitter.com/mattpocockuk)
- [TypeScript의 약점 해결: 런타임 타입 체크](https://www.youtube.com/watch?v=rY_XqfSHock) by [@jherr](https://twitter.com/jherr)

#### API 라이브러리

- [`tRPC`](https://github.com/trpc/trpc): GraphQL 없이도 타입 안전한 API를 구축할 수 있는 라이브러리.
- [`@anatine/zod-nestjs`](https://github.com/anatine/zod-plugins/tree/main/packages/zod-nestjs): NestJS 프로젝트에서 Zod를 사용하기 위한 헬퍼 메서드 제공.
- [`zod-endpoints`](https://github.com/flock-community/zod-endpoints): Zod를 사용해 엄격하게 타입이 지정된 엔드포인트를 구축. OpenAPI와 호환.
- [`zhttp`](https://github.com/evertdespiegeleer/zhttp): OpenAPI 호환, 엄격한 타입 지정 HTTP 라이브러리. Zod를 사용한 입력 및 응답 검증 지원.
- [`domain-functions`](https://github.com/SeasonedSoftware/domain-functions/): 비즈니스 로직을 프레임워크와 분리할 수 있는 합성 가능한 함수 제공. Zod 스키마를 통해 타입 추론을 퍼스트클래스로 지원.
- [`@zodios/core`](https://github.com/ecyrbe/zodios): axios와 Zod를 기반으로 한 타입스크립트 API 클라이언트. 런타임 및 컴파일 타임 검증 지원.
- [`express-zod-api`](https://github.com/RobinTail/express-zod-api): Express 기반 API를 구축할 때 I/O 스키마 검증과 커스텀 미들웨어를 제공.
- [`tapiduck`](https://github.com/sumukhbarve/monoduck/blob/main/src/tapiduck/README.md): Zod와 Express를 사용한 엔드투엔드 타입 안전 JSON API. tRPC와 유사하지만 더 간단한 구조.
- [`koa-zod-router`](https://github.com/JakeFenley/koa-zod-router): Koa에서 Zod를 사용해 I/O 검증이 포함된 타입 안전한 라우트 생성.
- [`zod-sockets`](https://github.com/RobinTail/zod-sockets): Zod 기반 Socket.IO 마이크로프레임워크. I/O 검증과 내장 AsyncAPI 스펙 지원.
- [`oas-tszod-gen`](https://github.com/inkognitro/oas-tszod-gen): OpenAPI v3 스펙을 Zod 타입이 포함된 TS 엔드포인트 호출 함수로 변환하는 클라이언트 SDK 코드 생성기.
- [`GQLoom`](https://github.com/modevol-com/gqloom): Zod를 사용하여 GraphQL 스키마와 리졸버를 엮습니다.

#### 폼 통합 라이브러리

- [`react-hook-form`](https://github.com/react-hook-form/resolvers#zod): React Hook Form을 위한 공식 Zod 리졸버입니다.
- [`zod-validation-error`](https://github.com/causaly/zod-validation-error): `ZodError`에서 사용자 친화적인 오류 메시지를 생성합니다.
- [`zod-formik-adapter`](https://github.com/robertLichtnow/zod-formik-adapter): 커뮤니티에서 관리되는 Formik용 Zod 어댑터입니다.
- [`react-zorm`](https://github.com/esamattis/react-zorm): Zod를 사용하여 React에서 독립적인 `<form>` 생성 및 검증을 제공합니다.
- [`zodix`](https://github.com/rileytomasek/zodix): Remix 로더와 액션에서 FormData 및 URLSearchParams를 위한 Zod 유틸리티입니다.
- [`conform`](https://conform.guide/api/zod/parseWithZod): HTML 폼의 점진적 향상을 위한 타입 안전한 폼 검증 라이브러리입니다. Remix와 Next.js에서 사용 가능합니다.
- [`remix-params-helper`](https://github.com/kiliman/remix-params-helper): Remix 앱에서 Zod와 표준 URLSearchParams 및 FormData 통합을 단순화합니다.
- [`formik-validator-zod`](https://github.com/glazy/formik-validator-zod): Formik과 호환되는 검증 라이브러리로, Zod를 Formik과 함께 사용하기 쉽게 해줍니다.
- [`zod-i18n-map`](https://github.com/aiji42/zod-i18n): Zod 오류 메시지를 번역하는 데 유용합니다.
- [`@modular-forms/solid`](https://github.com/fabian-hiller/modular-forms): SolidJS를 위한 모듈식 폼 라이브러리로, Zod를 검증에 사용합니다.
- [`houseform`](https://github.com/crutchcorn/houseform/): Zod를 검증에 사용하는 React 폼 라이브러리입니다.
- [`sveltekit-superforms`](https://github.com/ciscoheat/sveltekit-superforms): SvelteKit을 위한 강력한 폼 라이브러리로, Zod 검증을 지원합니다.
- [`mobx-zod-form`](https://github.com/MonoidDev/mobx-zod-form): MobX와 Zod를 기반으로 한 데이터 중심 폼 빌더입니다.
- [`@vee-validate/zod`](https://github.com/logaretm/vee-validate/tree/main/packages/zod): Vue.js를 위한 폼 라이브러리로, Zod 스키마 검증을 지원합니다.
- [`zod-form-renderer`](https://github.com/thepeaklab/zod-form-renderer): Zod 스키마에서 폼 필드를 자동으로 추론하고, react-hook-form을 사용하여 E2E 타입 안전성을 보장합니다.
- [`antd-zod`](https://github.com/MrBr/antd-zod): Ant Design 폼 필드 검증을 위한 Zod 어댑터입니다.
- [`frrm`](https://github.com/schalkventer/frrm): 0.5kb 크기의 Zod 기반 HTML 폼 추상화 라이브러리입니다.

#### Zod를 활용한 다양한 도구들

- **[`zod-to-ts`](https://github.com/sachinraja/zod-to-ts)**: Zod 스키마를 TypeScript 타입 정의로 변환해주는 도구입니다.
- **[`zod-to-json-schema`](https://github.com/StefanTerdell/zod-to-json-schema)**: Zod 스키마를 [JSON 스키마](https://json-schema.org/)로 변환합니다.
- **[`@anatine/zod-openapi`](https://github.com/anatine/zod-plugins/tree/main/packages/zod-openapi)**: Zod 스키마를 OpenAPI v3.x `SchemaObject`로 변환합니다.
- **[`zod-fast-check`](https://github.com/DavidTimms/zod-fast-check)**: Zod 스키마를 기반으로 `fast-check`의 임의 데이터 생성기를 만듭니다.
- **[`zod-dto`](https://github.com/kbkk/abitia/tree/main/packages/zod-dto)**: Zod 스키마를 Nest.js의 DTO(Data Transfer Object)로 변환합니다.
- **[`fastify-type-provider-zod`](https://github.com/turkerdev/fastify-type-provider-zod)**: Zod 스키마를 사용해 Fastify의 타입 프로바이더를 생성합니다.
- **[`zod-to-openapi`](https://github.com/asteasolutions/zod-to-openapi)**: Zod 스키마를 기반으로 OpenAPI(Swagger) 문서를 생성합니다. 스키마, 엔드포인트, 파라미터 등을 포함합니다.
- **[`nestjs-graphql-zod`](https://github.com/incetarik/nestjs-graphql-zod)**: Zod 스키마를 NestJS GraphQL 모델 클래스로 변환합니다. Zod 스키마와 함께 작동하는 GraphQL 메서드 데코레이터를 제공합니다.
- **[`zod-openapi`](https://github.com/samchungy/zod-openapi)**: Zod 스키마를 사용해 완전한 OpenAPI v3.x 문서를 생성합니다.
- **[`fastify-zod-openapi`](https://github.com/samchungy/fastify-zod-openapi)**: Fastify 타입 프로바이더, 유효성 검사, 직렬화 및 `@fastify/swagger` 지원을 Zod 스키마와 함께 제공합니다.
- **[`typeschema`](https://typeschema.com/)**: 스키마 유효성 검사를 위한 범용 어댑터입니다.
- **[`zodex`](https://github.com/commonbaseapp/zodex)**: Zod 스키마의 (역)직렬화를 지원합니다.

이 도구들은 Zod 스키마를 다양한 형식으로 변환하거나 다른 프레임워크와 통합하는 데 유용하게 사용할 수 있습니다.

#### X to Zod

- [`ts-to-zod`](https://github.com/fabien0102/ts-to-zod): TypeScript 정의를 Zod 스키마로 변환합니다.
- [`@runtyping/zod`](https://github.com/johngeorgewright/runtyping/tree/main/packages/zod): 정적 타입과 JSON 스키마에서 Zod를 생성합니다.
- [`json-schema-to-zod`](https://github.com/StefanTerdell/json-schema-to-zod): [JSON 스키마](https://json-schema.org/)를 Zod 스키마로 변환합니다. [라이브 데모](https://StefanTerdell.github.io/json-schema-to-zod-react/).
- [`json-to-zod`](https://github.com/rsinohara/json-to-zod): JSON 객체를 Zod 스키마로 변환합니다. [라이브 데모](https://rsinohara.github.io/json-to-zod-react/).
- [`graphql-codegen-typescript-validation-schema`](https://github.com/Code-Hex/graphql-codegen-typescript-validation-schema): GraphQL 스키마에서 폼 검증 스키마를 생성하는 GraphQL Code Generator 플러그인입니다.
- [`zod-prisma`](https://github.com/CarterGrimmeisen/zod-prisma): Prisma 스키마에서 Zod 스키마를 생성합니다.
- [`Supervillain`](https://github.com/Southclaws/supervillain): Go 구조체에서 Zod 스키마를 생성합니다.
- [`prisma-zod-generator`](https://github.com/omar-dulaimi/prisma-zod-generator): Prisma 스키마에서 Zod 스키마를 생성합니다.
- [`drizzle-zod`](https://orm.drizzle.team/docs/zod): Drizzle 스키마에서 Zod 스키마를 생성합니다.
- [`prisma-trpc-generator`](https://github.com/omar-dulaimi/prisma-trpc-generator): Zod를 사용하여 완전히 구현된 tRPC 라우터와 검증 스키마를 생성합니다.
- [`zod-prisma-types`](https://github.com/chrishoermann/zod-prisma-types): Prisma 모델에서 Zod 타입을 생성합니다.
- [`quicktype`](https://app.quicktype.io/): JSON 객체와 JSON 스키마를 Zod 스키마로 변환합니다.
- [`@sanity-typed/zod`](https://github.com/saiichihashimoto/sanity-typed/tree/main/packages/zod): [Sanity 스키마](https://www.sanity.io/docs/schema-types)에서 Zod 스키마를 생성합니다.
- [`java-to-zod`](https://github.com/ivangreene/java-to-zod): POJO를 Zod 스키마로 변환합니다.
- [`Orval`](https://github.com/anymaniax/orval): OpenAPI 스키마에서 Zod 스키마를 생성합니다.
- [`Kubb`](https://github.com/kubb-labs/kubb): OpenAPI 스키마에서 SDK와 Zod 스키마를 생성합니다.

#### 목킹(Mocking)

- [`@anatine/zod-mock`](https://github.com/anatine/zod-plugins/tree/main/packages/zod-mock): Zod 스키마에서 목 데이터를 생성합니다. [faker.js](https://github.com/faker-js/faker)를 기반으로 동작합니다.
- [`zod-mocking`](https://github.com/dipasqualew/zod-mocking): Zod 스키마를 사용해 목 데이터를 생성합니다.
- [`zod-fixture`](https://github.com/timdeschryver/zod-fixture): Zod 스키마를 활용해 테스트용 픽스처를 결정론적인 방식으로 자동 생성합니다.
- [`zocker`](https://zocker.sigrist.dev): 스키마를 기반으로 실제와 유사한 목 데이터를 생성합니다.
- [`zodock`](https://github.com/ItMaga/zodock): Zod 스키마를 기반으로 목 데이터를 생성합니다.
- [`zod-schema-faker`](https://github.com/soc221b/zod-schema-faker): Zod 스키마에서 목 데이터를 생성합니다. [@faker-js/faker](https://github.com/faker-js/faker)와 [randexp.js](https://github.com/fent/randexp.js)를 사용합니다.

#### Zod로 구동되는 프로젝트들

- [`freerstore`](https://github.com/JacobWeisenburger/freerstore): Firestore 비용 최적화 도구.
- [`slonik`](https://github.com/gajus/slonik/tree/gajus/add-zod-validation-backwards-compatible#runtime-validation-and-static-type-inference): 강력한 Zod 통합을 지원하는 Node.js Postgres 클라이언트.
- [`schemql`](https://github.com/a2lix/schemql): 원시 SQL에 타입 안전성과 스키마 검증을 결합하여 SQL 워크플로우를 강화.
- [`soly`](https://github.com/mdbetancourt/soly): Zod를 사용하여 CLI 애플리케이션 생성.
- [`pastel`](https://github.com/vadimdemedes/pastel): React, Zod, Ink를 사용하여 CLI 애플리케이션 생성.
- [`zod-xlsx`](https://github.com/sidwebworks/zod-xlsx): Zod 스키마를 사용한 XLSX 기반 리소스 검증 도구.
- [`znv`](https://github.com/lostfictions/znv): Zod 스키마를 사용한 Node.js 환경 변수의 타입 안전한 파싱 및 검증.
- [`zod-config`](https://github.com/alexmarqs/zod-config): 유연한 어댑터를 통해 여러 소스에서 설정을 로드하고 Zod를 사용해 타입 안전성 보장.
- [`unplugin-environment`](https://github.com/r17x/js/tree/main/packages/unplugin-environment#readme): 스키마 검증을 통해 안전하게 환경 변수를 로드하는 플러그인. 가상 모듈을 사용해 간단하고, 인텔리센스를 통해 타입 안전성을 제공하며, 더 나은 개발자 경험(DX)을 제공. Zod로 구동.

#### Zod 유틸리티 모음

- [`zod_utilz`](https://github.com/JacobWeisenburger/zod_utilz): 프레임워크에 구애받지 않는 Zod 유틸리티 모음.
- [`zod-playground`](https://github.com/marilari88/zod-playground): Zod 스키마 검증 기능을 학습하고 테스트할 수 있는 도구. [링크](https://zod-playground.vercel.app/).
- [`zod-sandbox`](https://github.com/nereumelo/zod-sandbox): Zod 스키마를 테스트하기 위한 제어된 환경. [라이브 데모](https://zod-sandbox.vercel.app/).
- [`zod-dev`](https://github.com/schalkventer/zod-dev): 프로덕션 환경에서 Zod 런타임 파싱을 조건부로 비활성화.
- [`zod-accelerator`](https://github.com/duplojs/duplojs-zod-accelerator): Zod의 처리 속도를 최대 ~100배까지 가속.

## 설치

### 요구사항

- **TypeScript 4.5 이상**이 필요합니다!
- `tsconfig.json`에서 `strict` 모드를 활성화해야 합니다. 이는 모든 TypeScript 프로젝트에서 권장되는 모범 사례입니다.

  ```ts
  // tsconfig.json
  {
    // ...
    "compilerOptions": {
      // ...
      "strict": true
    }
  }
  ```

### `npm`에서 설치하기

```sh
npm install zod       # npm
deno add npm:zod      # deno
yarn add zod          # yarn
bun add zod           # bun
pnpm add zod          # pnpm
```

Zod는 모든 커밋마다 카나리(canary) 버전도 배포합니다. 카나리 버전을 설치하려면:

```sh
npm install zod@canary       # npm
deno add npm:zod@canary      # deno
yarn add zod@canary          # yarn
bun add zod@canary           # bun
pnpm add zod@canary          # pnpm
```

> 이 README의 나머지 부분은 여러분이 npm을 사용하고 `"zod"` 패키지에서 직접 임포트한다고 가정합니다.

## 기본 사용법

### 간단한 문자열 스키마 생성하기

```ts
import { z } from "zod";

// 문자열을 위한 스키마 생성
const mySchema = z.string();

// 파싱
mySchema.parse("tuna"); // => "tuna"
mySchema.parse(12); // => ZodError 발생

// "안전한" 파싱 (검증 실패 시 에러를 던지지 않음)
mySchema.safeParse("tuna"); // => { success: true; data: "tuna" }
mySchema.safeParse(12); // => { success: false; error: ZodError }
```

### 객체 스키마 생성하기

```ts
import { z } from "zod";

const User = z.object({
  username: z.string(),
});

User.parse({ username: "Ludwig" });

// 추론된 타입 추출
type User = z.infer<typeof User>;
// { username: string }
```

## 기본 타입(Primitives)

```ts
import { z } from "zod";

// 기본 값
z.string();
z.number();
z.bigint();
z.boolean();
z.date();
z.symbol();

// 빈 타입
z.undefined();
z.null();
z.void(); // undefined를 허용

// 모든 타입 허용
// 어떤 값이든 허용
z.any();
z.unknown();

// never 타입
// 어떤 값도 허용하지 않음
z.never();
```

## 기본 타입 강제 변환(Coercion)

Zod는 이제 기본 타입 값을 더 편리하게 강제 변환할 수 있는 방법을 제공합니다.

```ts
const schema = z.coerce.string();
schema.parse("tuna"); // => "tuna"
schema.parse(12); // => "12"
```

파싱 단계에서 입력값은 `String()` 함수를 통해 전달됩니다. 이 함수는 데이터를 문자열로 강제 변환하는 자바스크립트 내장 함수입니다.

```ts
schema.parse(12); // => "12"
schema.parse(true); // => "true"
schema.parse(undefined); // => "undefined"
schema.parse(null); // => "null"
```

반환된 스키마는 일반적인 `ZodString` 인스턴스이므로 모든 문자열 메서드를 사용할 수 있습니다.

```ts
z.coerce.string().email().min(5);
```

**강제 변환 작동 방식**

모든 기본 타입은 강제 변환을 지원합니다. Zod는 내장 생성자를 사용하여 모든 입력값을 강제 변환합니다: `String(input)`, `Number(input)`, `new Date(input)` 등.

```ts
z.coerce.string(); // String(input)
z.coerce.number(); // Number(input)
z.coerce.boolean(); // Boolean(input)
z.coerce.bigint(); // BigInt(input)
z.coerce.date(); // new Date(input)
```

**주의** — `z.coerce.boolean()`을 사용한 불리언 강제 변환은 예상과 다르게 동작할 수 있습니다. 모든 [truthy](https://developer.mozilla.org/en-US/docs/Glossary/Truthy) 값은 `true`로 변환되고, 모든 [falsy](https://developer.mozilla.org/en-US/docs/Glossary/Falsy) 값은 `false`로 변환됩니다.

```ts
const schema = z.coerce.boolean(); // Boolean(input)

schema.parse("tuna"); // => true
schema.parse("true"); // => true
schema.parse("false"); // => true
schema.parse(1); // => true
schema.parse([]); // => true

schema.parse(0); // => false
schema.parse(""); // => false
schema.parse(undefined); // => false
schema.parse(null); // => false
```

강제 변환 로직을 더 세밀하게 제어하려면 [`z.preprocess`](#전처리preprocess) 또는 [`z.pipe()`](#pipe)를 사용하는 것을 고려해보세요.

## 리터럴(Literals)

리터럴 스키마는 `"hello world"`나 `5`와 같은 [리터럴 타입](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#literal-types)을 나타냅니다.

```ts
const tuna = z.literal("tuna");
const twelve = z.literal(12);
const twobig = z.literal(2n); // bigint 리터럴
const tru = z.literal(true);

const terrificSymbol = Symbol("terrific");
const terrific = z.literal(terrificSymbol);

// 리터럴 값 가져오기
tuna.value; // "tuna"
```

> 현재 Zod에서는 Date 리터럴을 지원하지 않습니다. 이 기능이 필요한 경우 이슈를 등록해 주세요.

## 문자열

Zod는 문자열에 특화된 여러 가지 유효성 검사를 제공합니다.

```ts
// 유효성 검사
z.string().max(5); // 최대 5자
z.string().min(5); // 최소 5자
z.string().length(5); // 정확히 5자
z.string().email(); // 이메일 형식
z.string().url(); // URL 형식
z.string().emoji(); // 이모지 포함
z.string().uuid(); // UUID 형식
z.string().nanoid(); // Nano ID 형식
z.string().cuid(); // CUID 형식
z.string().cuid2(); // CUID2 형식
z.string().ulid(); // ULID 형식
z.string().regex(regex); // 정규식 검사
z.string().includes(string); // 특정 문자열 포함
z.string().startsWith(string); // 특정 문자열로 시작
z.string().endsWith(string); // 특정 문자열로 끝남
z.string().datetime(); // ISO 8601 형식 (기본적으로 'Z' 시간대만 허용)
z.string().ip(); // IPv4 및 IPv6 허용 (기본값)
z.string().cidr(); // IPv4 및 IPv6 CIDR 허용 (기본값)
z.string().creditCard();
// 변환
z.string().trim(); // 공백 제거
z.string().toLowerCase(); // 소문자로 변환
z.string().toUpperCase(); // 대문자로 변환

// Zod 3.23에서 추가됨
z.string().date(); // ISO 날짜 형식 (YYYY-MM-DD)
z.string().time(); // ISO 시간 형식 (HH:mm:ss[.SSSSSS])
z.string().duration(); // ISO 8601 기간 형식
z.string().base64(); // Base64 형식
```

> [Refinements](#refine)와 함께 사용할 수 있는 다양한 유용한 문자열 유효성 검사 함수는 [validator.js](https://github.com/validatorjs/validator.js)에서 확인할 수 있습니다.

문자열 스키마를 생성할 때 일반적인 오류 메시지를 커스터마이징할 수 있습니다.

```ts
const name = z.string({
  required_error: "이름은 필수입니다",
  invalid_type_error: "이름은 문자열이어야 합니다",
});
```

유효성 검사 메서드를 사용할 때, 추가 인자로 커스텀 오류 메시지를 제공할 수 있습니다.

```ts
z.string().min(5, { message: "5자 이상이어야 합니다" });
z.string().max(5, { message: "5자 이하여야 합니다" });
z.string().length(5, { message: "정확히 5자여야 합니다" });
z.string().email({ message: "유효하지 않은 이메일 주소입니다" });
z.string().url({ message: "유효하지 않은 URL입니다" });
z.string().emoji({ message: "이모지가 아닌 문자가 포함되어 있습니다" });
z.string().uuid({ message: "유효하지 않은 UUID입니다" });
z.string().includes("tuna", { message: "'tuna'가 포함되어야 합니다" });
z.string().startsWith("https://", { message: "보안 URL이어야 합니다" });
z.string().endsWith(".com", { message: ".com 도메인만 허용됩니다" });
z.string().datetime({
  message: "유효하지 않은 날짜/시간 문자열입니다! UTC여야 합니다.",
});
z.string().date({ message: "유효하지 않은 날짜 문자열입니다!" });
z.string().time({ message: "유효하지 않은 시간 문자열입니다!" });
z.string().ip({ message: "유효하지 않은 IP 주소입니다" });
z.string().cidr({ message: "유효하지 않은 CIDR입니다" });
```

### 날짜와 시간

Zod 문자열에는 몇 가지 날짜/시간 관련 유효성 검사가 포함되어 있습니다. 이 유효성 검사는 정규 표현식을 기반으로 하기 때문에, 완전한 날짜/시간 라이브러리만큼 엄격하지는 않습니다. 하지만 사용자 입력을 검증하는 데 매우 편리합니다.

`z.string().datetime()` 메서드는 ISO 8601을 강제합니다. 기본적으로 시간대 오프셋은 허용되지 않으며, 소수점 초 단위의 임의 정밀도를 지원합니다.

```ts
const datetime = z.string().datetime();

datetime.parse("2020-01-01T00:00:00Z"); // 통과
datetime.parse("2020-01-01T00:00:00.123Z"); // 통과
datetime.parse("2020-01-01T00:00:00.123456Z"); // 통과 (임의 정밀도)
datetime.parse("2020-01-01T00:00:00+02:00"); // 실패 (오프셋 허용 안 됨)
```

`offset` 옵션을 `true`로 설정하면 시간대 오프셋을 허용할 수 있습니다.

```ts
const datetime = z.string().datetime({ offset: true });

datetime.parse("2020-01-01T00:00:00+02:00"); // 통과
datetime.parse("2020-01-01T00:00:00.123+02:00"); // 통과 (밀리초 선택적)
datetime.parse("2020-01-01T00:00:00.123+0200"); // 통과 (밀리초 선택적)
datetime.parse("2020-01-01T00:00:00.123+02"); // 통과 (시간 오프셋만)
datetime.parse("2020-01-01T00:00:00Z"); // 통과 (Z 지원)
```

`local` 플래그를 사용하면 시간대가 없는 날짜/시간을 허용할 수 있습니다.

```ts
const schema = z.string().datetime({ local: true });
schema.parse("2020-01-01T00:00:00"); // 통과
```

추가로 허용 가능한 `precision`을 제한할 수 있습니다. 기본적으로 임의의 소수점 초 단위 정밀도를 지원하지만 선택적입니다.

```ts
const datetime = z.string().datetime({ precision: 3 });

datetime.parse("2020-01-01T00:00:00.123Z"); // 통과
datetime.parse("2020-01-01T00:00:00Z"); // 실패
datetime.parse("2020-01-01T00:00:00.123456Z"); // 실패
```

### 날짜

> Zod 3.23에서 추가됨

`z.string().date()` 메서드는 `YYYY-MM-DD` 형식의 문자열을 검증합니다.

```ts
const date = z.string().date();

date.parse("2020-01-01"); // 통과
date.parse("2020-1-1"); // 실패
date.parse("2020-01-32"); // 실패
```

### 시간 형식 검증

> Zod 3.23에서 추가됨

`z.string().time()` 메서드는 `HH:MM:SS[.s+]` 형식의 문자열을 검증합니다. 초 단위는 소수점 이하 임의의 정밀도를 포함할 수 있습니다. 하지만 시간대 오프셋은 허용하지 않습니다.

```ts
const time = z.string().time();

time.parse("00:00:00"); // 통과
time.parse("09:52:31"); // 통과
time.parse("23:59:59.9999999"); // 통과 (임의의 정밀도 허용)

time.parse("00:00:00.123Z"); // 실패 (`Z` 허용 안 됨)
time.parse("00:00:00.123+02:00"); // 실패 (오프셋 허용 안 됨)
```

`precision` 옵션을 설정하여 허용 가능한 소수점 정밀도를 제한할 수 있습니다.

```ts
const time = z.string().time({ precision: 3 });

time.parse("00:00:00.123"); // 통과
time.parse("00:00:00.123456"); // 실패
time.parse("00:00:00"); // 실패
```

### IP 주소

기본적으로 `.ip()`는 IPv4와 IPv6를 모두 허용합니다.

```ts
const ip = z.string().ip();

ip.parse("192.168.1.1"); // 통과
ip.parse("84d5:51a0:9114:1855:4cfa:f2d7:1f12:7003"); // 통과
ip.parse("84d5:51a0:9114:1855:4cfa:f2d7:1f12:192.168.1.1"); // 통과

ip.parse("256.1.1.1"); // 실패
ip.parse("84d5:51a0:9114:gggg:4cfa:f2d7:1f12:7003"); // 실패
```

추가적으로 IP `version`을 설정할 수 있습니다.

```ts
const ipv4 = z.string().ip({ version: "v4" });
ipv4.parse("84d5:51a0:9114:1855:4cfa:f2d7:1f12:7003"); // 실패

const ipv6 = z.string().ip({ version: "v6" });
ipv6.parse("192.168.1.1"); // 실패
```

### IP 범위 (CIDR)

[CIDR 표기법](https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing)으로 지정된 IP 주소 범위를 검증합니다. 기본적으로 `.cidr()`은 IPv4와 IPv6를 모두 허용합니다.

```ts
const cidr = z.string().cidr();
cidr.parse("192.168.0.0/24"); // 통과
cidr.parse("2001:db8::/32"); // 통과
```

`version` 매개변수를 사용하여 특정 버전을 지정할 수 있습니다.

```ts
const ipv4Cidr = z.string().cidr({ version: "v4" });
ipv4Cidr.parse("84d5:51a0:9114:1855:4cfa:f2d7:1f12:7003"); // 실패

const ipv6Cidr = z.string().cidr({ version: "v6" });
ipv6Cidr.parse("192.168.1.1"); // 실패
```

## 숫자

숫자 스키마를 생성할 때 특정 오류 메시지를 커스텀할 수 있습니다.

```ts
const age = z.number({
  required_error: "나이는 필수입니다",
  invalid_type_error: "나이는 숫자여야 합니다",
});
```

Zod는 숫자에 특화된 여러 유효성 검사를 제공합니다.

```ts
z.number().gt(5); // 5보다 커야 함
z.number().gte(5); // 5보다 크거나 같아야 함 (.min(5)와 동일)
z.number().lt(5); // 5보다 작아야 함
z.number().lte(5); // 5보다 작거나 같아야 함 (.max(5)와 동일)

z.number().int(); // 정수여야 함

z.number().positive(); // 0보다 커야 함
z.number().nonnegative(); // 0보다 크거나 같아야 함
z.number().negative(); // 0보다 작아야 함
z.number().nonpositive(); // 0보다 작거나 같아야 함

z.number().multipleOf(5); // 5로 나누어 떨어져야 함 (.step(5)와 동일)

z.number().finite(); // 유한한 값이어야 함 (Infinity 또는 -Infinity 불가)
z.number().safe(); // Number.MIN_SAFE_INTEGER와 Number.MAX_SAFE_INTEGER 사이의 값이어야 함
```

선택적으로, 두 번째 인자로 커스텀 오류 메시지를 제공할 수 있습니다.

```ts
z.number().lte(5, { message: "이👏값은👏너무👏큽니다" });
```

## BigInts

Zod는 BigInt 타입을 위한 몇 가지 유효성 검사를 제공합니다.

```ts
z.bigint().gt(5n); // 5n보다 큰지 확인
z.bigint().gte(5n); // 5n보다 크거나 같은지 확인 (`.min(5n)`과 동일)
z.bigint().lt(5n); // 5n보다 작은지 확인
z.bigint().lte(5n); // 5n보다 작거나 같은지 확인 (`.max(5n)`과 동일)

z.bigint().positive(); // 0n보다 큰지 확인
z.bigint().nonnegative(); // 0n보다 크거나 같은지 확인
z.bigint().negative(); // 0n보다 작은지 확인
z.bigint().nonpositive(); // 0n보다 작거나 같은지 확인

z.bigint().multipleOf(5n); // 5n으로 나누어 떨어지는지 확인
```

## NaN (Not a Number)

NaN 스키마를 생성할 때 특정 오류 메시지를 커스텀할 수 있습니다.

```ts
const isNaN = z.nan({
  required_error: "isNaN은 필수입니다",
  invalid_type_error: "isNaN은 '숫자가 아님'이어야 합니다",
});
```

## 불리언(Booleans)

불리언 스키마를 생성할 때 특정 오류 메시지를 커스텀할 수 있습니다.

```ts
const isActive = z.boolean({
  required_error: "isActive는 필수 항목입니다",
  invalid_type_error: "isActive는 불리언 타입이어야 합니다",
});
```

## 날짜

`Date` 인스턴스를 검증하려면 `z.date()`를 사용하세요.

```ts
z.date().safeParse(new Date()); // 성공: true
z.date().safeParse("2022-01-12T00:00:00.000Z"); // 성공: false
```

날짜 스키마를 생성할 때 특정 오류 메시지를 커스터마이징할 수 있습니다.

```ts
const myDateSchema = z.date({
  required_error: "날짜와 시간을 선택해 주세요",
  invalid_type_error: "날짜 형식이 아닙니다!",
});
```

Zod는 몇 가지 날짜 관련 유효성 검사를 제공합니다.

```ts
z.date().min(new Date("1900-01-01"), { message: "너무 오래된 날짜입니다" });
z.date().max(new Date(), { message: "너무 미래의 날짜입니다!" });
```

**Date로 강제 변환**

[zod 3.20](https://github.com/colinhacks/zod/releases/tag/v3.20)부터는 [`z.coerce.date()`](#coercion-for-primitives)를 사용하여 입력을 `new Date(input)`로 변환할 수 있습니다.

```ts
const dateSchema = z.coerce.date();
type DateSchema = z.infer<typeof dateSchema>;
// 타입 DateSchema = Date

/* 유효한 날짜 */
console.log(dateSchema.safeParse("2023-01-10T00:00:00.000Z").success); // true
console.log(dateSchema.safeParse("2023-01-10").success); // true
console.log(dateSchema.safeParse("1/10/23").success); // true
console.log(dateSchema.safeParse(new Date("1/10/23")).success); // true

/* 유효하지 않은 날짜 */
console.log(dateSchema.safeParse("2023-13-10").success); // false
console.log(dateSchema.safeParse("0000-00-00").success); // false
```

이전 버전의 zod를 사용하는 경우, [이 스레드](https://github.com/colinhacks/zod/discussions/879#discussioncomment-2036276)에서 설명한 대로 [`z.preprocess`](#전처리preprocess)를 사용하세요.

## Zod 열거형(enum)

```ts
const FishEnum = z.enum(["Salmon", "Tuna", "Trout"]);
type FishEnum = z.infer<typeof FishEnum>;
// 'Salmon' | 'Tuna' | 'Trout'
```

`z.enum`은 Zod에서 허용 가능한 고정된 문자열 값 집합을 선언하는 방법입니다. 값 배열을 직접 `z.enum()`에 전달합니다. 또는 `as const`를 사용하여 열거형 값을 문자열 튜플로 정의할 수도 있습니다. 자세한 내용은 [const assertion 문서](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions)를 참고하세요.

```ts
const VALUES = ["Salmon", "Tuna", "Trout"] as const;
const FishEnum = z.enum(VALUES);
```

다음은 허용되지 않습니다. Zod가 각 요소의 정확한 값을 추론할 수 없기 때문입니다.

```ts
const fish = ["Salmon", "Tuna", "Trout"];
const FishEnum = z.enum(fish);
```

**`.enum`**

Zod 열거형에서 자동 완성을 사용하려면 스키마의 `.enum` 속성을 사용하세요.

```ts
FishEnum.enum.Salmon; // => 자동 완성

FishEnum.enum;
/*
=> {
  Salmon: "Salmon",
  Tuna: "Tuna",
  Trout: "Trout",
}
*/
```

`.options` 속성을 사용하여 옵션 목록을 튜플로 가져올 수도 있습니다.

```ts
FishEnum.options; // ["Salmon", "Tuna", "Trout"];
```

**`.exclude/.extract()`**

`.exclude`와 `.extract` 메서드를 사용하여 Zod 열거형의 부분 집합을 만들 수 있습니다.

```ts
const FishEnum = z.enum(["Salmon", "Tuna", "Trout"]);
const SalmonAndTrout = FishEnum.extract(["Salmon", "Trout"]);
const TunaOnly = FishEnum.exclude(["Salmon", "Trout"]);
```

## 네이티브 열거형(Native Enums)

Zod 열거형은 열거형을 정의하고 검증하는 데 권장되는 방법입니다. 하지만 서드파티 라이브러리의 열거형을 검증해야 하거나 기존 열거형을 다시 작성하고 싶지 않은 경우 `z.nativeEnum()`을 사용할 수 있습니다.

**숫자 열거형(Numeric Enums)**

```ts
enum Fruits {
  Apple,
  Banana,
}

const FruitEnum = z.nativeEnum(Fruits);
type FruitEnum = z.infer<typeof FruitEnum>; // Fruits

FruitEnum.parse(Fruits.Apple); // 통과
FruitEnum.parse(Fruits.Banana); // 통과
FruitEnum.parse(0); // 통과
FruitEnum.parse(1); // 통과
FruitEnum.parse(3); // 실패
```

**문자열 열거형(String Enums)**

```ts
enum Fruits {
  Apple = "apple",
  Banana = "banana",
  Cantaloupe, // 숫자와 문자열 열거형을 혼합할 수 있음
}

const FruitEnum = z.nativeEnum(Fruits);
type FruitEnum = z.infer<typeof FruitEnum>; // Fruits

FruitEnum.parse(Fruits.Apple); // 통과
FruitEnum.parse(Fruits.Cantaloupe); // 통과
FruitEnum.parse("apple"); // 통과
FruitEnum.parse("banana"); // 통과
FruitEnum.parse(0); // 통과
FruitEnum.parse("Cantaloupe"); // 실패
```

**상수 열거형(Const Enums)**

`.nativeEnum()` 함수는 `as const` 객체에서도 동작합니다. ⚠️ `as const`는 TypeScript 3.4 이상이 필요합니다!

```ts
const Fruits = {
  Apple: "apple",
  Banana: "banana",
  Cantaloupe: 3,
} as const;

const FruitEnum = z.nativeEnum(Fruits);
type FruitEnum = z.infer<typeof FruitEnum>; // "apple" | "banana" | 3

FruitEnum.parse("apple"); // 통과
FruitEnum.parse("banana"); // 통과
FruitEnum.parse(3); // 통과
FruitEnum.parse("Cantaloupe"); // 실패
```

`.enum` 속성을 사용하여 기본 객체에 접근할 수 있습니다:

```ts
FruitEnum.enum.Apple; // "apple"
```

## 옵셔널(Optional)

`schema`를 옵셔널로 만들고 싶다면 `z.optional()`을 사용하면 됩니다. 이 함수는 스키마를 `ZodOptional` 인스턴스로 감싼 후 결과를 반환합니다.

```ts
const schema = z.optional(z.string());

schema.parse(undefined); // => undefined 반환
type A = z.infer<typeof schema>; // string | undefined
```

편의를 위해, 기존 스키마에서 `.optional()` 메서드를 직접 호출할 수도 있습니다.

```ts
const user = z.object({
  username: z.string().optional(),
});
type C = z.infer<typeof user>; // { username?: string | undefined };
```

`ZodOptional` 인스턴스에서 감싸진 스키마를 추출하려면 `.unwrap()`을 사용하면 됩니다.

```ts
const stringSchema = z.string();
const optionalString = stringSchema.optional();
optionalString.unwrap() === stringSchema; // true
```

## Nullable 타입

`z.nullable()`을 사용하면 nullable 타입을 만들 수 있습니다.

```ts
const nullableString = z.nullable(z.string());
nullableString.parse("asdf"); // => "asdf"
nullableString.parse(null); // => null
```

또는 `.nullable()` 메서드를 사용할 수도 있습니다.

```ts
const E = z.string().nullable(); // nullableString과 동일
type E = z.infer<typeof E>; // string | null
```

`.unwrap()`을 사용하면 내부 스키마를 추출할 수 있습니다.

```ts
const stringSchema = z.string();
const nullableString = stringSchema.nullable();
nullableString.unwrap() === stringSchema; // true
```

## 객체

```ts
// 기본적으로 모든 속성은 필수입니다.
const Dog = z.object({
  name: z.string(),
  age: z.number(),
});

// 추론된 타입을 이렇게 추출할 수 있습니다.
type Dog = z.infer<typeof Dog>;

// 이는 다음과 동일합니다:
type Dog = {
  name: string;
  age: number;
};
```

### `.shape`

특정 키에 대한 스키마에 접근하려면 `.shape`를 사용하세요.

```ts
Dog.shape.name; // => 문자열 스키마
Dog.shape.age; // => 숫자 스키마
```

### `.keyof`

`.keyof`를 사용하면 객체 스키마의 키들로부터 `ZodEnum` 스키마를 생성할 수 있습니다.

```ts
const keySchema = Dog.keyof();
keySchema; // ZodEnum
```

이 코드는 `Dog` 객체 스키마의 키들을 기반으로 `ZodEnum` 스키마를 만듭니다. `keySchema`는 `ZodEnum` 타입이 됩니다.

### `.extend`

`.extend` 메서드를 사용하면 객체 스키마에 추가 필드를 넣을 수 있습니다.

```ts
const DogWithBreed = Dog.extend({
  breed: z.string(),
});
```

`.extend`는 기존 필드를 덮어쓸 때도 사용할 수 있습니다. 이 기능을 사용할 때는 주의가 필요합니다!

### `.merge`

`.merge`는 `A.extend(B.shape)`와 동일한 기능을 합니다.

```ts
const BaseTeacher = z.object({ students: z.array(z.string()) });
const HasID = z.object({ id: z.string() });

const Teacher = BaseTeacher.merge(HasID);
type Teacher = z.infer<typeof Teacher>; // => { students: string[], id: string }
```

> 두 스키마가 동일한 키를 공유할 경우, B의 속성이 A의 속성을 덮어씁니다. 반환된 스키마는 B의 "unknownKeys" 정책(strip/strict/passthrough)과 catchall 스키마를 상속받습니다.

### `.pick` / `.omit`

TypeScript의 내장 `Pick`과 `Omit` 유틸리티 타입에서 영감을 받아, 모든 Zod 객체 스키마는 `.pick`과 `.omit` 메서드를 제공합니다. 이 메서드들은 수정된 버전의 스키마를 반환합니다. 다음은 Recipe 스키마 예제입니다:

```ts
const Recipe = z.object({
  id: z.string(),
  name: z.string(),
  ingredients: z.array(z.string()),
});
```

특정 키만 유지하려면 `.pick`을 사용하세요.

```ts
const JustTheName = Recipe.pick({ name: true });
type JustTheName = z.infer<typeof JustTheName>;
// => { name: string }
```

특정 키를 제거하려면 `.omit`을 사용하세요.

```ts
const NoIDRecipe = Recipe.omit({ id: true });

type NoIDRecipe = z.infer<typeof NoIDRecipe>;
// => { name: string, ingredients: string[] }
```

### `.partial`

TypeScript의 내장 유틸리티 타입인 [Partial](https://www.typescriptlang.org/docs/handbook/utility-types.html#partialtype)에서 영감을 받은 `.partial` 메서드는 모든 프로퍼티를 선택적으로 만듭니다.

다음과 같은 객체에서 시작해 보겠습니다:

```ts
const user = z.object({
  email: z.string(),
  username: z.string(),
});
// { email: string; username: string }
```

이 객체를 부분적으로 만들 수 있습니다:

```ts
const partialUser = user.partial();
// { email?: string | undefined; username?: string | undefined }
```

또한, 특정 프로퍼티만 선택적으로 만들 수도 있습니다:

```ts
const optionalEmail = user.partial({
  email: true,
});
/*
{
  email?: string | undefined;
  username: string
}
*/
```

### `.deepPartial`

`.partial` 메서드는 얕은(shallow) 동작만 수행합니다. 즉, 한 단계 깊이만 적용됩니다. 이에 더해 "깊은(deep)" 버전도 존재합니다:

```ts
const user = z.object({
  username: z.string(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  strings: z.array(z.object({ value: z.string() })),
});

const deepPartialUser = user.deepPartial();

/*
{
  username?: string | undefined,
  location?: {
    latitude?: number | undefined;
    longitude?: number | undefined;
  } | undefined,
  strings?: { value?: string}[]
}
*/
```

> **중요한 제한 사항**: 깊은 부분 적용(deep partials)은 객체, 배열, 튜플로 구성된 계층 구조에서만 예상대로 동작합니다.

### `.required`

`.partial` 메서드와 반대로, `.required` 메서드는 모든 속성을 필수로 만듭니다.

다음과 같은 객체에서 시작해 보겠습니다:

```ts
const user = z
  .object({
    email: z.string(),
    username: z.string(),
  })
  .partial();
// { email?: string | undefined; username?: string | undefined }
```

이제 필수 버전을 만들 수 있습니다:

```ts
const requiredUser = user.required();
// { email: string; username: string }
```

특정 속성만 필수로 만들 수도 있습니다:

```ts
const requiredEmail = user.required({
  email: true,
});
/*
{
  email: string;
  username?: string | undefined;
}
*/
```

### `.passthrough`

기본적으로 Zod 객체 스키마는 파싱 과정에서 인식되지 않는 키를 제거합니다.

```ts
const person = z.object({
  name: z.string(),
});

person.parse({
  name: "bob dylan",
  extraKey: 61,
});
// => { name: "bob dylan" }
// extraKey가 제거됨
```

만약 알려지지 않은 키를 그대로 유지하고 싶다면 `.passthrough()`를 사용하세요.

```ts
person.passthrough().parse({
  name: "bob dylan",
  extraKey: 61,
});
// => { name: "bob dylan", extraKey: 61 }
```

### `.strict`

기본적으로 Zod 객체 스키마는 파싱 과정에서 인식되지 않는 키를 제거합니다. `.strict()`를 사용하면 알려지지 않은 키를 허용하지 않을 수 있습니다. 입력에 알려지지 않은 키가 있으면 Zod가 에러를 발생시킵니다.

```ts
const person = z
  .object({
    name: z.string(),
  })
  .strict();

person.parse({
  name: "bob dylan",
  extraKey: 61,
});
// => ZodError 발생
```

### `.strip` 메서드

`.strip` 메서드를 사용하면 객체 스키마를 기본 동작으로 재설정할 수 있습니다. 이때, 인식되지 않는 키는 제거됩니다.

### `.catchall`

객체 스키마에 "catchall" 스키마를 전달할 수 있습니다. 이 경우, 알려지지 않은 모든 키는 이 스키마에 따라 검증됩니다.

```ts
const person = z
  .object({
    name: z.string(),
  })
  .catchall(z.number());

person.parse({
  name: "bob dylan",
  validExtraKey: 61, // 정상 동작
});

person.parse({
  name: "bob dylan",
  validExtraKey: false, // 실패
});
// => ZodError 발생
```

`.catchall()`을 사용하면 `.passthrough()`, `.strip()`, `.strict()`가 필요 없어집니다. 모든 키가 "알려진" 것으로 간주됩니다.

## 배열

```ts
const stringArray = z.array(z.string());

// 동일한 표현
const stringArray = z.string().array();
```

`.array()` 메서드를 사용할 때 주의해야 합니다. 이 메서드는 새로운 `ZodArray` 인스턴스를 반환합니다. 따라서 메서드를 호출하는 **순서**가 중요합니다. 예를 들어:

```ts
z.string().optional().array(); // (string | undefined)[]
z.string().array().optional(); // string[] | undefined
```

위 예제에서 첫 번째 줄은 각 요소가 `string` 또는 `undefined`일 수 있는 배열을 생성합니다. 반면 두 번째 줄은 `string` 배열 자체가 `undefined`일 수 있음을 의미합니다.

### `.element`

배열의 요소에 대한 스키마에 접근하려면 `.element`를 사용합니다.

```ts
stringArray.element; // => string 스키마
```

### `.nonempty`

배열에 최소한 하나의 요소가 포함되어 있는지 확인하려면 `.nonempty()`를 사용하세요.

```ts
const nonEmptyStrings = z.string().array().nonempty();
// 추론된 타입은 이제 다음과 같습니다.
// [string, ...string[]]

nonEmptyStrings.parse([]); // 오류 발생: "배열이 비어 있을 수 없습니다"
nonEmptyStrings.parse(["Ariana Grande"]); // 통과
```

필요한 경우 커스텀 오류 메시지를 지정할 수도 있습니다:

```ts
// 커스텀 오류 메시지 지정
const nonEmptyStrings = z.string().array().nonempty({
  message: "비어 있을 수 없습니다!",
});
```

### `.min` / `.max` / `.length`

```ts
z.string().array().min(5); // 배열은 5개 이상의 항목을 포함해야 함
z.string().array().max(5); // 배열은 5개 이하의 항목을 포함해야 함
z.string().array().length(5); // 배열은 정확히 5개의 항목을 포함해야 함
```

`.nonempty()`와 달리, 이 메서드들은 타입 추론에 영향을 주지 않습니다.

## 튜플(Tuples)

배열과 달리 튜플은 고정된 수의 요소를 가지며, 각 요소는 서로 다른 타입을 가질 수 있습니다.

```ts
const athleteSchema = z.tuple([
  z.string(), // 이름
  z.number(), // 등번호
  z.object({
    pointsScored: z.number(),
  }), // 통계
]);

type Athlete = z.infer<typeof athleteSchema>;
// type Athlete = [string, number, { pointsScored: number }]
```

`.rest` 메서드를 사용하면 가변 인수("rest")를 추가할 수 있습니다.

```ts
const variadicTuple = z.tuple([z.string()]).rest(z.number());
const result = variadicTuple.parse(["hello", 1, 2, 3]);
// => [string, ...number[]];
```

## 유니온 타입

Zod는 "OR" 타입을 구성하기 위해 내장된 `z.union` 메서드를 제공합니다.

```ts
const stringOrNumber = z.union([z.string(), z.number()]);

stringOrNumber.parse("foo"); // 통과
stringOrNumber.parse(14); // 통과
```

Zod는 입력값을 각 "옵션"에 대해 순서대로 테스트하고, 유효성 검사를 통과한 첫 번째 값을 반환합니다.

편의를 위해 [`.or` 메서드](#or)를 사용할 수도 있습니다.

```ts
const stringOrNumber = z.string().or(z.number());
```

**선택적 문자열 유효성 검사:**

선택적인 폼 입력을 검증하기 위해, 원하는 문자열 유효성 검사를 빈 문자열 [리터럴](#리터럴literals)과 함께 유니온으로 결합할 수 있습니다.

다음 예제는 선택적이지만 [유효한 URL](#문자열)을 포함해야 하는 입력을 검증합니다.

```ts
const optionalUrl = z.union([z.string().url().nullish(), z.literal("")]);

console.log(optionalUrl.safeParse(undefined).success); // true
console.log(optionalUrl.safeParse(null).success); // true
console.log(optionalUrl.safeParse("").success); // true
console.log(optionalUrl.safeParse("https://zod.dev").success); // true
console.log(optionalUrl.safeParse("not a valid url").success); // false
```

## 구별된 유니온(Discriminated Unions)

구별된 유니온은 특정 키를 공유하는 객체 스키마들의 유니온입니다.

```ts
type MyUnion =
  | { status: "success"; data: string }
  | { status: "failed"; error: Error };
```

이러한 유니온은 `z.discriminatedUnion` 메서드를 사용하여 표현할 수 있습니다. 이 방법은 Zod가 `discriminator key`(위 예제에서는 `status`)를 확인하여 어떤 스키마를 사용하여 입력을 파싱할지 결정할 수 있게 해주기 때문에 더 빠른 평가를 가능하게 합니다. 이는 파싱을 더 효율적으로 만들고, Zod가 더 친절한 오류를 보고할 수 있게 해줍니다.

기본 유니온 메서드를 사용하면 입력이 제공된 "옵션" 각각에 대해 테스트되고, 유효하지 않은 경우 모든 "옵션"에 대한 문제가 Zod 오류에 표시됩니다. 반면, 구별된 유니온은 하나의 "옵션"만 선택하여 테스트하고, 해당 "옵션"과 관련된 문제만 표시할 수 있습니다.

```ts
const myUnion = z.discriminatedUnion("status", [
  z.object({ status: z.literal("success"), data: z.string() }),
  z.object({ status: z.literal("failed"), error: z.instanceof(Error) }),
]);

myUnion.parse({ status: "success", data: "yippie ki yay" });
```

`.options` 속성을 사용하여 스키마 배열에 대한 참조를 추출할 수 있습니다.

```ts
myUnion.options; // [ZodObject, ZodObject]
```

두 개 이상의 구별된 유니온을 병합하려면, `.options`와 구조 분해 할당을 사용하세요.

```ts
const A = z.discriminatedUnion("status", [
  /* options */
]);
const B = z.discriminatedUnion("status", [
  /* options */
]);

const AB = z.discriminatedUnion("status", [...A.options, ...B.options]);
```

## 레코드(Records)

레코드 스키마는 `Record<string, number>`와 같은 타입을 검증하는 데 사용됩니다. 이는 ID로 아이템을 저장하거나 캐싱할 때 특히 유용합니다.

```ts
const User = z.object({ name: z.string() });

const UserStore = z.record(z.string(), User);
type UserStore = z.infer<typeof UserStore>;
// => Record
```

스키마와 추론된 타입은 다음과 같이 사용할 수 있습니다:

```ts
const userStore: UserStore = {};

userStore["77d2586b-9e8e-4ecf-8b21-ea7e0530eadd"] = {
  name: "Carlotta",
}; // 통과

userStore["77d2586b-9e8e-4ecf-8b21-ea7e0530eadd"] = {
  whatever: "Ice cream sundae",
}; // TypeError 발생
```

**숫자 키에 대한 주의사항**

`z.record(keyType, valueType)`는 숫자 키 타입을 허용할 수 있고, TypeScript의 내장 `Record` 타입은 `Record<KeyType, ValueType>`입니다. 하지만 TypeScript의 `Record<number, any>` 타입을 Zod에서 표현하는 것은 어렵습니다.

TypeScript의 `[k: number]` 동작은 약간 직관적이지 않습니다:

```ts
const testMap: { [k: number]: string } = {
  1: "one",
};

for (const key in testMap) {
  console.log(`${key}: ${typeof key}`);
}
// 출력: `1: string`
```

보시다시피, JavaScript는 모든 객체 키를 내부적으로 문자열로 변환합니다. Zod는 정적 타입과 런타임 타입 간의 간극을 메우려고 하기 때문에, 런타임 JavaScript에서는 숫자 키가 존재하지 않으므로 숫자 키를 가진 레코드 스키마를 생성하는 방법을 제공하는 것은 의미가 없습니다.

## 맵(Map)

```ts
const stringNumberMap = z.map(z.string(), z.number());

type StringNumberMap = z.infer<typeof stringNumberMap>;
// type StringNumberMap = Map<string, number>
```

위 코드는 `zod` 라이브러리를 사용하여 문자열을 키로, 숫자를 값으로 가지는 맵을 정의하는 예제입니다. `z.map()` 함수는 첫 번째 인자로 키의 타입을, 두 번째 인자로 값의 타입을 받습니다. 이렇게 정의된 맵의 타입은 `Map<string, number>`가 됩니다.

## Set(집합)

```ts
const numberSet = z.set(z.number());
type NumberSet = z.infer<typeof numberSet>;
// type NumberSet = Set<number>
```

Set 스키마는 다음과 같은 유틸리티 메서드로 추가 제약을 걸 수 있습니다.

```ts
z.set(z.string()).nonempty(); // 최소 하나 이상의 항목을 포함해야 함
z.set(z.string()).min(5); // 5개 이상의 항목을 포함해야 함
z.set(z.string()).max(5); // 5개 이하의 항목을 포함해야 함
z.set(z.string()).size(5); // 정확히 5개의 항목을 포함해야 함
```

## 교차 타입(Intersections)

교차 타입은 "논리적 AND" 타입을 생성할 때 유용합니다. 두 객체 타입을 교차시키는 데 사용할 수 있습니다.

```ts
const Person = z.object({
  name: z.string(),
});

const Employee = z.object({
  role: z.string(),
});

const EmployedPerson = z.intersection(Person, Employee);

// 다음과 동일합니다:
const EmployedPerson = Person.and(Employee);
```

하지만 많은 경우, 두 객체를 병합할 때 `A.merge(B)`를 사용하는 것이 권장됩니다. `.merge` 메서드는 새로운 `ZodObject` 인스턴스를 반환하는 반면, `A.and(B)`는 `pick`이나 `omit`과 같은 일반적인 객체 메서드가 없는 `ZodIntersection` 인스턴스를 반환합니다.

```ts
const a = z.union([z.number(), z.string()]);
const b = z.union([z.number(), z.boolean()]);
const c = z.intersection(a, b);

type c = z.infer<typeof c>; // => number
```

<!-- Zod에서의 교차 타입은 똑똑하지 않습니다. `.parse()`에 전달된 데이터는 두 교차된 스키마에 그대로 전달됩니다. Zod 객체 스키마는 기본적으로 알려지지 않은 키를 허용하지 않기 때문에, 객체 스키마의 교차와 관련된 몇 가지 직관적이지 않은 동작이 있습니다. -->

<!--

``` ts
const A = z.object({
  a: z.string(),
});

const B = z.object({
  b: z.string(),
});

const AB = z.intersection(A, B);

type Teacher = z.infer<typeof AB>;
// { id:string; name:string };
```  -->

## 재귀 타입

Zod에서 재귀 스키마를 정의할 수 있지만, TypeScript의 한계로 인해 해당 타입을 정적으로 추론할 수 없습니다. 대신 타입 정의를 수동으로 작성하고, Zod에 "타입 힌트"로 제공해야 합니다.

```ts
const baseCategorySchema = z.object({
  name: z.string(),
});

type Category = z.infer<typeof baseCategorySchema> & {
  subcategories: Category[];
};

const categorySchema: z.ZodType = baseCategorySchema.extend({
  subcategories: z.lazy(() => categorySchema.array()),
});

categorySchema.parse({
  name: "People",
  subcategories: [
    {
      name: "Politicians",
      subcategories: [
        {
          name: "Presidents",
          subcategories: [],
        },
      ],
    },
  ],
}); // 통과
```

이 예제는 [crasite](https://github.com/crasite)에게 감사드립니다.

### ZodType과 ZodEffects 함께 사용하기

`z.ZodType`과 `z.ZodEffects`를 함께 사용할 때 (
[`.refine`](https://github.com/colinhacks/zod#refine),
[`.transform`](https://github.com/colinhacks/zod#transform),
[`preprocess`](https://github.com/colinhacks/zod#preprocess),
등...
), 스키마의 입력과 출력 타입을 정의해야 합니다. `z.ZodType<Output, z.ZodTypeDef, Input>`

```ts
const isValidId = (id: string): id is `${string}/${string}` =>
  id.split("/").length === 2;

const baseSchema = z.object({
  id: z.string().refine(isValidId),
});

type Input = z.input & {
  children: Input[];
};

type Output = z.output & {
  children: Output[];
};

const schema: z.ZodType = baseSchema.extend({
  children: z.lazy(() => schema.array()),
});
```

이 예제는 [marcus13371337](https://github.com/marcus13371337)와 [JoelBeeldi](https://github.com/JoelBeeldi)에게 감사드립니다.

### JSON 타입 검증

JSON 값을 검증하고 싶다면 아래 코드 조각을 사용할 수 있습니다.

```ts
const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
type Literal = z.infer<typeof literalSchema>;
type Json = Literal | { [key: string]: Json } | Json[];
const jsonSchema: z.ZodType = z.lazy(() =>
  z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)])
);

jsonSchema.parse(data);
```

이 코드는 [ggoodman](https://github.com/ggoodman)이 제안한 내용을 기반으로 작성되었습니다.

### 순환 객체

Zod는 재귀 스키마를 지원하지만, 순환 데이터를 전달하면 경우에 따라 무한 루프가 발생할 수 있습니다.

> 문제가 발생하기 전에 순환 객체를 감지하려면 [이 방법](https://gist.github.com/colinhacks/d35825e505e635df27cc950776c5500b)을 고려해 보세요.

## Promise

```ts
const numberPromise = z.promise(z.number());
```

Promise 스키마를 사용할 때 "파싱"은 약간 다르게 동작합니다. 검증은 두 단계로 이루어집니다:

1. Zod는 입력값이 Promise의 인스턴스인지 동기적으로 확인합니다. 즉, `.then`과 `.catch` 메서드를 가진 객체인지 확인합니다.
2. Zod는 `.then`을 사용해 기존 Promise에 추가 검증 단계를 연결합니다. 반환된 Promise에서 `.catch`를 사용해 검증 실패를 처리해야 합니다.

```ts
numberPromise.parse("tuna");
// ZodError: Non-Promise type: string

numberPromise.parse(Promise.resolve("tuna"));
// => Promise

const test = async () => {
  await numberPromise.parse(Promise.resolve("tuna"));
  // ZodError: Non-number type: string

  await numberPromise.parse(Promise.resolve(3.14));
  // => 3.14
};
```

<!-- #### 비네이티브 Promise 구현

Promise를 "파싱"할 때, Zod는 전달된 값이 `.then`과 `.catch` 메서드를 가진 객체인지 확인합니다. 따라서 Bluebird와 같은 비네이티브 Promise를 `z.promise(...).parse`에 전달해도 문제없이 동작합니다. 단, 주의할 점은 파싱 함수의 반환 타입이 `네이티브` `Promise`가 되므로, 비표준 Promise 메서드를 사용하는 하위 로직이 있다면 작동하지 않을 수 있습니다. -->

## Instanceof

`z.instanceof`를 사용하면 입력값이 특정 클래스의 인스턴스인지 확인할 수 있습니다. 이는 외부 라이브러리에서 내보낸 클래스에 대해 입력값을 검증할 때 유용합니다.

```ts
class Test {
  name: string;
}

const TestSchema = z.instanceof(Test);

const blob: any = "whatever";
TestSchema.parse(new Test()); // 통과
TestSchema.parse(blob); // 오류 발생
```

위 예제에서 `TestSchema`는 `Test` 클래스의 인스턴스인지 검증합니다. `new Test()`는 검증을 통과하지만, `blob`은 문자열이므로 오류가 발생합니다.

## 함수

Zod는 "함수 스키마"를 정의할 수 있게 해줍니다. 이를 통해 검증 코드와 "비즈니스 로직"을 섞지 않고도 함수의 입력과 출력을 쉽게 검증할 수 있습니다.

`z.function(args, returnType)`를 사용해 함수 스키마를 만들 수 있습니다.

```ts
const myFunction = z.function();

type myFunction = z.infer<typeof myFunction>;
// => ()=>unknown
```

입력과 출력을 정의해 보겠습니다.

```ts
const myFunction = z
  .function()
  .args(z.string(), z.number()) // 임의의 수의 인자를 받음
  .returns(z.boolean());

type myFunction = z.infer<typeof myFunction>;
// => (arg0: string, arg1: number)=>boolean
```

함수 스키마는 `.implement()` 메서드를 가지고 있습니다. 이 메서드는 함수를 인자로 받아 입력과 출력을 자동으로 검증하는 새로운 함수를 반환합니다.

```ts
const trimmedLength = z
  .function()
  .args(z.string()) // 임의의 수의 인자를 받음
  .returns(z.number())
  .implement((x) => {
    // TypeScript는 x가 문자열임을 알고 있습니다!
    return x.trim().length;
  });

trimmedLength("sandwich"); // => 8
trimmedLength(" asdf "); // => 4
```

입력만 검증하고 싶다면 `.returns()` 메서드를 호출하지 않으면 됩니다. 출력 타입은 구현에서 추론됩니다.

> 함수가 아무것도 반환하지 않는다면 특별한 `z.void()` 옵션을 사용할 수 있습니다. 이렇게 하면 Zod가 void 반환 함수의 타입을 올바르게 추론할 수 있습니다. (void 반환 함수는 실제로 undefined를 반환합니다.)

```ts
const myFunction = z
  .function()
  .args(z.string())
  .implement((arg) => {
    return [arg.length];
  });

myFunction; // (arg: string)=>number[]
```

함수 스키마에서 입력과 출력 스키마를 추출할 수 있습니다.

```ts
myFunction.parameters();
// => ZodTuple

myFunction.returnType();
// => ZodBoolean
```

## 전처리(Preprocess)

> Zod는 이제 `.preprocess()` 없이도 기본 타입 강제 변환을 지원합니다. 자세한 내용은 [강제 변환 문서](#기본-타입-강제-변환coercion)를 참고하세요.

일반적으로 Zod는 "파싱 후 변환" 패러다임으로 동작합니다. Zod는 먼저 입력값을 검증한 다음, 변환 함수 체인을 통해 전달합니다. (변환에 대한 자세한 내용은 [.transform 문서](#transform)를 참고하세요.)

하지만 때로는 파싱이 일어나기 `전에` 입력값에 어떤 변환을 적용하고 싶을 때가 있습니다. 일반적인 사용 사례는 타입 강제 변환입니다. Zod는 `z.preprocess()`를 통해 이를 가능하게 합니다.

```ts
const castToString = z.preprocess((val) => String(val), z.string());
```

이 코드는 `ZodEffects` 인스턴스를 반환합니다. `ZodEffects`는 전처리, 개선(refinements), 변환과 관련된 모든 로직을 포함하는 래퍼 클래스입니다.

## 커스텀 스키마

Zod에서 `z.custom()`을 사용하면 TypeScript의 어떤 타입이든 스키마로 만들 수 있습니다. 이 기능은 Zod에서 기본적으로 지원하지 않는 타입, 예를 들어 템플릿 문자열 리터럴 같은 경우에 유용합니다.

```ts
const px = z.custom((val) => {
  return typeof val === "string" ? /^\d+px$/.test(val) : false;
});

type px = z.infer<typeof px>; // `${number}px`

px.parse("42px"); // "42px"
px.parse("42vw"); // 에러 발생
```

만약 검증 함수를 제공하지 않으면, Zod는 모든 값을 허용합니다. 이는 위험할 수 있습니다!

```ts
z.custom(); // 검증을 수행하지 않음
```

두 번째 인자로 에러 메시지나 다른 옵션을 커스텀할 수 있습니다. 이 매개변수는 [`.refine`](#refine)의 params 매개변수와 동일하게 작동합니다.

```ts
z.custom((val) => ..., "커스텀 에러 메시지");
```

## 스키마 메서드

모든 Zod 스키마는 특정 메서드를 포함하고 있습니다.

### `.parse`

`.parse(data: unknown): T`

Zod 스키마가 주어지면, `.parse` 메서드를 호출하여 `data`가 유효한지 확인할 수 있습니다. 유효하다면, 완전한 타입 정보와 함께 값이 반환됩니다! 그렇지 않으면 오류가 발생합니다.

> 중요: `.parse`가 반환하는 값은 여러분이 전달한 변수의 **깊은 복사본(deep clone)**입니다.

```ts
const stringSchema = z.string();

stringSchema.parse("fish"); // => "fish" 반환
stringSchema.parse(12); // 오류 발생
```

### `.parseAsync`

`.parseAsync(data:unknown): Promise<T>`

비동기 [검증](#refine)이나 [변환](#transform)을 사용할 경우, `.parseAsync`를 사용해야 합니다.

```ts
const stringSchema = z.string().refine(async (val) => val.length <= 8);

await stringSchema.parseAsync("hello"); // => "hello" 반환
await stringSchema.parseAsync("hello world"); // => 에러 발생
```

### `.safeParse`

`.safeParse(data:unknown): { success: true; data: T; } | { success: false; error: ZodError; }`

Zod에서 유효성 검사가 실패할 때 에러를 던지지 않도록 하려면 `.safeParse`를 사용하세요. 이 메서드는 성공적으로 파싱된 데이터를 포함하는 객체 또는 유효성 검사 문제에 대한 상세 정보를 담은 ZodError 인스턴스를 반환합니다.

```ts
stringSchema.safeParse(12);
// => { success: false; error: ZodError }

stringSchema.safeParse("billie");
// => { success: true; data: 'billie' }
```

결과는 **판별 유니온(discriminated union)**이기 때문에, 에러를 매우 편리하게 처리할 수 있습니다:

```ts
const result = stringSchema.safeParse("billie");
if (!result.success) {
  // 에러 처리 후 반환
  result.error;
} else {
  // 작업 수행
  result.data;
}
```

### `.safeParseAsync`

> 별칭: `.spa`

`safeParse`의 비동기 버전입니다.

```ts
await stringSchema.safeParseAsync("billie");
```

편의를 위해 `.spa`로 별칭이 지정되었습니다:

```ts
await stringSchema.spa("billie");
```

### `.refine`

`.refine(validator: (data:T)=>any, params?: RefineParams)`

Zod는 **커스텀 검증 로직**을 제공할 수 있도록 `refinements` 기능을 지원합니다. (여러 이슈를 생성하거나 에러 코드를 커스텀하는 등 고급 기능을 원한다면 [`.superRefine`](#superrefine)을 참고하세요.)

Zod는 TypeScript와 최대한 비슷하게 동작하도록 설계되었습니다. 하지만 TypeScript의 타입 시스템으로는 표현할 수 없는 다양한 **리파인먼트 타입**이 존재합니다. 예를 들어, 숫자가 정수인지 확인하거나 문자열이 유효한 이메일 주소인지 검사하는 경우가 있습니다.

예를 들어, `.refine`을 사용해 **어떤 Zod 스키마**에든 커스텀 검증을 추가할 수 있습니다:

```ts
const myString = z.string().refine((val) => val.length <= 255, {
  message: "문자열은 255자를 초과할 수 없습니다.",
});
```

> ⚠️ 리파인먼트 함수는 **에러를 던지지 않아야 합니다**. 대신 검증 실패 시 `falsy` 값을 반환해야 합니다.

#### 인자

`.refine`은 두 가지 인자를 받습니다.

1. 첫 번째는 검증 함수입니다. 이 함수는 하나의 입력(`T` 타입 — 스키마에서 추론된 타입)을 받고 `any`를 반환합니다. 참 같은 값(truthy value)이면 검증을 통과합니다. (zod@1.6.2 이전 버전에서는 검증 함수가 불리언 값을 반환해야 했습니다.)
2. 두 번째는 몇 가지 옵션을 받습니다. 이 옵션을 사용해 특정 오류 처리 동작을 커스터마이징할 수 있습니다:

```ts
type RefineParams = {
  // 오류 메시지 재정의
  message?: string;

  // 오류 경로에 추가
  path?: (string | number)[];

  // 오류 맵에서 메시지를 커스터마이징할 때 사용할 수 있는 파라미터 객체
  params?: object;
};
```

고급 사용 사례에서는 두 번째 인자가 `RefineParams`를 반환하는 함수일 수도 있습니다.

```ts
const longString = z.string().refine(
  (val) => val.length > 10,
  (val) => ({ message: `${val}은 10자를 초과하지 않습니다.` })
);
```

#### 에러 경로 커스텀하기

```ts
const passwordForm = z
  .object({
    password: z.string(),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: "비밀번호가 일치하지 않습니다",
    path: ["confirm"], // 에러 경로
  });

passwordForm.parse({ password: "asdf", confirm: "qwer" });
```

`path` 매개변수를 제공했기 때문에, 발생한 에러는 다음과 같습니다:

```ts
ZodError {
  issues: [{
    "code": "custom",
    "path": [ "confirm" ],
    "message": "비밀번호가 일치하지 않습니다"
  }]
}
```

#### 비동기 정제(Refinements)

정제는 비동기로도 사용할 수 있습니다:

```ts
const userId = z.string().refine(async (id) => {
  // 데이터베이스에서 ID가 존재하는지 확인
  return true;
});
```

> ⚠️ 비동기 정제를 사용할 경우, 데이터를 파싱할 때 반드시 `.parseAsync` 메서드를 사용해야 합니다! 그렇지 않으면 Zod에서 에러가 발생합니다.

#### transform과 refine의 관계

transform과 refine은 서로 교차하여 사용할 수 있습니다:

```ts
z.string()
  .transform((val) => val.length) // 문자열을 길이로 변환
  .refine((val) => val > 25); // 길이가 25보다 큰지 검증
```

<!-- `path`가 `["confirm"]`로 설정되어 있으므로, "Confirm password" 텍스트박스 아래에 이 오류를 쉽게 표시할 수 있습니다.

```ts
const allForms = z.object({ passwordForm }).parse({
  passwordForm: {
    password: "asdf",
    confirm: "qwer",
  },
});
```

위 코드는 다음과 같은 결과를 반환합니다:

```

ZodError {
  issues: [{
    "code": "custom",
    "path": [ "passwordForm", "confirm" ],
    "message": "Passwords don't match"
  }]
}
``` -->

### `.superRefine`

`.refine` 메서드는 사실 더 강력하고(그리고 더 장황한) `superRefine`이라는 메서드 위에 구축된 문법적 설탕(syntactic sugar)입니다. 다음은 예제입니다:

```ts
const Strings = z.array(z.string()).superRefine((val, ctx) => {
  if (val.length > 3) {
    ctx.addIssue({
      code: z.ZodIssueCode.too_big,
      maximum: 3,
      type: "array",
      inclusive: true,
      message: "Too many items 😡",
    });
  }

  if (val.length !== new Set(val).size) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `No duplicates allowed.`,
    });
  }
});
```

여러분은 원하는 만큼 이슈를 추가할 수 있습니다. 만약 함수 실행 중에 `ctx.addIssue`가 호출되지 않으면, 검증은 통과됩니다.

일반적으로 리파인먼트는 항상 `ZodIssueCode.custom` 에러 코드를 가진 이슈를 생성하지만, `superRefine`을 사용하면 어떤 `ZodIssueCode`의 이슈든 던질 수 있습니다. 각 이슈 코드는 [ERROR_HANDLING.md](ERROR_HANDLING.md) 문서에서 자세히 설명되어 있습니다.

#### 조기 중단

기본적으로, 파싱은 검증 체크가 실패한 후에도 계속 진행됩니다. 예를 들어, 여러 개의 검증을 연쇄적으로 연결하면 모든 검증이 실행됩니다. 하지만, 이후의 검증이 실행되지 않도록 **조기 중단**하는 것이 바람직할 수 있습니다. 이를 위해 `ctx.addIssue`에 `fatal` 플래그를 전달하고 `z.NEVER`를 반환하면 됩니다.

```ts
const schema = z.number().superRefine((val, ctx) => {
  if (val < 10) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "10 이상이어야 합니다",
      fatal: true,
    });

    return z.NEVER;
  }

  if (val !== 12) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "12여야 합니다",
    });
  }
});
```

#### 타입 정제

`.refine()` 또는 `.superRefine()`에 [타입 술어(type predicate)](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates)를 제공하면, 결과 타입이 해당 술어의 타입으로 좁혀집니다. 이는 여러 체이닝된 정제와 변환을 혼합하여 사용할 때 유용합니다:

```ts
const schema = z
  .object({
    first: z.string(),
    second: z.number(),
  })
  .nullable()
  .superRefine((arg, ctx): arg is { first: string; second: number } => {
    if (!arg) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom, // 이슈 커스터마이징
        message: "객체가 존재해야 합니다.",
      });
    }

    return z.NEVER; // 반환값은 사용되지 않지만, 타입을 만족시키기 위해 반환해야 함
  })
  // 여기서 TS는 arg가 null이 아니라는 것을 알고 있음
  .refine((arg) => arg.first === "bob", "`first`가 `bob`이 아닙니다!");
```

> ⚠️ 검증이 통과되었는지 여부를 나타내기 위해 불리언 값을 반환하는 대신 **반드시** `ctx.addIssue()`를 사용해야 합니다. 함수 실행 중에 `ctx.addIssue`가 호출되지 않으면 검증이 통과됩니다.

### `.transform`

데이터를 파싱한 후 변환하려면 `transform` 메서드를 사용합니다.

```ts
const stringToNumber = z.string().transform((val) => val.length);

stringToNumber.parse("string"); // => 6
```

이 예제에서는 문자열의 길이를 반환하는 변환 함수를 적용했습니다. `"string"`이라는 문자열을 파싱하면 그 길이인 `6`이 반환됩니다.

#### 체이닝 순서

위의 `stringToNumber`는 `ZodEffects` 서브클래스의 인스턴스입니다. 이는 `ZodString`의 인스턴스가 아닙니다. 만약 `ZodString`의 내장 메서드(예: `.email()`)를 사용하려면, **변환(transform)을 적용하기 전에** 해당 메서드를 먼저 적용해야 합니다.

```ts
const emailToDomain = z
  .string()
  .email()
  .transform((val) => val.split("@")[1]);

emailToDomain.parse("colinhacks@example.com"); // => example.com
```

#### 변환 중에 유효성 검사하기

`.transform` 메서드는 값을 변환하면서 동시에 유효성을 검사할 수 있습니다. 이 방법은 `transform`과 `refine`을 체이닝하는 것보다 간단하고 중복을 줄일 수 있습니다.

`.superRefine`과 마찬가지로, 변환 함수는 `addIssue` 메서드를 포함한 `ctx` 객체를 받습니다. 이 메서드를 사용해 유효성 검사 문제를 등록할 수 있습니다.

```ts
const numberInString = z.string().transform((val, ctx) => {
  const parsed = parseInt(val);
  if (isNaN(parsed)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "숫자가 아닙니다.",
    });

    // 이는 변환 함수에서 조기에 반환하기 위해 사용할 수 있는
    // 특별한 심볼입니다. `never` 타입을 가지므로 반환 타입에
    // 영향을 미치지 않습니다.
    return z.NEVER;
  }
  return parsed;
});
```

#### 변환과 정제의 관계

변환(transform)과 정제(refine)는 서로 교차하여 사용할 수 있습니다. 이들은 선언된 순서대로 실행됩니다.

```ts
const nameToGreeting = z
  .string()
  .transform((val) => val.toUpperCase()) // 값을 대문자로 변환
  .refine((val) => val.length > 15) // 길이가 15를 초과하는지 검증
  .transform((val) => `Hello ${val}`) // 값 앞에 "Hello"를 추가
  .refine((val) => val.indexOf("!") === -1); // 값에 "!"가 포함되지 않았는지 검증
```

위 예제에서 각 단계는 순차적으로 실행됩니다. 먼저 문자열을 대문자로 변환한 후, 길이를 검증하고, 다시 문자열을 변환한 뒤, 마지막으로 특정 문자가 포함되지 않았는지 검증합니다.

#### 비동기 변환(Async Transforms)

변환(transform)은 비동기로도 동작할 수 있습니다.

```ts
const IdToUser = z
  .string()
  .uuid()
  .transform(async (id) => {
    return await getUserById(id);
  });
```

> ⚠️ 스키마에 비동기 변환이 포함된 경우, 데이터를 파싱할 때 반드시 `.parseAsync()` 또는 `.safeParseAsync()`를 사용해야 합니다. 그렇지 않으면 Zod가 에러를 발생시킵니다.

### `.default`

Zod에서 "기본값" 개념을 구현하기 위해 변환(transforms)을 사용할 수 있습니다.

```ts
const stringWithDefault = z.string().default("tuna");

stringWithDefault.parse(undefined); // => "tuna"
```

선택적으로, `.default`에 함수를 전달할 수도 있습니다. 이 함수는 기본값이 필요할 때마다 다시 실행됩니다.

```ts
const numberWithRandomDefault = z.number().default(Math.random);

numberWithRandomDefault.parse(undefined); // => 0.4413456736055323
numberWithRandomDefault.parse(undefined); // => 0.1871840107401901
numberWithRandomDefault.parse(undefined); // => 0.7223408162401552
```

개념적으로, Zod는 기본값을 다음과 같이 처리합니다:

1. 입력값이 `undefined`인 경우, 기본값을 반환합니다.
2. 그렇지 않으면, 기본 스키마를 사용해 데이터를 파싱합니다.

### `.describe`

`.describe()`를 사용하면 결과 스키마에 `description` 속성을 추가할 수 있습니다.

```ts
const documentedString = z
  .string()
  .describe("유용한 텍스트 조각입니다. 어떻게 사용할지 알고 있다면 말이죠.");
documentedString.description; // 유용한 텍스트 조각…
```

이 기능은 필드를 문서화할 때 유용합니다. 예를 들어, [`zod-to-json-schema`](https://github.com/StefanTerdell/zod-to-json-schema)와 같은 라이브러리를 사용해 JSON 스키마를 생성할 때 활용할 수 있습니다.

### `.catch`

`.catch()`를 사용하면 파싱 오류가 발생했을 때 반환할 "기본값"을 지정할 수 있습니다.

```ts
const numberWithCatch = z.number().catch(42);

numberWithCatch.parse(5); // => 5
numberWithCatch.parse("tuna"); // => 42
```

선택적으로, `.catch`에 함수를 전달할 수도 있습니다. 이 함수는 기본값이 필요할 때마다 다시 실행됩니다. 이때, 발생한 오류를 담고 있는 `ctx` 객체가 함수에 전달됩니다.

```ts
const numberWithRandomCatch = z.number().catch((ctx) => {
  ctx.error; // 발생한 ZodError
  return Math.random();
});

numberWithRandomCatch.parse("sup"); // => 0.4413456736055323
numberWithRandomCatch.parse("sup"); // => 0.1871840107401901
numberWithRandomCatch.parse("sup"); // => 0.7223408162401552
```

Zod가 "기본값"을 처리하는 방식은 다음과 같습니다:

1. 기본 스키마를 사용해 데이터를 파싱합니다.
2. 파싱이 실패하면 "기본값"을 반환합니다.

### `.optional`

스키마의 옵셔널 버전을 반환하는 편의 메서드입니다.

```ts
const optionalString = z.string().optional(); // string | undefined

// 아래와 동일합니다
z.optional(z.string());
```

### `.nullable`

이 메서드는 스키마의 nullable 버전을 반환하는 편의 기능입니다.

```ts
const nullableString = z.string().nullable(); // string | null

// 위 코드는 아래와 동일합니다.
z.nullable(z.string());
```

이 메서드를 사용하면 특정 타입에 `null`을 허용하는 스키마를 쉽게 정의할 수 있습니다. 예를 들어, `z.string().nullable()`은 문자열 또는 `null` 값을 허용하는 스키마를 생성합니다. 이는 `z.nullable(z.string())`과 동일한 결과를 제공합니다.

### `.nullish`

스키마의 "nullish" 버전을 반환하는 편의 메서드입니다. Nullish 스키마는 `undefined`와 `null`을 모두 허용합니다. "nullish" 개념에 대해 더 자세히 알아보려면 [TypeScript 3.7 릴리스 노트](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#nullish-coalescing)를 참고하세요.

```ts
const nullishString = z.string().nullish(); // string | null | undefined

// 위 코드는 아래와 동일합니다.
z.string().nullable().optional();
```

### `.array()`

주어진 타입에 대한 배열 스키마를 반환하는 편의 메서드입니다.

```ts
const stringArray = z.string().array(); // string[]

// 위 코드는 아래와 동일합니다
z.array(z.string());
```

이 메서드를 사용하면 특정 타입의 배열을 간단하게 정의할 수 있습니다. 예를 들어, 문자열 배열을 만들고 싶다면 `z.string().array()`를 사용하면 됩니다. 이는 `z.array(z.string())`과 동일한 결과를 반환합니다.

### `.promise`

Promise 타입을 위한 편의 메서드입니다:

```ts
const stringPromise = z.string().promise(); // Promise<string>

// 위 코드는 아래와 동일합니다
z.promise(z.string());
```

이 메서드는 주어진 스키마를 Promise로 감싸는 역할을 합니다. 예를 들어, `z.string().promise()`는 `Promise<string>` 타입을 반환합니다. 이는 `z.promise(z.string())`과 동일한 결과를 제공합니다.

### `.or`

[유니온 타입](#유니온-타입)을 편리하게 사용할 수 있는 메서드입니다.

```ts
const stringOrNumber = z.string().or(z.number()); // string | number

// 위 코드는 아래와 동일합니다.
z.union([z.string(), z.number()]);
```

- `z.string().or(z.number())`는 문자열 또는 숫자 타입을 허용하는 유니온 타입을 생성합니다.
- 이 메서드는 `z.union([z.string(), z.number()])`와 동일한 기능을 제공하지만, 더 간결하게 작성할 수 있습니다.

### `.and`

교차 타입(intersection type)을 쉽게 만들 수 있는 편의 메서드입니다.

```ts
const nameAndAge = z
  .object({ name: z.string() })
  .and(z.object({ age: z.number() })); // { name: string } & { age: number }

// 위 코드는 아래와 동일합니다.
z.intersection(z.object({ name: z.string() }), z.object({ age: z.number() }));
```

### `.brand`

`.brand<T>() => ZodBranded<this, B>`

TypeScript의 타입 시스템은 구조적(structural)입니다. 이는 구조적으로 동일한 두 타입을 같은 타입으로 간주한다는 의미입니다.

```ts
type Cat = { name: string };
type Dog = { name: string };

const petCat = (cat: Cat) => {};
const fido: Dog = { name: "fido" };
petCat(fido); // 문제 없이 동작
```

어떤 경우에는 TypeScript 내에서 `명목적 타이핑(nominal typing)`을 흉내 내고 싶을 수 있습니다. 예를 들어, Zod로 검증된 입력만 받는 함수를 작성하고 싶을 수 있습니다. 이는 `브랜드 타입(branded types)`(또는 `불투명 타입(opaque types)`)을 사용하여 달성할 수 있습니다.

```ts
const Cat = z.object({ name: z.string() }).brand();
type Cat = z.infer<typeof Cat>;

const petCat = (cat: Cat) => {};

// 이 코드는 동작
const simba = Cat.parse({ name: "simba" });
petCat(simba);

// 이 코드는 동작하지 않음
petCat({ name: "fido" });
```

내부적으로 이는 교차 타입(intersection type)을 사용하여 추론된 타입에 "브랜드"를 붙이는 방식으로 동작합니다. 이렇게 하면 일반적인/브랜드가 없는 데이터 구조는 더 이상 스키마의 추론된 타입에 할당할 수 없게 됩니다.

```ts
const Cat = z.object({ name: z.string() }).brand();
type Cat = z.infer<typeof Cat>;
// {name: string} & {[symbol]: "Cat"}
```

브랜드 타입은 `.parse`의 런타임 결과에 영향을 미치지 않는다는 점에 유의하세요. 이는 오직 정적(static) 구조일 뿐입니다.

### `.readonly`

`.readonly() => ZodReadonly<this>`

이 메서드는 기본 스키마를 사용해 입력을 파싱한 후, 결과에 `Object.freeze()`를 호출하는 `ZodReadonly` 스키마 인스턴스를 반환합니다. 추론된 타입도 `readonly`로 표시됩니다.

```ts
const schema = z.object({ name: z.string() }).readonly();
type schema = z.infer<typeof schema>;
// Readonly

const result = schema.parse({ name: "fido" });
result.name = "simba"; // 오류 발생
```

추론된 타입은 관련된 경우 TypeScript의 내장 `readonly` 타입을 사용합니다.

```ts
z.array(z.string()).readonly();
// readonly string[]

z.tuple([z.string(), z.number()]).readonly();
// readonly [string, number]

z.map(z.string(), z.date()).readonly();
// ReadonlyMap

z.set(z.string()).readonly();
// ReadonlySet
```

### `.pipe`

스키마는 유효성 검사 "파이프라인"으로 연결할 수 있습니다. 이는 `.transform()` 이후의 결과를 쉽게 검증하는 데 유용합니다:

```ts
z.string()
  .transform((val) => val.length) // 문자열을 길이로 변환
  .pipe(z.number().min(5)); // 길이가 5 이상인지 검증
```

`.pipe()` 메서드는 `ZodPipeline` 인스턴스를 반환합니다.

#### `.pipe()`를 사용하여 `z.coerce`의 일반적인 문제를 해결할 수 있습니다.

입력을 원하는 타입으로 제한한 후 `.pipe()`를 사용하여 강제 변환을 적용할 수 있습니다.

**입력이 제한되지 않은 경우:**

```ts
const toDate = z.coerce.date();

// 직관적으로 동작
console.log(toDate.safeParse("2023-01-01").success); // true

// 원하지 않는 결과가 나올 수 있음
console.log(toDate.safeParse(null).success); // true
```

**입력이 제한된 경우:**

```ts
const datelike = z.union([z.number(), z.string(), z.date()]);
const datelikeToDate = datelike.pipe(z.coerce.date());

// 여전히 직관적으로 동작
console.log(datelikeToDate.safeParse("2023-01-01").success); // true

// 더 원하는 결과를 얻을 수 있음
console.log(datelikeToDate.safeParse(null).success); // false
```

이 기법을 사용하면 잡히지 않는 오류를 던지는 강제 변환을 피할 수도 있습니다.

**입력이 제한되지 않은 경우:**

```ts
const toBigInt = z.coerce.bigint();

// 직관적으로 동작
console.log(toBigInt.safeParse("42")); // true

// 원하지 않는 결과가 나올 수 있음
console.log(toBigInt.safeParse(null)); // 잡히지 않는 오류 발생
```

**입력이 제한된 경우:**

```ts
const toNumber = z.number().or(z.string()).pipe(z.coerce.number());
const toBigInt = z.bigint().or(toNumber).pipe(z.coerce.bigint());

// 여전히 직관적으로 동작
console.log(toBigInt.safeParse("42").success); // true

// Zod가 오류를 처리하며, 더 원하는 결과를 얻을 수 있음
console.log(toBigInt.safeParse(null).success); // false
```

이렇게 `.pipe()`를 사용하면 입력을 제한하고, 원하는 타입으로 안전하게 변환할 수 있습니다.

## Guides and concepts

### 타입 추론

여러분은 `z.infer<typeof mySchema>`를 사용하여 어떤 스키마의 TypeScript 타입도 추출할 수 있습니다.

```ts
const A = z.string();
type A = z.infer<typeof A>; // string

const u: A = 12; // TypeError
const u: A = "asdf"; // 컴파일 성공
```

**변환(transform)은 어떻게 될까요?**

실제로 각 Zod 스키마는 내부적으로 **두 가지** 타입을 추적합니다: 입력 타입과 출력 타입입니다. 대부분의 스키마(예: `z.string()`)에서는 이 두 타입이 동일합니다. 하지만 변환을 추가하면 이 두 값이 달라질 수 있습니다. 예를 들어, `z.string().transform(val => val.length)`는 입력 타입이 `string`이고 출력 타입이 `number`입니다.

입력 타입과 출력 타입을 따로 추출할 수 있습니다:

```ts
const stringToNumber = z.string().transform((val) => val.length);

// ⚠️ 중요: z.infer는 출력 타입을 반환합니다!
type input = z.input; // string
type output = z.output; // number

// z.output와 동일합니다!
type inferred = z.infer<typeof stringToNumber>; // number
```

### 제네릭 함수 작성하기

TypeScript의 제네릭을 사용하면 Zod 스키마를 매개변수로 받는 재사용 가능한 함수를 작성할 수 있습니다. 이를 통해 타입 안전성과 타입 추론을 유지하면서 커스텀 유효성 검사 로직이나 스키마 변환 등을 만들 수 있습니다.

Zod 스키마를 입력으로 받는 함수를 작성하려고 할 때, 다음과 같은 코드를 시도해볼 수 있습니다:

```ts
function inferSchema(schema: z.ZodType) {
  return schema;
}
```

하지만 이 방법은 올바르지 않으며, TypeScript가 인자의 타입을 제대로 추론하는 데 제한을 줍니다. 무엇을 전달하든 `schema`의 타입은 `ZodType`의 인스턴스로 고정됩니다.

```ts
inferSchema(z.string());
// => ZodType
```

이 방식은 타입 정보를 잃어버리게 됩니다. 특히 입력이 실제로 어떤 하위 클래스(`ZodString` 등)인지 알 수 없기 때문에, 결과값에서 `.min()`과 같은 문자열 전용 메서드를 호출할 수 없습니다.

더 나은 방법은 스키마의 추론된 타입만이 아니라 **스키마 전체를 추론**하는 것입니다. 이를 위해 `z.ZodTypeAny`라는 유틸리티 타입을 사용할 수 있습니다.

```ts
function inferSchema<T extends z.ZodTypeAny>(schema: T) {
  return schema;
}

inferSchema(z.string());
// => ZodString
```

> `ZodTypeAny`는 `ZodType<any, any, any>`의 축약형으로, 모든 Zod 스키마와 일치할 수 있을 만큼 넓은 타입입니다.

이제 결과는 완전히 타입이 지정되며, 타입 시스템은 스키마의 특정 하위 클래스를 정확히 추론할 수 있습니다.

#### 추론된 타입 유추하기

스키마의 제네릭 매개변수로 `z.ZodTypeAny`를 사용하는 것이 권장 사항이지만, 이 경우 파싱된 데이터가 스키마의 추론된 타입 대신 `any`로 타입 지정되는 문제가 발생할 수 있습니다.

```ts
function parseData(data: unknown, schema: T) {
  return schema.parse(data);
}

parseData("sup", z.string());
// => any
```

TypeScript의 타입 추론 방식 때문에 `schema`가 추론된 타입이 아닌 `ZodTypeAny`로 처리됩니다. 이 문제는 `z.infer`를 사용한 타입 캐스팅으로 해결할 수 있습니다.

```ts
function parseData(data: unknown, schema: T) {
  return schema.parse(data) as z.infer<T>;
  //                        ^^^^^^^^^^^^^^ <- 이 부분 추가
}

parseData("sup", z.string());
// => string
```

#### 허용 가능한 입력 제한하기

`ZodType` 클래스는 세 가지 제네릭 매개변수를 가지고 있습니다.

```ts
class ZodType<
  Output = any,
  Def extends ZodTypeDef = ZodTypeDef,
  Input = Output
> { ... }
```

이 제네릭 매개변수를 제한함으로써, 여러분의 함수에 허용 가능한 스키마 입력을 제한할 수 있습니다:

```ts
function makeSchemaOptional<T extends ZodType>(schema: T) {
  return schema.optional();
}

makeSchemaOptional(z.string());
// 정상적으로 동작

makeSchemaOptional(z.number());
// 오류: 'ZodNumber'는 'ZodType' 타입의 매개변수에 할당할 수 없음
```

### 에러 처리

Zod는 `ZodError`라는 Error의 하위 클래스를 제공합니다. ZodError는 유효성 검사 문제에 대한 상세 정보를 담고 있는 `issues` 배열을 포함합니다.

```ts
const result = z
  .object({
    name: z.string(),
  })
  .safeParse({ name: 12 });

if (!result.success) {
  result.error.issues;
  /* [
      {
        "code": "invalid_type",
        "expected": "string",
        "received": "number",
        "path": [ "name" ],
        "message": "Expected string, received number"
      }
  ] */
}
```

> 가능한 에러 코드와 에러 메시지를 커스터마이징하는 방법에 대한 자세한 정보는 전용 에러 처리 가이드를 참고하세요: [ERROR_HANDLING.md](ERROR_HANDLING.md)

Zod의 에러 보고는 **완전성**과 **정확성**을 강조합니다. 최종 사용자에게 유용한 에러 메시지를 제공하려면, 에러 맵을 사용해 Zod의 에러 메시지를 재정의하거나, [`zod-validation-error`](https://github.com/causaly/zod-validation-error)와 같은 서드파티 라이브러리를 사용하는 것이 좋습니다.

### 에러 포맷팅

`.format()` 메서드를 사용하여 이 에러를 중첩된 객체로 변환할 수 있습니다.

```ts
const result = z
  .object({
    name: z.string(),
  })
  .safeParse({ name: 12 });

if (!result.success) {
  const formatted = result.error.format();
  /* {
    name: { _errors: [ '문자열이어야 하는데, 숫자가 입력되었습니다' ] }
  } */

  formatted.name?._errors;
  // => ["문자열이어야 하는데, 숫자가 입력되었습니다"]
}
```

이 코드는 `zod` 라이브러리를 사용하여 객체의 유효성을 검사하고, 에러가 발생했을 때 해당 에러를 포맷팅하는 예제입니다. `name` 필드에 숫자 대신 문자열이 입력되어야 하는데, 숫자가 입력되면 에러 메시지가 반환됩니다.

## 비교

다양한 검증 라이브러리가 널리 사용되고 있지만, 대부분 개발자 경험을 저해하는 설계상의 한계를 가지고 있습니다.

<!-- 아래 표는 주요 기능 차이를 요약한 것입니다. 필요한 경우, 표 아래에서 특정 대안에 대해 더 자세히 논의합니다. -->

<!-- | 기능                                                                                                                | [Zod](https://github.com/colinhacks) | [Joi](https://github.com/hapijs/joi) | [Yup](https://github.com/jquense/yup) | [io-ts](https://github.com/gcanti/io-ts) | [Runtypes](https://github.com/pelotom/runtypes) | [ow](https://github.com/sindresorhus/ow) | [class-validator](https://github.com/typestack/class-validator) |
| ---------------------------------------------------------------------------------------------------------------------- | :-----------------------------: | :----------------------------------: | :-----------------------------------: | :--------------------------------------: | :---------------------------------------------: | :--------------------------------------: | :-------------------------------------------------------------: |
| <abbr title='검증자 인스턴스에서 TypeScript 타입을 추출할 수 있는 모든 기능을 포함합니다.'>타입 추론</abbr>         |               🟢                |                  🔴                  |                  🟢                   |                    🟢                    |                       🟢                        |                    🟢                    |                               🟢                                |
| <abbr title="Yup의 경우 특정 상황에서 타입 추론이 정확하지 않습니다. 아래에서 자세히 논의합니다.">정확한 타입 추론</abbr> |               🟢                |                  🔴                  |                  🔴                   |                    🟢                    |                       🟢                        |                    🟢                    |                               🟢                                |

<abbr title="숫자, 문자열, 불리언, null, undefined">기본 타입</abbr>
<abbr title="'이것이 문자열인가?'와 같은 기본 검사 외에도, 최소/최대 길이, 이메일 형식, URL 형식, 대소문자 검사 등을 포함합니다.">문자열 검증</abbr>
<abbr title="'이것이 숫자인가?'와 같은 기본 검사 외에도, 최소/최대 값, 양수 여부, 정수 vs 실수 등을 포함합니다.">숫자 검증</abbr>
날짜

기본 리터럴
객체 리터럴
튜플 리터럴
객체
배열
비어 있지 않은 배열
유니온
옵셔널
널러블
열거형
열거형 자동완성
교차 타입
객체 병합
튜플
재귀 타입
함수 스키마

<abbr title="예를 들어, Yup은 `yup.number().min(5, '숫자는 5보다 커야 합니다!')`와 같은 구문으로 커스텀 에러 메시지를 허용합니다.">검증 메시지</abbr>
불변 인스턴스
타입 가드
유효성 검사
캐스팅
기본값
풍부한 에러
브랜드 -->

<!-- - 누락된 객체 메서드: (pick, omit, partial, deepPartial, merge, extend)

* 적절한 타이핑이 없는 비어 있지 않은 배열 (`[T, ...T[]]`)
* 지연/재귀 타입 누락
* Promise 스키마 누락
* 함수 스키마 누락
* 유니온 및 교차 타입 스키마 누락
* 순환 데이터 파싱 지원 누락 (아마도)
* 에러 커스터마이징 지원 누락 -->

이 표와 설명은 각 라이브러리의 기능을 비교하며, 개발자가 프로젝트에 적합한 도구를 선택할 때 도움을 줍니다. 각 라이브러리의 강점과 약점을 이해하면 더 나은 결정을 내릴 수 있습니다.

### Joi

[https://github.com/hapijs/joi](https://github.com/hapijs/joi)

정적 타입 추적을 지원하지 않습니다 😕

### Yup

[https://github.com/jquense/yup](https://github.com/jquense/yup)

Yup은 처음에 바닐라 자바스크립트로 구현되었고, 이후 타입스크립트로 다시 작성된 기능이 풍부한 라이브러리입니다.

- 캐스팅(casting)과 변환(transforms)을 지원합니다.
- 모든 객체 필드는 기본적으로 선택 사항(optional)입니다.
<!-- - 적절한 타입을 가진 비어 있지 않은 배열(`[T, ...T[]]`)을 지원하지 않습니다. -->
- Promise 스키마를 지원하지 않습니다.
- 함수 스키마를 지원하지 않습니다.
- 유니온(union) 및 인터섹션(intersection) 스키마를 지원하지 않습니다.

<!-- ¹Yup은 `required`라는 단어를 독특하게 해석합니다. "undefined가 아님"을 의미하는 대신, Yup은 이를 "비어 있지 않음"을 의미하는 것으로 사용합니다. 따라서 `yup.string().required()`는 빈 문자열을 허용하지 않으며, `yup.array(yup.string()).required()`는 빈 배열을 허용하지 않습니다. 대신, Yup에서는 Zod 배열과 같이 전용 `.nonempty()` 메서드를 사용하거나 커스텀 리파인먼트(custom refinement)를 통해 이를 구현할 수 있습니다. -->

### io-ts

[https://github.com/gcanti/io-ts](https://github.com/gcanti/io-ts)

io-ts는 gcanti가 만든 훌륭한 라이브러리입니다. io-ts의 API는 Zod의 디자인에 큰 영감을 주었습니다.

우리의 경험상, io-ts는 많은 경우에 개발자 경험보다 함수형 프로그래밍의 순수성을 우선시합니다. 이는 타당하고 존경할 만한 디자인 목표이지만, io-ts를 기존의 절차적 또는 객체 지향적 코드베이스에 통합하기 어렵게 만듭니다. 예를 들어, io-ts에서 선택적 속성을 가진 객체를 정의하는 방법을 살펴보겠습니다.

```ts
import * as t from "io-ts";

const A = t.type({
  foo: t.string,
});

const B = t.partial({
  bar: t.number,
});

const C = t.intersection([A, B]);

type C = t.TypeOf;
// 반환 타입: { foo: string; bar?: number | undefined }
```

필수 속성과 선택적 속성을 별도의 객체 검증기로 정의하고, 선택적 속성을 `t.partial`을 통해 표시한 후, `t.intersection`으로 결합해야 합니다.

Zod에서 동일한 작업을 수행하는 방법은 다음과 같습니다.

```ts
const C = z.object({
  foo: z.string(),
  bar: z.number().optional(),
});

type C = z.infer<typeof C>;
// 반환 타입: { foo: string; bar?: number | undefined }
```

이러한 선언적 API는 스키마 정의를 훨씬 더 간결하게 만듭니다.

`io-ts`는 또한 결과를 파싱하고 오류를 처리하기 위해 gcanti의 함수형 프로그래밍 라이브러리인 `fp-ts`를 사용해야 합니다. 이는 코드베이스를 엄격하게 함수형으로 유지하려는 개발자에게 훌륭한 리소스입니다. 하지만 `fp-ts`에 의존하는 것은 필연적으로 많은 지적 부담을 동반합니다. 개발자는 함수형 프로그래밍 개념과 `fp-ts`의 명명법에 익숙해야 라이브러리를 사용할 수 있습니다.

- 직렬화 및 역직렬화 변환을 지원하는 코덱 지원
- 브랜드 타입 지원
- 고급 함수형 프로그래밍, 고차 타입, `fp-ts` 호환성 지원
- 객체 메서드 부재: (pick, omit, partial, deepPartial, merge, extend)
- 적절한 타입을 가진 비어 있지 않은 배열 부재 (`[T, ...T[]]`)
- Promise 스키마 부재
- 함수 스키마 부재

### Runtypes

[Runtypes GitHub 페이지](https://github.com/pelotom/runtypes)

Runtypes는 **좋은 타입 추론**을 지원합니다.

- **패턴 매칭** 지원: 유니온 타입에 대해 분배되는 계산된 속성
- **누락된 객체 메서드**: `deepPartial`, `merge`와 같은 기능이 없음
- **비어 있지 않은 배열**에 대한 적절한 타입 지원 부재 (`[T, ...T[]]` 형태)
- **Promise 스키마** 지원 미흡
- **에러 커스터마이징** 기능 부재

Runtypes는 타입 추론에 강점이 있지만, 몇 가지 기능이 아직 구현되지 않았습니다. 특히 객체 메서드와 비어 있지 않은 배열에 대한 타입 지원, Promise 스키마, 그리고 에러 커스터마이징 기능이 추가되면 더욱 완벽한 라이브러리가 될 것입니다.

### Ow

[https://github.com/sindresorhus/ow](https://github.com/sindresorhus/ow)

Ow는 함수 입력값 검증에 초점을 맞춘 라이브러리입니다. 복잡한 조건문을 쉽게 표현할 수 있게 해주지만, 타입이 없는 데이터를 파싱하는 기능은 제공하지 않습니다. Ow는 다양한 타입을 지원하며, Zod가 TypeScript의 타입 시스템과 거의 일대일로 매핑되는 반면, Ow는 `int32Array`와 같은 매우 구체적인 타입들을 바로 사용할 수 있게 해줍니다. (자세한 목록은 README에서 확인할 수 있습니다.)

함수 입력값을 검증하고 싶다면, Zod의 함수 스키마를 사용해보세요. 이 방법은 함수 타입 선언을 재사용할 수 있게 해주며, 매번 함수 시작 부분에 Ow 검증문을 복사해 붙여넣는 번거로움을 줄여줍니다. 또한 Zod는 반환 타입도 검증할 수 있기 때문에, 예상치 못한 데이터가 전달되지 않도록 보장할 수 있습니다.

## 변경 내역

변경 내역은 [CHANGELOG.md](CHANGELOG.md)에서 확인할 수 있습니다.
