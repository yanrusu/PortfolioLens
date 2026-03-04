--
-- PostgreSQL database dump
--

\restrict z9PLmIaCEZE8Jc9I00xfIYx6d6OSPcGebBYn8g9WAqbzkEdqxg4OTwZnjDe71qF

-- Dumped from database version 18.3 (Homebrew)
-- Dumped by pg_dump version 18.3 (Homebrew)

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

SET default_tablespace = '';

SET default_table_access_method = heap;

CREATE TABLE public.portfolio (
    asset character varying(20) NOT NULL,
    asset_type character varying(20) NOT NULL,
    quantity numeric(20,8) NOT NULL,
    avg_cost numeric(12,4) NOT NULL,
    total_cost numeric(14,4) NOT NULL,
    real_price numeric(12,4),
    CONSTRAINT portfolio_asset_type_check CHECK (((asset_type)::text = ANY (ARRAY['STOCK'::text, 'BOND'::text, 'CRYPTO'::text, 'CASH'::text]))),
    CONSTRAINT portfolio_avg_cost_check CHECK ((avg_cost >= (0)::numeric)),
    CONSTRAINT portfolio_quantity_check CHECK ((quantity >= (0)::numeric)),
    CONSTRAINT portfolio_total_cost_check CHECK ((total_cost >= (0)::numeric))
);


