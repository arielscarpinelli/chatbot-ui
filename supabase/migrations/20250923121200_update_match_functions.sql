create or replace function match_file_items_local (
  query_embedding vector(384),
  match_count int DEFAULT null,
  file_ids UUID[] DEFAULT null,
  collection_ids UUID[] DEFAULT null
) returns table (
  id UUID,
  file_id UUID,
  content TEXT,
  tokens INT,
  similarity float
)
language plpgsql
as $$
#variable_conflict use_column
declare
  all_file_ids UUID[];
begin
  -- Get file_ids from collections
  if collection_ids is not null and array_length(collection_ids, 1) > 0 then
    select array_agg(cf.file_id) into all_file_ids from collection_files cf where cf.collection_id = any(collection_ids);
  end if;

  -- Combine with specific file_ids
  if file_ids is not null and array_length(file_ids, 1) > 0 then
    all_file_ids := all_file_ids || file_ids;
  end if;

  return query
  select
    id,
    file_id,
    content,
    tokens,
    1 - (file_items.local_embedding <=> query_embedding) as similarity
  from file_items
  where (file_id = any(all_file_ids))
  order by file_items.local_embedding <=> query_embedding
  limit match_count;
end;
$$;

create or replace function match_file_items_openai (
  query_embedding vector(1536),
  match_count int DEFAULT null,
  file_ids UUID[] DEFAULT null,
  collection_ids UUID[] DEFAULT null
) returns table (
  id UUID,
  file_id UUID,
  content TEXT,
  tokens INT,
  similarity float
)
language plpgsql
as $$
#variable_conflict use_column
declare
  all_file_ids UUID[];
begin
  -- Get file_ids from collections
  if collection_ids is not null and array_length(collection_ids, 1) > 0 then
    select array_agg(cf.file_id) into all_file_ids from collection_files cf where cf.collection_id = any(collection_ids);
  end if;

  -- Combine with specific file_ids
  if file_ids is not null and array_length(file_ids, 1) > 0 then
    all_file_ids := all_file_ids || file_ids;
  end if;

  return query
  select
    id,
    file_id,
    content,
    tokens,
    1 - (file_items.openai_embedding <=> query_embedding) as similarity
  from file_items
  where (file_id = any(all_file_ids))
  order by file_items.openai_embedding <=> query_embedding
  limit match_count;
end;
$$;
