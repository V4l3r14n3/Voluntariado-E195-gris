-- ============================================================================
-- Datos seed (dev/QA)
-- Solo entidades sin FK estricta a users (auth) — usuarios y certificados se
-- crean vía signup flow + UI. Para borrar todo: TRUNCATE ... CASCADE.
-- ============================================================================

INSERT INTO organizations (id, name, email, status, document_url, rejection_message, created_at) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Green Earth Foundation',     'org@greenearth.org',        'approved', NULL,               NULL,                                  '2024-01-15T00:00:00Z'),
    ('22222222-2222-2222-2222-222222222222', 'River Cleanup Initiative',   'contact@rivercleanup.org',  'pending',  'verification.pdf', NULL,                                  '2024-03-20T00:00:00Z'),
    ('33333333-3333-3333-3333-333333333333', 'Urban Garden Project',       'info@urbangarden.org',      'pending',  NULL,               NULL,                                  '2024-04-01T00:00:00Z'),
    ('44444444-4444-4444-4444-444444444444', 'Wildlife Preserve Society',  'hello@wildlife.org',        'rejected', NULL,               'Incomplete documentation provided.',  '2024-02-10T00:00:00Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO opportunities (id, title, description, event_date, event_time, city, location, organization_id, published) VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Beach Cleanup Drive',     'Help us clean the coastline and protect marine life. Gloves and bags provided.', '2024-05-15', '08:00', 'Santa Monica', 'Santa Monica Pier',           '11111111-1111-1111-1111-111111111111', true),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'Tree Planting Weekend',   'Join our tree planting initiative. We aim to plant 500 trees in the local park.', '2024-06-01', '09:00', 'Portland',     'Forest Park',                 '11111111-1111-1111-1111-111111111111', true),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', 'Community Garden Setup',  'Help set up raised beds and irrigation for the new community garden.',           '2024-05-20', '10:00', 'Austin',       'East Austin Community Center','11111111-1111-1111-1111-111111111111', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO blog_posts (id, title, content, author_id, organization_id, created_at) VALUES
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
     'The Impact of Volunteering on Communities',
     E'Volunteering has a profound impact on local communities. From environmental conservation to social welfare, volunteers drive meaningful change every day. Studies show that communities with active volunteer programs experience better outcomes in health, education, and environmental sustainability.\n\nOur organization has seen firsthand how dedicated volunteers transform neighborhoods. Last year alone, our volunteers planted over 2,000 trees, cleaned 15 miles of coastline, and mentored 200 youth in environmental science programs.',
     NULL, '11111111-1111-1111-1111-111111111111', '2024-03-15T00:00:00Z'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2',
     '5 Ways to Start Volunteering Today',
     E'Getting started with volunteering is easier than you think. Here are five simple ways to begin making a difference in your community:\n\n1. Sign up on our platform and browse available opportunities\n2. Start small — even a few hours a month can make a big impact\n3. Find causes that align with your passions and skills\n4. Invite friends and family to join you\n5. Track your progress and celebrate milestones',
     NULL, '11111111-1111-1111-1111-111111111111', '2024-04-02T00:00:00Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO forum_messages (id, title, message, author_id, author_role, organization_id, created_at) VALUES
    ('cccccccc-cccc-cccc-cccc-ccccccccccc1', 'Welcome to the Forum!',                  'This is the official forum for Green Earth Foundation. Share your thoughts and ideas here.',    NULL, 'organization', '11111111-1111-1111-1111-111111111111', '2024-04-01T10:00:00Z'),
    ('cccccccc-cccc-cccc-cccc-ccccccccccc2', 'Great experience at the beach cleanup!', 'Had an amazing time volunteering last weekend. The team was very organized and friendly.',     NULL, 'volunteer',    '11111111-1111-1111-1111-111111111111', '2024-04-05T14:30:00Z'),
    ('cccccccc-cccc-cccc-cccc-ccccccccccc3', 'Upcoming events announcement',           'We have exciting new opportunities coming up in May. Stay tuned for more details!',             NULL, 'organization', '11111111-1111-1111-1111-111111111111', '2024-04-08T09:15:00Z')
ON CONFLICT (id) DO NOTHING;
