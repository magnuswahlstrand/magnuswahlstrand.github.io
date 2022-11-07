---
title: "SQLALchemy: One to many-relationships"
slug: 2022-03-07-one-to-many
datetime: 2022-03-07
tags: ["python","sqlalchemy", "postgres"]
--- 

When learning a new tech stack, the database layer is usually one of the harder and the most fun activities. In my current project, our services are written in Python, and most of them use PostgreSQL for storage. 
For Python, the most commonly used SQL library is [SQLAlchemy](https://www.sqlalchemy.org/). It is usually used as an Object–relational mapping ([ORM](https://en.wikipedia.org/wiki/Object%E2%80%93relational_mapping)). While I have used Python in the past, I haven't used either SQLAlchemy or ORMs very much in production. In this article, I will explore how to model relationships in SQLAlchemy.

<!--more-->

***Note**: Much of what I will cover is already covered by the SQLAlchemy documentation on [basic relationships](https://docs.sqlalchemy.org/en/14/orm/basic_relationships.html#one-to-one). Post is mainly for my own understanding.*

### One to many
A one to many-relationship in SQL means that a row in one table is linked to zero or more rows in another table. For example:
*One company (in the **companies** table) could have three employees (in the **employees** table)*. 

Some things I expect from a one to many-relationship.
* A parent object can be created without any children.
* A parent object can be created WITH children (in the same transaction).
* Child objects can be added independently of the parent, but can be linked to the parent when it is retrieved.
* If the parent object is deleted, the child objects could also be removed. 

Let's get started.

#### Tables
```python
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


class Company(Base):
    __tablename__ = 'companies'
    id = Column(Integer, primary_key=True)
    employees = relationship("Employee")


class Employee(Base):
    __tablename__ = 'employees'
    id = Column(Integer, primary_key=True)
    name = Column(String)
    company_id = Column(Integer, ForeignKey('companies.id'))
```
We have two models `Company` and `Employee`. They have a one to many-relationship. 

The following code inserts a company with two employees. The `relationship("Employee")` on the `Company` model ensure that the **employee**-table will be updated as well.
```python
with Session.begin() as session:
    company = Company()
    company.employees = [
        Employee(name='Magnus'),
        Employee(name='John')
    ]
    session.add(company)
```

#### Result
**company**-table

| id |
| :--- |
| 1 |

**employees**-table

| id | name | company\_id |
| :--- | :--- | :--- |
| 1 | Magnus | 1 |
| 2 | John | 1 |


### Cascading deletes 

If we are a ruthless manager, we can also do updates like firing all our employees (managers are stored in a separate table).

```py
with Session.begin() as session:
    company = session.query(Company).get(1)
    company.employees = []
```

Unfortunately, the ruthless manager's upper management can still see the traces of the employees in the dabase.

**employees**-table

| id | name | company\_id |
| :--- | :--- | :--- |
| 1 | Magnus | NULL |
| 2 | John | NULL |

If we want that these entries should be removed from that table when they are removed from the parent table, we need to change the `relationship()`

```diff
  class Company(Base):
      __tablename__ = 'companies'
      id = Column(Integer, primary_key=True)
--    employees = relationship("Employee")
++    employees = relationship("Employee", cascade="all, delete-orphan")
```

Now, if we run our code again, everything looks nice and clean.

**employees**-table

| id | name | company\_id |
| :--- | :--- | :--- |

***Note:** The employees will be deleted any time the association between them and a company is lost, i.e. also if the company row itself is deleted.*

### Back propagation
The last requirement from the list is back propagation. If a child entity is added to its table, will it be visible when the parent is queried?

```python
with Session.begin() as session:
    session.add(Employee(name='Lisa', company_id=1))
    
with Session.begin() as session:
    company = session.query(Company).get(1)
    print(f"Company {company.id} has the following employees:")
    for e in company.employees:
        print("-", e.name)
```
**Output**

```sh
Company 1 has the following employees:
- Magnus
- John
- Lisa
```

### Relationship loading techniques

In SQLAlchemy there are a few gotchas around how relationships are loaded. While I think in many scenarios should avoid complicated relationship updating technique (and if needed, should be covered by tests), it is worth knowing some things about it.
#### Example 1: Lazy loading (default)
In the scope of a single session, we can perform both the insert, and the listing of employees. This will work, because the `company.employees` is actually loaded lazily when it is first used.
```python
with Session.begin() as session:
    session.add(Employee(name='Lisa', company_id=1))

    company = session.query(Company).get(1)
    print(f"Company {company.id} has the following employees:")
    for e in company.employees: # 
        print("-", e.name)
```
This can be observed by setting `echo=True` on the engine, like so `engine = create_engine(url, echo=True)`, and running the script again.

```diff
Company 1 has the following employees:
+2022-04-03 15:35:45,680 INFO sqlalchemy.engine.Engine SELECT employees.id AS employees_id, employees.name AS employees_name, employees.company_id AS employees_company_id
+FROM employees
+WHERE %(param_1)s = employees.company_id
+2022-04-03 15:35:45,680 INFO sqlalchemy.engine.Engine [generated in 0.00021s] {'param_1': 1}
\- Magnus
\- John
\- Lisa
```
As you can see, SQLAlchemy will do an additional trip to the DB when looking up the company employees. In fact, `company.employees` will only be loaded **once per session**. 

We can observe this by adding another employee after the first fetch employees is done:

```python
with Session.begin() as session:
    # Add an employee
    session.add(Employee(name='Lisa', company_id=1))

    company = session.query(Company).get(1)
    print(f"Company {company.id} has {len(company.employees)} employees")

    # Add another employee
    session.add(Employee(name='Lisa\'s friend', company_id=1))

    company = session.query(Company).get(1)
    print(f"Company {company.id} has {len(company.employees)} employees")
```

**Output**

```sh
Company 1 has 3 employees
Company 1 has 3 employees
```

#### Example 2: Eager loading
We can run in to the same problem even earlier if we enable eager loading. Then SQL alchemy will load the relationship data directly when the parent is queried for, even if it is not used.
This is typically done by the option lazy='joined'. 
```diff
class Company(Base):
    __tablename__ = 'companies'
    id = Column(Integer, primary_key=True)
-    employees = relationship("Employee", cascade="all, delete-orphan")
+    employees = relationship("Employee", cascade="all, delete-orphan", lazy='joined')
```

```python
with Session.begin() as session:
    company = session.query(Company).get(1) # Child data will be loaded here
    session.add(Employee(name='Lisa', company_id=1))

    print(f"Company {company.id} has {len(company.employees)} employees")

    # Add another employee
    session.add(Employee(name='Lisa\'s friend', company_id=1))
    
    print(f"Company {company.id} has {len(company.employees)} employees")
```

**Output**

```sh
Company 1 has 2 employees
Company 1 has 2 employees
```

### So what can we do? 
Both of these scenarios are unintuitive for me, and can certainly lead to bugs. SQLAlchemy has a few possible ways of handling proper back-propagation using [backref](https://docs.sqlalchemy.org/en/14/orm/backref.html). Exactly how `backref` works is also not intuitive, so I do not recommend using it without having a good understanding of SQLAlchemy.
* ✅ Keep relationships as simple as possible
* ✅ Trying to stay away from mutating state of many entities at the same time, if possible.
* ✅ Write good database or integration tests

Good luck 🙃!

## Conclusion
We have fulfilled our initial expectations for the one-to-many relationships.
    
* ~~A parent object can be created without any children.~~
* ~~A parent object can be created WITH children (in the same transaction).~~
* ~~Child objects can be added independently of the parent, but can be linked to the parent when it is retrieved.~~
* ~~If the parent object is deleted, the child objects could also be removed.~~
    
 
Working with SQLAlchemy is initially quite straightforward, and fun. The library is very powerful and versatile. You can pretty much do anything you want, and there are many things that can be fined tuned. The post above is just a tiny, tiny fraction of what can be done. 

### ✅ Pros
* **Easy to get started with**
* **Highly configurable** - The post above is just a tiny, tiny fraction of what can be done.
* **[Excellent documentation](https://docs.sqlalchemy.org/en/14/)**

### ❌ Cons
* **Highly configurable** - If you plan to introduce SQLAlchemy in your organisation, you should think about knowledge sharing, and creating some common practices that can be used across the engineering organisation.
* **Steep learning curve** - Related to the point above

### 〰️ Both
* **You don't need to understand SQL to use an ORM** - This means that you can build some very advanced entity relationships, without understanding the finer details of how the databases work internally. This can (in my experience) lead to both performance problems, and some really weird bugs due to complexity 😀

### Possible next steps

* Many to many-relationships 
* More details on the SQLAlchemy session

## Resources
* [SQLAlchemy: backref](https://docs.sqlalchemy.org/en/14/orm/backref.html)
* [SQLAlchemy: basic relationship patterns](https://docs.sqlalchemy.org/en/14/orm/basic_relationships.html#one-to-one) - 
