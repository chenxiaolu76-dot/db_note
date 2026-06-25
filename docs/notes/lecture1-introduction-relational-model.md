# Lecture 1 Introduction & Relational Model

## Final Review 重点

- <span class="key-point">Three-level abstraction：Physical → Logical → View。</span>
- <span class="key-point">Data models：Relational、E-R、Semi-structured（JSON/XML）等。</span>
- <span class="key-point">DBMS core components：Storage Manager、Query Processor、Transaction Manager。</span>
- <span class="key-point">Keys：Superkey → Candidate Key → Primary Key；Foreign Key constraint。</span>
- <span class="key-point">Relational Algebra 六个基本操作：σ、π、∪、−、×、ρ；扩展操作重点看 natural join。</span>

---

## 1 Overview

这一讲其实由两条主线组成：

- 为什么要有 DBMS
- 关系模型如何表达数据与查询

它既是整门课的起点，也是后面 SQL、设计、优化、事务的共同基础。

---

## 2 DB & DBMS

### 2.1 什么是数据库

| 概念 | 含义 |
| --- | --- |
| Database | 对现实世界某一部分进行建模的、相互关联的数据集合 |
| DBMS | 管理数据库并提供高效、方便访问方式的一组程序 |

### 2.2 DBMS 的目标

| 目标 | 说明 |
| --- | --- |
| store | 能把数据长期保存下来 |
| retrieve | 能高效检索与更新数据 |
| convenient | 能让应用方便使用 |
| efficient | 能支撑多用户和多程序共享访问 |

---

## 3 Database Applications

课件列出的典型数据库应用包括：

| 领域 | 示例 |
| --- | --- |
| Enterprise Information | 客户、产品、支付、资产 |
| Manufacturing | 生产、库存、订单、供应链 |
| Banking and Finance | 账户、贷款、信用卡交易 |
| Universities | 选课、成绩、学籍 |
| Web-based Services | 订单跟踪、在线服务 |
| Telecommunication | 通话、短信、流量记录 |

这些例子说明：

- 数据库不是某个单一行业的技术
- 它是现代信息系统的基础设施

---

## 4 为什么不能只靠文件系统

### 4.1 基于文件的做法

课件举的例子是：

- 用 CSV 文件保存实体
- 每种实体一个单独文件
- 应用程序自己解析、查找、修改记录

### 4.2 文件系统方案的问题

| 问题类型 | 具体问题 |
| --- | --- |
| Data Integrity | 非法值写入怎么办；删除 artist 后 album 怎么办 |
| Implementation | 如何定位记录；并发写文件怎么办 |
| Durability | 更新一半机器崩溃怎么办；多机复制怎么办 |

### 4.3 数据库系统存在的目的

| 目的 | 含义 |
| --- | --- |
| 减少冗余与不一致 | 避免同一数据在多处重复且互相矛盾 |
| 便于访问数据 | 不必手写底层解析逻辑 |
| 消除数据孤立 | 让不同数据集能统一管理 |
| 保证完整性 | 通过约束限制非法状态 |
| 保证原子性 | 更新要么全成功，要么全失败 |
| 支持并发 | 多用户同时访问仍然正确 |
| 保证安全性 | 控制谁能看、谁能改 |

---

## 5 University Database Example

课件用大学数据库说明数据库的典型建模对象：

| 数据对象 | 内容 |
| --- | --- |
| Students | 学生信息 |
| Instructors | 教师信息 |
| Courses | 课程信息 |

典型应用程序包括：

| 应用 | 说明 |
| --- | --- |
| Add new students/instructors/courses | 基础录入 |
| Register students for courses | 选课与名单生成 |
| Assign grades / GPA / transcripts | 成绩、绩点、成绩单 |

这说明数据库关注的不是“一个文件”，而是：

- 多实体
- 多关系
- 多种查询与更新需求

---

## 6 Data Abstraction

### 6.1 为什么需要抽象

数据库底层存储很复杂，因此要把细节隐藏起来。

### 6.2 Data Model

| 概念 | 含义 |
| --- | --- |
| data model | 描述数据库中数据、关系、语义与约束的一组概念 |
| schema | 用某种数据模型写出的数据库结构描述 |

### 6.3 课件列出的数据模型

| 数据模型 | 说明 |
| --- | --- |
| Relational | 关系模型 |
| Key/Value | 键值模型 |
| Graph | 图模型 |
| Document | 文档模型 |
| Column-family | 列族模型 |
| Array/Matrix | 数组矩阵模型 |
| Hierarchical | 层次模型 |
| Network | 网状模型 |
| Multi-Value | 多值模型 |
| Entity-Relationship | E-R 模型 |
| Object-oriented | 面向对象模型 |
| Object-relational | 对象关系模型 |
| Semi-structured (XML) | 半结构化模型 |

---

## 7 Three-Level Abstraction

这是 Ch.1 最核心的考试点之一。

| 层次 | 含义 |
| --- | --- |
| Physical (Inner) level | 记录如何存储 |
| Logical (Conceptual) level | 数据存什么、数据之间有什么关系 |
| View (Outer) level | 不同用户看到数据库的哪一部分 |

### 7.1 Physical Data Independence

| 概念 | 含义 |
| --- | --- |
| Physical Data Independence | 修改物理模式而不影响逻辑模式的能力 |

### 7.2 课件中的例子

同一个大学数据库可以同时存在：

| 视图 | 看到的内容 |
| --- | --- |
| 学生视图 | 学生相关字段与成绩 |
| 教师视图 | 课程与选课学生 |
| 教务处视图 | 更完整的管理信息 |

而底层可能采用：

- 分区
- B+ 树索引
- 行存
- 按年份拆文件

这正体现了：

- 外模式与内模式可以不同

---

## 8 Schema and Instance

| 概念 | 类比 | 含义 |
| --- | --- | --- |
| Logical Schema | 程序中的类型定义 | 数据库整体逻辑结构 |
| Physical Schema | 程序底层布局 | 数据库整体物理组织 |
| Instance | 程序中变量的当前值 | 某一时刻数据库里的实际数据 |

要点是：

- schema 是“结构定义”
- instance 是“当前内容”

---

## 9 Data Languages

### 9.1 DDL

| 语言 | 作用 |
| --- | --- |
| Data Definition Language (DDL) | 定义数据库模式 |

### 9.2 DML

| 语言 | 作用 |
| --- | --- |
| Data Manipulation Language (DML) | 查询和更新数据库中的数据 |

### 9.3 Procedural vs Nonprocedural

| 类型 | 特点 |
| --- | --- |
| Procedural DML | 既说明“要什么”，也说明“怎么做” |
| Nonprocedural DML | 只说明“要什么”，不说明执行步骤 |

SQL 更偏向：

- nonprocedural

---

## 10 Database Design

### 10.1 数据库设计不是只画表

课件强调了两个层面的决定：

| 决策类型 | 关注点 |
| --- | --- |
| Business decision | 记录哪些业务属性 |
| Computer Science decision | 设计哪些关系模式，以及属性如何分布 |

### 10.2 设计问题

| 问题 | 说明 |
| --- | --- |
| 哪些属性需要存 | 取决于业务需求 |
| 如何划分 relation schemas | 取决于规范化、冗余、查询需求 |
| 怎样处理 schema heterogeneity | 需要统一结构定义 |
| 如何应对 schema / physical modification | 需要数据独立性支持 |

---

## 11 DBMS Architecture

### 11.1 三个核心模块

| 模块 | 作用 |
| --- | --- |
| Storage Manager | 管理数据在磁盘和内存中的组织 |
| Query Processor | 解释、优化并执行查询 |
| Transaction Manager | 保证并发与恢复正确性 |

### 11.2 Storage Manager 负责什么

| 组成/职责 | 说明 |
| --- | --- |
| authorization & integrity manager | 权限与完整性检查 |
| transaction manager | 事务协调 |
| file manager | 文件组织 |
| buffer manager | 缓冲区管理 |

### 11.3 Query Processor 负责什么

| 组成 | 说明 |
| --- | --- |
| DDL interpreter | 处理模式定义 |
| DML compiler | 把查询翻译成执行计划 |
| query evaluation engine | 真正执行查询计划 |

---

## 12 History of Database Systems

课件回顾了数据库的发展背景，重点是理解关系模型为什么重要。

| 历史点 | 含义 |
| --- | --- |
| 早期有 hierarchical / network models | 结构复杂、依赖导航式访问 |
| Ted Codd 提出 relational model | 用更简洁统一的数学方式表示数据 |
| 争议点 | 关系模型最初被质疑难实现、关系语言难用 |
| 结果 | 关系模型成为主流数据库基础 |

---

## 13 Relational Model

### 13.1 关系模型的基本元素

| 概念 | 含义 |
| --- | --- |
| relation | 由属性组成的元组集合 |
| attribute | 列 |
| tuple | 行 |
| relation schema | 关系的结构定义 |
| relation instance | 某一时刻关系中的实际元组集合 |

### 13.2 NULL

课件提到：

- 某些属性值可能未知或不存在
- 这时可用 `NULL`

但 `NULL` 会给比较、逻辑判断、聚合带来特殊行为，后面 SQL 里会继续展开。

---

## 14 Keys

### 14.1 各类键的层次关系

| 概念 | 含义 |
| --- | --- |
| Superkey | 能唯一标识元组的属性集 |
| Candidate Key | 最小 superkey |
| Primary Key | 选定的 candidate key |
| Foreign Key | 指向另一关系主键的属性集 |

### 14.2 Foreign Key Constraint

| 约束 | 含义 |
| --- | --- |
| Foreign Key constraint | 子表中的值必须引用父表中已有主键值，或为 `NULL`（视约束定义而定） |

---

## 15 Schema Diagram

课件还提到 **schema diagram**，它的作用是：

| 作用 | 说明 |
| --- | --- |
| 展示 relation schemas | 表结构概览 |
| 展示主键 | 唯一标识方式 |
| 展示外键联系 | 表之间的引用关系 |

这相当于关系数据库中的结构蓝图。

---

## 16 Relational Query Languages

课件列出两大理论查询语言：

| 语言 | 特点 |
| --- | --- |
| Relational Algebra | 过程化表达，强调操作序列 |
| Relational Calculus | 非过程化表达，强调结果条件 |

工程上更直接相关的是：

- relational algebra

因为它和查询优化、执行计划联系更紧。

---

## 17 Relational Algebra

### 17.1 六个基本操作

| 操作 | 作用 |
| --- | --- |
| `σ` selection | 选出满足条件的元组 |
| `π` projection | 保留指定属性列 |
| `∪` union | 并集 |
| `−` difference | 差集 |
| `×` cartesian product | 笛卡尔积 |
| `ρ` rename | 重命名关系或属性 |

### 17.2 扩展与常用操作

| 操作 | 作用 |
| --- | --- |
| natural join | 按同名属性自动连接，并去掉重复列 |
| intersection | 交集 |
| assignment | 把表达式结果赋给临时关系名 |
| aggregation | 在结果集上计算函数 |

### 17.3 每个基本操作的直觉

| 操作 | 直觉理解 |
| --- | --- |
| selection | 行过滤 |
| projection | 列裁剪 |
| union | 合并两个兼容关系 |
| difference | 取第一个关系中独有的元组 |
| cartesian product | 两关系所有元组组合 |
| rename | 给中间结果命名，方便复用 |

### 17.4 每个关系代数运算符的示例

先统一约定两个关系：

- `Student(sid, name, dept, age)`
- `CSStudent(sid, name, dept, age)`

其中可把它们想成下面的数据：

| sid | name | dept | age |
| --- | --- | --- | --- |
| 1001 | Alice | CS | 20 |
| 1002 | Bob | Math | 21 |
| 1003 | Carol | CS | 22 |

`CSStudent` 只包含 CS 学生，因此可看成：

| sid | name | dept | age |
| --- | --- | --- | --- |
| 1001 | Alice | CS | 20 |
| 1003 | Carol | CS | 22 |

1. Selection（选择）

从 `Student` 里筛出计算机系学生：

\[
\sigma_{\mathrm{dept} = \text{CS}}(\mathrm{Student})
\]

结果是保留 `dept = CS` 的元组，也就是 Alice 和 Carol。

2. Projection（投影）

只保留学生姓名：

\[
\pi_{\mathrm{name}}(\mathrm{Student})
\]

结果只剩一列 `name`，体现“列裁剪”。

3. Union（并）

如果还有一个同结构关系 `MathStudent(sid, name, dept, age)`，则：

\[
\mathrm{CSStudent} \cup \mathrm{MathStudent}
\]

表示把两个并相容关系中的元组合并起来，重复元组只保留一份。

4. Difference（差）

求“所有学生中，不属于 CSStudent 的人”：

\[
\mathrm{Student} - \mathrm{CSStudent}
\]

结果是 Bob，表示出现在前一个关系、但不出现在后一个关系中的元组。

5. Cartesian Product（笛卡尔积）

如果有关系 `Course(cid, title)`，则：

\[
\mathrm{Student} \times \mathrm{Course}
\]

表示每个学生都和每门课做一次配对，总结果数等于两个关系元组数的乘积。

6. Rename（重命名）

把 `Student` 改名成 `S`，方便写更复杂表达式：

\[
\rho_{S}(\mathrm{Student})
\]

如果要同时改属性名，也可以写成：

\[
\rho_{S(sid, sname, dept, age)}(\mathrm{Student})
\]

它常用于自连接或给中间结果命名。

### 17.5 Natural Join

课件强调：

- natural join 会自动找公共属性
- 只保留一份重复列

这也是 final review 明确点名的操作。

### 17.6 关于表达式等价

同一个查询可能有多种 relational algebra 写法，只要：

- 对任意数据库实例结果相同

那么这些表达式就是等价的。

---

## 18 Lecture 1 总结

这一讲的最核心内容可以压成四条：

1. DBMS 解决的是文件系统在一致性、并发、持久性上的根本缺陷。
2. 三层抽象是数据库体系结构的主线：Physical / Logical / View。
3. 关系模型用 relation、tuple、attribute、key 来组织数据。
4. 关系代数提供了关系查询的理论基础，特别是 `σ`、`π`、`join`。

\[
\boxed{\text{Lecture 1 的本质，是把“为什么需要数据库”和“数据库如何用关系模型表达”两件事讲清楚}}
\]

---

## 19 教材补充

这一讲如果题目更贴近教材，而不是只贴近 PPT，最容易补出的点有：

| 教材小节 | 可能补充出的知识点 |
| --- | --- |
| 1.4 Database Languages | DDL 与 DML 的区别；过程化与非过程化语言 |
| 1.6 Database Engine | `storage manager`、`query processor`、`transaction manager` 的职责边界 |
| 1.7 Database and Application Architecture | two-tier / three-tier 架构差异 |
| 1.8 Database Users and Administrators | DBA、开发者、终端用户的角色分工 |
| 1.9 History of Database Systems | 关系模型为什么成为主流 |

复习建议：

- 大题主线仍然是三层抽象与关系模型
- 但这些教材补充点很适合出概念型选择题
