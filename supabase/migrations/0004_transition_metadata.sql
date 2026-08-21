-- Extends transition_quote_status to accept an optional metadata payload,
-- used by the public quote-response endpoint to record approval
-- acknowledgement (customer name, IP, user agent) without a second write.
-- Superseding a function with the same name+arg-count requires a drop first
-- since a new optional trailing arg still changes the signature acceptably
-- via CREATE OR REPLACE, but we do it explicitly for clarity.

drop function if exists transition_quote_status(
  uuid, quote_status, actor_type, text, text, quote_event_type
);

create or replace function transition_quote_status(
  p_quote_id uuid,
  p_new_status quote_status,
  p_actor_type actor_type,
  p_actor_label text,
  p_message text,
  p_event_type quote_event_type,
  p_metadata jsonb default '{}'
)
returns quotes
language plpgsql
security invoker
as $$
declare
  v_quote quotes;
  v_valid boolean;
begin
  select * into v_quote from quotes where id = p_quote_id;
  if v_quote.id is null then
    raise exception 'Quote not found or not accessible';
  end if;

  v_valid := case v_quote.status
    when 'DRAFT' then p_new_status in ('SENT')
    when 'SENT' then p_new_status in ('VIEWED', 'APPROVED', 'REJECTED', 'CHANGE_REQUESTED', 'EXPIRED')
    when 'VIEWED' then p_new_status in ('APPROVED', 'REJECTED', 'CHANGE_REQUESTED', 'EXPIRED')
    when 'CHANGE_REQUESTED' then p_new_status in ('SENT')
    when 'APPROVED' then p_new_status in ('CONVERTED')
    else false
  end;

  if not v_valid then
    raise exception 'Invalid status transition: % -> %', v_quote.status, p_new_status;
  end if;

  update quotes set status = p_new_status where id = p_quote_id
  returning * into v_quote;

  insert into quote_events (quote_id, type, actor_type, actor_label, message, metadata)
  values (p_quote_id, p_event_type, p_actor_type, p_actor_label, p_message, p_metadata);

  return v_quote;
end;
$$;

grant execute on function transition_quote_status(
  uuid, quote_status, actor_type, text, text, quote_event_type, jsonb
) to authenticated;

-- The public quote-response Netlify Function calls this via the
-- service-role client (which bypasses RLS entirely), so no grant to the
-- anon role is needed or added — customers never get a Supabase session.
