#!/usr/bin/env bash
# Certbot deploy hook: refresh Mosquitto TLS files and restart the broker.
# Install on the VPS:
#   sudo install -m 755 infra/mosquitto/scripts/deploy-tls-certs.sh \
#     /etc/letsencrypt/renewal-hooks/deploy/mosquitto.sh
set -euo pipefail

DOMAIN="mqtt.inergy.ir"
CERT_DIR="/etc/mosquitto/certs"
CONTAINER_NAME="fuel-carrier-mosquitto"
# iegomez/mosquitto-go-auth runs as uid/gid 1000 inside the container.
MOSQUITTO_GID="1000"

if [[ "${RENEWED_DOMAINS:-}" != *"${DOMAIN}"* ]]; then
  exit 0
fi

lineage="${RENEWED_LINEAGE:-/etc/letsencrypt/live/${DOMAIN}}"

# Public certificate — readable by anyone (this is normal for TLS certs).
install -m 644 -o root -g root "${lineage}/fullchain.pem" "${CERT_DIR}/fullchain.pem"

# Private key — only root and the broker process (gid 1000) may read it.
install -m 640 -o root -g "${MOSQUITTO_GID}" "${lineage}/privkey.pem" "${CERT_DIR}/privkey.pem"

if docker ps --format '{{.Names}}' | grep -qx "${CONTAINER_NAME}"; then
  docker restart "${CONTAINER_NAME}"
fi
