---
title: "ACID transactions"
slug: 2021-03-12-acid-transactions
datetime: 2021-03-12
tags: ["db", "postgres", "theory"]
--- 

The last few days, I've been down the rabbit hole of learning more about Postgres and databases in general. Here are a few things I have explored, along with useful resources. Let's start with the basics.
<!--more-->

## ACID transactions

**ACID** stands for **atomicity**, **consistency**, **isolation** and **durability**. In my experience **atomicity** and **isolation** are the most interesting for modern application development, but let's cover all of them.


### Atomicity 
[Atomicity](https://en.wikipedia.org/wiki/Atomicity_(database_systems)) means that transactions consisting of multiple statements should succeed or fail completely. Martin Kleppman ([YouTube](https://www.youtube.com/watch?v=5ZjhNTM8XU8)) suggested the alternative term "Abortability", that I think is a bit more clear.

Take an example in Postgres, where **atomicity** is typically achieved using `BEGIN TRANSACTIONS` and `COMMIT TRANSACTIONS`. Let's say we have two tables, one with users and one with user related events. We want to guarantee that both rows are inserted, or none of them.

```sql
CREATE TABLE users(id INT UNIQUE);
CREATE TABLE users_events(type TEXT);

BEGIN; -- Begin transaction
INSERT INTO users_events VALUES ('user 1 created');
INSERT INTO users VALUES (1);
COMMIT; -- Commit both statements to the database
```

Now, if we get an error half way (maybe the database connection timed out, or in the case below there is already a user with the same ID). We use `ROLLBACK` to abort the transaction.
```sql
BEGIN; -- Begin transaction
INSERT INTO users_events VALUES ('user 1 created again');
INSERT INTO users VALUES (1); -- ERROR: duplicate key value violates unique constraint "users_id_key"
ROLLBACK; -- Abort the transaction and both statements
```
And so we have an atomic transaction!

### Consistency
[Consistency](https://en.wikipedia.org/wiki/Consistency_(database_systems)) means that the database should be in a valid state, before and after a transaction. What does valid mean? It means that it is _consistent_ to whatever rules have been defined.
Good examples includes constraints for table rows, such as `UNIQUE` and `NOT NULL` in Postgres. 

For example:

```postgresql
CREATE TABLE customers(
    ID bigint UNIQUE,
    email TEXT NOT NULL
);
```

Given the following table definition, our database would be _inconsistent_ if we found the following database rows:

*Violation the UNIQUE constraint*
```bash
SELECT * FROM customers;

 id |      email
----+-----------------
  1 | hedvor@mail.com
  1 | john@mail.com
```

*Violation of the NOT NULL constraint*
```bash
SELECT * FROM customers;

 id |      email
----+-----------------
  1 | hedvor@mail.com
  2 |
```

In my experience, keeping your database consistent isn't really a problem for the application developer, but for the database itself. The responsibility split is as follows 

1. **Developer:** Defining the rules (uniqueness, [postgres triggers](https://www.postgresql.org/docs/9.2/plpgsql-trigger.html), ...)
2. **Database:** Ensuring database consistency, according to those rules (consistency).

Most modern databases handle consistency well. In Postgres, for example, uniqueness violations will be rejected with: `[23505] ERROR: duplicate key value violates unique constraint`.

### Isolation
Transactions are often run in parallel. [Isolation](https://en.wikipedia.org/wiki/Isolation_(database_systems)) means that even though transactions are run in parallel, the end result should be same as if the transaction run in series. 

Using full serialization in a database comes with a performance cost, and most transactions do not need full serialization. Instead it is common to be able to choose isolation level when performing a transaction. 

Here are three common isolation levels:
* **Serializable** - This is the highest level of isolation, it means that parts of parallel transactions that could interfer with each other will run in series. The _could_ be achieved by just locking the whole database, but typically the database is smart enough just lock the rows that are being read or written to by other ongoing transactions.
* **Read commited** - The default (and lowest) isolation level for Postgres databases. Read commited means that if there are parallel transactions, the data written will not be visible until the transaction is commited.
* **Read uncommited** - Even if a transaction is not commit yet, other transactions can read it. This problem is called a [dirty read](https://en.wikipedia.org/wiki/Isolation_(database_systems)#Dirty_reads). This isolation level is not available in Postgres.

[This article](https://pgdash.io/blog/postgres-transactions.html) by pgDash is very good at explaining these concepts. 

### Durability
The last concept in the quartet is [durability](https://en.wikipedia.org/wiki/Durability_(database_systems)). This means that once the database reports a transaction as successful, the transaction is guaranteed not to be lost, even in the case of a hardware fault, or a crash in the database. Guaranteeing durability is also a problem to be solved by the database, not by the application developer. One common approach by databases to solve this is to use [write-head logging](https://en.wikipedia.org/wiki/Write-ahead_logging).

## Conclusion
* In my experience, **atomicity** and **isolation** are the two concepts you usually have to worry about as an application developer, while **consistency** and **durability** usually working out of the box.
* The concept of **ACID** transactions is useful, not only when working with databases, but also when designing systems, especially distributed systems.

### Resources
* [YouTube: Transactions: myths, surprises and opportunities](https://www.youtube.com/watch?v=5ZjhNTM8XU8) by Martin Kleppmann
* [Transaction Isolation](https://pgdash.io/blog/postgres-transactions.html) at pgDash
