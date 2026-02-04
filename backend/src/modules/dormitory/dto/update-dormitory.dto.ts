import { PartialType } from '@nestjs/mapped-types';
import { CreateDormitoryDto } from './create-dormitory.dto';

export class UpdateDormitoryDto extends PartialType(CreateDormitoryDto) {}
