# Lecture 10 Transactions

## Final Review 重点

- <span class="key-point">ACID 必须会完整写出并解释。</span>
- <span class="key-point">precedence graph 无环 <=> conflict serializable。</span>
- <span class="key-point">要会区分 dirty read、non-repeatable read、phantom read。</span>
- <span class="key-point">隔离级别顺序：Read Uncommitted → Read Committed → Repeatable Read → Serializable。</span>

## 1 Transaction Concept

- **事务（transaction）**：程序执行的一个基本单位（unit of program execution），它会访问并可能更新多个数据项（data items）。
- 一个经典例子是转账事务：
  - `read(A)`
  - `A := A - 50`
  - `write(A)`
  - `read(B)`
  - `B := B + 50`
  - `write(B)`

事务这一讲真正要解决的，不是“SQL 怎么写”，而是：

1. 如果系统中途失败（failure），如何保证数据库不坏？
2. 如果多个事务并发执行（concurrent execution），如何保证结果仍然正确？

---

## 2 为什么需要事务

如果转账事务执行到一半崩溃，比如：

- 已经把 `A` 减了 50
- 但还没把 `B` 加 50

那么钱就“丢了”，数据库进入不一致状态（inconsistent state）。

这说明数据库不能只关心“每条语句是否成功”，而必须保证：

\[
\text{要么整个事务都生效，要么整个事务都不生效}
\]

---

## 3 ACID 四大性质

事务最核心的抽象就是 **ACID properties**。

### 3.1 Atomicity（原子性）

- 事务中的所有操作要么全部生效，要么全部不生效。
- 不允许只执行一半的更新被永久写入数据库。

直觉：

\[
\text{all or nothing}
\]

---

### 3.2 Consistency（一致性）

- 如果事务开始时数据库是一致的
- 并且事务逻辑本身正确
- 那么事务单独执行结束后，数据库仍应一致

一致性包括：

- **显式完整性约束（explicit integrity constraints）**
  - 主键
  - 外键
  - `CHECK`
- **隐式业务约束（implicit integrity constraints）**
  - 比如账户总额不变
  - 比如库存不能为负

注意：

- 事务执行过程中，数据库可以**暂时不一致**
- 但事务成功完成后，必须回到一致状态

---

### 3.3 Isolation（隔离性）

- 并发事务之间应互相“看不见中间状态”
- 每个事务都应该感觉自己像是在独占系统执行

直觉：

\[
\text{Each transaction should be unaware of concurrent transactions}
\]

如果没有隔离性，一个事务可能看到另一个事务尚未完成的中间更新，从而读到错误结果。

---

### 3.4 Durability（持久性）

- 事务一旦成功提交（commit）
- 它对数据库的修改就必须永久保留
- 即使之后发生软件或硬件故障，也不能丢失

直觉：

\[
\text{committed changes must persist}
\]

---

## 4 ACID 的统一理解

可以把 ACID 记成下面这四句话：

- Atomicity：全成或全败
- Consistency：事务前后一致
- Isolation：并发下像串行
- Durability：提交后不丢

这四点几乎是所有事务机制和并发控制机制的出发点。

---

## 5 Transaction State（事务状态）

PPT 里给出的事务状态图，本质是在描述一个事务从开始到结束的生命周期。

通常可理解为：

- **Active**
  - 事务正在执行
- **Partially Committed**
  - 最后一条语句已执行完，但还未真正完成持久化
- **Committed**
  - 事务成功完成
- **Failed**
  - 正常执行无法继续
- **Aborted**
  - 已回滚（rollback）

可以简单理解为：

\[
\text{执行中} \rightarrow \text{提交成功}
\]

或者：

\[
\text{执行中} \rightarrow \text{失败} \rightarrow \text{回滚}
\]

---

## 6 为什么需要并发执行（Concurrent Executions）

数据库通常不会一条事务跑完再跑下一条，而会并发执行多个事务。

这样做的好处：

- 提高 CPU 利用率
- 提高磁盘利用率
- 提高吞吐量（throughput）
- 降低平均响应时间（response time）

如果所有事务都严格串行执行，虽然容易保证正确性，但性能会很差。

所以数据库需要的是：

\[
\text{既要并发，也要正确}
\]

---

## 7 Schedule（调度）

- **调度（schedule）**：多个事务操作按时间先后交织在一起的执行序列

一个合法调度必须满足：

1. 包含各事务的全部指令
2. 保持每个事务内部原有顺序不变

事务最后通常以：

- `commit`
- 或 `abort`

结束。

---

## 8 Serial Schedule 与 Concurrent Schedule

### 8.1 Serial Schedule（串行调度）

- 一个事务完整执行完
- 再执行下一个事务

特点：

- 最容易保证正确性
- 但并发度最低

### 8.2 Concurrent Schedule（并发调度）

- 不同事务的指令交错执行

特点：

- 并发度高
- 但可能破坏一致性

所以问题变成：

\[
\text{并发调度如何“等价”于某个串行调度？}
\]

这就引出了 **serializability（可串行化）**。

---

## 9 Serializability（可串行化）

### 9.1 基本思想

如果每个事务单独执行都能保持数据库一致，那么：

- 任意一个**串行调度**
- 都能保持数据库一致

因此，只要一个并发调度在效果上等价于某个串行调度，我们就认为它是安全的。

这就是：

\[
\text{A schedule is serializable if it is equivalent to a serial schedule}
\]

---

### 9.2 两种主要可串行化概念

- **Conflict Serializability（冲突可串行化）**
- **View Serializability（视图可串行化）**

数据库系统里最常用、最可实现的是 **conflict serializability**。

---

## 10 Conflicting Instructions（冲突指令）

两个操作冲突（conflict），必须同时满足：

1. 来自不同事务
2. 访问同一数据项 \(Q\)
3. 至少有一个是 `write(Q)`

所以：

- `read(Q)` 与 `read(Q)`：**不冲突**
- `read(Q)` 与 `write(Q)`：**冲突**
- `write(Q)` 与 `read(Q)`：**冲突**
- `write(Q)` 与 `write(Q)`：**冲突**

为什么要看冲突？

因为：

- 不冲突的操作交换顺序不会影响结果
- 冲突操作交换顺序可能改变结果

---

## 11 Conflict Serializability

### 11.1 Conflict Equivalent（冲突等价）

如果一个调度可以通过不断交换**不冲突**的操作，变成另一个调度，
那么这两个调度是 **conflict equivalent**。

### 11.2 Conflict Serializable（冲突可串行化）

如果一个并发调度 conflict equivalent 于某个串行调度，
那么它是 **conflict serializable**。

这是数据库中最核心、最常用的可串行化判定标准。

---

## 12 View Serializability

### 12.1 View Equivalent（视图等价）

两个调度 view equivalent，需要满足：

1. 对每个数据项 \(Q\)，某事务若读到初始值，在两个调度中都读到初始值
2. 某事务若读到另一个事务对 \(Q\) 的写结果，那么在两个调度中读到的是同一个写
3. 对每个数据项 \(Q\)，最终写入 \(Q\) 的事务相同

### 12.2 View Serializable（视图可串行化）

若一个调度 view equivalent 于某个串行调度，则称它 view serializable。

关系：

\[
\text{Every conflict serializable schedule is also view serializable}
\]

但反过来不成立。

View serializability 更宽松，但判定更难。

---

## 13 其他可串行化概念

PPT 提醒：

- 还有更广义的 serializability 概念
- 但那需要分析 `read/write` 以外的复杂操作

在数据库实现中，最实用的仍然是：

\[
\text{conflict serializability}
\]

---

## 14 可串行化测试（Test for Serializability）

### 14.1 优先图 / 前驱图（Precedence Graph）

对一个调度构建图：

- 节点：事务
- 边：若 \(T_i\) 的某个操作与 \(T_j\) 的某个操作冲突，且 \(T_i\) 的操作先于 \(T_j\)，则加边

### 14.2 判定规则

一个调度是 conflict serializable，当且仅当它的 precedence graph **无环（acyclic）**。

即：

\[
\boxed{\text{Conflict serializable} \iff \text{precedence graph is acyclic}}
\]

### 14.3 View serializable 的难点

PPT 指出：

- 判定 view serializable 是 **NP-complete**

这也是为什么工程实现普遍不直接用它。

---

## 15 Recoverable Schedules（可恢复调度）

如果：

- \(T_j\) 读了 \(T_i\) 写的数据

那么必须保证：

- \(T_i\) 先提交（commit）
- \(T_j\) 才能提交

否则如果：

- \(T_j\) 已经提交
- \(T_i\) 后来回滚

那数据库就没法恢复。

所以数据库至少要保证调度是 **recoverable**。

---

## 16 Cascadeless Schedules（无级联回滚调度）

如果一个事务读到了另一个**未提交事务**写的数据，那么一旦前者回滚，就可能引发一连串回滚：

\[
\text{cascading rollback}
\]

为了避免这种情况，希望调度满足：

- 事务只读已提交数据

这样的调度叫 **cascadeless schedule**。

关系：

\[
\text{Every cascadeless schedule is recoverable}
\]

所以：

- cascadeless 比 recoverable 更强

---

## 17 并发控制（Concurrency Control）

数据库并发控制机制的目标是保证：

- 调度可串行化（serializable）
- 可恢复（recoverable）
- 最好还能无级联回滚（cascadeless）

如果简单地只允许一个事务执行，则确实能得到 serial schedule，
但并发性能极差。

因此数据库需要设计并发控制协议（concurrency control protocols）。

---

## 18 弱一致性（Weak Levels of Consistency）

并不是所有应用都要求完全可串行化。

例如：

- 一个只读事务，只想近似统计总余额
- 优化器收集数据库统计信息时，只要求大致正确

这类场景可以：

- 用更弱的隔离级别
- 用准确性换性能

这就是后面 SQL 隔离级别存在的原因。

---

## 19 SQL-92 Isolation Levels

PPT 给出经典隔离级别：

- Serializable
- Repeatable Read
- Read Committed
- Read Uncommitted
- Snapshot Isolation（虽然不属于 SQL-92 原始四级之一，但现代系统很常见）

这些级别本质上是在平衡：

\[
\text{一致性} \leftrightarrow \text{性能 / 并发性}
\]

---

## 20 几类典型异常（Anomalies）

### 20.1 Dirty Read（脏读）

- 事务读到了另一个**未提交事务**写的数据
- 如果对方回滚，读到的值就是无效的

这是最低级别隔离下会出现的问题。

---

### 20.2 Non-repeatable Read（不可重复读）

- 同一事务中
- 同一行读两次
- 两次结果不同

原因：

- 中间有其他事务提交了更新

---

### 20.3 Phantom Read（幻读）

- 同一事务中
- 用同一谓词查询两次
- 第二次多了或少了新行

关键不是“同一行值变了”，而是：

- 满足条件的**行集合**变了

---

### 20.4 Write Skew（写偏斜）

- 两个事务读取重叠数据集
- 基于同一个约束判断都认为可以更新
- 但分别更新不同的行
- 最终一起提交，破坏整体约束

这是 Snapshot Isolation 下非常经典的异常。

---

## 21 隔离级别与异常的关系

可以大致记成：

- **Read Uncommitted**
  - 最弱
  - 脏读、不可重复读、幻读等都可能发生

- **Read Committed**
  - 不允许读未提交数据
  - 但同一行重复读可能变
  - 幻读仍可能发生

- **Repeatable Read**
  - 同一行重复读应保持一致
  - 但不同实现对幻读和写偏斜的处理不同

- **Serializable**
  - 最强
  - 应避免所有这些异常

- **Snapshot Isolation**
  - 避免脏读、不可重复读、很多丢失更新
  - 但不保证真正 serializable
  - 典型问题是 write skew

---

## 22 SQL 中事务的定义

在 SQL 里，事务通常是**隐式开始**的。

事务结束方式：

- `COMMIT WORK`
- `ROLLBACK WORK`

默认很多系统是自动提交（auto-commit）的。

例如：

- JDBC 可通过

```java
connection.setAutoCommit(false);
```

关闭自动提交。

隔离级别也可以在不同层级设置：

- database level
- session level
- transaction level

例如：

```sql
set transaction isolation level serializable;
```

---

## 23 实现思路概览

PPT 最后给了事务/并发控制的几种实现方向：

- Locking（加锁）
- Timestamps（时间戳）
- Multiple Versions（多版本）

这一讲先把事务语义和隔离级别打基础；下一讲会进入更具体的并发控制协议。

---

## 24 Lecture 10 总结

这一讲的主线可以概括为：

1. 事务是数据库中保证正确性的基本执行单位
2. ACID 是事务的四大核心性质
3. 并发执行虽然提高性能，但会引入一致性问题
4. 可串行化（serializability）是衡量并发调度是否正确的核心标准
5. 数据库至少要保证 recoverable，最好还能 cascadeless
6. 弱隔离级别用性能换一致性，但会带来各种异常
7. 不同并发控制机制，本质上都是在实现这些事务语义

一句话总结：

\[
\boxed{\text{事务 = 正确性抽象；并发控制 = 让事务在并发下仍然正确}}
\]
