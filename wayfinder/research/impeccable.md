---
id: research-impeccable
title: 去 AI 味可勾选清单(pbakaus/impeccable 摘要)
labels: [wayfinder:research]
source: github.com/pbakaus/impeccable · main @ 4f95649(2026-11-01,Apache-2.0,本地浅克隆 D:\tmp\impeccable-research)
ticket: T01
---

# 去 AI 味清单(基于 pbakaus/impeccable)

**要点一句话**:impeccable = 给编码代理的设计词汇 + 62 条确定性反 slop 检测规则 + 编辑底线(craft-floor);本清单将其全部主要准则译为本站(紫微斗数 3D 排盘站)可勾选条目,供 T07(3D 构图)、T09(设计系统)、Landing 文案等票过检。

**用法**

- 每条可勾选;【强】= 对本站高危或直接适用,【弱】= 场景较少但仍收录备查。
- 出处为仓库内路径;`registry` 指 `crates/foundation/src/registry.rs` 的确定性规则 id(skill 正文指导 LLM,registry 规则机械执行,双层都算数)。
- 引用规则原文属 Apache-2.0,转引文字请署 pbakaus/impeccable。

**本站表面模式映射**(出处:`skill/SKILL.src.md` 模式体系)

| 本站表面 | impeccable 模式 | 野心刻度 |
|---|---|---|
| Landing / 分享卡片 | Persuade | 大胆、有观点、首屏即论点(`skill/reference/mode-persuade.md`) |
| 排盘工具页(输入生辰 → 3D 命盘) | Operate | 精确克制,"工具消失于任务"(`skill/reference/operate.md`) |
| 星曜/宫位/格局/解读百科 | Read | 世界拥有框架,阅读栏平静(`skill/reference/mode-read.md`) |

---

## ① 文案 slop(套路 + 替换写法)

### 1.1 英文套路(en 侧)

- [ ] 【强】**不用 28 个营销黑话短语**:streamline your / empower your / supercharge your / unleash your / unleash the power / leverage the power / built for the modern / trusted by leading / trusted by the world / best-in-class / industry-leading / world-class / enterprise-grade / next-generation / cutting-edge / transform your business / revolutionize / game-changer / game changing / mission-critical / best of breed / future-proof / future proof / seamless experience / seamlessly integrate / drive engagement / drive growth / drive results / harness the power。为什么:这些短语不描述产品,是生成器反射。→ 本站:写产品字面做的事——"Enter a birth date, get a full Zi Wei chart in seconds",不用 "unlock the secrets of your destiny"。出处:`crates/detect/src/regex_matchers.rs`(BUZZWORDS)+ `registry` `marketing-buzzword`
- [ ] 【强】**格言节奏 ≤2 处**:"X. No Y." / "Not a feature. A platform." / "X. Just Y." 式短驳句全文 ≥3 处即触发。为什么:一次是修辞,成规律是 AI 节奏。→ 本站:en 文案每种句式最多用一次。出处:`crates/detect/src/regex_matchers.rs`(NOT_A_RE / SHORT_REBUTTAL_RE)+ `registry` `aphoristic-cadence`
- [ ] 【强】**em-dash 不超限**:≥8 个且密度近每 500 字符 1 个才报,但别把 "—" 当默认连接符。为什么:破折号饱和是 AI 行文信号。→ 本站:en 正文改用逗号/冒号/句号/括号。出处:`crates/core/src/checks/text_rules.rs`(check_em_dash_overuse)+ `registry` `em-dash-overuse`
- [ ] 【弱】**不用 "X theater" 贬损框架**("security theater" 式,词头封闭列表 accessibility…wellness)。为什么:贬损框架替代了平实陈述。→ 本站:直接说这东西做/不做什么。出处:`crates/core/src/checks/html_patterns.rs`(THEATER_DISMISSIVE_HEADS)+ `registry` `theater-slop-phrase`
- [ ] 【强】**零 hedging**:might / could / consider / perhaps / "maybe consider" 全删。为什么:果断的专家语气=可信。→ 本站:en 文案每句陈述直接下判断;不确定的内容删掉而不是软化。出处:`PRODUCT.md`(Hedging language 避免项)
- [ ] 【强】**不写品类化收益口号**("boost your productivity" 类)与 hero-metric 套路(大数字+小标签+辅助统计)。为什么:任何 SaaS 都能原样使用=零信息。→ 本站:Landing 主张必须只有本站能说(排盘引擎、3D 形态、双语知识库)。出处:`PRODUCT.md`(SaaS landing-page clichés)

### 1.2 中文套路(zh 侧)

> 注:impeccable 只内置英文词表与 CJK 机械规则(`text_rules.rs`:中文破折号"——"计 1 个、全角字按 1em 折算行宽、CJK 豁免负字距/两端对齐规则)。以下中文词表为**本站衍生**:把仓库的替换原则(具体动词+名词、平实陈述、阈值)落到中文。

- [ ] 【强】**不用 AI 中文黑话对译**:赋能 / 助力 / 一站式 / 极致体验 / 全面加持 / 释放…的潜能 / 开启…之旅 / 探索…的奥秘 / 让您轻松 / 量身定制 / 行业领先 / 世界一流 / 新一代 / 尖端 / 面向未来 / 深受信赖 / 颠覆 / 划时代 / 无缝体验。为什么:与英文黑话同源,不描述产品。→ 本站:替换为字面动作与对象——"开启命理探索之旅"→"输入生辰,几秒排出完整命盘"。出处:衍生自 `regex_matchers.rs` BUZZWORDS 原则(上条)
- [ ] 【强】**禁用"智能"作卖点词**:本站解读是**确定性知识库、非 AI**(`wayfinder/MAP.md` 已定案),写"智能解读/AI 排盘"不仅 slop 更是虚假主张(见 ④-1)。为什么:能力主张必须真实。→ 本站:用"确定性解读 / 由规则知识库生成,每次结果相同"作为差异化卖点,这本身就是去 AI 味的叙事。出处:衍生自 `skill/reference/new-work.md`(Truth binds claims)
- [ ] 【强】**中文格言节奏 ≤2 处**:"不是 X,而是 Y。" / "无需 X,只需 Y。" / "X,只需 Y。" 成排出现即 AI 节奏。为什么:同英文 `aphoristic-cadence`,规律本身是破绽。→ 本站:双语文案各查一遍。出处:衍生自 `registry` `aphoristic-cadence`
- [ ] 【强】**中文破折号"——"当默认连接符**:机械阈值与英文相同(≥8 个、约每 500 字符 1 个才报,"——"按 1 个计)。为什么:中英 AI 文都爱用破折号制造伪节奏。→ 本站:中文正文优先逗号、冒号、分号、括号。出处:`crates/core/src/checks/text_rules.rs`(count_em_dashes:中文成对破折号计 1)
- [ ] 【强】**百科正文禁套壳词**:"值得注意的是 / 总而言之 / 综上所述 / 首先…其次…最后 / 让我们 / 不难发现"。为什么:总分总套壳是生成式文章的骨架,百科条目应直接以条目主体开篇。→ 本站:星曜/宫位词条第一句给定义或核心断语,不写导览句。出处:衍生自 `skill/reference/clarify.md`(冗余标题/导语规则)
- [ ] 【强】**中文排比三连与全角感叹号营销腔**。为什么:与英文 aphoristic cadence 同机制,堆情绪替代表达。→ 本站:解读文案以断语+依据行文,不堆排比。出处:衍生自 `registry` `aphoristic-cadence` + `PRODUCT.md` 语气条款
- [ ] 【强】**hedging 中文版**:或许 / 也许 / 可能会 / 建议考虑。为什么:同 `PRODUCT.md` 零 hedging。→ 本站:语气直接,但**不得为求果断而超出知识库断语范围**——确定性解读的"确定性"来自规则,不是来自语气加码(内容边界见 ④-1)。出处:`PRODUCT.md` + 本站约束

### 1.3 UX 文案规则(双语通用,`skill/reference/clarify.md`)

- [ ] 【强】**动词+宾语,按钮写动作名**:不用 Yes/No/OK/Submit/确定。为什么:标签描述将发生什么。→ 本站:排盘按钮"排盘 / Cast chart",复制分享"复制链接 / Copy link"。
- [ ] 【强】**同一概念全文同词,不为文学效果换词**;维护中英术语表(紫微斗数=Zi Wei Dou Shu,大小写全站统一)。为什么:换词是文学手法,界面要识别一致性。→ 本站:星曜名、宫位名、四化名中英各定一名,写进 T08 术语表。出处:`clarify.md`(Terminology / "Do not vary words for literary effect")
- [ ] 【强】**能 undo 就不 confirm**;破坏性操作命名对象与后果。为什么:确认框是懒惰设计。→ 本站:表单改动可改可清,无破坏性操作则无确认框。
- [ ] 【强】**placeholder 是例子不是 label**;格式与资格要求放提交前。为什么:输入即消失的提示丢信息。→ 本站:生辰字段用持久 label(公历生日 / Birth date),格式提示(YYYY-MM-DD、时辰制说明)常驻字段旁。出处:`clarify.md`(Forms)
- [ ] 【强】**可行动错误答三问**:什么失败了 / 为什么(已知且有用时)/ 怎么恢复。为什么:错误是决策点。→ 本站:"时辰缺失:紫微斗数按两小时时辰排盘,请补充出生时间段"而非"输入有误"。出处:`clarify.md`(Errors)
- [ ] 【强】**loading 写真实操作、never invent progress**。为什么:虚构进度=欺骗。→ 本站:3D 引擎加载显示真实阶段(加载字体→构建星盘→渲染),不用无限转圈假进度。出处:`clarify.md`(Loading)
- [ ] 【强】**空态要教学**:区分首次使用/无结果/失败并给下一步,不写"这里什么都没有"。为什么:空态是引导时机。→ 本站:未输入生辰时的解读区显示"排盘后此处显示命宫三方四正解析"。出处:`clarify.md` + `skill/reference/onboard.md`
- [ ] 【强】**一个观点只说一次**:标题已说明的,导语不重述(No headers restating intros)。为什么:冗余是模板气。→ 本站:Landing 与百科都适用;同卡片同一文字出现 ≥3 次是机械违规。出处:`clarify.md` + `registry` `repeated-container-text`
- [ ] 【强】**写完整可翻译的句子,不拼片段;预留 30–40% 译文扩张**。为什么:拼接片段不可本地化。→ 本站:next-intl messages 用完整句;zh→en 布局用逻辑属性(margin-inline-start)防溢出。出处:`clarify.md`(Localization)+ `skill/reference/harden.md`(i18n)
- [ ] 【强】**不只靠标点、颜色或图标传讯**;链接文字脱离上下文可通顺;纯图标控件有可访问名。为什么:可访问性与摘录可读性。→ 本站:四化标记除朱砂色外必须有符号/文字;3D 交互控件配 aria-label。出处:`clarify.md`(Accessibility)

---

## ② 排版与布局

### 2.1 字体

- [ ] 【强】**不用滥用字体表**:inter, roboto, open sans, lato, montserrat, arial, helvetica(旧垄断)+ fraunces, instrument sans, instrument serif, geist(含 sans/mono), mona sans, plus jakarta sans, space grotesk, recoleta(新垄断)。为什么:这些脸=生成器默认,看见就想起 AI。→ 本站:T09 选型先排除此表,给 T09 的硬约束。出处:`crates/foundation/src/constants.rs`(OVERUSED_FONTS)+ `registry` `overused-font`
- [ ] 【强】**字体反射表同样禁**(执行层):Fraunces / Playfair Display / Cormorant / Lora / Crimson / Newsreader / Syne / Space Grotesk / Space Mono / IBM Plex / Inter-as-display / DM Sans / DM Serif / Outfit / Plus Jakarta Sans / Instrument Sans——"选它们=你停止了寻找";"题材想要衬线"不是理由。为什么:题材联想正是该表要打破的默认。→ 本站:"玄学想要古典衬线"是典型反射,选脸要像从浑仪/星图世界挑出的物件。出处:`skill/reference/new-work.md`(skill-typo-reflex-faces)
- [ ] 【强】**禁斜体衬线 display 大标题**(Fraunces/Recoleta/Playfair 类 italic 超大标题="AI 创业落地页标配")。→ 本站:en 侧 display 用正体;中文无斜体传统,天然免疫但别用仿斜。出处:`registry` `italic-serif-display`
- [ ] 【强】**不用系统 display 字体(Impact/Arial Black/平台黑体加粗)当品牌声部**:"the closest installed font is a failure, not a fallback"。→ 本站:display 字体是 T09 决策项,不蹭系统栈。出处:`skill/reference/craft-floor.md`(Refuse)

### 2.2 字号、行距、行宽、字距

- [ ] 【强】**相邻字号档位差 ≥1.25×**(flat type hierarchy:全站档位差距 <1.25× = 层级扁平)。→ 本站:T09 字阶按 1.2–1.25× 以上比率设计,标题/正文必须拉开。出处:`registry` `flat-type-hierarchy` + `skill/reference/operate.md`(1.125–1.2 档比)
- [ ] 【强】**正文 ≥14px,理想 16px;<12px 报警**;链接/按钮/标签等功能文字 ≥11px,非交互脚注 ≥10px,且"上了 DESIGN.md 字号阶梯也不豁免"("加 8px 进阶梯洗白不了可读性问题")。→ 本站:3D 命盘上的星曜标签再小也要 ≥11px,必要时用引导线外移标签。出处:`registry` `tiny-text` / `undersized-ui-text`
- [ ] 【强】**行高 ≥1.3,正文理想 1.5–1.7**。→ 本站:解读长文按 1.6 上下定,3D 内嵌短标签可 1.3。出处:`registry` `tight-leading`
- [ ] 【强】**行宽 65–75ch,>80ch 报;全角字按 1em 折算 → 中文 ≈33–38 字**。→ 本站:解读正文容器 max-width 按 38em(中文)/70ch(en)双标准校验。出处:`registry` `line-length` + `crates/core/src/checks/text_rules.rs`(average_glyph_advance_em)
- [ ] 【强】**字距底线:正文不低于 -0.04em**(检测阈值 -0.07em 正文 / -0.09em display;CJK 负字距豁免——中文加字距是拉开全角间隙,压字形只发生在拉丁)。→ 本站:en display 压字距止于 -0.04em;中文标题可微量加字距。出处:`skill/reference/craft-floor.md`(codex 块)+ `registry` `extreme-negative-tracking` + `text_rules.rs`(is_cjk_text)
- [ ] 【中→强】**宽字距只给短大写标签**(正文 letter-spacing >0.05em 破坏词形;整句 tracked caps 禁)。→ 本站:en 小标签(如宫位缩写)可 tracked caps,长句不追。出处:`registry` `wide-tracking` / `all-caps-body`
- [ ] 【中】**标题 `text-wrap: balance`,正文 `text-wrap: pretty`**(孤行/标题尾词悬空)。→ 本站:双语标题都开。出处:`registry` `straggler` / `unbalanced-heading`
- [ ] 【弱】**两端对齐**:拉丁窄栏 justify 产生白河;**CJK 按字符网格 justify 豁免**。→ 本站:中文百科可选齐头不齐尾或字符网格对齐,en 侧左对齐。出处:`registry` `justified-text`
- [ ] 【强】**暗底浅字三轴补偿**:略高行高、略多字距、必要时加一档字重。→ 本站:暖炭底上的浅色正文直接套用(T09 tokens 定档)。出处:`skill/reference/typeset.md`

### 2.3 布局结构

- [ ] 【强】**禁标题上方的 kicker/eyebrow 小标签**(大写小号字距标签/药丸 chip)——"直接禁令,no brief earns it back;标题自己扛得住"。→ 本站:不放"紫微斗数 · ZI WEI"式小帽标,标题直接说话。出处:`skill/reference/craft-floor.md` + `registry` `kicker-above-heading`(ban)/ `hero-eyebrow-chip`
- [ ] 【强】**禁逐节 01/02/03 小序号**("AI 编辑脚手架——页面在给自己的章节编号"),除非顺序本身承载读者需要的信息。→ 本站:排盘流程(输生辰→出盘→读盘)是真顺序,可用步骤;Landing 卖点区不用序号。出处:`registry` `numbered-section-labels` + `craft-floor.md`
- [ ] 【强】**禁同尺寸"图标+标题+文字"卡片阵列当页面结构**;"Cards are the lazy container; nested cards are always wrong";icon 圆角小块堆在标题上方="所有生成器输出的同一个形状"。→ 本站:特性区改并排清单/表格/直接排版;卡中卡(解读卡套星曜卡)绝对不出现。出处:`craft-floor.md` + `registry` `nested-cards` / `icon-tile-stack`
- [ ] 【强】**超大 h1 收着用**:整句长标题放 display 尺寸撑爆首屏;短 headline 不受限。→ 本站:zh 主标题短(如"紫微斗数 · 排盘即读"),长句降档。出处:`registry` `oversized-h1`
- [ ] 【强】**间距不单调**:同一间距值占比 >60% 且去重 ≤3 档 = 机械违规;"紧组松分"。→ 本站:T09 定 4 单位基间距阶梯并刻意做紧/松对比。出处:`registry` `monotonous-spacing` + `skill/reference/layout.md`
- [ ] 【强】**标题上方留白 > 下方**(标题绑定它引导的下一块)。→ 本站:百科与 Landing 全站统一此节奏。出处:`craft-floor.md`(Spacing)+ `registry` `heading-rhythm`
- [ ] 【强】**文字不贴边**:带边框/底色容器内 ≥8px(理想 12–16px);正文距视口 ≥16px(理想 24–32px);横向滚动面板两侧留一致 inset。→ 本站:星曜卡、宫位面板、移动端正文全部按此验收。出处:`registry` `cramped-padding` / `body-text-viewport-edge` / `edge-flush-cards`
- [ ] 【强】**内容不溢出容器**:文字可换行、宽度受限或给滚动;`min-width: 0` 防 flex/grid 撑爆。→ 本站:长星曜名(中文)+ en 长译名(翻译扩张 30–40%)双测。出处:`registry` `text-overflow` + `harden.md`
- [ ] 【强】**标题不跳级**(h1→h3 禁),读屏导航依赖大纲。→ 本站:百科词条 h1=星名,h2=小节,h3=细分。出处:`registry` `skipped-heading`
- [ ] 【强】**先靠邻近分组,再加容器与装饰**("Group by meaning. Use proximity before adding containers");眯眼测试(squint test)后主/次/大组仍可辨。→ 本站:解读区块靠间距分组,不靠套卡。出处:`skill/reference/layout.md`
- [ ] 【强】**每组件 7 状态齐全**:hover / focus / active / disabled / loading / error / empty;空态教学;骨架屏不用居中 spinner。→ 本站:排盘按钮、分享按钮、3D 视图控件全状态过检。出处:`operate.md`(States)
- [ ] 【强】**Operate 页无页面加载编排动画**("No orchestrated page-load sequences");动效 150–250ms。→ 本站:工具页直接可用;入场动画只留给 Landing 一处(见 ③-动效)。出处:`operate.md` + `skill/reference/animate.md`
- [ ] 【强】**Read 页阅读栏平静**:60–75ch、近 16px、阅读字体;世界只拥有框架(刊头/导航/底色),不吞正文;"工具或仪器界面跑来给阅读页当戏服"是反例。→ 本站:星曜百科页框架可浑仪化,正文栏保持素净衬线/宋体阅读态。出处:`mode-read.md`
- [ ] 【弱】**多列开场平衡**:首屏一列远超折叠线、短列悬空 = 违规。→ 本站:Landing 首屏以 3D 命盘为单主视觉,天然单列。出处:`registry` `first-viewport-column-overflow`

---

## ③ 视觉

### 3.1 配色

- [ ] 【强】**禁 AI 配色:紫/紫罗兰渐变与暗底霓虹青**("生成 UI 最可识别的两个 tell")。→ 本站:暖炭底+青铜锈绿+鎏金+朱砂本身就是反 AI 配色,守住不漂移即可。出处:`registry` `ai-color-palette`
- [ ] 【弱】**奶油/米色底反射**(暖 off-white 成 AI "tasteful" 默认)——本站默认暗底不触发,但 light 主题设计时警惕。→ 本站:若做 light 主题,从"纸/绢/矿物颜料"取真实材料色,不用米白默认。出处:`registry` `cream-palette` + `new-work.md`(book-subject-not-cream-license)
- [ ] 【强】**色彩角色制,不做色卡袋**:canvas/表面、主次文字、action/focus/selection、边框分隔、语义色、数据类目各自成角色;"最强色拥有一个区域或角色,而不是撒小点点"。→ 本站:**朱砂只做四化标记**(与 MAP 定案一致,同 impeccable 自家 "Patina Has Meaning Rule" 的结构:锈绿标记次级语义、不作通用装饰);鎏金承载品牌与主行动。出处:`skill/reference/colorize.md` + `DESIGN.md`(The Patina Has Meaning Rule)
- [ ] 【强】**行动色不花在装饰上**;彩底上的次级文字从该色相或前景派生,**永不灰色**。→ 本站:青铜锈绿表面上的说明文字用锈绿色相的深/浅变体,不用中性灰。出处:`colorize.md` + `registry` `gray-on-color`
- [ ] 【强】**对比度真跑检测**:正文/占位符 ≥4.5:1,大字 ≥3:1(≥24px 或粗体 ≥18.66px),不靠目测。→ 本站:鎏金 on 暖炭、朱砂 on 暖炭、锈绿底浅字全部进 T09 验收表。出处:`craft-floor.md`(Verify: Contrast)+ `registry` `low-contrast`
- [ ] 【强】**不用纯黑纯白**;OKLCH 建调色板,近白近黑降 chroma。→ 本站:暖炭底与米白前景都带暖色相微量 chroma。出处:`DESIGN.md`(Do Not)+ `colorize.md`
- [ ] 【中】**暗色主题不机械反转亮色**:显式设计表面 elevation。→ 本站:默认暗,若加 light 用绢纸材料另设计,不做 filter: invert。出处:`colorize.md`
- [ ] 【强】**数据可视化不只靠颜色**:加明度/形状/符号/标签。→ 本站:四化(禄权科忌)除朱砂外必须各有符号或字形差异,色弱可读。出处:`colorize.md`
- [ ] 【强】**渐变文字禁**(尤其标题与数字上的鎏金渐变——"装饰而非意义");强调靠字重或字号。→ 本站:标题要"金"就用鎏金色实色或真纹理资产,不上 linear-gradient 文字。出处:`registry` `gradient-text` + `craft-floor.md`

### 3.2 表面与装饰

- [ ] 【强】**零偏移彩色光晕禁**(box/text-shadow 彩色 blur 无偏移)、radial 光晕背景、聚光灯渐变光斑。→ 本站:3D 命盘最大诱惑是"给盘加发光"——光只能来自场景内光照(灯、烛、鎏金反光),不做 CSS glow。出处:`registry` `dark-glow` / `radial-halo` / `radial-spotlight-glow`
- [ ] 【强】**侧边粗彩条卡禁**("side-tab accent 是 AI UI 最可识别的 tell");圆角元素上加粗强调边框同样禁。→ 本站:宫位卡、解读卡不用 border-left 强调。出处:`registry` `side-tab` / `border-accent-on-rounded`
- [ ] 【强】**发丝边框+宽软阴影二选一**(整排卡片每张都 1px 边+大散影 = ghost card 签名)。→ 本站:卡片系统定一种:锐利边界(浑仪金属感)或柔和浮起,不叠加。出处:`registry` `gpt-thin-border-wide-shadow` + `craft-floor.md`(codex 块)
- [ ] 【强】**玻璃拟态禁**(装饰性 blur/glass 面板;overlay 半透明可用)。→ 本站:3D 场景上的信息浮层用实底或轻纱纹理,不做 backdrop-blur 玻璃卡。出处:`DESIGN.md`(No Glass Rule)+ `craft-floor.md`
- [ ] 【强】**装饰刻度必须对齐真实内容**("Do not add decorative calibration marks that do not align with real content")。→ 本站:**浑仪刻度环必须真实对应宫位/度数数据**——刻度是仪器语言,假刻度=假仪器,这是本站最独特的真伪判据。出处:`DESIGN.md`(Do Not)
- [ ] 【强】**网格/条纹背景只许用于真实画布/地图/蓝图/测量面**。→ 本站:网格与刻度线出现在命盘表面(真实测量面)合法;出现在普通内容卡背景=违规。出处:`registry` `codex-grid-background` / `repeating-stripes-gradient`
- [ ] 【强】**纹理有预算**:纹理只给品牌承载时刻,普通卡片保持平坦;"金箔纹理上不排长文";品牌材料用真实质感资产(光栅/生成图),不用手绘 SVG 近似金箔/氧化。→ 本站:鎏金/锈绿质感集中在 3D 命盘与关键视觉锚点,正文区素底。出处:`DESIGN.md`(Texture Budget / Asset-Led Material / gold under long text)
- [ ] 【弱】**背景图别被遮死**:素材被近不透明遮罩盖死="合规占位符";要么让素材可见(遮罩 alpha<0.9)要么删。→ 本站:若用星图/青铜实拍背景,保留可读的可见度。出处:`registry` `buried-raster`
- [ ] 【弱】**硬偏移阴影、形状拼贴插画、多顶点 clip-path 冒充有机轮廓**:非新粗野世界不用零模糊块影;primitive shape 拼 SVG 场景是剪贴画;撕边用真 alpha matte。→ 本站:浑仪世界用真材质与 3D,不拼贴。出处:`registry` `hard-offset-shadow` / `shape-assembled-illustration` / `organic-clip-path`
- [ ] 【中】**等宽字体只给代码/数据/测量**;**emoji/Unicode 字形不当图标**;图标要画,统一线宽。→ 本站:命盘数据表可用 tabular 数字+等宽;星曜符号走自绘 SVG 图标系统,不用 ☯★ 之类 Unicode。出处:`craft-floor.md`(Refuse)+ `registry` `design-system-*`
- [ ] 【中】**宽字距大写标签只写短系统标记,不写整句**。→ 本站:宫位缩写、四化标记可用,整句不用。出处:`DESIGN.md`(Tracked Labels Are Short Rule)

### 3.3 动效

- [ ] 【强】**一个 authored moment,不做散落效果**:全站只建一次统筹的焦点动效;generic fade-and-rise / hover lift / parallax / scroll reveal 不是论点。→ 本站: authored moment = 3D 命盘的构建/展开动画(星落宫位、环层就位),其余页面克制。出处:`craft-floor.md`(Motion)+ `skill/reference/animate.md`
- [ ] 【强】**禁 bounce/elastic 缓动**(过时且廉价);真实物体平滑减速,用 ease-out-quart/quint/expo;动效距离 10–20px 级。→ 本站:3D 相机与 UI 过渡全 ease-out 家族。出处:`registry` `bounce-easing` + `skill/reference/quieter.md`
- [ ] 【强】**内容默认可见,JS 只增强入场**("failed-reveal 签名");动效中隐藏的元素读作缺失元素。→ 本站:JS/3D 失败时页面(2D 降级 + 文字)必须完整可读——与 MAP 的 2D 降级定案一致。出处:`registry` `content-hidden-at-rest`(error 级)+ `new-work.md`(§7)
- [ ] 【强】**`prefers-reduced-motion` 给替代路径**,不是一刀切禁用(保留状态反馈);不随手动画 layout 属性;出场快于入场。→ 本站:3D 展开动画在 reduced-motion 下替换为直接就位+静态高亮。出处:`animate.md` + `PRODUCT.md`(无障碍基线)
- [ ] 【弱】**伪实时装饰禁**:无真数据不脉动的 status dot、hero 假打字光标、自动滚动 marquee。→ 本站:无 live 概念,全部不用。出处:`registry` `pulsing-dot` / `blinking-cursor` / `marquee`

### 3.4 细节完成度

- [ ] 【强】**浏览器原生表面要设计**:文字选区、光标、滚动条、焦点环、下划线偏移、表格数字(tabular numerals)。为什么:"这是'造出来'而非'拼出来'的最廉价信号,也是模型最稳定跳过的一步"。→ 本站:选区色用朱砂系、滚动条青铜化、命盘数据表全 tabular-nums。出处:`craft-floor.md`(Browser surfaces)
- [ ] 【强】**所有值在 DESIGN.md 内**:字体/色值/圆角/字号不在设计系统内 = drift,编辑期即修。→ 本站:T09 产出的 tokens 文件即本站 DESIGN.md,页面不得出现阶梯外字面值。出处:`registry` `design-system-font` / `-color` / `-radius` / `-font-size`
- [ ] 【中】**quiet ≠ generic**:"安静的通用款=白底灰字+单一字重+同尺寸卡网格;克制仍需观点"。**bolder 只碰命名目标**:只放大系统已有的,不加新色/新字体/新效果;skeleton test(剥掉文字裸结构仍能说清这节是什么)。→ 本站:百科页求静时仍保留浑仪世界声部;改版时不大动 tokens。出处:`quieter.md` + `bolder.md`

---

## ④ 内容真实性(含"何为有出处的设计"判据)

### 4.1 主张与数据

- [ ] 【强】**商业与事实主张不可造**:价格、客户数、基准、端点、产品没有的能力——"Truth binds claims, not demonstrations"。→ 本站:无支付;但"本地确定性解读、结果可复现、数据不上传"是能力主张,写出来就必须为真;不写"最准/第一/百万用户"。
- [ ] 【强】**演示数据全保真并标注 synthetic**:示例命盘用真实排盘逻辑生成,并明标"示例生辰";给用户可替换的真实路径。→ 本站:Landing/OG 卡片的示例盘标注"演示用示例生辰",且点击可换成自己的。出处:`new-work.md`(Truth binds claims / Prove, don't claim)
- [ ] 【强】**不伪装状态**:无实时数据不装 live(脉动点/滚动条假进度);loading 只报真实阶段;同一文字同容器不重复 ≥3 次。→ 本站:排盘是本地瞬时计算,不需要假"分析中…"。出处:`registry` `pulsing-dot` / `repeated-container-text` + `clarify.md`
- [ ] 【中】**改事实性文案前先问**;主张与配置来自既定事实。→ 本站:解读内容改动走 T08 知识库流程,页面渲染层不擅改断语。出处:`skill/SKILL.src.md`(Refinement preserves)+ `skill/reference/polish.md`
- [ ] 【中】**证据规则约束"作为真实呈现"的证言/照片**:用户评价、古籍书影若放,须真实可溯;生成图像是材料不是主张。→ 本站:引用古籍原文须核版本(MAP:倪师 CC BY-NC-SA 内容一律不引)。出处:`skill/reference/visualize.md` + `wayfinder/MAP.md`(许可约束)
- [ ] 【中】**en 侧 8th-grade 可读性,jargon 只在精确需要时出现**。→ 本站:en 百科对术语首次出现给一句白话解释。出处:`PRODUCT.md`(无障碍基线)

### 4.2 首屏与展示

- [ ] 【强】**The first viewport is a thesis, not a header**:"若用户看一眼就走,一小时后他能描述什么?答案若只是一种情绪,概念还没成立"。→ 本站:Landing 第一屏 = 可输入生辰的真实排盘入口 + 真实 3D 命盘演示,不是标题+CTA+装饰。出处:`new-work.md`(§6)
- [ ] 【强】**Prove, don't claim**:展示主体在干活;演示一个竞品复制粘贴不走的细节。→ 本站:不写"最精美的命盘",直接放可转动的浑仪式 3D 盘。出处:`new-work.md`
- [ ] 【强】**世界承载页面,不是页面的画**("a viewport painted whole as a facade with no working parts is a picture of the world, not its website");模板换皮仍是模板(split hero / 居中标题+卡片排)。→ 本站:浑仪 3D 必须是可操作的排盘本体,不是 Landing 背景装饰。出处:`mode-persuade.md`
- [ ] 【强】**开场动作 = 品类访客来做的那个动作**(可用形态如"航司的航线+日期搜索")。→ 本站:首屏动作就是"输入生辰"。出处:`mode-persuade.md`
- [ ] 【弱】**捕获即证据**:截图/验收图里被动画时序隐藏的元素读作缺失;先稳定或禁用动效再截。→ 本站:T07 原型评审截图注意。出处:`new-work.md`(§7)

### 4.3 何为"有出处的设计"(grounded design 判据)

- [ ] 【强】**Design specificity test**:"构图、交互、视觉语言是否扎根于这个产品?无关产品能否原样使用?"——能=没出处。→ 本站验收:T07/T09 产出若套到塔罗/星座站仍成立,即不过检。出处:`skill/reference/critique.md`
- [ ] 【强】**饱和外观校准**:AI 生成 UI 收敛于四种look(暖奶油+高对比衬线+赤陶红 / 近黑+单霓虹+发光边 / 报刊 hairline+斜体衬线+tracked mono / 平涂饱和墨+黑框+硬偏移影);"若别人能从品类(或品类+禁忌)猜出你的美学,自检失败"。→ 本站:浑仪·青铜已避开四 look,但每张新页面仍要过"能否被猜出来"测试。出处:`new-work.md`(skill-calibration-saturated-looks)
- [ ] 【强】**字体与材料像从主体世界挑的物件**("choose faces like objects from the subject's world");"题材=书 → 奶油+衬线"是默认穿题材的衣服。→ 本站:"玄学=古风衬线+星尘紫"是品类反射;从浑仪、星图、矿彩、铭文中取材料依据。出处:`new-work.md`
- [ ] 【强】**Brief wins(已钉死的世界不容改向)**:"Redirecting a clear brief toward your taste is failure";且 pinned world 锁的是世界不是最保守渲染——材料全谱(矿彩、锈绿、鎏金、朱砂、金属、漆)都在可玩范围。→ 本站:MAP 已钉浑仪·青铜,后续设计票在此世界内做满,不折中成"安全米白+一点金"。出处:`SKILL.src.md`(The brief wins)+ `new-work.md`(skill-pinned-world-not-default-rendition)
- [ ] 【强】**Operate 页"earned familiarity"**:工具 UI 的失败不是平淡而是无理由的怪;不为标准任务发明新 affordance;label 位置、表单控件、列表滚动都用地道形态。→ 本站:排盘输入用标准表单(日期/时辰选择器),3D 交互用直觉拖转+缩放,不造特殊手势。出处:`operate.md`(The product slop test)
- [ ] 【强】**明暗按场景定,不按品类**:"写一句物理场景(谁、在哪、什么环境光)逼出答案"。→ 本站:夜间观星/烛下铜仪的物理场景天然指向暗底——这是本站暗主题的"出处句",写进 T09。出处:`new-work.md`(skill-color-strategy)
- [ ] 【强】**Practice what you preach**:自家站点必须全量通过自家清单。→ 本站:MAP 已定"一切设计票过本清单";本文件即执行工具。出处:`PRODUCT.md`(原则 1)

---

## 附:本站高危 Top 10(评审先查)

1. 鎏金渐变文字(`gradient-text`)
2. 3D 命盘外圈 CSS 发光/光晕(`dark-glow` / `radial-halo`)
3. 标题上方"紫微斗数·排盘"小帽标/药丸(`kicker-above-heading` ban)
4. 同尺寸三卡特性阵列+icon 圆块(`icon-tile-stack` / identical cards)
5. 装饰刻度环不对齐真实宫位数据(DESIGN.md calibration marks)
6. 01/02/03 卖点序号(`numbered-section-labels`)
7. 双语黑话(EN buzzwords / 中文"开启…之旅""智能解读"——后者同时是虚假主张)
8. 锈绿底上灰字、暖炭底对比不足(`gray-on-color` / `low-contrast`)
9. 假打字光标、脉动点、假分析进度(伪状态)
10. Landing 只有浑仪布景、没有可用的排盘入口(world as picture)

## 来源与复核

- 仓库:pbakaus/impeccable(main @ 4f95649,Apache-2.0,98k+ stars);浅克隆 `D:\tmp\impeccable-research`,逐条提取笔记 `D:\tmp\impeccable-research-extraction.md`。
- 本文件全部条目已对照仓库原始文件复核:规则注册表 `crates/foundation/src/registry.rs`;词表/节奏正则 `crates/detect/src/regex_matchers.rs`;字体表 `crates/foundation/src/constants.rs`;CJK 规则 `crates/core/src/checks/text_rules.rs`;底线 `skill/reference/craft-floor.md`;新作品准则 `skill/reference/new-work.md`;文案 `skill/reference/clarify.md`;模式与命令 `skill/reference/{operate,mode-read,mode-persuade,animate,typeset,layout,colorize,quieter,bolder,distill,harden,onboard,critique,polish}.md`;品牌示范 `PRODUCT.md` / `DESIGN.md`。
- 中文 slop 词表与"破折号中文阈值"为基于仓库机械规则的**本站衍生**(已逐条标注),其余均为仓库原文准则的编译。
