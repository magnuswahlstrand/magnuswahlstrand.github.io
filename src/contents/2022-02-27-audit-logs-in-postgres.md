---
title: "Audit tables in Postgres"
slug: 2022-02-27-audit-logs-in-postgres
datetime: 2022-02-27 
tags: ["postgres", "cdc"]
--- 

A while back I watched [this video](https://www.youtube.com/watch?v=j6ow-UemzBc) (summary [here](https://www.infoq.com/news/2018/07/bryzek-microservice-architecture/)) with Michael Bryzek (Flow.io, Gilt). He presented how they do [Change Data Capture](https://en.wikipedia.org/wiki/Change_data_capture) (CDC) with PostgreSQL and DynamoDB. One goal with CDC is that changes to databases rows and tables can be propagated to other parts of the system. In microservices systems, this can be used to build read-projections, or just keep local caches of data. 

[Postgres](https://www.postgresql.org/) is one of my favorite databases to work with in production (and probably the one I most experience with), but I have little or experience working features such as PostgreSQL triggers and stored procedures. In this blog post, I explore how to use triggers to create a simple audit table in Postgres.

<!--more-->

#### Why do you need an audit table?

* Customer support might need the information to answer customer support requests. They might need to answer questions such as **why** their data is in the current state, and **when** it was changed and by **whom**.
  was updated.
* You (the engineer) might want to answer the same questions when debugging 😉
* You can use the audit table to build more complex functionality, such as propagating changes to other parts of the system.

Let's get started!

### The tables

Let us say that the user profiles are stored in the `profile` table.

```sql
CREATE TABLE profile
(
    id         INT GENERATED ALWAYS AS IDENTITY,
    name       VARCHAR(40) NOT NULL,
    email      VARCHAR(40) NOT NULL,
    PRIMARY KEY (id)
);
```

We also set up the `profile_audits`.

```sql
CREATE TABLE profile_audits
(
    id         INT GENERATED ALWAYS AS IDENTITY,
    operation  VARCHAR(40)  NOT NULL,
    row        jsonb        NOT NULL,
    changed_on TIMESTAMP(6) NOT NULL
);
```

***Note:** Our `profile_audits` can contain any columns we want. I chose a single `row` column to store the full changed row because 1) it is easy 2) we don't have to worry about schema changes to the `profile` table.*

### Linking the two tables

The goal is to be able to track changes to the `profile` table, and store them in `profile_audit`. For this we need

1. A [postgres trigger](https://www.postgresql.org/docs/9.1/sql-createtrigger.html) that listen to changes to
   the `profile` table. From the documentation:

> CREATE TRIGGER creates a new trigger. The trigger will be associated with the specified table or view and will execute the specified function function_name when certain events occur.

2. We also need a  [postgres function](https://www.postgresql.org/docs/9.5/sql-createfunction.html) to called by the
   trigger.

First, let's define the function:

```sql
CREATE OR REPLACE FUNCTION log_profile_changes()
    RETURNS TRIGGER
    LANGUAGE PLPGSQL
AS
$$
BEGIN
    RAISE EXCEPTION 'not implemented :-)'
END;
$$
```

The function will just raise an exception, for now.

Next we set up our trigger. The following makes sure `log_profile_changes` is called on `INSERTS` and `UPDATES` to
the `profile` table.

```sql
CREATE TRIGGER profile_changes
    BEFORE INSERT OR UPDATE
    ON profile
    FOR EACH ROW
EXECUTE PROCEDURE log_profile_changes();
```

We can try our trigger by doing an insert to the `profile` table.

```sql
INSERT INTO profile (name, email) VALUES ('Magnus', 'magnus@gmail.com');
```

This results in:
> [P0001] ERROR: not implemented :-) Where: PL/pgSQL function log_profile_changes() line 3 at RAISE

Success! This is the exception `not implemented :-)` from our function.

Now we know that the basic setup works as expected, we can update our function to make inserts to the audit table. We
have access to several variables inside the trigger. We are interested in `NEW` and `TG_OP`. *Complete list of variables [here](https://www.postgresql.org/docs/9.1/plpgsql-trigger.html).*

- **NEW** - Data type RECORD; variable holding the new database row for INSERT/UPDATE operations in row-level triggers.
  This variable is NULL in statement-level triggers and for DELETE operations.
- **TG_OP** - Data type text; a string of INSERT, UPDATE, DELETE, or TRUNCATE telling for which operation the trigger
  was fired.

The new function:

```sql
CREATE OR REPLACE FUNCTION log_profile_changes()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS
$$
BEGIN

    IF (TG_OP = 'INSERT') OR (TG_OP = 'UPDATE') THEN
        INSERT INTO profile_audits(operation, row, changed_on)
        VALUES (TG_OP, to_jsonb(NEW), now());
    END IF;

    RETURN NEW;
END ;
$$
```

### Testing everything

We can test our trigger with an insert and an update.

```psql
INSERT INTO profile (name, email) VALUES ('Magnus', 'magnus@gmail.com');
UPDATE profile SET email = 'magnus2@gmail.com' WHERE name = 'Magnus';
```

**Result 1**

```psql
SELECT * FROM profile
```

| id | name | email |
| :--- | :--- | :--- |
| 4 | Magnus | magnus2@gmail.com |

**Result 2**

```psql
SELECT * FROM profile_audits
```

| id | operation | row | changed\_on |
| :--- | :--- | :--- | :--- |
| 1 | INSERT | {"id": 4, "name": "Magnus", "email": "magnus@gmail.com"} | 2022-02-28 07:39:36.313046 |
| 2 | UPDATE | {"id": 4, "name": "Magnus", "email": "magnus2@gmail.com"} | 2022-02-28 07:40:07.678714 |

Looks good!

## Conclusion

Triggers are a simple way of creating audit tables when using PostgreSQL. There are a few pros and cons worth mentioning.

#### ✅ Pros
* Makes troubleshooting easy, since all changes are tracked
* Uses built-in postgres functionality - meaning we don't have to reimplement the same logic in the application code.

#### ❌ Cons
* Moving application logic to the database CAN quite quickly become very messy. See some good comments on stored procedures [here](https://softwareengineering.stackexchange.com/a/66084). If an engineering organization wants to use these approaches, care should be take to discuss the pros and cons and common pitfalls.
* Increased insert latency, and storage because `profile_audits` also needs to be populated. 
* Increased disk usage and costs

#### Possible next steps

* In an event based system, the `profile_audits` can be used as a building block to periodically send out change events, like `ProfileCreated`, `ProfileUpdated`, `ProfileDeleted`.

* We could also add more audit information, what caused the change to happen and whom. It would be interesting to distinguish whether an administrator or the user themselves updated it, for example. In an event based system, tracking the **event id** which caused the change might also be interesting. 

## Resources


* [Design Microservice Architectures the Right Way](https://www.youtube.com/watch?v=j6ow-UemzBc) - Michael Bryzek
* [Summary](https://www.infoq.com/news/2018/07/bryzek-microservice-architecture/) of the video above
* [datacater.io: PostgreSQL Change Data Capture (CDC)](https://datacater.io/blog/2021-09-02/postgresql-cdc-complete-guide.html)
* [Built-in audit function in Postgres](https://wiki.postgresql.org/wiki/Audit_trigger_91plus) 
