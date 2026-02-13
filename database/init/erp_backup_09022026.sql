--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

-- Started on 2026-02-12 16:44:55

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 934 (class 1247 OID 18638)
-- Name: cliente_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.cliente_status AS ENUM (
    'ativo',
    'inativo'
);


--
-- TOC entry 931 (class 1247 OID 18632)
-- Name: fornecedor_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.fornecedor_status AS ENUM (
    'ativo',
    'inativo'
);


--
-- TOC entry 907 (class 1247 OID 16916)
-- Name: origem_movimentacao_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.origem_movimentacao_enum AS ENUM (
    'compra',
    'venda',
    'ajuste',
    'estorno_venda',
    'estorno_compra'
);


--
-- TOC entry 937 (class 1247 OID 18657)
-- Name: produto_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.produto_status_enum AS ENUM (
    'ativo',
    'inativo'
);


--
-- TOC entry 895 (class 1247 OID 16820)
-- Name: status_compra_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.status_compra_enum AS ENUM (
    'aberto',
    'aguardando',
    'aprovado',
    'recebido',
    'cancelado',
    'finalizado'
);


--
-- TOC entry 898 (class 1247 OID 16846)
-- Name: status_venda_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.status_venda_enum AS ENUM (
    'aberto',
    'aguardando',
    'aprovado',
    'despachado',
    'entregue',
    'finalizado',
    'cancelado'
);


--
-- TOC entry 904 (class 1247 OID 16911)
-- Name: tipo_movimentacao_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tipo_movimentacao_enum AS ENUM (
    'entrada',
    'saida'
);


--
-- TOC entry 892 (class 1247 OID 16809)
-- Name: tipo_pagamento_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tipo_pagamento_enum AS ENUM (
    'pix',
    'boleto',
    'cartao',
    'transferencia',
    'dinheiro'
);


--
-- TOC entry 247 (class 1255 OID 16989)
-- Name: atualizar_valor_total_ajuste_estoque(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.atualizar_valor_total_ajuste_estoque() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  UPDATE public.estoque_ajustes
  SET valor_total = (
    SELECT COALESCE(SUM(subtotal), 0)
    FROM public.estoque_ajuste_itens
    WHERE ajuste_id = NEW.ajuste_id
  )
  WHERE id = NEW.ajuste_id;

  RETURN NEW;
END;
$$;


--
-- TOC entry 246 (class 1255 OID 16439)
-- Name: update_data_atualizacao(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_data_atualizacao() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.data_atualizacao := NOW();
  RETURN NEW;
END;
$$;


--
-- TOC entry 259 (class 1255 OID 16945)
-- Name: validar_referencia_movimentacao_estoque(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.validar_referencia_movimentacao_estoque() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- COMPRA
    IF NEW.origem = 'compra' THEN
        IF NOT EXISTS (
            SELECT 1 FROM itens_compra
            WHERE compra_id = NEW.referencia_id
        ) THEN 
            RAISE EXCEPTION 'Referência inválida: Não existe compra com ID %', NEW.referencia_id;
        END IF;

    -- ESTORNO DE COMPRA
    ELSIF NEW.origem = 'estorno_compra' THEN
        IF NOT EXISTS (
            SELECT 1 FROM itens_compra
            WHERE compra_id = NEW.referencia_id
        ) THEN 
            RAISE EXCEPTION 'Referência inválida: Não existe compra (estorno) com ID %', NEW.referencia_id;
        END IF;

    -- VENDA
    ELSIF NEW.origem = 'venda' THEN
        IF NOT EXISTS (
            SELECT 1 FROM itens_venda
            WHERE venda_id = NEW.referencia_id
        ) THEN
            RAISE EXCEPTION 'Referência inválida: Não existe venda com ID %', NEW.referencia_id;
        END IF;

    -- ESTORNO DE VENDA
    ELSIF NEW.origem = 'estorno_venda' THEN
        IF NOT EXISTS (
            SELECT 1 FROM itens_venda
            WHERE venda_id = NEW.referencia_id
        ) THEN
            RAISE EXCEPTION 'Referência inválida: Não existe venda (estorno) com ID %', NEW.referencia_id;
        END IF;

    ELSE
        RAISE EXCEPTION 'Origem inválida: %', NEW.origem;
    END IF;

    RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 222 (class 1259 OID 16469)
-- Name: clientes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.clientes (
    id integer NOT NULL,
    razao_social text,
    nome_fantasia text,
    cnpj character varying(18),
    cpf character varying(18),
    inscricao_estadual character varying(20),
    telefone character varying(20),
    celular character varying(20),
    email character varying,
    rua character varying,
    numero character varying,
    complemento character varying,
    bairro character varying,
    cidade character varying,
    uf character varying,
    cep character varying(10),
    status public.cliente_status,
    data_cadastro timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 221 (class 1259 OID 16468)
-- Name: clientes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.clientes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5014 (class 0 OID 0)
-- Dependencies: 221
-- Name: clientes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.clientes_id_seq OWNED BY public.clientes.id;


--
-- TOC entry 237 (class 1259 OID 18089)
-- Name: compras; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.compras (
    id integer NOT NULL,
    fornecedor_id integer NOT NULL,
    data_emissao date NOT NULL,
    tipo_pagamento public.tipo_pagamento_enum,
    desconto_comercial numeric(14,2) DEFAULT 0 NOT NULL,
    desconto_financeiro numeric(14,2) DEFAULT 0 NOT NULL,
    desconto_volume numeric(14,2) DEFAULT 0 NOT NULL,
    valor_bruto numeric(14,2) DEFAULT 0 NOT NULL,
    valor_total numeric(14,2) GENERATED ALWAYS AS ((((valor_bruto - desconto_volume) - desconto_comercial) - desconto_financeiro)) STORED,
    status public.status_compra_enum NOT NULL,
    data_cadastro timestamp without time zone DEFAULT now() NOT NULL,
    created_by integer NOT NULL,
    data_atualizacao timestamp without time zone DEFAULT now() NOT NULL,
    updated_by integer NOT NULL
);


--
-- TOC entry 236 (class 1259 OID 18088)
-- Name: compras_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.compras ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.compras_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 239 (class 1259 OID 18117)
-- Name: compras_itens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.compras_itens (
    id integer NOT NULL,
    compra_id integer NOT NULL,
    produto_id integer NOT NULL,
    quantidade integer NOT NULL,
    preco_unitario numeric(12,2) NOT NULL,
    desconto_unitario numeric(12,2) DEFAULT 0 NOT NULL,
    valor_bruto numeric(14,2) GENERATED ALWAYS AS ((preco_unitario * (quantidade)::numeric)) STORED,
    valor_desconto numeric(14,2) GENERATED ALWAYS AS ((desconto_unitario * (quantidade)::numeric)) STORED,
    valor_liquido numeric(14,2) GENERATED ALWAYS AS (((preco_unitario - desconto_unitario) * (quantidade)::numeric)) STORED,
    data_cadastro timestamp without time zone DEFAULT now(),
    created_by integer NOT NULL,
    data_atualizacao timestamp without time zone DEFAULT now(),
    updated_by integer NOT NULL
);


--
-- TOC entry 238 (class 1259 OID 18116)
-- Name: compras_itens_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.compras_itens ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.compras_itens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 243 (class 1259 OID 18587)
-- Name: estoque_ajustes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.estoque_ajustes (
    id integer NOT NULL,
    tipo public.tipo_movimentacao_enum NOT NULL,
    motivo text NOT NULL,
    valor_total numeric(14,2) DEFAULT 0,
    observacao text,
    data_ajuste date NOT NULL,
    data_cadastro timestamp without time zone DEFAULT now(),
    created_by integer NOT NULL
);


--
-- TOC entry 242 (class 1259 OID 18586)
-- Name: estoque_ajustes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.estoque_ajustes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5015 (class 0 OID 0)
-- Dependencies: 242
-- Name: estoque_ajustes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.estoque_ajustes_id_seq OWNED BY public.estoque_ajustes.id;


--
-- TOC entry 245 (class 1259 OID 18606)
-- Name: estoque_ajustes_itens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.estoque_ajustes_itens (
    id integer NOT NULL,
    ajuste_id integer NOT NULL,
    produto_id integer NOT NULL,
    quantidade numeric(10,2) NOT NULL,
    preco_unitario numeric(12,2) NOT NULL,
    valor_total numeric(14,2) GENERATED ALWAYS AS ((quantidade * preco_unitario)) STORED,
    data_cadastro timestamp without time zone DEFAULT now(),
    created_by integer NOT NULL
);


--
-- TOC entry 244 (class 1259 OID 18605)
-- Name: estoque_ajustes_itens_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.estoque_ajustes_itens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5016 (class 0 OID 0)
-- Dependencies: 244
-- Name: estoque_ajustes_itens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.estoque_ajustes_itens_id_seq OWNED BY public.estoque_ajustes_itens.id;


--
-- TOC entry 231 (class 1259 OID 16865)
-- Name: estoque_saldo; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.estoque_saldo (
    produto_id integer NOT NULL,
    quantidade integer DEFAULT 0 NOT NULL,
    preco_medio_compra numeric(12,2) DEFAULT 0,
    preco_medio_venda numeric(12,2) DEFAULT 0
);


--
-- TOC entry 220 (class 1259 OID 16446)
-- Name: fornecedores; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fornecedores (
    id integer NOT NULL,
    razao_social text NOT NULL,
    nome_fantasia text,
    cnpj character varying(18) NOT NULL,
    inscricao_estadual character varying(20),
    telefone character varying(20),
    celular character varying(20),
    rua character varying,
    numero character varying,
    complemento character varying,
    bairro character varying,
    cidade character varying,
    uf character varying,
    cep character varying(10),
    status public.fornecedor_status,
    data_cadastro timestamp without time zone DEFAULT now(),
    data_atualizacao timestamp without time zone DEFAULT now(),
    email character varying
);


--
-- TOC entry 219 (class 1259 OID 16445)
-- Name: fornecedores_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.fornecedores_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5017 (class 0 OID 0)
-- Dependencies: 219
-- Name: fornecedores_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.fornecedores_id_seq OWNED BY public.fornecedores.id;


--
-- TOC entry 224 (class 1259 OID 16607)
-- Name: itens_venda_id_item_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.itens_venda_id_item_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 226 (class 1259 OID 16610)
-- Name: itens_venda_id_produto_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.itens_venda_id_produto_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 225 (class 1259 OID 16609)
-- Name: itens_venda_produto_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.itens_venda_produto_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 241 (class 1259 OID 18169)
-- Name: movimentacoes_estoque; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.movimentacoes_estoque (
    id integer NOT NULL,
    tipo public.tipo_movimentacao_enum NOT NULL,
    origem public.origem_movimentacao_enum NOT NULL,
    referencia_id integer,
    produto_id integer NOT NULL,
    quantidade integer NOT NULL,
    preco_unitario_liquido numeric(14,2) NOT NULL,
    valor_total_liquido numeric(16,2) GENERATED ALWAYS AS (((quantidade)::numeric * preco_unitario_liquido)) STORED,
    usuario_id integer NOT NULL,
    observacao text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 240 (class 1259 OID 18168)
-- Name: movimentacoes_estoque_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.movimentacoes_estoque ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.movimentacoes_estoque_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 218 (class 1259 OID 16428)
-- Name: produtos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.produtos (
    id integer NOT NULL,
    codigo character varying(11) NOT NULL,
    nome character varying(100) NOT NULL,
    descricao text,
    categoria character varying(50),
    status public.produto_status_enum NOT NULL,
    estoque_minimo integer DEFAULT 0,
    estoque_maximo integer DEFAULT 0,
    data_cadastro timestamp without time zone DEFAULT now(),
    data_atualizacao timestamp without time zone
);


--
-- TOC entry 217 (class 1259 OID 16427)
-- Name: produtos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.produtos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5018 (class 0 OID 0)
-- Dependencies: 217
-- Name: produtos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.produtos_id_seq OWNED BY public.produtos.id;


--
-- TOC entry 230 (class 1259 OID 16641)
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.refresh_tokens (
    id integer NOT NULL,
    user_id integer,
    token text NOT NULL,
    expires_at timestamp without time zone NOT NULL
);


--
-- TOC entry 229 (class 1259 OID 16640)
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.refresh_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5019 (class 0 OID 0)
-- Dependencies: 229
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.refresh_tokens_id_seq OWNED BY public.refresh_tokens.id;


--
-- TOC entry 228 (class 1259 OID 16627)
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(100) NOT NULL,
    password_hash text NOT NULL
);


--
-- TOC entry 227 (class 1259 OID 16626)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5020 (class 0 OID 0)
-- Dependencies: 227
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 233 (class 1259 OID 18033)
-- Name: vendas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vendas (
    id integer NOT NULL,
    cliente_id integer NOT NULL,
    data_emissao date NOT NULL,
    tipo_pagamento public.tipo_pagamento_enum NOT NULL,
    desconto_comercial numeric(14,2) DEFAULT 0 NOT NULL,
    desconto_financeiro numeric(14,2) DEFAULT 0 NOT NULL,
    desconto_volume numeric(14,2) DEFAULT 0 NOT NULL,
    valor_bruto numeric(14,2) DEFAULT 0 NOT NULL,
    valor_total numeric(14,2) GENERATED ALWAYS AS ((((valor_bruto - desconto_volume) - desconto_comercial) - desconto_financeiro)) STORED NOT NULL,
    status public.status_venda_enum NOT NULL,
    data_cadastro timestamp without time zone DEFAULT now() NOT NULL,
    created_by integer NOT NULL,
    data_atualizacao timestamp without time zone DEFAULT now() NOT NULL,
    updated_by integer NOT NULL
);


--
-- TOC entry 232 (class 1259 OID 18032)
-- Name: vendas_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.vendas ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.vendas_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 223 (class 1259 OID 16605)
-- Name: vendas_id_venda_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.vendas_id_venda_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 235 (class 1259 OID 18061)
-- Name: vendas_itens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vendas_itens (
    id integer NOT NULL,
    venda_id integer NOT NULL,
    produto_id integer NOT NULL,
    quantidade integer NOT NULL,
    preco_unitario numeric(12,2) NOT NULL,
    desconto_unitario numeric(12,2) DEFAULT 0 NOT NULL,
    valor_bruto numeric(14,2) GENERATED ALWAYS AS ((preco_unitario * (quantidade)::numeric)) STORED,
    valor_desconto numeric(14,2) GENERATED ALWAYS AS ((desconto_unitario * (quantidade)::numeric)) STORED,
    valor_liquido numeric(14,2) GENERATED ALWAYS AS (((preco_unitario - desconto_unitario) * (quantidade)::numeric)) STORED,
    data_cadastro timestamp without time zone DEFAULT now() NOT NULL,
    created_by integer NOT NULL,
    data_atualizacao timestamp without time zone DEFAULT now() NOT NULL,
    updated_by integer NOT NULL
);


--
-- TOC entry 234 (class 1259 OID 18060)
-- Name: vendas_itens_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.vendas_itens ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.vendas_itens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 4738 (class 2604 OID 16472)
-- Name: clientes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clientes ALTER COLUMN id SET DEFAULT nextval('public.clientes_id_seq'::regclass);


--
-- TOC entry 4774 (class 2604 OID 18590)
-- Name: estoque_ajustes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estoque_ajustes ALTER COLUMN id SET DEFAULT nextval('public.estoque_ajustes_id_seq'::regclass);


--
-- TOC entry 4777 (class 2604 OID 18609)
-- Name: estoque_ajustes_itens id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estoque_ajustes_itens ALTER COLUMN id SET DEFAULT nextval('public.estoque_ajustes_itens_id_seq'::regclass);


--
-- TOC entry 4735 (class 2604 OID 16449)
-- Name: fornecedores id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fornecedores ALTER COLUMN id SET DEFAULT nextval('public.fornecedores_id_seq'::regclass);


--
-- TOC entry 4731 (class 2604 OID 16431)
-- Name: produtos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.produtos ALTER COLUMN id SET DEFAULT nextval('public.produtos_id_seq'::regclass);


--
-- TOC entry 4742 (class 2604 OID 16644)
-- Name: refresh_tokens id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('public.refresh_tokens_id_seq'::regclass);


--
-- TOC entry 4741 (class 2604 OID 16630)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 4985 (class 0 OID 16469)
-- Dependencies: 222
-- Data for Name: clientes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.clientes (id, razao_social, nome_fantasia, cnpj, cpf, inscricao_estadual, telefone, celular, email, rua, numero, complemento, bairro, cidade, uf, cep, status, data_cadastro, data_atualizacao) FROM stdin;
3	Indústria de Plásticos Ltda.	PlasFix	98.765.432/0001-10	\N	987.654.321.098	(31) 4000-5555	(31) 99888-7777	vendas@plasfix.com.br	Rua Industrial	789	Galpão C	Distrito Industrial	Belo Horizonte	MG	30000-000	ativo	2025-05-22 09:12:22.989201	2025-05-22 09:12:22.989201
4	Maria Souza	Maria Souza	\N	555.666.777-88	ISENTO	(41) 3333-4444	NULL	maria.souza@provedor.com	Rua das Flores	10	Casa	Jardim Botânico	Curitiba	PR	80000-000	ativo	2025-05-22 09:12:22.989201	2025-05-22 09:12:22.989201
5	Consultoria de TI Alpha S.A.	Alpha Solutions	44.333.222/0001-50	\N	444.333.222.111	(51) 2000-9999	(51) 99000-1111	info@alphasolutions.com	Avenida da Inovação	200	Andar 5	Tecnopólis	Porto Alegre	RS	90000-000	ativo	2025-05-22 09:12:22.989201	2025-05-22 09:12:22.989201
6	Ana Paula Costa	Ana Paula Costa	\N	111.111.111-11	ISENTO	(11) 9876-5432	(11) 99876-5432	ana.costa@email.com	Rua das Azaleias	55	Casa A	Flores	Osasco	SP	06000-001	ativo	2025-05-22 09:18:18.126456	2025-05-22 09:18:18.126456
7	Comércio de Artesanato Criativo Ltda.	Artesanato & Cia	11.111.111/0001-11	\N	111.111.111.111	(21) 3210-9876	(21) 98765-4321	contato@artesanatocia.com.br	Avenida dos Artistas	100	Sala 1	Boêmia	Niterói	RJ	24000-001	ativo	2025-05-22 09:18:18.126456	2025-05-22 09:18:18.126456
8	Pedro Henrique Oliveira	Pedro Oliveira	\N	222.222.222-22	ISENTO	(31) 2345-6789	(31) 99234-5678	pedro.oliveira@outlook.com	Rua das Montanhas	200	Apto 505	Serra Verde	Contagem	MG	32000-001	ativo	2025-05-22 09:18:18.126456	2025-05-22 09:18:18.126456
9	Distribuidora de Alimentos Sabor Ltda.	Sabor & Cia	22.222.222/0001-22	\N	222.222.222.222	(41) 4567-8901	(41) 99456-7890	vendas@saborcia.com	Travessa do Sabor	30	Galpão 2	Gastronomia	Pinhais	PR	83000-001	ativo	2025-05-22 09:18:18.126456	2025-05-22 09:18:18.126456
10	Juliana Santos	Juliana Santos	\N	333.333.333-33	ISENTO	(51) 8765-4321	(51) 98765-4321	juliana.santos@gmail.com	Rua do Litoral	77	Cobertura	Praia	Capão da Canoa	RS	95000-001	ativo	2025-05-22 09:18:18.126456	2025-05-22 09:18:18.126456
11	Tecnologia Moderna Ltda.	TechInov	33.333.333/0001-33	\N	333.333.333.333	(61) 5678-1234	(61) 99567-8123	contato@techinov.com.br	Avenida da Tecnologia	400	Torre B	Digital	Brasília	DF	70000-001	ativo	2025-05-22 09:18:18.126456	2025-05-22 09:18:18.126456
12	Felipe Guedes	Felipe Guedes	\N	444.444.444-44	ISENTO	(71) 1234-5678	(71) 98123-4567	felipe.guedes@hotmail.com	Rua do Sol	210	Apto 301	Oceano	Salvador	BA	40000-001	ativo	2025-05-22 09:18:18.126456	2025-05-22 09:18:18.126456
36	Thiago Costa	Thiago Costa	\N	121.212.121-21	ISENTO	(41) 9012-3456	(41) 98901-2345	thiago.costa@email.com	Rua da Paz	60	Apto 10B	Tranquilidade	Maringá	PR	87000-001	ativo	2025-05-22 09:18:18.126456	2025-05-22 09:18:18.126456
13	Moda Fashionista S.A.	Fashion Trend	44.444.444/0001-44	\N	444.444.444.444	(81) 6789-0123	(81) 99678-9012	fashion@fashiontrend.com	Rua das Grifes	150	Loja Principal	Estilo	Recife	PE	50000-001	ativo	2025-05-22 09:18:18.126456	2025-05-22 09:18:18.126456
14	Carla Regina Lima	Carla Lima	\N	555.555.555-55	ISENTO	(91) 9012-3456	(91) 98901-2345	carla.lima@email.com	Travessa da Floresta	12	Casa B	Amazônia	Belém	PA	66000-001	ativo	2025-05-22 09:18:18.126456	2025-05-22 09:18:18.126456
15	Comércio de Livros Sabedoria Ltda.	Livraria do Saber	55.555.555/0001-55	\N	555.555.555.555	(11) 2345-6789	(11) 99234-5678	contato@livrariadosaber.com.br	Rua da Leitura	50	Fundos	Cultural	Campinas	SP	13000-001	ativo	2025-05-22 09:18:18.126456	2025-05-22 09:18:18.126456
16	Marcos Vinicius Santos	Marcos Santos	\N	666.666.666-66	ISENTO	(21) 7890-1234	(21) 99789-0123	marcos.santos@email.com	Rua do Mar	100	Apto 202	Orla	Rio de Janeiro	RJ	20000-002	ativo	2025-05-22 09:18:18.126456	2025-05-22 09:18:18.126456
17	Agropecuária Terra Fértil Ltda.	Terra & Campo	66.666.666/0001-66	\N	666.666.666.666	(31) 3456-7890	(31) 99345-6789	info@terraecampo.com.br	Estrada Rural	900	Fazenda	Zona Rural	Uberlândia	MG	38000-001	ativo	2025-05-22 09:18:18.126456	2025-05-22 09:18:18.126456
18	Gabriela Ferreira	Gabriela Ferreira	\N	777.777.777-77	ISENTO	(41) 9012-3456	(41) 98901-2345	gabriela.ferreira@email.com	Avenida das Árvores	300	Casa C	Bosque	São José dos Pinhais	PR	83000-002	ativo	2025-05-22 09:18:18.126456	2025-05-22 09:18:18.126456
19	Construções Residenciais Ltda.	Concreto Forte	77.777.777/0001-77	\N	777.777.777.777	(51) 1234-5678	(51) 99123-4567	contato@concretoforte.com	Rua da Obra	45	Canteiro 1	Construção	Canoas	RS	92000-001	ativo	2025-05-22 09:18:18.126456	2025-05-22 09:18:18.126456
20	Ricardo Almeida	Ricardo Almeida	\N	888.888.888-88	ISENTO	(61) 5678-9012	(61) 99567-8901	ricardo.almeida@email.com	Quadra Comercial	10	Sala 3	Comercial	Taguatinga	DF	72000-001	ativo	2025-05-22 09:18:18.126456	2025-05-22 09:18:18.126456
21	Serviços de Limpeza Express Ltda.	Limpeza Rápida	88.888.888/0001-88	\N	888.888.888.888	(71) 2345-6789	(71) 99234-5678	limpeza@limpezarapida.com.br	Rua da Higiene	80	Escritório	Higiene	Feira de Santana	BA	44000-001	ativo	2025-05-22 09:18:18.126456	2025-05-22 09:18:18.126456
22	Sofia Pereira	Sofia Pereira	\N	999.999.999-99	ISENTO	(81) 3456-7890	(81) 99345-6789	sofia.pereira@email.com	Avenida da Praia	123	Apto 10	Beira Mar	Olinda	PE	53000-001	ativo	2025-05-22 09:18:18.126456	2025-05-22 09:18:18.126456
23	Padaria Pão Fresco Ltda.	Pão Quentinho	99.999.999/0001-99	\N	999.999.999.999	(91) 4567-8901	(91) 99456-7890	padaria@paoquentinho.com.br	Rua do Padeiro	20	Frente	Gastronomia	Ananindeua	PA	67000-001	ativo	2025-05-22 09:18:18.126456	2025-05-22 09:18:18.126456
24	Lucas Martins	Lucas Martins	\N	123.456.789-00	ISENTO	(11) 5678-1234	(11) 99567-8123	lucas.martins@email.com	Rua do Campo	99	Sítio	Rural	Jundiaí	SP	13200-001	ativo	2025-05-22 09:18:18.126456	2025-05-22 09:18:18.126456
25	Empresa de Logística Rápida Ltda.	Logística Ágil	10.000.000/0001-00	\N	100.000.000.000	(21) 8901-2345	(21) 99890-1234	contato@logisticaagil.com	Avenida do Transporte	500	Galpão 3	Logística	Duque de Caxias	RJ	25000-001	ativo	2025-05-22 09:18:18.126456	2025-05-22 09:18:18.126456
26	Fernanda Rocha	Fernanda Rocha	\N	000.111.222-33	ISENTO	(31) 6789-0123	(31) 99678-9012	fernanda.rocha@email.com	Rua do Jardim	15	Casa D	Jardim	Ribeirão das Neves	MG	33000-001	ativo	2025-05-22 09:18:18.126456	2025-05-22 09:18:18.126456
27	Loja de Brinquedos Felizes Ltda.	Brinquedos Mágicos	01.111.222/0001-33	\N	011.111.222.333	(41) 1234-5678	(41) 99123-4567	brinquedos@brinquedosmagicos.com	Rua da Criança	120	Loja B	Infantil	Londrina	PR	86000-001	ativo	2025-05-22 09:18:18.126456	2025-05-22 09:18:18.126456
28	Gustavo Nogueira	Gustavo Nogueira	\N	333.222.111-00	ISENTO	(51) 5678-9012	(51) 99567-8901	gustavo.nogueira@email.com	Rua da Lagoa	250	Chácara	Rural	Viamão	RS	94000-001	ativo	2025-05-22 09:18:18.126456	2025-05-22 09:18:18.126456
29	Editora de Livros Culturais Ltda.	Cultura em Papel	02.222.333/0001-44	\N	022.222.333.444	(61) 2345-6789	(61) 99234-5678	editora@culturaempapel.com	Rua da Imprensa	60	Bloco A	Gráfica	Gama	DF	72400-001	ativo	2025-05-22 09:18:18.126456	2025-05-22 09:18:18.126456
30	Heloísa Dantas	Heloísa Dantas	\N	000.999.888-77	ISENTO	(71) 3456-7890	(71) 99345-6789	heloisa.dantas@email.com	Rua do Coqueiro	180	Casa E	Praiano	Camaçari	BA	42800-001	ativo	2025-05-22 09:18:18.126456	2025-05-22 09:18:18.126456
31	Distribuidora de Bebidas Geladas Ltda.	Gela Brasil	03.333.444/0001-55	\N	033.333.444.555	(81) 4567-8901	(81) 99456-7890	vendas@gelabrasil.com.br	Avenida da Refrigeração	70	Depósito	Bebidas	Jaboatão dos Guararapes	PE	54000-001	ativo	2025-05-22 09:18:18.126456	2025-05-22 09:18:18.126456
32	Vinicius Silva	Vinicius Silva	\N	777.888.999-00	ISENTO	(91) 5678-1234	(91) 99567-8123	vinicius.silva@email.com	Travessa do Artesanato	35	Studio	Criativo	Macapá	AP	68900-001	ativo	2025-05-22 09:18:18.126456	2025-05-22 09:18:18.126456
2	TESTE	1234	12.345.678/0001-50	111.222.333-44	123.456.789.012	(11) 3000-1111	(11) 99111-2222	teste@gmail.com.br	Rua das Palmeiras	123	Loja 1	Centro	São Paulo	SP	01000-000	ativo	2025-05-22 09:12:22.989201	2025-05-22 09:12:22.989201
33	Gráfica Rápida Qualidade Ltda.	Impressão Certa	04.444.555/0001-66	\N	044.444.555.666	(11) 6789-0123	(11) 99678-9012	contato@impressaocerta.com	Rua da Gráfica	220	Galpão 4	Gráfica	São Bernardo do Campo	SP	09700-001	ativo	2025-05-22 09:18:18.126456	2025-05-22 09:18:18.126456
35	Restaurante Sabor Caseiro Ltda.	Tempero da Vovó	05.555.666/0001-77	\N	055.555.666.777	(31) 8901-2345	(31) 99890-1234	contato@temperodavovo.com.br	Avenida Gastronômica	40	Salão Principal	Culinária	Betim	MG	32600-001	ativo	2025-05-22 09:18:18.126456	2025-05-22 09:18:18.126456
37	Agência de Viagens Destinos Ltda.	Viagem Certa	06.666.777/0001-88	\N	066.666.777.888	(51) 1234-5678	(51) 99123-4567	vendas@viagemcerta.com	Rua do Turismo	88	Agência	Turismo	Santa Maria	RS	97000-001	ativo	2025-05-22 09:18:18.126456	2025-05-22 09:18:18.126456
38	Clara Mendes	Clara Mendes	\N	343.434.343-43	ISENTO	(61) 5678-9012	(61) 99567-8901	clara.mendes@email.com	Setor Habitacional	50	Casa F	Residencial	Valparaíso de Goiás	GO	76000-001	ativo	2025-05-22 09:18:18.126456	2025-05-22 09:18:18.126456
39	Loja de Calçados Conforto Ltda.	Pés Leves	07.777.888/0001-99	\N	077.777.888.999	(71) 2345-6789	(71) 99234-5678	contato@pesleves.com.br	Rua dos Calçados	110	Loja D	Moda	Vitória da Conquista	BA	45000-001	ativo	2025-05-22 09:18:18.126456	2025-05-22 09:18:18.126456
40	Arthur Fonseca	Arthur Fonseca	\N	565.656.565-65	ISENTO	(81) 3456-7890	(81) 99345-6789	arthur.fonseca@email.com	Avenida do Bosque	170	Apto 50	Natureza	Petrolina	PE	56300-001	ativo	2025-05-22 09:18:18.126456	2025-05-22 09:18:18.126456
41	Empresa de Seguros Tranquilidade Ltda.	Seguro Total	08.888.999/0001-00	\N	088.888.999.000	(91) 4567-8901	(91) 99456-7890	seguros@segurototal.com	Rua da Proteção	25	Escritório Principal	Seguros	Santarém	PA	68000-001	ativo	2025-05-22 09:18:18.126456	2025-05-22 09:18:18.126456
42	Laura Mendes	Laura Mendes	\N	787.878.787-87	ISENTO	(11) 5678-1234	(11) 99567-8123	laura.mendes@email.com	Rua das Palmeiras	33	Casa G	Jardim	Sorocaba	SP	18000-001	ativo	2025-05-22 09:18:18.126456	2025-05-22 09:18:18.126456
43	Indústria de Embalagens Sustentáveis Ltda.	Eco Pack	09.999.000/0001-11	\N	099.999.000.111	(21) 8901-2345	(21) 99890-1234	vendas@ecopack.com.br	Estrada Ecológica	400	Galpão 5	Sustentabilidade	Nova Iguaçu	RJ	26000-001	ativo	2025-05-22 09:18:18.126456	2025-05-22 09:18:18.126456
44	Miguel Santos	Miguel Santos	\N	909.090.909-09	ISENTO	(31) 6789-0123	(31) 99678-9012	miguel.santos@email.com	Rua da Colina	160	Apto 606	Alto	Governador Valadares	MG	35000-001	ativo	2025-05-22 09:18:18.126456	2025-05-22 09:18:18.126456
45	Empresa de Treinamentos Corporativos Ltda.	Conhecimento Total	11.000.111/0001-22	\N	110.000.111.222	(41) 1234-5678	(41) 99123-4567	cursos@conhecimentototal.com	Avenida do Saber	210	Andar 8	Educação	São José dos Campos	SP	12200-001	ativo	2025-05-22 09:18:18.126456	2025-05-22 09:18:18.126456
47	Clínica Médica Bem Estar Ltda.	Saúde Plena	12.121.212/0001-33	\N	121.212.212.333	(61) 2345-6789	(61) 99234-5678	contato@saudeplena.com	Avenida da Saúde	300	Consultório 1	Saúde	Ceilândia	DF	72200-001	ativo	2025-05-22 09:18:18.126456	2025-05-22 09:18:18.126456
48	Rafael Sampaio	Rafael Sampaio	\N	202.202.202-20	ISENTO	(71) 3456-7890	(71) 99345-6789	rafael.sampaio@email.com	Rua das Palmeiras	190	Casa I	Verde	Lauro de Freitas	BA	42700-001	ativo	2025-05-22 09:18:18.126456	2025-05-22 09:18:18.126456
49	Auto Peças Velocidade Ltda.	Peças & Cia	13.131.313/0001-44	\N	131.313.313.444	(81) 4567-8901	(81) 99456-7890	vendas@pecasecia.com.br	Avenida do Carro	90	Loja E	Automotivo	Caruaru	PE	55000-001	ativo	2025-05-22 09:18:18.126456	2025-05-22 09:18:18.126456
53	Armarinhos & Tecidos Finos Ltda.	Fio de Ouro	15.151.515/0001-66	\N	151.515.515.666	(31) 8901-2345	(31) 99890-1234	vendas@fiodeouro.com.br	Rua da Costura	50	Loja G	Artesanato	Juiz de Fora	MG	36000-001	ativo	2025-05-22 09:18:18.126456	2025-05-22 09:18:18.126456
55	Distribuidora de Produtos Naturais Ltda.	Vita Natural	16.161.616/0001-77	\N	161.616.616.777	(51) 1234-5678	(51) 99123-4567	contato@vitanatural.com	Rua Orgânica	10	Depósito	Saúde	Pelotas	RS	96000-001	ativo	2025-05-22 09:18:18.126456	2025-05-22 09:18:18.126456
52	Diego Farias	Diego Farias	51.951.998/1998-19	\N		(21) 7890-1234	(21) 99789-0123	diego.farias@email.com	Avenida da Paz	150	Apto 808	Sossegado	Volta Redonda	RJ		ativo	2025-05-22 00:00:00	2025-05-22 00:00:00
50	Camila Oliveira	Camila Oliveira	23.131.321/1651-65	\N		(91) 5678-1234	(91) 99567-8123	camila.oliveira@email.com	Travessa do Artesanato	45	Atelier	Criatividade	Castanhal	PA		ativo	2025-05-22 00:00:00	2025-05-22 00:00:00
61	Teste Cia LTDA	Teste	16.516.516/6165-16	\N	11651561651651	(51) 3378-97899	(51) 9895-20039	teste.frontend@gmail.com	Teste	434	Teste	Teste	tTES	AM	94950110	inativo	2025-08-27 00:00:00	2025-08-27 00:00:00
56	Silva Comércio de Eletrônicos Ltda.	EletroSilva	12.345.678/0001-90	\N		(11) 3000-1111	(11) 99111-2222	contato@eletrosilva.com.br	Rua das Palmeiras P	123	Loja 1	Centro	São Paulo	SP		ativo	2025-05-22 03:00:00	2025-05-22 03:00:00
\.


--
-- TOC entry 5000 (class 0 OID 18089)
-- Dependencies: 237
-- Data for Name: compras; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.compras (id, fornecedor_id, data_emissao, tipo_pagamento, desconto_comercial, desconto_financeiro, desconto_volume, valor_bruto, status, data_cadastro, created_by, data_atualizacao, updated_by) FROM stdin;
7	255	2025-12-02	pix	20.00	10.00	500.00	7500.00	finalizado	2025-11-23 12:46:03.962331	5	2025-11-23 12:46:03.962331	5
9	253	2025-12-05	pix	0.00	0.00	549.50	14999.50	finalizado	2025-12-05 17:18:36.002071	3	2025-12-05 17:18:36.002071	3
10	211	2025-12-05	transferencia	10.00	10.00	298.50	19498.50	finalizado	2025-12-05 17:22:14.116144	3	2025-12-05 17:22:14.116144	3
12	211	2025-12-05	boleto	10.00	10.00	0.00	9999.00	finalizado	2025-12-05 17:23:25.888789	3	2025-12-05 17:23:25.888789	3
11	211	2025-12-05	pix	10.00	10.00	199.00	5999.00	finalizado	2025-12-05 17:22:51.06542	3	2025-12-05 17:22:51.06542	3
13	153	2025-12-05	pix	0.00	0.00	0.00	4485.00	finalizado	2025-12-05 17:24:15.70534	3	2025-12-05 17:24:15.70534	3
14	247	2025-12-05	transferencia	10.00	10.00	298.50	7498.50	finalizado	2025-12-05 17:25:06.619613	3	2025-12-05 17:25:06.619613	3
15	211	2025-12-05	pix	0.00	0.00	99.50	2995.00	aguardando	2025-12-05 17:25:38.619492	3	2025-12-05 17:25:38.619492	3
16	253	2025-12-05	pix	10.00	10.00	135.00	8985.00	finalizado	2025-12-05 17:26:04.440579	3	2025-12-05 17:26:04.440579	3
17	255	2025-12-05	cartao	0.00	0.00	148.50	19498.50	aguardando	2025-12-05 17:26:51.177617	3	2025-12-05 17:26:51.177617	3
18	253	2025-12-05	pix	10.00	10.00	39.80	11398.30	finalizado	2025-12-05 17:27:25.849931	3	2025-12-05 17:27:25.849931	3
19	247	2025-12-05	pix	20.00	20.00	0.00	4999.00	finalizado	2025-12-05 17:28:29.482256	3	2025-12-05 17:28:29.482256	3
20	247	2025-12-05	pix	0.00	100.00	199.00	5999.00	finalizado	2025-12-05 17:29:00.097857	3	2025-12-05 17:29:00.097857	3
21	255	2025-12-05	cartao	200.00	0.00	258.00	19998.00	finalizado	2025-12-05 17:30:00.337258	3	2025-12-05 17:30:00.337258	3
22	252	2025-12-05	boleto	50.00	0.00	0.00	5998.50	finalizado	2025-12-05 17:30:36.865219	3	2025-12-05 17:30:36.865219	3
23	252	2025-12-05	pix	0.00	0.00	398.00	7998.00	finalizado	2025-12-05 17:31:00.080998	3	2025-12-05 17:31:00.080998	3
24	208	2025-12-05	transferencia	10.00	10.00	298.50	7498.50	finalizado	2025-12-05 17:32:17.553701	3	2025-12-05 17:32:17.553701	3
25	208	2025-12-05	cartao	20.00	210.00	0.00	13179.00	aguardando	2025-12-05 17:32:52.01051	3	2025-12-05 17:32:52.01051	3
26	150	2025-12-05	pix	10.00	10.00	224.00	12498.00	finalizado	2025-12-05 17:33:22.3532	3	2025-12-05 17:33:22.3532	3
27	253	2025-12-05	boleto	10.00	10.00	180.00	5980.00	finalizado	2025-12-05 19:12:45.294366	3	2025-12-05 19:12:45.294366	3
28	208	2026-01-20	pix	10.00	10.00	0.00	9999.00	aguardando	2026-01-20 08:39:01.634276	3	2026-01-20 08:39:01.634276	3
29	196	2026-01-20	cartao	50.00	10.00	120.00	9990.00	finalizado	2026-01-20 08:39:35.23374	3	2026-01-20 08:39:35.23374	3
30	150	2026-01-20	pix	20.00	10.00	180.00	14998.50	aberto	2026-01-20 08:40:20.113076	3	2026-01-20 08:40:20.113076	3
31	184	2026-01-20	transferencia	0.00	0.00	120.00	9990.00	aguardando	2026-01-20 08:40:46.786283	3	2026-01-20 08:40:46.786283	3
32	224	2026-01-20	pix	0.00	0.00	0.00	9990.00	finalizado	2026-01-20 08:41:55.345423	3	2026-01-20 08:41:55.345423	3
33	253	2026-01-20	pix	10.00	10.00	150.00	5050.00	finalizado	2026-01-20 08:46:35.735947	3	2026-01-20 08:46:35.735947	3
34	179	2026-01-20	transferencia	10.00	10.00	190.00	9990.00	finalizado	2026-01-20 08:47:07.697565	3	2026-01-20 08:47:07.697565	3
35	225	2026-01-20	pix	10.00	10.00	300.00	19980.00	finalizado	2026-01-20 08:47:50.505458	3	2026-01-20 08:47:50.505458	3
8	255	2025-12-02	pix	20.00	30.00	500.00	5000.00	aberto	2025-11-23 13:53:03.174364	1	2025-11-23 13:53:03.174364	1
\.


--
-- TOC entry 5002 (class 0 OID 18117)
-- Dependencies: 239
-- Data for Name: compras_itens; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.compras_itens (id, compra_id, produto_id, quantidade, preco_unitario, desconto_unitario, data_cadastro, created_by, data_atualizacao, updated_by) FROM stdin;
36	8	2	500	10.00	1.00	2025-12-02 00:42:57.366065	3	2025-12-02 00:42:57.366065	3
37	7	2	500	10.00	1.00	2025-12-02 00:49:14.301226	3	2025-12-02 00:49:14.301226	3
38	7	3	500	5.00	0.00	2025-12-02 00:49:14.301226	3	2025-12-02 00:49:14.301226	3
39	9	6	50	299.99	10.99	2025-12-05 17:18:36.002071	3	2025-12-05 17:18:36.002071	3
40	10	4	150	129.99	1.99	2025-12-05 17:22:14.116144	3	2025-12-05 17:22:14.116144	3
42	12	3	100	99.99	0.00	2025-12-05 17:23:25.888789	3	2025-12-05 17:23:25.888789	3
43	11	2	100	59.99	1.99	2025-12-05 17:23:35.327448	3	2025-12-05 17:23:35.327448	3
44	13	7	150	29.90	0.00	2025-12-05 17:24:15.70534	3	2025-12-05 17:24:15.70534	3
45	14	51	150	49.99	1.99	2025-12-05 17:25:06.619613	3	2025-12-05 17:25:06.619613	3
46	15	2	50	59.90	1.99	2025-12-05 17:25:38.619492	3	2025-12-05 17:25:38.619492	3
47	16	2	150	59.90	0.90	2025-12-05 17:26:04.440579	3	2025-12-05 17:26:04.440579	3
48	17	3	150	129.99	0.99	2025-12-05 17:26:51.177617	3	2025-12-05 17:26:51.177617	3
49	18	2	150	59.99	0.00	2025-12-05 17:27:25.849931	3	2025-12-05 17:27:25.849931	3
50	18	3	20	119.99	1.99	2025-12-05 17:27:25.849931	3	2025-12-05 17:27:25.849931	3
51	19	7	100	49.99	0.00	2025-12-05 17:28:29.482256	3	2025-12-05 17:28:29.482256	3
52	20	35	100	59.99	1.99	2025-12-05 17:29:00.097857	3	2025-12-05 17:29:00.097857	3
53	21	26	200	99.99	1.29	2025-12-05 17:30:00.337258	3	2025-12-05 17:30:00.337258	3
54	22	42	150	39.99	0.00	2025-12-05 17:30:36.865219	3	2025-12-05 17:30:36.865219	3
55	23	43	200	39.99	1.99	2025-12-05 17:31:00.080998	3	2025-12-05 17:31:00.080998	3
56	24	51	150	49.99	1.99	2025-12-05 17:32:17.553701	3	2025-12-05 17:32:17.553701	3
57	25	26	100	99.99	0.00	2025-12-05 17:32:52.01051	3	2025-12-05 17:32:52.01051	3
58	25	10	20	159.00	0.00	2025-12-05 17:32:52.01051	3	2025-12-05 17:32:52.01051	3
59	26	2	100	29.98	0.95	2025-12-05 17:33:22.3532	3	2025-12-05 17:33:22.3532	3
60	26	26	100	95.00	1.29	2025-12-05 17:33:22.3532	3	2025-12-05 17:33:22.3532	3
61	27	7	200	29.90	0.90	2025-12-05 19:12:45.294366	3	2025-12-05 19:12:45.294366	3
62	28	29	100	99.99	0.00	2026-01-20 08:39:01.634276	3	2026-01-20 08:39:01.634276	3
63	29	3	100	99.90	1.20	2026-01-20 08:39:35.23374	3	2026-01-20 08:39:35.23374	3
64	30	3	150	99.99	1.20	2026-01-20 08:40:20.113076	3	2026-01-20 08:40:20.113076	3
65	31	2	100	99.90	1.20	2026-01-20 08:40:46.786283	3	2026-01-20 08:40:46.786283	3
66	32	4	100	99.90	0.00	2026-01-20 08:41:55.345423	3	2026-01-20 08:41:55.345423	3
67	33	4	100	50.50	1.50	2026-01-20 08:46:35.735947	3	2026-01-20 08:46:35.735947	3
68	34	4	100	99.90	1.90	2026-01-20 08:47:07.697565	3	2026-01-20 08:47:07.697565	3
69	35	4	200	99.90	1.50	2026-01-20 08:47:50.505458	3	2026-01-20 08:47:50.505458	3
\.


--
-- TOC entry 5006 (class 0 OID 18587)
-- Dependencies: 243
-- Data for Name: estoque_ajustes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.estoque_ajustes (id, tipo, motivo, valor_total, observacao, data_ajuste, data_cadastro, created_by) FROM stdin;
1	entrada	teste via postman	2345.00	Correção pós-inventário	2025-12-01	2025-12-01 22:03:58.565794	5
2	entrada	teste	550.00	aaa	2025-12-02	2025-12-01 22:40:33.027559	3
3	entrada	Teste	555.00	teste	2025-12-02	2025-12-01 22:43:21.409314	3
4	entrada	Teste	550.00	teste	2025-12-02	2025-12-01 22:45:09.713304	3
5	entrada	teste	0.00		2025-12-02	2025-12-01 22:46:48.528047	3
6	entrada	teste	0.00	teste	2025-12-02	2025-12-01 22:47:20.401223	3
7	entrada	Teste	500.00	teste	2025-12-02	2025-12-01 22:49:18.986083	3
8	entrada	teste	0.00	teste	2025-12-02	2025-12-01 22:50:08.076374	3
9	entrada	teste	0.00	teste	2025-12-02	2025-12-01 22:57:30.097342	3
\.


--
-- TOC entry 5008 (class 0 OID 18606)
-- Dependencies: 245
-- Data for Name: estoque_ajustes_itens; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.estoque_ajustes_itens (id, ajuste_id, produto_id, quantidade, preco_unitario, data_cadastro, created_by) FROM stdin;
1	1	2	100.00	12.50	2025-12-01 22:03:58.565794	5
2	1	3	150.00	7.30	2025-12-01 22:03:58.565794	5
3	2	2	100.00	5.50	2025-12-01 22:40:33.027559	3
4	3	2	100.00	5.55	2025-12-01 22:43:21.409314	3
5	4	2	100.00	5.50	2025-12-01 22:45:09.713304	3
6	5	2	100.00	0.00	2025-12-01 22:46:48.528047	3
7	6	2	1.00	0.00	2025-12-01 22:47:20.401223	3
8	7	2	100.00	5.00	2025-12-01 22:49:18.986083	3
9	8	2	1.00	0.00	2025-12-01 22:50:08.076374	3
10	9	2	100.00	0.00	2025-12-01 22:57:30.097342	3
\.


--
-- TOC entry 4994 (class 0 OID 16865)
-- Dependencies: 231
-- Data for Name: estoque_saldo; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.estoque_saldo (produto_id, quantidade, preco_medio_compra, preco_medio_venda) FROM stdin;
4	425	0.00	0.00
7	450	0.00	0.00
43	100	0.00	0.00
2	42	0.00	0.00
42	150	0.00	0.00
26	150	0.00	0.00
35	0	0.00	0.00
51	80	0.00	0.00
6	40	0.00	0.00
3	195	0.00	0.00
5	0	0.00	0.00
70	0	0.00	0.00
8	0	0.00	0.00
9	0	0.00	0.00
11	0	0.00	0.00
13	0	0.00	0.00
15	0	0.00	0.00
16	0	0.00	0.00
17	0	0.00	0.00
19	0	0.00	0.00
20	0	0.00	0.00
21	0	0.00	0.00
22	0	0.00	0.00
23	0	0.00	0.00
29	0	0.00	0.00
30	0	0.00	0.00
31	0	0.00	0.00
32	0	0.00	0.00
33	0	0.00	0.00
34	0	0.00	0.00
10	0	0.00	0.00
39	0	0.00	0.00
40	0	0.00	0.00
41	0	0.00	0.00
46	0	0.00	0.00
52	0	0.00	0.00
63	0	0.00	0.00
64	0	0.00	0.00
18	0	0.00	0.00
14	0	0.00	0.00
12	0	0.00	0.00
25	0	0.00	0.00
50	0	0.00	0.00
\.


--
-- TOC entry 4983 (class 0 OID 16446)
-- Dependencies: 220
-- Data for Name: fornecedores; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.fornecedores (id, razao_social, nome_fantasia, cnpj, inscricao_estadual, telefone, celular, rua, numero, complemento, bairro, cidade, uf, cep, status, data_cadastro, data_atualizacao, email) FROM stdin;
220	Panificadora e Confeitaria Sabor Divino LTDA	Doce Sabor	33.445.566/0001-13	334455667	(41) 4444-5555	(41) 96666-5555	Rua do Fermento	75		Centro Gastronômico	São José dos Pinhais	PR		inativo	2025-05-21 00:00:00	2025-12-02 01:10:44.433749	pedidos@docesabor.com.br
162	Indústria de Vidros Transparente S.A.	Vidro Cristal	45.678.901/0001-88	765432109	(61) 9012-3456	(61) 95678-9012	Rua do Vidro	130	\N	Parque Industrial	Gama	DF	72000-000	ativo	2025-05-21 20:25:55.278403	2025-12-02 01:07:40.864338	contato@vidrocristal.com.br
163	Metalúrgica Forte LTDA	Ferro Forte	10.987.654/0001-66	432109876	(71) 0123-4567	(71) 96789-0123	Estrada da Forja	200	Setor A	Bairro Metalúrgico	Camaçari	BA	42000-000	ativo	2025-05-21 20:25:55.278403	2025-12-02 01:07:40.864338	metalurgica@ferroforte.com.br
164	Produtos Agropecuários Colheita Farta LTDA	Campo Rico	32.109.876/0001-44	210987654	(81) 4567-8901	(81) 97890-1234	Rodovia do Produtor	30	\N	Zona Rural	Jaboatão dos Guararapes	PE	54000-000	ativo	2025-05-21 20:25:55.278403	2025-12-02 01:07:40.864338	agro@camporico.com.br
165	Equipamentos para Escritório Prático LTDA	Mesa & Cia	67.890.123/0001-33	876543210	(91) 9012-3456	(91) 98901-2345	Rua do Escritório	95	Conjunto 20	Comercial	Ananindeua	PA	67000-000	ativo	2025-05-21 20:25:55.278403	2025-12-02 01:07:40.864338	escritorio@mesaecia.com.br
166	Comércio de Pneus Rodoviário S.A.	Pneu Bom	01.234.567/0001-21	654321098	(11) 3456-7890	(11) 91234-5678	Avenida dos Rodas	160	Box 7	Vila Mecânica	São Paulo	SP	03000-000	ativo	2025-05-21 20:25:55.278403	2025-12-02 01:07:40.864338	pneus@pneubom.com.br
167	Pet Shop Amigo Animal LTDA	Meu Melhor Amigo	54.321.098/0001-09	321098765	(21) 2345-6789	(21) 98765-4321	Rua dos Bichos	40	\N	Jardim Zoológico	Niterói	RJ	24000-000	ativo	2025-05-21 20:25:55.278403	2025-12-02 01:07:40.864338	petshop@meumelhoramigo.com.br
168	Laticínios Pura Vida S.A.	Vaca Feliz	87.654.321/0001-90	109876543	(31) 5678-9012	(31) 92345-6789	Estrada do Leite	20	\N	Zona Rural	Sete Lagoas	MG	35000-000	ativo	2025-05-21 20:25:55.278403	2025-12-02 01:07:40.864338	laticinios@puravida.com.br
169	Ferramentas Profissionais LTDA	Mão na Obra	23.456.789/0001-80	543210987	(41) 7890-1234	(41) 93456-7890	Rua da Chave	75	Loja Principal	Bairro do Trabalho	Londrina	PR	86000-000	ativo	2025-05-21 20:25:55.278403	2025-12-02 01:07:40.864338	vendas@ferramentasmaonaobra.com.br
170	Produtos Químicos Seguros LTDA	Química Verde	78.901.234/0001-70	987654321	(51) 1234-5678	(51) 94567-8901	Avenida da Fórmula	190	Laboratório 2	Polo Químico	Gravataí	RS	94000-000	ativo	2025-05-21 20:25:55.278403	2025-12-02 01:07:40.864338	contato@quimicaverde.com.br
171	Comércio de Madeiras Reflorestamento S.A.	Madeira Sustentável	09.876.543/0001-60	123456789	(61) 8901-2345	(61) 95678-9012	Estrada da Floresta	140	Serralheria	Parque Florestal	Taguatinga	DF	72100-000	ativo	2025-05-21 20:25:55.278403	2025-12-02 01:07:40.864338	madeira@madeirasustentavel.com.br
172	Climatizadores de Ar Conforto LTDA	Ar Puro	12.345.678/0001-50	098765432	(71) 0123-4567	(71) 96789-0123	Rua do Vento	55	\N	Centro Técnico	Feira de Santana	BA	44000-000	ativo	2025-05-21 20:25:55.278403	2025-12-02 01:07:40.864338	arcondicionado@arpuro.com.br
173	Utensílios Domésticos Praticidade LTDA	Casa Completa	98.765.432/0001-40	765432109	(81) 4567-8901	(81) 97890-1234	Avenida do Lar	100	Ala 1	Bairro Residencial	Olinda	PE	53000-000	ativo	2025-05-21 20:25:55.278403	2025-12-02 01:07:40.864338	utensilios@casacompleta.com.br
174	Equipamentos de Segurança Proteção LTDA	Seguro Sempre	45.678.901/0001-30	432109876	(91) 9012-3456	(91) 98901-2345	Rua do Escudo	85	Loja 1	Zona Protegida	Macapá	AP	68000-000	ativo	2025-05-21 20:25:55.278403	2025-12-02 01:07:40.864338	seguranca@segurosempre.com.br
175	Joalheria Brilhante LTDA	Pedra Preciosa	10.987.654/0001-20	210987654	(11) 2109-8765	(11) 90123-4567	Rua do Diamante	35	Sala 8	Centro Antigo	São Paulo	SP	01000-000	ativo	2025-05-21 20:25:55.278403	2025-12-02 01:07:40.864338	joias@pedrapreciosa.com.br
176	Papelaria Criativa S.A.	Ideia Certa	32.109.876/0001-10	876543210	(21) 3456-7890	(21) 91234-5678	Rua do Caderno	170	\N	Vila do Saber	Petrópolis	RJ	25600-000	ativo	2025-05-21 20:25:55.278403	2025-12-02 01:07:40.864338	papelaria@ideiacerta.com.br
177	Tintas e Solventes Cores Vivas LTDA	Paleta Colorida	67.890.123/0001-00	654321098	(31) 6789-0123	(31) 92345-6789	Avenida da Cor	90	Depósito 3	Bairro do Pintor	Uberlândia	MG	38000-000	ativo	2025-05-21 20:25:55.278403	2025-12-02 01:07:40.864338	tintas@paletacolorida.com.br
178	Autopeças Velocidade S.A.	Roda Livre	01.234.567/0001-90	321098765	(41) 8901-2345	(41) 93456-7890	Rua do Motor	115	\N	Oficina	Colombo	PR	83400-000	ativo	2025-05-21 20:25:55.278403	2025-12-02 01:07:40.864338	pecas@rodalivre.com.br
179	Comércio de Gás Energia Pura LTDA	Chama Azul	54.321.098/0001-80	109876543	(51) 2345-6789	(51) 94567-8901	Estrada do Gás	210	Tanque 1	Polo de Energia	Viamão	RS	94400-000	ativo	2025-05-21 20:25:55.278403	2025-12-02 01:07:40.864338	gas@chamaazul.com.br
180	Padaria Pão Fresquinho LTDA	Sabor do Dia	87.654.321/0001-70	543210987	(61) 9012-3456	(61) 95678-9012	Rua do Trigo	45	\N	Centro Alimentar	Ceilândia	DF	72200-000	ativo	2025-05-21 20:25:55.278403	2025-12-02 01:07:40.864338	padaria@paofresquinho.com.br
181	Calçados Conforto e Estilo LTDA	Passo Certo	23.456.789/0001-60	987654321	(71) 0123-4567	(71) 96789-0123	Avenida do Sapato	135	Vitrine 4	Moda Pé	Vitória da Conquista	BA	45000-000	ativo	2025-05-21 20:25:55.278403	2025-12-02 01:07:40.864338	calcados@passocerto.com.br
182	Carnes Nobres do Sul LTDA	Churrasco Bom	78.901.234/0001-50	123456789	(81) 4567-8901	(81) 97890-1234	Rodovia da Carne	65	Frigorífico	Açougue Grande	Caruaru	PE	55000-000	ativo	2025-05-21 20:25:55.278403	2025-12-02 01:07:40.864338	carnes@churrascobom.com.br
183	Comércio de Cereais Grãos de Ouro LTDA	Semente Boa	09.876.543/0001-40	098765432	(91) 9012-3456	(91) 98901-2345	Rua da Lavoura	15	\N	Armazém Central	Santarém	PA	68000-000	ativo	2025-05-21 20:25:55.278403	2025-12-02 01:07:40.864338	cereais@sementeboa.com.br
184	Eletrodomésticos Smart LTDA	Casa Inteligente	12.345.678/0001-30	765432109	(11) 3456-7890	(11) 91234-5678	Avenida da Tecnologia	180	Showroom	Eletrônica Fácil	Guarulhos	SP	07000-000	ativo	2025-05-21 20:25:55.278403	2025-12-02 01:07:40.864338	eletro@casainteligente.com.br
185	Serviços de Limpeza Profissional LTDA	Limpeza Total	98.765.432/0001-20	432109876	(21) 2345-6789	(21) 98765-4321	Rua do Aspirador	20	\N	Centro de Serviços	São Gonçalo	RJ	24400-000	ativo	2025-05-21 20:25:55.278403	2025-12-02 01:07:40.864338	limpeza@limpezatotal.com.br
186	Instrumentos Musicais Melodia LTDA	Som Perfeito	45.678.901/0001-10	210987654	(31) 5678-9012	(31) 92345-6789	Travessa da Harmonia	80	Estúdio 10	Bairro Musical	Juiz de Fora	MG	36000-000	ativo	2025-05-21 20:25:55.278403	2025-12-02 01:07:40.864338	musica@somperfeito.com.br
187	Ótica Visão Clara S.A.	Olhar Nítido	10.987.654/0001-00	876543210	(41) 7890-1234	(41) 93456-7890	Rua da Lente	50	Consultório B	Visão Boa	Maringá	PR	87000-000	ativo	2025-05-21 20:25:55.278403	2025-12-02 01:07:40.864338	contato@oticavisaoclara.com.br
188	Materiais de Escritório Econômico LTDA	Escrita Fácil	32.109.876/0001-90	654321098	(51) 1234-5678	(51) 94567-8901	Rua do Lápis	10	Sala 3	Material Escolar	Pelotas	RS	96000-000	ativo	2025-05-21 20:25:55.278403	2025-12-02 01:07:40.864338	escritorio@escritafacil.com.br
189	Brinquedos Alegria LTDA	Criança Feliz	67.890.123/0001-80	321098765	(61) 8901-2345	(61) 95678-9012	Avenida do Sorriso	120	Loja de Brinquedos	Parque Infantil	Águas Claras	DF	71900-000	ativo	2025-05-21 20:25:55.278403	2025-12-02 01:07:40.864338	brinquedos@criancafeliz.com.br
190	Açúcar e Álcool Doce Cana LTDA	Doce Energia	01.234.567/0001-70	109876543	(71) 0123-4567	(71) 96789-0123	Rodovia do Açúcar	250	Usina	Fazenda Grande	Alagoinhas	BA	48000-000	ativo	2025-05-21 20:25:55.278403	2025-12-02 01:07:40.864338	docecana@doceenergia.com.br
191	Mármores e Granitos Rochedo S.A.	Pedra Fina	54.321.098/0001-60	543210987	(81) 4567-8901	(81) 97890-1234	Estrada da Pedra	90	Pedreira 2	Bairro do Cimento	Petrolina	PE	56000-000	ativo	2025-05-21 20:25:55.278403	2025-12-02 01:07:40.864338	rochas@pedrafina.com.br
192	Floricultura Jardim Encantado LTDA	Flores Vivas	87.654.321/0001-50	987654321	(91) 9012-3456	(91) 98901-2345	Rua das Rosas	40	\N	Jardim Botânico	Castanhal	PA	68700-000	ativo	2025-05-21 20:25:55.278403	2025-12-02 01:07:40.864338	flores@jardimencantado.com.br
193	Comércio de Bicicletas Pedal Livre LTDA	Bike Mania	23.456.789/0001-40	123456789	(11) 2109-8765	(11) 90123-4567	Avenida do Ciclista	70	Oficina de Bikes	Vila da Bicicleta	Campinas	SP	13000-000	ativo	2025-05-21 20:25:55.278403	2025-12-02 01:07:40.864338	bicicletas@pedallivre.com.br
194	Artigos para Festas Celebração LTDA	Festa Top	78.901.234/0001-30	098765432	(21) 3456-7890	(21) 91234-5678	Rua do Balão	15	\N	Centro de Eventos	Nova Iguaçu	RJ	26000-000	ativo	2025-05-21 20:25:55.278403	2025-12-02 01:07:40.864338	festas@festatop.com.br
195	Equipamentos de Segurança para Trabalho LTDA	Trabalho Seguro	09.876.543/0001-20	765432109	(31) 6789-0123	(31) 92345-6789	Avenida da Proteção	100	Setor C	Polo Industrial	Betim	MG	32500-000	ativo	2025-05-21 20:25:55.278403	2025-12-02 01:07:40.864338	epi@trabalhoseguro.com.br
196	Informática & Soluções Digitais LTDA	Conecte Fácil	98.765.432/0001-00	210987654	(51) 2345-6789	(51) 94567-8901	Rua da Rede	90	Tecnologia	Vila Digital	Novo Hamburgo	RS	93500-000	ativo	2025-05-21 20:25:55.278403	2025-12-02 01:07:40.864338	suporte@conectefacil.com.br
197	Artigos de Pesca Aventura LTDA	Pesca Feliz	45.678.901/0001-90	876543210	(11) 5678-9012	(11) 93456-7890	Rua do Anzol	25	\N	Bairro dos Pescadores	Guarujá	SP	11400-000	ativo	2025-05-21 20:25:55.278403	2025-12-02 01:07:40.864338	pesca@pescafeliz.com.br
198	Confeitaria Doces Momentos S.A.	Sabor de Mel	10.987.654/0001-80	654321098	(21) 6789-0123	(21) 94567-8901	Avenida do Açúcar	110	Loja 2	Jardim do Doce	Campos dos Goytacazes	RJ	28000-000	ativo	2025-05-21 20:25:55.278403	2025-12-02 01:07:40.864338	confeitaria@sabordemel.com.br
199	Vidraçaria Transparência LTDA	Luz Natural	32.109.876/0001-70	321098765	(31) 7890-1234	(31) 95678-9012	Rua do Espelho	60	\N	Cristalina	Divinópolis	MG	35500-000	ativo	2025-05-21 20:25:55.278403	2025-12-02 01:07:40.864338	vidros@luznatural.com.br
200	Materiais de Pintura Brilho Intenso LTDA	Pintura Perfeita	67.890.123/0001-60	109876543	(41) 0123-4567	(41) 96789-0123	Avenida da Arte	145	Estúdio 5	Bairro do Artista	Cascavel	PR	85800-000	ativo	2025-05-21 20:25:55.278403	2025-12-02 01:07:40.864338	tintas@pinturaperfeita.com.br
201	Indústria de Cimento Solidez LTDA	Fundação Forte	01.234.567/0001-50	543210987	(51) 4567-8901	(51) 97890-1234	Estrada do Concreto	200	Fábrica 1	Cimenteira	Caxias do Sul	RS	95000-000	ativo	2025-05-21 20:25:55.278403	2025-12-02 01:07:40.864338	cimento@fundacaoforte.com.br
202	Artigos de Couro Qualidade LTDA	Couro Nobre	54.321.098/0001-40	987654321	(61) 9012-3456	(61) 98901-2345	Rua do Curtume	30	\N	Setor de Couro	Luziânia	GO	72800-000	ativo	2025-05-21 20:25:55.278403	2025-12-02 01:07:40.864338	couro@couronobre.com.br
203	Transportadora Rápido e Seguro S.A.	Entrega Já	87.654.321/0001-30	123456789	(71) 2109-8765	(71) 90123-4567	Avenida do Frete	105	Terminal de Cargas	Logística	Lauro de Freitas	BA	42700-000	ativo	2025-05-21 20:25:55.278403	2025-12-02 01:07:40.864338	frete@entregaja.com.br
204	Empresa de Uniformes Profissionais LTDA	Vestir Bem	23.456.789/0001-20	098765432	(81) 3456-7890	(81) 91234-5678	Rua da Costura	88	\N	Centro Têxtil	Paulista	PE	53400-000	ativo	2025-05-21 20:25:55.278403	2025-12-02 01:07:40.864338	uniformes@vestirbem.com.br
205	Loja de Roupas Moda Viva LTDA	Estilo Certo	78.901.234/0001-10	765432109	(91) 2345-6789	(91) 98765-4321	Travessa da Moda	55	Loja 1	Bairro Fashion	Marabá	PA	68500-000	ativo	2025-05-21 20:25:55.278403	2025-12-02 01:07:40.864338	moda@estilocerto.com.br
206	Produtos para Piscina Água Azul LTDA	Verão Feliz	09.876.543/0001-00	432109876	(11) 5678-9012	(11) 93456-7890	Rua da Água	175	\N	Vila da Piscina	Jundiaí	SP	13200-000	ativo	2025-05-21 20:25:55.278403	2025-12-02 01:07:40.864338	piscina@aguaazul.com.br
208	Tecnologia Avançada Soluções S.A.	Tech Solutions	11.223.344/0001-01	112233445	(11) 2222-3333	(11) 98888-7777	Rua da Inovação	500	Torre Alfa	Tecnópolis	São Paulo	SP	01001-001	ativo	2025-05-21 20:27:33.935427	2025-12-02 01:07:40.864338	contato@techavancada.com.br
209	Produtos Naturais Vida Leve LTDA	Natura Essência	22.334.455/0001-02	223344556	(21) 3333-4444	(21) 97777-6666	Avenida do Verde	120	\N	Jardim Botânico	Rio de Janeiro	RJ	20001-001	ativo	2025-05-21 20:27:33.935427	2025-12-02 01:07:40.864338	vendas@naturavida.com.br
210	Distribuídora de Alimentos Sabor do Campo LTDA	Campo Rico	33.445.566/0001-03	334455667	(31) 4444-5555	(31) 96666-5555	Rua da Colheita	30	\N	Zona Rural	Belo Horizonte	MG	30001-001	ativo	2025-05-21 20:27:33.935427	2025-12-02 01:07:40.864338	comercial@sabordocampo.com.br
211	Componentes Elétricos Dynamo S.A.	Dynamo Eletro	44.556.677/0001-04	445566778	(41) 5555-6666	(41) 95555-4444	Rua da Corrente	250	Galpão C	Industrial Elétrica	Curitiba	PR	80001-001	ativo	2025-05-21 20:27:33.935427	2025-12-02 01:07:40.864338	info@dynamoeletro.com.br
212	Ferramentas de Precisão Mestre LTDA	Mestre Ferramentas	55.667.788/0001-05	556677889	(51) 6666-7777	(51) 94444-3333	Avenida da Força	80	Box 15	Oficina Mecânica	Porto Alegre	RS	90001-001	ativo	2025-05-21 20:27:33.935427	2025-12-02 01:07:40.864338	vendas@mestreferramentas.com.br
214	Logística Expressa Rápido LTDA	Entrega Veloz	77.889.900/0001-07	778899001	(71) 8888-9999	(71) 92222-1111	Rua da Carga	180	Depósito Central	Polo Logístico	Salvador	BA	40001-001	ativo	2025-05-21 20:27:33.935427	2025-12-02 01:07:40.864338	frete@entregaveloz.com.br
216	Produtos de Limpeza Eco Clean LTDA	Eco Brilho	99.001.122/0001-09	990011223	(91) 0000-1111	(91) 90000-9999	Travessa da Limpeza	95	\N	Jardim Ecológico	Belém	PA	66001-001	ativo	2025-05-21 20:27:33.935427	2025-12-02 01:07:40.864338	ecoclean@ecobrilho.com.br
217	Móveis para Escritório Design LTDA	Mobília Moderna	00.112.233/0001-10	001122334	(11) 1111-2222	(11) 99999-8888	Rua do Conceito	150	Showroom 3	Bairro do Mobiliário	São Paulo	SP	04001-001	ativo	2025-05-21 20:27:33.935427	2025-12-02 01:07:40.864338	vendas@mobilia.com.br
218	Tecidos Finos e Aviamentos S.A.	Toque de Seda	11.223.344/0001-11	112233445	(21) 2222-3333	(21) 98888-7777	Rua da Agulha	45	\N	Centro da Moda	Niterói	RJ	24001-001	ativo	2025-05-21 20:27:33.935427	2025-12-02 01:07:40.864338	contato@toquedeseda.com.br
219	Ferragens e Acessórios Construção LTDA	Ponto Forte	22.334.455/0001-12	223344556	(31) 3333-4444	(31) 97777-6666	Avenida da Estrutura	200	Galpão Principal	Construção Certa	Contagem	MG	32001-001	ativo	2025-05-21 20:27:33.935427	2025-12-02 01:07:40.864338	vendas@pontoforte.com.br
213	Artigos para Escritório Eficiente LTDA	Escritório Total	66.778.899/0001-06	667788990	(61) 7777-8888	(61) 93333-2222	Quadra 301 Norte	40	Bloco D	Asa Norte	Brasília	DF		inativo	2025-05-21 00:00:00	2025-12-02 01:10:48.889148	contato@escritoriototal.com.br
156	Móveis Modernos LTDA	Lar Decor	87.654.321/0001-00	321098765	(91) 9012-3456	(91) 98901-2345	Travessa dos Carpinteiros	70	Galpão B	Cidade Nova	Belém	PA	66000-000	ativo	2025-05-21 20:25:55.278403	2025-12-02 01:07:40.864338	decor@lardecor.com.br
158	Comércio de Plástico Flexível LTDA	Plástico Flex	78.901.234/0001-22	543210987	(21) 3456-7890	(21) 91234-5678	Avenida do Polímero	180	Unidade 3	Polo Industrial	Duque de Caxias	RJ	25000-000	ativo	2025-05-21 20:25:55.278403	2025-12-02 01:07:40.864338	plastico@plasticoflex.com.br
215	Equipamentos de Segurança Profissional S.A.	Proteção Total	88.990.011/0001-08	889900112	(81) 9999-0000	(81) 91111-0000	Avenida da Guarda	70	Setor A	Bairro Seguro	Recife	PE	50001-001	ativo	2025-05-21 20:27:33.935427	2025-12-02 01:07:40.864338	epi@protecaototal.com.br
160	Empresa de Embalagens Seguras LTDA	Embala Certo	12.345.678/0001-55	123456789	(41) 8901-2345	(41) 93456-7890	Rua do Papelão	110	Galpão Principal	Zona Norte	São José dos Pinhais	PR	83000-000	ativo	2025-05-21 20:25:55.278403	2025-12-02 01:07:40.864338	vendas@embalacerto.com.br
221	Artigos para Festas e Eventos LTDA	Festa Alegria	44.556.677/0001-14	445566778	(51) 5555-6666	(51) 95555-4444	Rua da Celebração	60	Loja 1	Bairro da Folia	Canoas	RS	92001-001	ativo	2025-05-21 20:27:33.935427	2025-12-02 01:07:40.864338	eventos@festalegria.com.br
222	Jardinagem e Paisagismo Florescer LTDA	Jardim Belo	55.667.788/0001-15	556677889	(61) 6666-7777	(61) 94444-3333	Estrada das Flores	100	\N	Natureza Viva	Gama	DF	72001-001	ativo	2025-05-21 20:27:33.935427	2025-12-02 01:07:40.864338	paisagismo@jardimbelo.com.br
223	Equipamentos Hospitalares e Médicos S.A.	Saúde Mais	66.778.899/0001-16	667788990	(71) 7777-8888	(71) 93333-2222	Avenida da Cura	220	Ala C	Setor da Saúde	Camaçari	BA	42001-001	ativo	2025-05-21 20:27:33.935427	2025-12-02 01:07:40.864338	contato@saudemais.com.br
232	Produtos de Higiene Pessoal Bem Cuidado LTDA	Corpo e Mente	55.667.788/0001-25	556677889	(71) 6666-7777	(71) 94444-3333	Rua do Cuidado	70	\N	Jardim do Bem-Estar	Feira de Santana	BA	44001-001	ativo	2025-05-21 20:27:33.935427	2025-12-02 01:07:40.864338	higiene@corpoemente.com.br
233	Embalagens para Transporte Seguro LTDA	Logística Embalagens	66.778.899/0001-26	667788990	(81) 7777-8888	(81) 93333-2222	Avenida da Proteção	190	Depósito C	Polo de Embalagens	Olinda	PE	53001-001	ativo	2025-05-21 20:27:33.935427	2025-12-02 01:07:40.864338	embalagens@logisticaembalagens.com.br
234	Indústria de Alumínio Leveza LTDA	Alumínio Essencial	77.889.900/0001-27	778899001	(91) 8888-9999	(91) 92222-1111	Estrada do Metal	280	Fábrica 2	Metal Leve	Macapá	AP	68001-001	ativo	2025-05-21 20:27:33.935427	2025-12-02 01:07:40.864338	contato@aluminioessencial.com.br
235	Roupas e Acessórios Estação da Moda LTDA	Moda Atual	88.990.011/0001-28	889900112	(11) 9999-0000	(11) 91111-0000	Rua da Passarela	40	Boutique	Centro Fashion	São Paulo	SP	01002-001	ativo	2025-05-21 20:27:33.935427	2025-12-02 01:07:40.864338	loja@modaatual.com.br
246	Marmoraria e Granitos Arte em Pedra LTDA	Escultura Fina	99.001.122/0001-39	990011223	(31) 0000-1111	(31) 90000-9999	Rua da Rocha	210	Galpão Principal	Pedreira Artística	Juiz de Fora	MG	36001-001	ativo	2025-05-21 20:27:33.935427	2025-12-02 01:07:40.864338	marmores@esculturafina.com.br
247	Ferramentas Elétricas Potência LTDA	Eletro Ferramentas	00.112.233/0001-40	001122334	(41) 1111-2222	(41) 99999-8888	Avenida da Voltagem	100	Loja 10	Eletricista	Maringá	PR	87001-001	ativo	2025-05-21 20:27:33.935427	2025-12-02 01:07:40.864338	vendas@eletroferramentas.com.br
248	Cereais e Grãos Qualidade LTDA	Safra Farta	11.223.344/0001-41	112233445	(51) 2222-3333	(51) 98888-7777	Rua da Plantação	20	\N	Armazém Agrícola	Pelotas	RS	96001-001	ativo	2025-05-21 20:27:33.935427	2025-12-02 01:07:40.864338	cereais@safrafarta.com.br
150	Tecno Soluções S.A.	Tecno TI	98.765.432/0001-87	123456789	5198950397	94950110	Avenida Central	300	Andar 5	Centro	Rio de Janeiro	RJ		ativo	2025-05-21 00:00:00	2025-12-02 01:07:40.864338	info@tecno_solucoes.com.br
157	Produtos de Limpeza Brilho S.A.	Brilho Total	23.456.789/0001-67	109876543	51989520397	1516516516516	Rua da Higiene	90	teste	Jardim Limpo	São Paulo	PI	94950110	ativo	2025-05-21 00:00:00	2025-12-02 01:07:40.864338	sac@brilhototal.com.br
151	Alimentos Saudáveis LTDA	Sabor Natural	45.678.901/0001-23	098765432	(31) 5678-9012	(31) 92345-6789	Rua da Fazenda	50	\N	Zona Rural	Belo Horizonte	MG	30100-000	ativo	2025-05-21 20:25:55.278403	2025-12-02 01:07:40.864338	vendas@sabornatural.com.br
152	Materiais de Construção União S.A.	União Construtora	10.987.654/0001-78	765432109	(41) 7890-1234	(41) 93456-7890	Rua da Pedreira	80	Galpão 1	Cidade Nova	Curitiba	PR	80000-000	ativo	2025-05-21 20:25:55.278403	2025-12-02 01:07:40.864338	contato@uniaoconstrutora.com.br
153	Comércio de Eletrônicos Brasil LTDA	Eletro Brasil	32.109.876/0001-56	432109876	(51) 1234-5678	(51) 94567-8901	Avenida dos Campos	220	Loja 10	Campina	Porto Alegre	RS	90000-000	ativo	2025-05-21 20:25:55.278403	2025-12-02 01:07:40.864338	eletro@eletrobrasil.com.br
154	Gráfica Rápida LTDA	Imprima Já	67.890.123/0001-45	210987654	(61) 8901-2345	(61) 95678-9012	Quadra 102 Sul	10	Bloco C	Asa Sul	Brasília	DF	70000-000	ativo	2025-05-21 20:25:55.278403	2025-12-02 01:07:40.864338	orcamento@imprimaja.com.br
252	Artigos de Decoração para Casa LTDA	Home Decor	55.667.788/0001-45	556677889	(91) 6666-59789	(91) 94444-3333	Travessa do Lar	60	Loja 3	Ambiente Aconchegante	Castanhal	PA		inativo	2025-05-21 00:00:00	2025-12-02 01:12:00.953239	decoracao@homedecor.com.br
224	Material Esportivo Ação Total LTDA	Esporte Ativo	77.889.900/0001-17	778899001	(81) 8888-9999	(81) 92222-1111	Rua do Atleta	90	Pista 4	Parque Esportivo	Jaboatão dos Guararapes	PE	54001-001	ativo	2025-05-21 20:27:33.935427	2025-12-02 01:07:40.864338	loja@esporteativo.com.br
225	Indústria de Plásticos Resistentes LTDA	Plástico Forte	88.990.011/0001-18	889900112	(91) 9999-0000	(91) 91111-0000	Avenida do Polímero	300	Setor B	Polo Plástico	Ananindeua	PA	67001-001	ativo	2025-05-21 20:27:33.935427	2025-12-02 01:07:40.864338	plastico@plasticoforte.com.br
226	Bebidas Naturais Refrescantes LTDA	Gosto da Fruta	99.001.122/0001-19	990011223	(11) 0000-1111	(11) 90000-9999	Rua da Sede	110	\N	Centro de Bebidas	São Paulo	SP	03001-001	ativo	2025-05-21 20:27:33.935427	2025-12-02 01:07:40.864338	comercial@gostodafruta.com.br
227	Gráfica Digital Cores Vivas S.A.	Impressão Top	00.112.233/0001-20	001122334	(21) 1111-2222	(21) 99999-8888	Avenida da Tinta	220	Andar 3	Vila Gráfica	Niterói	RJ	24002-001	ativo	2025-05-21 20:27:33.935427	2025-12-02 01:07:40.864338	orcamento@impressaotop.com.br
228	Distribuidora de Carnes Frescas LTDA	Boi Nobre	11.223.344/0001-21	112233445	(31) 2222-3333	(31) 98888-7777	Estrada do Boi	50	Frigorífico	Zona Rural	Sete Lagoas	MG	35001-001	ativo	2025-05-21 20:27:33.935427	2025-12-02 01:07:40.864338	vendas@boinobre.com.br
229	Limpeza e Conservação Pronta LTDA	Serviço Limpo	22.334.455/0001-22	223344556	(41) 3333-4444	(41) 97777-6666	Rua do Zelador	85	\N	Bairro dos Serviços	Londrina	PR	86001-001	ativo	2025-05-21 20:27:33.935427	2025-12-02 01:07:40.864338	contato@servicolimpo.com.br
230	Decoração e Ambientes Criativos LTDA	Lar com Estilo	33.445.566/0001-23	334455667	(51) 4444-5555	(51) 96666-5555	Avenida do Bom Gosto	130	Showroom	Casa e Decoração	Gravataí	RS	94001-001	ativo	2025-05-21 20:27:33.935427	2025-12-02 01:07:40.864338	design@larcomestilo.com.br
231	Pneus e Borracharia Aderência S.A.	Pneu Firme	44.556.677/0001-24	445566778	(61) 5555-6666	(61) 95555-4444	Rua da Borracha	160	Box 5	Oficina de Pneus	Taguatinga	DF	72101-001	ativo	2025-05-21 20:27:33.935427	2025-12-02 01:07:40.864338	servico@pneufirme.com.br
237	Distribuidora de Bebidas Finas LTDA	Copo Cheio	00.112.233/0001-30	001122334	(31) 1111-2222	(31) 99999-8888	Avenida do Brinde	95	Depósito 1	Bairro do Vinho	Uberlândia	MG	38001-001	ativo	2025-05-21 20:27:33.935427	2025-12-02 01:07:40.864338	bebidas@copocheio.com.br
238	Equipamentos de Refrigeração Frio Bom S.A.	Geladeira Total	11.223.344/0001-31	112233445	(41) 2222-3333	(41) 98888-7777	Rua do Gelo	240	Câmara Frigorífica	Climatização	Colombo	PR	83401-001	ativo	2025-05-21 20:27:33.935427	2025-12-02 01:07:40.864338	frio@geladeiratotal.com.br
239	Nutrição Animal Campo Saudável LTDA	Raça Forte	22.334.455/0001-32	223344556	(51) 3333-4444	(51) 97777-6666	Rodovia do Gado	15	\N	Fazenda Modelo	Viamão	RS	94401-001	ativo	2025-05-21 20:27:33.935427	2025-12-02 01:07:40.864338	nutricao@racaforte.com.br
240	Jardim de Infância e Material Pedagógico LTDA	Recreio Feliz	33.445.566/0001-33	334455667	(61) 4444-5555	(61) 96666-5555	Rua do Brincar	30	Sala de Jogos	Bairro da Criança	Ceilândia	DF	72201-001	ativo	2025-05-21 20:27:33.935427	2025-12-02 01:07:40.864338	pedagogico@recreiofeliz.com.br
241	Construções Metálicas Estrutura Firme S.A.	Viga Perfeita	44.556.677/0001-34	445566778	(71) 5555-6666	(71) 95555-4444	Estrada do Ferro	350	Galpão A	Metalúrgica	Vitória da Conquista	BA	45001-001	ativo	2025-05-21 20:27:33.935427	2025-12-02 01:07:40.864338	contato@estruturafirme.com.br
242	Aquários e Peixes Ornamentais LTDA	Mundo Aquático	55.667.788/0001-35	556677889	(81) 6666-7777	(81) 94444-3333	Rua dos Peixes	65	\N	Bairro dos Animais	Caruaru	PE	55001-001	ativo	2025-05-21 20:27:33.935427	2025-12-02 01:07:40.864338	aquario@mundoaquatico.com.br
243	Vidros e Espelhos Elegance S.A.	Cristal Fino	66.778.899/0001-36	667788990	(91) 7777-8888	(91) 93333-2222	Avenida do Reflexo	100	Showroom	Vila do Vidro	Santarém	PA	68002-001	ativo	2025-05-21 20:27:33.935427	2025-12-02 01:07:40.864338	vendas@cristalfino.com.br
244	Produtos de Limpeza Profissional LTDA	Limpeza Premium	77.889.900/0001-37	778899001	(11) 8888-9999	(11) 92222-1111	Rua do Brilho	180	\N	Centro de Serviços	Guarulhos	SP	07001-001	ativo	2025-05-21 20:27:33.935427	2025-12-02 01:07:40.864338	limpezaprofissional@premium.com.br
245	Artigos para Camping e Aventura LTDA	Natureza Livre	88.990.011/0001-38	889900112	(21) 9999-0000	(21) 91111-0000	Estrada da Trilha	30	\N	Parque das Aves	São Gonçalo	RJ	24401-001	ativo	2025-05-21 20:27:33.935427	2025-12-02 01:07:40.864338	camping@naturezalivre.com.br
253	Loja de Informática Gigabyte LTDA	Megabyte Soluções	66.778.899/0001-46	667788990	(11) 7777-8888	(11) 93333-2222	Rua do Chip	200	Sala 1	Centro Tecnológico	Campinas	SP		ativo	2025-05-21 00:00:00	2025-12-02 01:07:40.864338	suporte@megabytesolucoes.com.br
251	Telhados e Coberturas Proteção LTDA	Telhado Seguro	44.556.677/0001-44	445566778	(81) 5555-6666	(81) 95555-4444	Rua da Telha	120	Galpão 1	Reforma Certa	Petrolina	PE		ativo	2025-05-21 00:00:00	2025-12-02 01:07:40.864338	telhados@telhadoseguro.com.br
250	Equipamentos para Bares e Restaurantes S.A.	Cozinha Completa	33.445.566/0001-43	334455667	(71) 4444-5555	(71) 96666-5555	Avenida do Chef	150	Cozinha Industrial	Gastronomia	Alagoinhas	BA		ativo	2025-05-21 00:00:00	2025-12-02 01:07:40.864338	restaurante@cozinhacompleta.com.br
249	Produtos Veterinários Saúde Animal LTDA	Amigo Pet	22.334.455/0001-42	223344556	(61) 3333-4444	(61) 97777-6666	Rua do Veterinário	50		Clínica Pet	Águas Claras	DF		ativo	2025-05-21 00:00:00	2025-12-02 01:07:40.864338	contato@amigopet.com.br
236	Material Escolar e Didático Saber Mais LTDA	Aprender Brincando	99.001.122/0001-29	990011223	(21) 0000-1111	(21) 90000-9999	Rua do Conhecimento	130	\N	Vila do Estudante	Petrópolis	RJ	25601-001	ativo	2025-05-21 20:27:33.935427	2025-12-02 01:07:40.864338	vendas@sabermias.com.br
254	Equipamentos de Som e Iluminação S.A.	Show Light	81.891.981/9819-19	778899001	(51) 9895-23038	(51) 9895-20397	Avenida do Palco	80	Estúdio A	Produção de Eventos	Nova Iguaçu	RJ		inativo	2025-05-21 00:00:00	2025-12-02 22:42:01.707491	eventos@showlight.com.br
255	Produtos de Jardinagem Solo LTDA	Terra Fértil	88.990.011/0001-48	889900112	(31) 9999-26477	(31) 9111-11188	Rua da Semente	45		Horto Floresta	Betim	MG	15616-165	ativo	2025-05-21 03:00:00	2025-12-03 07:33:26.907212	jardinagem@solobomt2.com.br
\.


--
-- TOC entry 5004 (class 0 OID 18169)
-- Dependencies: 241
-- Data for Name: movimentacoes_estoque; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.movimentacoes_estoque (id, tipo, origem, referencia_id, produto_id, quantidade, preco_unitario_liquido, usuario_id, observacao, created_at) FROM stdin;
169	saida	venda	44	6	10	180.00	3	\N	2026-01-21 20:12:16.628483
170	saida	venda	44	3	300	150.00	3	\N	2026-01-21 20:12:16.628483
173	saida	venda	44	6	10	180.00	3	\N	2026-01-21 20:15:43.776723
57	entrada	ajuste	14	3	100	7.30	5	\N	2025-12-01 15:04:23.232309
174	saida	venda	44	3	300	150.00	3	\N	2026-01-21 20:15:43.776723
63	entrada	ajuste	1	3	150	7.30	5	\N	2025-12-01 22:03:58.565794
75	saida	venda	11	3	50	98.74	3	\N	2025-12-02 00:48:05.502747
77	entrada	compra	7	3	500	5.00	3	\N	2025-12-02 00:49:14.301226
79	saida	venda	8	3	25	99.00	3	\N	2025-12-05 10:29:03.902718
80	entrada	compra	9	6	50	288.01	3	\N	2025-12-05 17:18:36.002071
81	entrada	compra	10	4	150	127.01	3	\N	2025-12-05 17:22:14.116144
82	entrada	compra	12	3	100	99.00	3	\N	2025-12-05 17:23:25.888789
84	entrada	compra	13	7	150	29.00	3	\N	2025-12-05 17:24:15.70534
85	entrada	compra	14	51	150	47.01	3	\N	2025-12-05 17:25:06.619613
87	entrada	compra	18	3	20	117.01	3	\N	2025-12-05 17:27:25.849931
89	entrada	compra	19	7	100	49.00	3	\N	2025-12-05 17:28:29.482256
90	entrada	compra	20	35	100	57.01	3	\N	2025-12-05 17:29:00.097857
91	entrada	compra	21	26	200	97.71	3	\N	2025-12-05 17:30:00.337258
92	entrada	compra	22	42	150	39.00	3	\N	2025-12-05 17:30:36.865219
93	entrada	compra	23	43	200	37.01	3	\N	2025-12-05 17:31:00.080998
94	entrada	compra	24	51	150	47.01	3	\N	2025-12-05 17:32:17.553701
95	entrada	compra	26	26	100	93.71	3	\N	2025-12-05 17:33:22.3532
100	saida	venda	15	26	150	150.50	3	\N	2025-12-05 17:36:59.001906
101	saida	venda	15	43	100	199.00	3	\N	2025-12-05 17:36:59.001906
102	saida	venda	16	35	100	99.99	3	\N	2025-12-05 17:37:22.331385
103	saida	venda	17	4	100	228.00	3	\N	2025-12-05 17:39:25.074463
106	saida	venda	21	51	150	68.61	3	\N	2025-12-05 17:41:40.265753
108	saida	venda	23	51	50	58.61	3	\N	2025-12-05 17:43:54.53902
109	saida	venda	25	51	20	78.61	3	\N	2025-12-05 17:44:36.977869
111	saida	venda	28	3	150	159.90	3	\N	2025-12-05 17:47:00.530576
112	saida	venda	30	3	150	159.90	3	\N	2025-12-05 17:47:44.458854
113	entrada	compra	27	7	200	28.10	3	\N	2025-12-05 19:12:45.294366
114	saida	venda	32	3	50	150.00	3	\N	2026-01-19 20:36:31.066538
115	saida	venda	32	7	25	29.90	3	\N	2026-01-19 20:36:31.066538
116	saida	venda	32	43	50	59.00	3	\N	2026-01-19 20:36:31.066538
117	entrada	estorno_venda	32	7	25	29.90	3	\N	2026-01-19 20:36:36.875859
118	entrada	estorno_venda	32	43	50	59.00	3	\N	2026-01-19 20:36:36.875859
119	entrada	estorno_venda	32	3	50	150.00	3	\N	2026-01-19 20:36:36.875859
120	entrada	compra	29	3	100	97.80	3	\N	2026-01-20 08:39:35.23374
121	entrada	compra	32	4	100	99.00	3	\N	2026-01-20 08:41:55.345423
122	saida	venda	33	4	100	150.50	3	\N	2026-01-20 08:42:30.538266
123	saida	venda	36	4	25	150.00	3	\N	2026-01-20 08:43:52.817431
124	entrada	compra	33	4	100	48.50	3	\N	2026-01-20 08:46:35.735947
125	entrada	compra	34	4	100	97.10	3	\N	2026-01-20 08:47:07.697565
126	entrada	compra	35	4	200	97.50	3	\N	2026-01-20 08:47:50.505458
128	saida	venda	39	4	100	98.40	3	\N	2026-01-20 08:49:13.360854
131	saida	venda	43	3	100	250.50	3	\N	2026-01-20 08:51:41.47905
171	entrada	estorno_venda	44	6	10	180.00	3	\N	2026-01-21 20:15:28.284697
172	entrada	estorno_venda	44	3	300	150.00	3	\N	2026-01-21 20:15:28.284697
175	entrada	estorno_venda	39	4	100	98.40	3	\N	2026-01-21 21:00:05.369305
165	saida	venda	44	6	10	180.00	3	\N	2026-01-21 20:07:47.64529
166	saida	venda	44	3	300	150.00	3	\N	2026-01-21 20:07:47.64529
167	entrada	estorno_venda	44	6	10	180.00	3	\N	2026-01-21 20:09:27.541201
168	entrada	estorno_venda	44	3	300	150.00	3	\N	2026-01-21 20:09:27.541201
\.


--
-- TOC entry 4981 (class 0 OID 16428)
-- Dependencies: 218
-- Data for Name: produtos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.produtos (id, codigo, nome, descricao, categoria, status, estoque_minimo, estoque_maximo, data_cadastro, data_atualizacao) FROM stdin;
7	MEI-CAN-CUR	Meia Cano Curto (3 Pares)	Kit de meias esportivas, ideal para o dia a dia.	Acessórios	ativo	150	500	2025-05-20 11:54:07	2025-12-03 09:00:54.549481
4	TEN-ESP	Tênis Esportivo	Tênis de corrida com amortecimento avançado.	Calçados	ativo	20	100	2025-05-20 11:54:07	2025-12-03 09:00:54.549481
70	JAC-COUA	Jaqueta de Couroe	Jaqueta d couro	Roupas Inverno	ativo	50	300	2025-08-23 01:19:38.825751	2025-12-03 09:00:54.549481
8	SHO-BAN	Shorts de Banho	Shorts confortável para uso na praia ou piscina.	Roupas	ativo	40	250	2025-05-20 11:54:07	2025-12-03 09:00:54.549481
6	JAC-COU	Jaqueta de Couro	Jaqueta de couro sintético com forro interno.	Roupas	ativo	10	60	2025-05-20 11:54:07	2025-12-03 09:00:54.549481
26	BER-CAR-MAS	Bermuda Cargo Masculina	Bermuda com bolsos laterais, estilo casual.	Roupas	ativo	25	120	2025-05-20 11:54:07	2025-12-03 09:00:54.549481
29	SUE-TRI	Suéter de Tricô	Suéter de lã para dias frios, com gola redonda.	Roupas	ativo	15	70	2025-05-20 11:54:07	2025-12-03 09:00:54.549481
30	BOD-REN-FEM	Body Renda Feminino	Body de renda, ideal para looks sofisticados.	Roupas	ativo	10	50	2025-05-20 11:54:07	2025-12-03 09:00:54.549481
9	MOC-ESC	Mochila Escolar	Mochila resistente com múltiplos compartimentos.	Acessórios	ativo	25	120	2025-05-20 11:54:07	2025-12-03 09:00:54.549481
11	REL-PUL	Relógio de Pulso	Relógio analógico com pulseira de couro.	Acessórios	ativo	10	70	2025-05-20 11:54:07	2025-12-03 09:00:54.549481
13	CIN-COU	Cinto de Couro	Cinto masculino de couro legítimo com fivela.	Acessórios	ativo	50	200	2025-05-20 11:54:07	2025-12-03 09:00:54.549481
15	OCU-SOL-AVI	Óculos de Sol Aviador	Óculos de sol com lentes polarizadas.	Acessórios	ativo	25	120	2025-05-20 11:54:07	2025-12-03 09:00:54.549481
16	CUE-BOX	Cueca Boxer (5 Unidades)	Kit de cuecas boxer em algodão.	Roupas	ativo	100	400	2025-05-20 11:54:07	2025-12-03 09:00:54.549481
17	PIJ-MAS	Pijama Masculino	Pijama confortável de algodão para noites.	Roupas	ativo	20	100	2025-05-20 11:54:07	2025-12-03 09:00:54.549481
19	CAC-LA	Cachecol de Lã	Cachecol quente e macio para o inverno.	Acessórios	ativo	15	80	2025-05-20 11:54:07	2025-12-03 09:00:54.549481
20	LUV-COU	Luvas de Couro	Luvas elegantes de couro para dias frios.	Acessórios	ativo	10	40	2025-05-20 11:54:07	2025-12-03 09:00:54.549481
21	COR-VEN-IMP	Corta-Vento Impermeável	Jaqueta leve e impermeável para atividades ao ar livre.	Roupas	ativo	15	70	2025-05-20 11:54:07	2025-12-03 09:00:54.549481
22	REG-FIT	Regata Fitness	Regata feminina para treinos, com tecido respirável.	Roupas	ativo	30	180	2025-05-20 11:54:07	2025-12-03 09:00:54.549481
23	CAL-LEG-ESP	Calça Legging Esportiva	Calça legging de alta compressão para exercícios.	Roupas	ativo	25	120	2025-05-20 11:54:07	2025-12-03 09:00:54.549481
25	SAN-RAS	Sandália Rasteirinha	Sandália feminina prática para o verão.	Calçados	ativo	50	200	2025-05-20 11:54:07	2025-12-03 09:00:54.549481
31	CHA-PRA	Chapéu de Praia	Chapéu de palha com aba larga, proteção UV.	Acessórios	ativo	30	130	2025-05-20 11:54:07	2025-12-03 09:00:54.549481
32	COL-PRA	Colar de Prata	Colar com pingente delicado, em prata 925.	Acessórios	ativo	5	40	2025-05-20 11:54:07	2025-12-03 09:00:54.549481
33	BRI-PEQ	Brincos Pequenos (Kit)	Kit com 3 pares de brincos pequenos e discretos.	Acessórios	ativo	20	100	2025-05-20 11:54:07	2025-12-03 09:00:54.549481
34	PUL-COU-MAS	Pulseira de Couro Masculina	Pulseira de couro legítimo com fecho magnético.	Acessórios	ativo	10	60	2025-05-20 11:54:07	2025-12-03 09:00:54.549481
35	CAR-FEM-GRA	Carteira Feminina Grande	Carteira com diversos compartimentos para cartões.	Acessórios	ativo	15	70	2025-05-20 11:54:07	2025-12-03 09:00:54.549481
10	ABC	Sapato Social Masculino	Sapato clássico de couro para ocasiões formais.	Calçados	ativo	15	80	2025-05-20 11:54:07	2025-12-03 09:00:54.549481
39	SUT-REN	Sutiã Rendado	Sutiã com detalhes em renda, sem bojo.	Roupas	ativo	40	150	2025-05-20 11:54:07	2025-12-03 09:00:54.549481
40	CAL-FIO-DEN	Calcinha Fio Dental (Kit)	Kit com 3 calcinhas fio dental em microfibra.	Roupas	ativo	60	250	2025-05-20 11:54:07	2025-12-03 09:00:54.549481
41	MEI-CAL-FIN	Meia Calça Fina	Meia calça transparente para uso social.	Acessórios	ativo	50	200	2025-05-20 11:54:07	2025-12-03 09:00:54.549481
42	POL-MAS-ALG	Polo Masculina Algodão	Camisa polo clássica em algodão pima.	Roupas	ativo	25	120	2025-05-20 11:54:07	2025-12-03 09:00:54.549481
43	CAM-SOC-MAS	Camisa Social Masculina	Camisa social de manga longa, slim fit.	Roupas	ativo	15	80	2025-05-20 11:54:07	2025-12-03 09:00:54.549481
46	MEI-INV	Meia Invisível (6 Pares)	Kit de meias invisíveis para sapatilhas e tênis.	Acessórios	ativo	120	400	2025-05-20 11:54:07	2025-12-03 09:00:54.549481
51	CAR-MAS-PEQ	Carteira Masculina Pequena	Carteira slim em couro, com porta-cartões.	Acessórios	ativo	20	90	2025-05-20 11:54:07	2025-12-03 09:00:54.549481
52	TES-TES	Camiseta Teste	Protetor solar com alta proteção, para o rosto.	Beleza e Cuidados	ativo	30	150	2025-05-20 11:54:07	2025-12-03 09:00:54.549481
63	TESTE	TESTE	Descrição do produto Blusa Regata.	Teste	ativo	0	0	2025-07-06 00:01:12.221397	2025-12-03 09:00:54.549481
64	Teste-Segun	Teste de Insert	Teste de Insert/Post Via Frontend	Roupas	ativo	0	500	2025-07-06 00:33:31.068457	2025-12-03 09:00:54.549481
50	CON-FIT	Conjunto Fitness (Top e Legging)	Conjunto para treino com top e legging.	Roupas	ativo	15	70	2025-05-20 11:54:07	2025-12-03 09:00:54.549481
18	CHI-DED	Chinelo de Dedo	Chinelo simples e prático para o verão.	Calçados	ativo	70	250	2025-05-20 11:54:07	2025-12-03 09:00:54.549481
14	BOL-FEM-TRA	Bolsa Feminina Transversal	Bolsa pequena e prática para o dia a dia.	Acessórios	ativo	20	90	2025-05-20 11:54:07	2025-12-03 09:00:54.549481
12	VES-FLO	Vestido Floral	Vestido feminino estampado, ideal para o verão.	Roupas	ativo	30	150	2025-05-20 11:54:07	2025-12-03 09:00:54.549481
3	CAL-JEA-SKI	Calça Jeans Skinny	Calça jeans masculina com corte ajustado.	Roupas	inativo	30	200	2025-05-20 11:54:07	2025-12-03 19:09:19.285657
5	COD-PRO	ABC	Boné moderno com ajuste regulável.	Acessórios	ativo	25	100	2025-05-20 14:54:07	2025-12-03 20:10:49.835775
2	TES-EST001A	Teste Mov Estoque	Testando Movimentação e Saldo de Estoque	Roupas	ativo	125	300	2025-05-20 11:54:07	2025-12-03 20:14:10.713081
\.


--
-- TOC entry 4993 (class 0 OID 16641)
-- Dependencies: 230
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.refresh_tokens (id, user_id, token, expires_at) FROM stdin;
163	5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwidXNlcm5hbWUiOiJBZG1pbjQyNDIxMjE0MSIsImlhdCI6MTc2OTUzNzgwMiwiZXhwIjoxNzcwMTQyNjAyfQ.aFQMeU47WWx78psTbeoqaNgC91_UcrYEPXHyXBrrCpg	2026-02-03 15:16:42.562
164	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlcm5hbWUiOiJBZG1pbiIsImlhdCI6MTc3MDU1NzA3NSwiZXhwIjoxNzcxMTYxODc1fQ.RIwKhjwCDOsWOaNbOpqc0MswbknFHVL--p6Za1r3sR8	2026-02-15 10:24:35.911
165	5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwidXNlcm5hbWUiOiJBZG1pbjQyNDIxMjE0MSIsImlhdCI6MTc3MDc2ODU5NywiZXhwIjoxNzcxMzczMzk3fQ.87c7G-xJ9bOLpSQvri63NlLsSDb--M-mc1bahXx3fpY	2026-02-17 21:09:57.001
\.


--
-- TOC entry 4991 (class 0 OID 16627)
-- Dependencies: 228
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, username, password_hash) FROM stdin;
1	loginteste	$2b$10$AUEgDf8TJv6BVBzlmX/msuTSRi4UcyqAuj.4.dOmzp0CtclpA2Qb6
2	loginteste2	$2b$10$YeDsSsuVHDEf7wiyQMNeC.2NAmiEI1sxykJPHMO7B7vRU4ZSl2jj.
3	Admin	$2b$10$JIEe0mP.rN.JorF1IgG7U.KRTFkit9iYkuh7OTJ2uofY4JpxzytEG
4	loginteste1	$2b$10$yxpp/Of425YNrVtVG2VJ5uO5zgLUoXN1mrB45khMpbd/8Pd2lz7Nu
5	Admin424212141	$2b$10$E7/o8./Yco7lIN1pVtE.WuiBBACLgmrzaN2rKtBSRzp4xoPXbHKPq
8	Visitor	$2b$10$kJoKXHfFRbq0EJlHAHBpzOnneD27/Y8C/0kSMXnLB4SS87.1Z4k1y
\.


--
-- TOC entry 4996 (class 0 OID 18033)
-- Dependencies: 233
-- Data for Name: vendas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.vendas (id, cliente_id, data_emissao, tipo_pagamento, desconto_comercial, desconto_financeiro, desconto_volume, valor_bruto, status, data_cadastro, created_by, data_atualizacao, updated_by) FROM stdin;
15	3	2025-12-05	cartao	50.00	0.00	99.00	42574.00	finalizado	2025-12-05 17:36:59.001906	3	2025-12-05 17:36:59.001906	3
16	3	2025-12-05	cartao	0.00	0.00	0.00	9999.00	finalizado	2025-12-05 17:37:22.331385	3	2025-12-05 17:37:22.331385	3
17	13	2025-12-05	boleto	10.00	10.00	150.00	22950.00	finalizado	2025-12-05 17:39:25.074463	3	2025-12-05 17:39:25.074463	3
18	52	2025-12-05	pix	150.00	10.00	159.00	39999.00	aguardando	2025-12-05 17:39:50.507427	3	2025-12-05 17:39:50.507427	3
19	13	2025-12-05	cartao	50.00	50.00	950.00	11950.00	finalizado	2025-12-05 17:40:26.178202	3	2025-12-05 17:40:26.178202	3
20	13	2025-12-05	transferencia	50.00	50.00	59.00	11559.00	finalizado	2025-12-05 17:40:56.4175	3	2025-12-05 17:40:56.4175	3
21	56	2025-12-05	pix	0.00	50.00	193.50	10485.00	finalizado	2025-12-05 17:41:40.265753	3	2025-12-05 17:41:40.265753	3
22	3	2025-12-05	cartao	0.00	0.00	0.00	5600.00	finalizado	2025-12-05 17:42:21.523435	3	2025-12-05 17:42:21.523435	3
23	43	2025-12-05	boleto	0.00	0.00	64.50	2995.00	finalizado	2025-12-05 17:43:54.53902	3	2025-12-05 17:43:54.53902	3
25	43	2025-12-05	pix	10.00	10.00	25.80	1598.00	finalizado	2025-12-05 17:44:36.977869	3	2025-12-05 17:44:36.977869	3
26	56	2025-12-05	boleto	10.00	10.00	9.00	799.00	finalizado	2025-12-05 17:45:24.650537	3	2025-12-05 17:45:24.650537	3
27	11	2025-12-05	cartao	10.00	10.00	129.00	4990.00	aguardando	2025-12-05 17:46:44.051214	3	2025-12-05 17:46:44.051214	3
28	3	2025-12-05	boleto	0.00	0.00	0.00	23985.00	entregue	2025-12-05 17:47:00.530576	3	2025-12-05 17:47:00.530576	3
29	11	2025-12-05	cartao	0.00	0.00	0.00	12990.00	aberto	2025-12-05 17:47:24.082901	3	2025-12-05 17:47:24.082901	3
30	3	2025-12-05	transferencia	0.00	0.00	0.00	23985.00	finalizado	2025-12-05 17:47:44.458854	3	2025-12-05 17:47:44.458854	3
31	43	2025-12-05	pix	0.00	0.00	129.00	5990.00	aprovado	2025-12-05 17:48:15.73068	3	2025-12-05 17:48:15.73068	3
32	13	2025-12-05	pix	0.00	0.00	540.00	11737.50	aberto	2025-12-05 17:49:17.899351	3	2025-12-05 17:49:17.899351	3
33	3	2026-01-20	cartao	0.00	0.00	0.00	15050.00	finalizado	2026-01-20 08:42:30.538266	3	2026-01-20 08:42:30.538266	3
34	17	2026-01-20	pix	20.00	10.00	150.00	9990.00	aberto	2026-01-20 08:43:03.354301	3	2026-01-20 08:43:03.354301	3
36	11	2026-01-20	cartao	20.00	20.00	12.50	3762.50	entregue	2026-01-20 08:43:52.817431	3	2026-01-20 08:43:52.817431	3
37	24	2026-01-20	boleto	10.00	10.00	150.00	5990.00	finalizado	2026-01-20 08:48:41.60752	3	2026-01-20 08:48:41.60752	3
40	25	2026-01-20	pix	20.00	50.00	190.00	12990.00	finalizado	2026-01-20 08:50:22.807359	3	2026-01-20 08:50:22.807359	3
42	5	2026-01-20	pix	20.00	10.00	0.00	14545.00	finalizado	2026-01-20 08:51:07.984789	3	2026-01-20 08:51:07.984789	3
43	3	2026-01-20	boleto	10.00	10.00	0.00	25050.00	finalizado	2026-01-20 08:51:37.351978	3	2026-01-20 08:51:37.351978	3
11	11	2025-12-02	boleto	10.00	50.00	187.50	7749.50	finalizado	2025-11-27 19:01:20.783214	3	2025-11-27 19:01:20.783214	3
10	11	2025-12-02	pix	30.00	20.00	750.00	6000.00	aguardando	2025-11-24 18:09:42.029927	3	2025-11-24 18:09:42.029927	3
8	56	2025-12-02	pix	20.00	30.00	524.75	9999.75	finalizado	2025-11-23 13:24:45.921073	1	2025-11-23 13:24:45.921073	1
12	11	2025-12-05	transferencia	10.00	10.00	129.00	9999.00	finalizado	2025-12-05 17:35:13.130398	3	2025-12-05 17:35:13.130398	3
13	11	2025-12-05	pix	10.00	10.00	0.00	14332.50	finalizado	2025-12-05 17:35:31.497606	3	2025-12-05 17:35:31.497606	3
44	13	2026-01-21	transferencia	10.00	10.00	3169.90	49969.90	finalizado	2026-01-21 12:16:25.985806	3	2026-01-21 12:16:25.985806	3
39	4	2026-01-20	boleto	10.00	10.00	150.00	9990.00	aguardando	2026-01-20 08:49:13.360854	3	2026-01-20 08:49:13.360854	3
\.


--
-- TOC entry 4998 (class 0 OID 18061)
-- Dependencies: 235
-- Data for Name: vendas_itens; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.vendas_itens (id, venda_id, produto_id, quantidade, preco_unitario, desconto_unitario, data_cadastro, created_by, data_atualizacao, updated_by) FROM stdin;
37	32	43	50	59.90	0.90	2025-12-05 17:49:17.899351	3	2026-01-19 20:36:31.066538	3
38	33	4	100	150.50	0.00	2026-01-20 08:42:30.538266	3	2026-01-20 08:42:30.538266	3
39	34	2	100	99.90	1.50	2026-01-20 08:43:03.354301	3	2026-01-20 08:43:03.354301	3
41	36	4	25	150.50	0.50	2026-01-20 08:43:52.817431	3	2026-01-20 08:43:52.817431	3
42	37	2	100	59.90	1.50	2026-01-20 08:48:41.60752	3	2026-01-20 08:48:41.60752	3
44	39	4	100	99.90	1.50	2026-01-20 08:49:13.360854	3	2026-01-20 08:49:13.360854	3
45	40	2	100	129.90	1.90	2026-01-20 08:50:22.807359	3	2026-01-20 08:50:22.807359	3
47	42	2	50	290.90	0.00	2026-01-20 08:51:07.984789	3	2026-01-20 08:51:07.984789	3
48	43	3	100	250.50	0.00	2026-01-20 08:51:37.351978	3	2026-01-20 08:51:41.47905	3
11	11	2	500	5.50	0.25	2025-11-27 19:01:20.783214	3	2025-12-02 00:48:05.502747	3
12	11	3	50	99.99	1.25	2025-11-27 19:01:20.783214	3	2025-12-02 00:48:05.502747	3
10	10	2	500	12.00	1.50	2025-11-24 18:09:42.029927	3	2025-12-02 00:48:30.133961	3
7	8	2	500	15.00	1.00	2025-11-23 13:48:03.995145	5	2025-12-05 10:29:03.902718	3
9	8	3	25	99.99	0.99	2025-11-24 14:37:39.562158	3	2025-12-05 10:29:03.902718	3
13	12	2	100	99.99	1.29	2025-12-05 17:35:13.130398	3	2025-12-05 17:35:13.130398	3
14	13	2	150	95.55	0.00	2025-12-05 17:35:31.497606	3	2025-12-05 17:35:31.497606	3
17	15	26	150	150.50	0.00	2025-12-05 17:36:59.001906	3	2025-12-05 17:36:59.001906	3
18	15	43	100	199.99	0.99	2025-12-05 17:36:59.001906	3	2025-12-05 17:36:59.001906	3
19	16	35	100	99.99	0.00	2025-12-05 17:37:22.331385	3	2025-12-05 17:37:22.331385	3
20	17	4	100	229.50	1.50	2025-12-05 17:39:25.074463	3	2025-12-05 17:39:25.074463	3
21	18	6	100	399.99	1.59	2025-12-05 17:39:50.507427	3	2025-12-05 17:39:50.507427	3
22	19	2	100	119.50	9.50	2025-12-05 17:40:26.178202	3	2025-12-05 17:40:26.178202	3
23	20	2	100	115.59	0.59	2025-12-05 17:40:56.4175	3	2025-12-05 17:40:56.4175	3
24	21	51	150	69.90	1.29	2025-12-05 17:41:40.265753	3	2025-12-05 17:41:40.265753	3
25	22	2	50	112.00	0.00	2025-12-05 17:42:21.523435	3	2025-12-05 17:42:21.523435	3
26	23	51	50	59.90	1.29	2025-12-05 17:43:54.53902	3	2025-12-05 17:43:54.53902	3
28	25	51	20	79.90	1.29	2025-12-05 17:44:36.977869	3	2025-12-05 17:44:36.977869	3
29	26	2	10	79.90	0.90	2025-12-05 17:45:24.650537	3	2025-12-05 17:45:24.650537	3
30	27	43	100	49.90	1.29	2025-12-05 17:46:44.051214	3	2025-12-05 17:46:44.051214	3
31	28	3	150	159.90	0.00	2025-12-05 17:47:00.530576	3	2025-12-05 17:47:00.530576	3
32	29	2	100	129.90	0.00	2025-12-05 17:47:24.082901	3	2025-12-05 17:47:24.082901	3
33	30	3	150	159.90	0.00	2025-12-05 17:47:44.458854	3	2025-12-05 17:47:44.458854	3
34	31	7	100	59.90	1.29	2025-12-05 17:48:15.73068	3	2025-12-05 17:48:15.73068	3
35	32	3	50	159.90	9.90	2025-12-05 17:49:17.899351	3	2026-01-19 20:36:31.066538	3
36	32	7	25	29.90	0.00	2025-12-05 17:49:17.899351	3	2026-01-19 20:36:31.066538	3
50	44	6	10	199.99	19.99	2026-01-21 12:26:25.567808	3	2026-01-21 20:15:43.776723	3
51	44	3	300	159.90	9.90	2026-01-21 19:21:23.108347	3	2026-01-21 20:15:43.776723	3
\.


--
-- TOC entry 5021 (class 0 OID 0)
-- Dependencies: 221
-- Name: clientes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.clientes_id_seq', 61, true);


--
-- TOC entry 5022 (class 0 OID 0)
-- Dependencies: 236
-- Name: compras_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.compras_id_seq', 35, true);


--
-- TOC entry 5023 (class 0 OID 0)
-- Dependencies: 238
-- Name: compras_itens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.compras_itens_id_seq', 69, true);


--
-- TOC entry 5024 (class 0 OID 0)
-- Dependencies: 242
-- Name: estoque_ajustes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.estoque_ajustes_id_seq', 9, true);


--
-- TOC entry 5025 (class 0 OID 0)
-- Dependencies: 244
-- Name: estoque_ajustes_itens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.estoque_ajustes_itens_id_seq', 10, true);


--
-- TOC entry 5026 (class 0 OID 0)
-- Dependencies: 219
-- Name: fornecedores_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.fornecedores_id_seq', 264, true);


--
-- TOC entry 5027 (class 0 OID 0)
-- Dependencies: 224
-- Name: itens_venda_id_item_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.itens_venda_id_item_seq', 763, true);


--
-- TOC entry 5028 (class 0 OID 0)
-- Dependencies: 226
-- Name: itens_venda_id_produto_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.itens_venda_id_produto_seq', 17, true);


--
-- TOC entry 5029 (class 0 OID 0)
-- Dependencies: 225
-- Name: itens_venda_produto_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.itens_venda_produto_id_seq', 1, false);


--
-- TOC entry 5030 (class 0 OID 0)
-- Dependencies: 240
-- Name: movimentacoes_estoque_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.movimentacoes_estoque_id_seq', 175, true);


--
-- TOC entry 5031 (class 0 OID 0)
-- Dependencies: 217
-- Name: produtos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.produtos_id_seq', 70, true);


--
-- TOC entry 5032 (class 0 OID 0)
-- Dependencies: 229
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.refresh_tokens_id_seq', 166, true);


--
-- TOC entry 5033 (class 0 OID 0)
-- Dependencies: 227
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 8, true);


--
-- TOC entry 5034 (class 0 OID 0)
-- Dependencies: 232
-- Name: vendas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.vendas_id_seq', 44, true);


--
-- TOC entry 5035 (class 0 OID 0)
-- Dependencies: 223
-- Name: vendas_id_venda_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.vendas_id_venda_seq', 70, true);


--
-- TOC entry 5036 (class 0 OID 0)
-- Dependencies: 234
-- Name: vendas_itens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.vendas_itens_id_seq', 51, true);


--
-- TOC entry 4789 (class 2606 OID 16478)
-- Name: clientes clientes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT clientes_pkey PRIMARY KEY (id);


--
-- TOC entry 4805 (class 2606 OID 18127)
-- Name: compras_itens compras_itens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.compras_itens
    ADD CONSTRAINT compras_itens_pkey PRIMARY KEY (id);


--
-- TOC entry 4803 (class 2606 OID 18100)
-- Name: compras compras_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.compras
    ADD CONSTRAINT compras_pkey PRIMARY KEY (id);


--
-- TOC entry 4811 (class 2606 OID 18613)
-- Name: estoque_ajustes_itens estoque_ajustes_itens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estoque_ajustes_itens
    ADD CONSTRAINT estoque_ajustes_itens_pkey PRIMARY KEY (id);


--
-- TOC entry 4809 (class 2606 OID 18596)
-- Name: estoque_ajustes estoque_ajustes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estoque_ajustes
    ADD CONSTRAINT estoque_ajustes_pkey PRIMARY KEY (id);


--
-- TOC entry 4797 (class 2606 OID 16870)
-- Name: estoque_saldo estoque_saldo_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estoque_saldo
    ADD CONSTRAINT estoque_saldo_pkey PRIMARY KEY (produto_id);


--
-- TOC entry 4785 (class 2606 OID 16458)
-- Name: fornecedores fornecedores_cnpj_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fornecedores
    ADD CONSTRAINT fornecedores_cnpj_key UNIQUE (cnpj);


--
-- TOC entry 4787 (class 2606 OID 16456)
-- Name: fornecedores fornecedores_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fornecedores
    ADD CONSTRAINT fornecedores_pkey PRIMARY KEY (id);


--
-- TOC entry 4807 (class 2606 OID 18177)
-- Name: movimentacoes_estoque movimentacoes_estoque_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.movimentacoes_estoque
    ADD CONSTRAINT movimentacoes_estoque_pkey PRIMARY KEY (id);


--
-- TOC entry 4781 (class 2606 OID 16438)
-- Name: produtos produtos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.produtos
    ADD CONSTRAINT produtos_pkey PRIMARY KEY (id);


--
-- TOC entry 4795 (class 2606 OID 16648)
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 4783 (class 2606 OID 16614)
-- Name: produtos unique_codigo_nome; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.produtos
    ADD CONSTRAINT unique_codigo_nome UNIQUE (codigo, nome);


--
-- TOC entry 4791 (class 2606 OID 16634)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4793 (class 2606 OID 16636)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 4801 (class 2606 OID 18071)
-- Name: vendas_itens vendas_itens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendas_itens
    ADD CONSTRAINT vendas_itens_pkey PRIMARY KEY (id);


--
-- TOC entry 4799 (class 2606 OID 18044)
-- Name: vendas vendas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendas
    ADD CONSTRAINT vendas_pkey PRIMARY KEY (id);


--
-- TOC entry 4833 (class 2620 OID 16440)
-- Name: produtos trg_update_data_atualizacao; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_update_data_atualizacao BEFORE UPDATE ON public.produtos FOR EACH ROW EXECUTE FUNCTION public.update_data_atualizacao();


--
-- TOC entry 4834 (class 2620 OID 16638)
-- Name: fornecedores trigger_update_data_atualizacao; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_update_data_atualizacao BEFORE UPDATE ON public.fornecedores FOR EACH ROW EXECUTE FUNCTION public.update_data_atualizacao();


--
-- TOC entry 4820 (class 2606 OID 18101)
-- Name: compras compras_created_by_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.compras
    ADD CONSTRAINT compras_created_by_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 4821 (class 2606 OID 18111)
-- Name: compras compras_fornecedor_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.compras
    ADD CONSTRAINT compras_fornecedor_fk FOREIGN KEY (fornecedor_id) REFERENCES public.fornecedores(id);


--
-- TOC entry 4823 (class 2606 OID 18128)
-- Name: compras_itens compras_itens_compra_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.compras_itens
    ADD CONSTRAINT compras_itens_compra_fk FOREIGN KEY (compra_id) REFERENCES public.compras(id);


--
-- TOC entry 4824 (class 2606 OID 18138)
-- Name: compras_itens compras_itens_created_by_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.compras_itens
    ADD CONSTRAINT compras_itens_created_by_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 4825 (class 2606 OID 18133)
-- Name: compras_itens compras_itens_produto_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.compras_itens
    ADD CONSTRAINT compras_itens_produto_fk FOREIGN KEY (produto_id) REFERENCES public.produtos(id);


--
-- TOC entry 4826 (class 2606 OID 18143)
-- Name: compras_itens compras_itens_updated_by_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.compras_itens
    ADD CONSTRAINT compras_itens_updated_by_fk FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- TOC entry 4822 (class 2606 OID 18106)
-- Name: compras compras_updated_by_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.compras
    ADD CONSTRAINT compras_updated_by_fk FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- TOC entry 4813 (class 2606 OID 16871)
-- Name: estoque_saldo estoque_saldo_produto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estoque_saldo
    ADD CONSTRAINT estoque_saldo_produto_id_fkey FOREIGN KEY (produto_id) REFERENCES public.produtos(id);


--
-- TOC entry 4830 (class 2606 OID 18614)
-- Name: estoque_ajustes_itens fk_ajuste; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estoque_ajustes_itens
    ADD CONSTRAINT fk_ajuste FOREIGN KEY (ajuste_id) REFERENCES public.estoque_ajustes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4829 (class 2606 OID 18597)
-- Name: estoque_ajustes fk_created_by; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estoque_ajustes
    ADD CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4831 (class 2606 OID 18619)
-- Name: estoque_ajustes_itens fk_created_by; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estoque_ajustes_itens
    ADD CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 4832 (class 2606 OID 18624)
-- Name: estoque_ajustes_itens fk_produto; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estoque_ajustes_itens
    ADD CONSTRAINT fk_produto FOREIGN KEY (produto_id) REFERENCES public.produtos(id);


--
-- TOC entry 4827 (class 2606 OID 18178)
-- Name: movimentacoes_estoque movimentacoes_estoque_produto_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.movimentacoes_estoque
    ADD CONSTRAINT movimentacoes_estoque_produto_fk FOREIGN KEY (produto_id) REFERENCES public.produtos(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4828 (class 2606 OID 18183)
-- Name: movimentacoes_estoque movimentacoes_estoque_usuario_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.movimentacoes_estoque
    ADD CONSTRAINT movimentacoes_estoque_usuario_fk FOREIGN KEY (usuario_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4812 (class 2606 OID 16649)
-- Name: refresh_tokens refresh_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 4814 (class 2606 OID 18045)
-- Name: vendas vendas_cliente_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendas
    ADD CONSTRAINT vendas_cliente_fk FOREIGN KEY (cliente_id) REFERENCES public.clientes(id);


--
-- TOC entry 4815 (class 2606 OID 18050)
-- Name: vendas vendas_created_by_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendas
    ADD CONSTRAINT vendas_created_by_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 4817 (class 2606 OID 18072)
-- Name: vendas_itens vendas_itens_created_by_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendas_itens
    ADD CONSTRAINT vendas_itens_created_by_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 4818 (class 2606 OID 18077)
-- Name: vendas_itens vendas_itens_produto_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendas_itens
    ADD CONSTRAINT vendas_itens_produto_fk FOREIGN KEY (produto_id) REFERENCES public.produtos(id);


--
-- TOC entry 4819 (class 2606 OID 18082)
-- Name: vendas_itens vendas_itens_updated_by_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendas_itens
    ADD CONSTRAINT vendas_itens_updated_by_fk FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- TOC entry 4816 (class 2606 OID 18055)
-- Name: vendas vendas_updated_by_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendas
    ADD CONSTRAINT vendas_updated_by_fk FOREIGN KEY (updated_by) REFERENCES public.users(id);


-- Completed on 2026-02-12 16:44:56

--
-- PostgreSQL database dump complete
--

