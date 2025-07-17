-- =============================================================================
-- JOB MANAGEMENT SYSTEM - SAMPLE DATA
-- =============================================================================
-- Sample data for testing the job management system
-- Includes job postings, applications, interviews, and analytics
-- =============================================================================

-- =============================================================================
-- SAMPLE JOB POSTINGS
-- =============================================================================

-- Insert sample job postings
INSERT INTO job_postings (
    title,
    slug,
    department,
    location,
    job_type,
    description,
    requirements,
    benefits,
    responsibilities,
    qualifications,
    salary_min,
    salary_max,
    status,
    is_featured,
    is_remote,
    posted_date,
    application_deadline,
    positions_available,
    hiring_manager_id,
    created_by
) VALUES 
-- Business Development Manager
(
    'Business Development Manager',
    'business-development-manager',
    'Sales',
    'Dallas, TX',
    'full_time',
    'We are seeking an experienced Business Development Manager to drive growth and expand our market presence in the Dallas-Fort Worth area. You will be responsible for identifying new business opportunities, building strategic partnerships, and developing relationships with auto repair shop owners.',
    ARRAY[
        'Bachelor''s degree in Business, Marketing, or related field',
        '5+ years of business development experience',
        'Experience in automotive or related industry preferred',
        'Strong negotiation and communication skills',
        'Proven track record of meeting sales targets'
    ],
    ARRAY[
        'Competitive salary with performance bonuses',
        'Health, dental, and vision insurance',
        '401(k) with company matching',
        'Flexible work arrangements',
        'Professional development opportunities'
    ],
    ARRAY[
        'Identify and pursue new business opportunities',
        'Build and maintain relationships with key stakeholders',
        'Develop strategic partnerships with auto repair shops',
        'Create and execute business development strategies',
        'Collaborate with marketing team on lead generation'
    ],
    ARRAY[
        'Excellent communication and presentation skills',
        'Strong analytical and problem-solving abilities',
        'Self-motivated with ability to work independently',
        'Proficiency in CRM software and Microsoft Office',
        'Valid driver''s license and reliable transportation'
    ],
    70000.00,
    90000.00,
    'active',
    true,
    false,
    NOW() - INTERVAL '5 days',
    NOW() + INTERVAL '25 days',
    1,
    (SELECT id FROM profiles LIMIT 1),
    (SELECT id FROM profiles LIMIT 1)
),

-- Financial Analyst
(
    'Financial Analyst',
    'financial-analyst',
    'Finance',
    'Remote',
    'full_time',
    'Join our finance team as a Financial Analyst to support our growing business acquisition platform. You will analyze financial data, prepare reports, and provide insights to support strategic decision-making.',
    ARRAY[
        'Bachelor''s degree in Finance, Accounting, or Economics',
        '3+ years of financial analysis experience',
        'Strong Excel and financial modeling skills',
        'Experience with financial software and databases',
        'CPA or CFA certification preferred'
    ],
    ARRAY[
        'Competitive salary',
        'Remote work flexibility',
        'Health and wellness benefits',
        '401(k) retirement plan',
        'Professional certification support'
    ],
    ARRAY[
        'Perform financial analysis and modeling',
        'Prepare monthly and quarterly financial reports',
        'Support budgeting and forecasting processes',
        'Analyze business acquisition opportunities',
        'Assist with due diligence processes'
    ],
    ARRAY[
        'Strong analytical and quantitative skills',
        'Attention to detail and accuracy',
        'Excellent written and verbal communication',
        'Ability to work with large datasets',
        'Knowledge of GAAP and financial regulations'
    ],
    60000.00,
    80000.00,
    'active',
    false,
    true,
    NOW() - INTERVAL '3 days',
    NOW() + INTERVAL '27 days',
    1,
    (SELECT id FROM profiles LIMIT 1),
    (SELECT id FROM profiles LIMIT 1)
),

-- Marketing Specialist
(
    'Marketing Specialist',
    'marketing-specialist',
    'Marketing',
    'Plano, TX',
    'full_time',
    'We are looking for a creative Marketing Specialist to develop and execute marketing campaigns that drive brand awareness and lead generation for our business acquisition platform.',
    ARRAY[
        'Bachelor''s degree in Marketing, Communications, or related field',
        '2+ years of digital marketing experience',
        'Experience with marketing automation tools',
        'Knowledge of SEO/SEM best practices',
        'Social media marketing experience'
    ],
    ARRAY[
        'Competitive salary',
        'Health insurance coverage',
        'Paid time off and holidays',
        'Marketing conference attendance',
        'Creative work environment'
    ],
    ARRAY[
        'Develop and execute digital marketing campaigns',
        'Manage social media presence and content',
        'Create marketing materials and collateral',
        'Analyze campaign performance and ROI',
        'Collaborate with sales team on lead nurturing'
    ],
    ARRAY[
        'Creative thinking and problem-solving skills',
        'Proficiency in Adobe Creative Suite',
        'Experience with Google Analytics and Ads',
        'Strong project management abilities',
        'Excellent written communication skills'
    ],
    50000.00,
    65000.00,
    'active',
    false,
    false,
    NOW() - INTERVAL '7 days',
    NOW() + INTERVAL '23 days',
    1,
    (SELECT id FROM profiles LIMIT 1),
    (SELECT id FROM profiles LIMIT 1)
),

-- Transaction Coordinator
(
    'Transaction Coordinator',
    'transaction-coordinator',
    'Operations',
    'Dallas, TX',
    'full_time',
    'Support our business acquisition process as a Transaction Coordinator. You will manage deal workflows, coordinate with stakeholders, and ensure smooth transaction processes.',
    ARRAY[
        'High school diploma or equivalent required',
        '2+ years of administrative or coordination experience',
        'Experience in real estate or business transactions preferred',
        'Strong organizational and multitasking skills',
        'Proficiency in Microsoft Office and project management tools'
    ],
    ARRAY[
        'Competitive hourly wage',
        'Health and dental insurance',
        'Paid vacation and sick leave',
        'Training and development opportunities',
        'Supportive team environment'
    ],
    ARRAY[
        'Coordinate transaction timelines and milestones',
        'Communicate with buyers, sellers, and service providers',
        'Maintain transaction files and documentation',
        'Schedule appointments and meetings',
        'Assist with due diligence processes'
    ],
    ARRAY[
        'Excellent organizational and time management skills',
        'Strong attention to detail',
        'Professional communication abilities',
        'Ability to work under pressure and meet deadlines',
        'Customer service orientation'
    ],
    45000.00,
    60000.00,
    'active',
    false,
    false,
    NOW() - INTERVAL '2 days',
    NOW() + INTERVAL '28 days',
    2,
    (SELECT id FROM profiles LIMIT 1),
    (SELECT id FROM profiles LIMIT 1)
),

-- Senior Software Developer
(
    'Senior Software Developer',
    'senior-software-developer',
    'Technology',
    'Dallas, TX',
    'full_time',
    'Join our technology team as a Senior Software Developer to build and enhance our business acquisition platform. You will work with modern technologies to create scalable solutions.',
    ARRAY[
        'Bachelor''s degree in Computer Science or related field',
        '5+ years of software development experience',
        'Proficiency in JavaScript, React, and Node.js',
        'Experience with cloud platforms (AWS, Azure, or GCP)',
        'Knowledge of database design and optimization'
    ],
    ARRAY[
        'Competitive salary and equity options',
        'Comprehensive health benefits',
        'Flexible work arrangements',
        'Professional development budget',
        'Latest technology and equipment'
    ],
    ARRAY[
        'Design and develop web applications',
        'Collaborate with product and design teams',
        'Write clean, maintainable, and testable code',
        'Participate in code reviews and technical discussions',
        'Mentor junior developers'
    ],
    ARRAY[
        'Strong problem-solving and analytical skills',
        'Experience with agile development methodologies',
        'Knowledge of software testing best practices',
        'Excellent communication and teamwork abilities',
        'Passion for learning new technologies'
    ],
    90000.00,
    120000.00,
    'active',
    true,
    false,
    NOW() - INTERVAL '1 day',
    NOW() + INTERVAL '29 days',
    1,
    (SELECT id FROM profiles LIMIT 1),
    (SELECT id FROM profiles LIMIT 1)
);

-- =============================================================================
-- SAMPLE JOB APPLICATIONS
-- =============================================================================

-- Insert sample applications for the jobs
INSERT INTO job_applications (
    job_id,
    first_name,
    last_name,
    email,
    phone,
    cover_letter,
    years_experience,
    expected_salary,
    status,
    application_source,
    submitted_at
) VALUES 
-- Applications for Business Development Manager
(
    (SELECT id FROM job_postings WHERE slug = 'business-development-manager'),
    'John',
    'Smith',
    'john.smith@email.com',
    '(555) 123-4567',
    'I am excited to apply for the Business Development Manager position. With over 6 years of experience in business development and a proven track record in the automotive industry, I believe I would be a valuable addition to your team.',
    6,
    85000.00,
    'reviewing',
    'website',
    NOW() - INTERVAL '2 days'
),
(
    (SELECT id FROM job_postings WHERE slug = 'business-development-manager'),
    'Sarah',
    'Johnson',
    'sarah.johnson@email.com',
    '(555) 234-5678',
    'I am writing to express my interest in the Business Development Manager role. My background in sales and relationship building aligns perfectly with your requirements.',
    4,
    75000.00,
    'pending',
    'linkedin',
    NOW() - INTERVAL '1 day'
),

-- Applications for Financial Analyst
(
    (SELECT id FROM job_postings WHERE slug = 'financial-analyst'),
    'Michael',
    'Davis',
    'michael.davis@email.com',
    '(555) 345-6789',
    'As a CPA with 5 years of financial analysis experience, I am excited about the opportunity to contribute to your finance team and support your business acquisition platform.',
    5,
    70000.00,
    'interview_scheduled',
    'website',
    NOW() - INTERVAL '3 days'
),

-- Applications for Marketing Specialist
(
    (SELECT id FROM job_postings WHERE slug = 'marketing-specialist'),
    'Emily',
    'Wilson',
    'emily.wilson@email.com',
    '(555) 456-7890',
    'I am passionate about digital marketing and would love to bring my creative skills and experience to help grow your brand awareness and lead generation efforts.',
    3,
    58000.00,
    'pending',
    'website',
    NOW() - INTERVAL '1 day'
),

-- Applications for Transaction Coordinator
(
    (SELECT id FROM job_postings WHERE slug = 'transaction-coordinator'),
    'David',
    'Brown',
    'david.brown@email.com',
    '(555) 567-8901',
    'With my background in real estate transaction coordination, I am well-prepared to support your business acquisition processes and ensure smooth transactions.',
    3,
    52000.00,
    'reviewing',
    'referral',
    NOW() - INTERVAL '2 days'
),

-- Applications for Senior Software Developer
(
    (SELECT id FROM job_postings WHERE slug = 'senior-software-developer'),
    'Jennifer',
    'Garcia',
    'jennifer.garcia@email.com',
    '(555) 678-9012',
    'I am a senior full-stack developer with 7 years of experience building scalable web applications. I am excited about the opportunity to contribute to your technology team.',
    7,
    105000.00,
    'interview_completed',
    'website',
    NOW() - INTERVAL '4 days'
),
(
    (SELECT id FROM job_postings WHERE slug = 'senior-software-developer'),
    'Robert',
    'Martinez',
    'robert.martinez@email.com',
    '(555) 789-0123',
    'As a passionate software developer with expertise in React and Node.js, I would love to help build and enhance your business acquisition platform.',
    5,
    95000.00,
    'pending',
    'linkedin',
    NOW() - INTERVAL '1 day'
);

-- =============================================================================
-- SAMPLE INTERVIEWS
-- =============================================================================

-- Insert sample interviews
INSERT INTO job_interviews (
    application_id,
    job_id,
    interview_type,
    title,
    description,
    scheduled_date,
    duration_minutes,
    status,
    overall_rating,
    technical_rating,
    communication_rating,
    cultural_fit_rating,
    interviewer_notes,
    recommendation
) VALUES 
-- Interview for Michael Davis (Financial Analyst)
(
    (SELECT id FROM job_applications WHERE email = 'michael.davis@email.com'),
    (SELECT id FROM job_postings WHERE slug = 'financial-analyst'),
    'video_interview',
    'Initial Interview - Financial Analyst',
    'First round interview to assess candidate fit and experience',
    NOW() + INTERVAL '2 days',
    60,
    'scheduled',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
),

-- Completed interview for Jennifer Garcia (Senior Software Developer)
(
    (SELECT id FROM job_applications WHERE email = 'jennifer.garcia@email.com'),
    (SELECT id FROM job_postings WHERE slug = 'senior-software-developer'),
    'technical_assessment',
    'Technical Interview - Senior Developer',
    'Technical assessment and coding interview',
    NOW() - INTERVAL '1 day',
    90,
    'completed',
    4,
    5,
    4,
    4,
    'Strong technical skills, excellent problem-solving approach. Good communication during technical discussion. Would be a great addition to the team.',
    'hire'
);

-- =============================================================================
-- SAMPLE ANALYTICS DATA
-- =============================================================================

-- Insert sample analytics data for the past week
INSERT INTO job_analytics (
    job_id,
    analytics_date,
    page_views,
    unique_views,
    applications_received,
    applications_qualified,
    source_breakdown
) VALUES 
-- Business Development Manager analytics
(
    (SELECT id FROM job_postings WHERE slug = 'business-development-manager'),
    CURRENT_DATE - INTERVAL '1 day',
    45,
    38,
    2,
    1,
    '{"website": 1, "linkedin": 1}'::jsonb
),
(
    (SELECT id FROM job_postings WHERE slug = 'business-development-manager'),
    CURRENT_DATE - INTERVAL '2 days',
    52,
    41,
    1,
    1,
    '{"website": 1}'::jsonb
),

-- Financial Analyst analytics
(
    (SELECT id FROM job_postings WHERE slug = 'financial-analyst'),
    CURRENT_DATE - INTERVAL '1 day',
    38,
    32,
    0,
    0,
    '{}'::jsonb
),
(
    (SELECT id FROM job_postings WHERE slug = 'financial-analyst'),
    CURRENT_DATE - INTERVAL '3 days',
    41,
    35,
    1,
    1,
    '{"website": 1}'::jsonb
),

-- Senior Software Developer analytics
(
    (SELECT id FROM job_postings WHERE slug = 'senior-software-developer'),
    CURRENT_DATE - INTERVAL '1 day',
    67,
    58,
    1,
    1,
    '{"linkedin": 1}'::jsonb
),
(
    (SELECT id FROM job_postings WHERE slug = 'senior-software-developer'),
    CURRENT_DATE - INTERVAL '4 days',
    73,
    61,
    1,
    1,
    '{"website": 1}'::jsonb
);

-- =============================================================================
-- UPDATE APPLICATION COUNTS
-- =============================================================================

-- Update application counts on job postings (in case triggers didn't fire)
UPDATE job_postings 
SET application_count = (
    SELECT COUNT(*) 
    FROM job_applications 
    WHERE job_applications.job_id = job_postings.id
);

-- =============================================================================
-- DEPLOYMENT VERIFICATION
-- =============================================================================

-- Verify sample data insertion
DO $$
DECLARE
    job_count INTEGER;
    application_count INTEGER;
    interview_count INTEGER;
    analytics_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO job_count FROM job_postings;
    SELECT COUNT(*) INTO application_count FROM job_applications;
    SELECT COUNT(*) INTO interview_count FROM job_interviews;
    SELECT COUNT(*) INTO analytics_count FROM job_analytics;
    
    RAISE NOTICE 'Job Management System sample data inserted successfully!';
    RAISE NOTICE 'Job postings: %', job_count;
    RAISE NOTICE 'Applications: %', application_count;
    RAISE NOTICE 'Interviews: %', interview_count;
    RAISE NOTICE 'Analytics records: %', analytics_count;
    RAISE NOTICE 'Sample data is ready for testing!';
END $$;
