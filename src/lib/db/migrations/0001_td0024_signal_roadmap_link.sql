-- TD-0024: Link signal to roadmap item
-- Adds promotedRoadmapItemId FK to signals table

ALTER TABLE signals
  ADD COLUMN IF NOT EXISTS promoted_roadmap_item_id UUID
    REFERENCES roadmap_items(id) ON DELETE SET NULL;
