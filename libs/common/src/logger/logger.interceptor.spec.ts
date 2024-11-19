import { ConfigService } from '@nestjs/config';
import { ApplicationLogger } from './loger.interceptor';

// Mock uuid to return a specific value for testing
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('test-uuid'),
}));

// Mock Logger class correctly
jest.mock('@nestjs/common', () => {
  return {
    Logger: jest.fn().mockImplementation(() => ({
      log: jest.fn(),
      error: jest.fn(),
    })),
  };
});

describe('ApplicationLogger', () => {
  let logger: ApplicationLogger;
  let configServiceMock: ConfigService;

  beforeEach(() => {
    // Mock ConfigService to return a fixed value for NODE_ENV
    configServiceMock = {
      get: jest.fn().mockReturnValue('development'),
    } as unknown as ConfigService;

    // Create a new instance of ApplicationLogger with the mocked ConfigService
    logger = new ApplicationLogger(configServiceMock);

    // Retrieve the mock Logger instance
  });

  it('should be defined', () => {
    expect(logger).toBeDefined();
  });

  it('should call ConfigService.get() in the constructor', () => {
    // Check if ConfigService.get() was called with the correct argument
    expect(configServiceMock.get).toHaveBeenCalledWith('NODE_ENV');
  });

  it('should generate a request ID and add it to request and response headers', () => {
    // Mock FastifyRequest and FastifyReply to simulate a request-response cycle
    const mockRequest: any = { headers: {} };
    const mockResponse: any = { header: jest.fn() };

    // Call the applyRequestId method directly
    const requestId = logger['applyRequestId'](mockRequest, mockResponse);

    // Check if the generated request ID is set in the request and response headers
    expect(requestId).toBe('test-uuid');
    expect(mockRequest.headers['x-request-id']).toBe('test-uuid');
    expect(mockResponse.header).toHaveBeenCalledWith(
      'x-request-id',
      'test-uuid',
    );
  });
});
