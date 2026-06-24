# Lecture 4 Relational Database Design

## Final Review 重点

- <span class="key-point">Functional Dependency `α→β`：`α` 的值唯一决定 `β`。</span>
- <span class="key-point">Attribute closure `α⁺`：反复套用 FD 直到不再变化。</span>
- <span class="key-point">Normal forms：1NF → 2NF → 3NF → BCNF。</span>
- <span class="key-point">BCNF decomposition：找违反 BCNF 的 FD，反复分解。</span>
- <span class="key-point">3NF decomposition：保证 lossless join + dependency preservation。</span>

---

## 1 Overview

这一讲解决的问题是：

- 为什么关系模式会有坏设计
- 怎样用规范化理论识别坏设计
- 怎样分解成更好的关系模式

主线就是：

\[
\text{anomaly} \rightarrow \text{FD} \rightarrow \text{normal forms} \rightarrow \text{decomposition}
\]

---

## 2 为什么需要规范化

### 2.1 Repetition of Information

如果把太多信息塞进一个 relation，会带来重复存储和异常。

### 2.2 三类异常

| 异常 | 含义 |
| --- | --- |
| Update Anomaly | 同一事实重复出现，修改时可能改不全 |
| Insert Anomaly | 想插入一个事实却被迫附带无关信息 |
| Delete Anomaly | 删除一条记录时把本不该丢失的信息一起删掉 |

规范化的目标，就是通过更合理的 relation design 消除这些问题。

---

## 3 Decomposition

### 3.1 基本思想

把一个大关系拆成多个更小关系。

### 3.2 分解后的要求

| 要求 | 含义 |
| --- | --- |
| lossless | 连接回去不能产生伪元组 |
| good form | 每个子关系都应处于更好的 normal form |
| preferably dependency preserving | 分解后依赖最好还能在局部检查 |

### 3.3 Lossy vs Lossless

| 类型 | 结果 |
| --- | --- |
| Lossy decomposition | 连接后会出现原来不存在的组合 |
| Lossless decomposition | 连接后正好恢复原关系 |

课件例子里，`R(A,B,C)` 分解为 `R1(A,B)` 和 `R2(B,C)`，是否无损取决于公共属性 `B` 是否足以连接出唯一组合。

---

## 4 Normalization Theory

规范化理论要做三件事：

| 任务 | 含义 |
| --- | --- |
| 判断 R 是否处于 good form | 识别坏设计 |
| 把坏模式分解 | 拆成一组更好关系 |
| 保证分解正确 | 至少无损，最好保持依赖 |

理论基础主要有：

| 基础 | 作用 |
| --- | --- |
| Functional Dependencies | 描述属性间确定关系 |
| Multivalued Dependencies | 描述多值独立关系，供更高范式使用 |

---

## 5 Functional Dependency

### 5.1 定义

在 relation schema `R` 上，若对任意合法关系实例 `r(R)`，只要两个元组在属性集 `α` 上相同，就一定在属性集 `β` 上也相同，则称：

\[
\alpha \rightarrow \beta
\]

成立。

### 5.2 直觉

| FD | 直觉含义 |
| --- | --- |
| `ID → name` | 学号唯一决定姓名 |
| `dept_name → building` | 院系名唯一决定办公楼 |

### 5.3 FD 与 key 的关系

| 概念 | 关系 |
| --- | --- |
| key | 一种特殊而更强的约束 |
| FD | key 的一般化 |

---

## 6 Keys and Related Attributes

### 6.1 Key 与 FD

| 概念 | 定义 |
| --- | --- |
| Superkey | `K → R` |
| Candidate Key | `K → R` 且不存在真子集 `α ⊂ K` 仍满足 `α → R` |

### 6.2 Prime / Non-prime Attribute

| 概念 | 含义 |
| --- | --- |
| Prime Attribute | 出现在某个 candidate key 中的属性 |
| Non-prime Attribute | 不属于任何 candidate key 的属性 |

这组概念后面判断 2NF / 3NF / BCNF 时会反复用到。

---

## 7 几种依赖的分类

### 7.1 Trivial FD

| 类型 | 判定 |
| --- | --- |
| Trivial FD | `β ⊆ α` |
| Non-trivial FD | `β ⊄ α` |
| Completely non-trivial FD | `α ∩ β = \varnothing` |

### 7.2 Transitive Dependency

若：

- `α → β`
- `β ↛ α`
- `β → A`

则 `α → A` 是通过 `β` 传递得到的依赖，即 **transitive dependency**。

### 7.3 Partial Dependency

若：

- `α → β`
- 存在真子集 `γ ⊂ α`
- 且 `γ → β`

则 `α → β` 是 **partial dependency**。

### 7.4 课件强调

| 依赖类型 | 常用于判断 |
| --- | --- |
| partial dependency | 2NF |
| transitive dependency | 3NF |

---

## 8 Closure

### 8.1 FDs Set Closure

| 概念 | 含义 |
| --- | --- |
| `F⁺` | 由 `F` 逻辑推出的全部功能依赖集合 |

### 8.2 Armstrong’s Axioms

求 `F⁺` 的基本推理规则是：

| 公理 | 规则 |
| --- | --- |
| Reflexivity | 若 `β ⊆ α`，则 `α → β` |
| Augmentation | 若 `α → β`，则 `γα → γβ` |
| Transitivity | 若 `α → β` 且 `β → γ`，则 `α → γ` |

常见推论还包括：

| 推论 | 含义 |
| --- | --- |
| Union | 若 `α→β` 且 `α→γ`，则 `α→βγ` |
| Decomposition | 若 `α→βγ`，则 `α→β` 且 `α→γ` |
| Pseudotransitivity | 若 `α→β` 且 `γβ→δ`，则 `γα→δ` |

### 8.3 Attribute Closure

| 概念 | 含义 |
| --- | --- |
| `α⁺` | 在 FD 集 `F` 下，由 `α` 能推出的全部属性 |

### 8.4 Attribute Closure 的用途

| 用途 | 说明 |
| --- | --- |
| 判断 `α` 是否为 superkey | 看 `α⁺` 是否包含 `R` 全部属性 |
| 判断 FD 是否成立 | 看 `β ⊆ α⁺` 是否成立 |
| 求 candidate key | 反复试探最小 superkey |

---

## 9 Lossless Join Decomposition

规范化时，分解必须至少保证无损连接。

### 9.1 二元分解判据

对 `R` 分解为 `R1` 和 `R2`，若以下任一成立，则分解无损：

\[
(R_1 \cap R_2) \rightarrow R_1
\]

或

\[
(R_1 \cap R_2) \rightarrow R_2
\]

### 9.2 直觉

公共属性必须足够强，能唯一决定其中一边关系。

---

## 10 Dependency Preservation

### 10.1 为什么需要保持依赖

如果分解后某个 FD 只能通过把多个关系 join 回来才能检查，代价会非常高。

### 10.2 定义

| 概念 | 含义 |
| --- | --- |
| dependency preserving | 原依赖集 `F` 可由各子关系局部投影出的依赖共同推出 |

### 10.3 规范化中的取舍

| 目标 | 是否总能同时满足 |
| --- | --- |
| BCNF + lossless | 可以 |
| BCNF + lossless + dependency preserving | 不一定 |
| 3NF + lossless + dependency preserving | 总可以做到 |

---

## 11 Equivalence of FD Sets and Canonical Cover

### 11.1 FD Sets 等价

| 概念 | 含义 |
| --- | --- |
| `F` 与 `G` 等价 | `F⁺ = G⁺` |

### 11.2 Canonical Cover

| 概念 | 含义 |
| --- | --- |
| canonical cover | 与原 FD 集等价、但更简洁的依赖集 |

### 11.3 Canonical Cover 的目标

| 目标 | 说明 |
| --- | --- |
| 去冗余 FD | 删除可推出的依赖 |
| 去冗余属性 | 删除左右两侧多余属性 |
| 合并左侧相同 FD | 方便后续 3NF 分解 |

---

## 12 Normal Forms

### 12.1 1NF

| 范式 | 含义 |
| --- | --- |
| 1NF | 每个属性值都应是原子的 |

### 12.2 2NF

| 范式 | 判定 |
| --- | --- |
| 2NF | 不允许 non-prime attribute 对 candidate key 存在 partial dependency |

### 12.3 3NF

一个关系在 3NF 中，当对每个非平凡 FD `α→β`，至少满足下面之一：

| 条件 | 含义 |
| --- | --- |
| `α` 是 superkey | 左边足够强 |
| `β-α` 中每个属性都是 prime attribute | 右边属性足够特殊 |

3NF 的本质是：

- 允许少量不如 BCNF 严格的情况
- 但换来 dependency preservation

### 12.4 BCNF

| 范式 | 判定 |
| --- | --- |
| BCNF | 对每个非平凡 FD `α→β`，`α` 都必须是 superkey |

### 12.5 关系

| 关系 | 说明 |
| --- | --- |
| BCNF ⊂ 3NF | BCNF 比 3NF 更严格 |
| 若关系在 BCNF 中 | 一定也在 3NF 中 |

---

## 13 BCNF Decomposition

### 13.1 算法思想

若关系 `R` 不满足 BCNF：

1. 找到一个违反 BCNF 的 FD `α→β`
2. 把 `R` 分解成：
   - `R1 = α ∪ β`
   - `R2 = R - (β - α)`
3. 对得到的子关系继续递归检查

### 13.2 BCNF 分解的性质

| 性质 | 说明 |
| --- | --- |
| lossless join | 能保证 |
| dependency preserving | 不能保证 |

---

## 14 3NF Decomposition

### 14.1 为什么要 3NF 分解

当 BCNF 无法同时保证：

- 无损连接
- 依赖保持

就退一步使用 3NF。

### 14.2 3NF 分解思路

课件核心流程是：

| 步骤 | 内容 |
| --- | --- |
| 1 | 求 `F` 的 canonical cover |
| 2 | 对每个 `α→β` 建一个关系模式 `αβ` |
| 3 | 如果没有任何关系包含 candidate key，则再补一个包含某候选键的关系 |

### 14.3 3NF 分解性质

| 性质 | 说明 |
| --- | --- |
| lossless join | 能保证 |
| dependency preserving | 能保证 |

---

## 15 BCNF 与 3NF 的比较

| 比较项 | BCNF | 3NF |
| --- | --- | --- |
| 冗余控制 | 更强 | 稍弱 |
| 依赖保持 | 不一定 | 可以保证 |
| 无损连接 | 可以保证 | 可以保证 |
| 工程取舍 | 更“干净” | 更“实用” |

课件明确结论：

- 并不总能同时得到 `BCNF + dependency preservation`
- 所以工程上经常需要在 BCNF 和 3NF 间取舍

---

## 16 Denormalization

### 16.1 为什么会反规范化

规范化减少冗余，但有时会增加 join 成本。

### 16.2 Denormalization 的含义

| 概念 | 含义 |
| --- | --- |
| Normalization | 为减少异常，把关系拆小 |
| Denormalization | 为了性能，把部分信息重新合并或冗余存储 |

因此数据库设计不是“范式越高越绝对正确”，而是：

- 先保证逻辑正确
- 再按 workload 调优

---

## 17 ER Model and Normalization

课件提到一个重要观点：

| 观点 | 含义 |
| --- | --- |
| 设计良好的 E-R 图通常不需要太多后续规范化 | 因为很多结构问题在概念设计阶段已避免 |

也就是说：

- E-R 设计与规范化不是两套完全独立的东西
- 它们是同一问题在不同抽象层的两种解决方式

---

## 18 更高范式与 MVD

课件最后提到：

| 概念 | 作用 |
| --- | --- |
| Multivalued Dependency | 更高范式理论的基础 |
| 4NF 等 | 进一步处理多值独立带来的冗余 |

但本讲主线仍然是：

- FD
- 1NF / 2NF / 3NF / BCNF

---

## 19 Lecture 4 总结

这一讲的复习顺序建议是：

1. 先记三类 anomaly
2. 再理解 FD、key、prime attribute
3. 然后掌握 closure、lossless、dependency preservation
4. 最后比较 2NF / 3NF / BCNF 及其分解算法

\[
\boxed{\text{关系模式设计的核心，是用依赖理论控制冗余与异常，并在“更高范式”和“依赖保持”之间做取舍}}
\]

