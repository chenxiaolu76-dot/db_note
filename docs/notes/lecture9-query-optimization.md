# Lecture 9 Query Optimization

## 1 Overview

- **查询优化（Query Optimization）**：对于同一条 SQL，数据库通常有很多种逻辑等价但执行代价不同的求值方式（alternative ways of evaluating a query）。
- **等价表达式（Equivalent expressions）**：同一个查询可以改写成多个关系代数表达式，它们逻辑结果相同，但中间结果大小、访问方式、连接顺序可能完全不同。
- **执行计划（Evaluation plan）**：一个执行计划精确规定了：
  - 每个操作具体使用什么算法（algorithm）
  - 各个操作之间如何协调执行（coordination）

查询优化器（optimizer）的目标不是“随便找到一个能执行的计划”，而是：

\[
\text{Find a correct plan with the lowest estimated cost}
\]

也就是说，优化器要在所有可行计划中，尽量找到一个**估计代价最小**的执行方案。

---

### 查询优化为什么重要

不同执行计划的代价差异可能非常夸张：

- 有时只差几秒
- 有时可能差到几小时甚至几天

因此，查询优化往往比“某个单独算子写得快不快”更重要。

---

### 成本优化（Cost-based Query Optimization）的基本步骤

1. 用**等价规则（equivalence rules）**生成逻辑等价表达式
2. 为这些表达式补上具体物理算法，形成候选执行计划
3. 基于统计信息（statistics）和代价公式（cost formulae）估计成本
4. 选出代价最低的计划

---

### explain / explain analyze

大多数数据库都支持：

- `EXPLAIN <query>`
  - 展示优化器选择的执行计划
  - 通常附带估计成本

- `EXPLAIN ANALYZE <query>`
  - 真正执行查询
  - 展示实际运行统计信息（actual runtime statistics）
  - 便于比较“估计值”和“真实值”

## 2 逻辑等价变换（Generating Equivalent Expressions）

优化器的第一步通常不是直接挑物理算法，而是先把 SQL 对应的逻辑表达式改写成更多**逻辑等价形式**。

这些改写依赖**等价规则（equivalence rules）**。

---

### 2.1 选择（Selection）相关规则

- **合取选择可拆分（Conjunctive selections can be deconstructed）**

\[
\sigma_{\theta_1 \wedge \theta_2}(E) = \sigma_{\theta_1}(\sigma_{\theta_2}(E))
\]

直觉：

- 一个复杂 `WHERE A and B` 可以拆成两个连续的选择
- 这样优化器就有机会把某个选择提前下推

---

- **选择可交换（Selections are commutative）**

\[
\sigma_{\theta_1}(\sigma_{\theta_2}(E)) = \sigma_{\theta_2}(\sigma_{\theta_1}(E))
\]

直觉：

- 两个过滤条件先做哪个，结果一样
- 但执行代价可能不同

---

### 2.2 投影（Projection）相关规则

- **连续投影只保留最后一个（Only the last projection is needed）**

如果后面的投影已经把列裁掉了，那么前面的投影常常可以消掉。

直觉：

- 多次 `π` 连着做通常是冗余的
- 优化器会消除不必要的投影

---

### 2.3 选择与笛卡尔积 / theta join 的结合

很多连接都可以表示成：

\[
\sigma_{\theta}(E_1 \times E_2)
\]

也就是说：

- 先做笛卡尔积
- 再做选择

优化器会把这种形式识别并改写成更直接的连接形式。

---

### 2.4 连接交换律（Join Commutativity）

- **Theta join / natural join 可交换**

\[
E_1 \bowtie E_2 = E_2 \bowtie E_1
\]

直觉：

- 左右连接顺序调换，结果相同
- 但代价不一定相同

---

### 2.5 连接结合律（Join Associativity）

\[
(E_1 \bowtie E_2) \bowtie E_3 = E_1 \bowtie (E_2 \bowtie E_3)
\]

直觉：

- 多表连接时，先连哪两张表很关键
- 虽然逻辑上等价，但中间结果大小差异极大

这条规则是**连接顺序优化（join ordering）**的核心基础。

---

### 2.6 选择下推（Selection Pushdown）

如果选择条件只涉及某一侧属性，那么它可以下推到连接之前。

例如：

\[
\sigma_{\theta}(E_1 \bowtie E_2) = \sigma_{\theta}(E_1) \bowtie E_2
\]

前提是：

- \(\theta\) 只涉及 \(E_1\) 的属性

直觉：

- 尽早过滤数据
- 可以显著缩小后续 join 的输入规模

这就是 PPT 里反复强调的：

\[
\text{Perform selections as early as possible}
\]

---

### 2.7 投影下推（Projection Pushdown）

如果连接之后最终只需要部分属性，那么很多无用列可以在连接前先裁掉。

直觉：

- 连接前先删掉不需要的列
- 可减小 tuple 宽度
- 降低内存占用、I/O 和 CPU 成本

这就是：

\[
\text{Perform projections as early as possible}
\]

---

### 2.8 集合运算规则

- 并（union）和交（intersection）满足交换律、结合律
- 选择可分配到：
  - 并
  - 交
  - 差（部分场景）
- 投影可分配到并（projection distributes over union）

---

### 2.9 外连接（Outer Join）相关规则

这一讲特别提醒：

- 很多对普通 join 成立的规则，对 outer join **不成立**

例如：

- **Full outer join 可交换**
- **Left outer join 和 right outer join 不可简单交换**
- **Outer join 一般不满足普通 join 那样的结合律**

还提到一个重要条件：

- 若谓词是 **null rejecting** 的
- 某些 outer join 可以退化为 inner join

这类规则很重要，因为：

- outer join 语义更敏感
- 优化时一旦错误变换，结果会错

## 3 典型改写例子

### 3.1 选择下推例子（Pushing Selections）

PPT 里的例子核心思想是：

- 若 `dept_name = 'Music'`
- 就应该先把 `instructor` 过滤成 Music 系
- 再去 join `teaches` 和 `course`

原因：

\[
\text{先过滤} \Rightarrow \text{连接输入更小} \Rightarrow \text{连接代价更低}
\]

---

### 3.2 多重变换（Multiple Transformations）

对多表连接，优化器往往会组合使用：

- join associativity
- selection pushdown
- projection pushdown

一个典型过程是：

1. 先重排连接顺序
2. 找到某个能先执行选择的结构
3. 再把无用属性投影掉

所以查询优化不是“只用一条规则”，而是**规则组合**。

---

### 3.3 投影下推例子（Pushing Projections）

PPT 中强调：

- 中间关系里经常包含很多最终根本用不到的属性
- 如果不尽早裁掉，join 时会带来额外成本

典型收益：

- tuple 更短
- page 中可容纳更多 tuples
- 缓冲区利用率更高
- 排序/哈希/连接代价都下降

---

### 3.4 连接顺序例子（Join Ordering Example）

如果：

- 某张表很大
- 某张表很小

那么应优先让小表先参与连接，尽量生成较小中间结果。

优化器关心的不是“哪个式子看起来更自然”，而是：

\[
\text{Which join order creates the smallest useful intermediate results?}
\]

## 4 等价表达式枚举（Enumeration of Equivalent Expressions）

优化器会系统地（systematically）生成与原表达式等价的表达式。

问题在于：

- 等价表达式数量非常大
- 全部生成出来会非常耗费时间和空间

因此 PPT 给出两类思路：

1. **Transformation-rule based optimization**
2. **Special-case optimization**  
   例如只针对 selection / projection / join 的查询采用专门方法

---

### 4.1 为什么不能暴力枚举

因为表达式空间太大：

- 连接顺序会爆炸
- 每个逻辑表达式又能映射到多个物理算法
- 还要考虑排序属性、流水线、索引等附加性质

所以真正的优化器一定要：

- 去重
- 共享子表达式
- 剪枝
- 动态规划

---

### 4.2 动态规划（Dynamic Programming）

PPT 中明确提到：

- 不要把所有表达式都完全展开
- 可以用动态规划复用中间最优子结果

核心思想：

- 先求较小子集的最优计划
- 再逐步拼出更大集合的最优计划

这也是后面 CBO（cost-based optimization）里 join ordering 的核心。

## 5 成本估计（Cost Estimation）

### 5.1 成本估计依赖什么

每个 operator 的代价估计都需要输入统计信息。

需要知道：

- relation 的 tuple 数
- tuple 大小
- block 数
- 属性的 distinct values 数
- 中间结果大小

问题是：

- 输入不一定是基础表
- 也可能是子表达式结果

因此优化器不仅要估算**基础关系统计**，还要估算**中间结果统计**。

---

### 5.2 估计中间结果为什么难

因为很多估算都依赖假设：

- 属性独立（independence）
- 分布均匀（uniformity）
- 统计信息没过期

现实中这些假设经常不成立，所以：

\[
\text{Cardinality estimates are routinely wrong}
\]

这是后面 PPT 总结里反复强调的。

## 6 评估计划选择（Choice of Evaluation Plans）

这一节的核心不是单独看某个算子，而是看**算子之间的相互作用（interaction）**。

PPT 强调：

> 每个操作单独选最便宜算法，不一定得到整体最优计划。

---

### 6.1 为什么局部最优不等于全局最优

#### 例子 1：Merge Join

`merge-join` 本身可能比 `hash-join` 更贵，但它可能输出有序结果。

如果外层还有：

- aggregation
- another merge join
- order by

那么这个“有序输出”可能让后续步骤更便宜。

#### 例子 2：Nested-Loop Join

`nested-loop join` 有时能更容易做 **pipelining**，从而减少中间结果物化。

所以：

\[
\text{Plan choice must consider downstream effects}
\]

---

### 6.2 两类大方向

- **Search all plans cost-based**
  - 尽量枚举并比较代价

- **Heuristic optimization**
  - 用经验规则快速缩小搜索空间

实际系统通常是两者结合。

## 7 基于代价的连接顺序优化（Cost-Based Optimization）

### 7.1 连接顺序为什么爆炸

对多个关系做连接，join order 的数量增长极快。

PPT 想表达的是：

- 关系数一多
- 不可能穷举所有连接顺序

因此必须用动态规划，而不是暴力枚举。

---

### 7.2 左深连接树（Left-Deep Join Trees）

在 **left-deep join trees** 中：

- 每次连接的右输入是一个基础关系
- 左输入是已经形成的中间结果

这种结构常见，因为：

- 实现简单
- 容易和 index nested loop / pipelining 结合

但它也有限制：

- 并不是所有场景下都最优

---

### 7.3 Interesting Sort Orders

这是查询优化里一个很重要但容易忽略的点。

**interesting sort order（有趣排序顺序）** 指：

- 某种结果排序虽然当前步骤未必最便宜
- 但它能让后续 join / group by / order by 更便宜

例如：

若 \(R \bowtie S\) 的结果按某个公共属性 \(A\) 排好序，
那它再和第三张表连接时，可能直接用 merge join。

所以优化器不能只记“每个子集的一个最优计划”，而要记：

\[
\text{best plan for each subset, for each interesting order}
\]

---

### 7.4 CBO with equivalence rules

PPT 进一步把逻辑优化和物理优化联系起来：

- **Logical plan**
  - 逻辑操作符层的等价变换
- **Physical plan**
  - 指定具体算法，例如 hash join / merge join / index scan

物理等价规则（physical equivalence rules）允许：

\[
\text{logical plan} \rightarrow \text{physical plan}
\]

一个高效优化器通常需要：

- 节省空间的表达式表示法
- 检测重复表达式
- memoization
- cost-based pruning

## 8 启发式优化（Heuristic Optimization）

PPT 明确说：

- 完整 cost-based optimization 很贵
- 所以系统常用 heuristic 先缩小选择空间

---

### 8.1 常见启发式规则

- **Perform selection early**
  - 先做选择，减少 tuple 数

- **Perform projection early**
  - 先做投影，减少 attribute 数

- **Perform most restrictive operations first**
  - 先做结果最小的选择/连接

- **Predicate / Limit / Projection pushdown**
  - 谓词、限制、投影尽量下推

- **Join ordering based on cardinality**
  - 倾向于先连更小的关系

---

### 8.2 启发式优化的优缺点

#### 优点

- 实现容易
- 调试容易
- 对简单查询足够快

#### 缺点

- 依赖“magic constants”
- 对复杂算子依赖关系处理差
- 容易错过真正好的计划

## 9 启发式 + 基于代价的连接搜索

这是更主流的一类做法。

流程一般是：

1. 用启发式规则做第一轮简化
2. 再用动态规划决定 join order

代表思想来自 **System R**。

---

### 优点

- 不需要对全部计划做彻底穷举
- 通常能找到“足够合理”的计划

### 缺点

- 仍然继承启发式方法的局限
- left-deep trees 不一定最优

## 10 随机化搜索（Randomized Algorithms）

PPT 提到一个不同思路：

- 在所有合法计划空间上做 **random walk**

搜索终止条件可以是：

- 达到 cost threshold
- 到达 wall-clock time 限制

典型例子：

- PostgreSQL 的遗传算法（genetic algorithm）

---

### 优点

- 可以跳出局部最优（local minimum）
- 内存开销低

### 缺点

- 很难解释为什么选这个计划
- 为了保证 determinism 还要做额外工作

## 11 优化器生成器（Optimizer Generators）

PPT 在后半段转向“现代优化器框架”的设计思想。

核心观察是：

- 用过程式语言手写 transformation rules 很难
- 容易出错
- 很难验证正确性

因此更好的方向是：

- 用 **declarative DSL** 写规则
- 由优化器框架统一执行这些规则

---

### 11.1 这些框架解决什么问题

- 将搜索策略与数据模型解耦
- 将逻辑规则与物理规则分离
- 允许不同搜索策略复用同一套规则系统

PPT 提到的例子：

- Starburst
- Exodus
- Volcano
- Cascades
- OPT++

---

### 11.2 两类搜索框架

#### Stratified Search（分层搜索）

- 先做 logical → logical 重写
- 不考虑 cost
- 再做 cost-based 的 logical → physical 映射

#### Unified Search（统一搜索）

- 逻辑变换和物理变换统一成 transformation
- 一次性搜索
- 高度依赖 memoization

## 12 统计信息（Statistics for Cost Estimation）

### 12.1 基本统计量

PPT 中给出了一组经典记号：

- \(n_r\)：关系 \(r\) 的 tuple 数
- \(b_r\)：关系 \(r\) 占用的 block 数
- \(l_r\)：关系 \(r\) 中一个 tuple 的长度
- \(f_r\)：一个 block 能容纳多少 tuples
- \(V(A, r)\)：属性 \(A\) 在关系 \(r\) 中的 distinct values 数

这些都是优化器估算代价的基础。

---

### 12.2 Histogram（直方图）

PPT 提到了两类典型 histogram：

- **Equi-width histogram**
  - 每个区间宽度相同

- **Equi-depth histogram**
  - 每个区间中的 tuple 数大致相同

很多数据库还会单独存：

- **most-frequent values**
- 以及它们的计数

这样比只知道平均分布更准确。

---

### 12.3 统计信息的问题

- 统计通常基于 random sample
- 可能过期（out of date）
- 有的数据库要手动 `ANALYZE`
- 有的数据库会自动重算

所以统计信息本身也是优化误差的重要来源。

## 13 选择结果大小估计（Selection Size Estimation）

设：

\[
n_{\sigma_\theta(r)}
\]

表示满足条件 \(\theta\) 的 tuple 数。

---

### 13.1 键上的等值条件

若条件作用在 key attribute 上，则：

\[
n_{\sigma_{A=v}(r)} = 1
\]

因为主键至多匹配一条。

---

### 13.2 非键属性上的等值条件

若只有 distinct values 数 \(V(A,r)\) 可用，且假设均匀分布，则：

\[
n_{\sigma_{A=v}(r)} \approx \frac{n_r}{V(A,r)}
\]

---

### 13.3 范围条件

如果有 histogram，就可以用 histogram 细化估计；否则常依赖均匀分布假设。

在没有统计信息时，数据库还可能退回到经验常数估计。

## 14 复杂选择的估计（Complex Selections）

### 14.1 Selectivity（选择率）

条件 \(\theta\) 的选择率定义为：

\[
s(\theta) = \frac{n_{\sigma_\theta(r)}}{n_r}
\]

也就是：

- 一个 tuple 满足条件的概率

---

### 14.2 合取（Conjunction）

若假设条件独立：

\[
s(\theta_1 \wedge \theta_2)=s(\theta_1)s(\theta_2)
\]

---

### 14.3 析取（Disjunction）

\[
s(\theta_1 \vee \theta_2)=s(\theta_1)+s(\theta_2)-s(\theta_1)s(\theta_2)
\]

---

### 14.4 否定（Negation）

\[
s(\neg \theta)=1-s(\theta)
\]

---

### 14.5 这里的关键前提

上面这些式子往往依赖：

\[
\text{Assuming independence}
\]

这在现实中经常不成立，因此误差很常见。

## 15 连接结果大小估计（Join Cardinality Estimation）

这一部分是优化器里最关键、也最容易错的部分。

---

### 15.1 特殊容易估的情况

#### 如果连接属性是 key

若 \(A\) 是 \(R\) 的 key，则：

- 一个 \(S\) 中 tuple 最多匹配一个 \(R\) 中 tuple

#### 如果是 foreign key → primary key

如果：

- \(S.A\) 是外键
- 引用 \(R.A\) 主键

那么连接结果大小通常与 \(S\) 的 tuple 数同数量级，很多教材中可近似视为：

\[
n_{R \bowtie S} \approx n_S
\]

---

### 15.2 一般等值连接估计

若没有键/外键信息，常用经典估计：

\[
n_{R \bowtie S} \approx \frac{n_R \cdot n_S}{\max(V(A,R),V(A,S))}
\]

直觉：

- distinct values 越多
- 碰撞概率越低
- join 结果越小

---

### 15.3 直方图可改进估计

如果两边都有 histogram，可以对每个 bucket 分别估，再汇总。

这会比简单平均公式更准确，但实现更复杂。

## 16 其他操作的大小估计

### Projection

- 结果 tuple 数通常不增加
- 若带去重，可能显著减少

### Aggregation

- 结果组数与 `GROUP BY` 属性的 distinct values 数相关

### Set operations

- 同一关系上的选择结果可以改写后估算
- 不同关系上的并/交/差估计通常不够准确
- 但可以给上界

## 17 Distinct Values 的估计

优化器不仅要估 tuple 数，还要估：

\[
V(A, E)
\]

即属性 \(A\) 在表达式结果 \(E\) 中的 distinct values 数。

这会影响：

- 后续选择估计
- 后续 join 估计
- aggregation / group by 估计

---

### 17.1 选择后的 distinct values

如果选择条件把属性固定成一个值，例如：

\[
A = c
\]

那么：

\[
V(A, \sigma_{A=c}(r)) = 1
\]

如果是范围条件，则常按选择率近似缩放。

---

### 17.2 连接后的 distinct values

连接结果中的 distinct values 往往与：

- 原两边的 distinct values
- 连接条件
- 哪些属性被保留

有关。

PPT 中给出的是规则化估计，而不是单一固定公式。

## 18 Estimator Quality

PPT 引用了 VLDB 2015 的著名论文：

- *How good are query optimizers, really?*

核心结论是：

- join 数一多
- 基数估计错误会快速累积
- 许多 DBMS 的优化器在这方面都不够准

这也是为什么：

\[
\text{Cardinality estimation is one of the hardest parts of optimization}
\]

## 19 Query Optimization 回顾图

PPT 的回顾图想表达的主线是：

- SQL
  - Parser
  - Binder
  - Rewriter
  - Tree Rewriter
  - Optimizer
  - Cost Estimates
  - Logical Plan
  - Physical Plan
  - Query Executor

也就是说：

\[
\text{Query Optimization 是从逻辑计划走向物理计划的关键桥梁}
\]

## 20 现代优化器设计（Optimizer Design）

### 20.1 优化粒度（Optimization Granularity）

#### Choice 1: Single Query

- 搜索空间更小
- 通常不在不同查询之间共享结果
- 若要考虑资源竞争，cost model 需感知当前系统负载

#### Choice 2: Multiple Queries

- 若有大量相似查询，可能更高效
- 可共享数据或中间结果
- 但搜索空间大很多

---

### 20.2 优化时机（Optimization Timing）

#### Static Optimization

- 执行前选好计划
- 计划质量高度依赖 cost model 准确性
- prepared statements 场景可摊销优化开销

#### Dynamic Optimization

- 查询执行时动态选 operator plan
- 更灵活
- 但实现和调试都很难

#### Adaptive Optimization

- 初始仍用静态计划
- 若发现估计误差超过阈值，再 re-optimize

## 21 Prepared Statements

PPT 用 `PREPARE ... EXECUTE ...` 说明了一个核心问题：

- 同一条 prepared statement
- 参数值不同
- 最优 join order 可能不同

例如：

- `A.val > ?`
- `B.val > ?`
- `C.val > ?`

不同参数会改变选择率，从而改变最优计划。

---

### Prepared Statement 的几种策略

#### Reuse Last Plan

- 复用上次生成的计划

#### Re-Optimize

- 每次执行都重新优化

#### Multiple Plans

- 为不同参数范围准备多套计划

#### Average Plan

- 用平均参数值做一套折中计划

## 22 搜索终止条件（Search Termination）

优化器不可能永远搜索下去，因此需要停止条件：

### Wall-clock Time

- 优化时间到上限就停

### Cost Threshold

- 找到足够便宜的计划就停

### Exhaustion

- 候选计划空间被搜索完就停

## 23 搜索策略（Search Strategies）

PPT 列出五类代表性策略：

- Heuristics
- Heuristics + Cost-based Join Order Search
- Randomized Algorithms
- Stratified Search
- Unified Search

这五类不是互斥的“教材分类题”而已，而是代表优化器设计思路的演化路径。

## 24 代价模型（Cost Model）

### 24.1 三类成本组成

#### Physical Costs

- CPU cycles
- I/O
- cache misses
- RAM consumption
- prefetching

#### Logical Costs

- 每个 operator 的结果大小估计
- 与具体算法无关

#### Algorithmic Costs

- 算法自身复杂度
- 不同 operator implementation 的固有差异

---

### 24.2 磁盘型 DBMS 的代价模型

PPT 的核心观点：

- 磁盘访问通常主导总成本
- CPU 成本相对次要
- 要区分 sequential I/O 和 random I/O

如果 DBMS 对 buffer manager 控制很强，代价建模会更容易。

---

### 24.3 PostgreSQL 的代价模型

Postgres 使用 CPU + I/O 混合模型，并用一些 **magic constants** 加权。

PPT 给出的默认直觉是：

- 内存处理 tuple 比从磁盘读 tuple 快很多
- sequential I/O 比 random I/O 快很多

这说明：

\[
\text{Cost model often encodes hardware assumptions}
\]

---

### 24.4 MySQL 8.0 的代价模型

PPT 特别提到：

- MySQL 8.0 把原先很多 hard-coded cost 换成了可配置成本常量

并用：

- `mysql.server_cost`
- `mysql.engine_cost`

这两张表管理代价常量。

这比写死常量更灵活，也更便于调优。

---

### 24.5 IBM DB2 的代价模型

DB2 的代价模型会考虑：

- 系统目录里的数据库特征
- 硬件 microbenchmarks
- 存储设备特征
- 通信带宽（分布式场景）
- buffer pools / sort heaps
- 并发环境
- 用户数、隔离级别、锁数量

说明现代商用优化器远不只是“几条简单公式”。

## 25 Lessons

PPT 最后的 lessons 非常值得背：

- **Query optimization 比 fast engine 更重要**
- **Cost-based join ordering 是必要的**
- **Cardinality estimates 经常是错的**
- **尽量使用不那么依赖估计值的算子**
  - 如 hash joins + seq scans 往往更稳健（robust）
- **索引越多，平均可能更快，但计划也更脆弱（brittle）**
- **与其把精力全浪费在极精确 cost model 上，不如优先改进 cardinality estimation**

这几句几乎可以视为整讲的“核心观点总结”。

## 26 一句话总结

查询优化（Query Optimization）的本质是：

- 用**等价规则**扩大计划空间
- 用**统计信息**估计中间结果大小
- 用**代价模型**比较候选计划
- 用**动态规划、启发式和剪枝**控制搜索开销

最终目标是：

\[
\boxed{\text{用可承受的优化时间，找到足够好的执行计划}}
\]

这也是为什么现实系统中：

- 几乎没有优化器能保证真正全局最优
- 但一个好的优化器，依然能决定查询是“几秒跑完”还是“跑到天荒地老”
