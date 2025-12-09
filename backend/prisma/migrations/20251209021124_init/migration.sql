-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "full_name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "last_login" DATETIME
);

-- CreateTable
CREATE TABLE "people" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "handle" TEXT NOT NULL,
    "gramps_id" TEXT NOT NULL,
    "gender" INTEGER NOT NULL DEFAULT 2,
    "private" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "first_name" TEXT,
    "surname" TEXT,
    "call_name" TEXT,
    "name_prefix" TEXT,
    "name_suffix" TEXT,
    "title" TEXT,
    "birth_date" TEXT,
    "birth_place" TEXT,
    "death_date" TEXT,
    "death_place" TEXT
);

-- CreateTable
CREATE TABLE "families" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "handle" TEXT NOT NULL,
    "gramps_id" TEXT NOT NULL,
    "father_handle" TEXT,
    "mother_handle" TEXT,
    "family_type" INTEGER NOT NULL DEFAULT 0,
    "private" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "handle" TEXT NOT NULL,
    "gramps_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "description" TEXT,
    "date" TEXT,
    "place" TEXT,
    "private" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "places" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "handle" TEXT NOT NULL,
    "gramps_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "place_type" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "private" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "sources" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "handle" TEXT NOT NULL,
    "gramps_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT,
    "pub_info" TEXT,
    "abbrev" TEXT,
    "private" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "citations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "handle" TEXT NOT NULL,
    "gramps_id" TEXT NOT NULL,
    "source_handle" TEXT NOT NULL,
    "page" TEXT,
    "confidence" INTEGER NOT NULL DEFAULT 0,
    "private" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "repositories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "handle" TEXT NOT NULL,
    "gramps_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "repository_type" TEXT,
    "private" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "media" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "handle" TEXT NOT NULL,
    "gramps_id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "description" TEXT,
    "checksum" TEXT,
    "private" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "notes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "handle" TEXT NOT NULL,
    "gramps_id" TEXT NOT NULL,
    "note_type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "private" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "tree_settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "people_handle_key" ON "people"("handle");

-- CreateIndex
CREATE UNIQUE INDEX "people_gramps_id_key" ON "people"("gramps_id");

-- CreateIndex
CREATE INDEX "people_gramps_id_idx" ON "people"("gramps_id");

-- CreateIndex
CREATE INDEX "people_surname_idx" ON "people"("surname");

-- CreateIndex
CREATE INDEX "people_first_name_idx" ON "people"("first_name");

-- CreateIndex
CREATE UNIQUE INDEX "families_handle_key" ON "families"("handle");

-- CreateIndex
CREATE UNIQUE INDEX "families_gramps_id_key" ON "families"("gramps_id");

-- CreateIndex
CREATE INDEX "families_gramps_id_idx" ON "families"("gramps_id");

-- CreateIndex
CREATE UNIQUE INDEX "events_handle_key" ON "events"("handle");

-- CreateIndex
CREATE UNIQUE INDEX "events_gramps_id_key" ON "events"("gramps_id");

-- CreateIndex
CREATE INDEX "events_gramps_id_idx" ON "events"("gramps_id");

-- CreateIndex
CREATE INDEX "events_event_type_idx" ON "events"("event_type");

-- CreateIndex
CREATE UNIQUE INDEX "places_handle_key" ON "places"("handle");

-- CreateIndex
CREATE UNIQUE INDEX "places_gramps_id_key" ON "places"("gramps_id");

-- CreateIndex
CREATE INDEX "places_gramps_id_idx" ON "places"("gramps_id");

-- CreateIndex
CREATE INDEX "places_name_idx" ON "places"("name");

-- CreateIndex
CREATE UNIQUE INDEX "sources_handle_key" ON "sources"("handle");

-- CreateIndex
CREATE UNIQUE INDEX "sources_gramps_id_key" ON "sources"("gramps_id");

-- CreateIndex
CREATE INDEX "sources_gramps_id_idx" ON "sources"("gramps_id");

-- CreateIndex
CREATE INDEX "sources_title_idx" ON "sources"("title");

-- CreateIndex
CREATE UNIQUE INDEX "citations_handle_key" ON "citations"("handle");

-- CreateIndex
CREATE UNIQUE INDEX "citations_gramps_id_key" ON "citations"("gramps_id");

-- CreateIndex
CREATE INDEX "citations_gramps_id_idx" ON "citations"("gramps_id");

-- CreateIndex
CREATE INDEX "citations_source_handle_idx" ON "citations"("source_handle");

-- CreateIndex
CREATE UNIQUE INDEX "repositories_handle_key" ON "repositories"("handle");

-- CreateIndex
CREATE UNIQUE INDEX "repositories_gramps_id_key" ON "repositories"("gramps_id");

-- CreateIndex
CREATE INDEX "repositories_gramps_id_idx" ON "repositories"("gramps_id");

-- CreateIndex
CREATE INDEX "repositories_name_idx" ON "repositories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "media_handle_key" ON "media"("handle");

-- CreateIndex
CREATE UNIQUE INDEX "media_gramps_id_key" ON "media"("gramps_id");

-- CreateIndex
CREATE INDEX "media_gramps_id_idx" ON "media"("gramps_id");

-- CreateIndex
CREATE UNIQUE INDEX "notes_handle_key" ON "notes"("handle");

-- CreateIndex
CREATE UNIQUE INDEX "notes_gramps_id_key" ON "notes"("gramps_id");

-- CreateIndex
CREATE INDEX "notes_gramps_id_idx" ON "notes"("gramps_id");

-- CreateIndex
CREATE UNIQUE INDEX "tree_settings_key_key" ON "tree_settings"("key");
