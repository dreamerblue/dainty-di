# Advanced

## Optional Injection

By default, if the dependency cannot be found, an exception is thrown. You can use `@Optional` to make the injection optional:

```typescript
import { Provide, Optional } from 'dainty-di';

@Provide()
class Foo {}

@Provide()
class Bar {
  constructor(@Optional() private foo?: Foo) {}
}
```

## Multiple Injection

If there are multiple providers for the same identifier, an exception is thrown on injection because the DI system cannot determine which unique dependency needs to be resolved. Use `@MultiInject` when you explicitly need to inject multiple dependencies:

```typescript
import { Provide, MultiInject } from 'dainty-di';

const IFoo = Symbol('IFoo');
interface IFoo {}

@Provide({ id: IFoo })
class Foo implements IFoo {}

@Provide({ id: IFoo })
class AnotherFoo implements IFoo {}

@Provide()
class Bar {
  constructor(@MultiInject(IFoo) private foos: IFoo[]) {}
}
```

## Child Container

You can create a child container from a parent container. The child container will inherit all the bindings from the parent container.

When looking up a dependency from the specified container, if the dependency with the specified identifier cannot be found in the current container, it is recursively looked up in the parent container. If the dependency cannot be found, an exception is thrown.

```typescript
import { ContainerAccessor, DIUtility } from 'dainty-di';

const rootContainer = ContainerAccessor.getRootContainer();
const childContainer = rootContainer.createChild();

DIUtility.provideValue(
  {
    id: Symbol.for('answer'),
    value: 42,
  },
  childContainer,
);

DIUtility.getDependency(Symbol.for('answer'), childContainer); // 42
```

## Deferred Providers

In some cases, you may want the dependency provider to defer being bound to the container. A common usage scenario is request scopes for web frameworks.

These scopes exist only for the lifetime of an HTTP request, all dependencies are resolved and instantiated at the beginning of the request, and they tend to be related to specific information on a single request, such as the request context (often referred to `ctx`).

To solve this, you can use the `Deferred` or `DeferredTransient` scope. With such scope, the dependency provider will only be bound until a deferred container (that is, the request container in this example) is created.

Here is a simplified example with Koa:

```typescript
import { Provide, ProviderScope, Inject, DeferredScopeUtility, DIUtility } from 'dainty-di';

@Provide({ scope: ProviderScope.Deferred })
class Foo {
  private url: string;

  constructor(@Inject('ctx') ctx: any) {
    this.url = ctx.url;
  }
}

// At your request handler middleware
app.use((ctx, next) => {
  // Create a request scope container for each request
  // All deferred providers will be bound to this container automatically
  const requestContainer = DeferredScopeUtility.createDeferredScopeContainer();
  // We need to bind the current request context object to the container
  // so that the `Foo` can access the request context
  DIUtility.provideValue({
    id: 'ctx',
    value: ctx,
  });

  // Get the instance of the `Foo` with the current request context
  const foo = DIUtility.getDependency(Foo, requestContainer);
});
```

## Custom Provider Factory

Sometimes you may want to wrap `@Provide` decorator of your own (e.g. `@Service`). Dainty DI provides you with utilities to create a decorator factory with default options:

```typescript
import { DependencyIdentifier, DecoratorUtility, ProviderScope } from 'dainty-di';

const Service = (
  options: {
    id?: DependencyIdentifier;
    condition?: boolean;
    override?: boolean;
  } = {},
) => {
  return DecoratorUtility.createProvideDecoratorFactory(
    {
      // Set the default scope to transient
      // (and in this case, cannot be overridden)
      scope: ProviderScope.Transient,
    },
    {
      beforeProvide: console.log,
      afterProvide: console.log,
    },
  )(options);
};

@Service({ id: 'foo' })
class Foo {}
```
