# Final Review

## 1 Exam Scope

期末复习范围分成两大部分：

| Part | 范围 |
| --- | --- |
| Part I: Foundations & Design | Chapters 1–7 |
| Part II: Storage, Query & Transactions | Chapters 12–19 |

### 1.1 Part I

| Chapter | 主题 |
| --- | --- |
| Ch.1 | Introduction & Overview of Database Systems |
| Ch.2 | Relational Model & Relational Algebra |
| Ch.3–5 | SQL（Basic / Intermediate / Advanced） |
| Ch.6 | E-R Model & Database Design |
| Ch.7 | Relational Database Design（Normalization Theory） |
| Ch.8 | Complex Data Types（JSON / Semi-structured Data） |

### 1.2 Part II

| Chapter | 主题 |
| --- | --- |
| Ch.12–13 | Physical Storage & Data Storage Structures |
| Ch.14 | Indexing（B+-Tree / Hash Indices） |
| Ch.15 | Query Processing |
| Ch.16 | Query Optimization |
| Ch.17 | Transactions |
| Ch.18 | Concurrency Control |
| Ch.19 | Recovery System |

---

## 2 Semi-Structured Data

### 2.1 为什么需要半结构化数据

| 场景 | 说明 |
| --- | --- |
| complex data | 数据结构复杂、变化快 |
| flexible schema | 不希望像关系模型那样强制严格原子化 |
| data exchange | 应用之间、前后端之间交换数据方便 |

### 2.2 主要特征

| 特征 | 说明 |
| --- | --- |
| Flexible schema | 模式可以更灵活变化 |
| Wide column | 每个 tuple 的属性集合可以不同 |
| Sparse column | 固定大 schema 下每行只存一部分属性 |
| Multivalued data types | 支持集合、多重集 |
| Key-value map | 一组键值对 |
| Arrays | 特别适合科学和监控数据 |

### 2.3 两种典型模型

| 模型 | 特点 |
| --- | --- |
| JSON | JavaScript Object Notation，文本化、交换方便 |
| XML | 使用 tag，自描述性强 |

### 2.4 JSON / XML 例子

课件分别给了：

- JSON 的嵌套对象与数组
- XML 的 purchase order 层次结构

要点是理解：

- nested objects
- arrays
- hierarchical structure

---

## 3 Exam Format & Grading

| 题型 | 数量 | 内容 | 分值 |
| --- | --- | --- | --- |
| Multiple Choice | 20 | 覆盖所有章节 | 40 |
| Short Answer | 5 | RA / SQL correction / Normalization / Indexing / Transactions | 25 |
| Comprehensive | 4 | B+-Tree、Query cost、Concurrency control、Crash recovery | 35 |
| Total | 29 items | — | 100 |

---

## 4 Ch.1–2 Foundations & Relational Model

### 4.1 Ch.1 Overview

| 重点 | 说明 |
| --- | --- |
| Three-level abstraction | Physical → Logical → View |
| Data models | Relational、E-R、Semi-structured、Object-based、Key-value、Graph |
| DBMS core components | Storage Manager、Query Processor、Transaction Manager |

### 4.2 Ch.2 Relational Model & RA

| 重点 | 说明 |
| --- | --- |
| Keys | Superkey → Candidate Key → Primary Key；还有 Foreign Key |
| Six primitive RA ops | `σ`、`π`、`∪`、`−`、`×`、`ρ` |
| Extended ops | `⋈`、`∩`、`÷`、outer joins |
| Natural Join | 自动匹配同名属性并去掉重复列 |

---

## 5 Ch.3–5 SQL

### 5.1 Basic SQL

| 重点 | 说明 |
| --- | --- |
| 执行主线 | `SELECT-FROM-WHERE-GROUP BY-HAVING-ORDER BY` |
| Aggregates | `COUNT` / `SUM` / `AVG` / `MIN` / `MAX` |
| `COUNT(*)` vs `COUNT(col)` | 后者忽略 `NULL` |
| Set Operations | `UNION / INTERSECT / EXCEPT` 默认去重 |

### 5.2 Intermediate SQL

| 重点 | 说明 |
| --- | --- |
| Joins | INNER / LEFT / RIGHT / FULL OUTER |
| NATURAL JOIN vs USING | 连接语义差异 |
| Views | virtual vs materialized；更新有限制 |
| Constraints | `NOT NULL`、`PRIMARY KEY`、`UNIQUE`、`CHECK`、`FOREIGN KEY` |
| Three-valued logic | `TRUE / FALSE / UNKNOWN` |

### 5.3 Advanced SQL

| 重点 | 说明 |
| --- | --- |
| Triggers | BEFORE/AFTER；row-level / statement-level |
| Recursive Queries | `WITH RECURSIVE` |
| SQL Injection | prepared statements / parameterized queries |

---

## 6 Ch.6–7 E-R Model & Normalization

### 6.1 E-R Model

| 重点 | 说明 |
| --- | --- |
| Mapping Cardinalities | 1:1 / 1:N / M:N |
| Participation | total vs partial |
| Weak Entity Sets | owner entity + discriminator |
| ER to relational mapping | `M:N` 单独建表；`1:N` 外键加在 many 侧 |
| Specialization | disjoint vs overlapping；total vs partial |

### 6.2 Normalization

| 重点 | 说明 |
| --- | --- |
| Functional Dependency | `α→β` |
| Attribute Closure | `α⁺` |
| Normal Forms | 1NF → 2NF → 3NF → BCNF |
| BCNF decomposition | 违反 BCNF 的 FD 驱动分解 |
| 3NF decomposition | 保证 lossless join + dependency preservation |

---

## 7 Ch.12–14 Storage & Indexing

### 7.1 Physical Storage

| 重点 | 说明 |
| --- | --- |
| Disk access time | seek time + rotational latency + transfer time |
| Sequential vs Random | 机械磁盘上顺序访问远快于随机访问 |
| RAID | 0 / 1 / 5 / 6 的容错与并行特性 |

### 7.2 Data Storage Structures

| 重点 | 说明 |
| --- | --- |
| Fixed vs Variable-length records | 两种记录布局 |
| Free-space management | free list |
| Buffer manager | `LRU` vs `MRU`，nested-loop join inner 偏好 `MRU` |

### 7.3 Indexing

| 重点 | 说明 |
| --- | --- |
| Dense vs Sparse | 一个搜索键一个条目 vs 只保留部分条目 |
| Clustering vs Secondary | 一个关系最多一个 clustering index |
| B+-Tree | key 都在叶子；内部节点做导航 |
| Search / Insert / Delete | B+ 树三大操作 |
| Hash Index | 适合 equality，不适合 range |
| Static / Dynamic Hashing | overflow chains / extendible / linear hashing |

---

## 8 Ch.15–16 Query Processing & Optimization

### 8.1 Query Processing

| 重点 | 说明 |
| --- | --- |
| Phases | Parsing & Translation → Optimization → Evaluation |
| Selection cost | 各种选择算法代价 |
| Sorting cost | 外排序等代价分析 |
| Join cost | 各类连接算法代价 |

### 8.2 Query Optimization

| 重点 | 说明 |
| --- | --- |
| Equivalence rules | selection/projection pushdown；join 交换律/结合律 |
| Heuristic optimization | 尽早做 selection 和 projection |
| Cost estimation | 基于统计信息 |

---

## 9 Ch.17–19 Transaction Management

### 9.1 Transactions

| 重点 | 说明 |
| --- | --- |
| ACID | Atomicity / Consistency / Isolation / Durability |
| Conflict serializability | precedence graph 无环 |
| View serializability | 范围更大，包含 conflict serializability |
| Concurrency anomalies | dirty read / non-repeatable read / phantom read |
| Isolation levels | RU → RC → RR → Serializable |

### 9.2 Concurrency Control

| 重点 | 说明 |
| --- | --- |
| 2PL | growing → lock point → shrinking |
| Strict 2PL | X locks 持有到 commit |
| Deadlock detection | waits-for graph cycle |
| Deadlock prevention | wait-die / wound-wait |
| Multiple granularity locking | `IS / IX / S / SIX / X` |

### 9.3 Recovery System

| 重点 | 说明 |
| --- | --- |
| WAL | 日志先于数据页落盘 |
| Log record types | `<start> <update> <commit> <abort> <checkpoint>` |
| Recovery | 从 checkpoint 往后 redo committed，向后回退 undo uncommitted |
| Checkpoint | 限制恢复时需要扫描的日志量 |

---

## 10 Review Advice

课件最后给的建议是：

| 建议 | 含义 |
| --- | --- |
| Textbook first | 先以教材为主线 |
| Understand the WHY | 不只背定义，更要理解为什么这样设计 |

---

## 11 Final Review 总结

这份 PPT 的作用不是讲新知识，而是把整门课压缩成一张期末复习地图。

最值得反复看的四条主线是：

1. Foundations & Design
2. Storage & Indexing
3. Query Processing & Optimization
4. Transaction / Concurrency / Recovery

\[
\boxed{\text{Final Review 的核心价值，是把“分散在各讲里的知识点”重新压成考试视角下的重点清单}}
\]
