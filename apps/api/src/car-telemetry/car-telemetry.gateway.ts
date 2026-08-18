import { Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { AuthSession } from '@fuel-carrier/shared-types/auth-session';
import {
  CarTelemetrySocketEvents,
  type CarTelemetryRealtimeEvent,
} from '@fuel-carrier/shared-types/car-telemetry';
import { UserRole } from '@fuel-carrier/shared-types/user-role';
import { Server, Socket } from 'socket.io';
import { AuthService } from '../auth/auth.service';
import type { JwtPayload } from '../auth/auth.types';
import { getCookieValue } from '../common/cookie-header.utils';
import {
  CarTelemetryRealtimeService,
  INTERNAL_CAR_TELEMETRY_ROOM,
  companyCarTelemetryRoom,
} from './car-telemetry-realtime.service';

type CarTelemetrySocketData = {
  session?: AuthSession;
};

type SocketWithSession = Socket<
  Record<string, never>,
  Record<string, never>,
  Record<string, never>,
  CarTelemetrySocketData
>;

@WebSocketGateway({
  namespace: '/car-telemetry',
  path: '/api/socket.io',
  cors: {
    origin: true,
    credentials: true,
  },
})
export class CarTelemetryGateway
  implements OnGatewayConnection, OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(CarTelemetryGateway.name);
  private unsubscribeRealtime: (() => void) | null = null;

  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
    private readonly realtime: CarTelemetryRealtimeService,
  ) {}

  onModuleInit(): void {
    this.unsubscribeRealtime = this.realtime.onEvent((event) => {
      this._fanOut(event);
    });
  }

  onModuleDestroy(): void {
    this.unsubscribeRealtime?.();
    this.unsubscribeRealtime = null;
  }

  async handleConnection(
    @ConnectedSocket() client: SocketWithSession,
  ): Promise<void> {
    const session = await this._authenticate(client);
    if (!session) {
      client.disconnect(true);
      return;
    }

    client.data.session = session;

    if (session.role === UserRole.INTERNAL_ADMIN) {
      await client.join(INTERNAL_CAR_TELEMETRY_ROOM);
      this.logger.debug(`WS client ${client.id} joined internal telemetry`);
      return;
    }

    if (session.role !== UserRole.COMPANY_USER || !session.companyId) {
      client.disconnect(true);
      return;
    }

    await client.join(companyCarTelemetryRoom(session.companyId));
    this.logger.debug(
      `WS client ${client.id} joined company ${session.companyId}`,
    );
  }

  private _fanOut(event: CarTelemetryRealtimeEvent): void {
    const rooms = [
      companyCarTelemetryRoom(event.companyId),
      INTERNAL_CAR_TELEMETRY_ROOM,
    ];

    if (event.type === CarTelemetrySocketEvents.TELEMETRY_UPDATED) {
      this.server
        .to(rooms)
        .emit(CarTelemetrySocketEvents.TELEMETRY_UPDATED, event.marker);
      return;
    }

    this.server.to(rooms).emit(CarTelemetrySocketEvents.TELEMETRY_REMOVED, {
      carId: event.carId,
    });
  }

  private async _authenticate(client: Socket): Promise<AuthSession | null> {
    const cookieHeader = client.handshake.headers.cookie;
    const tokens = [
      getCookieValue(
        cookieHeader,
        this.authService.getInternalAuthCookieName(),
      ),
      getCookieValue(
        cookieHeader,
        this.authService.getExternalAuthCookieName(),
      ),
    ];

    for (const token of tokens) {
      const session = await this._sessionFromToken(token);
      if (session) {
        return session;
      }
    }

    return null;
  }

  private async _sessionFromToken(
    token: string | null,
  ): Promise<AuthSession | null> {
    if (!token) {
      return null;
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);

      if (payload.role === UserRole.INTERNAL_ADMIN) {
        return {
          userId: payload.sub,
          role: payload.role,
          username: payload.username,
          firstName: payload.firstName,
          lastName: payload.lastName,
        };
      }

      if (payload.role !== UserRole.COMPANY_USER || !payload.companyId) {
        return null;
      }

      if (payload.mustChangePassword) {
        return null;
      }

      return {
        userId: payload.sub,
        role: payload.role,
        companyId: payload.companyId,
        companyUserLevel: payload.companyUserLevel,
        username: payload.username,
        firstName: payload.firstName,
        lastName: payload.lastName,
        mustChangePassword: payload.mustChangePassword,
      };
    } catch {
      return null;
    }
  }
}
