# Quick Start

## Installation

```bash
npm i -S dainty-di
```

## Setup

Dainty DI is implemented based on traditional decorators (before TypeScript 5.0), you need to use it with TypeScript and make sure that the relevant configurations are set correctly in `tsconfig.json` below:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

## Basic Usage

Directly use `@Provide` decorator to declare a class as a dependency provider:

```typescript
import { Provide } from 'dainty-di';

@Provide()
export class Foo {}
```

Inject the provider into the dependent class (it also needs to be a provider):

```typescript
import { Provide, Inject } from 'dainty-di';
import { Foo } from './foo';

@Provide()
class Bar {
  constructor(private foo: Foo) {}

  // You can also declare dependencies on properties
  // instead of on constructor arguments
  @Inject()
  private foo: Foo;
}
```

Get the instance of the specified dependency provider:

```typescript
import { DIUtility } from 'dainty-di';
import { Bar } from './bar';

const bar = DIUtility.getDependency(Bar);
```

:::tip
When you get a dependency (most of the time it's probably an instance of the specified class) from DI container, the container recursively resolves all dependencies and their own declared dependencies then instantiates them correctly. It's driven by [InversifyJS](https://inversify.io/).
:::

## Configure the Provider

### Identifier

By default, the identifier of the provider is the decorated class itself, but you can also customize it:

```typescript
import { Provide, Inject } from 'dainty-di';

@Provide({ id: 'foo' })
export class Foo {}

export class Bar {
  constructor(@Inject('foo') private foo: Foo) {}
}
```

You can use a class, string, or symbol as a dependency identifier. When an identifier is not explicitly specified, Dainty DI automatically infers the identifier by default based on the type (only classes are supported).

If you specify a custom identifier for the provider, you must use the same identifier when injecting, otherwise the dependency may not be found.

### Scope

By default, a dependency provider is scoped as a singleton, meaning that all instances that depend on it acquire the same reference to it. At some point, you may need to configure the scope so that it generates a brand new instance each time it is requested. You can configure the `scope` option to `transient`:

```typescript
import { Provide, ProviderScope } from 'dainty-di';

@Provide({ scope: ProviderScope.Transient })
export class Foo {}
```

### Condition

If your dependency needs to be provided conditionally, you can use the built-in conditional option `condition`. It is convenient to change the dependency provider based on an environment variable or expression:

```typescript
import { Provide, Inject } from 'dainty-di';

// The following provider will only be provided
// when the NODE_ENV environment variable is set to 'development'
@Provide({ id: 'foo', condition: 'development' })
export class FooDev {}

// You can also use a boolean expression
// It will be resolved the first time this dependency is imported
@Provide({ id: 'foo', condition: process.env.NODE_ENV === 'production' })
export class FooProd {}

export class Bar {
  constructor(@Inject('foo') private foo: Foo) {}
}
```

### Overriding

If you need to override a dependency provider, you can use the built-in `override` option. In general, this is useful for overriding configurations based on conditions:

```typescript
import { Provide, Inject } from 'dainty-di';

@Provide()
export class DBConfig {
  public host = '127.0.0.1';
  public port = 3306;
  public pass = 'test';
}

// Override the provider when condition is met
@Provide({ id: DBConfig, condition: 'production', override: true })
export class DBConfigProd extends DBConfig {
  public pass = 'another_pass';
}

export class DB {
  constructor(private config: DBConfig) {}
}
```

## Provide dependencies imperatively

At some point, you may need to provide dependencies dynamically, such as classes or values that are initialized based on conditions. You can use the imperative interface `bindProvider` to manually provide dependencies to the DI container:

```typescript
import { DIUtility, ProviderType } from 'dainty-di';

DIUtility.provideValue({
  id: Symbol.for('answer'),
  value: 42,
});

DIUtility.getDependency(Symbol.for('answer')); // 42
```
