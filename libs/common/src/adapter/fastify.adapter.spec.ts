import { ApplicationAdapter } from './fastify.adapter';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import QueryString from 'qs';

// Mock the FastifyAdapter class
jest.mock('@nestjs/platform-fastify', () => ({
  FastifyAdapter: jest.fn().mockImplementation(() => ({
    setConfig: jest.fn(),
  })),
}));

describe('ApplicationAdapter', () => {
  let adapter: ApplicationAdapter;

  beforeEach(() => {
    // Create an instance of ApplicationAdapter before each test
    adapter = new ApplicationAdapter();
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  it('should call FastifyAdapter with the correct config', () => {
    // Check that FastifyAdapter is called with the correct configuration
    expect(FastifyAdapter).toHaveBeenCalledWith({
      maxParamLength: 500,
      querystringParser: QueryString.parse,
    });
  });
});
