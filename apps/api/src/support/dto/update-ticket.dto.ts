import { IsIn, IsOptional } from 'class-validator';

export class UpdateTicketDto {
  @IsOptional()
  @IsIn(['open', 'resolved'])
  status?: 'open' | 'resolved';

  @IsOptional()
  @IsIn(['low', 'medium', 'high'])
  priority?: 'low' | 'medium' | 'high';
}
