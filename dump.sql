--
-- PostgreSQL database dump
--

-- Dumped from database version 15.10 (Homebrew)
-- Dumped by pg_dump version 15.10 (Homebrew)

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: fleets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fleets (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text NOT NULL,
    capacity integer NOT NULL,
    status text DEFAULT 'available'::text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp with time zone,
    features text[],
    luggage_capacity integer DEFAULT 0,
    base_price_per_hour numeric(10,2) DEFAULT 0.00,
    category character varying(50),
    CONSTRAINT fleets_status_check CHECK ((status = ANY (ARRAY['available'::text, 'out_of_service'::text, 'maintenance'::text])))
);


ALTER TABLE public.fleets OWNER TO postgres;

--
-- Name: fleets_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.fleets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.fleets_id_seq OWNER TO postgres;

--
-- Name: fleets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.fleets_id_seq OWNED BY public.fleets.id;


--
-- Name: fleets_services; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fleets_services (
    id integer NOT NULL,
    fleet_id integer,
    service_id integer,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp with time zone
);


ALTER TABLE public.fleets_services OWNER TO postgres;

--
-- Name: fleets_services_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.fleets_services_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.fleets_services_id_seq OWNER TO postgres;

--
-- Name: fleets_services_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.fleets_services_id_seq OWNED BY public.fleets_services.id;


--
-- Name: knex_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.knex_migrations (
    id integer NOT NULL,
    name character varying(255),
    batch integer,
    migration_time timestamp with time zone
);


ALTER TABLE public.knex_migrations OWNER TO postgres;

--
-- Name: knex_migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.knex_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.knex_migrations_id_seq OWNER TO postgres;

--
-- Name: knex_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.knex_migrations_id_seq OWNED BY public.knex_migrations.id;


--
-- Name: knex_migrations_lock; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.knex_migrations_lock (
    index integer NOT NULL,
    is_locked integer
);


ALTER TABLE public.knex_migrations_lock OWNER TO postgres;

--
-- Name: knex_migrations_lock_index_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.knex_migrations_lock_index_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.knex_migrations_lock_index_seq OWNER TO postgres;

--
-- Name: knex_migrations_lock_index_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.knex_migrations_lock_index_seq OWNED BY public.knex_migrations_lock.index;


--
-- Name: media; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.media (
    id integer NOT NULL,
    url character varying(500) NOT NULL,
    type character varying(50) NOT NULL,
    model_type character varying(100) NOT NULL,
    model_id integer NOT NULL,
    title character varying(255),
    description character varying(500),
    "order" integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp with time zone
);


ALTER TABLE public.media OWNER TO postgres;

--
-- Name: media_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.media_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.media_id_seq OWNER TO postgres;

--
-- Name: media_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.media_id_seq OWNED BY public.media.id;


--
-- Name: permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permissions (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.permissions OWNER TO postgres;

--
-- Name: permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.permissions_id_seq OWNER TO postgres;

--
-- Name: permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.permissions_id_seq OWNED BY public.permissions.id;


--
-- Name: posts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.posts (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    summary character varying(500) NOT NULL,
    content text NOT NULL,
    category character varying(50) DEFAULT 'Geral'::character varying,
    image character varying(255) DEFAULT 'https://placehold.co/600x400?text=Sem+Imagem'::character varying,
    author character varying(100) DEFAULT 'Equipa Editorial'::character varying,
    read_time character varying(10) DEFAULT '5 min'::character varying,
    published_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT posts_category_check CHECK (((category)::text = ANY ((ARRAY['Segurança'::character varying, 'Viagens de Negócios'::character varying, 'Dicas de Viagem'::character varying, 'Promoções'::character varying, 'Geral'::character varying])::text[])))
);


ALTER TABLE public.posts OWNER TO postgres;

--
-- Name: posts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.posts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.posts_id_seq OWNER TO postgres;

--
-- Name: posts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.posts_id_seq OWNED BY public.posts.id;


--
-- Name: reservations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reservations (
    id integer NOT NULL,
    fleet_id integer NOT NULL,
    service_id integer NOT NULL,
    client_user_id integer,
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone NOT NULL,
    status character varying(15) DEFAULT 'PENDING'::character varying NOT NULL,
    pickup_address text NOT NULL,
    dropoff_address text NOT NULL,
    trip_pickup_time timestamp with time zone NOT NULL,
    trip_duration_minutes integer NOT NULL,
    final_price numeric(10,2) NOT NULL,
    payment_intent_id character varying(255),
    passenger_name character varying(255) NOT NULL,
    passenger_email character varying(255) NOT NULL,
    passenger_phone character varying(50) NOT NULL,
    special_requests text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT reservations_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'CONFIRMED'::character varying, 'CANCELLED'::character varying, 'COMPLETED'::character varying])::text[])))
);


ALTER TABLE public.reservations OWNER TO postgres;

--
-- Name: reservations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reservations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.reservations_id_seq OWNER TO postgres;

--
-- Name: reservations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reservations_id_seq OWNED BY public.reservations.id;


--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role_permissions (
    role_id integer NOT NULL,
    permission_id integer NOT NULL
);


ALTER TABLE public.role_permissions OWNER TO postgres;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.roles_id_seq OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: service_fleets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.service_fleets (
    service_id integer NOT NULL,
    fleet_id integer NOT NULL
);


ALTER TABLE public.service_fleets OWNER TO postgres;

--
-- Name: services; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.services (
    id integer NOT NULL,
    name jsonb NOT NULL,
    description jsonb NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp with time zone,
    image_url character varying(255)
);


ALTER TABLE public.services OWNER TO postgres;

--
-- Name: services_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.services_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.services_id_seq OWNER TO postgres;

--
-- Name: services_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.services_id_seq OWNED BY public.services.id;


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_roles (
    user_id integer NOT NULL,
    role_id integer NOT NULL
);


ALTER TABLE public.user_roles OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    verified boolean DEFAULT false,
    verification_code character varying(255),
    verification_code_validation bigint,
    forgot_password_code character varying(255),
    forgot_password_code_validation bigint,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp with time zone
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: fleets id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fleets ALTER COLUMN id SET DEFAULT nextval('public.fleets_id_seq'::regclass);


--
-- Name: fleets_services id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fleets_services ALTER COLUMN id SET DEFAULT nextval('public.fleets_services_id_seq'::regclass);


--
-- Name: knex_migrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.knex_migrations ALTER COLUMN id SET DEFAULT nextval('public.knex_migrations_id_seq'::regclass);


--
-- Name: knex_migrations_lock index; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.knex_migrations_lock ALTER COLUMN index SET DEFAULT nextval('public.knex_migrations_lock_index_seq'::regclass);


--
-- Name: media id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media ALTER COLUMN id SET DEFAULT nextval('public.media_id_seq'::regclass);


--
-- Name: permissions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions ALTER COLUMN id SET DEFAULT nextval('public.permissions_id_seq'::regclass);


--
-- Name: posts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posts ALTER COLUMN id SET DEFAULT nextval('public.posts_id_seq'::regclass);


--
-- Name: reservations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservations ALTER COLUMN id SET DEFAULT nextval('public.reservations_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: services id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services ALTER COLUMN id SET DEFAULT nextval('public.services_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: fleets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fleets (id, name, description, capacity, status, is_active, created_at, updated_at, deleted_at, features, luggage_capacity, base_price_per_hour, category) FROM stdin;
1	Ford Transit	Van grande, ideal para transporte de grupos maiores.	12	available	t	2025-09-29 11:46:27.743838+01	2025-09-29 11:46:27.743838+01	2025-09-29 12:25:33.15751+01	\N	0	0.00	\N
3	Mercedes-Benz Classe E	Sedan executivo de luxo, perfeito para viagens de negócios, eventos ou transferes premium para aeroporto.	4	available	t	2025-09-29 13:13:49.500464+01	2025-09-29 13:13:49.500464+01	2025-09-29 13:14:04.369381+01	\N	0	0.00	\N
5	Mercedes-Benz Classe C	Sedan premium elegante e moderno, ideal para transporte individual ou de casal com um foco em conforto e estilo.	4	available	t	2025-09-29 13:19:08.108949+01	2025-09-29 13:19:08.108949+01	2025-09-29 13:19:36.941513+01	\N	0	0.00	\N
2	Mercedes-Benz Vito	Monovolume executivo de luxo e versátil, ideal para transferes empresariais e famílias.	8	available	t	2025-09-29 12:33:02.613634+01	2025-09-29 12:33:02.613634+01	2025-09-29 13:21:23.823336+01	\N	0	0.00	\N
4	Mercedes-Benz Classe E	Sedan executivo de luxo, perfeito para viagens de negócios, eventos ou transferes premium para aeroporto.	4	available	t	2025-09-29 13:14:31.853082+01	2025-09-29 13:14:31.853082+01	2025-09-29 13:21:26.292982+01	\N	0	0.00	\N
6	Mercedes-Benz Classe C	Sedan premium elegante e moderno, ideal para transporte individual ou de casal com um foco em conforto e estilo.	4	available	t	2025-09-29 13:20:06.237282+01	2025-09-29 13:20:06.237282+01	2025-09-29 13:21:28.964368+01	\N	0	0.00	\N
16	Mercedes-Benz Vito (Premium Atualizado)	Este monovolume executivo foi atualizado e está agora em manutenção preventiva.	8	maintenance	t	2025-09-29 20:12:03.055105+01	2025-09-29 20:18:17.159794+01	\N	{"Wi-Fi de Alta Velocidade","Assentos de Couro Premium","Controle de Clima Individual"}	6	85.00	Van/Minivan
12	Mercedes-Benz Vito	Monovolume executivo de luxo e versátil, ideal para transferes empresariais e famílias. Perfeito para grupos e viagens de negócios.	8	available	t	2025-09-29 19:55:12.637222+01	2025-09-29 19:55:12.637222+01	2025-09-30 10:49:30.305721+01	\N	0	0.00	\N
11	Mercedes-Benz Vito	Monovolume executivo de luxo e versátil, ideal para transferes empresariais e famílias. Perfeito para grupos e viagens de negócios.	8	available	t	2025-09-29 19:53:01.233847+01	2025-09-29 19:53:01.233847+01	2025-09-30 10:49:31.991029+01	\N	0	0.00	\N
8	Mercedes-Benz Classe C	Sedan premium elegante e moderno, ideal para transporte individual ou de casal com um foco em conforto e estilo.	4	available	t	2025-09-29 13:34:19.989007+01	2025-09-30 10:48:13.927441+01	\N	{"Wi-Fi de Alta Velocidade","Assentos de Couro Premium","Teto Panorâmico","Controle de Clima Dual Zone"}	3	45.00	Sedan/Executivo
9	Mercedes-Benz Classe E	Sedan executivo de luxo, perfeito para viagens de negócios, eventos ou transferes premium para aeroporto.	4	available	t	2025-09-29 13:35:50.259435+01	2025-09-30 10:48:26.849506+01	\N	{"Sistema de Som Premium","Assentos em Couro Aquecidos",Wi-Fi,"Bebidas Cortesia","Amplo Espaço para Pernas"}	4	60.00	Sedan/Luxo
15	Mercedes-Benz ola	Monovolume executivo de luxo e versátil, ideal para transferes empresariais e famílias. Perfeito para grupos e viagens de negócios.	8	available	t	2025-09-29 20:02:02.42051+01	2025-09-29 20:02:02.42051+01	2025-09-30 10:49:12.348498+01	\N	0	0.00	\N
14	Mercedes-Benz TESTE	Monovolume executivo de luxo e versátil, ideal para transferes empresariais e famílias. Perfeito para grupos e viagens de negócios.	8	available	t	2025-09-29 19:57:57.743843+01	2025-09-29 19:57:57.743843+01	2025-09-30 10:49:25.894796+01	\N	0	0.00	\N
13	Mercedes-Benz TESTE	Monovolume executivo de luxo e versátil, ideal para transferes empresariais e famílias. Perfeito para grupos e viagens de negócios.	8	available	t	2025-09-29 19:55:20.828891+01	2025-09-29 19:55:20.828891+01	2025-09-30 10:49:28.453211+01	\N	0	0.00	\N
10	Mercedes-Benz Vito	Monovolume executivo de luxo e versátil, ideal para transferes empresariais e famílias.	8	available	t	2025-09-29 19:49:25.163075+01	2025-09-29 19:49:25.163075+01	2025-09-30 10:49:34.492709+01	\N	0	0.00	\N
7	Mercedes-Benz Vito	Monovolume executivo de luxo e versátil, ideal para transferes empresariais e famílias.	8	available	t	2025-09-29 13:32:16.526394+01	2025-09-29 13:32:16.526394+01	2025-09-30 10:49:36.589081+01	\N	0	0.00	\N
\.


--
-- Data for Name: fleets_services; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fleets_services (id, fleet_id, service_id, created_at, updated_at, deleted_at) FROM stdin;
1	1	1	2025-09-30 11:16:44.058886+01	2025-09-30 11:16:44.058886+01	2025-09-30 11:30:39.539796+01
3	2	1	2025-09-30 11:16:44.058886+01	2025-09-30 11:16:44.058886+01	2025-09-30 11:30:39.539796+01
2	3	1	2025-09-30 11:16:44.058886+01	2025-09-30 11:16:44.058886+01	2025-09-30 11:30:39.539796+01
7	8	3	2025-09-30 11:53:35.667291+01	2025-09-30 11:53:35.667291+01	\N
8	9	3	2025-09-30 11:53:35.667291+01	2025-09-30 11:53:35.667291+01	\N
4	16	2	2025-09-30 11:30:04.947902+01	2025-09-30 11:30:04.947902+01	2025-09-30 12:06:56.051683+01
5	8	2	2025-09-30 11:30:04.947902+01	2025-09-30 11:30:04.947902+01	2025-09-30 12:08:29.869772+01
6	9	2	2025-09-30 11:30:04.947902+01	2025-09-30 11:30:04.947902+01	2025-09-30 12:08:29.869772+01
9	8	4	2025-09-30 12:11:43.501418+01	2025-09-30 12:11:43.501418+01	\N
10	9	4	2025-09-30 12:11:43.501418+01	2025-09-30 12:11:43.501418+01	\N
11	13	4	2025-09-30 12:11:43.501418+01	2025-09-30 12:11:43.501418+01	\N
12	9	5	2025-09-30 12:14:10.798903+01	2025-09-30 12:14:10.798903+01	\N
13	8	6	2025-09-30 12:18:08.559679+01	2025-09-30 12:18:08.559679+01	\N
14	9	6	2025-09-30 12:18:08.559679+01	2025-09-30 12:18:08.559679+01	\N
15	8	7	2025-09-30 12:19:56.806327+01	2025-09-30 12:19:56.806327+01	\N
16	9	7	2025-09-30 12:19:56.806327+01	2025-09-30 12:19:56.806327+01	\N
17	13	7	2025-09-30 12:19:56.806327+01	2025-09-30 12:19:56.806327+01	\N
18	16	8	2025-09-30 12:21:21.308044+01	2025-09-30 12:21:21.308044+01	\N
19	8	8	2025-09-30 12:21:21.308044+01	2025-09-30 12:21:21.308044+01	\N
20	9	8	2025-09-30 12:21:21.308044+01	2025-09-30 12:21:21.308044+01	\N
21	16	9	2025-09-30 12:23:00.76933+01	2025-09-30 12:23:00.76933+01	\N
22	8	9	2025-09-30 12:23:00.76933+01	2025-09-30 12:23:00.76933+01	\N
23	9	9	2025-09-30 12:23:00.76933+01	2025-09-30 12:23:00.76933+01	\N
\.


--
-- Data for Name: knex_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.knex_migrations (id, name, batch, migration_time) FROM stdin;
1	20250923160903_create_users_table.js	1	2025-09-29 11:32:44.793+01
2	20250923161051_create_posts_table.js	1	2025-09-29 11:32:44.8+01
3	20250923161230_create_permissions_table.js	1	2025-09-29 11:32:44.811+01
4	20250923175758_create_fleets_table.js	1	2025-09-29 11:32:44.815+01
5	20250923214751_create_services_table.js	1	2025-09-29 11:32:44.823+01
6	20250925172358_create_images_table.js	1	2025-09-29 11:32:44.828+01
\.


--
-- Data for Name: knex_migrations_lock; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.knex_migrations_lock (index, is_locked) FROM stdin;
1	0
\.


--
-- Data for Name: media; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.media (id, url, type, model_type, model_id, title, description, "order", created_at, updated_at, deleted_at) FROM stdin;
1	https://exemplo.com/img1.jpg	image	fleets	1	\N	\N	0	2025-09-29 11:46:27.750163+01	2025-09-29 11:46:27.750163+01	2025-09-29 12:25:33.166025+01
2	https://exemplo.com/img2.jpg	image	fleets	1	\N	\N	1	2025-09-29 11:46:27.750163+01	2025-09-29 11:46:27.750163+01	2025-09-29 12:25:33.166025+01
9	http://localhost:5173/src/assets/e_class_1.jpeg	image	fleets	3	\N	\N	0	2025-09-29 13:13:49.508058+01	2025-09-29 13:13:49.508058+01	2025-09-29 13:14:04.376495+01
10	http://localhost:5173/src/assets/e_class_2.jpeg	image	fleets	3	\N	\N	1	2025-09-29 13:13:49.508058+01	2025-09-29 13:13:49.508058+01	2025-09-29 13:14:04.376495+01
11	http://localhost:5173/src/assets/e_class_3.jpeg	image	fleets	3	\N	\N	2	2025-09-29 13:13:49.508058+01	2025-09-29 13:13:49.508058+01	2025-09-29 13:14:04.376495+01
12	http://localhost:5173/src/assets/e_class_4.jpeg	image	fleets	3	\N	\N	3	2025-09-29 13:13:49.508058+01	2025-09-29 13:13:49.508058+01	2025-09-29 13:14:04.376495+01
17	http://localhost:5173/src/assets/classc_1.jpeg	image	fleets	5	\N	\N	0	2025-09-29 13:19:08.111841+01	2025-09-29 13:19:08.111841+01	2025-09-29 13:19:36.949722+01
18	http://localhost:5173/src/assets/classc_2.jpeg	image	fleets	5	\N	\N	1	2025-09-29 13:19:08.111841+01	2025-09-29 13:19:08.111841+01	2025-09-29 13:19:36.949722+01
19	http://localhost:5173/src/assets/classc_3.jpeg	image	fleets	5	\N	\N	2	2025-09-29 13:19:08.111841+01	2025-09-29 13:19:08.111841+01	2025-09-29 13:19:36.949722+01
20	http://localhost:5173/src/assets/classc_4.jpeg	image	fleets	5	\N	\N	3	2025-09-29 13:19:08.111841+01	2025-09-29 13:19:08.111841+01	2025-09-29 13:19:36.949722+01
3	http://localhost:5173/src/assets/vito_1.jpeg	image	fleets	2	\N	\N	0	2025-09-29 12:33:02.619977+01	2025-09-29 12:33:02.619977+01	2025-09-29 13:21:23.82996+01
4	http://localhost:5173/src/assets/vito_2.jpeg	image	fleets	2	\N	\N	1	2025-09-29 12:33:02.619977+01	2025-09-29 12:33:02.619977+01	2025-09-29 13:21:23.82996+01
5	http://localhost:5173/src/assets/vito_3.jpeg	image	fleets	2	\N	\N	2	2025-09-29 12:33:02.619977+01	2025-09-29 12:33:02.619977+01	2025-09-29 13:21:23.82996+01
6	http://localhost:5173/src/assets/vito_4.jpeg	image	fleets	2	\N	\N	3	2025-09-29 12:33:02.619977+01	2025-09-29 12:33:02.619977+01	2025-09-29 13:21:23.82996+01
7	http://localhost:5173/src/assets/vito_5.avif	image	fleets	2	\N	\N	4	2025-09-29 12:33:02.619977+01	2025-09-29 12:33:02.619977+01	2025-09-29 13:21:23.82996+01
8	http://localhost:5173/src/assets/vito_6.jpeg	image	fleets	2	\N	\N	5	2025-09-29 12:33:02.619977+01	2025-09-29 12:33:02.619977+01	2025-09-29 13:21:23.82996+01
13	http://localhost:5173/src/assets/classe_E2.jpeg	image	fleets	4	\N	\N	0	2025-09-29 13:14:31.858268+01	2025-09-29 13:14:31.858268+01	2025-09-29 13:21:26.294875+01
14	http://localhost:5173/src/assets/classe_E1.jpeg	image	fleets	4	\N	\N	1	2025-09-29 13:14:31.858268+01	2025-09-29 13:14:31.858268+01	2025-09-29 13:21:26.294875+01
15	http://localhost:5173/src/assets/classe_E3.jpeg	image	fleets	4	\N	\N	2	2025-09-29 13:14:31.858268+01	2025-09-29 13:14:31.858268+01	2025-09-29 13:21:26.294875+01
16	http://localhost:5173/src/assets/classe_E4.jpeg	image	fleets	4	\N	\N	3	2025-09-29 13:14:31.858268+01	2025-09-29 13:14:31.858268+01	2025-09-29 13:21:26.294875+01
21	http://localhost:5173/src/assets/classec_1.jpeg	image	fleets	6	\N	\N	0	2025-09-29 13:20:06.241777+01	2025-09-29 13:20:06.241777+01	2025-09-29 13:21:28.965679+01
22	http://localhost:5173/src/assets/classec_2.jpeg	image	fleets	6	\N	\N	1	2025-09-29 13:20:06.241777+01	2025-09-29 13:20:06.241777+01	2025-09-29 13:21:28.965679+01
23	http://localhost:5173/src/assets/classec_3.jpeg	image	fleets	6	\N	\N	2	2025-09-29 13:20:06.241777+01	2025-09-29 13:20:06.241777+01	2025-09-29 13:21:28.965679+01
24	http://localhost:5173/src/assets/classec_4.jpeg	image	fleets	6	\N	\N	3	2025-09-29 13:20:06.241777+01	2025-09-29 13:20:06.241777+01	2025-09-29 13:21:28.965679+01
59	http://localhost:5173/src/assets/vito_3.jpeg	image	fleets	16	\N	\N	2	2025-09-29 20:12:03.065895+01	2025-09-29 20:12:03.065895+01	2025-09-29 20:18:17.167866+01
57	http://localhost:5173/src/assets/vito_1.jpeg	image	fleets	16	\N	\N	0	2025-09-29 20:12:03.065895+01	2025-09-29 20:18:17.168737+01	\N
58	http://localhost:5173/src/assets/vito_2.jpeg	image	fleets	16	\N	\N	1	2025-09-29 20:12:03.065895+01	2025-09-29 20:18:17.169439+01	\N
60	http://localhost:5173/src/assets/vito_NOVA_FOTO.png	image	fleets	16	\N	\N	2	2025-09-29 20:18:17.171547+01	2025-09-29 20:18:17.171547+01	\N
31	http://localhost:5173/src/assets/classe_E2.jpeg	image	fleets	8	\N	\N	0	2025-09-29 13:34:19.995817+01	2025-09-29 13:34:19.995817+01	2025-09-30 10:48:13.931699+01
32	http://localhost:5173/src/assets/classe_E1.jpeg	image	fleets	8	\N	\N	1	2025-09-29 13:34:19.995817+01	2025-09-29 13:34:19.995817+01	2025-09-30 10:48:13.931699+01
33	http://localhost:5173/src/assets/classe_E3.jpeg	image	fleets	8	\N	\N	2	2025-09-29 13:34:19.995817+01	2025-09-29 13:34:19.995817+01	2025-09-30 10:48:13.931699+01
54	http://localhost:5173/src/assets/vito_1.jpeg	image	fleets	15	\N	\N	0	2025-09-29 20:02:02.428616+01	2025-09-29 20:02:02.428616+01	2025-09-30 10:49:12.3541+01
35	http://localhost:5173/src/assets/classec_1.jpeg	image	fleets	9	\N	\N	0	2025-09-29 13:35:50.265446+01	2025-09-30 10:39:51.502473+01	2025-09-30 10:46:51.581701+01
36	http://localhost:5173/src/assets/classec_2.webp	image	fleets	9	\N	\N	1	2025-09-29 13:35:50.265446+01	2025-09-30 10:39:51.503285+01	2025-09-30 10:46:51.581701+01
55	http://localhost:5173/src/assets/vito_2.jpeg	image	fleets	15	\N	\N	1	2025-09-29 20:02:02.428616+01	2025-09-29 20:02:02.428616+01	2025-09-30 10:49:12.3541+01
56	http://localhost:5173/src/assets/vito_3.jpeg	image	fleets	15	\N	\N	2	2025-09-29 20:02:02.428616+01	2025-09-29 20:02:02.428616+01	2025-09-30 10:49:12.3541+01
51	http://localhost:5173/src/assets/vito_1.jpeg	image	fleets	14	\N	\N	0	2025-09-29 19:57:57.75094+01	2025-09-29 19:57:57.75094+01	2025-09-30 10:49:25.898778+01
52	http://localhost:5173/src/assets/vito_2.jpeg	image	fleets	14	\N	\N	1	2025-09-29 19:57:57.75094+01	2025-09-29 19:57:57.75094+01	2025-09-30 10:49:25.898778+01
53	http://localhost:5173/src/assets/vito_3.jpeg	image	fleets	14	\N	\N	2	2025-09-29 19:57:57.75094+01	2025-09-29 19:57:57.75094+01	2025-09-30 10:49:25.898778+01
48	http://localhost:5173/src/assets/vito_1.jpeg	image	fleets	13	\N	\N	0	2025-09-29 19:55:20.832495+01	2025-09-29 19:55:20.832495+01	2025-09-30 10:49:28.454813+01
49	http://localhost:5173/src/assets/vito_2.jpeg	image	fleets	13	\N	\N	1	2025-09-29 19:55:20.832495+01	2025-09-29 19:55:20.832495+01	2025-09-30 10:49:28.454813+01
50	http://localhost:5173/src/assets/vito_3.jpeg	image	fleets	13	\N	\N	2	2025-09-29 19:55:20.832495+01	2025-09-29 19:55:20.832495+01	2025-09-30 10:49:28.454813+01
45	http://localhost:5173/src/assets/vito_1.jpeg	image	fleets	12	\N	\N	0	2025-09-29 19:55:12.644506+01	2025-09-29 19:55:12.644506+01	2025-09-30 10:49:30.307374+01
46	http://localhost:5173/src/assets/vito_2.jpeg	image	fleets	12	\N	\N	1	2025-09-29 19:55:12.644506+01	2025-09-29 19:55:12.644506+01	2025-09-30 10:49:30.307374+01
47	http://localhost:5173/src/assets/vito_3.jpeg	image	fleets	12	\N	\N	2	2025-09-29 19:55:12.644506+01	2025-09-29 19:55:12.644506+01	2025-09-30 10:49:30.307374+01
42	http://localhost:5173/src/assets/vito_1.jpeg	image	fleets	11	\N	\N	0	2025-09-29 19:53:01.24296+01	2025-09-29 19:53:01.24296+01	2025-09-30 10:49:31.992795+01
43	http://localhost:5173/src/assets/vito_2.jpeg	image	fleets	11	\N	\N	1	2025-09-29 19:53:01.24296+01	2025-09-29 19:53:01.24296+01	2025-09-30 10:49:31.992795+01
44	http://localhost:5173/src/assets/vito_3.jpeg	image	fleets	11	\N	\N	2	2025-09-29 19:53:01.24296+01	2025-09-29 19:53:01.24296+01	2025-09-30 10:49:31.992795+01
39	http://localhost:5173/src/assets/vito_1.jpeg	image	fleets	10	\N	\N	0	2025-09-29 19:49:25.172391+01	2025-09-29 19:49:25.172391+01	2025-09-30 10:49:34.495468+01
40	http://localhost:5173/src/assets/vito_2.jpeg	image	fleets	10	\N	\N	1	2025-09-29 19:49:25.172391+01	2025-09-29 19:49:25.172391+01	2025-09-30 10:49:34.495468+01
41	http://localhost:5173/src/assets/vito_3.jpeg	image	fleets	10	\N	\N	2	2025-09-29 19:49:25.172391+01	2025-09-29 19:49:25.172391+01	2025-09-30 10:49:34.495468+01
25	http://localhost:5173/src/assets/vito_1.jpeg	image	fleets	7	\N	\N	0	2025-09-29 13:32:16.533372+01	2025-09-29 13:32:16.533372+01	2025-09-30 10:49:36.590329+01
26	http://localhost:5173/src/assets/vito_2.jpeg	image	fleets	7	\N	\N	1	2025-09-29 13:32:16.533372+01	2025-09-29 13:32:16.533372+01	2025-09-30 10:49:36.590329+01
37	http://localhost:5173/src/assets/classec_3.jpg	image	fleets	9	\N	\N	2	2025-09-29 13:35:50.265446+01	2025-09-30 10:39:51.503795+01	2025-09-30 10:46:51.581701+01
38	http://localhost:5173/src/assets/classec_4.jpg	image	fleets	9	\N	\N	3	2025-09-29 13:35:50.265446+01	2025-09-30 10:39:51.504042+01	2025-09-30 10:46:51.581701+01
34	http://localhost:5173/src/assets/classe_E4.jpeg	image	fleets	8	\N	\N	3	2025-09-29 13:34:19.995817+01	2025-09-29 13:34:19.995817+01	2025-09-30 10:48:13.931699+01
65	http://localhost:5173/src/assets/classec_1.jpeg	image	fleets	8	\N	\N	0	2025-09-30 10:48:13.933475+01	2025-09-30 10:48:13.933475+01	\N
66	http://localhost:5173/src/assets/classec_2.webp	image	fleets	8	\N	\N	1	2025-09-30 10:48:13.933475+01	2025-09-30 10:48:13.933475+01	\N
67	http://localhost:5173/src/assets/classec_3.jpg	image	fleets	8	\N	\N	2	2025-09-30 10:48:13.933475+01	2025-09-30 10:48:13.933475+01	\N
68	http://localhost:5173/src/assets/classec_4.jpg	image	fleets	8	\N	\N	3	2025-09-30 10:48:13.933475+01	2025-09-30 10:48:13.933475+01	\N
61	http://localhost:5173/src/assets/classe_E2.jpeg	image	fleets	9	\N	\N	0	2025-09-30 10:46:51.583444+01	2025-09-30 10:48:26.855784+01	\N
62	http://localhost:5173/src/assets/classe_E1.jpeg	image	fleets	9	\N	\N	1	2025-09-30 10:46:51.583444+01	2025-09-30 10:48:26.85624+01	\N
63	http://localhost:5173/src/assets/classe_E3.jpeg	image	fleets	9	\N	\N	2	2025-09-30 10:46:51.583444+01	2025-09-30 10:48:26.856645+01	\N
64	http://localhost:5173/src/assets/classe_E4.jpeg	image	fleets	9	\N	\N	3	2025-09-30 10:46:51.583444+01	2025-09-30 10:48:26.856948+01	\N
27	http://localhost:5173/src/assets/vito_3.jpeg	image	fleets	7	\N	\N	2	2025-09-29 13:32:16.533372+01	2025-09-29 13:32:16.533372+01	2025-09-30 10:49:36.590329+01
28	http://localhost:5173/src/assets/vito_4.jpeg	image	fleets	7	\N	\N	3	2025-09-29 13:32:16.533372+01	2025-09-29 13:32:16.533372+01	2025-09-30 10:49:36.590329+01
29	http://localhost:5173/src/assets/vito_5.avif	image	fleets	7	\N	\N	4	2025-09-29 13:32:16.533372+01	2025-09-29 13:32:16.533372+01	2025-09-30 10:49:36.590329+01
30	http://localhost:5173/src/assets/vito_6.jpeg	image	fleets	7	\N	\N	5	2025-09-29 13:32:16.533372+01	2025-09-29 13:32:16.533372+01	2025-09-30 10:49:36.590329+01
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.permissions (id, name, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: posts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.posts (id, title, summary, content, category, image, author, read_time, published_date, created_at, updated_at) FROM stdin;
1	As 5 Tendências de Viagem de Negócios para 2025	Um resumo das maiores mudanças que afetarão o transporte executivo no próximo ano fiscal.	A crescente digitalização do processo de reservas e a preferência por veículos elétricos são os pontos principais. A nossa frota já está adaptada para estes desafios...	Viagens de Negócios	https://placehold.co/600x400?text=Sem+Imagem	João Silva	7 min	2025-10-06 12:36:08.348978+01	2025-10-06 12:36:08.348978+01	2025-10-06 12:36:08.348978+01
2	Dicas Essenciais para Segurança em Aeroportos	Como planear a sua viagem para evitar atrasos e garantir o máximo de conforto desde o momento do check-in.	Recomendamos sempre chegar 3 horas antes de voos internacionais e usar o nosso serviço de Meet & Greet para poupar tempo na alfândega.	Segurança	https://placehold.co/600x400?text=Sem+Imagem	Equipa Editorial	5 min	2025-10-06 12:36:08.348978+01	2025-10-06 12:36:08.348978+01	2025-10-06 12:36:08.348978+01
3	As 5 Tendências de Viagem de Negócios para 2025	Um resumo das maiores mudanças que afetarão o transporte executivo no próximo ano fiscal.	A crescente digitalização do processo de reservas e a preferência por veículos elétricos são os pontos principais. A nossa frota já está adaptada para estes desafios...	Viagens de Negócios	https://placehold.co/600x400/007bff/ffffff?text=Viagens+Negócios	João Silva	7 min	2025-10-06 10:00:00+01	2025-10-06 12:38:11.002903+01	2025-10-06 12:38:11.002903+01
4	Dicas Essenciais para Segurança em Aeroportos	Como planear a sua viagem para evitar atrasos e garantir o máximo de conforto desde o momento do check-in.	Recomendamos sempre chegar 3 horas antes de voos internacionais e usar o nosso serviço de Meet & Greet para poupar tempo na alfândega.	Segurança	https://placehold.co/600x400/28a745/ffffff?text=Segurança+Aeroporto	Equipa Editorial	5 min	2025-10-05 15:30:00+01	2025-10-06 12:38:11.002903+01	2025-10-06 12:38:11.002903+01
\.


--
-- Data for Name: reservations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reservations (id, fleet_id, service_id, client_user_id, start_time, end_time, status, pickup_address, dropoff_address, trip_pickup_time, trip_duration_minutes, final_price, payment_intent_id, passenger_name, passenger_email, passenger_phone, special_requests, created_at, updated_at) FROM stdin;
1	8	3	\N	2025-10-15 15:00:00+01	2025-10-15 18:30:00+01	CONFIRMED	Rua Principal, 10, Lisboa	Aeroporto de Lisboa	2025-10-15 15:30:00+01	120	150.75	PAYMENT_1759482314900	António Silva	antonio@exemplo.com	910123456	Cadeira de criança, por favor.	2025-10-03 10:05:14.894514+01	2025-10-03 10:05:14.901058+01
2	9	1	\N	2025-10-15 15:00:00+01	2025-10-15 18:30:00+01	CONFIRMED	Rua Principal, 10, Lisboa	Aeroporto de Lisboa	2025-10-15 15:30:00+01	120	150.75	PAYMENT_1759482707419	António Silva	antonio@exemplo.com	910123456	Cadeira de criança, por favor.	2025-10-03 10:11:47.415783+01	2025-10-03 10:11:47.419708+01
3	9	1	\N	2025-10-20 10:30:00+01	2025-10-20 13:30:00+01	PENDING	Rua Principal, 10, Lisboa	Aeroporto de Lisboa	2025-10-20 11:00:00+01	90	95.50	\N	Maria Teste	maria@teste.com	911223344		2025-10-03 10:17:52.457514+01	2025-10-03 10:17:52.457514+01
4	8	1	\N	2025-10-20 10:30:00+01	2025-10-20 13:30:00+01	PENDING	Rua Principal, 10, Lisboa	Aeroporto de Lisboa	2025-10-20 11:00:00+01	90	95.50	\N	Pedro Teste	pedro@teste.com	911223344	Por favor, água.	2025-10-03 10:19:34.012423+01	2025-10-03 10:19:34.012423+01
6	8	1	1	2026-01-20 10:30:00+00	2026-01-20 13:40:00+00	PENDING	Rua das Flores, 45, Lisboa	Aeroporto de Lisboa	2026-01-20 11:00:00+00	100	75.25	\N	Cliente EasyPay Teste	easypay@teste.com	961234567	Sem pedidos especiais.	2025-10-03 10:36:10.243486+01	2025-10-03 10:36:10.243486+01
7	8	1	1	2027-01-20 10:30:00+00	2027-01-20 13:40:00+00	PENDING	Rua das Flores, 45, Lisboa	Aeroporto de Lisboa	2027-01-20 11:00:00+00	100	75.25	\N	Cliente EasyPay Teste	easypay@teste.com	961234567	Sem pedidos especiais.	2025-10-03 10:41:27.586359+01	2025-10-03 10:41:27.586359+01
8	8	1	1	2027-01-25 10:30:00+00	2027-01-25 13:40:00+00	PENDING	Rua das Flores, 45, Lisboa	Aeroporto de Lisboa	2027-01-25 11:00:00+00	100	75.25	\N	Cliente EasyPay Teste	easypay@teste.com	961234567	Sem pedidos especiais.	2025-10-03 10:42:14.88218+01	2025-10-03 10:42:14.88218+01
9	8	1	1	2027-01-24 10:30:00+00	2027-01-24 13:40:00+00	PENDING	Rua das Flores, 45, Lisboa	Aeroporto de Lisboa	2027-01-24 11:00:00+00	100	75.25	\N	Cliente EasyPay Teste	easypay@teste.com	961234567	Sem pedidos especiais.	2025-10-03 10:43:49.173075+01	2025-10-03 10:43:49.173075+01
10	8	1	1	2027-01-18 10:30:00+00	2027-01-18 13:40:00+00	CANCELLED	Rua das Flores, 45, Lisboa	Aeroporto de Lisboa	2027-01-18 11:00:00+00	100	75.25	\N	Cliente EasyPay Teste	easypay-mb@teste.com	961234567	Testes de Pagamento EasyPay MB.	2025-10-03 10:45:29.734517+01	2025-10-03 10:45:30.005859+01
11	8	1	1	2027-01-17 10:30:00+00	2027-01-17 13:40:00+00	CANCELLED	Rua das Flores, 45, Lisboa	Aeroporto de Lisboa	2027-01-17 11:00:00+00	100	75.25	\N	Cliente EasyPay Teste	easypay-mb@teste.com	961234567	Testes de Pagamento EasyPay MB.	2025-10-03 10:45:50.829875+01	2025-10-03 10:45:51.111604+01
12	8	1	1	2027-01-17 10:30:00+00	2027-01-17 13:40:00+00	CANCELLED	Rua das Flores, 45, Lisboa	Aeroporto de Lisboa	2027-01-17 11:00:00+00	100	75.25	\N	Cliente EasyPay Teste	easypay-mb@teste.com	961234567	Testes de Pagamento EasyPay MB.	2025-10-03 10:47:05.40869+01	2025-10-03 10:47:05.692599+01
13	8	1	1	2027-01-17 10:30:00+00	2027-01-17 13:40:00+00	CANCELLED	Rua das Flores, 45, Lisboa	Aeroporto de Lisboa	2027-01-17 11:00:00+00	100	75.25	\N	Cliente EasyPay Teste	easypay-mb@teste.com	961234567	Testes de Pagamento EasyPay MB.	2025-10-03 10:47:18.850571+01	2025-10-03 10:47:19.315553+01
14	8	1	1	2027-01-17 10:30:00+00	2027-01-17 13:40:00+00	CANCELLED	Rua das Flores, 45, Lisboa	Aeroporto de Lisboa	2027-01-17 11:00:00+00	100	75.25	\N	Cliente EasyPay Teste	easypay-mb@teste.com	961234567	Testes de Pagamento EasyPay MB.	2025-10-03 10:49:03.136026+01	2025-10-03 10:49:03.414526+01
15	8	1	1	2027-01-19 10:30:00+00	2027-01-19 13:40:00+00	CANCELLED	Rua das Flores, 45, Lisboa	Aeroporto de Lisboa	2027-01-19 11:00:00+00	100	75.25	\N	Cliente EasyPay Final	easypay-final@teste.com	961234567	Teste de Pagamento EasyPay MB - Chave Completa.	2025-10-03 10:50:07.943305+01	2025-10-03 10:50:08.298752+01
16	8	1	1	2027-01-19 10:30:00+00	2027-01-19 13:40:00+00	CANCELLED	Rua das Flores, 45, Lisboa	Aeroporto de Lisboa	2027-01-19 11:00:00+00	100	75.25	\N	Cliente EasyPay Final	easypay-final@teste.com	961234567	Teste de Pagamento EasyPay MB - Chave Completa.	2025-10-03 10:51:20.368463+01	2025-10-03 10:51:20.685085+01
17	8	1	1	2027-01-19 10:30:00+00	2027-01-19 13:40:00+00	PENDING	Rua das Flores, 45, Lisboa	Aeroporto de Lisboa	2027-01-19 11:00:00+00	100	75.25	\N	Cliente EasyPay Final	easypay-final@teste.com	961234567	Teste de Pagamento EasyPay MB - Chave Completa.	2025-10-03 11:03:48.87837+01	2025-10-03 11:03:48.87837+01
18	8	1	1	2027-01-18 10:30:00+00	2027-01-18 13:40:00+00	PENDING	Rua das Flores, 45, Lisboa	Aeroporto de Lisboa	2027-01-18 11:00:00+00	100	75.25	\N	Cliente EasyPay Final	easypay-final@teste.com	961234567	Teste de Pagamento EasyPay MB - Chave Completa.	2025-10-03 11:06:51.867161+01	2025-10-03 11:06:51.867161+01
19	16	8	\N	2025-10-04 10:30:00+01	2025-10-04 14:00:00+01	PENDING	Funchal	Santana	2025-10-04 11:00:00+01	120	85.00	\N	Rodrigo Caldeira Miranda	rodrigomt@sapo.pt	966545381	teste	2025-10-04 14:36:00.059799+01	2025-10-04 14:36:00.059799+01
20	16	8	\N	2025-10-05 10:30:00+01	2025-10-05 14:00:00+01	PENDING	Funchal	Santana	2025-10-05 11:00:00+01	120	85.00	\N	Rodrigo Caldeira Miranda	rodrigomt@sapo.pt	966545381	teste	2025-10-04 14:41:21.026037+01	2025-10-04 14:41:21.026037+01
21	9	9	\N	2025-10-03 10:30:00+01	2025-10-03 14:00:00+01	PENDING	Funchal	Santana	2025-10-03 11:00:00+01	120	60.00	\N	Rodrigo Caldeira Miranda	rodrigomt@sapo.pt	966545381	teste	2025-10-04 14:42:38.498652+01	2025-10-04 14:42:38.498652+01
22	8	1	1	2027-01-26 10:30:00+00	2027-01-26 13:40:00+00	PENDING	Rua das Flores, 45, Lisboa	Aeroporto de Lisboa	2027-01-26 11:00:00+00	100	75.25	\N	Cliente EasyPay Final	easypay-final@teste.com	961234567	Teste de Pagamento EasyPay MB - Chave Completa.	2025-10-04 14:48:48.256253+01	2025-10-04 14:48:48.256253+01
23	8	1	1	2027-01-29 10:30:00+00	2027-01-29 13:40:00+00	PENDING	Rua das Flores, 45, Lisboa	Aeroporto de Lisboa	2027-01-29 11:00:00+00	100	75.25	\N	Cliente EasyPay Final	easypay-final@teste.com	961234567	Teste de Pagamento EasyPay MB - Chave Completa.	2025-10-04 15:08:41.412222+01	2025-10-04 15:08:41.412222+01
24	8	1	1	2027-01-31 10:30:00+00	2027-01-31 13:40:00+00	PENDING	Rua das Flores, 45, Lisboa	Aeroporto de Lisboa	2027-01-31 11:00:00+00	100	75.25	\N	Cliente EasyPay Final	easypay-final@teste.com	961234567	Teste de Pagamento EasyPay MB - Chave Completa.	2025-10-04 15:08:56.291606+01	2025-10-04 15:08:56.291606+01
25	8	1	1	2027-01-27 10:30:00+00	2027-01-27 13:40:00+00	PENDING	Rua das Flores, 45, Lisboa	Aeroporto de Lisboa	2027-01-27 11:00:00+00	100	75.25	\N	Cliente EasyPay Final	easypay-final@teste.com	961234567	Teste de Pagamento EasyPay MB - Chave Completa.	2025-10-04 15:09:33.897193+01	2025-10-04 15:09:33.897193+01
26	8	1	1	2027-02-27 10:30:00+00	2027-02-27 13:40:00+00	PENDING	Rua das Flores, 45, Lisboa	Aeroporto de Lisboa	2027-02-27 11:00:00+00	100	75.25	\N	Cliente EasyPay Final	easypay-final@teste.com	961234567	Teste de Pagamento EasyPay MB - Chave Completa.	2025-10-04 15:15:49.829087+01	2025-10-04 15:15:49.829087+01
27	16	8	\N	2025-11-05 09:30:00+00	2025-11-05 13:00:00+00	PENDING	Funchal	Santana	2025-11-05 10:00:00+00	120	85.00	\N	Rodrigo Caldeira Miranda	rodrigomt@spao.pt	966545381	teste	2025-10-04 15:20:33.627525+01	2025-10-04 15:20:33.627525+01
28	9	8	\N	2025-10-23 10:30:00+01	2025-10-23 14:00:00+01	PENDING	Funchal	Santana	2025-10-23 11:00:00+01	120	60.00	\N	Rodrigo Miranda	rodrigomt@sapo.pt	966545381	teste	2025-10-06 09:46:07.588519+01	2025-10-06 09:46:07.588519+01
29	8	1	1	2026-12-05 09:30:00+00	2026-12-05 12:40:00+00	PENDING	Rua de Teste Confirmed, 45	Aeroporto de Lisboa	2026-12-05 10:00:00+00	100	75.25	\N	Cliente Teste Um	teste1@booking.com	961000001	TESTE 1: CONFIRMED - Slot das 10h	2025-10-06 09:57:48.336178+01	2025-10-06 09:57:48.336178+01
30	9	1	1	2026-12-05 12:00:00+00	2026-12-05 15:10:00+00	PENDING	Rua de Teste Pending, 45	Aeroporto de Lisboa	2026-12-05 12:30:00+00	100	60.00	\N	Cliente Teste Dois	teste2@booking.com	961000002	TESTE 2: PENDING - Slot das 12:30h	2025-10-06 09:59:15.237931+01	2025-10-06 09:59:15.237931+01
31	10	1	1	2026-12-05 14:30:00+00	2026-12-05 17:40:00+00	PENDING	Rua de Teste Cancelled, 45	Aeroporto de Lisboa	2026-12-05 15:00:00+00	100	50.00	\N	Cliente Teste Três	teste3@booking.com	961000003	TESTE 3: CANCELLED - Slot das 15h (NÃO DEVE BLOQUEAR)	2025-10-06 09:59:46.414119+01	2025-10-06 09:59:46.414119+01
32	16	9	\N	2025-10-24 11:00:00+01	2025-10-24 14:30:00+01	PENDING	Av. do Mar e das Comunidades Madeirenses, 9060-190 Funchal, Portugal	9100-105 Santa Cruz, Madeira, Portugal	2025-10-24 11:30:00+01	120	85.00	\N	Rodrigo Miranda	teste@sapo.pt	966545381	teste	2025-10-07 11:34:51.11917+01	2025-10-07 11:34:51.11917+01
33	8	8	\N	2025-10-17 15:30:00+01	2025-10-17 19:00:00+01	PENDING	Est. das Eiras 48, 9230-118 Santana, Portugal	funchal	2025-10-17 16:00:00+01	120	45.00	\N	Rodrigo Miranda	rodrigomt@sapo.pt	966545381	teste	2025-10-07 19:27:07.183806+01	2025-10-07 19:27:07.183806+01
34	16	8	\N	2025-10-07 10:30:00+01	2025-10-07 14:00:00+01	CANCELLED	Est. das Eiras 48, 9230-118 Santana, Portugal	Funchal, Portugal	2025-10-07 11:00:00+01	120	85.00	\N	Rodrigo Caldeira Miranda	rodrigomt@sapo.pt	966545381	teste	2025-10-07 19:35:00.822142+01	2025-10-07 19:35:01.125501+01
35	16	8	\N	2025-10-07 10:30:00+01	2025-10-07 14:00:00+01	PENDING	Est. das Eiras 48, 9230-118 Santana, Portugal	Funchal, Portugal	2025-10-07 11:00:00+01	120	85.00	\N	Rodrigo Caldeira Miranda	rodrigomt@sapo.pt	966545381	teste	2025-10-07 19:35:05.507269+01	2025-10-07 19:35:05.507269+01
36	9	8	\N	2025-10-07 10:30:00+01	2025-10-07 14:00:00+01	PENDING	Est. das Eiras 48, 9230-118 Santana, Portugal	9100-105 Santa Cruz, Madeira, Portugal	2025-10-07 11:00:00+01	120	60.00	\N	Rodrigo Caldeira Miranda	rodrigomt@sapo.pt	966545381	teste	2025-10-07 19:35:53.931893+01	2025-10-07 19:35:53.931893+01
37	9	8	\N	2025-10-07 15:32:00+01	2025-10-07 19:02:00+01	PENDING	9230 Santana, Portugal	Funchal, Portugal	2025-10-07 16:02:00+01	120	60.00	\N	Rodrigo Caldeira Miranda	rodrigomt@sapo.pt	966545381	teste	2025-10-07 19:57:12.256997+01	2025-10-07 19:57:12.256997+01
38	10	1	\N	2027-12-05 14:30:00+00	2027-12-05 17:40:00+00	PENDING	Rua de Teste, 45 - Lisboa	Aeroporto de Lisboa (LIS)	2027-12-05 15:00:00+00	100	75.50	\N	António Silva	antonio.silva@booking.com	918000000	Uma cadeira de bebé e uma paragem extra breve.	2025-10-07 20:06:25.913096+01	2025-10-07 20:06:25.913096+01
39	16	9	\N	2025-10-10 11:30:00+01	2025-10-10 15:00:00+01	PENDING	R. Dr. João Abel de Freitas Médico 2, 9230 Santana, Portugal	9100-105 Santa Cruz, Madeira, Portugal	2025-10-10 12:00:00+01	120	85.00	\N	Rodrigo Caldeira Miranda	rodrigomt@sapo.pt	966545381	teste	2025-10-07 20:31:59.127878+01	2025-10-07 20:31:59.127878+01
40	16	9	\N	2025-10-11 10:30:00+01	2025-10-11 14:00:00+01	PENDING	9230 Santana, Portugal	9100-105 Santa Cruz, Madeira, Portugal	2025-10-11 11:00:00+01	120	85.00	\N	Rodrigo Caldeira Miranda	rodrigomt@sapo.pt	966545381	teste	2025-10-07 20:36:25.135263+01	2025-10-07 20:36:25.135263+01
41	9	8	\N	2025-10-10 10:30:00+01	2025-10-10 14:00:00+01	PENDING	R. Dr. João Abel de Freitas Médico 2, 9230 Santana, Portugal	9100-105 Santa Cruz, Madeira, Portugal	2025-10-10 11:00:00+01	120	60.00	\N	Rodrigo Caldeira Miranda	rodrigomt@sapo.pt	966545381	teste	2025-10-08 16:34:40.945471+01	2025-10-08 16:34:40.945471+01
42	16	8	\N	2025-10-17 10:30:00+01	2025-10-17 14:00:00+01	PENDING	Est. das Eiras 48, 9230-118 Santana, Portugal	Funchal, Portugal	2025-10-17 11:00:00+01	120	85.00	\N	Rodrigo Caldeira Miranda	rodrigomt@sapo.pt	966545381	teste	2025-10-08 16:45:55.559523+01	2025-10-08 16:45:55.559523+01
43	16	8	\N	2025-10-17 15:30:00+01	2025-10-17 19:00:00+01	PENDING	Est. das Eiras 48, 9230-118 Santana, Portugal	Funchal, Portugal	2025-10-17 16:00:00+01	120	85.00	\N	Rodrigo Caldeira Miranda	rodrigomt@sapo.pt	966545381	teste	2025-10-08 16:51:10.229229+01	2025-10-08 16:51:10.229229+01
44	16	8	\N	2025-10-08 10:30:00+01	2025-10-08 14:00:00+01	PENDING	Est. das Eiras 48, 9230-118 Santana, Portugal	Funchal, Portugal	2025-10-08 11:00:00+01	120	85.00	\N	Rodrigo Caldeira Miranda	rodrigomt@sapo.pt	966545381	teste	2025-10-08 17:05:14.203726+01	2025-10-08 17:05:14.203726+01
45	16	8	\N	2025-10-08 18:30:00+01	2025-10-08 22:00:00+01	PENDING	9240 São Vicente, Portugal	9100-105 Santa Cruz, Madeira, Portugal	2025-10-08 19:00:00+01	120	85.00	\N	Rodrigo Caldeira Miranda	rodrigomt@sapo.pt	966545381	teste	2025-10-08 17:22:48.645533+01	2025-10-08 17:22:48.645533+01
46	16	8	\N	2025-10-08 23:30:00+01	2025-10-09 03:00:00+01	PENDING	Est. das Eiras 48, 9230-118 Santana, Portugal	Funchal, Portugal	2025-10-09 00:00:00+01	120	85.00	\N	Rodrigo Caldeira Miranda	rodrigomt@sapo.pt	966545381	TESTE	2025-10-08 17:32:36.26198+01	2025-10-08 17:32:36.26198+01
47	9	8	\N	2025-10-25 15:30:00+01	2025-10-25 19:00:00+01	PENDING	9230 Santana, Portugal	9100-105 Santa Cruz, Madeira, Portugal	2025-10-25 16:00:00+01	120	60.00	\N	Rodrigo Caldeira Miranda	rodrigomt@sapo.pt	966545381	teste	2025-10-08 17:33:28.83565+01	2025-10-08 17:33:28.83565+01
48	9	8	\N	2025-10-08 19:30:00+01	2025-10-08 23:00:00+01	PENDING	Vereda da Achada do Calhau, Caminho do Teleferico, 9270-015 Porto Moniz, Portugal	R. dos Dragoeiros 36, 9350 Ribeira Brava, Portugal	2025-10-08 20:00:00+01	120	60.00	\N	Rodrigo Caldeira Miranda	rodrigomt@sapo.pt	966545381	teste	2025-10-08 17:34:05.732521+01	2025-10-08 17:34:05.732521+01
49	16	8	\N	2025-10-31 14:30:00+00	2025-10-31 18:00:00+00	PENDING	9230 Santana, Portugal	9100-105 Santa Cruz, Madeira, Portugal	2025-10-31 15:00:00+00	120	85.00	\N	Rodrigo Caldeira Miranda	rodrigomt@sapo.pt	966545381	TESTE	2025-10-08 17:43:19.441242+01	2025-10-08 17:43:19.441242+01
50	16	8	\N	2025-10-30 14:30:00+00	2025-10-30 18:00:00+00	PENDING	9230 Santana, Portugal	9100-105 Santa Cruz, Madeira, Portugal	2025-10-30 15:00:00+00	120	85.00	\N	Rodrigo Caldeira Miranda	rodrigomt@sapo.pt	966545381	teste	2025-10-08 17:45:12.304273+01	2025-10-08 17:45:12.304273+01
51	16	8	\N	2025-10-30 18:30:00+00	2025-10-30 22:00:00+00	PENDING	9230 Santana, Portugal	9100-105 Santa Cruz, Madeira, Portugal	2025-10-30 19:00:00+00	120	85.00	\N	Rodrigo Caldeira Miranda	rodrigomt@sapo.pt	966545381	TESTE	2025-10-08 17:45:50.56044+01	2025-10-08 17:45:50.56044+01
52	16	9	\N	2025-10-11 15:30:00+01	2025-10-11 19:00:00+01	PENDING	Estr. das Eiras 48, 9230-118 Santana, Portugal	Av. do Mar e das Comunidades Madeirenses, 9060-190 Funchal, Portugal	2025-10-11 16:00:00+01	120	85.00	\N	Rodrigo Miranda	rodrigomt@sapo.pt	966545381	teste	2025-10-11 12:09:04.160662+01	2025-10-11 12:09:04.160662+01
53	9	6	\N	2025-10-27 12:30:00+00	2025-10-27 16:00:00+00	PENDING	Estr. das Eiras 48, 9230-118 Santana, Portugal	Funchal, Portugal	2025-10-27 13:00:00+00	120	120.00	\N	Rodrigo Miranda	rodrigomt@sapo.pt	966545381	teste	2025-10-11 13:55:17.9911+01	2025-10-11 13:55:17.9911+01
54	8	7	\N	2025-10-11 10:30:00+01	2025-10-11 14:00:00+01	PENDING	Estr. das Eiras 48, 9230-118 Santana, Portugal	9230 Santana, Portugal	2025-10-11 11:00:00+01	120	90.00	\N	Rodrigo Miranda	rodrigomt@sapo.pt	966545381	teste	2025-10-11 13:58:04.313066+01	2025-10-11 13:58:04.313066+01
55	9	6	\N	2025-10-11 10:30:00+01	2025-10-11 16:00:00+01	PENDING	Estr. das Eiras 48, 9230-118 Santana, Portugal	Madeira, 9270, Portugal	2025-10-11 11:00:00+01	240	240.00	\N	Rodrigo Caldeira Miranda	rodrigomt@sapo.pt	966545381	teste	2025-10-11 14:08:35.227074+01	2025-10-11 14:08:35.227074+01
56	16	9	\N	2025-10-22 10:30:00+01	2025-10-22 14:00:00+01	PENDING	Estr. das Eiras 48, 9230-118 Santana, Portugal	9100-105 Santa Cruz, Madeira, Portugal	2025-10-22 11:00:00+01	120	170.00	\N	Rodrigo Caldeira Miranda	rodrigomt@sapo.pt	966545381	teste	2025-10-11 14:13:32.680241+01	2025-10-11 14:13:32.680241+01
57	9	8	\N	2025-10-21 10:30:00+01	2025-10-21 14:00:00+01	PENDING	Estr. das Eiras 48, 9230-118 Santana, Portugal	Av. Arriaga 75, São Martinho, 9000-216 Funchal, Portugal	2025-10-21 11:00:00+01	120	120.00	\N	Rodrigo Caldeira Miranda	rodrigomt@sapo.pt	966545381	teste	2025-10-11 14:16:04.291952+01	2025-10-11 14:16:04.291952+01
58	16	9	\N	2025-10-31 11:30:00+00	2025-10-31 14:00:00+00	PENDING	Estr. das Eiras 48, 9230-118 Santana, Portugal	9230 Santana, Portugal	2025-10-31 12:00:00+00	60	85.00	\N	Rodrigo Caldeira Miranda	rodrigomt@sapo.pt	966545381	teste	2025-10-11 14:25:31.493373+01	2025-10-11 14:25:31.493373+01
59	8	8	\N	2025-10-29 09:30:00+00	2025-10-29 12:00:00+00	PENDING	Estr. das Eiras 48, 9230-118 Santana, Portugal	9100-105 Santa Cruz, Madeira, Portugal	2025-10-29 10:00:00+00	60	45.00	\N	Rodrigo Caldeira Miranda	rodrigomt@sapo.pt	966545381	teste	2025-10-13 11:27:47.377518+01	2025-10-13 11:27:47.377518+01
60	16	8	\N	2025-10-13 14:30:00+01	2025-10-13 17:00:00+01	PENDING	Estr. das Eiras 48, 9230-118 Santana, Portugal	Madeira, 9270, Portugal	2025-10-13 15:00:00+01	60	85.00	\N	Rodrigo Caldeira Miranda	rodrigomt@sapo.pt	966545381	teste	2025-10-13 12:13:34.398418+01	2025-10-13 12:13:34.398418+01
61	16	9	\N	2025-10-13 10:30:00+01	2025-10-13 13:00:00+01	PENDING	Santa Cruz, Portugal	Funchal, Portugal	2025-10-13 11:00:00+01	60	85.00	\N	Rodrigo Caldeira Miranda	rodrigomt@sapo.pt	966453581	teste	2025-10-13 12:22:15.578835+01	2025-10-13 12:22:15.578835+01
62	16	9	\N	2025-10-30 09:30:00+00	2025-10-30 12:00:00+00	PENDING	Estr. das Eiras 48, 9230-118 Santana, Portugal	Funchal, Portugal	2025-10-30 10:00:00+00	60	85.00	\N	Rodrigo Caldeira Miranda	rodrigomt@sapo.pt	966545381	teste	2025-10-13 12:26:37.26764+01	2025-10-13 12:26:37.26764+01
63	16	9	1	2025-10-31 21:30:00+00	2025-11-01 00:00:00+00	CONFIRMED	Estr. das Eiras 48, 9230-118 Santana, Portugal	Funchal, Portugal	2025-10-31 22:00:00+00	60	85.00	2e89c88e-9d75-47e8-ae1b-f0366c18e4bd	Rodrigo Caldeira Miranda	rodrigomt@sapo.pt	966545381	TESTE	2025-10-13 12:29:00.304607+01	2025-10-13 13:00:59.488022+01
64	16	9	\N	2025-10-30 21:30:00+00	2025-10-31 00:00:00+00	PENDING	9230 Santana, Portugal	Funchal, Portugal	2025-10-30 22:00:00+00	60	85.00	\N	Rodrigo Caldeira Miranda	rodrigomt@sapo.pt	966554381	teste	2025-10-14 10:07:51.59837+01	2025-10-14 10:07:51.59837+01
65	9	8	\N	2025-10-14 19:30:00+01	2025-10-14 22:00:00+01	PENDING	9100-105 Santa Cruz, Madeira, Portugal	Funchal, Portugal	2025-10-14 20:00:00+01	60	60.00	\N	Rodrigo Caldeira Miranda	rodrigomt@sapo.pt	966545381	TESTE	2025-10-14 10:14:15.556545+01	2025-10-14 10:14:15.556545+01
66	16	9	\N	2025-10-14 19:30:00+01	2025-10-14 22:00:00+01	PENDING	9230 Santana, Portugal	funchak	2025-10-14 20:00:00+01	60	85.00	\N	Rodrigo Caldeira Miranda	rodrigomt@sapo.pt	966545381	teste	2025-10-14 10:18:43.730535+01	2025-10-14 10:18:43.730535+01
74	16	8	2	2025-10-21 10:30:00+01	2025-10-21 13:00:00+01	PENDING	Estr. das Eiras 48, 9230-118 Santana, Portugal	Funchal, Portugal	2025-10-21 11:00:00+01	60	85.00	\N	Rodrigo Caldeira Miranda	rodrigomt@sapo.pt	966545381	teste	2025-10-21 11:16:47.85012+01	2025-10-21 11:16:47.85012+01
75	9	8	\N	2025-11-23 09:30:00+00	2025-11-23 12:00:00+00	PENDING	Estr. Cmte. Camacho de Freitas 537, 9020-104 Funchal, Portugal	9100-105 Santa Cruz, Madeira, Portugal	2025-11-23 10:00:00+00	60	60.00	\N	Rodrigo Caldeira Miranda	rodrigomt@sapo.pt	966545381	teste	2025-10-23 15:08:17.910941+01	2025-10-23 15:08:17.910941+01
76	9	5	\N	2025-11-05 09:30:00+00	2025-11-05 12:00:00+00	PENDING	Estr. das Eiras 48, 9230-118 Santana, Portugal	Funchal, Portugal	2025-11-05 10:00:00+00	60	60.00	\N	Rodrigo Caldeira Miranda	rodrigomt@sapo.pt	966545381	Teste	2025-11-05 13:28:41.536083+00	2025-11-05 13:28:41.536083+00
68	16	8	\N	2025-10-15 19:30:00+01	2025-10-15 22:00:00+01	CONFIRMED	Santa Cruz, Portugal	9100-105 Santa Cruz, Madeira, Portugal	2025-10-15 20:00:00+01	60	85.00	70804e47-797a-4382-8344-a5c0cfb9650f	Rodrigo Caldeira Miranda	rodrigomt@sapo.pt	966545381	teste	2025-10-14 10:25:53.75901+01	2025-10-14 10:30:45.316105+01
70	16	8	\N	2025-10-17 19:30:00+01	2025-10-17 22:00:00+01	CONFIRMED	Santa Cruz, Portugal	Funchal, Portugal	2025-10-17 20:00:00+01	60	85.00	34a2b22f-57e9-475e-9740-c72309df1fd4	Rodrigo Caldeira Miranda	rodrigomt@sapo.pt	966545381	teste	2025-10-14 10:30:53.625552+01	2025-10-14 10:31:21.004659+01
69	16	8	\N	2025-10-16 19:30:00+01	2025-10-16 22:00:00+01	CONFIRMED	Santa Cruz, Portugal	Funchal, Portugal	2025-10-16 20:00:00+01	60	85.00	b02f5c95-06aa-4adb-a1e1-28b5faf3567e	Rodrigo Caldeira Miranda	rodrigomt@sapo.pt	966545381	teste	2025-10-14 10:28:16.760354+01	2025-10-14 10:33:07.598447+01
67	16	8	\N	2025-10-31 18:30:00+00	2025-10-31 21:00:00+00	CONFIRMED	Santa Cruz, Portugal	9100-105 Santa Cruz, Madeira, Portugal	2025-10-31 19:00:00+00	60	85.00	56429f14-a5b2-402d-9219-282a3d99d675	Rodrigo Caldeira Miranda	rodrigomt@sapo.pt	966545381	teste	2025-10-14 10:24:08.516009+01	2025-10-14 10:34:17.572495+01
71	16	8	\N	2025-10-23 10:30:00+01	2025-10-23 13:00:00+01	CONFIRMED	9240 São Vicente, Portugal	Funchal, Portugal	2025-10-23 11:00:00+01	60	85.00	e7addf87-9e43-47a8-8cb3-ad3ef438c33c	Rodrigo Caldeira Miranda	rodrigomt@sapo.pt	966545381	teste	2025-10-14 10:35:56.545908+01	2025-10-14 10:37:53.597734+01
72	16	8	\N	2025-10-23 19:30:00+01	2025-10-23 22:00:00+01	CONFIRMED	Santa Cruz, Portugal	FUNCHAL	2025-10-23 20:00:00+01	60	85.00	d58022a0-3053-4f70-af45-57ca118bd65f	Rodrigo Caldeira Miranda	rodrigomt@sapo.pt	966545381	teste	2025-10-14 10:38:25.810555+01	2025-10-14 10:38:37.099251+01
73	16	8	\N	2025-10-29 16:30:00+00	2025-10-29 19:00:00+00	PENDING	Santa Cruz, Portugal	9100-105 Santa Cruz, Madeira, Portugal	2025-10-29 17:00:00+00	60	85.00	\N	Rodrigo Caldeira Miranda	rodrigomt@sapo.pt	966545381	teste	2025-10-14 11:10:18.999309+01	2025-10-14 11:10:18.999309+01
\.


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role_permissions (role_id, permission_id) FROM stdin;
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, name, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: service_fleets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.service_fleets (service_id, fleet_id) FROM stdin;
1	8
2	8
3	8
1	9
2	9
3	9
1	10
2	10
3	10
6	9
7	8
9	16
9	8
8	9
8	8
8	16
5	9
7	9
9	9
\.


--
-- Data for Name: services; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.services (id, name, description, is_active, created_at, updated_at, deleted_at, image_url) FROM stdin;
1	{"en": "Airport Transfers", "pt": "Transfers para o aeroporto"}	{"en": "Transport service from the airport to hotels and homes.", "pt": "Serviço de transporte do aeroporto para hotéis e residências."}	t	2025-09-30 11:16:44.053575+01	2025-09-30 11:16:44.053575+01	2025-09-30 11:30:39.535066+01	\N
2	{"en": "Executive Transportation for Business", "pt": "Transporte Executivo para Negócios"}	{"en": "Premium and discreet transport service, ideal for meetings, corporate events, and executive travel.", "pt": "Serviço de transporte premium e discreto, ideal para reuniões, eventos corporativos e deslocamento de executivos."}	t	2025-09-30 11:30:04.94293+01	2025-09-30 12:06:56.043902+01	2025-09-30 12:08:29.865627+01	http://localhost:5173/src/assets/transporte_negocio.webp
3	{"en": "Executive Transportation for Business", "pt": "Transporte Executivo para Negócios"}	{"en": "Premium and discreet transport service, ideal for meetings, corporate events, and executive travel.", "pt": "Serviço de transporte premium e discreto, ideal para reuniões, eventos corporativos e deslocamento de executivos."}	t	2025-09-30 11:53:35.65908+01	2025-09-30 12:08:45.770712+01	\N	http://localhost:5173/src/assets/transporte_negocio.webp
4	{"en": "Airport Transfers", "pt": "Transfers para Aeroporto"}	{"en": "Punctual and comfortable transport service ( to and from ) airports. Available 24/7.", "pt": "Serviço de transporte pontual e confortável ( de e para ) aeroportos. Disponível 24/7."}	t	2025-09-30 12:11:43.495383+01	2025-09-30 12:12:55.002345+01	\N	http://localhost:5173/src/assets/transfer_aeroporto.jpg
5	{"en": "Special Events Transportation", "pt": "Transporte para Eventos Especiais"}	{"en": "Coordinated transport for galas, conferences, and major events. Ensure stress-free arrival and departure.", "pt": "Transporte coordenado para galas, conferências, e grandes eventos. Garanta a chegada e partida sem stress."}	t	2025-09-30 12:14:10.79336+01	2025-09-30 12:14:10.79336+01	\N	http://localhost:5173/src/assets/eventos_especiais.jpeg
6	{"en": "Hourly Service (As Directed)", "pt": "Serviço à Hora (Disposição)"}	{"en": "Hire a chauffeur and vehicle by the hour for complete flexibility with multiple stops or a fluid schedule.", "pt": "Contrate um motorista e veículo por horas para total flexibilidade em múltiplas paragens ou agendas fluidas."}	t	2025-09-30 12:18:08.553941+01	2025-09-30 12:18:08.553941+01	\N	http://localhost:5173/src/assets/servico_a_hora.jpg
7	{"en": "Wedding Transfers and Service", "pt": "Transfers e Serviço de Casamentos"}	{"en": "Elegant and luxurious travel for your special day. Includes decoration and dedicated chauffeur service.", "pt": "Viagens elegantes e luxuosas para o seu dia especial. Inclui decoração e serviço de motorista dedicado."}	t	2025-09-30 12:19:56.800831+01	2025-09-30 12:19:56.800831+01	\N	http://localhost:5173/src/assets/transfer_casamentos.jpg
8	{"en": "Private Day Tours", "pt": "Passeios Privados (Dia)"}	{"en": "Discover the city and its surroundings with custom itineraries, in the comfort of your private vehicle.", "pt": "Descubra a cidade e arredores com roteiros personalizados, no conforto do seu veículo privado."}	t	2025-09-30 12:21:21.302906+01	2025-09-30 12:21:21.302906+01	\N	http://localhost:5173/src/assets/passeios_privado.jpg
9	{"en": "Night Tours", "pt": "Passeios de Noite"}	{"en": "Explore the nightlife and illuminated sights with a safe and experienced chauffeur service.", "pt": "Explore a vida noturna e os pontos turísticos iluminados com um serviço de motorista seguro e experiente."}	t	2025-09-30 12:23:00.76626+01	2025-09-30 12:23:00.76626+01	\N	http://localhost:5173/src/assets/passeios_noite.jpg
\.


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_roles (user_id, role_id) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, password_hash, verified, verification_code, verification_code_validation, forgot_password_code, forgot_password_code_validation, created_at, updated_at, deleted_at) FROM stdin;
1	abeatriz.goncalves.222@gmail.com	$2b$12$0hDhan5HpQr9./bOPYH.we3dVjEsAfXezQ800JVCdM4fmpt.cflKG	f	\N	\N	\N	\N	2025-09-29 11:45:48.867218+01	2025-09-29 11:45:48.867218+01	\N
2	rodrigomt@gmail.com	$2b$12$Zlrf4eZK5kntLxxdXeaPH.QAM0GPQC/oBRZ8sT4dtn6mD9qpfD7PK	f	\N	\N	\N	\N	2025-10-21 10:35:38.858391+01	2025-10-21 10:35:38.858391+01	\N
\.


--
-- Name: fleets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.fleets_id_seq', 16, true);


--
-- Name: fleets_services_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.fleets_services_id_seq', 23, true);


--
-- Name: knex_migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.knex_migrations_id_seq', 6, true);


--
-- Name: knex_migrations_lock_index_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.knex_migrations_lock_index_seq', 1, true);


--
-- Name: media_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.media_id_seq', 68, true);


--
-- Name: permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.permissions_id_seq', 1, false);


--
-- Name: posts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.posts_id_seq', 4, true);


--
-- Name: reservations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reservations_id_seq', 76, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 1, false);


--
-- Name: services_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.services_id_seq', 9, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 2, true);


--
-- Name: fleets fleets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fleets
    ADD CONSTRAINT fleets_pkey PRIMARY KEY (id);


--
-- Name: fleets_services fleets_services_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fleets_services
    ADD CONSTRAINT fleets_services_pkey PRIMARY KEY (id);


--
-- Name: knex_migrations_lock knex_migrations_lock_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.knex_migrations_lock
    ADD CONSTRAINT knex_migrations_lock_pkey PRIMARY KEY (index);


--
-- Name: knex_migrations knex_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.knex_migrations
    ADD CONSTRAINT knex_migrations_pkey PRIMARY KEY (id);


--
-- Name: media media_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media
    ADD CONSTRAINT media_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_name_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_name_unique UNIQUE (name);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: posts posts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_pkey PRIMARY KEY (id);


--
-- Name: reservations reservations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (role_id, permission_id);


--
-- Name: roles roles_name_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_unique UNIQUE (name);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: service_fleets service_fleets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_fleets
    ADD CONSTRAINT service_fleets_pkey PRIMARY KEY (service_id, fleet_id);


--
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (user_id, role_id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_posts_published_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_posts_published_date ON public.posts USING btree (published_date DESC);


--
-- Name: idx_reservations_time_status_fleet; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reservations_time_status_fleet ON public.reservations USING btree (fleet_id, start_time, end_time, status);


--
-- Name: idx_service_fleets_fleet_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_service_fleets_fleet_id ON public.service_fleets USING btree (fleet_id);


--
-- Name: media_model_type_model_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX media_model_type_model_id_index ON public.media USING btree (model_type, model_id);


--
-- Name: unique_active_fleet_service; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX unique_active_fleet_service ON public.fleets_services USING btree (fleet_id, service_id) WHERE (deleted_at IS NULL);


--
-- Name: fleets_services fleets_services_fleet_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fleets_services
    ADD CONSTRAINT fleets_services_fleet_id_foreign FOREIGN KEY (fleet_id) REFERENCES public.fleets(id) ON DELETE CASCADE;


--
-- Name: fleets_services fleets_services_service_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fleets_services
    ADD CONSTRAINT fleets_services_service_id_foreign FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;


--
-- Name: reservations reservations_client_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_client_user_id_fkey FOREIGN KEY (client_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: reservations reservations_fleet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_fleet_id_fkey FOREIGN KEY (fleet_id) REFERENCES public.fleets(id) ON DELETE RESTRICT;


--
-- Name: reservations reservations_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE RESTRICT;


--
-- Name: role_permissions role_permissions_permission_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_permission_id_foreign FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_role_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_id_foreign FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: service_fleets service_fleets_fleet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_fleets
    ADD CONSTRAINT service_fleets_fleet_id_fkey FOREIGN KEY (fleet_id) REFERENCES public.fleets(id) ON DELETE CASCADE;


--
-- Name: service_fleets service_fleets_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_fleets
    ADD CONSTRAINT service_fleets_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_role_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_role_id_foreign FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

