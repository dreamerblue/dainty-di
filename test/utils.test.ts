import { describe, test, expect } from '@jest/globals';
import { ContainerAccessor } from '@/container';
import { Injectable } from '@/decorators';
import { ProviderScope, ProviderType } from '@/enums';
import { DIUtility } from '@/utils';

describe('utils', () => {
  test('DIUtility.getResolvedIdentifier', () => {
    class ClassId {}
    expect(DIUtility.getResolvedIdentifier(ClassId)).toEqual(ClassId);
    const symbolId = Symbol('id');
    expect(DIUtility.getResolvedIdentifier('id')).toEqual('Provide<id>');
    expect(DIUtility.getResolvedIdentifier(symbolId)).toEqual(symbolId);
    // @ts-ignore
    expect(() => DIUtility.getResolvedIdentifier()).toThrow();
    // @ts-ignore
    expect(() => DIUtility.getResolvedIdentifier(1)).toThrow();
  });

  test('DIUtility.bindProvider for types', () => {
    const container = ContainerAccessor.getRootContainer();

    @Injectable()
    class A {}

    DIUtility.bindProvider({
      type: ProviderType.Class,
      identifier: ProviderType.Class,
      value: A,
      scope: ProviderScope.Transient,
    });
    expect(container.get(ProviderType.Class)).toBeInstanceOf(A);

    const value = 42;
    DIUtility.bindProvider({
      type: ProviderType.Value,
      identifier: Symbol.for('value'),
      value,
      scope: ProviderScope.Transient,
    });
    expect(container.get(Symbol.for('value'))).toEqual(value);

    // Test unrecognized type
    expect(() =>
      DIUtility.bindProvider({
        type: 'CustomType' as ProviderType,
        identifier: 'custom',
        value,
        scope: ProviderScope.Transient,
      }),
    ).toThrowError(/^Type([\s\S]*?)unrecognized$/gm);
  });

  test('DIUtility.bindProvider for scopes', () => {
    const container = ContainerAccessor.getRootContainer();

    @Injectable()
    class Singleton {}

    @Injectable()
    class Transient {}

    DIUtility.bindProvider({
      type: ProviderType.Class,
      identifier: Transient,
      value: Transient,
      scope: ProviderScope.Transient,
    });
    DIUtility.bindProvider({
      type: ProviderType.Class,
      identifier: Singleton,
      value: Singleton,
      scope: ProviderScope.Singleton,
    });
    expect(container.get(Transient) !== container.get(Transient)).toBe(true);
    expect(container.get(Singleton) === container.get(Singleton)).toBe(true);

    // Test deferred scope
    @Injectable()
    class Deferred {}

    @Injectable()
    class DeferredTransient {}

    expect(() =>
      DIUtility.bindProvider({
        type: ProviderType.Class,
        identifier: Deferred,
        value: Deferred,
        scope: ProviderScope.Deferred,
      }),
    ).toThrowError(/^Deferred scope should not be bound/gm);
    expect(() =>
      DIUtility.bindProvider({
        type: ProviderType.Class,
        identifier: DeferredTransient,
        value: DeferredTransient,
        scope: ProviderScope.DeferredTransient,
      }),
    ).toThrowError(/^Deferred scope should not be bound/gm);

    // Test unrecognized scope
    expect(() =>
      DIUtility.bindProvider({
        type: ProviderType.Class,
        identifier: Transient,
        value: Transient,
        scope: 'CustomScope' as ProviderScope,
      }),
    ).toThrowError(/^Scope([\s\S]*?)unrecognized$/gm);
  });

  test('DIUtility.bindProvider for override', () => {
    const container = ContainerAccessor.getRootContainer();

    @Injectable()
    class A {}

    @Injectable()
    class B {}

    DIUtility.bindProvider({
      type: ProviderType.Class,
      identifier: A,
      value: A,
      scope: ProviderScope.Transient,
    });
    DIUtility.bindProvider({
      type: ProviderType.Class,
      identifier: A,
      value: B,
      scope: ProviderScope.Transient,
      override: true,
    });
    expect(container.get(A)).toBeInstanceOf(B);
  });

  test('DIUtility.provideClass', () => {
    const container = ContainerAccessor.getRootContainer();

    class A {}
    class B {}
    class C {}

    // test condition and override
    DIUtility.provideClass({
      id: A,
      value: A,
      scope: ProviderScope.Singleton,
    });
    DIUtility.provideClass({
      id: A,
      value: B,
      scope: ProviderScope.Singleton,
      condition: false,
    });
    expect(container.get(A)).toBeInstanceOf(A);
    DIUtility.provideClass({
      id: A,
      value: C,
      scope: ProviderScope.Singleton,
      condition: true,
      override: true,
    });
    expect(container.get(A)).toBeInstanceOf(C);

    // Test env condition
    class D {}

    const previousNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'test-for-dainty';
    DIUtility.provideClass({
      id: A,
      value: D,
      scope: ProviderScope.Singleton,
      condition: 'test-for-dainty',
      override: true,
    });
    expect(container.get(A)).toBeInstanceOf(D);
    process.env.NODE_ENV = previousNodeEnv;

    // Test default scope singleton
    class E {}

    DIUtility.provideClass({
      id: E,
      value: E,
    });
    expect(container.get(E) === container.get(E)).toBe(true);

    // Test deferred scope (should throw)
    class F {}

    DIUtility.provideClass({
      id: F,
      value: F,
      scope: ProviderScope.Deferred,
    });
    expect(() => container.get(F)).toThrow();
  });

  test('DIUtility.provideValue', () => {
    const container = ContainerAccessor.getRootContainer();
    DIUtility.provideValue({ id: Symbol.for('id'), value: 'value' });
    expect(container.get(Symbol.for('id'))).toEqual('value');
    expect(() =>
      DIUtility.provideValue({
        id: null,
        value: 'value',
      }),
    ).toThrowError(/^No valid identifier/);
  });

  test('DIUtility.getDependency', () => {
    class A {}

    DIUtility.provideClass({ id: A, value: A });
    expect(DIUtility.getDependency(A)).toBeInstanceOf(A);

    DIUtility.provideValue({ id: Symbol.for('id'), value: 'value' });
    expect(DIUtility.getDependency(Symbol.for('id'))).toEqual('value');
  });
});
