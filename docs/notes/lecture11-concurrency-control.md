# Lecture 11 Concurrency Control

## 1 Overview

这一讲真正讨论的是：数据库如何在**多事务并发执行**时，仍然让每个事务“看起来像独占系统运行”。

目标是让并发调度满足：

- serializable
- recoverable
- preferably cascadeless

如果只允许一个事务一次执行一个，就能得到 serial schedule，
但并发度太低，性能很差。

因此这一讲的重点是各种 **concurrency control protocols**。

---

## 2 两大类并发控制方案

PPT 开头先给出两大方向：

### 2.1 Lock-based（基于锁）

- 假设事务会冲突
- 先加锁，再访问数据
- 典型代表：
  - 2PL（Two-Phase Locking）

### 2.2 Timestamp Ordering（基于时间戳）

- 不显式加锁
- 用时间戳规定事务的串行顺序
- 典型代表：
  - Basic TSO

后面还进一步发展到：

- OCC（Optimistic Concurrency Control）
- MVCC（Multi-Version Concurrency Control）
- Snapshot Isolation

---

## 3 Lock-Based Protocols

### 3.1 什么是锁

- **锁（lock）** 是控制并发访问数据项的机制

数据项可加两种模式的锁：

### 3.2 Exclusive Lock（X lock）

- 独占锁
- 允许读，也允许写
- 获取方式：
  - `lock-X`

### 3.3 Shared Lock（S lock）

- 共享锁
- 只允许读
- 获取方式：
  - `lock-S`

锁请求由 **concurrency-control manager** 处理。

事务只有在锁被授予后，才能继续执行。

---

## 4 Lock Compatibility（锁兼容性）

最基础的兼容逻辑是：

- `S` 和 `S`：兼容
- `S` 和 `X`：不兼容
- `X` 和 `S`：不兼容
- `X` 和 `X`：不兼容

直觉：

- 多个读可以同时发生
- 写必须独占

---

## 5 Deadlock（死锁）

### 5.1 什么是死锁

如果：

- \(T_3\) 等 \(T_4\) 释放某把锁
- \(T_4\) 又在等 \(T_3\) 释放另一把锁

那么双方都无法继续，这就是 **deadlock**。

死锁出现时，必须至少回滚其中一个事务。

---

### 5.2 什么是饥饿（Starvation）

- 某个事务长时间拿不到资源
- 一直被其他事务抢先

这不是死锁，但同样会造成系统不公平。

---

## 6 Two-Phase Locking（2PL）

2PL 是数据库里最经典的锁协议。

### 6.1 两个阶段

#### Growing Phase（增长阶段）

- 可以获得锁
- 不可以释放锁

#### Shrinking Phase（收缩阶段）

- 可以释放锁
- 不可以再获得新锁

### 6.2 它保证什么

2PL 足以保证：

\[
\text{conflict serializability}
\]

### 6.3 锁点（Lock Point）

一个事务获取到最后一把锁的位置，称为 **lock point**。

2PL 下，事务可以按 lock point 顺序串行化。

---

## 7 2PL 的问题

基本 2PL 虽然保证冲突可串行化，但仍然有两个大问题：

### 7.1 Cascading Aborts

一个事务可能读到另一个未提交事务写的数据。  
若前者回滚，后者也要跟着回滚。

### 7.2 Deadlocks

2PL 本身不能避免死锁。

所以基本 2PL 不够，需要更强扩展。

---

## 8 Extensions to 2PL

### 8.1 Strict 2PL

- 一个事务必须一直持有所有 **X locks**
- 直到 commit / abort

作用：

- 保证 recoverability
- 避免 cascading rollbacks

### 8.2 Rigorous / Strong Strict 2PL

- 一个事务必须一直持有**所有锁**
- 直到 commit / abort

作用：

- 比 strict 2PL 更强
- 事务可按 commit 顺序串行化

PPT 还特别提醒：

- 很多数据库实际上实现的是 **rigorous 2PL**
- 但口头上仍把它简称为 “2PL”

---

## 9 Lock Conversions（锁升级/降级）

2PL 还可以支持锁转换：

### 9.1 Growing Phase 中

- 可获取 `S`
- 可获取 `X`
- 可把 `S → X`
  - 叫 **upgrade**

### 9.2 Shrinking Phase 中

- 可释放 `S`
- 可释放 `X`
- 可把 `X → S`
  - 叫 **downgrade**

这类带锁转换的 2PL 仍可保证 serializability。

---

## 10 自动加锁（Automatic Acquisition of Locks）

实际 DBMS 中，用户通常不会手写：

- `lock-S`
- `lock-X`

而是直接发：

- `read(D)`
- `write(D)`

数据库内部自动完成：

- 读之前检查/申请 `S-lock`
- 写之前检查/申请 `X-lock`
- 若已有 `S-lock` 且要写，则尝试升级为 `X-lock`

并且：

- 所有锁一般在 commit / abort 时统一释放

---

## 11 Lock Table 与 Lock Manager

数据库通常在内存里维护：

- **lock table**

它记录：

- 已授予的锁（granted locks）
- 正在等待的锁请求（pending requests）

而 **Lock Manager（LM）** 负责：

- 接收加锁/解锁请求
- 判定兼容性
- 授予或阻塞请求
- 必要时通知事务回滚

---

## 12 Graph-Based Protocols

PPT 还提到一种替代 2PL 的思路：

- **Graph-based protocols**

例如：

- tree protocol

特点：

- 通过对数据集施加偏序（partial ordering）来控制访问
- 能保证 conflict serializability
- 无死锁

但缺点是：

- 不保证 recoverability
- 不保证 cascadeless
- 还可能要求事务锁住自己实际上不会访问的数据项

所以工程上不如锁协议常见。

---

## 13 Dealing with Deadlocks

数据库处理死锁有两大方向：

### 13.1 Deadlock Detection（死锁检测）

构建 **waits-for graph**：

- 节点：事务
- 边：\(T_i\) 正在等待 \(T_j\) 释放锁

系统周期性检查图中是否有环（cycle）。

若有环，就说明死锁发生。

### 13.2 Deadlock Prevention（死锁预防）

当一个事务请求被阻塞时，不等它真正陷入环，而是主动 kill 其中一个事务。

---

## 14 死锁检测（Deadlock Detection）

wait-for graph 的核心判据：

\[
\text{cycle} \Rightarrow \text{deadlock}
\]

优点：

- 不会过早回滚事务

缺点：

- 要周期性检测
- 要维护等待图

---

## 15 死锁预防（Deadlock Prevention）

PPT 给了两个经典方案：

### 15.1 wait-die

- 老事务可以等年轻事务
- 年轻事务不能等老事务，只能回滚

特点：

- 年轻事务可能多次“死掉”

### 15.2 wound-wait

- 老事务不等年轻事务，而是让年轻事务回滚
- 年轻事务可以等老事务

特点：

- 通常比 wait-die 回滚更少

这两种方案都会让回滚事务保留原时间戳再重启。

---

## 16 Timeout-Based Schemes

另一种更粗暴的方法是：

- 事务等待锁只允许等待固定时间
- 超时就回滚

优点：

- 简单

缺点：

- 即使没有真正死锁，也可能误回滚
- timeout 值不好选
- 仍可能饥饿

---

## 17 Deadlock Recovery

死锁发生后，必须选出一个 **victim** 回滚。

### 17.1 受害者选择原则

- 选择回滚代价最小的事务

### 17.2 回滚粒度

- **Total rollback**
  - 整个事务回滚
- **Partial rollback**
  - 借助 savepoint，只回滚到必要位置

### 17.3 Starvation 问题

如果总挑同一个事务当 victim，它可能一直重启失败。

一个常见缓解思路是：

- 死锁集合里最老的事务不当 victim

---

## 18 Multiple Granularity Locking

### 18.1 为什么要多粒度

锁可以加在不同层级：

- database
- area
- file
- record

这就是 **granularity of locking**。

### 18.2 粒度的 tradeoff

- **Fine granularity**
  - 并发高
  - 锁管理开销高

- **Coarse granularity**
  - 开销低
  - 并发差

所以需要支持多层次锁。

---

## 19 Intention Locks

为了让多粒度锁层级正确工作，需要意向锁（intention locks）：

### 19.1 IS（Intention Shared）

- 表示更低层打算加 `S-lock`

### 19.2 IX（Intention Exclusive）

- 表示更低层打算加 `X-lock` 或更强锁

### 19.3 SIX（Shared + Intention Exclusive）

- 当前节点显式加 `S-lock`
- 同时更低层还会加 `X-lock`

这套机制让“表级锁 + 行级锁”能正确共存。

---

## 20 Insert / Delete 的加锁规则

- 删除前必须对目标项拿 `X-lock`
- 插入的新 tuple 会自动得到 `X-lock`
- 新插入 tuple 在事务提交前对其他事务不可见

目的：

- 让读/写与删除冲突能被正确捕获
- 确保插入的数据不会过早暴露

---

## 21 Predicate Reads 与 Phantom

单纯对“已有行”加锁，不足以解决 **phantom read**。

因为问题不是某一行被改了，而是：

- 满足某个谓词的“行集合”变了

例如：

- 查询 `age BETWEEN 10 AND 30`
- 另一个事务插入一条 `age = 27`

这条新行之前根本不存在，所以你锁住旧行也没用。

---

## 22 Predicate Locking

为了解决幻读，可以锁定一个**逻辑谓词（predicate）**，而不是具体记录。

例如：

- 锁住所有 `status = 'lit'` 的记录集合

好处：

- 理论上能保证这类逻辑读取的串行化

缺点：

- 开销很大
- 实现复杂

所以工程上通常会用更高效的特化方案。

---

## 23 Index Locking

PPT 把 **index locking** 视为 predicate locking 的高效特例。

核心规则：

- 关系至少有一个索引
- 查找事务必须锁住访问到的索引叶子页（leaf nodes）
- 插入/更新/删除事务必须对受影响的叶子页加 `X-lock`
- 同时仍要遵守 2PL

这样能更精细地捕获“范围读取”与“插入新键值”之间的冲突。

---

## 24 Next-Key Locking

为了进一步处理范围查询和插入的并发，PPT 提到 **next-key locking**。

核心思想：

- 不仅锁住满足谓词的键值
- 还锁住“下一个键值”

这样可以更准确地保护一个范围，避免 phantom。

相比单纯 index locking：

- 并发性更高
- 但实现也更复杂

---

## 25 Index Structures 的并发问题

索引的职责是帮助访问数据，因此：

- 被访问得极其频繁

如果对索引节点严格使用事务级 2PL，会导致：

- 并发度太低

PPT 的关键观点：

- 对索引的内部节点访问，不一定需要完全事务级的 serializable 行为
- 只要最终能到达正确叶子页、索引结构不损坏即可

这引出：

- **locks**
- **latches**

的区别。

---

## 26 Locks vs. Latches

### 26.1 Locks

- 保护事务层面的**逻辑内容**
- 持有时间通常是整个事务期间
- 需要支持 rollback

### 26.2 Latches

- 保护数据结构内部的**临界区（critical section）**
- 持有时间通常只是一次操作期间
- 不需要支持回滚

直觉：

- lock 解决“事务之间的逻辑冲突”
- latch 解决“线程同时改内存结构会把结构弄坏”

---

## 27 Crabbing / Latch Coupling

这是 B+ 树并发访问的经典协议。

### 核心思想

- 从根向下走
- 先拿住子节点 latch
- 再释放父节点 latch

只有当确认子节点“安全（safe）”时，才释放祖先 latch。

---

### 什么叫 safe

对更新操作而言：

- **插入时**：节点未满，不会 split
- **删除时**：节点超过半满，不会 merge / coalesce

如果 child safe，则上层结构不会因本次更新改变，所以可提前释放祖先 latch。

---

## 28 基本 Latch Crabbing

### Search

- 从 root 往下
- 对 child 拿 `R-latch`
- 然后释放 parent latch

### Insert / Delete

- 从 root 往下
- 根据需要拿 `W-latch`
- 若 child safe，就释放祖先 latch

这种方式减少了长时间持有整条路径锁的开销。

---

## 29 Better Latch Crabbing（Optimistic）

基本 latch crabbing 对更新时总要在 root 拿 `W-latch`，并发度太低。

更好的方法：

- 乐观地假设目标 leaf 是 safe
- 先沿路只拿 `R-latch`
- 到叶子后再验证
- 若不安全，再回退并按保守算法重来

这也叫：

- **optimistic lock coupling**

---

## 30 Timestamp-Based Protocols

现在转向另一大类并发控制思想：**不加锁，而是按时间戳排序事务**。

### 30.1 基本设定

每个事务 \(T_i\) 在开始时被赋予唯一时间戳：

\[
TS(T_i)
\]

并满足：

- 新事务时间戳严格大于旧事务

时间戳可以来自：

- 逻辑计数器
- 或（wall-clock time, logical counter）组合

核心原则：

\[
\text{timestamp order} = \text{serializability order}
\]

---

## 31 Basic Timestamp Ordering（Basic TSO）

对每个数据项 \(Q\)，维护：

- \(W\text{-timestamp}(Q)\)
  - 最近一次成功写 \(Q\) 的事务时间戳
- \(R\text{-timestamp}(Q)\)
  - 最近一次成功读 \(Q\) 的事务时间戳

---

### 31.1 读规则

若事务 \(T_i\) 发出 `read(Q)`：

- 如果

\[
TS(T_i) < W\text{-timestamp}(Q)
\]

则说明一个更“新”的事务已经写过 \(Q\)，
按时间戳顺序，\(T_i\) 不该再读这个未来值，因此拒绝该读并回滚事务。

- 否则允许读，并更新：

\[
R\text{-timestamp}(Q)=\max(R\text{-timestamp}(Q), TS(T_i))
\]

---

### 31.2 写规则

若事务 \(T_i\) 发出 `write(Q)`：

- 若

\[
TS(T_i) < R\text{-timestamp}(Q)
\]

说明某个更晚事务已经读过 \(Q\)，不能让更老事务再去覆盖它

- 或若

\[
TS(T_i) < W\text{-timestamp}(Q)
\]

说明某个更晚事务已经写过 \(Q\)

这两种情况都要拒绝写并回滚 \(T_i\)。

否则允许写，并更新：

\[
W\text{-timestamp}(Q)=TS(T_i)
\]

---

## 32 TSO 的性质

### 优点

- 保证 serializability
- 不会死锁（deadlock-free）

### 缺点

- 不是 cascadeless
- 不是 recoverable
- 长事务容易被饿死（starvation）
- 时间戳维护和工作空间复制有额外开销

---

## 33 Thomas’ Write Rule

Basic TSO 中，有些写会被直接判错并导致事务回滚。  
Thomas' Write Rule 对其中一种情况做了优化。

若：

\[
TS(T_i) < W\text{-timestamp}(X)
\]

则说明这个写已经“过时”了。

Basic TSO 会 abort \(T_i\)，  
Thomas 写规则则允许：

- **忽略这个过时写**
- 事务继续执行

这样能减少不必要回滚。

---

## 34 Optimistic Concurrency Control（OCC）

OCC 假设：

\[
\text{大多数事务其实不会冲突}
\]

所以不在执行期间反复加锁，而是：

- 每个事务先在私有工作区（private workspace）里运行
- 提交时再检查是否冲突

因此又叫：

- **Validation-Based Protocol**

---

## 35 OCC 三阶段

### 35.1 Read Phase

- 跟踪 read set / write set
- 写入 private workspace

### 35.2 Validation Phase

- 提交时检查是否与其他事务冲突

### 35.3 Write Phase

- 验证成功：把私有修改写回全局数据库
- 验证失败：事务回滚并重启

---

## 36 OCC 的验证测试

每个事务 \(T_i\) 有三个时间：

- \(StartTS(T_i)\)
- \(ValidationTS(T_i)\)
- \(FinishTS(T_i)\)

其串行化顺序按：

\[
TS(T_i)=ValidationTS(T_i)
\]

来决定。

对事务 \(T_j\) 的验证，大意是：

- 对所有比它验证更早的事务 \(T_i\)
- 若 \(T_i\) 在 \(T_j\) 开始前就完成，则无冲突
- 若有重叠执行，则要求：

\[
WriteSet(T_i) \cap ReadSet(T_j) = \varnothing
\]

否则验证失败。

直觉：

- 别人在你执行期间改了你读过的数据
- 你基于旧值做出的决策就不安全

---

## 37 为什么不用 StartTS 决定串行化顺序

PPT 专门问了这个问题。

原因是：

- OCC 的关键判断发生在验证阶段
- 真正决定“谁先被接受”为串行顺序的是验证时刻

所以用：

\[
ValidationTS
\]

比用 `StartTS` 更自然。

---

## 38 Multi-Version Concurrency Control（MVCC）

MVCC 的核心思想：

- 不覆盖旧版本
- 写成功时创建新版本
- 读根据时间戳读合适版本

这样做的最大收益是：

\[
\text{reads never have to wait}
\]

即读通常不阻塞写，写也尽量不阻塞读。

---

## 39 Multi-Version Timestamp Ordering

每个数据项 \(Q\) 有多个版本：

\[
\langle Q_1, Q_2, \dots, Q_m \rangle
\]

每个版本包含：

- value
- \(W\text{-timestamp}\)
- \(R\text{-timestamp}\)

读操作选择：

- 满足

\[
W\text{-timestamp}(Q_k) \le TS(T_i)
\]

的最新版本

这样事务总能读到“属于自己时间点”的正确快照。

PPT 强调：

- **Reads always succeed**
- 并且仍然可保证 serializability

---

## 40 Multi-Version Two-Phase Locking

这里把：

- 多版本
- 严格 2PL

结合起来。

### Update 事务

- 用 SS2PL
- 第一次写 \(Q\) 时创建新版本 \(Q_i\)
- 提交时统一分配真实时间戳

### Read-only 事务

- 开始时拿一个时间戳
- 不获取锁
- 直接按 MV timestamp-ordering 规则读取历史版本

收益：

- 读写分离更彻底
- 只读事务非常轻量

---

## 41 MVCC 的实现问题

MVCC 的收益很大，但代价也明显：

- 需要存储多个版本
- 每条记录要带版本元信息
- 需要垃圾回收（garbage collection）
- 主键/外键约束检查更复杂
- 多版本记录的索引也更复杂

所以：

\[
\text{MVCC 用空间和实现复杂度换并发性能}
\]

---

## 42 Snapshot Isolation（SI）

Snapshot Isolation 是 MVCC 家族里最常见的隔离级别之一。

核心规则：

1. 事务开始时拿到一个**已提交数据的快照**
2. 读只读自己的快照
3. 自己的更新对自己可见，但对并发事务不可见
4. 提交时采用 **first-committer-wins**

即：

- 若已有并发事务先提交并修改了相关数据
- 当前事务提交失败

---

## 43 SI 的好处

- 读从不阻塞
- 读也不阻塞其他事务
- 性能通常接近 Read Committed
- 避免：
  - dirty read
  - lost update
  - non-repeatable read

---

## 44 SI 的问题

Snapshot Isolation **不保证真正 serializable**。

最经典问题就是：

- **write skew**

这会导致：

- 某些完整性约束被破坏

因此：

\[
\text{SI is stronger than many weak levels, but weaker than true serializable}
\]

---

## 45 SI Anomalies

PPT 给出两个很值得注意的例子：

### 45.1 Write Skew

两个事务看到相同旧快照，都认为约束还满足，于是分别更新不同记录，最终破坏整体约束。

### 45.2 Read-only inconsistency

只读事务可能看到一个“并不对应任何真实串行时刻”的数据库状态。

此外：

- 主键/外键验证也可能在 SI 下出现一致性问题

---

## 46 SI 在真实数据库中的实现

很多数据库支持 Snapshot Isolation：

- Oracle
- PostgreSQL
- SQL Server
- IBM DB2

PPT 特别提醒：

- Oracle 用的是 **first updater wins**
- 某些数据库即使你设成 `serializable`，底层也可能仍然是 SI 风格

所以：

- 名字叫 serializable
- 不一定真的是理论上的 serializable

必须看具体实现。

---

## 47 Work Around SI Anomalies

对于某些场景，可以手工加：

```sql
select ... for update
```

来把本来只读的检查操作变成带锁读取，从而避免某些 write skew 问题。

例如：

- 先 `select max(orderno) for update`
- 再插入 `max + 1`

这在很多应用里能增强正确性，但：

- 仍不能彻底解决所有 phantom / predicate read 问题

---

## 48 Lecture 11 总结

这一讲可以按四条主线记忆：

### 主线 1：锁协议

- S/X locks
- 2PL
- strict 2PL
- rigorous 2PL

### 主线 2：死锁处理

- detection
- prevention
- timeout
- recovery

### 主线 3：更复杂的锁对象

- multiple granularity
- intention locks
- predicate locking
- index locking
- next-key locking
- latch crabbing

### 主线 4：无锁或弱锁替代方案

- timestamp ordering
- OCC
- MVCC
- Snapshot Isolation

一句话总括：

\[
\boxed{\text{并发控制的本质，是在“正确性、等待、回滚、并发度、实现成本”之间做取舍}}
\]
