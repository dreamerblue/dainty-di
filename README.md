# dainty-di

Yet another light dependency injection lib for Node.js. It's based on TypeScript legacy decorators.

You can use it to provide dependency injection capabilities for your application, or to build Web frameworks.

## Documentation

- [Dainty DI Docs](https://dreamerblue.github.io/dainty-di/)

## Feature Preview

### Basic DI

```typescript
import { Provide } from 'dainty-di';

@Provide()
export class Foo {}

@Provide()
class Bar {
  // Inject Foo
  constructor(private foo: Foo) {}

  // You can also declare dependencies on properties
  // instead of on constructor arguments
  @Inject()
  private foo: Foo;
}
```

### Scope, Condition and Overriding

```typescript
import { Provide, ProviderScope } from 'dainty-di';

@Provide({ scope: ProviderScope.Transient })
export class Foo {}

@Provide({ id: Foo, condition: 'production', override: true })
export class FooProd {}
```

### Imperative Interface

```typescript
import { DIUtility, ProviderType } from 'dainty-di';
import { Foo } from 'some-external';

DIUtility.provideValue({
  id: Symbol.for('answer'),
  value: 42,
});

DIUtility.provideClass({
  id: Foo,
  value: Foo,
  scope: ProviderScope.Transient,
});

DIUtility.getDependency(Symbol.for('answer')); // 42
DIUtility.getDependency(Foo) instanceof Foo; // true
```
