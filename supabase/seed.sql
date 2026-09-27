-- ============================================================
-- CampusEvents — Seed Data
-- ============================================================
-- INSTRUCTIONS:
-- 1. First create your admin account by signing up through the app.
-- 2. In Supabase Dashboard > Authentication > Users, find your user and copy the UUID.
-- 3. In Supabase Dashboard > Table Editor > profiles, set that user's role to 'admin'.
-- 4. Replace EVERY occurrence of 'YOUR_ADMIN_UUID' below with that UUID.
-- 5. Run this SQL in Supabase SQL Editor.
--
-- Alternatively, use the "Seed Demo Data" button on the Admin Dashboard.
-- ============================================================

insert into events (title, description, date, location, capacity, category, image_url, tags, created_by) values
(
  'TechFest 2026',
  'The flagship technology festival featuring project exhibitions, tech talks by industry leaders, and hands-on workshops covering AI, blockchain, IoT, and cloud computing. Network with top tech companies and showcase your innovations.',
  '2026-10-15 09:00:00+05:30',
  'Main Auditorium & Tech Block',
  300,
  'Technology',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
  '{"tech", "festival", "exhibition", "innovation"}',
  'YOUR_ADMIN_UUID'
),
(
  'Inter-College Hackathon',
  'A 24-hour coding marathon where teams from colleges across the region compete to build innovative solutions. Prizes worth ₹2,00,000. Mentors from Google, Microsoft, and Amazon will be available for guidance.',
  '2026-10-22 08:00:00+05:30',
  'Computer Science Block, Lab 1-4',
  150,
  'Competition',
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80',
  '{"hackathon", "coding", "competition", "prizes"}',
  'YOUR_ADMIN_UUID'
),
(
  'Annual Cultural Night',
  'An evening of mesmerizing performances — classical and contemporary dance, live music, theatrical acts, stand-up comedy, and a fashion show. The most anticipated cultural event of the academic year.',
  '2026-11-01 17:00:00+05:30',
  'Open Air Theatre',
  500,
  'Cultural',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80',
  '{"cultural", "music", "dance", "performance"}',
  'YOUR_ADMIN_UUID'
),
(
  'Sports Meet 2026',
  'Two-day inter-departmental sports competition featuring cricket, football, basketball, badminton, athletics, and chess. Compete for the championship trophy and individual medals.',
  '2026-11-08 07:00:00+05:30',
  'Sports Complex & Grounds',
  400,
  'Sports',
  'https://images.unsplash.com/photo-1461896836934-bd45ba8b9e4c?w=800&q=80',
  '{"sports", "competition", "athletics", "team"}',
  'YOUR_ADMIN_UUID'
),
(
  'AI & Future Technology Workshop',
  'A full-day intensive workshop on artificial intelligence, machine learning, and generative AI. Hands-on sessions with Python, TensorFlow, and OpenAI APIs. Certificate of completion provided.',
  '2026-11-15 10:00:00+05:30',
  'Seminar Hall B',
  80,
  'Workshop',
  'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
  '{"AI", "workshop", "machine-learning", "hands-on"}',
  'YOUR_ADMIN_UUID'
),
(
  'Entrepreneurship Summit',
  'Hear from successful startup founders, VCs, and industry experts. Pitch your startup idea to a panel of investors. Workshops on business model canvas, fundraising, and go-to-market strategy.',
  '2026-11-22 09:30:00+05:30',
  'Business School Auditorium',
  200,
  'Business',
  'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&q=80',
  '{"entrepreneurship", "startup", "business", "networking"}',
  'YOUR_ADMIN_UUID'
),
(
  'Photography Competition',
  'Showcase your best photographs across themes: Street, Nature, Portrait, and Abstract. Judged by professional photographers. Top entries will be featured in the college magazine and annual calendar.',
  '2026-11-29 11:00:00+05:30',
  'Art Gallery, Block C',
  120,
  'Cultural',
  'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&q=80',
  '{"photography", "art", "competition", "creative"}',
  'YOUR_ADMIN_UUID'
),
(
  'Coding Championship',
  'Test your programming skills in this multi-round competitive programming contest. Problems ranging from easy to hard across data structures, algorithms, and mathematical reasoning. Individual participation only.',
  '2026-12-05 10:00:00+05:30',
  'Computer Lab 1 & 2',
  100,
  'Competition',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80',
  '{"coding", "competitive-programming", "algorithms", "contest"}',
  'YOUR_ADMIN_UUID'
),
(
  'Robotics Exhibition',
  'Two-day robotics expo featuring student-built robots, drone demonstrations, and a line-follower robot race. Interactive booths for hands-on experience with Arduino, Raspberry Pi, and 3D printing.',
  '2026-12-12 09:00:00+05:30',
  'Innovation Lab & Corridor',
  250,
  'Technology',
  'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80',
  '{"robotics", "technology", "exhibition", "innovation"}',
  'YOUR_ADMIN_UUID'
),
(
  'Startup Pitch Day',
  'Present your startup idea in a 5-minute pitch to a panel of angel investors and mentors. Get actionable feedback, potential funding, and incubation opportunities. Open to all students with a business idea.',
  '2026-12-19 14:00:00+05:30',
  'Entrepreneurship Cell, Room 201',
  60,
  'Business',
  'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&q=80',
  '{"startup", "pitch", "investors", "incubation"}',
  'YOUR_ADMIN_UUID'
);
