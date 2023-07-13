---
sidebarDepth: 1
---

# Reference

## Container

### `ContainerAccessor.getRootContainer(): Container`

Get the global root container.

### `ContainerAccessor.resetRootContainer(): void`

Reset the global root container. All bindings will be removed.

## Decorators

### `@Injectable(): ClassDecorator`

Declare a dependency as injectable.

### `@Provide(options?): ClassDecorator`

Declare a dependency as injectable and provide it to the container automatically when the decorator is applied.

- `options`: Provide options.

### `@Inject(id?): ParameterDecorator | PropertyDecorator`

Inject a dependency.

- `id`: The dependency identifier.

### `@MultiInject(id?): ParameterDecorator | PropertyDecorator`

Inject all matching dependencies as an array (multi-injection).

- `id`: The dependency identifier.

### `@Optional(): ParameterDecorator | PropertyDecorator`

Optionally inject a dependency only if it is already bound in the container.

### `@InjectRootContainer(): ParameterDecorator | PropertyDecorator`

Inject the root container object.

### `DecoratorUtility.createProvideDecoratorFactory(presetOptions, lifeCycleOptions?): (options?) => ClassDecorator`

Create Provide decorator factory.

- `presetOptions`: The preset default options.
- `lifeCycleOptions`: The life cycle options to be called while registering provider.

## Deferred Scope

### `DeferredScopeUtility.createDeferredScopeContainer(parentContainer?): Container`

Create a deferred scope sub container.

All deferred scope providers will be bound to this sub container.

- `parentContainer`: The parent container (default to root container).

### `DeferredScopeUtility.getDeferredScopeProvidersById(id): DeferredScopeProvider[]`

Get deferred scope providers of specified identifier.

- `id`: The dependency identifier.

## Utilities

### `DIUtility.getResolvedIdentifier(idOrTarget): DependencyIdentifier`

Get resolved identifier of the dependency that can be used in the container.

If the identifier is a string, it will be converted to `Provide<${string}>`, otherwise the provided identifier will be used directly.

- `idOrTarget`: The specified identifier token or the target class.

### `DIUtility.bindProvider(options, container?): Binding`

Bind a provider to the container.

- `options`: The options of provider.
- `container`: The container to bind to, default to root container.

### `DIUtility.provideClass(options): Binding`

Provide a class as a dependency.

- `options`: Provider options.

### `DIUtility.provideValue(options): Binding`

Provide a value as a dependency.

- `options`: Provider options.

### `DIUtility.getDependency<T>(id, container?): T`

Get the dependency by the specified identifier.

- `id`: The dependency identifier.
- `container`: The container to get the dependency from (default to root container).
