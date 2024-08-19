export class ChatWithPhotoModel {
  constructor(
    public isUser: boolean,
    public text: string,
    public photo: string,
    public copied: boolean
  ) {}
}
