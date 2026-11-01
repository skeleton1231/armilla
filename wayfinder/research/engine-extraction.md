# T02 研究产出 · 上游紫微引擎提取与许可审计

- 上游: <https://github.com/Renhuai123/ziwei-doushu>(MIT),浅克隆于 `D:\tmp\ziwei-doushu-research`
- 基准 commit: `495b79ecb3524b20b2edc026067d7d0b0f407319`(2026-10-31,与线上商业版同口径的引擎快照)
- 方法: 全程只读源码(未执行上游代码、未安装依赖);`lib/ziwei` 21 文件逐行通读 + 全仓 import/许可 grep + 10 个回归测试用例提取;关键结论均带 `file:line` 证据(行号相对上游仓库根)。
- 一句话结论: **上游不是独立排盘实现,而是 "npm iztro + lunar-javascript 作基座、MIT 校准层对齐主流排盘口径" 的编排层;推荐按"npm 基座 + vendored 校准层"混合路线移植,倪师原话三处红线(HemingMethodology/nihai/tianji-ziwei)一行不进仓库。**

---

## 1. 上游引擎的真实架构(先破除误解)

`lib/ziwei/` 共 21 文件 5,229 行,但**排盘基座是两个 npm 包**,全部计算依赖只有两处 import:

- `iztro ^2.5.8`(lock 实装 2.6.1,MIT):仅 `algorithm.ts:6` `import { astro } from 'iztro'`,调用点为 `astro.config()`(:92,模块加载副作用)、`astro.bySolar()`(:485,默认路径)、`astro.byLunar()`(:475,闰月非 split 策略)、`astrolabe.horoscope().age.nominalAge`(:577,虚岁)。
- `lunar-javascript ^1.7.3`(lock 实装 1.7.7,MIT,无自带类型,靠仓内手写 `lunar-javascript.d.ts`):`algorithm.ts:7`(Solar/LunarMonth,农历换算 + `getEightChar()` 节气四柱)、`sihua.ts:11`(Lunar,流日干)、`lunar-solar.ts:18`(Lunar/LunarMonth,历法互转)。

上游真正的增值是**校准层(calibration patches)**——把 iztro 裸输出逐星对齐"主流排盘软件默认口径"(README.md:305-317 自述 8 项差异能力,均有注释记录金标准盘实证):

| 校准项 | 位置 | 内容 |
|---|---|---|
| 换年规则 | algorithm.ts:92 `yearDivide:'normal'` | 正月初一换年(非立春),与主流软件一致 |
| 星曜亮度 | school-data.ts:296 `schoolStarBrightness` + school-tables.generated.ts SB_QS/XD1/ZZ/XD2 | 85 星×12 宫四套亮度表,全盘亮度不走 iztro 而查此表(默认《斗数全书》QS) |
| 天魁天钺 | algorithm.ts:363 `applySchoolKuiyue` | 辛年魁钺对调(KY1 派) |
| 大耗/截空副截/副旬 | algorithm.ts:377-442 | 年支大耗阴阳支±1、截空副截阴干换宫、旬空成对 |
| 闰月四口径 | algorithm.ts:137 `resolveEffectiveLunarDate` + school-config.ts:77(默认 `split`) | split/next-month/prev-month/origin-month |
| 节气四柱 | algorithm.ts:218-249 | `getEightChar()` 精确到立春/交节**时刻**(修正 iztro/lunar 按日切换的错位);另手算五虎遁得农历口径四柱 |
| 真太阳时/夏令时 | true-solar-time.ts(NOAA 均时差)、dst-cn.ts(XLS_CN 表 1935-1991)、clock-adjust.ts | 经度+均时差+海外 utcOffset;DST 只提示不自动减 |
| 命主/身主 | algorithm.ts:265-275 查表 | MING_ZHU/SHEN_ZHU |
| 日期合法性 | algorithm.ts:449-460 | 2 月 30 日等直接抛错,防 iztro 静默顺延成错盘 |

**含义**: iztro 裸调用 ≠ 上游盘面。上游盘面 = iztro 输出 + 上述补丁。这就是路线选择的根据。

---

## 2. 移植方案建议

### 2.1 推荐路线:**C · npm 基座 + vendored 校准层**(混合)

保持 `iztro` 与 `lunar-javascript` 为 npm 直接依赖(锁次版本),把 `lib/ziwei` 校准层整目录 vendored 移植(MIT 允许),重命名进我们引擎包(如 `src/lib/engine/`)。

**理由**:

1. **校准层是上游最值钱的资产**,且全部以"iztro 输出的 palaces 数组"为操作对象(KY 换位、亮度覆写、截空改名)——只有保住同一个基座,校准才继续成立。上游 README §八承诺引擎层随线上发版同步打 tag,跟进成本可控。
2. **基座不值得 vendored**:iztro 自身体量远大于校准层,vendored 它等于维护一个 fork,且上游从未针对 fork 场景设计。
3. **校准层不可省**:裸用 iztro 会丢掉与主流软件逐星对齐的全部修正(README.md:305-317 列的 8 项能力全来自校准层),我们的"确定性解读"建立在盘面正确性上,这笔账不能省。
4. 版本敏感性:补丁针对 iztro 2.6.1 / lunar-javascript 1.7.7 的行为与字段形状,package.json 建议锁 `2.6.1` / `1.7.7`(至少锁次版本并在升级时跑黄金用例回归)。

### 2.2 三条路线代价对比

| 路线 | 做法 | 代价 | 结论 |
|---|---|---|---|
| A · 全 vendored | 连 iztro 内部排星逻辑一并搬入 | 重写全部校准补丁的基准(每处补丁都摸 iztro 内部数据形状);自行维护 fork;丧失上游同步通道 | ✗ 不取 |
| B · 纯 npm 直调 | 只用 iztro/lunar-javascript,自己写薄封装 | 丢掉全部口径校准(亮度 24 处修正、闰月 split、KY1、大耗/截空/副旬、节气四柱时刻精度、真太阳时/DST 链);要自己复刻"150 组金标准盘"级别的对齐工作量 | ✗ 不取 |
| **C · 混合(推荐)** | **npm iztro + lunar-javascript,vendored `lib/ziwei` 校准层** | 跟踪上游 lib/ziwei 更新;锁依赖次版本;移植时做下述 5 项清理 | **✓ 工作量最小、口径最准、可回归** |

### 2.3 移植清单(vendored 进我们仓库的文件)

**直接拿(改 import 路径即可)**:

`types.ts`(121 行)、`constants.ts`(126)、`algorithm.ts`(662)、`sihua.ts`(276)、`school-data.ts`(431)、`school-tables.generated.ts`(62)、`lunar-solar.ts`(79)、`true-solar-time.ts`(166)、`dst-cn.ts`(92)、`clock-adjust.ts`(38)、`shier-shen.ts`(164)、`yunxian-context.ts`(124)、`cities.ts`(704,城市经度数据表)、`lunar-javascript.d.ts`(32,建议顺手补全 `Solar.fromYmdHms`/`getEightChar` 声明,消灭 algorithm.ts:209/:227 的 `as any`)。

**拿但必须清洗**:

- `patterns.ts`(1119 行格局库):**删改 6 处"倪师说/倪师讲"短引**(见 §5 不能拿栏);删 `import 'server-only'`(:18)或保留(若只在 RSC 用)。其 `古书云` 短句属传统古诀,公版性质可留。
- `famous.ts`(可选,名人示例数据):删改 2 处倪师提法(:59、:109);时辰是公开文献估算值,只能当快照基线不是真值。
- `school-config.ts`(291):只取类型 + `DEFAULT_LEAP_MONTH='split'` 常量;localStorage/URL 参数部分是浏览器耦合,按我们的 URL 分享方案重写。

**参考但重写**:

- `share.ts`:逻辑要,形态不要——`BirthFormState` 组件类型耦合须解耦;`calcTrueSolarBranch`(:5,仅经度修正的简化版)**不要搬**,统一走 `true-solar-time.ts` 完整版(见 2.4 坑 2)。

**不拿**: `heming-knowledge.ts`、`history.ts`(React+localStorage hook,我们 RSC 架构用不上)、`db-analysis.ts`(开源占位,STAR_DB 为空)。

### 2.4 移植时的 5 个坑(全部有源码证据)

1. **`astro.config` 是模块级全局副作用**(algorithm.ts:92,作者自己注明多用户服务端有 race 风险 :100-102)。我们 RSC 服务端只在模块加载时设一次默认配置、**不做运行时流派切换**(`setBrightnessSchool` 会污染后续所有请求);v1 固定默认口径(亮度 QS / 闰月 split / 晚子时次日)即可,流派切换若将来要做需改为纯函数参数。
2. **上游有两套真太阳时**:完整版 `true-solar-time.ts`(经度+NOAA 均时差+utcOffsetMinutes,开源版只有回归测试在用)vs 简化版 `BirthForm.tsx:27`/`share.ts:5`(仅经度修正)。开源 /chart 页实际走简化版。**我们接完整版**,在服务端 form→BirthInfo 层统一换算。
3. **晚子时换日不一致**:`share.formToBirthInfo` 23 点换次日(share.ts:26-34),`BirthForm.handleSubmit` 不换——同仓库 /heming 与 /chart 行为不同。我们只在服务端做一次(用 `resolveZiweiDayOffset` 的四规则,默认 `next-day`),并按 types.ts `origInput` 字段设计保留原始输入供展示。
4. **`'server-only'` import**:patterns.ts:18、famous.ts:6 有,但 `server-only` 不在其 package.json(靠 Next 内建别名)。我们引擎跑在 RSC 服务端正合适;若 3D client island 需要复用某模块,删该行。
5. **types.ts 有三个"已下线"字段**:`Palace.selfSihua`、`DaXian.stemIndex/stemName/siHua` 当前 `generateChart` 不再填充(algorithm.ts:615-627 注释"飞星派已下线"),`analysisCacheProfile` 是商业版 API 写入的。移植时建议清理类型,避免误用。

### 2.5 对本站架构(MAP.md 约束)的映射

- **服务端排盘**:`generateChart` 是同步纯函数,放进 RSC/route handler 正合适;输出 `ZiweiChart` JSON 序列化后传给 3D client island。数字索引输出(branch/stem 0-11、palace 数组)天然适合 i18n——重内容(星曜名/宫名/格局文案)按 MAP.md 拆独立数据文件,不入 messages。
- **URL 分享**:上游 `formToSearchParams`(share.ts:51,n/y/m/d/h/mi/p/c/lo/g)可作起点,但要加签名/校验防脏输入,并区分"用户原始钟表时间"与"引擎排盘日"(origInput)。
- **运行时**:lunar-javascript 是纯 JS 计算库,nodejs runtime 无问题;edge runtime 未验证,T11 定缓存策略时再验证,默认按 nodejs。

---

## 3. 模块清单表(lib/ziwei 全部 21 文件)

依赖图速览:`algorithm → types/constants/school-data/school-tables.generated/school-config(仅常量)`;`sihua → types/constants/yunxian-context`;`school-data → school-tables.generated`;`shier-shen → constants(禄存表)`;其余文件目录内零依赖或仅 types。

| 文件(行数) | 职责 | 外部依赖 | 移植判定 |
|---|---|---|---|
| algorithm.ts(662) | 主入口 `generateChart`:校验→闰月归属→iztro 起盘→十二宫组装+全部校准补丁→四柱→命主身主 | iztro、lunar-javascript | ✅ 直接拿 |
| types.ts(121) | 核心类型 BirthInfo/LunarInfo/Star/Palace/DaXian/ZiweiChart | 无 | ✅ 直接拿(清理 3 个下线字段) |
| constants.ts(126) | 干支/时辰/宫名/纳音/四化表 SI_HUA_TABLE/魁钺/禄存/天马/主星描述 | 无 | ✅ 直接拿 |
| sihua.ts(276) | 年干/大限/流年/流月/流日/流时四化 + 自化检测 + 来因宫 + overlay(开源版无调用方,运限层要用) | lunar-javascript(Lunar.fromYmd) | ✅ 直接拿 |
| school-data.ts(431) | 亮度查询 `schoolStarBrightness`(引擎实际亮度来源)+ 星 ID 表 + 命主身主表 + 庚年四化 5 变体 | — (school-tables.generated) | ✅ 直接拿 |
| school-tables.generated.ts(62) | 脚本生成的"子起一"整数安星表 SCHOOL_AX(亮度 SB×4、魁钺 KY×4、截空 JK×3 等) | 无 | ✅ 直接拿 |
| school-config.ts(291) | 9+1 类流派开关类型/默认值/localStorage/URL 参数 | — | ⚠️ 只取类型+DEFAULT_LEAP_MONTH,UI 持久化重写 |
| true-solar-time.ts(166) | 真太阳时完整版:经度+NOAA 均时差+utcOffsetMinutes+晚子时四规则 `resolveZiweiDayOffset` | 无(纯 Date) | ✅ 直接拿(要接线) |
| dst-cn.ts(92) | 中国夏令时表 XLS_CN(1935-1991)与判定(只提示不自动减) | 无 | ✅ 直接拿 |
| clock-adjust.ts(38) | 钟表读数→标准时间分钟平移(跨日返回 null,用户手点) | 无 | ✅ 直接拿 |
| lunar-solar.ts(79) | 农历⇄公历严格互转(1900-2050,非法返回 null 绝不滚动) | lunar-javascript | ✅ 直接拿 |
| shier-shen.ts(164) | 岁前/将前/博士十二神(公式法,含英文名表) | constants | ✅ 直接拿 |
| yunxian-context.ts(124) | 运限上下文:虚岁/流年→大限 index,童限(虚岁 1-5 偏移表) | types | ✅ 直接拿 |
| cities.ts(704) | 34 省级→市/区经度表(真太阳时用;不支持海外城市) | 无 | ✅ 直接拿(数据表) |
| patterns.ts(1119) | ~40 个格局识别器 `detectPatterns`,输出 {name,level,description,conditions,source} | types + 'server-only' | ⚠️ 拿+清洗 6 句倪师引语 |
| famous.ts(174) | 13 位名人出生数据(时辰为估算值)+ 双语亮点文案 | 'server-only' | ⚠️ 可选,清洗 2 处倪师提法 |
| share.ts(89) | 表单⇄BirthInfo⇄URL 参数(内含简化版真太阳时,勿搬) | 组件类型耦合 | 🔄 参考重写 |
| lunar-javascript.d.ts(32) | lunar-javascript 手写类型(缺 fromYmdHms/getEightChar) | — | ✅ 直接拿+补全 |
| heming-knowledge.ts(329) | 合盘知识库(倪师原话汇编,9 处 ni_quote) | 无 | ❌ 不拿(许可) |
| history.ts(64) | 最近排盘 React hook(localStorage) | react | ❌ 不拿(架构) |
| db-analysis.ts(54) | 断语库占位(STAR_DB 空) | 无 | ❌ 不拿(无价值) |

另: `lib/classics/`(古籍框架+3 数据文件,1,722 行)——框架 MIT 可拿;**三个"古籍"数据文件实为今人拟古改写**(quanshu.ts:30 出现"爆发/逆袭"、:99 段内混入"倪师强调"、quanji.ts:52"单身无依"),文件头却标"公版"(gusuifu.ts:4 等)。判定: 按 MIT 可拿可商用,但**不得在我们站点标注为"古籍原文/公有领域"**;若要真古籍另找公版点校本。v1 无古籍阅读器(MAP.md Out of scope),可整体不拿。

---

## 4. 类型形状摘录(types.ts 逐字,行号为上游 types.ts)

引擎输入:`BirthInfo`——注意 `hour` 是**时辰地支索引 0-11(子…亥),不是钟点**;日期是"经晚子时换日修正后的排盘日"。

```typescript
export interface BirthInfo {
  year: number;      // Gregorian year(已经过子时换日修正后的"排盘日")
  month: number;     // Gregorian month (1-12)
  day: number;       // Gregorian day
  hour: number;      // 时辰 branch index (0=子, 1=丑, ... 11=亥)
  gender: 'male' | 'female';
  name?: string;
  province?: string;
  city?: string;
  longitude?: number;  // 出生地经度(用于真太阳时校正)
  origInput?: { year: number; month: number; day: number; clockHour: number; clockMinute: number };
}

export interface LunarInfo {
  lunarYear: number;
  lunarMonth: number;    // positive = normal, negative = leap month
  lunarDay: number;
  yearStem: number;      // 0-9 (甲…癸)
  yearBranch: number;    // 0-11 (子…亥)
  isLeapMonth: boolean;
  fourPillars?: [string, string, string, string];        // 节气四柱(立春精确到时刻)
  fourPillarsLunar?: [string, string, string, string];   // 非节气四柱(正月初一换年)
}

export type SiHua = '禄' | '权' | '科' | '忌';
export type StarBrightness = '庙' | '旺' | '得' | '利' | '平' | '不' | '闲' | '陷' | '地'; // '地'为 XD1 特有

export interface Star {
  name: string;
  type: 'major' | 'minor' | 'lucky' | 'sha';
  siHua?: SiHua;
  brightness?: 'bright' | 'normal' | 'dim';   // 粗粒度(算法用)
  brightnessRaw?: StarBrightness;             // 7 档原文(显示用)
}

export interface Palace {
  branch: number;      // 0-11 地支索引
  stem: number;        // 0-9 天干索引
  name: string;        // 宫名
  stars: Star[];
  daXianAge?: [number, number];
  isCurrentDaXian?: boolean;
  isMingGong?: boolean;
  isShenGong?: boolean;
  selfSihua?: SelfSihuaMark[];      // ⚠️ 当前实现不再填充
  oppositeBranch?: number;          // = (branch + 6) % 12
  isEmpty?: boolean;                // 空宫(无主星)
  borrowedFromBranch?: number;      // 空宫借对宫
  borrowedFromName?: string;
  borrowedStars?: string[];
}

export interface DaXian {
  startAge: number; endAge: number;
  palaceBranch: number; palaceName: string;
  stemIndex?: number; stemName?: string; siHua?: DaXianSiHua;  // ⚠️ 已下线不填充
}

export interface ZiweiChart {
  birthInfo: BirthInfo;
  lunarInfo: LunarInfo;
  mingGongBranch: number;   // 命宫地支
  shenGongBranch: number;   // 身宫地支
  wuxingJu: number;         // 五行局 2/3/4/5/6
  wuxingJuName: string;     // 如 '水二局'
  ziweiPos: number;         // 紫微星位置
  palaces: Palace[];        // 12 宫,按地支 0-11 排
  daXians: DaXian[];
  currentAge: number;       // 虚岁(iztro nominalAge 口径)
  currentDaXianIndex: number;
  analysisCacheProfile?: string;  // ⚠️ 商业版 API 字段
  mingZhu?: string;         // 命主
  shenZhu?: string;         // 身主
  yinYangGender?: string;   // 阳男/阴男/阳女/阴女
}
```

端到端调用链(开源版):`BirthForm(简化真太阳时,不换日) → generateChart`(/chart);`formToBirthInfo(换日) → generateChart`(/heming)。`generateChart` 内部:校验(:449-460)→`resolveEffectiveLunarDate`(:467)→`astro.bySolar/byLunar`(:475/:485)→十二宫组装+亮度查表(:496-565)→KY 魁钺(:569)→虚岁(:577)→空宫借宫(:591)→命宫/身宫/五行局/紫微位(:606)→大限(:617)→`getLunarInfo` 四柱(:634)→大耗/截空/副旬(:637-639)→命主身主(:642)→返回。

---

## 5. 许可审计三栏清单

上游官方四层框架(README.md:402-413、LICENSE:1、DATASET-LICENSE:18、docs/tianji-ziwei/LICENSE.md:3):代码 MIT / Releases 数据集 CC BY 4.0 / 古籍"公版" / **倪师原话 CC BY-NC-SA 4.0 禁商用**。关键排除条款:DATASET-LICENSE:41-44 与 README.md:163——**数据集解读文本里引用的倪师原话不在任何授权范围内**。

### ✅ 能拿(MIT,可直接商用)

| 条目 | 证据 | 备注 |
|---|---|---|
| lib/ziwei 排盘引擎除 heming-knowledge 外全部文件 | LICENSE:1("MIT License, Copyright (c) 2026 紫微研究")、README.md:408 | 注释里"倪师派/倪师《天纪 03》"只是**方法论口径注释非引语**(algorithm.ts:13,464,615 等),无风险 |
| patterns.ts 格局算法与古诀文案 | 同上 + 清洗项见 ❌ 栏 | "古书云"短句属公版传统古诀,可留 |
| famous.ts 事实性出生数据 | famous.ts:2-3("基于公开记录…时辰为估算值") | 事实数据不构成作品 |
| lib/classics 查询框架 | classics/types.ts:4 | 数据文件见 ⚠️ 栏 |
| app/、components/ Demo | README.md:408 | 与引擎移植无关 |

### ⚠️ 拿了要署名(可用但有义务/条件)

| 条目 | 协议 | 证据 | 动作 |
|---|---|---|---|
| 全部 MIT 代码 | MIT | LICENSE:12-13 | 我方 THIRD-PARTY-NOTICES 保留其版权行与许可文本("紫微研究/王多鱼AI") |
| iztro | MIT | package-lock.json(2.6.1,"license":"MIT")、algorithm.ts:2-3 | 附 iztro(SylarLong)MIT 文本 |
| lunar-javascript | MIT | package-lock.json(1.7.7,"license":"MIT") | 附 MIT 文本。**上游没有 THIRD-PARTY-NOTICES 文件,需我方自建** |
| Releases 数据集 v3.0(518,400 条)/v4.0(674,976 盘×13 维)——仅当使用 | CC BY 4.0 | DATASET-LICENSE:10-13(适用范围仅 Releases 数据文件)、:31-35(署名文本) | 页脚/数据来源页放:「来源: https://github.com/Renhuai123/ziwei-doushu 作者: 王多鱼AI」;内嵌倪师引文不授权(:41-44)。MAP.md 已定本地知识库路线,产品不接;若作测试 oracle 也建议在测试目录 README 注明来源 |
| lib/classics/data 三个"古籍"文件 | 名义公版,实为今人拟古改写 | quanshu.ts:30("爆发/逆袭"现代语)、:99(混入"倪师强调")、quanji.ts:52 | 按 MIT 拿可以,但**不得标注"古籍原文/公有领域"**;要真原文另找公版点校本 |

### ❌ 不能拿(不得进入本站)

| 条目 | 证据 | 说明 |
|---|---|---|
| **docs/tianji-ziwei/ 整目录**(16 讲 .md + entries.jsonl + overview.png) | docs/tianji-ziwei/LICENSE.md:3(CC BY-NC-SA 4.0)、README.md:359("能不能商用:**不能**")、:411;目录 README.md:63(著作权归倪海厦先生及其权利继承人) | 1848 条《天纪》逐字原话+时间码;SA 条款传染衍生作品,连图都不进 |
| **lib/ziwei/heming-knowledge.ts** | :15(`ni_quote?: string; // 倪海厦原话`)、9 处 ni_quote(:23,31,39,47,62,77,85,114,122)、:142,146,247-249(克夫/旺夫长引语)、:297-306("倪海厦合盘核心名言汇总"8 条);文件头 :3 自认"全网专业资料整合"权利来源不明 | 虽在 MIT 目录下,但作者对倪师原话无权再许可,与其自身 NC 口径矛盾。**整体排除**;合盘功能将来要做得自写中性规则 |
| **lib/nihai/ 整目录**(tianji/renji/diji,1,596 行) | tianji.ts:501-531(TIANJI_QUOTES 29 条语录)、renji.ts:349(215 条针灸经验)、:518-617(汉唐 100 方)、diji.ts:50,167-170;目录内 grep 无任何许可声明;全仓无 import(死代码);README 开源清单(:319-337, :385)未列它 | 倪师语录+临床数据+方剂,无授权链。**整体不拿** |
| patterns.ts 6 处"倪师说/讲"短引 | :853,871,888,923,976,990(已逐行核实原文) | 移植时删改(去"倪师说"+引号内容,换中性表述) |
| famous.ts 2 处倪师提法 | :59("倪师七杀理论的活教材")、:109("印证倪师'太阴入命…'的论断") | 删改即可 |
| 断语库完整版/AI prompt/后端 API | README.md:386(不开源清单) | 本就不在仓库;勿从数据集反向拼凑替代 |

**落地红线(建议进 CI)**:关键词黑名单 `倪师|倪海厦|天纪|ni_quote`,扫描我们 `src/lib/engine/` 与内容目录;构建 THIRD-PARTY-NOTICES(上游 MIT + iztro MIT + lunar-javascript MIT + 其余依赖照常)。

---

## 6. 黄金用例表(供 T13)

上游口径快照必须连同固化:**引擎 commit 495b79e + 亮度默认 QS + 闰月默认 split + 晚子时 next-day**,否则对照无意义。

### 6.1 现成用例(直接搬,均有断言级出处)

| # | 输入 | 期望输出 | 出处 |
|---|---|---|---|
| 1 ★ | 1988-10-08,hour 7(未时),男 | 命宫=天机(忌)+太阴(权);父母宫=贪狼(禄)+右弼(科);全盘恰 2 宫各含 2 四化 | natal-dual-sihua-same-palace.test.ts:18,25-31 |
| 2 | 1974-01-28,hour 11,男,经度 120 | 红鸾落丑(丁丑)、天喜落未(辛未),互为对宫 | hongluan-tianxi.test.ts:19,21-28 |
| 3 | 12 个年份(2016-2020,2023-2027)5/15 亥时男 | 公式 oracle:红鸾支=(3−年支+12)%12,天喜=对宫 | hongluan-tianxi.test.ts:30-48 |
| 4 | 2004-02-04 丑时男(当天立春 19:56) | 节气年柱=癸未(非甲申)、月柱=乙丑;农历口径年柱=甲申(两套并存);日柱时柱=癸丑/癸丑 | sizhu-lichun-boundary.test.ts:22-25,42-43 |
| 5 | 2004-02-03 / 02-05 丑时男 | 节气年柱分别癸未 / 甲申 | 同上 :28-29 |
| 6 | 2004-02-04 同日 丑时 vs 亥时 | 丑时→癸未;亥时(立春后)→甲申(同日跨节气时刻分档) | 同上 :33-34 |
| 7 | 1990-06-15 午时男 | 节气四柱全量 ['庚午','壬午','辛亥','甲午'] | 同上 :37-39 |
| 8 | 表单 2000-01-31 23:30 | BirthInfo={2000,2,1,hour 0}(晚子时换日+跨月) | iztro-time-index-boundary.test.ts:49-54 |
| 9 | 表单 2000-01-31 00:30 | BirthInfo={2000,1,31,hour 0}(早子时当日) | 同上 :56-61 |
| 10 | hour∈{−1,12,0.5} | 抛 RangeError;hour 0-11 原样保留 | 同上 :19-31 |
| 11 | 1995-01-15 14:00,经度 −74,utcOffset −300(纽约) | 经度修正=+4 分钟 | clock-adjust.test.ts:41-42 |
| 12 | clockToStandardDelta(540,480)/(−240,−300)/(450,480) | −60/−60/+30(中国 DST/美东 DST/马来西亚 1982 前) | 同上 :17-19 |
| 13 | shiftClock 各值 | 14:30,−60→13:30;0:30,−60→null(跨日不改);空→null 等 | 同上 :21-28 |
| 14 | 1990 全年 36 日,北京经度,不传 vs 传 utcOffset 480 | 逐日完全一致(国内等价) | 同上 :32-38 |
| 15 | isChinaDST:1986-05-04→true(首日);1988-04-10→true(★金标准与 IANA 分歧日);1991-09-15→true(末天);1992→false | 字面断言 | dst-cn.test.ts:105-113 |
| 16 | XLS_CN 全表(1935-1991 共 34 行) | 1930-1995 逐日穷举+每区间 4 边界日 | dst-cn.test.ts:14,37-74 |
| 17 | [1925,2,29]/[1925,2,30]/[1925,4,31]/[1925,13,1] 等 | 全部抛 RangeError(不得顺延);[1924,2,29] 等合法日正常 | solar-date-exists.test.ts:8-33 |
| 18 | 768 盘采样网格(1960-2010×4 月×3 日×4 时辰×2 性别) | 7 条不变式:12 宫齐全/地支各一次/命宫唯一/逆时针排布公式/机梁同宫限辰戌/紫府对称 (紫微+天府)%12==4 | pan-integrity.test.ts:26-31,46-103 |
| 19 | famous.ts 11 条名人输入(任正非 1944-10-25 卯/林志玲 1974-11-29 巳/乔布斯 1955-02-24 午/姚明 1980-09-12 巳等) | 仅输入无期望;4 条"X 入命"说法可互证(任正非七杀入命等) | famous.ts:33-159 |

### 6.2 现状判断与补录计划(目标 ~10 条全字段)

- **有完整盘面期望的仅 #1**;#2-#17 是部分字段/时间层级;金标准盘实物(5 张逐宫盘、150 组闰月对照)**不在仓库**,只在注释中被引用。
- **最大空白:闰月后半月无任何回归**(默认 split 口径的依据"150 组对照"不在仓内)。补录时必含一例闰月后半月出生。
- 补录方式(标注:**需人工用上游 demo 复核**):跑上游 `npm run dev` 访问 `/chart`(或 ouranic.cn 线上版),按 6.3 字段清单记录;更推荐绕过 UI 直接按回归测试方式调 `generateChart`(避免 demo 简化版真太阳时引入变量)。建议补录输入:①1988-10-08 h7 男(补全 12 宫);②2004-02-04 h1 与 h11(立春同日双盘);③1974-01-28 h11;④1990-06-15 h6;⑤2000-01-31 23:30(跨月换日);⑥1924-02-29 h6(闰年);⑦1986-05-04 01:30(夏令时首日+clock-adjust 减 60→0:30);⑧任一闰月后半月日期;⑨famous 4 条"X 入命"互证;⑩纽约海外例(utcOffset −300)。
- **大规模 oracle(免手工)**: Releases v3.0(518,400 条,输入→完整命盘 JSON;约 2,520 条含不存在日期需过滤)与 v4.0(674,976 条,字段 `ms`=命宫第一颗主星,空宫 null)。注意: 两版均未做真太阳时校正;v4.0 按旧默认亮度生成(README.md:81),亮度字与现默认 QS 不同,只可对照星曜落宫不可对照亮度;用作测试属数据集使用,按 CC BY 4.0 在测试目录注明来源。
- 每条用例记录字段:`mingGongBranch/shenGongBranch`、命宫主星+siHua、全盘四化落宫、`wuxingJuName`、农历+闰月标记、年干支、`fourPillars/fourPillarsLunar`、每宫干支+星+亮度、`daXians[]`、`mingZhu/shenZhu/yinYangGender/ziweiPos`、空宫 `borrowedStars`。

### 6.3 补录:闰月后半月黄金用例 ×10(2026-11-01,T15)

> 补录时间 2026-11-01。已由上游 demo 引擎复核(按 §6.2 推荐方式绕过 UI 直调):克隆 `D:\tmp\ziwei-doushu-research`(HEAD=基准 commit `495b79e`,`npm ci --ignore-scripts` 后),以仓库自带 `tsx` 直调 `generateChart`——脚本 `D:\tmp\ziwei-doushu-research\scripts\leap-month-probe.ts`(复用上游 `lunar-solar.ts` 严格换算,无真太阳时变量;默认口径=亮度 QS+闰月 split+hour 直传时辰支)。输入规则:农历闰月第 16-25 日(后半月)→ split 下按「闰X+1 月」排盘。**10/10 通过 split 等价校验**:与「闰X+1 月同日」非闰盘逐宫主星布局、命宫、五行局完全一致(即 algorithm.ts:164-167 split 语义的实证)。生年四化/命主/身主已与传统干支口诀表抽查吻合。

| # | 输入 | 命宫 | 命宫主星 | 生年四化(禄/权/科/忌 落宫) | 五行局 | 命主/身主 | 复核 |
|---|---|---|---|---|---|---|---|
| 20 | 1974 闰四月二十(1974-06-10)子时男 | 午 | 空宫(借天同+太阴) | 禄廉贞@酉 权破军@酉 科武曲@丑 忌太阳@寅 | 土五局 | 破军/天梁 | ✓split 等价 |
| 21 | 1979 闰六月十八(1979-08-10)辰时女 | 辰 | 太阳旺 | 禄武曲@卯 权贪狼@亥 科天梁@寅 忌文曲@申 | 木三局 | 廉贞/天相 | ✓split 等价 |
| 22 | 1984 闰十月廿二(1984-12-14)午时男 | 午 | 天梁庙 | 禄廉贞@未 权破军@亥 科武曲@亥 忌太阳@子 | 土五局 | 破军/火星 | ✓split 等价 |
| 23 | 1987 闰六月廿五(1987-08-19)申时女 | 子 | 紫微平 | 禄太阴@巳 权天同@未 科天机@亥 忌巨门@未 | 木三局 | 贪狼/天同 | ✓split 等价 |
| 24 | 1990 闰五月十六(1990-07-08)寅时男 | 巳 | 紫微旺+七杀平 | 禄太阳@寅 权武曲@丑 科太阴@子 忌天同@子 | 金四局 | 武曲/火星 | ✓split 等价 |
| 25 | 2001 闰四月廿一(2001-06-12)戌时男 | 申 | 七杀庙 | 禄巨门@巳 权太阳@亥 科文曲@寅 忌文昌@子 | 火六局 | 廉贞/天机 | ✓split 等价 |
| 26 | 2004 闰二月十九(2004-04-08)卯时女 | 丑 | 空宫(借太阳+太阴) | 禄廉贞@寅 权破军@辰 科武曲@午 忌太阳@未 | 水二局 | 巨门/天梁 | ✓split 等价 |
| 27 | 2006 闰七月廿四(2006-09-16)巳时男 | 辰 | 太阴陷 | 禄天同@申 权天机@子 科文昌@巳 忌廉贞@巳 | 水二局 | 廉贞/文昌 | ✓split 等价 |
| 28 | 2014 闰九月十七(2014-11-09)未时男 | 辰 | 七杀庙 | 禄廉贞@戌 权破军@申 科武曲@寅 忌太阳@卯 | 木三局 | 廉贞/火星 | ✓split 等价 |
| 29 | 2020 闰四月廿三(2020-06-14)亥时女 | 未 | 天机陷 | 禄太阳@巳 权武曲@辰 科太阴@酉 忌天同@卯 | 木三局 | 武曲/火星 | ✓split 等价 |

覆盖:闰二/四/五/六/七/九/十月共 7 种闰月位,1974-2020 十个农历年,男女各半,时辰支 10 个不重复。亮度为默认 QS 口径。T13 移植后直接以此 10 行做回归断言(脚本可重跑:`cd D:\tmp\ziwei-doushu-research && node_modules/.bin/tsx scripts/leap-month-probe.ts`)。

---

## 7. 交接清单

- T03(技术栈): 引擎依赖定版 `iztro@2.6.1` + `lunar-javascript@1.7.7`(MIT),Node runtime。
- T08(知识架构): patterns.ts 清洗后可作格局库起点;解读文案必须原创/改写,倪师原话零容忍(CI 关键词扫描)。
- T10(出生表单): 时间链 = DST 提示(dst-cn)→用户手点平移(clock-adjust)→完整真太阳时(true-solar-time)→晚子时规则→排盘日+时辰支;保留 origInput 展示。
- T13(测试): 6.1 表 19 项 + pan-integrity 768 盘不变式整套照搬;补录 10 条全字段金标准;锁"引擎版本+三默认口径"快照。
- 许可: THIRD-PARTY-NOTICES 三条(上游/iztro/lunar-javascript);如用数据集 oracle 加 CC BY 4.0 署名。
