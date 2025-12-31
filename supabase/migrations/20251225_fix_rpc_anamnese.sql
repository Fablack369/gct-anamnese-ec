
-- Drop the function first to ensure clean state if parameters changed
DROP FUNCTION IF EXISTS public.salvar_ficha_anamnese(jsonb, jsonb);

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
  v_cpf text;
BEGIN
  -- Extract CPF for checks
  v_cpf := NULLIF(p_cliente->>'cpf', '');

  -- Try to find existing client by CPF if CPF is provided
  IF v_cpf IS NOT NULL THEN
    SELECT id INTO v_cliente_id
    FROM public.clientes
    WHERE cpf = v_cpf
    LIMIT 1;
  END IF;

  -- If client exists, update their info
  IF v_cliente_id IS NOT NULL THEN
    UPDATE public.clientes
    SET
      nome = p_cliente->>'nome',
      data_nascimento = NULLIF(p_cliente->>'data_nascimento', '')::date,
      telefone = p_cliente->>'telefone',
      instagram = NULLIF(p_cliente->>'instagram', '')
    WHERE id = v_cliente_id;
  ELSE
    -- If not exists (or no CPF), insert new client
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
      v_cpf,
      p_cliente->>'telefone',
      NULLIF(p_cliente->>'instagram', '')
    )
    RETURNING id INTO v_cliente_id;
  END IF;

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

-- Grant permissions (Crucial step that was missing or implicit)
GRANT EXECUTE ON FUNCTION public.salvar_ficha_anamnese(jsonb, jsonb) TO anon;
GRANT EXECUTE ON FUNCTION public.salvar_ficha_anamnese(jsonb, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.salvar_ficha_anamnese(jsonb, jsonb) TO service_role;
