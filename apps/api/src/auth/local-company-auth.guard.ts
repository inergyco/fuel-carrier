import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalCompanyAuthGuard extends AuthGuard('local-company') {}
