import { jest, afterEach } from '@jest/globals';
import { ContainerAccessor } from './src/container';

jest.setTimeout(5000);

afterEach(() => {
  ContainerAccessor.resetRootContainer();
});
