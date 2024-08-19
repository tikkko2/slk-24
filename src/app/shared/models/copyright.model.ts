export class CopyrightModel {
  constructor(
    public uniqueKey: string,
    public productName: string,
    public languageId: number,
    public file: string
  ) {}
}
