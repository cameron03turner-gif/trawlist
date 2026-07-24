-- m18_clean_video_titles.sql
-- Clean up any video titles in the database that were saved with unread notification badge prefixes (e.g. '(9) Title')

UPDATE videos
SET title = regexp_replace(title, '^\(\d+\+?\)\s*', '')
WHERE title ~ '^\(\d+\+?\)';
