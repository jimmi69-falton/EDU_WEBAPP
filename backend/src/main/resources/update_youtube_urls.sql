-- ============================================
-- UPDATE YOUTUBE URLs CHO CÁC WORKOUT TEMPLATES
-- Chạy script này để cập nhật youtube_url cho các workout templates hiện có
-- ============================================

UPDATE workout_sessions 
SET youtube_url = 'https://youtu.be/LwWEBTOMyRE?si=BJA4qC8Kiw08IHVC'
WHERE title = 'Cardio buổi sáng' AND is_template = true AND (youtube_url IS NULL OR youtube_url = '');

UPDATE workout_sessions 
SET youtube_url = 'https://www.youtube.com/watch?v=UBMk30rjy0o'
WHERE title = 'HIIT toàn thân' AND is_template = true AND (youtube_url IS NULL OR youtube_url = '');

UPDATE workout_sessions 
SET youtube_url = 'https://www.youtube.com/watch?v=v7AYKMP6rOE'
WHERE title = 'Yoga thư giãn' AND is_template = true AND (youtube_url IS NULL OR youtube_url = '');

UPDATE workout_sessions 
SET youtube_url = 'https://www.youtube.com/watch?v=IODxDxX7oi4'
WHERE title = 'Sức mạnh cơ bản' AND is_template = true AND (youtube_url IS NULL OR youtube_url = '');

UPDATE workout_sessions 
SET youtube_url = 'https://www.youtube.com/watch?v=g_tea8ZNk5A'
WHERE title = 'Stretching buổi tối' AND is_template = true AND (youtube_url IS NULL OR youtube_url = '');

UPDATE workout_sessions 
SET youtube_url = 'https://www.youtube.com/watch?v=LwWEBTOMyRE'
WHERE title = 'Cardio nâng cao' AND is_template = true AND (youtube_url IS NULL OR youtube_url = '');

-- Kiểm tra kết quả
SELECT id, title, youtube_url, is_template 
FROM workout_sessions 
WHERE is_template = true 
ORDER BY title;

