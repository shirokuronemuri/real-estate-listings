import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { ImageValidationPipe } from './image-validation.pipe';
import { TypedConfigService } from 'src/config/typed-config.service';
import { ZodValidationException } from 'nestjs-zod';

describe('ImageValidationPipe', () => {
  let pipe: ImageValidationPipe;
  let config: DeepMockProxy<TypedConfigService>;
  beforeAll(() => {
    config = mockDeep<TypedConfigService>();
    pipe = new ImageValidationPipe(config);
  });

  it('returns the input files when validation passes', () => {
    const files = [
      { mimetype: 'image/jpeg', size: 100 },
    ] as Express.Multer.File[];
    config.get.mockReturnValueOnce(1024).mockReturnValueOnce(1);
    const result = pipe.transform(files);
    expect(result).toStrictEqual(files);
  });

  it('throws ZodValidationException if too many images are passed', () => {
    const files = [
      { mimetype: 'image/jpeg', size: 100 },
      { mimetype: 'image/jpeg', size: 200 },
    ] as Express.Multer.File[];
    config.get.mockReturnValueOnce(1024).mockReturnValueOnce(1);
    expect(() => pipe.transform(files)).toThrow(ZodValidationException);
  });

  it('throws ZodValidationException if image size is too big', () => {
    const files = [
      { mimetype: 'image/jpeg', size: 3 * 1024 * 1024 },
    ] as Express.Multer.File[];
    config.get.mockReturnValueOnce(1).mockReturnValueOnce(1);
    expect(() => pipe.transform(files)).toThrow(ZodValidationException);
  });

  it("path array in error is prefixed with 'images'", () => {
    const files = [
      { mimetype: 'image/jpeg', size: 3 * 1024 * 1024 },
    ] as Express.Multer.File[];
    config.get.mockReturnValueOnce(1).mockReturnValueOnce(1);
    try {
      pipe.transform(files);
    } catch (error) {
      expect(error).toBeInstanceOf(ZodValidationException);
      const zodError = error.getZodError();
      expect(zodError.issues[0].path[0]).toBe('images');
    }
  });
});
