#!/bin/sh
set -eu

CERT_DIR="/etc/nginx/certs/animelog.top"
FULLCHAIN="${CERT_DIR}/fullchain.pem"
PRIVKEY="${CERT_DIR}/privkey.pem"
HTTP_CONF="/etc/nginx/config-templates/http.conf"
HTTPS_CONF="/etc/nginx/config-templates/https.conf"
TARGET_CONF="/etc/nginx/nginx.conf"

if [ -s "${FULLCHAIN}" ] && [ -s "${PRIVKEY}" ]; then
    cp "${HTTPS_CONF}" "${TARGET_CONF}"
    echo "Using HTTPS nginx configuration"
else
    cp "${HTTP_CONF}" "${TARGET_CONF}"
    echo "Using HTTP-only nginx configuration"
fi
