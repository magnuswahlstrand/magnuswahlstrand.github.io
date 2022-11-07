---
title: Tiny fullstack app
subtitle: React, Go and MongoDB
slug: 2022-04-15-react-fiber-mongo
datetime: 2022-04-15
tags: ["go", "react", "react-query","mongodb","fiber"]
---

In this post I will build a simple app using a combination of tools and libraries that I'm exploring.
* **React** ([React-Query](https://react-query.tanstack.com/), [Mantine](https://mantine.dev/) for UI)
* **Go** ([Fiber](https://github.com/gofiber/fiber) for routing, [Qmgo](https://github.com/qiniu/qmgo) db-driver)
* **MongoDB**

The goal is to create a simple User List with basic filtering:

![Search](/img/react-fiber-mongo/search.gif)

<!--more-->
<br><br>

## Overview

Here is the setup we are after, a simple Reac t app, that calls a Go-app that reads from our MongoDB.
![Search](/img/react-fiber-mongo/fullstack.png)

## Backend
I am using [Fiber](https://github.com/gofiber/fiber) for routing. It is web framework for Go, inspired by Express and designed for fast development.

We have two endpoints in this app
* **GET /users?q=TEXT** - list all users
  * _use query parameter **q** to search any field (only full words)_
* **POST /users** - create a new user

### The basics - main.go

The **Service** exposes two HTTP-handlers `ListUsers` and `AddUsers`, and wraps the `mongo`-client for easy access in the DB-methods.

```go
type Service struct {
    mongo *qmgo.QmgoClient
}
```

We set up our `mongo`-client to talk to MongoDB on localhost.
```go
var mongoConfig = &qmgo.Config{
	Uri:      "mongodb://localhost:27017",
	Database: "user-db",
	Coll:     "users",
}

func mongoClient() *qmgo.QmgoClient {
	mongo, err := qmgo.Open(context.Background(), mongoConfig)
	if err != nil {
		log.Fatalln(mongo)
	}
	return mongo
}
```

We create the `mongo` client, and create a new Fiber-router. The router has a CORS-middleware and our two handlers, and listens on port `:8080`. 
```go
func main() {
	mongo := mongoClient()

	s := Service{
		mongo: mongo,
	}

	app := fiber.New()
	app.Use(cors.New(cors.Config{AllowOrigins: "http://localhost:3000"}))
	app.Get("/users", s.ListUsers)
	app.Post("/users", s.AddUser)

	log.Fatal(app.Listen(":8080"))
}
```

### The handlers

**List users handler** - A very slim handler. Either returns a list of users, or an error. 

```go
type ListUsersResponse struct {
    Users []User `json:"users"`
}

func (s *Service) ListUsers(c *fiber.Ctx) error {
  query := c.Query("q", "")
  users, err := s.listDBUsers(c.Context(), query)
  if err != nil {
	  return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": err.Error()})
  }
  
  return c.JSON(ListUsersResponse{users})
}
```

**Add user handler** - Parses the user request calls the database layer for insertion. 

```go
func (s *Service) AddUser(c *fiber.Ctx) error {
  var user User
  if err := c.BodyParser(&user); err != nil {
    return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": err.Error()})
  }
  
  ID, err := s.insertDBUser(c.Context(), user)
  if err != nil {
    return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": err.Error()})
  }
  user.ID = ID
  
  return c.JSON(user)
}
```

_**Note**: Fiber supports request validation (required fields, min length, etc.), but I skipped it here for brevity._

### The DB layer

**List users** - To list users, we call use the basic `find()` of Mongo. If query is empty, we will list all users, and if query is _not_ empty we will perform a full text search on all fields. For this, we use a [Mongo text index](https://www.mongodb.com/docs/manual/core/index-text/#wildcard-text-indexes). It matches only complete words. 

```go
func (s *Service) listDBUsers(ctx context.Context, query string) ([]User, error) {
  filter := bson.M{}
  if query != "" {
    filter = bson.M{"$text": bson.M{"$search": query}}
  }
  users := []User{}
  if err := s.mongo.Find(ctx, filter).All(&users); err != nil {
    return nil, err
  }
  return users, nil
}
```

**Add a user** - We insert name, email and phone number of a user. MongoDB adds an ID automatically. 

```go
func (s *Service) insertDBUser(ctx context.Context, u User) (string, error) {
  res, err := s.mongo.InsertOne(ctx, bson.M{
    "name":  u.Name,
    "email": u.Email,
    "phone": u.Phone,
  })
  if err != nil {
    return "", err
  }
  return res.InsertedID.(primitive.ObjectID).String(), err
}
```

_**Note**: We could also add uniqueness checks on email and phone number, by adding [unique indexes](https://www.mongodb.com/docs/manual/core/index-unique)_

## Frontend

The frontend is bootstrapped using [Create React App (CRA)](https://create-react-app.dev/).
```
npx create-react-app frontend --template typescript
```

We install our dependencies:

```
npm install @mantine/hooks @mantine/core react-query axios tabler-icons-react
```


* [React-Query](https://react-query.tanstack.com/) to handle async HTTP requests with the `useQuery` hook 
* [Axios](https://axios-http.com/docs/intro) HTTP client
* [Mantine](https://mantine.dev/) for UI
* [Tabler-Icons-React](tabler-icons-react) for our search icon

### The Components

**App.tsx** - Uses the Mantine `Container` element for layout. React-Query's `QueryClientProvider` gives the child elements access to the useQuery hook.

```typescript jsx
import React from 'react';
import './App.css';
import {Container} from '@mantine/core';
import {UserTable} from "./components/UserTable";
import {QueryClient, QueryClientProvider} from "react-query";


const queryClient = new QueryClient()

function App() {
    return (
        <Container size="xs" px="xs">
            <QueryClientProvider client={queryClient}>
                <UserTable/>
            </QueryClientProvider>
        </Container>
    )
}

export default App;
```

**hooks/useUsers.ts** - We have a simple custom React hook. It controls the search value in the search field, and returns `data` if we have gotten any from the backend. For now, we ignore error handling, and showing a different view during initial fetch.

```typescript
function useUsers() {
    const [searchValue, setSearchValue] = useState('');

    // Only search if term is more than 3 characters
    const cappedSearchValue = searchValue.length >= 3 ? searchValue : null

    const query = async () => {
        const url = "http://localhost:8080/users"
        const params = cappedSearchValue ? {params: {q: searchValue}} : {params: {}}

        const {data} = await axios.get(url, params)
        return data.users
    }
    const {isLoading, error, data, isFetching} = useQuery(["user data", cappedSearchValue], query);

    return {users: data ? data : [], searchValue, setSearchValue};
}
```

**components/UserSearch.tsx** - A simple input field, used for setting the `q`-parameter in requests to the backend. 

```typescript jsx
type SearchProps = {
  value: string
  setValue: (s: string) => void
}

export const UserSearch = ({value, setValue}: SearchProps) => {

  return (
          <TextInput
                  value={value}
                  placeholder="ID, E-mail or Phone"
                  icon={<Search size={14}/>}
                  onChange={(event) => setValue(event.currentTarget.value)}
                  style={SearchStyle}
          />
  )
}
```

**components/UserTable.tsx** - Consists of two parts, a `UserSearch`-component and a simple table to show the results.

```typescript jsx
export const UserTable = () => {
  const {users, searchValue, setSearchValue} = useUsers();

  const rows = users.map((user: User) => (
          <tr key={user.id}>
            <td style={{ whiteSpace: 'nowrap' }}>{user.id.slice(-6)}</td>
            <td style={{ whiteSpace: 'nowrap' }}>{user.name}</td>
            <td style={{ whiteSpace: 'nowrap' }}>{user.phone}</td>
            <td style={{ whiteSpace: 'nowrap' }}>{user.email}</td>
          </tr>
  ));

  return (
    <>
      <UserSearch value={searchValue} setValue={setSearchValue}/>
      <Table highlightOnHover striped style={TableStyle}>
        <thead>
        <tr>
          <th>Short&nbsp;ID</th>
          <th>Name</th>
          <th>Phone</th>
          <th>E-mail</th>
        </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
    </>
  );
}
```

## The result

Now that we have everything in place, we can start all our applications:

**MongoDB**
```sh
docker run --name some-mongo -p 27017:27017 mongo
```

**Generate fake data**
```sh
(cd backend; go test -v -run Test_GenerateFakeData)
```

**Start backend**
```sh
(cd backend; go run .)
```

**Start frontend (separate terminal)**
```sh
(cd frontend; npm start)
```

Go to [localhost:3000](http://localhost:3000) and you should see the following:

![Search](/img/react-fiber-mongo/search.gif)

## Takeaways

We have written a simple fullstack app in React and Go, with MongoDB as storage. All parts of this app was really fun to work with.

**react-query** is a neat library for handling asynchronous data loading. 

**fiber** is a convenient web framework for Go, that is a good replacement for [go-chi](https://github.com/go-chi/chi) that I normally use.

**qmgo** is slightly easier to use than the official [mongo driver](https://github.com/mongodb/mongo-go-driver). It seems to be somewhat limited in what it can do though. I didn't find a way of setting up a `text` index using `qmgo`, for example.

**MongoDB** - a very convenient document database that might become my go to DB for smaller projects.

### Possible improvements

* **Add pagination** to the user list.
* **Input validation** - Fiber has good supports for [input validation](https://docs.gofiber.io/guide/validation).
* Proper **shutdown procedure** of Mongo client and the Fiber router
* **Uniqueness checks** on e-mail, phone...
* **Debounce the search field queries** - We should until the user input has stopped, and then another few 100 ms before issuing the query.

<br><br>
## Over and out!
<br>
