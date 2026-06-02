# 数据库课程第 2 讲 SQL(1) 详细知识讲解

## 文档说明
- 对应课件：`Database2026 - lecture 2 - SQL(1).pptx`
- 学习对象：零基础到入门阶段
- 使用方法：按顺序阅读，每个知识点先看“讲解”，再手敲“示例”，最后记住“注意事项”

## 一、基础 SQL

### 知识点 1：SQL 语句类型与定位
讲解：SQL 按用途可以分为定义数据结构、操作数据、查询数据、控制权限和事务控制。初学阶段先把“建表、增删改、查询”掌握牢。

```sql
CREATE TABLE student (
  id INT PRIMARY KEY,
  name VARCHAR(50) NOT NULL
);
```

注意事项：
- `CREATE TABLE` 属于定义结构语句。
- 先定义好主键和空值规则，再导入数据，后续问题会少很多。

### 知识点 2：常见数据类型
讲解：字符、整数、小数、日期时间是最常见类型。选类型时要先看业务含义，再看范围与精度。

```sql
CREATE TABLE product (
  product_id INT,
  product_name VARCHAR(100),
  price NUMERIC(10,2),
  created_at TIMESTAMP
);
```

注意事项：
- `VARCHAR(n)` 是变长字符串，`n` 不是越大越好。
- 金额优先用定点小数，不建议用浮点表示金额。

### 知识点 3：列约束
讲解：约束是“数据质量防线”，常见有 `NOT NULL`、`PRIMARY KEY`、`UNIQUE`、`CHECK`、`FOREIGN KEY`。

```sql
CREATE TABLE users (
  id INT PRIMARY KEY,
  email VARCHAR(100) UNIQUE,
  age INT CHECK (age >= 0 AND age <= 120)
);
```

注意事项：
- 主键默认不可重复且不可为空。
- `CHECK` 只校验单行条件，跨表规则通常要靠外键、触发器或业务逻辑。

### 知识点 4：修改表结构
讲解：上线后经常要加列、改列、删列，常用 `ALTER TABLE`。

```sql
ALTER TABLE users ADD phone VARCHAR(20);
```

注意事项：
- 改结构前先确认是否影响已有查询和程序。
- 生产环境改表通常要先评估锁表和耗时。

### 知识点 5：插入数据
讲解：插入可以单行写值，也可以把查询结果插入目标表。

```sql
INSERT INTO users (id, email, age) VALUES (1, 'a@example.com', 20);
```

注意事项：
- 建议显式写列名，不要依赖“全列顺序”。
- 字段缺省值和 `NOT NULL` 规则要提前确认。

### 知识点 6：更新数据
讲解：更新是高风险操作，核心是精确 `WHERE` 条件。

```sql
UPDATE users SET age = 21 WHERE id = 1;
```

注意事项：
- 忘写 `WHERE` 会更新整表。
- 更新前先用同条件 `SELECT` 预览影响范围。

### 知识点 7：删除数据
讲解：删除使用 `DELETE`，是按条件删行。

```sql
DELETE FROM users WHERE id = 1;
```

注意事项：
- `DELETE` 可回滚（在事务里），`DROP TABLE` 是删对象，风险更高。
- 有外键时可能触发级联删除。

### 知识点 8：最基本查询
讲解：查询主干是 `SELECT ... FROM ... WHERE ...`，先过滤，再返回列。

```sql
SELECT id, email FROM users WHERE age >= 18;
```

注意事项：
- 先少列少行，确认正确后再扩展。
- 初学阶段尽量避免上来就 `SELECT *`。

### 知识点 9：去重查询
讲解：`DISTINCT` 用来去掉重复行，常见于“统计有哪些值”。

```sql
SELECT DISTINCT dept_name FROM instructor;
```

注意事项：
- `DISTINCT` 作用于整行组合，不只针对单列。
- 去重会增加计算开销，大表上要谨慎。

### 知识点 10：表达式与别名
讲解：查询列可以是表达式，`AS` 用于输出名更可读。

```sql
SELECT id, salary * 1.1 AS new_salary FROM instructor;
```

注意事项：
- 别名建议语义化，方便后续排序和程序读取。
- 不同数据库对别名引用时机有差异，复杂语句要实测。

### 知识点 11：条件过滤与逻辑运算
讲解：`WHERE` 里常用比较运算符和 `AND/OR/NOT` 组合。

```sql
SELECT * FROM instructor
WHERE salary > 50000 AND dept_name = 'Biology';
```

注意事项：
- `AND` 优先级高于 `OR`，复杂条件加括号最安全。
- 先写“高选择性条件”有助于优化器利用索引。

### 知识点 12：模糊匹配与转义
讲解：`LIKE` 中 `%` 表示任意长度，`_` 表示单字符，特殊字符可用 `ESCAPE`。

```sql
SELECT * FROM instructor
WHERE name LIKE '%100\%%' ESCAPE '\';
```

注意事项：
- 以 `%` 开头的模式通常不走普通前缀索引。
- 需要匹配字面 `%` 或 `_` 时必须转义。

### 知识点 13：范围与集合过滤
讲解：连续区间常用 `BETWEEN`，离散集合常用 `IN`。

```sql
SELECT * FROM instructor WHERE salary BETWEEN 90000 AND 100000;
```

注意事项：
- `BETWEEN` 是闭区间，包含边界值。
- `IN` 列表过长时可改为临时表或子查询。

### 知识点 14：空值判断与三值逻辑
讲解：`NULL` 不是 0 也不是空串，比较结果可能是“未知”。

```sql
SELECT name FROM instructor WHERE salary IS NULL;
```

注意事项：
- 判断空值要用 `IS NULL` 或 `IS NOT NULL`。
- `NULL = NULL` 结果不是真，写条件时要特别小心。

### 知识点 15：排序
讲解：`ORDER BY` 控制输出顺序，可多列联合排序。

```sql
SELECT id, name, salary FROM instructor
ORDER BY name DESC, salary ASC;
```

注意事项：
- 不写 `ORDER BY` 时结果顺序不保证稳定。
- 大结果排序成本高，尽量先过滤再排序。

### 知识点 16：聚合函数
讲解：聚合用于“多行变一行”统计，如 `COUNT`、`SUM`、`AVG`。

```sql
SELECT COUNT(DISTINCT id) FROM teaches;
```

注意事项：
- 多数聚合忽略 `NULL`，`COUNT(*)` 不忽略行。
- 统计口径要写清楚，避免“行数”和“非空值数”混淆。

### 知识点 17：分组与分组后过滤
讲解：`GROUP BY` 先分组，`HAVING` 过滤分组结果。

```sql
SELECT dept_name, AVG(salary) AS avg_salary
FROM instructor
GROUP BY dept_name
HAVING AVG(salary) > 42000;
```

注意事项：
- `WHERE` 过滤行，`HAVING` 过滤组，不要混用。
- 选择列表中非聚合列一般应出现在 `GROUP BY` 中。

### 知识点 18：集合运算
讲解：`UNION` 求并集去重，`INTERSECT` 求交集，`EXCEPT` 求差集。

```sql
SELECT course_id FROM section WHERE semester = 'Fall' AND year = 2017
UNION
SELECT course_id FROM section WHERE semester = 'Spring' AND year = 2018;
```

注意事项：
- 参与集合运算的查询列数和类型要可兼容。
- 需要保留重复行时使用对应的 `ALL` 版本。

## 二、中级 SQL

### 知识点 19：`IN` 子查询与 `NOT IN`
讲解：`IN` 常用于“是否在子查询结果里”，表达集合归属关系。

```sql
SELECT DISTINCT course_id
FROM section
WHERE semester = 'Fall'
  AND year = 2017
  AND course_id IN (
    SELECT course_id
    FROM section
    WHERE semester = 'Spring' AND year = 2018
  );
```

注意事项：
- `NOT IN` 遇到子查询结果含 `NULL` 时容易出现“全不匹配”。
- 不确定空值行为时可优先用 `NOT EXISTS`。

### 知识点 20：`SOME` 与 `ALL`
讲解：用于“和子查询结果集合比较”，`> SOME` 表示大于其中至少一个，`> ALL` 表示大于全部。

```sql
SELECT name
FROM instructor
WHERE salary > ALL (
  SELECT salary
  FROM instructor
  WHERE dept_name = 'Biology'
);
```

注意事项：
- `> ALL` 常等价于“大于该集合最大值”。
- 子查询为空集时，`ALL` 与 `SOME` 的逻辑结果要单独验证。

### 知识点 21：`EXISTS` 与相关子查询
讲解：`EXISTS` 只看子查询是否有行，常用于“是否存在关联记录”。

```sql
SELECT course_id
FROM section AS s
WHERE semester = 'Fall'
  AND year = 2017
  AND EXISTS (
    SELECT 1
    FROM section AS t
    WHERE t.course_id = s.course_id
      AND t.semester = 'Spring'
      AND t.year = 2018
  );
```

注意事项：
- 相关子查询会引用外层表别名。
- `EXISTS` 子查询里通常写 `SELECT 1` 即可。

### 知识点 22：`NOT EXISTS` 表达“全包含”
讲解：很多“找出满足全部条件”的题，常用双重否定加差集思想。

```sql
SELECT s.id, s.name
FROM student AS s
WHERE NOT EXISTS (
  (SELECT course_id FROM course WHERE dept_name = 'Biology')
  EXCEPT
  (SELECT t.course_id FROM takes AS t WHERE t.id = s.id)
);
```

注意事项：
- 这是“除法查询”经典写法，考试和面试很常见。
- 先把业务语义翻译成“没有缺的那门课”，再写 SQL。

### 知识点 23：`FROM` 子查询
讲解：先在子查询里算中间结果，再在外层继续过滤。

```sql
SELECT dept_name, avg_salary
FROM (
  SELECT dept_name, AVG(salary) AS avg_salary
  FROM instructor
  GROUP BY dept_name
) AS dept_avg
WHERE avg_salary > 42000;
```

注意事项：
- 子查询结果必须有别名。
- 复杂统计建议拆层，便于调试和复用。

### 知识点 24：`WITH` 公共表达式
讲解：`WITH` 可以给中间结果命名，减少重复 SQL。

```sql
WITH dept_total AS (
  SELECT dept_name, SUM(salary) AS total_salary
  FROM instructor
  GROUP BY dept_name
)
SELECT dept_name
FROM dept_total
WHERE total_salary > (
  SELECT AVG(total_salary) FROM dept_total
);
```

注意事项：
- 一个查询可定义多个公共表达式。
- 逻辑清晰度通常比“全写在一条里”更高。

### 知识点 25：标量子查询
讲解：标量子查询应只返回一个值，可放在选择列或条件中。

```sql
SELECT d.dept_name,
       (SELECT COUNT(*) FROM instructor i WHERE i.dept_name = d.dept_name) AS num_instructors
FROM department d;
```

注意事项：
- 返回多行会报错。
- 先单独执行子查询，确认是一行一值再嵌入。

### 知识点 26：`CASE` 条件表达式
讲解：`CASE` 可在同一条语句里做条件分支。

```sql
UPDATE instructor
SET salary = CASE
  WHEN salary <= 100000 THEN salary * 1.05
  ELSE salary * 1.03
END;
```

注意事项：
- `CASE` 是表达式，不是流程语句。
- 分支最好覆盖全部情况，避免出现意外空值。

### 知识点 27：内连接
讲解：内连接返回两表满足连接条件的交集数据。

```sql
SELECT c.course_id, p.prereq_id
FROM course c
INNER JOIN prereq p ON c.course_id = p.course_id;
```

注意事项：
- 连接条件写错会出现“行数爆炸”。
- 多表连接时要统一别名规范。

### 知识点 28：外连接
讲解：左外连接保留左表全部行，右外连接保留右表全部行，全外连接保留两边全部行。

```sql
SELECT c.course_id, p.prereq_id
FROM course c
LEFT OUTER JOIN prereq p ON c.course_id = p.course_id;
```

注意事项：
- 外连接产生的补空值行要用 `IS NULL` 识别。
- 外连接后再加过滤条件时，注意别把外连接“写成内连接”。

### 知识点 29：视图
讲解：视图是“保存的查询”，可用于简化复杂查询和权限隔离。

```sql
CREATE VIEW faculty AS
SELECT id, name, dept_name
FROM instructor;
```

注意事项：
- 复杂视图不一定可更新。
- 视图依赖底层表结构，改表可能影响视图。

### 知识点 30：事务控制
讲解：事务用于保证一组操作“要么全成，要么全撤销”。

```sql
START TRANSACTION;
UPDATE accounts SET balance = balance - 100 WHERE account_id = 1;
UPDATE accounts SET balance = balance + 100 WHERE account_id = 2;
COMMIT;
```

注意事项：
- 失败时应 `ROLLBACK`。
- 金额类业务必须放在事务里处理。

### 知识点 31：外键级联动作
讲解：外键可配置删除或更新父记录时对子记录的联动行为。

```sql
CREATE TABLE course (
  course_id VARCHAR(10) PRIMARY KEY,
  dept_name VARCHAR(20),
  FOREIGN KEY (dept_name)
    REFERENCES department(dept_name)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);
```

注意事项：
- `CASCADE` 会自动联动删除或更新，风险高但省事。
- 还可选 `SET NULL`、`SET DEFAULT`，要与业务一致。

### 知识点 32：索引
讲解：索引提升检索速度，本质是“空间换时间”。

```sql
CREATE INDEX student_dept_idx ON student(dept_name);
```

注意事项：
- 索引不是越多越好，会拖慢写入。
- 优先给高频过滤列、连接列建索引。

### 知识点 33：权限授予与回收
讲解：最小权限原则是数据库安全基础。

```sql
GRANT SELECT, INSERT ON instructor TO user1;
```

注意事项：
- `WITH GRANT OPTION` 允许被授权者继续授权，需谨慎。
- 回收权限可用 `REVOKE`，并关注级联影响。

### 知识点 34：角色管理
讲解：角色是权限集合，先给角色授权，再把角色授给用户，管理更清晰。

```sql
CREATE ROLE teaching_assistant;
```

注意事项：
- 角色适合批量管理同类账号。
- 角色继承关系要定期审计，避免权限膨胀。

## 三、高级 SQL

### 知识点 35：用户自定义函数
讲解：把可复用计算逻辑封装为函数，查询时直接调用。

```sql
SELECT dept_name, budget
FROM department
WHERE dept_count(dept_name) > 12;
```

注意事项：
- 函数逻辑要保持确定性，避免副作用。
- 高频调用函数要关注性能。

### 知识点 36：存储过程调用
讲解：存储过程适合封装流程性数据库逻辑。

```sql
CALL dept_count_proc('Physics', @d_count);
```

注意事项：
- 输入输出参数类型要与过程定义一致。
- 复杂业务要补充异常处理与事务控制。

### 知识点 37：触发器
讲解：触发器在插入、更新、删除前后自动触发，可做审计和校验。

```sql
CREATE TRIGGER trg_before_insert_order
BEFORE INSERT ON orders
FOR EACH ROW
SET NEW.created_at = CURRENT_TIMESTAMP;
```

注意事项：
- 触发器过多会让链路难以排错。
- 避免在触发器里写重计算和复杂循环。

### 知识点 38：递归查询
讲解：递归公共表达式可处理层级关系与传递闭包问题。

```sql
WITH RECURSIVE rec_prereq(course_id, prereq_id) AS (
  SELECT course_id, prereq_id
  FROM prereq
  UNION
  SELECT r.course_id, p.prereq_id
  FROM rec_prereq r
  JOIN prereq p ON r.prereq_id = p.course_id
)
SELECT *
FROM rec_prereq;
```

注意事项：
- 递归必须有收敛条件，避免无限展开。
- 数据有环时要考虑去重或层级限制。

### 知识点 39：排名窗口函数
讲解：窗口函数可在不丢失明细行的前提下做分组排名。

```sql
SELECT id,
       dept_name,
       RANK() OVER (PARTITION BY dept_name ORDER BY gpa DESC) AS dept_rank
FROM grades;
```

注意事项：
- `RANK()` 会跳号，`DENSE_RANK()` 不跳号。
- `PARTITION BY` 决定分组范围，`ORDER BY` 决定排名规则。

### 知识点 40：滑动窗口统计
讲解：窗口帧可做移动平均、累计和等时间序列分析。

```sql
SELECT date,
       SUM(value) OVER (
         ORDER BY date
         ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING
       ) AS moving_sum
FROM sales;
```

注意事项：
- `ROWS` 按行数定义窗口，`RANGE` 按值范围定义窗口。
- 时间字段格式要统一，否则排序和窗口边界会错。

## 四、安全与工程实践

### 知识点 41：参数化查询与注入防护
讲解：绝不要用字符串拼接 SQL，必须使用参数化占位符。

```sql
SELECT id, name
FROM users
WHERE username = ? AND password = ?;
```

注意事项：
- 参数化可以避免把输入当成 SQL 语法执行。
- 登录、检索、修改接口都要统一使用参数绑定。

## 五、复习顺序与自测

### 建议复习顺序
1. 先复习基础查询、过滤、排序、聚合。
2. 再复习连接、子查询、集合运算。
3. 最后复习事务、权限、窗口函数与安全。

### 自测清单
- [ ] 我能独立写出 `SELECT ... FROM ... WHERE ...`。
- [ ] 我能解释 `WHERE`、`GROUP BY`、`HAVING` 的区别。
- [ ] 我能区分内连接和外连接，并说明空值来源。
- [ ] 我能用 `EXISTS` 或 `NOT EXISTS` 解“存在性”问题。
- [ ] 我能用事务保证转账类操作的一致性。
- [ ] 我知道为什么参数化查询能防注入。
