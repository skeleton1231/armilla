---
id: stack-facts
title: 技术栈版本与集成事实底座(T03 产出)
labels: [wayfinder:research]
ticket: T03
verified-on: 2026-11-01
---

# 技术栈事实底座(2026-11-01 核验)

> **核验方法**:全部事实来自 2026-11-01 当日实时抓取的官方文档(nextjs.org / ui.shadcn.com / r3f.docs.pmnd.rs / drei.docs.pmnd.rs / threejs.org / next-intl.dev)、npm registry API(`registry.npmjs.org/<pkg>/latest`)与 bundlephobia API。代码片段照抄官方文档并逐段注明来源页;未能在一手来源核实的项已显式标注「未核实」。latest tag 会随后续发布漂移,开工时以 `registry.npmjs.org/<pkg>/latest` 复核。

## 0. 将采用的确切版本(事实表)

| 包 | 采用版本 | 关键事实 | 核验依据 |
|---|---|---|---|
| `next` | **16.4.3**(major 16,latest tag) | Turbopack 为 dev+build 默认;Cache Components 于 16.0 稳定 | registry.npmjs.org/next/latest;registry.npmjs.org/-/package/next/dist-tags |
| `react` / `react-dom` | **19.3.1**(19.x 现行最新) | 与 fiber peer `react >=19 <19.4` 相容;drei/next-intl/postprocessing 均接受 ^19 | registry.npmjs.org/react/latest |
| `shadcn`(CLI,非运行时依赖) | **4.23.0**(`npx shadcn@latest`) | 组件代码复制进仓库;init 会加 `@import "shadcn/tailwind.css"`(可用 `shadcn eject` 内联) | registry.npmjs.org/shadcn/latest |
| Tailwind CSS | **v4**(create-next-app 默认线) | shadcn 新项目 = Tailwind v4 + React 19;HSL→OKLCH | ui.shadcn.com/docs/tailwind-v4 |
| `three` | **0.187.0**(= GitHub r187,2026-10-30) | 无 peers;体积见 §3.4 | registry.npmjs.org/three/latest |
| `@react-three/fiber` | **9.8.2** | v9 = React 19 适配大版本;peers `react >=19 <19.4`、`three >=0.156` | registry.npmjs.org/@react-three/fiber/latest |
| `@react-three/drei` | **10.7.9** | peers `@react-three/fiber ^9.0.0`、`react ^19`、`three >=0.159` | registry.npmjs.org/@react-three/drei/latest |
| `next-intl` | **4.14.9**(major 4) | peers 含 `next ^16.0.0`,官方支持 Next 16 | registry.npmjs.org/next-intl/latest |

兼容矩阵结论(全部来自各包 registry peers 实测):**next 16.4.3 + react 19.3.1 + fiber 9.8.2 + drei 10.7.9 + three 0.187.0 + next-intl 4.14.9 为官方现行稳定组合,无 peer 冲突**。React 18 项目才需退到 fiber 8.18.0 终版(peers `react >=18 <19`)。

---

## 1. Next.js 16

### 1.1 App Router / RSC 约定

- **默认即 Server Component**:文档原文 "By default, layouts and pages are Server Components"。来源:https://nextjs.org/docs/app/getting-started/server-and-client-components
- **Client Component 声明**:文件顶部(import 之前)`'use client'`,作用于整个模块;`"use client"` 定义 Server/Client 模块图边界,标记后其所有导入进入 client bundle。来源:https://nextjs.org/docs/app/api-reference/directives/use-client
- **文件约定**:`app/page.tsx`(default export 即路由,文件夹=路由段,`[slug]` 动态段)、`app/layout.tsx`(根布局必需且必须含 `<html>` 与 `<body>`)、`loading.tsx`(自动 Suspense 包裹 page 及下层)、`error.tsx`(**必须是 Client Component**;16.3 起 `retry` prop 稳定,16.2 为 `unstable_retry`)。来源:https://nextjs.org/docs/app/getting-started/layouts-and-pages 、https://nextjs.org/docs/app/api-reference/file-conventions/error

```tsx
// 根布局最小形态(照抄文档) 来源: layouts-and-pages 页
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}
```

### 1.2 next/dynamic 现行写法(3D client island 的关键)

现行文档位置:懒加载指南 https://nextjs.org/docs/app/guides/lazy-loading (原 API reference 页 `/docs/app/api-reference/functions/next-dynamic` 本日实测 **404**)。要点:

- `next/dynamic` = `React.lazy()` + Suspense 的组合封装;"Lazy loading applies to Client Components"(Server Components 自动 code split,无需 dynamic)。
- **`ssr: false` 规则仍然有效且是硬约束**,文档原文:"`ssr: false` option is not supported in Server Components. You will see an error if you try to use it in Server Components… Please move it into a Client Component."
- 即:**文档推荐的现代写法 = 包一层 `'use client'` 组件再 dynamic**:

```jsx
// 照抄文档(截选) 来源: lazy-loading 指南
'use client'
import dynamic from 'next/dynamic'
const ComponentC = dynamic(() => import('../components/C'), { ssr: false })
```

- 另注意指南记录:Server Component 动态 import Client Component 时 "automatic code splitting is currently **not** supported"。替代方案 `React.lazy()` + `<Suspense>` 同页有述。

### 1.3 Turbopack 状态

- **Next 16 起 Turbopack 是默认 bundler,dev 与 build 均是**。文档原文:"Turbopack is now the default bundler in Next.js. No configuration is needed"。来源:https://nextjs.org/docs/app/api-reference/turbopack
- CLI:`--turbopack`(默认启用,别称 `--turbo`)与 `--webpack`(显式退回 webpack,无原生绑定的 WASM 平台必须用它)。来源:https://nextjs.org/docs/app/api-reference/cli/next
- next.config:`turbopack.root`(绝对路径,monorepo 用)及 `rules`/`resolveAlias` 等;webpack 插件与 `webpack()` 配置不被识别(webpack **loaders** 经 `turbopack.rules` 支持);Yarn PnP、`sassOptions.functions`、Legacy CSS Modules 特性等不计划/暂不支持。来源:https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack

### 1.4 缓存与 ISR(Next 16 = 双模型,选型必读)

**模型 A:Cache Components(16.0 稳定,新项目默认)**

- `'use cache'` 指令:v15 引入 experimental,**v16.0.0 稳定**。来源:https://nextjs.org/docs/app/api-reference/directives/use-cache
- `cacheComponents` 顶层配置:v16.0.0 从 `experimental.cacheComponents` 稳定;统一控制 ppr/useCache/dynamicIO;**要求 Node.js runtime**。create-next-app 新项目默认开启。来源:https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents 、https://nextjs.org/docs/app/getting-started/caching

```ts
// 照抄文档 来源: getting-started/caching
const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
}
```

```tsx
// 照抄文档(截选) 来源: use-cache 指令页
import { cacheLife } from 'next/cache'
export async function getUsers() {
  'use cache'
  cacheLife('hours')
  return db.query('SELECT * FROM users')
}
```

- **启用 Cache Components 后,Route Segment Config 的 `dynamic`、`revalidate`、`fetchCache`、`experimental_ppr` 被移除**,新增 `ensureStatic`;`cookies`/`headers`/`params` 成为 runtime APIs,需 `<Suspense>` 流式包裹,不再把整页 opt in 动态渲染。来源:https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config (该页对 `dynamicParams` 表述前后矛盾,属文档自身问题,特此标注)
- Cache Components 下的 ISR = `generateStaticParams` + App Shell + 后台升级缓存。来源:https://nextjs.org/docs/app/guides/incremental-static-regeneration-cache-components

**模型 B:Previous Model(不开 cacheComponents 时)**

- fetch 默认不缓存,显式 opt-in:`{ cache: 'force-cache' }` 或 `{ next: { revalidate: 3600 } }`。来源:https://nextjs.org/docs/app/guides/caching-without-cache-components 、https://nextjs.org/docs/app/api-reference/functions/fetch
- 经典 ISR:`export const revalidate = 60`(layout/page/route 级)+ `generateStaticParams`。来源:https://nextjs.org/docs/app/guides/incremental-static-regeneration
- `unstable_cache` 仍存在但文档明确:**"This API has been replaced by `use cache` in Next.js 16"**,建议迁移。来源:https://nextjs.org/docs/app/api-reference/functions/unstable_cache
- 按需失效:`next: { tags: [...] }` + `revalidateTag`/`revalidatePath`。

> 对本项目(静态命盘页、无数据库、URL 分享):新项目默认落在模型 A,规格里应按 `'use cache'` + `cacheComponents` 语义书写缓存策略,不要再用 `revalidate`/`dynamic` 段配置。

---

## 2. shadcn/ui(CLI 4.23.0)

### 2.1 分发模式(与常规组件库不同)

- 文档原文:"This is not a component library. It is how you build your component library." 组件代码由 CLI 复制进项目 `components/ui`(aliases 见 `components.json`),导入形如 `import { Button } from "@/components/ui/button"`。npm 包 `shadcn` 只是 CLI(**无 peerDependencies**;`engines: node >= 20.18.1`)。来源:https://ui.shadcn.com/docs 、https://registry.npmjs.org/shadcn/latest
- 2026-05 起变化:`init` 会在全局 CSS 加 `@import "shadcn/tailwind.css"`(一个小型 tree-shaken 依赖);`npx shadcn@latest eject` 可内联该 CSS 并移除依赖。来源:https://ui.shadcn.com/docs/changelog/2026-05-shadcn-eject

### 2.2 对最新 Next.js + Tailwind 4 的初始化(命令照抄文档)

```bash
# 照抄文档 来源: ui.shadcn.com/docs/installation/next
npx create-next-app@latest        # 默认项含 Tailwind v4 / App Router / @/* 别名
npx shadcn@latest init
npx shadcn@latest add button
```

另有两条路径:`npx shadcn@latest init -t next`(CLI 直接脚手架)与 `init --preset <CODE> --template next`。`init` 做的事(文档原文):"installs dependencies, adds the `cn` util and configures CSS variables for the project" → 产出 `components.json`、`lib/utils`(cn)、`globals.css` 主题变量。来源:https://ui.shadcn.com/docs/installation/next 、https://ui.shadcn.com/docs/cli
- 旧地址 `/docs/installation/tailwind-v4` 已 404,Tailwind v4 内容现居 https://ui.shadcn.com/docs/tailwind-v4 (副标题 "How to use shadcn/ui with Tailwind v4 and React 19",并注明对 v3/React 18 旧项目 non-breaking)。

### 2.3 Theming 机制(CSS 变量,现行语法)

- 文档原文:"We use and recommend CSS variables for theming","These tokens live in your CSS file under `:root` and `.dark`";颜色 **OKLCH**("HSL colors are now converted to OKLCH")。来源:https://ui.shadcn.com/docs/theming
- Tailwind v4 专属语法(`@theme inline` 映射 + `@custom-variant dark`),默认 neutral 主题开头照抄:

```css
/* 照抄文档(截选) 来源: ui.shadcn.com/docs/theming */
@import "tailwindcss";
@import "shadcn/tailwind.css";
@custom-variant dark (&:is(.dark *));
@theme inline {
  --color-background: var(--background);
  --color-primary: var(--primary);
  /* ... */
  --radius-lg: var(--radius);
}
:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --primary: oklch(0.205 0 0);
}
.dark {
  --background: oklch(0.145 0 0);
  --border: oklch(1 0 0 / 10%);
}
@layer base {
  * { @apply border-border outline-ring/50; }
  body { @apply bg-background text-foreground; }
}
```

- 暗色切换:`.dark` 类覆盖同批 token;官方 provider 为 **next-themes**(`<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>`,`<html suppressHydrationWarning>`)。来源:https://ui.shadcn.com/docs/dark-mode/next
- `components.json`:`tailwind.cssVariables: true` 默认;Tailwind v4 项目 `tailwind.config` 字段留空("For Tailwind CSS v4, leave this blank.")。来源:https://ui.shadcn.com/docs/components-json
- 对本项目:浑仪·青铜 tokens 应直接以 oklch 写入 `:root`/`.dark` 的这套变量 —— T09 设计票的载体。

### 2.4 表单组件与 TanStack 集成(结构已重组,勿用旧写法)

- **旧 `/docs/components/form` 已 308 重定向到 `/docs/forms`**;基于 react-hook-form 的旧 `Form` 包装组件不再是主推。
- 现行表单中心 https://ui.shadcn.com/docs/forms 列四选项:React Hook Form、**TanStack Form**、Formisch、useActionState(Coming Soon);统一做法是 **`<Field />` 组件 + 自选表单库**("complete flexibility over the markup and styling")。`npx shadcn@latest add field`。
- **TanStack Form 专用指南存在**(https://ui.shadcn.com/docs/forms/tanstack-form ),核心写法照抄:

```tsx
// 照抄文档(截选) 来源: ui.shadcn.com/docs/forms/tanstack-form
import { useForm } from "@tanstack/react-form"
import * as z from "zod"
import { Field, FieldLabel, FieldError, FieldGroup, FieldDescription } from "@/components/ui/field"

const form = useForm({
  defaultValues: { title: "", description: "" },
  validators: { onSubmit: formSchema },   // zod schema 经 Standard Schema 接入
  onSubmit: async ({ value }) => { /* ... */ },
})
```

- 字段级:`const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid`;`<Field data-invalid={isInvalid}>` + `<FieldError errors={field.state.meta.errors} />`。文档注明 "TanStack Form integrates seamlessly with Zod and other Standard Schema validation libraries through its validators API"。示例基于 zod v3。
- 对本项目(T10 出生输入表单):官方文档同时覆盖 RHF 与 TanStack Form,T10 可按需选;`<Field />` 是两案共同的 UI 载体。

---

## 3. three.js / @react-three/fiber / drei

### 3.1 版本与兼容矩阵(registry peers 实测)

| React 线 | fiber | drei | 说明 |
|---|---|---|---|
| React 19.0–19.3.x(现行 19.3.1) | **v9(9.8.2)** | **v10(10.7.9)** | 官方现行组合 |
| React 18.x | v8 终版 8.18.0 | v9 线 | fiber 8 peers `react >=18 <19` |

- r3f 官方文档原文:"**fiber@8 pairs with react@18, fiber@9 pairs with react@19**"。来源:https://r3f.docs.pmnd.rs/getting-started/installation
- fiber v9.0.0 GitHub release 首句:"This is a compatibility release for React 19"。来源:https://github.com/pmndrs/react-three-fiber/releases/tag/v9.0.0
- drei v10.0.0:"BREAKING CHANGE: React 19 support",peers `@react-three/fiber ^9.0.0`。来源:https://github.com/pmndrs/drei (releases)
- 预发布通道(勿用于生产):fiber `alpha = 10.0.0-alpha.6`(方向 "Going WebGPU First")、drei `alpha = 11.0.0-alpha.7`。

### 3.2 React 19 的已知坑(v9 迁移指南,官方口径)

来源:https://r3f.docs.pmnd.rs/tutorials/v9-migration-guide + v9.0.0 release notes:

1. **StrictMode 从父渲染器继承**,不再在 `<Canvas>` 内重复声明;dev 下副作用会被暴露/双执行(先 dev 后 prod profile)。
2. **JSX 类型重构**:全局 `JSX` 命名空间声明移除 → 对 `ThreeElements` 接口做 module augmentation;`MeshProps` 等改 `ThreeElements['mesh']` —— TS 迁移工作量主要在此。
3. Canvas 的 `Props` 类型更名 `CanvasProps`。
4. **纹理自动 sRGB 转换移除**,需手动 `texture.colorSpace = THREE.SRGBColorSpace`。
5. 测试 `act` 改从 `react` 导出;`gl` prop 可返回 Promise(WebGPU 渲染器异步初始化)。

### 3.3 SSR / Next.js 集成注意点

- r3f 官方文档对 Next.js 的唯一硬性要求 = **转译 three**(照抄):`module.exports = { transpilePackages: ['three'] }`(Next.js ≥13.1)。来源:https://r3f.docs.pmnd.rs/getting-started/installation
- Canvas 必须走 client island:`'use client'` 组件内 `dynamic(() => import(...), { ssr: false })`。该模式来自官方文档链接的脚手架 pmndrs/react-three-next(App Router 架构,`app/page.jsx` 顶部 `'use client'`),与 Next.js 懒加载指南的 `ssr: false` 规则(§1.2)一致。注意该脚手架最后更新 2024-06,是官方参考实现而非活跃维护。来源:https://github.com/pmndrs/react-three-next
- drei `<Text>`(troika)需 `<Suspense>` 包裹。来源:https://drei.docs.pmnd.rs/abstractions/text
- 图表后期可选 `@react-three/postprocessing@3.2.2`(peers `react ^19`、`fiber >=9.7.0`、`three >=0.156`,与现行组合完全对齐)。来源:registry.npmjs.org/@react-three/postprocessing/latest

### 3.4 包体积量级(bundlephobia API 实测,精确版本)

| 包@版本 | minified | gzipped | 口径 |
|---|---|---|---|
| `three@0.187.0` | ≈725 KB | **≈186 KB** | 全量模块入口(core);tree-shaking 后通常低于此(未核实单一名权威数字) |
| `@react-three/fiber@9.8.2` | ≈179 KB | ≈56 KB | 含 react-reconciler/scheduler/zustand;peers 不计 |
| `@react-three/drei@10.7.9` | ≈1.64 MB | ≈509 KB | **整包全量**,不代表实际用量 |

- drei 声明 `sideEffects: false`(jsdelivr package.json 实测),按 helper 具名 import 时远小于整包数字。来源:https://bundlephobia.com/api/size?package=three@0.187.0 等;https://cdn.jsdelivr.net/npm/@react-three/drei@10.7.9/package.json
- jsdelivr 文件级佐证:`three.module.js` 658,900 B、WebGPU 入口 `three.webgpu.js` 1,350,894 B(约核心 2 倍)→ 走 WebGPU/TSL 线体积显著更大(fiber v10 alpha 才是 WebGPU-first)。来源:https://data.jsdelivr.com/v1/packages/npm/three@0.187.0?structure=flat

---

## 4. next-intl(4.14.9,major 4)

### 4.1 官方推荐 App Router 配置(`[locale]` 子路径)

peers(逐字):`next: ^12.0.0 || ^13.0.0 || ^14.0.0 || ^15.0.0 || ^16.0.0`(官方支持 Next 16)、`react: ... || ^19.0.0`。文件结构(照抄文档):

```
src
├── i18n
│   ├── routing.ts
│   ├── request.ts
│   └── navigation.ts
├── proxy.ts          # ← Next.js 16 前叫 middleware.ts
└── app
    └── [locale]
        ├── layout.tsx
        └── page.tsx
```

来源:https://next-intl.dev/docs/getting-started/app-router 、https://next-intl.dev/docs/routing/setup

```ts
// 照抄文档 来源: next-intl.dev/docs/routing/setup
import {defineRouting} from 'next-intl/routing';
export const routing = defineRouting({
  locales: ['en', 'zh'],   // 本项目双树(示例值,文档原例为 en/de)
  defaultLocale: 'zh'
});
```

- `app/layout.tsx` 中 `<NextIntlClientProvider>{children}</NextIntlClientProvider>` **无需传 locale/messages props**(自动继承全部 messages)。来源:https://next-intl.dev/docs/environments/server-client-components
- `next.config.ts` 用 `createNextIntlPlugin()` 包裹;`i18n/navigation.ts` 用 `createNavigation(routing)` 导出 `Link/redirect/usePathname/useRouter`。来源:https://next-intl.dev/docs/routing/setup

### 4.2 根路径 Accept-Language 重定向(现名 proxy.ts)

- **文件名变化**:Next.js 16 起 `middleware.ts` 更名 **`proxy.ts`**(文档原文:"proxy.ts was called middleware.ts up until Next.js 16"),导入路径不变仍为 `next-intl/middleware`。来源:https://next-intl.dev/docs/routing/middleware

```ts
// 照抄文档 来源: next-intl.dev/docs/routing/middleware
import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
};
```

- 检测优先级:① pathname 前缀 → ② cookie `NEXT_LOCALE`(session,sameSite lax)→ ③ **Accept-Language**(`@formatjs/intl-localematcher` best-fit)→ ④ `defaultLocale`。访问 `/` 即按此协商 **redirect 到 `/en` 或 `/zh`**。来源:https://next-intl.dev/docs/routing/middleware 、https://next-intl.dev/docs/routing/configuration

### 4.3 Static Rendering 兼容(两条路线)

- **路线 A(现行推荐,Next 16.3+ 默认可用)`next/root-params`**:文档原文 "your app is automatically eligible for static rendering";`request.ts` 内 `await rootParams.locale()` + `hasLocale` 校验;再补:

```ts
// 照抄文档 来源: next-intl.dev/docs/routing/setup
export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}
```

- **路线 B(legacy)`setRequestLocale`**:文档明确标注 "a legacy API… recommended to use next/root-params instead";要求每个静态 layout/page 都调用、且在任何 next-intl API 之前。来源:https://next-intl.dev/docs/routing/setup (Static rendering 章)
- 不用上述任一方案时,`useTranslations` 等 API 会使 Server Component **opt in 动态渲染**。
- 本项目在 Next 16.4.3(≥16.3)→ 直接走路线 A。

---

## 5. 给 T06(3D 栈选型)的事实提示

1. **React 19 + fiber 9 + drei 10 是官方现行稳定线**,与 next 16.4.3 / react 19.3.1 无 peer 冲突;fiber v10(WebGPU-first)仅 alpha,选型应锁 9.x。原生 three.js 路线则无 React 绑定层,但 §3.4 的 three 核心体积(~186KB gz 全量)是两条路线共同的底座成本。
2. 无论选哪条路线,**必须 client island**:`'use client'` 包装 + `dynamic(..., { ssr: false })`(Next 16 禁止 Server Component 内 ssr:false,§1.2)+ `transpilePackages: ['three']`(§3.3)。
3. R3F 路线的额外成本:fiber ~56KB gz(含 react-reconciler 等)+ v9 的 TS 迁移坑(ThreeElements module augmentation、CanvasProps、StrictMode 继承,§3.2);drei 按 helper 导入(tree-shakable,整包数字无意义,§3.4)。
4. 生态已验证:postprocessing 3.2.2(鎏金辉光/后期)与 drei `<Text>`(需 Suspense)均兼容现行组合。

## 6. 给 T11(性能预算)的事实提示

1. **3D chunk 预算的事实锚点**:three 全量入口 ≈725KB min / **≈186KB gz**(r187 实测;具名导入 tree-shaking 后更低,无单一权威数字,预算应写"实测 bundle 报告为准,上限 X");fiber 再 +≈56KB gz;drei 按 helper 计。WebGPU 入口约为核心 2 倍,不进预算。
2. landing 页不得加载 three:靠 §1.2 的 dynamic 写法把 3D 隔离成独立 chunk,与 landing 的 JS 预算解耦;`@layer base` 的 oklch token(§2.3)不增加运行时。
3. 字体预算(≤2 族、preload 关键字重、swap)与全局 web 规则对齐;shadcn init 不引入字体运行时成本。
4. `next dev` 与 `next build` 在 Next 16 默认即 Turbopack(§1.3),验收口径以 Turbopack build 产物为准;`--webpack` 仅作回退。
5. 缓存/ISR 策略按模型 A(`'use cache'` + `cacheComponents`,新项目默认)书写;注意其**要求 Node.js runtime**,且 `revalidate`/`dynamic` 段配置在该模型下已被移除(§1.4)—— T11/T05 定 ISR 策略时不要引用旧 API。

---

## 附:全部来源(本日实际抓取并依赖)

**npm registry / 体积 API**:registry.npmjs.org 的 `next/latest`、`next` dist-tags、`react/latest`、`shadcn/latest`、`three/latest`、`@react-three/fiber/latest`(+ 8.18.0)、`@react-three/drei/latest`、`@react-three/postprocessing/latest`、`next-intl/latest`;bundlephobia.com/api/size?package=…(three@0.187.0、@react-three/fiber@9.8.2、@react-three/drei@10.7.9);data.jsdelivr.com/v1/packages/npm/three@0.187.0、cdn.jsdelivr.net/npm/@react-three/drei@10.7.9/package.json

**Next.js**:nextjs.org/docs/app/ 下 getting-started/server-and-client-components、getting-started/layouts-and-pages、getting-started/caching、api-reference/directives/use-client、api-reference/directives/use-cache、api-reference/file-conventions/loading、api-reference/file-conventions/error、api-reference/file-conventions/route-segment-config、api-reference/functions/fetch、api-reference/functions/unstable_cache、api-reference/functions/next-dynamic(404 验证)、api-reference/turbopack、api-reference/cli/next、api-reference/config/next-config-js/turbopack、api-reference/config/next-config-js/cacheComponents、guides/lazy-loading、guides/caching-without-cache-components、guides/incremental-static-regeneration、guides/incremental-static-regeneration-cache-components

**shadcn/ui**:ui.shadcn.com/docs、/docs/installation、/docs/installation/next、/docs/installation/tailwind-v4(404 验证)、/docs/tailwind-v4、/docs/theming、/docs/dark-mode(/next)、/docs/cli、/docs/components-json、/docs/components/form(308 验证)、/docs/forms(/react-hook-form、/tanstack-form)、/docs/components/base/field、/docs/changelog/2026-05-shadcn-eject、/docs/changelog/2026-03-cli-v4;及 GitHub shadcn-ui/ui main 分支 apps/v4/content/docs/ 对应 MDX 源

**three/R3F/drei**:r3f.docs.pmnd.rs/getting-started/installation、r3f.docs.pmnd.rs/tutorials/v9-migration-guide、drei.docs.pmnd.rs/abstractions/text、threejs.org/docs/manual/en/introduction/Installation.html;github.com/pmndrs/react-three-fiber/releases/tag/v9.0.0、pmndrs/drei v10.0.0 release、api.github.com/repos/mrdoob/three.js/releases(r187)、github.com/pmndrs/react-three-next

**next-intl**:next-intl.dev/docs/getting-started/app-router、/docs/routing/setup、/docs/routing/middleware、/docs/routing/configuration、/docs/environments/server-client-components、sitemap.xml(确认现行页面清单);github.com/amannn/next-intl(README 无版本声明,确认)
