import { IsString } from "class-validator";

export class LoginDto {
  @IsString()
  login: string;

  @IsString()
  password: string;
}

export class RefreshDto {
  @IsString()
  token: string;
}
