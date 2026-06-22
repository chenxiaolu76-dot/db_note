# Lecture 12 Recovery

## 1 Overview

这一讲讨论的是：数据库在发生事务失败、系统崩溃后，怎样保证事务的原子性和持久性。

从考试角度看，这一讲的主线非常清楚：

- 为什么需要 recovery
- failure 有哪些类型
- undo / redo 分别解决什么问题
- buffer management policy 如何决定恢复方案
- shadow paging 是什么
- log-based recovery 与 WAL 是什么
- checkpoint 有什么作用

这一讲可以看成是对 Lecture 10 事务性质里：

- atomicity
- durability

这两点的具体实现补充。

---

## 2 Motivation

数据库中的更新通常不会立刻直接写进磁盘，而是先写入 **buffer pool**，之后再由系统选择合适时机刷盘。

这会导致两类典型风险：

| 情况 | 问题 | 需要的恢复动作 |
| --- | --- | --- |
| 事务已经提交，但更新还没写入磁盘 | 崩溃后提交结果可能丢失 | `redo` |
| 事务还没提交，但更新已经写入磁盘 | 崩溃后磁盘上留下未提交数据 | `undo` |

所以恢复系统的核心任务就是：

\[
\boxed{\text{保留所有应该保留的提交结果，撤销所有不该留下的未提交结果}}
\]

---

## 3 Failure Classification

### 3.1 失败类型

| Failure Type | 含义 | 例子 | DBMS 能否处理 |
| --- | --- | --- | --- |
| Transaction failure | 单个事务执行失败 | 逻辑错误、违反约束 | 能 |
| System error | DBMS 因错误条件终止事务 | deadlock | 能 |
| System crash | 系统级崩溃 | 断电、软件崩溃 | 能，前提是稳定存储未损坏 |
| Disk failure | 磁盘内容损坏或丢失 | 介质故障 | 不能，只能从归档恢复 |

### 3.2 课件中的两个假设

| 假设 | 含义 |
| --- | --- |
| Fail-stop assumption | 系统崩溃时直接停机，但非易失存储内容不被一起破坏 |
| Detectable destruction | 磁盘损坏是可检测的，例如通过 checksum |

考试里要特别注意：

- **system crash** 还能靠恢复算法解决
- **disk failure** 超出普通恢复算法能力，必须依赖备份

---

## 4 Undo vs. Redo

### 4.1 基本定义

| 概念 | 定义 | 解决的问题 |
| --- | --- | --- |
| Undo | 去除未完成或 aborted 事务的影响 | atomicity |
| Redo | 重新施加已提交事务的影响 | durability |

### 4.2 直观理解

| 事务状态 | 它的修改应不应该留在数据库里 | 恢复时动作 |
| --- | --- | --- |
| 已提交 | 应该保留 | 必要时 `redo` |
| 未提交 / 已中止 | 不应该保留 | 必要时 `undo` |

所以可以直接记：

- `undo` 面向未提交事务
- `redo` 面向已提交事务

---

## 5 Buffer Management Policy

恢复问题为什么会出现，本质上取决于缓冲区如何与磁盘交互。课件用两个维度来描述。

### 5.1 STEAL / NO-STEAL

| 策略 | 含义 | 对恢复的影响 |
| --- | --- | --- |
| STEAL | 允许未提交事务修改过的页先写回磁盘 | 需要 `undo` |
| NO-STEAL | 不允许未提交事务修改过的页写回磁盘 | 不需要 `undo` |

### 5.2 FORCE / NO-FORCE

| 策略 | 含义 | 对恢复的影响 |
| --- | --- | --- |
| FORCE | 事务提交时，必须把它修改过的页全部写回磁盘 | 不需要 `redo` |
| NO-FORCE | 事务提交时，不要求所有修改页立刻写回磁盘 | 需要 `redo` |

### 5.3 四种组合

| Policy | Undo | Redo | 说明 |
| --- | --- | --- | --- |
| NO-STEAL + FORCE | 否 | 否 | 恢复最简单 |
| NO-STEAL + NO-FORCE | 否 | 是 | 提交后可能还没落盘 |
| STEAL + FORCE | 是 | 否 | 未提交页可能先落盘 |
| STEAL + NO-FORCE | 是 | 是 | 现实中最常见 |

### 5.4 性能与恢复的权衡

| Policy 倾向 | 运行时性能 | 恢复复杂度 |
| --- | --- | --- |
| NO-STEAL | 较慢 | 更简单 |
| STEAL | 较快 | 更复杂 |
| FORCE | 较慢 | 更简单 |
| NO-FORCE | 较快 | 更复杂 |

课件明确强调：

- 几乎所有 DBMS 采用 `STEAL + NO-FORCE`

因此主流数据库一般都必须支持：

\[
\boxed{\text{Undo + Redo}}
\]

---

## 6 No-Steal + Force

这是最容易理解的一种方案，也是理解后面所有方法的起点。

### 6.1 为什么它不需要 undo / redo

| 原因 | 结果 |
| --- | --- |
| `NO-STEAL`：未提交事务的页不能落盘 | 不需要 `undo` |
| `FORCE`：已提交事务的页在提交时必须落盘 | 不需要 `redo` |

### 6.2 优缺点

| 维度 | 表现 |
| --- | --- |
| 恢复 | 最简单 |
| commit 开销 | 很大 |
| 缓冲池压力 | 很大 |
| 整体吞吐 | 较低 |

### 6.3 课件提到的几个同步调用

| 调用 | 含义 |
| --- | --- |
| `sync()` | 把修改块放进写队列，但不等实际写盘完成 |
| `fsync()` | 等待指定文件真正写盘完成 |
| `fdatasync()` | 类似 `fsync()`，重点同步数据部分 |

---

## 7 Shadow Paging

Shadow Paging 是一种不依赖 WAL 的恢复思路。

### 7.1 核心思想

数据库维护两份逻辑视图：

| 结构 | 含义 |
| --- | --- |
| Master | 当前正式数据库，只包含已提交事务结果 |
| Shadow | 事务更新时操作的临时副本 |

事务更新只写 shadow copy。  
当事务提交时，系统原子地把 shadow 切换成新的 master。

### 7.2 提交、回滚与恢复

| 操作 | 处理方式 |
| --- | --- |
| 正常更新 | 只改 shadow copy |
| Commit | 刷新修改页和页表后，原子切换根指针 |
| Undo / Abort | 直接丢弃 shadow pages |
| Redo | 不需要 |

### 7.3 它对应的缓冲策略

| 特性 | 对应策略 |
| --- | --- |
| 不让未提交更新污染正式数据库 | `NO-STEAL` |
| 提交时切换前要保证新版本写好 | `FORCE` |

### 7.4 优点与问题

| 维度 | Shadow Paging 的特点 |
| --- | --- |
| 优点 | rollback 简单，crash recovery 简单，不需要 redo |
| 页表代价 | 复制整个 page table 很贵 |
| commit 开销 | 高，需要刷很多页 |
| 空间布局 | 容易碎片化 |
| 垃圾回收 | 需要回收旧页 |
| 并发能力 | 往往只适合一个 writer |

### 7.5 课件特别提到的优化

如果 page table 做成 **B+ 树结构**，则不必复制整棵树，只需要复制通向被修改叶节点的路径。

---

## 8 SQLite Pre-2010 的 Journal 方案

课件给出这个例子，是为了帮助理解“先保存旧值，再覆盖新值”的恢复思想。

### 8.1 基本过程

| 步骤 | 发生的事 |
| --- | --- |
| 1 | 事务要改某个页面 |
| 2 | 先把该页原始内容拷到 `journal file` |
| 3 | 再把新内容写回主数据库 |
| 4 | 系统重启时如果发现 journal 还在，就用它恢复旧页 |

### 8.2 本质

| 项目 | 说明 |
| --- | --- |
| 保存的内容 | 更新前的旧页 |
| 恢复核心 | 用 journal 中的旧值做 undo |
| 适合记忆的关键词 | before-image、journal file、undo |

---

## 9 Log-Based Recovery

现实中更常用的是 **log-based recovery**。

### 9.1 基本思想

数据库不直接依赖“副本切换”，而是维护单独的 **log file** 来记录修改历史。

| 组成 | 作用 |
| --- | --- |
| Data files | 真正存数据库页 |
| Log file | 记录事务修改历史 |

日志必须包含足够的信息，能够支持：

- undo
- redo

### 9.2 为什么日志适合恢复

| 特点 | 作用 |
| --- | --- |
| 顺序追加写 | 写入效率高 |
| 独立于数据文件 | 恢复时可单独分析 |
| 记录 old/new value | 可支持 undo 与 redo |

---

## 10 Write-Ahead Logging（WAL）

WAL 是 log-based recovery 的核心规则。

### 10.1 基本规则

\[
\boxed{\text{数据页写盘之前，相关日志必须先写盘}}
\]

也就是：

- 如果某个数据页包含了一次更新
- 那么这次更新对应的 log record 必须先进入稳定存储

### 10.2 为什么必须这样

| 如果没有 WAL 会怎样 | 后果 |
| --- | --- |
| 数据页先落盘，日志没落盘 | 崩溃后无法知道如何 undo / redo |
| 日志先落盘，再写数据页 | 即使崩溃，也还能依据日志恢复 |

### 10.3 WAL 与缓冲策略的关系

| 项目 | 关系 |
| --- | --- |
| `STEAL` | 未提交数据可能落盘，因此必须有日志支撑 undo |
| `NO-FORCE` | 已提交数据可能没落盘，因此必须有日志支撑 redo |
| WAL | 保证这两种恢复都有依据 |

---

## 11 Log Records

### 11.1 基本日志记录形式

| Log Record | 含义 |
| --- | --- |
| `<Ti start>` | 事务 `Ti` 开始 |
| `<Ti, X, V1, V2>` | `Ti` 把数据项 `X` 从 `V1` 改为 `V2` |
| `<Ti commit>` | `Ti` 提交 |
| `<Ti abort>` | `Ti` 中止 |
| `<Ti end>` | `Ti` 的提交/回滚处理彻底完成 |

### 11.2 更新日志中的字段

| 字段 | 含义 |
| --- | --- |
| `Ti` | 事务编号 |
| `X` | 数据对象或地址 |
| `V1` | old value |
| `V2` | new value |

### 11.3 为什么一条更新日志要同时记录 old/new value

| 记录内容 | 用途 |
| --- | --- |
| old value | 用于 `undo` |
| new value | 用于 `redo` |

---

## 12 WAL Example

课件用一个简单事务说明 WAL 的工作过程。

### 12.1 单事务的基本提交流程

| 步骤 | 说明 |
| --- | --- |
| 1 | 事务开始，写 `<T1, BEGIN>` |
| 2 | 每次 `write(X)` 产生一条更新日志 |
| 3 | 更新先进入 WAL buffer |
| 4 | commit 时，把相关日志强制写入 log file |
| 5 | commit log 落盘后，才能告诉应用“提交成功” |

### 12.2 关键结论

| 结论 | 原因 |
| --- | --- |
| commit 成功不等于数据页已经落盘 | 因为允许 `NO-FORCE` |
| 只要 commit log 已落盘，事务结果就安全 | 因为后续可以靠 redo 恢复 |

这也是 WAL 最核心的工程意义。

---

## 13 Group Commit

每个事务一提交就单独刷一次日志，会有很大的同步 I/O 开销，所以系统会使用 **group commit**。

### 13.1 基本思想

| 做法 | 目的 |
| --- | --- |
| 多个事务共用一次日志刷盘 | 摊薄刷盘成本 |
| 缓冲区满时统一刷盘 | 提高顺序写效率 |
| 经过一个短时间窗口再刷盘 | 聚合更多 commit |

### 13.2 效果

| 方面 | 影响 |
| --- | --- |
| 运行性能 | 更高 |
| 正确性 | 不变，仍然遵守 WAL |
| 本质 | 用更少的 flush 支撑更多事务提交 |

---

## 14 Logging Schemes

课件对日志记录方式做了分类。

### 14.1 三种 logging 方案

| Scheme | 记录什么 | 优点 | 缺点 |
| --- | --- | --- | --- |
| Physical Logging | 记录数据库某个具体位置的变化 | 恢复直接 | 灵活性差 |
| Logical Logging | 记录高层操作 | 日志更小 | 恢复更难 |
| Physiological Logging | 针对单页记录变化，但不过分依赖页内部物理布局 | 兼顾灵活和恢复 | 实现更复杂 |

### 14.2 课件强调的主流方案

| 方案 | 课件结论 |
| --- | --- |
| Physiological Logging | most popular approach |

### 14.3 三种方案的例子

针对：

```sql
UPDATE foo SET val = XYZ WHERE id = 1;
```

可对应为：

| Scheme | 典型记录形式 |
| --- | --- |
| Physical | 记录某页某 offset 从 `ABC` 改成 `XYZ` |
| Physiological | 记录某页某 slot 的 tuple 从 `ABC` 改成 `XYZ` |
| Logical | 直接记录这条 `UPDATE` 操作 |

---

## 15 Checkpoints

### 15.1 为什么需要 checkpoint

如果只有 WAL 而没有 checkpoint，会出现两个问题：

| 问题 | 后果 |
| --- | --- |
| 日志会越来越大 | 占空间 |
| crash 后可能要重放整个日志 | 恢复时间很长 |

所以系统会周期性做 **checkpoint**。

### 15.2 基本 checkpoint 做什么

| 步骤 | 内容 |
| --- | --- |
| 1 | 输出所有 log records 到稳定存储 |
| 2 | 输出所有修改过的数据块到磁盘 |
| 3 | 写入 `<CHECKPOINT>` 并刷盘 |

### 15.3 checkpoint 在恢复中的作用

| 事务相对 checkpoint 的位置 | 处理 |
| --- | --- |
| checkpoint 前已提交 | 可忽略 |
| checkpoint 后提交 | 可能需要 redo |
| crash 时还未提交 | 需要 undo |

### 15.4 checkpoint 的挑战

| 挑战 | 原因 |
| --- | --- |
| 需要暂停事务 | 为了拿一致快照 |
| 扫描日志找未提交事务也可能慢 | 日志仍然可能很长 |
| checkpoint 太频繁 | 运行时开销大 |
| checkpoint 间隔太长 | 恢复时间太长 |

---

## 16 Runtime Performance vs Recovery Performance

课件实际上给了一个很重要的总表：缓冲策略是在运行性能和恢复复杂度之间做取舍。

| Policy | Runtime Performance | Recovery Performance |
| --- | --- | --- |
| NO-STEAL + FORCE 倾向 | 较慢 | 较快 |
| STEAL + NO-FORCE 倾向 | 较快 | 较慢 |

所以数据库系统真正的设计思想是：

\[
\text{运行时尽量快，恢复时接受更复杂的 undo/redo 机制}
\]

这也是为什么主流系统最终选择：

- `STEAL`
- `NO-FORCE`
- `WAL`
- `checkpoint`

---

## 17 Lecture 12 总结

这一讲建议按下面六条主线记忆：

### 1. 为什么需要 recovery

- buffer pool 让“内存状态”和“磁盘状态”可能暂时不同步

### 2. 故障类型

- transaction failure
- system error
- system crash
- disk failure

### 3. undo / redo 的分工

- undo 撤销未提交事务
- redo 重做已提交事务

### 4. 缓冲策略决定恢复需求

- `STEAL` 决定是否要 undo
- `NO-FORCE` 决定是否要 redo

### 5. 两类基本恢复思路

- shadow paging
- log-based recovery

### 6. WAL 与 checkpoint 是重点

- WAL 保证“先有日志，后写数据页”
- checkpoint 缩短恢复时间

一句话总结：

\[
\boxed{\text{Recovery 的核心就是：通过 undo / redo 与日志机制，让数据库在故障后仍然满足原子性和持久性}}
\]
