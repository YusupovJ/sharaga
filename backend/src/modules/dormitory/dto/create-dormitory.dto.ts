import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDormitoryDto {
    @IsString()
    @IsNotEmpty()
    name: string;
}
