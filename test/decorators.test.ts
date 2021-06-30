import { describe, test, expect, jest } from '@jest/globals';
import { ContainerAccessor } from '@/container';
import { Container } from '@/container';
import {
  Inject,
  InjectRootContainer,
  MultiInject,
  Optional,
  Provide,
  DecoratorUtility,
} from '@/decorators';
import { ProviderScope } from '@/enums';
import type { DependencyIdentifier } from '@/typings';
import { DIUtility } from '@/utils';

describe('decorators', () => {
  test('@Provide', () => {
    const container = ContainerAccessor.getRootContainer();

    @Provide({
      scope: ProviderScope.Transient,
    })
    class A {}

    // The default scope is singleton
    @Provide()
    class B {}

    @Provide({
      condition: false,
    })
    class C {}

    @Provide({
      id: Symbol.for('id'),
    })
    class D {}

    @Provide({
      id: Symbol.for('id'),
      override: true,
    })
    class E {}

    @Provide({
      scope: ProviderScope.Deferred,
    })
    class F {}

    expect(container.get(A)).toBeInstanceOf(A);
    expect(container.get(A) !== container.get(A)).toBe(true);
    expect(container.get(B)).toBeInstanceOf(B);
    expect(container.get(B) === container.get(B)).toBe(true);
    expect(() => container.get(C)).toThrow();
    expect(container.get(Symbol.for('id'))).toBeInstanceOf(E);
    expect(() => container.get(F)).toThrow();
  });

  test('DecoratorUtility.createProvideDecoratorFactory', () => {
    const container = ContainerAccessor.getRootContainer();

    const beforeProvideMock = jest.fn();
    const afterProvideMock = jest.fn();
    const SomeProvideDecorator = (
      options: { id?: DependencyIdentifier; condition?: boolean } = {},
    ) => {
      return DecoratorUtility.createProvideDecoratorFactory(
        {
          scope: ProviderScope.Singleton,
          condition: true,
          override: true,
        },
        {
          beforeProvide: beforeProvideMock,
          afterProvide: afterProvideMock,
        },
      )(options);
    };

    @SomeProvideDecorator({ id: 'id' })
    class A {}

    expect(container.get(DIUtility.getResolvedIdentifier('id'))).toBeInstanceOf(A);
    const expectedParams: [any, any] = [
      A,
      {
        id: 'id',
        scope: ProviderScope.Singleton,
        condition: true,
        override: true,
      },
    ];
    expect(beforeProvideMock).toBeCalledWith(...expectedParams);
    expect(afterProvideMock).toBeCalledWith(...expectedParams);
  });

  test('@Inject', () => {
    const container = ContainerAccessor.getRootContainer();

    @Provide()
    class TestForNoMatchingBindings {
      @Inject()
      public a: any;
    }

    expect(() => container.get(TestForNoMatchingBindings)).toThrowError(/^No matching/gm);

    @Provide()
    class A {}

    @Provide({ id: 'id' })
    class B {}

    @Provide({ id: Symbol.for('id') })
    class C {}

    @Provide()
    class Test {
      @Inject()
      public a: A;

      public constructor(
        @Inject() public readonly aOnCtor: A,
        @Inject('id') public readonly b: any,
        @Inject(Symbol.for('id')) public readonly c: any,
      ) {}
    }

    const test = container.get(Test);
    expect(test.a).toBeInstanceOf(A);
    expect(test.aOnCtor).toBeInstanceOf(A);
    expect(test.b).toBeInstanceOf(B);
    expect(test.c).toBeInstanceOf(C);
  });

  test('@MultiInject', () => {
    const container = ContainerAccessor.getRootContainer();

    const ILib = Symbol('ILib');
    interface ILib {}

    @Provide({ id: ILib })
    class A implements ILib {}

    @Provide({ id: ILib })
    class B implements ILib {}

    @Provide()
    class Z {
      @MultiInject(ILib)
      public libs: ILib[];
    }

    const z = container.get(Z);
    expect(z.libs).toHaveLength(2);
  });

  test('@Optional', () => {
    const container = ContainerAccessor.getRootContainer();

    @Provide()
    class A {
      @Optional()
      @Inject('id')
      public someField: any;
    }

    const a = container.get(A);
    expect(a.someField).toBeUndefined();
  });

  test('@InjectRootContainer', () => {
    const container = ContainerAccessor.getRootContainer();

    @Provide()
    class A {
      @InjectRootContainer()
      public container: Container;
    }

    const a = container.get(A);
    expect(a.container === container).toBe(true);
  });
});
