
-- Create a stored procedure to save client and anamnese data atomically
CREATE OR REPLACE FUNCTION public.salvar_ficha_anamnese(
  p_cliente jsonb,
  p_anamnese jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cliente_id uuid;
BEGIN
  -- Insert into clientes table
  INSERT INTO public.clientes (
    nome,
    data_nascimento,
    cpf,
    telefone,
    instagram
  )
  VALUES (
    p_cliente->>'nome',
    NULLIF(p_cliente->>'data_nascimento', '')::date,
    NULLIF(p_cliente->>'cpf', ''),
    p_cliente->>'telefone',
    NULLIF(p_cliente->>'instagram', '')
  )
  RETURNING id INTO v_cliente_id;

  -- Insert into anamneses table
  INSERT INTO public.anamneses (
    cliente_id,
    respostas,
    url_assinatura,
    termo_aceito,
    tem_risco
  )
  VALUES (
    v_cliente_id,
    p_anamnese->'respostas',
    p_anamnese->>'url_assinatura',
    (p_anamnese->>'termo_aceito')::boolean,
    (p_anamnese->>'tem_risco')::boolean
  );

  RETURN v_cliente_id;
END;
$$;
