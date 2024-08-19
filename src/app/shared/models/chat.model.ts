export class ChatModel {
  constructor(
    public isUser: boolean,
    public text: string,
    public copied: boolean
  ) {}
}
