# Lecture 7 Hash Indices

## Final Review 重点

- <span class="key-point">Hash index 适合 equality search，不适合 range queries。</span>
- <span class="key-point">Static hashing 会有 overflow chains；Dynamic hashing 重点是 extendible hashing 和 linear hashing。</span>
- <span class="key-point">Extendible hashing 关注 global depth / local depth / directory doubling。</span>
- <span class="key-point">Linear hashing 关注 split pointer、逐步扩容、不需要目录翻倍。</span>

---

## 1 Overview

这一讲讨论的是：

- 哈希索引如何把 key 映射到 bucket
- 冲突如何处理
- 为什么静态哈希不够用
- 动态哈希如何渐进扩展

和 B+ 树相比，哈希索引的关键词是：

\[
\boxed{\text{equality search 快，range query 弱}}
\]

---

## 2 Hash Table 基本概念

| 概念 | 含义 |
| --- | --- |
| Hash Table | 把 key 映射到 value 的无序 associative array |
| Hash Function | 把大 key space 映射到较小地址空间 |
| Bucket / Slot | 保存哈希结果对应元素的位置 |

哈希表的核心目标是：

- 快速定位某个 key 对应的位置

---

## 3 Static Hash Table

课件先从最理想化的静态哈希表讲起。

### 3.1 基本假设

| 假设 | 含义 |
| --- | --- |
| 提前知道 tuple 数量 | 可以预估表大小 |
| 每个 key 唯一 | 暂不考虑重复 key |
| 哈希函数足够理想 | 冲突少甚至无冲突 |

### 3.2 问题

现实里这些假设往往不成立，所以必须处理：

- collision
- overflow
- growth

---

## 4 两个核心设计决策

### 4.1 Design Decision #1: Hash Function

| 问题 | 说明 |
| --- | --- |
| 如何把大 key 空间映射到小地址空间 | 哈希函数的任务 |
| 关注什么 | 速度与 collision rate 的权衡 |

### 4.2 Design Decision #2: Hashing Scheme

| 问题 | 说明 |
| --- | --- |
| 冲突后怎么办 | 哈希方案的任务 |
| 关注什么 | 更大表空间 vs 更多查找/插入操作 |

---

## 5 Hash Functions

### 5.1 哈希函数的目标

课件强调：

- 我们不需要 cryptographic hash
- 更需要的是 **fast + low collision rate**

### 5.2 两个极端

| 极端 | 问题 |
| --- | --- |
| 总返回 `1` | 速度快但冲突灾难性 |
| Perfect Hashing | 冲突最低但通常不现实 |

### 5.3 课件举的常见哈希函数

| 名称 | 特点 |
| --- | --- |
| CRC-64 | 最早用于网络差错检测 |
| MurmurHash | 快速通用哈希 |
| CityHash | 对短 key 更快 |
| XXHash | 高吞吐 |
| FarmHash | CityHash 的后续改进版 |

---

## 6 Hashing Schemes 总览

课件列出的主要哈希方案有：

| Scheme | 类型 |
| --- | --- |
| Chained Hashing | 冲突后挂链 |
| Linear Probe Hashing | 开放寻址 |
| Robin Hood Hashing | 开放寻址优化 |
| Cuckoo Hashing | 多表/多函数 |
| Extendible Hashing | 动态哈希 |
| Linear Hashing | 动态哈希 |

---

## 7 Chained Hashing

### 7.1 核心思想

每个 slot 对应一个 bucket 链表。

| 行为 | 说明 |
| --- | --- |
| lookup | 哈希到对应 bucket，再顺着链表扫描 |
| insertion | 插入到对应 bucket 链中 |
| deletion | 从 bucket 链中删除 |

### 7.2 优缺点

| 方面 | 表现 |
| --- | --- |
| 优点 | 实现简单，扩展直观 |
| 缺点 | bucket 链可能越来越长，查找性能下降 |

---

## 8 Linear Probing

### 8.1 核心思想

冲突时不挂链，而是在同一张大表中继续向后线性寻找下一个空位。

| 行为 | 说明 |
| --- | --- |
| lookup | 从哈希位置开始线性扫描 |
| insertion | 找到下一个空 slot |
| deletion | 处理更麻烦，不能简单清空破坏探测链 |

### 8.2 特点

| 特点 | 含义 |
| --- | --- |
| 必须把 key 存在表里 | 否则不知道何时停止扫描 |
| 会产生聚集 | 连续冲突会导致长探测区 |

---

## 9 Robin Hood Hashing

### 9.1 基本思想

这是 linear probing 的变种，核心是：

- “远离自己理想位置的 key” 可以抢占更接近理想位置的 key 的槽位

### 9.2 额外记录的信息

| 数据 | 含义 |
| --- | --- |
| displacement / jumps | 当前 key 距离其理想位置有多远 |

### 9.3 作用

| 目标 | 说明 |
| --- | --- |
| 减少最坏探测长度 | 让查找路径更均衡 |
| 降低方差 | 避免少数元素特别倒霉 |

---

## 10 Cuckoo Hashing

### 10.1 核心思想

使用多个哈希表或多个哈希函数。

| 过程 | 说明 |
| --- | --- |
| lookup | 只检查每张表中的一个可能位置 |
| insertion | 任意一个位置有空就插入 |
| 若都满 | 踢出其中一个已有元素，再对被踢元素重新安置 |

### 10.2 优点

| 优点 | 说明 |
| --- | --- |
| lookup 非常快 | 只查固定少量位置 |

### 10.3 风险

| 风险 | 说明 |
| --- | --- |
| 可能出现循环踢出 | 导致无限循环 |
| 解决方法 | rebuild 整个表并换哈希函数 |

### 10.4 课件结论

| 哈希函数个数 | 大致装载率 |
| --- | --- |
| 2 个 | 约 50% 前通常无需重建 |
| 3 个 | 约 90% 前通常无需重建 |

---

## 11 Extendible Hashing

这是课件中的第一种动态哈希。

### 11.1 基本思想

| 特征 | 说明 |
| --- | --- |
| 基于 chained hashing | 但不让 overflow chain 无限增长 |
| split bucket | 溢出时分裂 bucket |
| directory | 多个目录项可指向同一个 bucket |
| localized movement | 只重排被 split 的那条链上的数据 |

### 11.2 两个关键数据结构

| 数据结构 | 含义 |
| --- | --- |
| Global Depth | 目录当前查看的哈希前缀位数 |
| Local Depth | 某个 bucket 当前真正区分的位数 |

### 11.3 分裂时会发生什么

| 情况 | 处理 |
| --- | --- |
| `local depth < global depth` | 只分裂 bucket，重分布记录 |
| `local depth = global depth` | 目录加倍，再分裂 bucket |

### 11.4 优缺点

| 方面 | 表现 |
| --- | --- |
| 优点 | 扩容时数据移动局部化 |
| 缺点 | 需要 directory，空间和实现复杂度更高 |

---

## 12 Linear Hashing

这是第二种动态哈希。

### 12.1 核心思想

不像 extendible hashing 那样一次把目录翻倍，linear hashing 采用：

- 逐步扩容
- 逐个 bucket split

### 12.2 关键机制

| 机制 | 含义 |
| --- | --- |
| Split Pointer | 指向下一次要 split 的 bucket |
| Overflow Trigger | 某个 bucket 溢出时触发扩容流程 |
| Hash Family | 用一组相关哈希函数决定当前映射 |

### 12.3 为什么叫 linear

因为 bucket 不是一次翻倍扩张，而是按 split pointer 线性推进。

### 12.4 好处

| 优点 | 说明 |
| --- | --- |
| 不需要大目录翻倍 | 扩容更平滑 |
| 扩容开销分摊 | 每次只 split 一个 bucket |

### 12.5 课件强调

即使当前溢出发生在某个 bucket，真正 split 的也可能是：

- split pointer 指向的 bucket

这样能保证最终所有 overflowed buckets 都会被逐步处理到。

---

## 13 Hash Index 在数据库里的定位

### 13.1 最适合的查询类型

| 查询类型 | 适配性 |
| --- | --- |
| Equality Search | 非常适合 |
| Range Query | 不适合 |

### 13.2 原因

哈希会打乱 key 的有序性，所以：

- 查某个具体值很快
- 查一个区间时无法像 B+ 树那样顺序扫描

这也是 final review 里明确要求掌握的结论。

---

## 14 Hash Index 与 B+ Tree 的比较

| 维度 | Hash Index | B+ Tree |
| --- | --- | --- |
| Equality Search | 强 | 强 |
| Range Query | 弱 | 强 |
| 是否有序 | 无序 | 有序 |
| 扩容方式 | 依赖哈希方案 | 依赖节点 split / merge |
| 典型用途 | 精确匹配 | 范围、排序、前缀 |

---

## 15 Lecture 7 总结

这章建议按三层来记：

1. 先记哈希索引的定位：`equality good, range bad`
2. 再记冲突处理：chain、probe、robin hood、cuckoo
3. 最后记动态扩容：extendible hashing、linear hashing

\[
\boxed{\text{哈希索引的核心，是用哈希函数换取高效精确查找，但代价是失去顺序性}}
\]

