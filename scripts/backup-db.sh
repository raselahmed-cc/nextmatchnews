#!/bin/bash
# Daily backup for the self-hosted Postgres container — Neon's managed
# backups/PITR don't exist here, so this is the replacement. Dumps to a
# gzipped file and prunes anything older than 14 days. Intended to run via
# cron on the VPS host (not inside a container), e.g.:
#   0 3 * * * /opt/nextmatchnews/scripts/backup-db.sh >> /var/log/nextmatchnews-backup.log 2>&1
set -euo pipefail

APP_DIR="/opt/nextmatchnews"
BACKUP_DIR="$APP_DIR/backups"
RETENTION_DAYS=14
STAMP=$(date +%F-%H%M)

mkdir -p "$BACKUP_DIR"

set -a
source "$APP_DIR/.env"
set +a

docker exec nextmatchnews-postgres pg_dump -U "$POSTGRES_USER" nextmatchnews \
  | gzip > "$BACKUP_DIR/nextmatchnews-$STAMP.sql.gz"

find "$BACKUP_DIR" -name 'nextmatchnews-*.sql.gz' -mtime +$RETENTION_DAYS -delete

echo "$(date -Iseconds) backup complete: nextmatchnews-$STAMP.sql.gz"
