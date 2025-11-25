# Utiliser l'image officielle PostgreSQL 15 en version alpine
FROM postgres:18-alpine

# Copier le script d'initialisation dans le dossier d'init de PostgreSQL
COPY init.sql /docker-entrypoint-initdb.d/init.sql

# Exposer le port par défaut PostgreSQL
EXPOSE 5432
