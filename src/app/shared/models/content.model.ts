import { KeyValueModel } from './key-value.model';

export class ContentModel {
  constructor(
    public productName: string,
    public languageId: number,
    public productCategoryId: string,
    public attributes: KeyValueModel[]
  ) {}
}
