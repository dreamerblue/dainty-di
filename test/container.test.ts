import { describe, test, expect } from '@jest/globals';
import { Container as OriginalContainer } from 'inversify';
import { ContainerAccessor } from '@/container';
import { PRIVATE_CONTAINER_KEYS } from '@/constants';

describe('container', () => {

  test('ContainerAccessor.getRootContainer', () => {
    const container = ContainerAccessor.getRootContainer();
    expect(container instanceof OriginalContainer).toBe(true);
  });

  test('ContainerAccessor.resetRootContainer', () => {
    const container = ContainerAccessor.getRootContainer();
    container.bind('id').toConstantValue('someString');
    expect(container.isBound('id')).toBe(true);
    ContainerAccessor.resetRootContainer();
    expect(container.isBound('id')).toBe(false);
    // Container itself should not be unbound
    expect(container.get(PRIVATE_CONTAINER_KEYS.Container) === container).toBe(true);
  });
});
