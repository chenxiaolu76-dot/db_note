# 思维导图风格示例

下面这份内容按你提供的 `D:\learn\大二下\数据库\课件\新建 文本文档.txt` 原样整理为 Markdown + Mermaid 代码块，用来确认最终思维导图风格。

```mermaid
mindmap
  root((数据库系统原理<br/>绪论与关系模型))
    一、数据库系统绪论 Introduction
      核心基本概念
        数据库 DataBase
          相互关联数据的有组织集合
          建模现实世界的某一维度
          多数计算机应用的核心组件
        数据库管理系统 DBMS
          包含相互关联的数据集合
          包含数据访问程序集
          提供便捷高效的数据存储与检索能力
          支持多用户、多应用并发访问
      典型应用场景
        企业信息：客户、产品、交易、资产
        制造业：生产、库存、订单、供应链
        银行金融：账户、贷款、交易、信用卡
        高校教务：注册、选课、成绩、学籍
        互联网服务：订单追踪、用户数据
        电信运营：通话、短信、流量记录
      文件系统的局限
        数据完整性问题
          非法值写入无法校验
          关联数据删除存在异常
        实现效率问题
          特定记录检索效率低
          多线程并发写入冲突
        持久化与容灾问题
          更新中途崩溃数据丢失
          多副本高可用难以实现
      数据库系统核心目标
        减少数据冗余与不一致
        降低数据访问难度
        解决数据隔离问题
        保障数据完整性约束
        保证更新操作原子性
        支持多用户并发访问
        提供数据安全与权限控制
      数据抽象体系
        数据模型 Data Model
          描述数据、数据关系、数据语义、数据约束的概念集合
        模式 Schema
          基于指定数据模型对数据集合的描述
      常见数据模型
        主流模型
          关系型 Relational
          键值型 Key/Value
          图模型 Graph
          文档型 Document
          列族 Column-family
          数组/矩阵 Array / Matrix
        其他模型
          层次模型 Hierarchical
          网状模型 Network
          实体-联系模型 ER
          面向对象模型 Object-oriented
          对象关系模型 Object-relational
          半结构化模型 Semi-structured
      三级模式结构
        物理层 Physical level / 内模式
          描述数据的实际存储方式
        逻辑层 Logical level / 概念模式
          描述存储数据及数据间关系
          以简单结构化形式呈现
        视图层 View level / 外模式
          仅描述完整数据库的一部分
        物理数据独立性 Physical Data Independence
          修改物理模式无需改动逻辑模式
      模式与实例
        逻辑模式 Logical Schema
          数据库整体逻辑结构
        物理模式 Physical Schema
          数据库整体物理结构
        实例 Instance
          数据库的实际内容
          类比编程语言中的变量值
      数据库语言
        数据定义语言 DDL
          用于定义数据库模式
          元数据存储于数据字典
            数据库模式
            完整性约束
            授权信息
        数据操纵语言 DML / 查询语言
          过程化 DML Procedural
          非过程化 DML Declarative
        SQL 语言特点
          非过程化语言
          非图灵完备
          可嵌入高级语言
          通过 ODBC/JDBC 接口访问
      数据库设计
        逻辑设计 Logical Design
          确定数据库整体模式
          设计关系结构与属性分布
        物理设计 Physical Design
          确定数据库物理存储布局
      数据库引擎组成
        存储管理器 Storage Manager
          核心职责
            与操作系统文件管理器交互
            实现数据的高效存储、检索与更新
          组成组件
            权限与完整性管理器
            事务管理器
            文件管理器
            缓冲区管理器
          底层数据结构
            数据文件
            数据字典
            索引
        查询处理器 Query Processor
          DDL 解释器
          DML 编译器
          查询执行引擎
      事务管理 Transaction Management
        事务 Transaction
          执行单一逻辑功能的操作集合
        事务管理器
          保障系统故障、事务故障下数据一致性
        并发控制
          管控并发事务交互，保障数据一致性
      数据库架构分类
        集中式数据库
        客户端-服务器架构
        并行数据库
          共享内存架构
          共享磁盘架构
          无共享架构
        分布式数据库
          地理分布部署
          模式与数据异构
      应用架构
        两层架构 Two-tier
          客户端直连数据库
        三层架构 Three-tier
          客户端 → 应用服务器 → 数据库系统
      数据库管理员 DBA
        模式定义
        存储结构与访问方法定义
        模式与物理结构修改
        数据访问权限授权
        日常运维
          定期备份
          磁盘空间管理
          运行作业监控
      发展历史
        1950s-60s初：磁带、穿孔卡片
        1960s末-70s：硬盘、网状/层次模型、事务处理
        1980s：关系数据库、面向对象数据库
        1990s：数据挖掘、数据仓库、互联网规模
        2000s：大数据存储、NoSQL
        2010s：NewSQL、MPP、分布式数据库、内存数据库
        2020s：新硬件、云原生
    二、关系模型 Relational Model
      基础概念
        关系 Relation
          无序集合，由属性组成，对应数据表
        元组 Tuple
          关系中的属性值集合，对应数据行
        域 Domain
          属性的取值范围
          值为原子/标量
          NULL 属于所有域
        n元关系 n-ary Relation
          包含 n 列的表
      模式与实例
        关系模式 Relation Schema
          形式：R = (A1, A2, …, An)
          由属性集合构成的结构定义
        关系实例 Relation Instance
          定义在模式上的具体数据
          对应表的当前取值
      键 Keys
        超键 Superkey
          可唯一标识元组的属性集合
        候选键 Candidate Key
          满足最小性的超键
        主键 Primary Key
          选定的候选键，唯一标识元组
        外键 Foreign Key
          参照完整性约束
          一个关系的值必须出现在另一关系中
          参照关系 Referencing relation
          被参照关系 Referenced relation
      关系查询语言分类
        过程化语言
          指定查询的执行策略
          代表：关系代数
        非过程化语言
          仅指定所需数据，不指定方法
          代表：关系演算、SQL
      关系代数 Relational Algebra
        核心特点
          基于集合代数
          输入输出均为关系
          运算符可嵌套组合
        基本运算符
          选择 Select (σ)
            按谓词筛选符合条件的元组
          投影 Projection (Π)
            保留指定属性列，自动去重
          并 Union (∪)
            合并两个关系的所有元组
          差 Difference (-)
            保留第一个关系有、第二个没有的元组
          笛卡尔积 Product (×)
            生成两个关系元组的全组合
          重命名 Rename (ρ)
            为关系或属性重命名
        扩展运算符
          交 Intersection (∩)
            保留两个关系共有的元组
          自然连接 Natural Join (⋈)
            按同名属性匹配组合元组
          赋值 Assignment (←)
            将表达式结果赋值给临时变量
          除 Division (÷)
          排序 Sorting (τ)
          聚集 Aggregation (γ)
            支持 avg、sum、min、max、count 等函数
```
