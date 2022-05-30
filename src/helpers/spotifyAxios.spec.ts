import axios from 'axios';
import { BASE_API_URL } from '../constants';
import { paramsSerializer, spotifyAxios } from './spotifyAxios';

jest.mock('axios');

const axiosMock = (axios as unknown) as jest.Mock;

describe('spotifyAxios', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should successfully call Spotify's Web API with the default content type", async () => {
    axiosMock.mockResolvedValue({ data: 'foo' });
    await spotifyAxios('foo', 'GET', 'token', {
      params: {
        bar: 'baz',
      },
    });
    expect(axiosMock).toBeCalledWith({
      params: {
        bar: 'baz',
      },
      baseURL: BASE_API_URL,
      headers: {
        Authorization: 'Bearer token',
        'Content-Type': 'application/json',
      },
      paramsSerializer,
      url: 'foo',
      method: 'GET',
    });
  });

  it("should successfully call Spotify's Web API with a custom content type", async () => {
    axiosMock.mockResolvedValue({ data: 'foo' });
    await spotifyAxios('foo', 'GET', 'token', {
      contentType: 'image/jpeg',
      data: 'bar',
    });
    expect(axiosMock).toBeCalledWith({
      data: 'bar',
      baseURL: BASE_API_URL,
      headers: {
        Authorization: 'Bearer token',
        'Content-Type': 'image/jpeg',
      },
      paramsSerializer,
      url: 'foo',
      method: 'GET',
    });
  });

  describe('should handle errors', () => {
    it('should handle a generic error', async () => {
      const testError = { message: 'foo' };
      axiosMock.mockRejectedValue(testError);
      await expect(spotifyAxios('bar', 'GET', 'token')).rejects.toEqual({
        message: 'foo',
      });
    });

    it(`should handle a 429 (rate limit) error`, async () => {
      const testError = {
        message: 'Error: Rate limit exceeded',
        code: '429',
        response: {
          status: 429,
          statusText: 'Rate limit exceeded',
          headers: {
            'retry-after': 6,
          },
        },
      };
      axiosMock.mockRejectedValue(testError);

      await expect(spotifyAxios('bar', 'GET', 'token')).rejects.toEqual({
        message: 'Error: Rate limit exceeded',
        code: '429',
        response: {
          status: 429,
          statusText: 'Rate limit exceeded',
          headers: {
            'retry-after': 6,
          },
        },
      });
    });
  });
});

describe('paramsSerializer', () => {
  it('should stringify arrays using the comma format', () => {
    expect(paramsSerializer({ foo: ['bar', 'baz'] })).toEqual('foo=bar%2Cbaz');
  });
});
