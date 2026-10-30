import { FormControl } from '@angular/forms';
import {
  hostnameListValidator,
  httpsUrlValidator,
  localPathValidator,
  originListValidator,
  parseLineSeparatedValues,
  storefrontProductUrlTemplateValidator,
} from './business-form.util';

describe('business onboarding form helpers', () => {
  it('normalizes and deduplicates line-separated configuration values', () => {
    expect(parseLineSeparatedValues(' shop.example.com\n\nshop.example.com\ncdn.example.com ')).toEqual([
      'shop.example.com',
      'cdn.example.com',
    ]);
  });

  it('requires HTTPS commerce backend URLs', () => {
    expect(httpsUrlValidator(new FormControl('https://api.example.com'))).toBeNull();
    expect(httpsUrlValidator(new FormControl('http://api.example.com'))).toEqual({ httpsUrl: true });
  });

  it('requires an HTTPS storefront template containing the literal slug placeholder', () => {
    expect(
      storefrontProductUrlTemplateValidator(
        new FormControl('https://shop.example.com/product/{slug}'),
      ),
    ).toBeNull();
    expect(
      storefrontProductUrlTemplateValidator(new FormControl('https://shop.example.com/product/item')),
    ).toEqual({ slugPlaceholder: true });
    expect(
      storefrontProductUrlTemplateValidator(new FormControl('http://shop.example.com/product/{slug}')),
    ).toEqual({ httpsUrl: true });
  });

  it('requires product placeholders on product-specific paths', () => {
    const validator = localPathValidator(true);
    expect(validator(new FormControl('/products/{productId}'))).toBeNull();
    expect(validator(new FormControl('/products/id'))).toEqual({ productIdPlaceholder: true });
    expect(validator(new FormControl('https://example.com/products/{productId}'))).toEqual({ localPath: true });
  });

  it('accepts origins and hostnames in their backend-safe forms', () => {
    expect(originListValidator(new FormControl('https://shop.example.com'))).toBeNull();
    expect(originListValidator(new FormControl('https://shop.example.com/products'))).toEqual({ invalidOrigin: true });
    expect(hostnameListValidator(new FormControl('shop.example.com\ncdn.example.com'))).toBeNull();
    expect(hostnameListValidator(new FormControl('https://shop.example.com'))).toEqual({ invalidHostname: true });
  });
});
