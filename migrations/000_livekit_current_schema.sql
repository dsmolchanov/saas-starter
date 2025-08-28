-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.agent_configs (
  user_id uuid NOT NULL,
  name text,
  description text,
  template_name text,
  version integer DEFAULT 1,
  config jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  is_template boolean NOT NULL DEFAULT false,
  is_public boolean NOT NULL DEFAULT false,
  tool_ids ARRAY NOT NULL DEFAULT '{}'::uuid[],
  allowed_providers ARRAY DEFAULT '{}'::text[],
  capabilities ARRAY,
  agent_id text NOT NULL,
  agent_type character varying DEFAULT 'orchestrator'::character varying,
  delegation_rules jsonb DEFAULT '[]'::jsonb,
  completion_behavior jsonb DEFAULT '{}'::jsonb,
  voice_settings jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT agent_configs_pkey PRIMARY KEY (agent_id),
  CONSTRAINT agent_configs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.agent_id_migration_mapping (
  old_uuid_id uuid,
  new_semantic_id text,
  created_at timestamp without time zone DEFAULT now()
);
CREATE TABLE public.ai_conversation_summary (
  conversation_id text NOT NULL,
  user_id uuid,
  started_at timestamp with time zone,
  ended_at timestamp with time zone,
  total_credits double precision,
  total_cost_usd double precision,
  llm_replicas integer,
  tts_calls integer,
  stt_calls integer,
  total_tokens integer,
  duration_audio double precision,
  transcript jsonb,
  agent_id text,
  CONSTRAINT ai_conversation_summary_pkey PRIMARY KEY (conversation_id)
);
CREATE TABLE public.ai_replica_usage (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  timestamp timestamp with time zone DEFAULT now(),
  conversation_id text,
  user_id uuid,
  usage_type text CHECK (usage_type = ANY (ARRAY['llm'::text, 'tts'::text, 'stt'::text, 'vad'::text, 'turn'::text, 'transcript_user'::text, 'transcript_agent'::text, 'orchestrator'::text, 'specialist'::text])),
  provider text,
  model text,
  latency_sec numeric,
  input_chars integer,
  input_audio_sec double precision,
  prompt_tokens integer,
  completion_tokens integer,
  total_tokens integer,
  cost_usd double precision,
  credits_charged double precision,
  status text DEFAULT 'success'::text,
  estimated_latency_sec numeric,
  participant_id text,
  transcript_text text,
  agent_id text,
  CONSTRAINT ai_replica_usage_pkey PRIMARY KEY (id)
);
CREATE TABLE public.billing_credits (
  user_id uuid NOT NULL,
  credits_balance double precision,
  last_updated timestamp with time zone,
  CONSTRAINT billing_credits_pkey PRIMARY KEY (user_id)
);
CREATE TABLE public.conversations (
  conversation_id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'active'::text,
  context jsonb NOT NULL DEFAULT '{}'::jsonb,
  metadata jsonb,
  etag integer NOT NULL DEFAULT 0,
  CONSTRAINT conversations_pkey PRIMARY KEY (conversation_id)
);
CREATE TABLE public.credit_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  timestamp timestamp with time zone DEFAULT now(),
  delta double precision,
  source text,
  related_usage_id uuid,
  CONSTRAINT credit_transactions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.handoff_logs (
  id integer NOT NULL DEFAULT nextval('handoff_logs_id_seq'::regclass),
  conversation_id text NOT NULL,
  from_agent_id text NOT NULL,
  to_agent_id text NOT NULL,
  intent text,
  rule_matched text,
  context_summary text,
  timestamp timestamp with time zone DEFAULT now(),
  status character varying DEFAULT 'success'::character varying,
  CONSTRAINT handoff_logs_pkey PRIMARY KEY (id)
);
CREATE TABLE public.iso_languages (
  code text NOT NULL,
  name text NOT NULL,
  CONSTRAINT iso_languages_pkey PRIMARY KEY (code)
);
CREATE TABLE public.mcp_tool_audit_log (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  provider text NOT NULL,
  tool_name text NOT NULL,
  parameters jsonb,
  result_summary text,
  error text,
  duration_ms integer,
  created_at timestamp with time zone DEFAULT now(),
  agent_id text NOT NULL,
  CONSTRAINT mcp_tool_audit_log_pkey PRIMARY KEY (id)
);
CREATE TABLE public.model_guidelines (
  provider text NOT NULL,
  models ARRAY NOT NULL CHECK (array_length(models, 1) > 0),
  modality text NOT NULL,
  guideline_type text NOT NULL CHECK (guideline_type = ANY (ARRAY['prompting'::text, 'ssml'::text, 'rate_limit'::text, 'usage'::text, 'examples'::text])),
  version text,
  content_md text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT model_guidelines_pkey PRIMARY KEY (provider, modality, guideline_type)
);
CREATE TABLE public.model_parameters (
  provider text NOT NULL,
  models ARRAY NOT NULL CHECK (array_length(models, 1) > 0),
  modality text NOT NULL,
  param_name text NOT NULL,
  param_type text NOT NULL,
  is_required boolean NOT NULL DEFAULT false,
  nested boolean NOT NULL DEFAULT false,
  specs jsonb,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT model_parameters_pkey PRIMARY KEY (provider, modality, param_name)
);
CREATE TABLE public.model_params (
  provider text NOT NULL,
  modality text NOT NULL DEFAULT 'tts'::text,
  params jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT model_params_pkey PRIMARY KEY (provider, modality)
);
CREATE TABLE public.model_performance (
  provider text NOT NULL,
  model text NOT NULL,
  input_tps double precision,
  output_tps double precision,
  avg_latency_empirical numeric,
  updated_at timestamp with time zone DEFAULT now(),
  sample_count bigint DEFAULT 0,
  avg_latency_emp double precision,
  p95_latency_emp double precision,
  CONSTRAINT model_performance_pkey PRIMARY KEY (provider, model),
  CONSTRAINT model_performance_fk FOREIGN KEY (model) REFERENCES public.models(model),
  CONSTRAINT model_performance_fk FOREIGN KEY (provider) REFERENCES public.models(model),
  CONSTRAINT model_performance_fk FOREIGN KEY (model) REFERENCES public.models(provider),
  CONSTRAINT model_performance_fk FOREIGN KEY (provider) REFERENCES public.models(provider)
);
CREATE TABLE public.model_pricing (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  model text NOT NULL,
  input_unit text NOT NULL CHECK (input_unit = ANY (ARRAY['tokens'::text, 'chars'::text, 'seconds'::text, 'minutes'::text])),
  output_unit text CHECK (output_unit = ANY (ARRAY['tokens'::text, 'chars'::text, 'seconds'::text, 'minutes'::text])),
  input_price_per_million numeric,
  output_price_per_million numeric,
  internal_credit_per_million numeric,
  currency text DEFAULT 'USD'::text,
  is_active boolean DEFAULT true,
  effective_from timestamp with time zone DEFAULT now(),
  notes text,
  CONSTRAINT model_pricing_pkey PRIMARY KEY (id),
  CONSTRAINT model_pricing_fk FOREIGN KEY (model) REFERENCES public.models(model),
  CONSTRAINT model_pricing_fk FOREIGN KEY (provider) REFERENCES public.models(provider),
  CONSTRAINT model_pricing_fk FOREIGN KEY (model) REFERENCES public.models(provider),
  CONSTRAINT model_pricing_fk FOREIGN KEY (provider) REFERENCES public.models(model)
);
CREATE TABLE public.models (
  provider text NOT NULL,
  model text NOT NULL,
  modality text NOT NULL CHECK (modality = ANY (ARRAY['stt'::text, 'llm'::text, 'vad'::text, 'tts'::text, 'realtime'::text])),
  languages ARRAY,
  version text,
  tier text DEFAULT 'prod'::text CHECK (tier = ANY (ARRAY['prod'::text, 'beta'::text, 'deprecated'::text])),
  specs jsonb,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  default_cfg jsonb NOT NULL DEFAULT '{}'::jsonb,
  editable_meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  display_name text,
  CONSTRAINT models_pkey PRIMARY KEY (provider, model)
);
CREATE TABLE public.oauth_states (
  state text NOT NULL,
  user_id uuid NOT NULL,
  provider text NOT NULL,
  redirect_uri text NOT NULL,
  scopes ARRAY,
  created_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone DEFAULT (now() + '00:10:00'::interval),
  CONSTRAINT oauth_states_pkey PRIMARY KEY (state)
);
CREATE TABLE public.platform_metrics (
  id integer NOT NULL DEFAULT nextval('platform_metrics_id_seq'::regclass),
  conversation_id text NOT NULL,
  agent_id text NOT NULL,
  agent_type character varying NOT NULL,
  platform_config text,
  metric_type character varying NOT NULL,
  metric_data jsonb DEFAULT '{}'::jsonb,
  timestamp timestamp with time zone DEFAULT now(),
  status character varying DEFAULT 'success'::character varying,
  CONSTRAINT platform_metrics_pkey PRIMARY KEY (id)
);
CREATE TABLE public.tasks (
  task_id uuid NOT NULL DEFAULT gen_random_uuid(),
  conversation_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  task_type text NOT NULL,
  assigned_agent text,
  status USER-DEFINED NOT NULL DEFAULT 'open'::task_status,
  payload jsonb,
  result jsonb,
  metadata jsonb,
  CONSTRAINT tasks_pkey PRIMARY KEY (task_id),
  CONSTRAINT tasks_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(conversation_id)
);
CREATE TABLE public.tools (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  params_json_schema jsonb NOT NULL DEFAULT '{}'::jsonb,
  type text NOT NULL CHECK (type = ANY (ARRAY['system'::text, 'mcp'::text, 'custom'::text, 'agent'::text])),
  mcp_server_url text,
  code_url text,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  agent_id text,
  CONSTRAINT tools_pkey PRIMARY KEY (id),
  CONSTRAINT tools_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public.agent_configs(agent_id)
);
CREATE TABLE public.tts_model_defaults (
  provider text NOT NULL,
  modality text NOT NULL DEFAULT 'tts'::text,
  model_name text NOT NULL,
  default_cfg jsonb NOT NULL,
  editable_meta jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tts_model_defaults_pkey PRIMARY KEY (provider, modality, model_name)
);
CREATE TABLE public.tts_model_languages (
  model_id text NOT NULL,
  language_id text NOT NULL,
  language_name text,
  CONSTRAINT tts_model_languages_pkey PRIMARY KEY (model_id, language_id),
  CONSTRAINT tts_model_languages_model_id_fkey FOREIGN KEY (model_id) REFERENCES public.tts_models(model_id)
);
CREATE TABLE public.tts_model_rates (
  model_id text NOT NULL UNIQUE,
  character_cost_multiplier numeric,
  CONSTRAINT tts_model_rates_pkey PRIMARY KEY (model_id),
  CONSTRAINT tts_model_rates_model_id_fkey FOREIGN KEY (model_id) REFERENCES public.tts_models(model_id)
);
CREATE TABLE public.tts_models (
  model_id text NOT NULL UNIQUE,
  name text,
  can_be_finetuned boolean,
  can_do_text_to_speech boolean,
  can_do_voice_conversion boolean,
  can_use_style boolean,
  can_use_speaker_boost boolean,
  serves_pro_voices boolean,
  token_cost_factor numeric,
  description text,
  requires_alpha_access boolean,
  max_characters_request_free_user integer,
  max_characters_request_subscribed_user integer,
  maximum_text_length_per_request integer,
  concurrency_group text,
  CONSTRAINT tts_models_pkey PRIMARY KEY (model_id)
);
CREATE TABLE public.user_oauth_tokens (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  provider text NOT NULL,
  email text NOT NULL,
  access_token_encrypted text,
  refresh_token_encrypted text,
  expires_at timestamp with time zone,
  scopes ARRAY,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  last_used_at timestamp with time zone,
  CONSTRAINT user_oauth_tokens_pkey PRIMARY KEY (id)
);
CREATE TABLE public.users (
  id uuid NOT NULL,
  email character varying NOT NULL UNIQUE,
  name character varying,
  organization_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  avatar_url text,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);
CREATE TABLE public.voices (
  provider text NOT NULL,
  voice_id text NOT NULL,
  models ARRAY NOT NULL,
  language text,
  gender text NOT NULL DEFAULT 'unknown'::text CHECK (gender = ANY (ARRAY['male'::text, 'female'::text, 'neutral'::text, 'unknown'::text])),
  style_tags ARRAY,
  sample_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  content_hash character varying,
  name text,
  description text,
  CONSTRAINT voices_pkey PRIMARY KEY (provider, voice_id)
);