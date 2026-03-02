import {
  IsArray,
  IsNotEmpty,
  IsString,
  IsUUID,
  ArrayNotEmpty,
} from 'class-validator';

export class CreateGroupConversationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsUUID(undefined, { each: true })
  memberIds: string[];
}
