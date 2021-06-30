import { describe, test, expect } from '@jest/globals';
import { ContainerAccessor } from '@/container';
import { ProviderScope } from '@/enums';
import { DIUtility } from '@/utils';
import { DeferredScopeUtility } from '@/deferred-scope';

describe('deferred-scope', () => {
  test('DeferredScopeUtility.createDeferredScopeContainer', () => {
    const container = ContainerAccessor.getRootContainer();

    // Test cases to check if the deferred scope works
    class A {}
    class B {}
    DIUtility.provideClass({ id: A, value: A, scope: ProviderScope.Deferred });
    DIUtility.provideClass({ id: B, value: B, scope: ProviderScope.DeferredTransient });

    // Test cases to check condition/overriding in deferred scope
    class C {}
    class D {}
    class E {}
    DIUtility.provideClass({ id: C, value: C, scope: ProviderScope.Deferred });
    DIUtility.provideClass({
      id: C,
      value: D,
      scope: ProviderScope.Deferred,
      condition: false,
      override: true,
    });
    DIUtility.provideClass({
      id: C,
      value: E,
      scope: ProviderScope.Deferred,
      override: true,
    });

    const deferredContainer = DeferredScopeUtility.createDeferredScopeContainer();
    expect(deferredContainer.parent === container).toBe(true);
    expect(() => container.get(A)).toThrow();
    expect(() => container.get(B)).toThrow();
    expect(deferredContainer.get(A)).toBeInstanceOf(A);
    expect(deferredContainer.get(B)).toBeInstanceOf(B);
    // Scope after deferred
    expect(deferredContainer.get(A) === deferredContainer.get(A)).toBe(true);
    expect(deferredContainer.get(B) !== deferredContainer.get(B)).toBe(true);
    // Condition and override
    expect(deferredContainer.get(C)).toBeInstanceOf(E);
  });

  test('DeferredScopeUtility.getDeferredScopeProvidersById', () => {
    class A {}
    class B {}
    DIUtility.provideClass({ id: A, value: A, scope: ProviderScope.Singleton });
    DIUtility.provideClass({ id: B, value: B, scope: ProviderScope.Transient });
    expect(DeferredScopeUtility.getDeferredScopeProvidersById(A).length).toEqual(0);
    expect(DeferredScopeUtility.getDeferredScopeProvidersById(B).length).toEqual(0);

    // Only deferred scope providers should be included in the deferred map
    class C {}
    class D {}
    DIUtility.provideClass({ id: C, value: C, scope: ProviderScope.Deferred });
    DIUtility.provideClass({ id: D, value: D, scope: ProviderScope.DeferredTransient });
    expect(DeferredScopeUtility.getDeferredScopeProvidersById(C).length).toEqual(1);
    expect(DeferredScopeUtility.getDeferredScopeProvidersById(D).length).toEqual(1);
  });
});
