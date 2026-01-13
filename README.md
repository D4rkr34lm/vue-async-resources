# vue-async-resources

A batteries-included Vue 3 plugin for managing stateful asynchronous resources with built-in caching, optimistic updates, and dependency management.

[![npm version](https://badge.fury.io/js/vue-async-resources.svg)](https://www.npmjs.com/package/vue-async-resources)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- ⚡ **Optimistic Updates First** - Built-in optimistic UI updates with automatic rollback on error
- 🎯 **Type-Safe** - Full TypeScript support with comprehensive type inference
- 🔄 **Automatic Caching** - Built-in intelligent caching system
- 🔗 **Resource Dependencies** - Define resources that depend on other resources
- 📦 **Resource Collections** - Manage collections of related resources
- 🎬 **Resource Actions** - Create, update, and delete operations with cache invalidation
- 🔀 **Combined Resources** - Combine multiple resources with coordinated loading states
- 🪶 **Lightweight** - Minimal dependencies, only Vue 3 required

## Why vue-async-resources?

If you're familiar with TanStack Query (React Query), you'll feel right at home. This library provides similar declarative async state management for Vue 3, with a **stronger focus on optimistic updates**. While TanStack Query excels at data fetching and caching, vue-async-resources makes optimistic mutations a first-class citizen, making it ideal for applications that need responsive, instant UI feedback.

## Installation

```bash
npm install vue-async-resources
```

```bash
yarn add vue-async-resources
```

```bash
pnpm add vue-async-resources
```

## Quick Start

### 1. Install the Plugin

```typescript
import { createApp } from 'vue';
import AsyncResources from 'vue-async-resources';
import App from './App.vue';

const app = createApp(App);
app.use(AsyncResources);
app.mount('#app');
```

### 2. Define a Resource

```typescript
import { defineResource } from 'vue-async-resources';

const { useResource: useUser } = defineResource({
  name: 'user',
  dependsOn: [],
  isSingleton: false,
  query: async ({ ok, err }, params) => {
    try {
      const response = await fetch(`/api/users/${params.user}`);
      const data = await response.json();
      return ok(data);
    } catch (error) {
      return err(error);
    }
  },
});
```

### 3. Use in Components

```vue
<script setup lang="ts">
import { useUser } from './resources/user';

const { state, refetch } = useUser(() => ({ user: '123' }));
</script>

<template>
  <div>
    <div v-if="state.isPending">Loading...</div>
    <div v-else-if="state.isError">Error: {{ state.error }}</div>
    <div v-else-if="state.isSuccess">
      <h1>{{ state.data.name }}</h1>
      <button @click="refetch">Refresh</button>
    </div>
  </div>
</template>
```

## Core Concepts

### Resources

Resources represent asynchronous data that can be fetched, cached, and shared across your application.

```typescript
const { useResource: usePost } = defineResource({
  name: 'post',
  dependsOn: [],
  isSingleton: false,
  query: async ({ ok, err }, params) => {
    const response = await fetch(`/api/posts/${params.post}`);
    if (!response.ok) {
      return err(new Error('Failed to fetch post'));
    }
    return ok(await response.json());
  },
});
```

#### Singleton Resources

For resources that don't depend on parameters:

```typescript
const { useResource: useCurrentUser } = defineResource({
  name: 'currentUser',
  dependsOn: [],
  isSingleton: true,
  query: async ({ ok, err }, params) => {
    const response = await fetch('/api/me');
    return ok(await response.json());
  },
});

// Usage: no parameters needed
const { state } = useCurrentUser(() => ({}));
```

#### Dependent Resources

Resources can depend on other resources:

```typescript
const { resourceDefinition: userDefinition, useResource: useUser } = defineResource({
  name: 'user',
  dependsOn: [],
  isSingleton: false,
  query: async ({ ok, err }, params) => {
    const response = await fetch(`/api/users/${params.user}`);
    return ok(await response.json());
  },
});

const { useResource: useUserPosts } = defineResource({
  name: 'posts',
  dependsOn: [userDefinition],
  isSingleton: false,
  query: async ({ ok, err }, params) => {
    const response = await fetch(`/api/users/${params.user}/posts`);
    return ok(await response.json());
  },
});
```

### Resource State

Each resource composable returns a reactive state object:

```typescript
interface ResourceState<Data, Error> {
  status: 'pending' | 'error' | 'success';
  isFetching: boolean;
  isPending: boolean;
  isError: boolean;
  isSuccess: boolean;
  data?: Data;
  error?: Error;
}
```

### Resource Collections

Manage collections of resources efficiently:

```typescript
const { useResourceCollection } = defineResourceCollection({
  resourceDefinition: postDefinition,
  normalize: (post) => post.id,
  query: async ({ select }) => {
    const response = await fetch(`/api/posts?category=${select.category}`);
    return ok(await response.json());
  },
});

// Usage
const { state, refetch } = useResourceCollection({
  select: () => ({ category: 'tech' }),
});
```

### Resource Actions

Define mutations with **first-class optimistic updates**. This is where vue-async-resources really shines—optimistic actions are built into the core API:

```typescript
const { useResourceAction: useUpdatePost } = defineResourceAction({
  type: 'mutate',
  resourceDefinition: postDefinition,
  asyncAction: async ({ ok, err }, postId: string, updates: Partial<Post>) => {
    const response = await fetch(`/api/posts/${postId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    const data = await response.json();
    return ok({ params: { post: postId }, data });
  },
  optimisticAction: ({ ok }, postId: string, updates: Partial<Post>) => {
    return {
      params: { post: postId },
      data: { ...currentPost, ...updates },
    };
  },
});

// Usage
const { state, execute } = useUpdatePost({
  onResolve: (data) => console.log('Updated:', data),
  onFail: (error) => console.error('Failed:', error),
});

await execute('123', { title: 'New Title' });
```

#### Action Types

- **`create`** - Create new resources (with optimistic creation)
- **`mutate`** - Update existing resources (with optimistic updates)
- **`delete`** - Remove resources (with optimistic deletion)

All action types support optimistic updates with automatic rollback on failure, giving your users instant feedback.

### Combined Resources

Combine multiple resources with coordinated loading states:

```typescript
import { useCombinedResources } from 'vue-async-resources';

const user = useUser(() => ({ user: '123' }));
const posts = useUserPosts(() => ({ user: '123' }));

const combined = useCombinedResources({ user, posts });

// combined.state will be:
// - pending: if any resource is pending
// - error: if any resource has an error
// - success: only when all resources are successful
```

## API Reference

### `defineResource(options)`

Define a resource with caching and dependency management.

**Options:**
- `name` - Unique identifier for the resource
- `dependsOn` - Array of resource definitions this resource depends on
- `isSingleton` - Whether the resource requires parameters
- `query` - Async function to fetch the resource data

**Returns:**
- `resourceDefinition` - The resource definition object
- `useResource` - Composable function to use the resource

### `defineResourceCollection(options)`

Define a collection of resources.

**Options:**
- `resourceDefinition` - The resource definition for individual items
- `normalize` - Function to extract unique identifier from data
- `query` - Async function to fetch the collection

**Returns:**
- `resourceCollectionDefinition` - The collection definition
- `useResourceCollection` - Composable function to use the collection

### `defineResourceAction(options)`

Define a mutation action on a resource.

**Options:**
- `type` - Action type: `'create'`, `'mutate'`, or `'delete'`
- `resourceDefinition` - The resource definition to act upon
- `asyncAction` - Async function performing the action
- `optimisticAction` - Optional function for optimistic updates

**Returns:**
- `resourceActionDefinition` - The action definition
- `useResourceAction` - Composable function to execute the action

### `useCombinedResources(resources)`

Combine multiple resources into a single coordinated state.

**Parameters:**
- `resources` - Object mapping names to resource composables

**Returns:**
- `state` - Combined reactive state
- `refetch` - Function to refetch all resources

## TypeScript

This library is written in TypeScript and provides comprehensive type inference:

```typescript
// Types are automatically inferred
const { useResource: useUser } = defineResource({
  name: 'user',
  dependsOn: [],
  isSingleton: false,
  query: async ({ ok, err }, params) => {
    // params type is inferred from dependsOn and name
    const user: User = await fetchUser(params.user);
    return ok(user); // Data type is inferred
  },
});

// Component usage has full type safety
const { state } = useUser(() => ({ user: '123' }));

if (state.value.isSuccess) {
  // state.data is typed as User
  console.log(state.value.data.name);
}
```

## Examples

### Complete CRUD Example

```typescript
// Define the resource
const { 
  resourceDefinition: todoDefinition, 
  useResource: useTodo 
} = defineResource({
  name: 'todo',
  dependsOn: [],
  isSingleton: false,
  query: async ({ ok, err }, params) => {
    const response = await fetch(`/api/todos/${params.todo}`);
    return ok(await response.json());
  },
});

// Create action
const { useResourceAction: useCreateTodo } = defineResourceAction({
  type: 'create',
  resourceDefinition: todoDefinition,
  asyncAction: async ({ ok, err }, title: string) => {
    const response = await fetch('/api/todos', {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
    const todo = await response.json();
    return ok({ params: { todo: todo.id }, data: todo });
  },
});

// Update action
const { useResourceAction: useUpdateTodo } = defineResourceAction({
  type: 'mutate',
  resourceDefinition: todoDefinition,
  asyncAction: async ({ ok, err }, id: string, updates: Partial<Todo>) => {
    const response = await fetch(`/api/todos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    const todo = await response.json();
    return ok({ params: { todo: id }, data: todo });
  },
});

// Delete action
const { useResourceAction: useDeleteTodo } = defineResourceAction({
  type: 'delete',
  resourceDefinition: todoDefinition,
  asyncAction: async ({ ok }, id: string) => {
    await fetch(`/api/todos/${id}`, { method: 'DELETE' });
    return ok({ params: { todo: id }, data: null });
  },
});
```

## Comparison with TanStack Query

Both libraries solve similar problems, but with different priorities:

| Feature              | vue-async-resources       | TanStack Query (Vue)     |
| -------------------- | ------------------------- | ------------------------ |
| Optimistic Updates   | ✅ **First-class support** | ✅ Supported              |
| Automatic Caching    | ✅ Built-in                | ✅ Built-in               |
| Dependent Queries    | ✅ Built-in                | ✅ Built-in               |
| Type Safety          | ✅ Full inference          | ✅ Full inference         |
| Resource Collections | ✅ Built-in                | ⚠️ Manual setup           |
| Combined Resources   | ✅ Built-in                | ⚠️ Manual setup           |
| Optimistic Rollback  | ✅ **Automatic**           | ⚠️ Manual                 |
| Learning Curve       | Lower (Vue-centric)       | Moderate (React origins) |
| Ecosystem            | Growing                   | Mature                   |

**Choose vue-async-resources if:**
- You need frequent optimistic updates with minimal boilerplate
- You want a Vue-first API designed specifically for Vue 3
- You prefer explicit resource dependencies and relationships

**Choose TanStack Query if:**
- You need a battle-tested solution with a large ecosystem
- You want advanced features like infinite queries and query persistence
- You're already familiar with TanStack Query from React

## Requirements

- Vue 3.5+
- TypeScript 5.0+ (recommended for best type inference)

## License

MIT © Manuel Frohn (D4rkr34lm)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Repository

[https://github.com/D4rkr34lm/vue-async-resources](https://github.com/D4rkr34lm/vue-async-resources)