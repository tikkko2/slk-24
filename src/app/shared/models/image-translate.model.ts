export class FileTranslateModel {
  constructor(
    public description: string,
    public languageId: number,
    public sourceLanguageId: number,
    public files: any,
    public isPdf: boolean
  ) {}
}
