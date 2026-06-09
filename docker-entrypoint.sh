#!/bin/sh
set -eu

if [ -z "${DB_URL:-}" ] && [ -n "${DB_HOST:-}" ] && [ -n "${DB_NAME:-}" ]; then
  DB_URL="jdbc:postgresql://${DB_HOST}:${DB_PORT:-5432}/${DB_NAME}"
  export DB_URL
fi

if [ -z "${DB_URL:-}" ] && [ -n "${PGHOST:-}" ] && [ -n "${PGDATABASE:-}" ]; then
  DB_URL="jdbc:postgresql://${PGHOST}:${PGPORT:-5432}/${PGDATABASE}"
  export DB_URL
fi

if [ -z "${DB_USERNAME:-}" ] && [ -n "${PGUSER:-}" ]; then
  DB_USERNAME="${PGUSER}"
  export DB_USERNAME
fi

if [ -z "${DB_PASSWORD:-}" ] && [ -n "${PGPASSWORD:-}" ]; then
  DB_PASSWORD="${PGPASSWORD}"
  export DB_PASSWORD
fi

if [ -z "${DB_URL:-}" ] && [ -n "${DATABASE_URL:-}" ]; then
  database_url_without_scheme="${DATABASE_URL#*://}"
  database_credentials="${database_url_without_scheme%@*}"
  database_host_path="${database_url_without_scheme#*@}"
  database_host_port="${database_host_path%%/*}"
  database_name_with_query="${database_host_path#*/}"
  database_name="${database_name_with_query%%\?*}"
  database_host="${database_host_port%%:*}"
  database_port="${database_host_port#*:}"

  if [ "${database_port}" = "${database_host_port}" ]; then
    database_port="5432"
  fi

  DB_URL="jdbc:postgresql://${database_host}:${database_port}/${database_name}"
  export DB_URL

  if [ -z "${DB_USERNAME:-}" ]; then
    DB_USERNAME="${database_credentials%%:*}"
    export DB_USERNAME
  fi

  if [ -z "${DB_PASSWORD:-}" ]; then
    DB_PASSWORD="${database_credentials#*:}"
    export DB_PASSWORD
  fi
fi

exec java -jar /app/app.jar
