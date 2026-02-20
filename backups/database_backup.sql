--
-- PostgreSQL database dump
--

\restrict 3w7wFXw5dBnuAxsddAgE5wLeVCSogqW0xTSwNqvGAHazuoJ2qLzYQXQ0g3yiXAx

-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: studio_admin
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO studio_admin;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: studio_admin
--

COMMENT ON SCHEMA public IS '';


--
-- Name: AssetKind; Type: TYPE; Schema: public; Owner: studio_admin
--

CREATE TYPE public."AssetKind" AS ENUM (
    'RAW',
    'EDIT_V1',
    'FINAL'
);


ALTER TYPE public."AssetKind" OWNER TO studio_admin;

--
-- Name: BookingStatus; Type: TYPE; Schema: public; Owner: studio_admin
--

CREATE TYPE public."BookingStatus" AS ENUM (
    'PENDING',
    'CONFIRMED',
    'CANCELLED',
    'PAID',
    'COMPLETED'
);


ALTER TYPE public."BookingStatus" OWNER TO studio_admin;

--
-- Name: InvoiceStatus; Type: TYPE; Schema: public; Owner: studio_admin
--

CREATE TYPE public."InvoiceStatus" AS ENUM (
    'PAID',
    'UNPAID',
    'VOID'
);


ALTER TYPE public."InvoiceStatus" OWNER TO studio_admin;

--
-- Name: PackageUnit; Type: TYPE; Schema: public; Owner: studio_admin
--

CREATE TYPE public."PackageUnit" AS ENUM (
    'HOUR',
    'DAY',
    'FIXED_MINUTES'
);


ALTER TYPE public."PackageUnit" OWNER TO studio_admin;

--
-- Name: ServiceCategory; Type: TYPE; Schema: public; Owner: studio_admin
--

CREATE TYPE public."ServiceCategory" AS ENUM (
    'RECORDING',
    'EDITING',
    'EXTRA'
);


ALTER TYPE public."ServiceCategory" OWNER TO studio_admin;

--
-- Name: ServiceUnit; Type: TYPE; Schema: public; Owner: studio_admin
--

CREATE TYPE public."ServiceUnit" AS ENUM (
    'PER_BOOKING',
    'PER_HOUR',
    'PER_DAY',
    'FIXED'
);


ALTER TYPE public."ServiceUnit" OWNER TO studio_admin;

--
-- Name: SubscriptionStatus; Type: TYPE; Schema: public; Owner: studio_admin
--

CREATE TYPE public."SubscriptionStatus" AS ENUM (
    'ACTIVE',
    'CANCELED',
    'PAST_DUE'
);


ALTER TYPE public."SubscriptionStatus" OWNER TO studio_admin;

--
-- Name: TransactionType; Type: TYPE; Schema: public; Owner: studio_admin
--

CREATE TYPE public."TransactionType" AS ENUM (
    'PURCHASE',
    'BOOKING',
    'ADJUSTMENT',
    'SUBSCRIPTION',
    'GRANT'
);


ALTER TYPE public."TransactionType" OWNER TO studio_admin;

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: studio_admin
--

CREATE TYPE public."UserRole" AS ENUM (
    'SUPER_ADMIN',
    'ADMIN',
    'CLIENT'
);


ALTER TYPE public."UserRole" OWNER TO studio_admin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: assets; Type: TABLE; Schema: public; Owner: studio_admin
--

CREATE TABLE public.assets (
    id text NOT NULL,
    booking_id text NOT NULL,
    kind public."AssetKind" NOT NULL,
    filename text NOT NULL,
    mime_type text NOT NULL,
    size_bytes integer NOT NULL,
    storage_key text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.assets OWNER TO studio_admin;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: studio_admin
--

CREATE TABLE public.audit_logs (
    id text NOT NULL,
    actor_user_id text,
    actor_email text,
    actor_role text,
    action text NOT NULL,
    entity text,
    entity_id text,
    ip text,
    user_agent text,
    request_id text,
    metadata jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.audit_logs OWNER TO studio_admin;

--
-- Name: booking_line_items; Type: TABLE; Schema: public; Owner: studio_admin
--

CREATE TABLE public.booking_line_items (
    id text NOT NULL,
    booking_id text NOT NULL,
    service_id text,
    price_at_booking numeric(65,30) NOT NULL,
    name_snapshot text NOT NULL,
    unit_price_aed_snapshot numeric(65,30) NOT NULL,
    total_price_aed_snapshot numeric(65,30) NOT NULL,
    quantity integer DEFAULT 1,
    unit_price_minor_snapshot integer DEFAULT 0 NOT NULL,
    total_price_minor_snapshot integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.booking_line_items OWNER TO studio_admin;

--
-- Name: bookings; Type: TABLE; Schema: public; Owner: studio_admin
--

CREATE TABLE public.bookings (
    id text NOT NULL,
    user_id text NOT NULL,
    room_id text NOT NULL,
    start_time timestamp(3) without time zone NOT NULL,
    end_time timestamp(3) without time zone NOT NULL,
    status public."BookingStatus" DEFAULT 'PENDING'::public."BookingStatus" NOT NULL,
    total_price numeric(65,30) NOT NULL,
    total_price_aed_snapshot numeric(65,30) DEFAULT 0 NOT NULL,
    time_zone text DEFAULT 'Asia/Dubai'::text NOT NULL,
    used_credit_minutes integer DEFAULT 0 NOT NULL,
    total_price_minor_snapshot integer DEFAULT 0 NOT NULL,
    calendar_invite_sent_at timestamp(3) without time zone,
    calendar_provider text,
    calendar_event_uid text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    stripe_checkout_session_id text,
    stripe_payment_intent_id text,
    paid_at timestamp(3) without time zone,
    booking_paid_email_sent_at timestamp(3) without time zone,
    reminder_sent_at timestamp(3) without time zone
);


ALTER TABLE public.bookings OWNER TO studio_admin;

--
-- Name: credit_ledger; Type: TABLE; Schema: public; Owner: studio_admin
--

CREATE TABLE public.credit_ledger (
    id text NOT NULL,
    user_id text NOT NULL,
    booking_id text,
    amount integer NOT NULL,
    transaction_type public."TransactionType" NOT NULL,
    reference_id text,
    description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.credit_ledger OWNER TO studio_admin;

--
-- Name: invoices; Type: TABLE; Schema: public; Owner: studio_admin
--

CREATE TABLE public.invoices (
    id text NOT NULL,
    user_id text NOT NULL,
    booking_id text,
    subscription_id text,
    amount numeric(65,30) NOT NULL,
    status public."InvoiceStatus" NOT NULL,
    pdf_url text,
    stripe_payment_intent_id text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.invoices OWNER TO studio_admin;

--
-- Name: packages; Type: TABLE; Schema: public; Owner: studio_admin
--

CREATE TABLE public.packages (
    id text NOT NULL,
    slug text NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    price numeric(65,30) NOT NULL,
    duration_minutes integer NOT NULL,
    active boolean DEFAULT true NOT NULL,
    studio_room_id text,
    unit public."PackageUnit" DEFAULT 'HOUR'::public."PackageUnit" NOT NULL,
    min_quantity integer DEFAULT 1 NOT NULL,
    max_quantity integer DEFAULT 1 NOT NULL,
    step_quantity integer DEFAULT 1 NOT NULL,
    price_per_unit_minor integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    credits integer DEFAULT 0 NOT NULL,
    validity_days integer DEFAULT 30 NOT NULL
);


ALTER TABLE public.packages OWNER TO studio_admin;

--
-- Name: plans; Type: TABLE; Schema: public; Owner: studio_admin
--

CREATE TABLE public.plans (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    monthly_price integer NOT NULL,
    included_credits integer NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.plans OWNER TO studio_admin;

--
-- Name: services; Type: TABLE; Schema: public; Owner: studio_admin
--

CREATE TABLE public.services (
    id text NOT NULL,
    slug text NOT NULL,
    name text NOT NULL,
    description text,
    price numeric(65,30) NOT NULL,
    active boolean DEFAULT true NOT NULL,
    category public."ServiceCategory" DEFAULT 'EXTRA'::public."ServiceCategory" NOT NULL,
    unit public."ServiceUnit" DEFAULT 'PER_BOOKING'::public."ServiceUnit" NOT NULL,
    min_quantity integer DEFAULT 1 NOT NULL,
    max_quantity integer DEFAULT 1 NOT NULL,
    step_quantity integer DEFAULT 1 NOT NULL,
    price_minor integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    icon_asset_key text,
    duration_min integer DEFAULT 0
);


ALTER TABLE public.services OWNER TO studio_admin;

--
-- Name: sessions; Type: TABLE; Schema: public; Owner: studio_admin
--

CREATE TABLE public.sessions (
    id text NOT NULL,
    user_id text NOT NULL,
    expires_at timestamp(3) without time zone NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.sessions OWNER TO studio_admin;

--
-- Name: stripe_events_processed; Type: TABLE; Schema: public; Owner: studio_admin
--

CREATE TABLE public.stripe_events_processed (
    id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.stripe_events_processed OWNER TO studio_admin;

--
-- Name: studio_rooms; Type: TABLE; Schema: public; Owner: studio_admin
--

CREATE TABLE public.studio_rooms (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text NOT NULL,
    capacity integer NOT NULL,
    equipment_summary text DEFAULT ''::text NOT NULL,
    cover_image_url text,
    is_active boolean DEFAULT true NOT NULL,
    hourly_rate numeric(65,30),
    image_url text,
    type text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.studio_rooms OWNER TO studio_admin;

--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: studio_admin
--

CREATE TABLE public.subscriptions (
    id text NOT NULL,
    user_id text NOT NULL,
    plan_id text NOT NULL,
    status public."SubscriptionStatus" NOT NULL,
    stripe_customer_id text,
    stripe_subscription_id text,
    current_period_start timestamp(3) without time zone,
    current_period_end timestamp(3) without time zone NOT NULL,
    latest_invoice_id text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    subscription_active_email_sent_at timestamp(3) without time zone
);


ALTER TABLE public.subscriptions OWNER TO studio_admin;

--
-- Name: users; Type: TABLE; Schema: public; Owner: studio_admin
--

CREATE TABLE public.users (
    id text NOT NULL,
    email text NOT NULL,
    name text NOT NULL,
    role public."UserRole" DEFAULT 'CLIENT'::public."UserRole" NOT NULL,
    stripe_customer_id text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    password_hash text
);


ALTER TABLE public.users OWNER TO studio_admin;

--
-- Name: verification_tokens; Type: TABLE; Schema: public; Owner: studio_admin
--

CREATE TABLE public.verification_tokens (
    identifier text NOT NULL,
    token text NOT NULL,
    expires_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.verification_tokens OWNER TO studio_admin;

--
-- Data for Name: assets; Type: TABLE DATA; Schema: public; Owner: studio_admin
--

COPY public.assets (id, booking_id, kind, filename, mime_type, size_bytes, storage_key, created_at) FROM stdin;
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: studio_admin
--

COPY public.audit_logs (id, actor_user_id, actor_email, actor_role, action, entity, entity_id, ip, user_agent, request_id, metadata, created_at) FROM stdin;
\.


--
-- Data for Name: booking_line_items; Type: TABLE DATA; Schema: public; Owner: studio_admin
--

COPY public.booking_line_items (id, booking_id, service_id, price_at_booking, name_snapshot, unit_price_aed_snapshot, total_price_aed_snapshot, quantity, unit_price_minor_snapshot, total_price_minor_snapshot) FROM stdin;
\.


--
-- Data for Name: bookings; Type: TABLE DATA; Schema: public; Owner: studio_admin
--

COPY public.bookings (id, user_id, room_id, start_time, end_time, status, total_price, total_price_aed_snapshot, time_zone, used_credit_minutes, total_price_minor_snapshot, calendar_invite_sent_at, calendar_provider, calendar_event_uid, created_at, stripe_checkout_session_id, stripe_payment_intent_id, paid_at, booking_paid_email_sent_at, reminder_sent_at) FROM stdin;
\.


--
-- Data for Name: credit_ledger; Type: TABLE DATA; Schema: public; Owner: studio_admin
--

COPY public.credit_ledger (id, user_id, booking_id, amount, transaction_type, reference_id, description, created_at) FROM stdin;
\.


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: studio_admin
--

COPY public.invoices (id, user_id, booking_id, subscription_id, amount, status, pdf_url, stripe_payment_intent_id, created_at) FROM stdin;
\.


--
-- Data for Name: packages; Type: TABLE DATA; Schema: public; Owner: studio_admin
--

COPY public.packages (id, slug, name, description, price, duration_minutes, active, studio_room_id, unit, min_quantity, max_quantity, step_quantity, price_per_unit_minor, is_active, credits, validity_days) FROM stdin;
00000000-0000-0000-0000-000000000001	basic-session	Basic Session	Standard 1-hour recording session	200.000000000000000000000000000000	60	t	e6f7732a-7748-4eb5-a48f-71b80c3b73ed	HOUR	1	1	1	0	t	60	30
00000000-0000-0000-0000-000000000002	extended-session	Extended Session	Extended 2-hour recording & strategy session	350.000000000000000000000000000000	120	t	e6f7732a-7748-4eb5-a48f-71b80c3b73ed	HOUR	1	1	1	0	t	120	30
\.


--
-- Data for Name: plans; Type: TABLE DATA; Schema: public; Owner: studio_admin
--

COPY public.plans (id, name, slug, monthly_price, included_credits, description, is_active) FROM stdin;
c6be7ca7-f493-4dd7-b897-9e695ddadea4	Creator Plan	creator	99900	10	Perfect for content creators and podcasters starting out	t
a61c2264-2115-474d-bb90-6db1e0f49aea	Pro Plan	pro	199900	25	For professional creators who need more studio time	t
42921aa5-0bfb-4ad1-9701-b42b1a200548	Business Plan	business	399900	60	Unlimited access for businesses and production companies	t
\.


--
-- Data for Name: services; Type: TABLE DATA; Schema: public; Owner: studio_admin
--

COPY public.services (id, slug, name, description, price, active, category, unit, min_quantity, max_quantity, step_quantity, price_minor, is_active, icon_asset_key, duration_min) FROM stdin;
8091dee4-7267-4b27-b0d3-79f21b584b02	audio-mixing	Audio Mixing	Professional audio mixing and mastering	150.000000000000000000000000000000	t	EDITING	PER_BOOKING	1	1	1	15000	t	\N	60
1d5a118a-901c-4148-b6a9-b6488617cbe1	video-recording	Video Recording	Multi-camera video recording setup	200.000000000000000000000000000000	t	RECORDING	PER_BOOKING	1	1	1	20000	t	\N	0
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: studio_admin
--

COPY public.sessions (id, user_id, expires_at, created_at) FROM stdin;
c26e2dfe-5583-4df3-bb2c-224429e25c84	603d9780-521f-4c22-8320-912d0de283b4	2026-02-25 16:54:15.2	2026-02-18 16:54:15.201
\.


--
-- Data for Name: stripe_events_processed; Type: TABLE DATA; Schema: public; Owner: studio_admin
--

COPY public.stripe_events_processed (id, created_at) FROM stdin;
\.


--
-- Data for Name: studio_rooms; Type: TABLE DATA; Schema: public; Owner: studio_admin
--

COPY public.studio_rooms (id, name, slug, description, capacity, equipment_summary, cover_image_url, is_active, hourly_rate, image_url, type, created_at) FROM stdin;
e6f7732a-7748-4eb5-a48f-71b80c3b73ed	Podcast Studio A	podcast-studio-a	Professional podcast recording studio with soundproofing and premium equipment	4		\N	t	250.000000000000000000000000000000	/images/studios/podcast-a.jpg	podcast	2026-02-18 16:05:45.183
4088f6b2-b950-47db-ac72-c67c0c4901d1	Recording Studio Pro	recording-studio-pro	State-of-the-art recording studio for music production	6		\N	t	350.000000000000000000000000000000	/images/studios/recording-pro.jpg	recording	2026-02-18 16:05:45.202
\.


--
-- Data for Name: subscriptions; Type: TABLE DATA; Schema: public; Owner: studio_admin
--

COPY public.subscriptions (id, user_id, plan_id, status, stripe_customer_id, stripe_subscription_id, current_period_start, current_period_end, latest_invoice_id, created_at, updated_at, subscription_active_email_sent_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: studio_admin
--

COPY public.users (id, email, name, role, stripe_customer_id, created_at, password_hash) FROM stdin;
80e393c2-92c4-4ed1-8bb1-fd55229d2816	test@studio.com	Test User	CLIENT	\N	2026-02-18 16:09:35.804	\N
603d9780-521f-4c22-8320-912d0de283b4	admin@studio.com	Admin User	ADMIN	\N	2026-02-18 16:11:47.712	\N
055f2cec-ffe7-4005-8332-79c41e5c17f9	super@studio.com	Super Admin	SUPER_ADMIN	\N	2026-02-18 16:11:47.721	\N
05ee4660-0534-4370-958b-ae9b0fd90b45	anne@studio.com	anne@studio.com	CLIENT	\N	2026-02-18 17:45:23.971	$2b$10$Qz4J/4qqO0.vQHZyNPDgSeSUVoNHirxrh9TblyNtRQjZAYbNLZLDO
\.


--
-- Data for Name: verification_tokens; Type: TABLE DATA; Schema: public; Owner: studio_admin
--

COPY public.verification_tokens (identifier, token, expires_at) FROM stdin;
anneris@studio.com	16900a6bd4e690a87a6aaf6e480e1ef32ce2fc7c07dd556c204b77ed10112ef8	2026-02-18 17:51:00.78
\.


--
-- Name: assets assets_pkey; Type: CONSTRAINT; Schema: public; Owner: studio_admin
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: studio_admin
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: booking_line_items booking_line_items_pkey; Type: CONSTRAINT; Schema: public; Owner: studio_admin
--

ALTER TABLE ONLY public.booking_line_items
    ADD CONSTRAINT booking_line_items_pkey PRIMARY KEY (id);


--
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: studio_admin
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- Name: credit_ledger credit_ledger_pkey; Type: CONSTRAINT; Schema: public; Owner: studio_admin
--

ALTER TABLE ONLY public.credit_ledger
    ADD CONSTRAINT credit_ledger_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: studio_admin
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: packages packages_pkey; Type: CONSTRAINT; Schema: public; Owner: studio_admin
--

ALTER TABLE ONLY public.packages
    ADD CONSTRAINT packages_pkey PRIMARY KEY (id);


--
-- Name: plans plans_pkey; Type: CONSTRAINT; Schema: public; Owner: studio_admin
--

ALTER TABLE ONLY public.plans
    ADD CONSTRAINT plans_pkey PRIMARY KEY (id);


--
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: studio_admin
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: studio_admin
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: stripe_events_processed stripe_events_processed_pkey; Type: CONSTRAINT; Schema: public; Owner: studio_admin
--

ALTER TABLE ONLY public.stripe_events_processed
    ADD CONSTRAINT stripe_events_processed_pkey PRIMARY KEY (id);


--
-- Name: studio_rooms studio_rooms_pkey; Type: CONSTRAINT; Schema: public; Owner: studio_admin
--

ALTER TABLE ONLY public.studio_rooms
    ADD CONSTRAINT studio_rooms_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: studio_admin
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: studio_admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: assets_storage_key_key; Type: INDEX; Schema: public; Owner: studio_admin
--

CREATE UNIQUE INDEX assets_storage_key_key ON public.assets USING btree (storage_key);


--
-- Name: audit_logs_action_created_at_idx; Type: INDEX; Schema: public; Owner: studio_admin
--

CREATE INDEX audit_logs_action_created_at_idx ON public.audit_logs USING btree (action, created_at);


--
-- Name: audit_logs_actor_user_id_created_at_idx; Type: INDEX; Schema: public; Owner: studio_admin
--

CREATE INDEX audit_logs_actor_user_id_created_at_idx ON public.audit_logs USING btree (actor_user_id, created_at);


--
-- Name: audit_logs_created_at_idx; Type: INDEX; Schema: public; Owner: studio_admin
--

CREATE INDEX audit_logs_created_at_idx ON public.audit_logs USING btree (created_at);


--
-- Name: bookings_calendar_event_uid_key; Type: INDEX; Schema: public; Owner: studio_admin
--

CREATE UNIQUE INDEX bookings_calendar_event_uid_key ON public.bookings USING btree (calendar_event_uid);


--
-- Name: bookings_room_id_start_time_end_time_idx; Type: INDEX; Schema: public; Owner: studio_admin
--

CREATE INDEX bookings_room_id_start_time_end_time_idx ON public.bookings USING btree (room_id, start_time, end_time);


--
-- Name: bookings_stripe_checkout_session_id_key; Type: INDEX; Schema: public; Owner: studio_admin
--

CREATE UNIQUE INDEX bookings_stripe_checkout_session_id_key ON public.bookings USING btree (stripe_checkout_session_id);


--
-- Name: bookings_stripe_payment_intent_id_key; Type: INDEX; Schema: public; Owner: studio_admin
--

CREATE UNIQUE INDEX bookings_stripe_payment_intent_id_key ON public.bookings USING btree (stripe_payment_intent_id);


--
-- Name: invoices_booking_id_key; Type: INDEX; Schema: public; Owner: studio_admin
--

CREATE UNIQUE INDEX invoices_booking_id_key ON public.invoices USING btree (booking_id);


--
-- Name: invoices_stripe_payment_intent_id_key; Type: INDEX; Schema: public; Owner: studio_admin
--

CREATE UNIQUE INDEX invoices_stripe_payment_intent_id_key ON public.invoices USING btree (stripe_payment_intent_id);


--
-- Name: packages_slug_key; Type: INDEX; Schema: public; Owner: studio_admin
--

CREATE UNIQUE INDEX packages_slug_key ON public.packages USING btree (slug);


--
-- Name: plans_slug_key; Type: INDEX; Schema: public; Owner: studio_admin
--

CREATE UNIQUE INDEX plans_slug_key ON public.plans USING btree (slug);


--
-- Name: services_slug_key; Type: INDEX; Schema: public; Owner: studio_admin
--

CREATE UNIQUE INDEX services_slug_key ON public.services USING btree (slug);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: public; Owner: studio_admin
--

CREATE INDEX sessions_user_id_idx ON public.sessions USING btree (user_id);


--
-- Name: studio_rooms_slug_key; Type: INDEX; Schema: public; Owner: studio_admin
--

CREATE UNIQUE INDEX studio_rooms_slug_key ON public.studio_rooms USING btree (slug);


--
-- Name: subscriptions_stripe_subscription_id_key; Type: INDEX; Schema: public; Owner: studio_admin
--

CREATE UNIQUE INDEX subscriptions_stripe_subscription_id_key ON public.subscriptions USING btree (stripe_subscription_id);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: studio_admin
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: users_stripe_customer_id_key; Type: INDEX; Schema: public; Owner: studio_admin
--

CREATE UNIQUE INDEX users_stripe_customer_id_key ON public.users USING btree (stripe_customer_id);


--
-- Name: verification_tokens_identifier_expires_at_idx; Type: INDEX; Schema: public; Owner: studio_admin
--

CREATE INDEX verification_tokens_identifier_expires_at_idx ON public.verification_tokens USING btree (identifier, expires_at);


--
-- Name: verification_tokens_identifier_token_key; Type: INDEX; Schema: public; Owner: studio_admin
--

CREATE UNIQUE INDEX verification_tokens_identifier_token_key ON public.verification_tokens USING btree (identifier, token);


--
-- Name: verification_tokens_token_key; Type: INDEX; Schema: public; Owner: studio_admin
--

CREATE UNIQUE INDEX verification_tokens_token_key ON public.verification_tokens USING btree (token);


--
-- Name: assets assets_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: studio_admin
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: booking_line_items booking_line_items_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: studio_admin
--

ALTER TABLE ONLY public.booking_line_items
    ADD CONSTRAINT booking_line_items_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: booking_line_items booking_line_items_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: studio_admin
--

ALTER TABLE ONLY public.booking_line_items
    ADD CONSTRAINT booking_line_items_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: bookings bookings_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: studio_admin
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.studio_rooms(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: bookings bookings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: studio_admin
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: credit_ledger credit_ledger_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: studio_admin
--

ALTER TABLE ONLY public.credit_ledger
    ADD CONSTRAINT credit_ledger_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: invoices invoices_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: studio_admin
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: invoices invoices_subscription_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: studio_admin
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES public.subscriptions(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: invoices invoices_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: studio_admin
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: packages packages_studio_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: studio_admin
--

ALTER TABLE ONLY public.packages
    ADD CONSTRAINT packages_studio_room_id_fkey FOREIGN KEY (studio_room_id) REFERENCES public.studio_rooms(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: studio_admin
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: subscriptions subscriptions_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: studio_admin
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.plans(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: subscriptions subscriptions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: studio_admin
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: studio_admin
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict 3w7wFXw5dBnuAxsddAgE5wLeVCSogqW0xTSwNqvGAHazuoJ2qLzYQXQ0g3yiXAx

