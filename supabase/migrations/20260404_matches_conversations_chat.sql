-- ============================================================
-- conversations: created when either party approves a match
-- ============================================================
create table if not exists public.conversations (
  id           uuid primary key default gen_random_uuid(),
  musician_id  uuid not null references auth.users(id) on delete cascade,
  venue_id     uuid not null references auth.users(id) on delete cascade,
  created_at   timestamptz not null default now(),
  unique(musician_id, venue_id)
);

alter table public.conversations enable row level security;

create policy "Participants can view conversations"
  on public.conversations for select
  using (auth.uid() = musician_id or auth.uid() = venue_id);

create policy "Participants can create conversations"
  on public.conversations for insert
  with check (auth.uid() = musician_id or auth.uid() = venue_id);

-- ============================================================
-- chat_messages: real-time messages within a conversation
-- ============================================================
create table if not exists public.chat_messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id       uuid not null references auth.users(id) on delete cascade,
  content         text not null,
  created_at      timestamptz not null default now()
);

alter table public.chat_messages enable row level security;

create policy "Participants can view messages"
  on public.chat_messages for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.musician_id = auth.uid() or c.venue_id = auth.uid())
    )
  );

create policy "Participants can send messages"
  on public.chat_messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.musician_id = auth.uid() or c.venue_id = auth.uid())
    )
  );

-- Enable Realtime for chat_messages
alter publication supabase_realtime add table public.chat_messages;
alter publication supabase_realtime add table public.conversations;
