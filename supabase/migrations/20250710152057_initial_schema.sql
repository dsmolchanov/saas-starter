create schema if not exists "drizzle";

create sequence "drizzle"."__drizzle_migrations_id_seq";

create table "drizzle"."__drizzle_migrations" (
    "id" integer not null default nextval('drizzle.__drizzle_migrations_id_seq'::regclass),
    "hash" text not null,
    "created_at" bigint
);


alter sequence "drizzle"."__drizzle_migrations_id_seq" owned by "drizzle"."__drizzle_migrations"."id";

CREATE UNIQUE INDEX __drizzle_migrations_pkey ON drizzle.__drizzle_migrations USING btree (id);

alter table "drizzle"."__drizzle_migrations" add constraint "__drizzle_migrations_pkey" PRIMARY KEY using index "__drizzle_migrations_pkey";


create sequence "public"."activity_logs_id_seq";

create sequence "public"."categories_id_seq";

create sequence "public"."courses_id_seq";

create sequence "public"."focus_areas_id_seq";

create sequence "public"."invitations_id_seq";

create sequence "public"."lesson_focus_areas_id_seq";

create sequence "public"."lessons_id_seq";

create sequence "public"."playlist_items_id_seq";

create sequence "public"."playlists_id_seq";

create sequence "public"."progress_id_seq";

create sequence "public"."subscriptions_id_seq";

create sequence "public"."team_members_id_seq";

create sequence "public"."teams_id_seq";

create sequence "public"."users_id_seq";

create table "public"."activity_logs" (
    "id" integer not null default nextval('activity_logs_id_seq'::regclass),
    "team_id" integer not null,
    "user_id" integer,
    "action" text not null,
    "timestamp" timestamp without time zone not null default now(),
    "ip_address" character varying(45)
);


create table "public"."categories" (
    "id" integer not null default nextval('categories_id_seq'::regclass),
    "slug" character varying(50) not null,
    "title" character varying(100) not null,
    "icon" character varying(100)
);


create table "public"."courses" (
    "id" integer not null default nextval('courses_id_seq'::regclass),
    "category_id" integer not null,
    "teacher_id" integer not null,
    "title" character varying(150) not null,
    "description" text,
    "level" character varying(50),
    "cover_url" text,
    "is_published" integer not null default 0,
    "image_url" text
);


create table "public"."focus_areas" (
    "id" integer not null default nextval('focus_areas_id_seq'::regclass),
    "name" character varying(50) not null,
    "icon" character varying(50)
);


create table "public"."invitations" (
    "id" integer not null default nextval('invitations_id_seq'::regclass),
    "team_id" integer not null,
    "email" character varying(255) not null,
    "role" character varying(50) not null,
    "invited_by" integer not null,
    "invited_at" timestamp without time zone not null default now(),
    "status" character varying(20) not null default 'pending'::character varying
);


create table "public"."lesson_focus_areas" (
    "id" integer not null default nextval('lesson_focus_areas_id_seq'::regclass),
    "lesson_id" integer not null,
    "focus_area_id" integer not null
);


create table "public"."lessons" (
    "id" integer not null default nextval('lessons_id_seq'::regclass),
    "course_id" integer,
    "title" character varying(150) not null,
    "duration_min" integer not null default 0,
    "video_path" text,
    "order_index" integer,
    "description" text,
    "thumbnail_url" text,
    "difficulty" character varying(20),
    "intensity" character varying(20),
    "style" character varying(50),
    "equipment" text,
    "created_at" timestamp without time zone not null default now(),
    "updated_at" timestamp without time zone not null default now(),
    "image_url" text
);


create table "public"."playlist_items" (
    "id" integer not null default nextval('playlist_items_id_seq'::regclass),
    "playlist_id" integer not null,
    "item_type" character varying(20) not null,
    "item_id" integer not null,
    "order_index" integer not null default 0,
    "added_at" timestamp without time zone not null default now(),
    "added_by" integer
);


create table "public"."playlists" (
    "id" integer not null default nextval('playlists_id_seq'::regclass),
    "user_id" integer not null,
    "name" character varying(100) not null,
    "description" text,
    "is_public" integer not null default 0,
    "is_system" integer not null default 0,
    "playlist_type" character varying(20) not null default 'custom'::character varying,
    "cover_url" text,
    "created_at" timestamp without time zone not null default now(),
    "updated_at" timestamp without time zone not null default now()
);


create table "public"."progress" (
    "id" integer not null default nextval('progress_id_seq'::regclass),
    "user_id" integer not null,
    "lesson_id" integer not null,
    "completed_at" timestamp without time zone not null default now()
);


create table "public"."subscriptions" (
    "id" integer not null default nextval('subscriptions_id_seq'::regclass),
    "user_id" integer not null,
    "stripe_customer_id" text,
    "status" character varying(20) not null,
    "current_period_end" timestamp without time zone
);


create table "public"."teachers" (
    "id" integer not null,
    "bio" text,
    "instagram_url" character varying(255),
    "revenue_share" integer not null default 0
);


create table "public"."team_members" (
    "id" integer not null default nextval('team_members_id_seq'::regclass),
    "user_id" integer not null,
    "team_id" integer not null,
    "role" character varying(50) not null,
    "joined_at" timestamp without time zone not null default now()
);


create table "public"."teams" (
    "id" integer not null default nextval('teams_id_seq'::regclass),
    "name" character varying(100) not null,
    "created_at" timestamp without time zone not null default now(),
    "updated_at" timestamp without time zone not null default now(),
    "stripe_customer_id" text,
    "stripe_subscription_id" text,
    "stripe_product_id" text,
    "plan_name" character varying(50),
    "subscription_status" character varying(20)
);


create table "public"."users" (
    "id" integer not null default nextval('users_id_seq'::regclass),
    "name" character varying(100),
    "email" character varying(255) not null,
    "password_hash" text not null,
    "role" character varying(20) not null default 'member'::character varying,
    "created_at" timestamp without time zone not null default now(),
    "updated_at" timestamp without time zone not null default now(),
    "deleted_at" timestamp without time zone,
    "auth_uid" uuid,
    "avatar_url" text
);


alter sequence "public"."activity_logs_id_seq" owned by "public"."activity_logs"."id";

alter sequence "public"."categories_id_seq" owned by "public"."categories"."id";

alter sequence "public"."courses_id_seq" owned by "public"."courses"."id";

alter sequence "public"."focus_areas_id_seq" owned by "public"."focus_areas"."id";

alter sequence "public"."invitations_id_seq" owned by "public"."invitations"."id";

alter sequence "public"."lesson_focus_areas_id_seq" owned by "public"."lesson_focus_areas"."id";

alter sequence "public"."lessons_id_seq" owned by "public"."lessons"."id";

alter sequence "public"."playlist_items_id_seq" owned by "public"."playlist_items"."id";

alter sequence "public"."playlists_id_seq" owned by "public"."playlists"."id";

alter sequence "public"."progress_id_seq" owned by "public"."progress"."id";

alter sequence "public"."subscriptions_id_seq" owned by "public"."subscriptions"."id";

alter sequence "public"."team_members_id_seq" owned by "public"."team_members"."id";

alter sequence "public"."teams_id_seq" owned by "public"."teams"."id";

alter sequence "public"."users_id_seq" owned by "public"."users"."id";

CREATE UNIQUE INDEX activity_logs_pkey ON public.activity_logs USING btree (id);

CREATE UNIQUE INDEX categories_pkey ON public.categories USING btree (id);

CREATE UNIQUE INDEX categories_slug_unique ON public.categories USING btree (slug);

CREATE UNIQUE INDEX courses_pkey ON public.courses USING btree (id);

CREATE UNIQUE INDEX focus_areas_name_unique ON public.focus_areas USING btree (name);

CREATE UNIQUE INDEX focus_areas_pkey ON public.focus_areas USING btree (id);

CREATE UNIQUE INDEX invitations_pkey ON public.invitations USING btree (id);

CREATE UNIQUE INDEX lesson_focus_areas_pkey ON public.lesson_focus_areas USING btree (id);

CREATE UNIQUE INDEX lessons_pkey ON public.lessons USING btree (id);

CREATE UNIQUE INDEX playlist_items_pkey ON public.playlist_items USING btree (id);

CREATE UNIQUE INDEX playlists_pkey ON public.playlists USING btree (id);

CREATE UNIQUE INDEX progress_pkey ON public.progress USING btree (id);

CREATE UNIQUE INDEX subscriptions_pkey ON public.subscriptions USING btree (id);

CREATE UNIQUE INDEX subscriptions_stripe_customer_id_unique ON public.subscriptions USING btree (stripe_customer_id);

CREATE UNIQUE INDEX teachers_pkey ON public.teachers USING btree (id);

CREATE UNIQUE INDEX team_members_pkey ON public.team_members USING btree (id);

CREATE UNIQUE INDEX teams_pkey ON public.teams USING btree (id);

CREATE UNIQUE INDEX teams_stripe_customer_id_unique ON public.teams USING btree (stripe_customer_id);

CREATE UNIQUE INDEX teams_stripe_subscription_id_unique ON public.teams USING btree (stripe_subscription_id);

CREATE UNIQUE INDEX unique_playlist_item ON public.playlist_items USING btree (playlist_id, item_type, item_id);

CREATE UNIQUE INDEX users_email_unique ON public.users USING btree (email);

CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);

alter table "public"."activity_logs" add constraint "activity_logs_pkey" PRIMARY KEY using index "activity_logs_pkey";

alter table "public"."categories" add constraint "categories_pkey" PRIMARY KEY using index "categories_pkey";

alter table "public"."courses" add constraint "courses_pkey" PRIMARY KEY using index "courses_pkey";

alter table "public"."focus_areas" add constraint "focus_areas_pkey" PRIMARY KEY using index "focus_areas_pkey";

alter table "public"."invitations" add constraint "invitations_pkey" PRIMARY KEY using index "invitations_pkey";

alter table "public"."lesson_focus_areas" add constraint "lesson_focus_areas_pkey" PRIMARY KEY using index "lesson_focus_areas_pkey";

alter table "public"."lessons" add constraint "lessons_pkey" PRIMARY KEY using index "lessons_pkey";

alter table "public"."playlist_items" add constraint "playlist_items_pkey" PRIMARY KEY using index "playlist_items_pkey";

alter table "public"."playlists" add constraint "playlists_pkey" PRIMARY KEY using index "playlists_pkey";

alter table "public"."progress" add constraint "progress_pkey" PRIMARY KEY using index "progress_pkey";

alter table "public"."subscriptions" add constraint "subscriptions_pkey" PRIMARY KEY using index "subscriptions_pkey";

alter table "public"."teachers" add constraint "teachers_pkey" PRIMARY KEY using index "teachers_pkey";

alter table "public"."team_members" add constraint "team_members_pkey" PRIMARY KEY using index "team_members_pkey";

alter table "public"."teams" add constraint "teams_pkey" PRIMARY KEY using index "teams_pkey";

alter table "public"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";

alter table "public"."activity_logs" add constraint "activity_logs_team_id_teams_id_fk" FOREIGN KEY (team_id) REFERENCES teams(id) not valid;

alter table "public"."activity_logs" validate constraint "activity_logs_team_id_teams_id_fk";

alter table "public"."activity_logs" add constraint "activity_logs_user_id_users_id_fk" FOREIGN KEY (user_id) REFERENCES users(id) not valid;

alter table "public"."activity_logs" validate constraint "activity_logs_user_id_users_id_fk";

alter table "public"."categories" add constraint "categories_slug_unique" UNIQUE using index "categories_slug_unique";

alter table "public"."courses" add constraint "courses_category_id_categories_id_fk" FOREIGN KEY (category_id) REFERENCES categories(id) not valid;

alter table "public"."courses" validate constraint "courses_category_id_categories_id_fk";

alter table "public"."courses" add constraint "courses_teacher_id_users_id_fk" FOREIGN KEY (teacher_id) REFERENCES users(id) not valid;

alter table "public"."courses" validate constraint "courses_teacher_id_users_id_fk";

alter table "public"."focus_areas" add constraint "focus_areas_name_unique" UNIQUE using index "focus_areas_name_unique";

alter table "public"."invitations" add constraint "invitations_invited_by_users_id_fk" FOREIGN KEY (invited_by) REFERENCES users(id) not valid;

alter table "public"."invitations" validate constraint "invitations_invited_by_users_id_fk";

alter table "public"."invitations" add constraint "invitations_team_id_teams_id_fk" FOREIGN KEY (team_id) REFERENCES teams(id) not valid;

alter table "public"."invitations" validate constraint "invitations_team_id_teams_id_fk";

alter table "public"."lesson_focus_areas" add constraint "lesson_focus_areas_focus_area_id_focus_areas_id_fk" FOREIGN KEY (focus_area_id) REFERENCES focus_areas(id) not valid;

alter table "public"."lesson_focus_areas" validate constraint "lesson_focus_areas_focus_area_id_focus_areas_id_fk";

alter table "public"."lesson_focus_areas" add constraint "lesson_focus_areas_lesson_id_lessons_id_fk" FOREIGN KEY (lesson_id) REFERENCES lessons(id) not valid;

alter table "public"."lesson_focus_areas" validate constraint "lesson_focus_areas_lesson_id_lessons_id_fk";

alter table "public"."lessons" add constraint "lessons_course_id_courses_id_fk" FOREIGN KEY (course_id) REFERENCES courses(id) not valid;

alter table "public"."lessons" validate constraint "lessons_course_id_courses_id_fk";

alter table "public"."playlist_items" add constraint "playlist_items_added_by_users_id_fk" FOREIGN KEY (added_by) REFERENCES users(id) not valid;

alter table "public"."playlist_items" validate constraint "playlist_items_added_by_users_id_fk";

alter table "public"."playlist_items" add constraint "playlist_items_playlist_id_playlists_id_fk" FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE not valid;

alter table "public"."playlist_items" validate constraint "playlist_items_playlist_id_playlists_id_fk";

alter table "public"."playlist_items" add constraint "unique_playlist_item" UNIQUE using index "unique_playlist_item";

alter table "public"."playlists" add constraint "playlists_user_id_users_id_fk" FOREIGN KEY (user_id) REFERENCES users(id) not valid;

alter table "public"."playlists" validate constraint "playlists_user_id_users_id_fk";

alter table "public"."progress" add constraint "progress_lesson_id_lessons_id_fk" FOREIGN KEY (lesson_id) REFERENCES lessons(id) not valid;

alter table "public"."progress" validate constraint "progress_lesson_id_lessons_id_fk";

alter table "public"."progress" add constraint "progress_user_id_users_id_fk" FOREIGN KEY (user_id) REFERENCES users(id) not valid;

alter table "public"."progress" validate constraint "progress_user_id_users_id_fk";

alter table "public"."subscriptions" add constraint "subscriptions_stripe_customer_id_unique" UNIQUE using index "subscriptions_stripe_customer_id_unique";

alter table "public"."subscriptions" add constraint "subscriptions_user_id_users_id_fk" FOREIGN KEY (user_id) REFERENCES users(id) not valid;

alter table "public"."subscriptions" validate constraint "subscriptions_user_id_users_id_fk";

alter table "public"."teachers" add constraint "teachers_id_users_id_fk" FOREIGN KEY (id) REFERENCES users(id) not valid;

alter table "public"."teachers" validate constraint "teachers_id_users_id_fk";

alter table "public"."team_members" add constraint "team_members_team_id_teams_id_fk" FOREIGN KEY (team_id) REFERENCES teams(id) not valid;

alter table "public"."team_members" validate constraint "team_members_team_id_teams_id_fk";

alter table "public"."team_members" add constraint "team_members_user_id_users_id_fk" FOREIGN KEY (user_id) REFERENCES users(id) not valid;

alter table "public"."team_members" validate constraint "team_members_user_id_users_id_fk";

alter table "public"."teams" add constraint "teams_stripe_customer_id_unique" UNIQUE using index "teams_stripe_customer_id_unique";

alter table "public"."teams" add constraint "teams_stripe_subscription_id_unique" UNIQUE using index "teams_stripe_subscription_id_unique";

alter table "public"."users" add constraint "users_email_unique" UNIQUE using index "users_email_unique";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
    BEGIN
      EXECUTE sql;
    END;
    $function$
;

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
declare
  full_name text;
begin
  full_name := coalesce(NEW.raw_user_meta_data ->> 'full_name', NEW.email);

  insert into public.users (email, name, auth_uid, role, created_at, updated_at)
  values (NEW.email, full_name, NEW.id, 'member', now(), now())

  -- key line ↓  make auth_uid the conflict target
  on conflict (auth_uid) do update
  set
    email       = excluded.email,     -- keep email in sync if user changes primary address
    name        = excluded.name,
    updated_at  = now();

  return new;
end;
$function$
;

grant delete on table "public"."activity_logs" to "anon";

grant insert on table "public"."activity_logs" to "anon";

grant references on table "public"."activity_logs" to "anon";

grant select on table "public"."activity_logs" to "anon";

grant trigger on table "public"."activity_logs" to "anon";

grant truncate on table "public"."activity_logs" to "anon";

grant update on table "public"."activity_logs" to "anon";

grant delete on table "public"."activity_logs" to "authenticated";

grant insert on table "public"."activity_logs" to "authenticated";

grant references on table "public"."activity_logs" to "authenticated";

grant select on table "public"."activity_logs" to "authenticated";

grant trigger on table "public"."activity_logs" to "authenticated";

grant truncate on table "public"."activity_logs" to "authenticated";

grant update on table "public"."activity_logs" to "authenticated";

grant delete on table "public"."activity_logs" to "service_role";

grant insert on table "public"."activity_logs" to "service_role";

grant references on table "public"."activity_logs" to "service_role";

grant select on table "public"."activity_logs" to "service_role";

grant trigger on table "public"."activity_logs" to "service_role";

grant truncate on table "public"."activity_logs" to "service_role";

grant update on table "public"."activity_logs" to "service_role";

grant delete on table "public"."categories" to "anon";

grant insert on table "public"."categories" to "anon";

grant references on table "public"."categories" to "anon";

grant select on table "public"."categories" to "anon";

grant trigger on table "public"."categories" to "anon";

grant truncate on table "public"."categories" to "anon";

grant update on table "public"."categories" to "anon";

grant delete on table "public"."categories" to "authenticated";

grant insert on table "public"."categories" to "authenticated";

grant references on table "public"."categories" to "authenticated";

grant select on table "public"."categories" to "authenticated";

grant trigger on table "public"."categories" to "authenticated";

grant truncate on table "public"."categories" to "authenticated";

grant update on table "public"."categories" to "authenticated";

grant delete on table "public"."categories" to "service_role";

grant insert on table "public"."categories" to "service_role";

grant references on table "public"."categories" to "service_role";

grant select on table "public"."categories" to "service_role";

grant trigger on table "public"."categories" to "service_role";

grant truncate on table "public"."categories" to "service_role";

grant update on table "public"."categories" to "service_role";

grant delete on table "public"."courses" to "anon";

grant insert on table "public"."courses" to "anon";

grant references on table "public"."courses" to "anon";

grant select on table "public"."courses" to "anon";

grant trigger on table "public"."courses" to "anon";

grant truncate on table "public"."courses" to "anon";

grant update on table "public"."courses" to "anon";

grant delete on table "public"."courses" to "authenticated";

grant insert on table "public"."courses" to "authenticated";

grant references on table "public"."courses" to "authenticated";

grant select on table "public"."courses" to "authenticated";

grant trigger on table "public"."courses" to "authenticated";

grant truncate on table "public"."courses" to "authenticated";

grant update on table "public"."courses" to "authenticated";

grant delete on table "public"."courses" to "service_role";

grant insert on table "public"."courses" to "service_role";

grant references on table "public"."courses" to "service_role";

grant select on table "public"."courses" to "service_role";

grant trigger on table "public"."courses" to "service_role";

grant truncate on table "public"."courses" to "service_role";

grant update on table "public"."courses" to "service_role";

grant delete on table "public"."focus_areas" to "anon";

grant insert on table "public"."focus_areas" to "anon";

grant references on table "public"."focus_areas" to "anon";

grant select on table "public"."focus_areas" to "anon";

grant trigger on table "public"."focus_areas" to "anon";

grant truncate on table "public"."focus_areas" to "anon";

grant update on table "public"."focus_areas" to "anon";

grant delete on table "public"."focus_areas" to "authenticated";

grant insert on table "public"."focus_areas" to "authenticated";

grant references on table "public"."focus_areas" to "authenticated";

grant select on table "public"."focus_areas" to "authenticated";

grant trigger on table "public"."focus_areas" to "authenticated";

grant truncate on table "public"."focus_areas" to "authenticated";

grant update on table "public"."focus_areas" to "authenticated";

grant delete on table "public"."focus_areas" to "service_role";

grant insert on table "public"."focus_areas" to "service_role";

grant references on table "public"."focus_areas" to "service_role";

grant select on table "public"."focus_areas" to "service_role";

grant trigger on table "public"."focus_areas" to "service_role";

grant truncate on table "public"."focus_areas" to "service_role";

grant update on table "public"."focus_areas" to "service_role";

grant delete on table "public"."invitations" to "anon";

grant insert on table "public"."invitations" to "anon";

grant references on table "public"."invitations" to "anon";

grant select on table "public"."invitations" to "anon";

grant trigger on table "public"."invitations" to "anon";

grant truncate on table "public"."invitations" to "anon";

grant update on table "public"."invitations" to "anon";

grant delete on table "public"."invitations" to "authenticated";

grant insert on table "public"."invitations" to "authenticated";

grant references on table "public"."invitations" to "authenticated";

grant select on table "public"."invitations" to "authenticated";

grant trigger on table "public"."invitations" to "authenticated";

grant truncate on table "public"."invitations" to "authenticated";

grant update on table "public"."invitations" to "authenticated";

grant delete on table "public"."invitations" to "service_role";

grant insert on table "public"."invitations" to "service_role";

grant references on table "public"."invitations" to "service_role";

grant select on table "public"."invitations" to "service_role";

grant trigger on table "public"."invitations" to "service_role";

grant truncate on table "public"."invitations" to "service_role";

grant update on table "public"."invitations" to "service_role";

grant delete on table "public"."lesson_focus_areas" to "anon";

grant insert on table "public"."lesson_focus_areas" to "anon";

grant references on table "public"."lesson_focus_areas" to "anon";

grant select on table "public"."lesson_focus_areas" to "anon";

grant trigger on table "public"."lesson_focus_areas" to "anon";

grant truncate on table "public"."lesson_focus_areas" to "anon";

grant update on table "public"."lesson_focus_areas" to "anon";

grant delete on table "public"."lesson_focus_areas" to "authenticated";

grant insert on table "public"."lesson_focus_areas" to "authenticated";

grant references on table "public"."lesson_focus_areas" to "authenticated";

grant select on table "public"."lesson_focus_areas" to "authenticated";

grant trigger on table "public"."lesson_focus_areas" to "authenticated";

grant truncate on table "public"."lesson_focus_areas" to "authenticated";

grant update on table "public"."lesson_focus_areas" to "authenticated";

grant delete on table "public"."lesson_focus_areas" to "service_role";

grant insert on table "public"."lesson_focus_areas" to "service_role";

grant references on table "public"."lesson_focus_areas" to "service_role";

grant select on table "public"."lesson_focus_areas" to "service_role";

grant trigger on table "public"."lesson_focus_areas" to "service_role";

grant truncate on table "public"."lesson_focus_areas" to "service_role";

grant update on table "public"."lesson_focus_areas" to "service_role";

grant delete on table "public"."lessons" to "anon";

grant insert on table "public"."lessons" to "anon";

grant references on table "public"."lessons" to "anon";

grant select on table "public"."lessons" to "anon";

grant trigger on table "public"."lessons" to "anon";

grant truncate on table "public"."lessons" to "anon";

grant update on table "public"."lessons" to "anon";

grant delete on table "public"."lessons" to "authenticated";

grant insert on table "public"."lessons" to "authenticated";

grant references on table "public"."lessons" to "authenticated";

grant select on table "public"."lessons" to "authenticated";

grant trigger on table "public"."lessons" to "authenticated";

grant truncate on table "public"."lessons" to "authenticated";

grant update on table "public"."lessons" to "authenticated";

grant delete on table "public"."lessons" to "service_role";

grant insert on table "public"."lessons" to "service_role";

grant references on table "public"."lessons" to "service_role";

grant select on table "public"."lessons" to "service_role";

grant trigger on table "public"."lessons" to "service_role";

grant truncate on table "public"."lessons" to "service_role";

grant update on table "public"."lessons" to "service_role";

grant delete on table "public"."playlist_items" to "anon";

grant insert on table "public"."playlist_items" to "anon";

grant references on table "public"."playlist_items" to "anon";

grant select on table "public"."playlist_items" to "anon";

grant trigger on table "public"."playlist_items" to "anon";

grant truncate on table "public"."playlist_items" to "anon";

grant update on table "public"."playlist_items" to "anon";

grant delete on table "public"."playlist_items" to "authenticated";

grant insert on table "public"."playlist_items" to "authenticated";

grant references on table "public"."playlist_items" to "authenticated";

grant select on table "public"."playlist_items" to "authenticated";

grant trigger on table "public"."playlist_items" to "authenticated";

grant truncate on table "public"."playlist_items" to "authenticated";

grant update on table "public"."playlist_items" to "authenticated";

grant delete on table "public"."playlist_items" to "service_role";

grant insert on table "public"."playlist_items" to "service_role";

grant references on table "public"."playlist_items" to "service_role";

grant select on table "public"."playlist_items" to "service_role";

grant trigger on table "public"."playlist_items" to "service_role";

grant truncate on table "public"."playlist_items" to "service_role";

grant update on table "public"."playlist_items" to "service_role";

grant delete on table "public"."playlists" to "anon";

grant insert on table "public"."playlists" to "anon";

grant references on table "public"."playlists" to "anon";

grant select on table "public"."playlists" to "anon";

grant trigger on table "public"."playlists" to "anon";

grant truncate on table "public"."playlists" to "anon";

grant update on table "public"."playlists" to "anon";

grant delete on table "public"."playlists" to "authenticated";

grant insert on table "public"."playlists" to "authenticated";

grant references on table "public"."playlists" to "authenticated";

grant select on table "public"."playlists" to "authenticated";

grant trigger on table "public"."playlists" to "authenticated";

grant truncate on table "public"."playlists" to "authenticated";

grant update on table "public"."playlists" to "authenticated";

grant delete on table "public"."playlists" to "service_role";

grant insert on table "public"."playlists" to "service_role";

grant references on table "public"."playlists" to "service_role";

grant select on table "public"."playlists" to "service_role";

grant trigger on table "public"."playlists" to "service_role";

grant truncate on table "public"."playlists" to "service_role";

grant update on table "public"."playlists" to "service_role";

grant delete on table "public"."progress" to "anon";

grant insert on table "public"."progress" to "anon";

grant references on table "public"."progress" to "anon";

grant select on table "public"."progress" to "anon";

grant trigger on table "public"."progress" to "anon";

grant truncate on table "public"."progress" to "anon";

grant update on table "public"."progress" to "anon";

grant delete on table "public"."progress" to "authenticated";

grant insert on table "public"."progress" to "authenticated";

grant references on table "public"."progress" to "authenticated";

grant select on table "public"."progress" to "authenticated";

grant trigger on table "public"."progress" to "authenticated";

grant truncate on table "public"."progress" to "authenticated";

grant update on table "public"."progress" to "authenticated";

grant delete on table "public"."progress" to "service_role";

grant insert on table "public"."progress" to "service_role";

grant references on table "public"."progress" to "service_role";

grant select on table "public"."progress" to "service_role";

grant trigger on table "public"."progress" to "service_role";

grant truncate on table "public"."progress" to "service_role";

grant update on table "public"."progress" to "service_role";

grant delete on table "public"."subscriptions" to "anon";

grant insert on table "public"."subscriptions" to "anon";

grant references on table "public"."subscriptions" to "anon";

grant select on table "public"."subscriptions" to "anon";

grant trigger on table "public"."subscriptions" to "anon";

grant truncate on table "public"."subscriptions" to "anon";

grant update on table "public"."subscriptions" to "anon";

grant delete on table "public"."subscriptions" to "authenticated";

grant insert on table "public"."subscriptions" to "authenticated";

grant references on table "public"."subscriptions" to "authenticated";

grant select on table "public"."subscriptions" to "authenticated";

grant trigger on table "public"."subscriptions" to "authenticated";

grant truncate on table "public"."subscriptions" to "authenticated";

grant update on table "public"."subscriptions" to "authenticated";

grant delete on table "public"."subscriptions" to "service_role";

grant insert on table "public"."subscriptions" to "service_role";

grant references on table "public"."subscriptions" to "service_role";

grant select on table "public"."subscriptions" to "service_role";

grant trigger on table "public"."subscriptions" to "service_role";

grant truncate on table "public"."subscriptions" to "service_role";

grant update on table "public"."subscriptions" to "service_role";

grant delete on table "public"."teachers" to "anon";

grant insert on table "public"."teachers" to "anon";

grant references on table "public"."teachers" to "anon";

grant select on table "public"."teachers" to "anon";

grant trigger on table "public"."teachers" to "anon";

grant truncate on table "public"."teachers" to "anon";

grant update on table "public"."teachers" to "anon";

grant delete on table "public"."teachers" to "authenticated";

grant insert on table "public"."teachers" to "authenticated";

grant references on table "public"."teachers" to "authenticated";

grant select on table "public"."teachers" to "authenticated";

grant trigger on table "public"."teachers" to "authenticated";

grant truncate on table "public"."teachers" to "authenticated";

grant update on table "public"."teachers" to "authenticated";

grant delete on table "public"."teachers" to "service_role";

grant insert on table "public"."teachers" to "service_role";

grant references on table "public"."teachers" to "service_role";

grant select on table "public"."teachers" to "service_role";

grant trigger on table "public"."teachers" to "service_role";

grant truncate on table "public"."teachers" to "service_role";

grant update on table "public"."teachers" to "service_role";

grant delete on table "public"."team_members" to "anon";

grant insert on table "public"."team_members" to "anon";

grant references on table "public"."team_members" to "anon";

grant select on table "public"."team_members" to "anon";

grant trigger on table "public"."team_members" to "anon";

grant truncate on table "public"."team_members" to "anon";

grant update on table "public"."team_members" to "anon";

grant delete on table "public"."team_members" to "authenticated";

grant insert on table "public"."team_members" to "authenticated";

grant references on table "public"."team_members" to "authenticated";

grant select on table "public"."team_members" to "authenticated";

grant trigger on table "public"."team_members" to "authenticated";

grant truncate on table "public"."team_members" to "authenticated";

grant update on table "public"."team_members" to "authenticated";

grant delete on table "public"."team_members" to "service_role";

grant insert on table "public"."team_members" to "service_role";

grant references on table "public"."team_members" to "service_role";

grant select on table "public"."team_members" to "service_role";

grant trigger on table "public"."team_members" to "service_role";

grant truncate on table "public"."team_members" to "service_role";

grant update on table "public"."team_members" to "service_role";

grant delete on table "public"."teams" to "anon";

grant insert on table "public"."teams" to "anon";

grant references on table "public"."teams" to "anon";

grant select on table "public"."teams" to "anon";

grant trigger on table "public"."teams" to "anon";

grant truncate on table "public"."teams" to "anon";

grant update on table "public"."teams" to "anon";

grant delete on table "public"."teams" to "authenticated";

grant insert on table "public"."teams" to "authenticated";

grant references on table "public"."teams" to "authenticated";

grant select on table "public"."teams" to "authenticated";

grant trigger on table "public"."teams" to "authenticated";

grant truncate on table "public"."teams" to "authenticated";

grant update on table "public"."teams" to "authenticated";

grant delete on table "public"."teams" to "service_role";

grant insert on table "public"."teams" to "service_role";

grant references on table "public"."teams" to "service_role";

grant select on table "public"."teams" to "service_role";

grant trigger on table "public"."teams" to "service_role";

grant truncate on table "public"."teams" to "service_role";

grant update on table "public"."teams" to "service_role";

grant delete on table "public"."users" to "anon";

grant insert on table "public"."users" to "anon";

grant references on table "public"."users" to "anon";

grant select on table "public"."users" to "anon";

grant trigger on table "public"."users" to "anon";

grant truncate on table "public"."users" to "anon";

grant update on table "public"."users" to "anon";

grant delete on table "public"."users" to "authenticated";

grant insert on table "public"."users" to "authenticated";

grant references on table "public"."users" to "authenticated";

grant select on table "public"."users" to "authenticated";

grant trigger on table "public"."users" to "authenticated";

grant truncate on table "public"."users" to "authenticated";

grant update on table "public"."users" to "authenticated";

grant delete on table "public"."users" to "service_role";

grant insert on table "public"."users" to "service_role";

grant references on table "public"."users" to "service_role";

grant select on table "public"."users" to "service_role";

grant trigger on table "public"."users" to "service_role";

grant truncate on table "public"."users" to "service_role";

grant update on table "public"."users" to "service_role";


