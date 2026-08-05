import { Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import {
  CarLocationSocketEvents,
  UserRole,
  type AuthSession,
  type CarLocationRealtimeEvent,
} from '@fuel-carrier/shared-types';
import { Server, Socket } from 'socket.io';
import { AuthService } from '../auth/auth.service';
import type { JwtPayload } from '../auth/auth.types';
import { getCookieValue } from '../common/cookie-header.utils';
import {
  CarLocationsRealtimeService,
  companyCarLocationsRoom,
} from './car-locations-realtime.service';

type CarLocationsSocketData = {
  session?: AuthSession;
};

type SocketWithSession = Socket<
  Record<string, never>,
  Record<string, never>,
  Record<string, never>,
  CarLocationsSocketData
>;

@WebSocketGateway({
  namespace: '/car-locations',
  path: '/api/socket.io',
  cors: {
    origin: true,
    credentials: true,
  },
})
export class CarLocationsGateway
  implements OnGatewayConnection, OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(CarLocationsGateway.name);
  private unsubscribeRealtime: (() => void) | null = null;

  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
    private readonly realtime: CarLocationsRealtimeService,
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
    if (!session?.companyId) {
      client.disconnect(true);
      return;
    }

    client.data.session = session;
    await client.join(companyCarLocationsRoom(session.companyId));
    this.logger.debug(
      `WS client ${client.id} joined company ${session.companyId}`,
    );
  }

  private _fanOut(event: CarLocationRealtimeEvent): void {
    const room = companyCarLocationsRoom(event.companyId);

    if (event.type === CarLocationSocketEvents.LOCATION_UPDATED) {
      this.server
        .to(room)
        .emit(CarLocationSocketEvents.LOCATION_UPDATED, event.marker);
      return;
    }

    this.server.to(room).emit(CarLocationSocketEvents.LOCATION_REMOVED, {
      carId: event.carId,
    });
  }

  private async _authenticate(client: Socket): Promise<AuthSession | null> {
    const cookieName = this.authService.getExternalAuthCookieName();
    const token = getCookieValue(client.handshake.headers.cookie, cookieName);

    if (!token) {
      return null;
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
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
