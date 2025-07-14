-- CHAT SYSTEM DATABASE SCHEMA FOR BUYMART V1
-- Implements comprehensive chat functionality with real-time features
-- Project: pbydepsqcypwqbicnsco
-- Generated: 2025-07-12

-- ============================================================================
-- PART 1: CREATE CHAT TABLES
-- ============================================================================

-- Chat Conversations Table
CREATE TABLE IF NOT EXISTS chat_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255),
    conversation_type VARCHAR(50) DEFAULT 'direct', -- 'direct', 'group', 'support'
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    message_content TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text', -- 'text', 'image', 'file', 'system'
    reply_to_id UUID REFERENCES chat_messages(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_edited BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Chat Participants Table
CREATE TABLE IF NOT EXISTS chat_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'participant', -- 'participant', 'admin', 'moderator'
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_read_message_id UUID REFERENCES chat_messages(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    notification_settings JSONB DEFAULT '{"enabled": true, "sound": true}'::jsonb,
    
    UNIQUE(conversation_id, user_id)
);

-- Chat Message Read Status Table
CREATE TABLE IF NOT EXISTS chat_message_reads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(message_id, user_id)
);

-- ============================================================================
-- PART 2: CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Conversation indexes
CREATE INDEX IF NOT EXISTS idx_chat_conversations_created_by ON chat_conversations(created_by);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_updated_at ON chat_conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_active ON chat_conversations(is_active) WHERE is_active = true;

-- Message indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_created ON chat_messages(conversation_id, created_at DESC);

-- Participant indexes
CREATE INDEX IF NOT EXISTS idx_chat_participants_user_id ON chat_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_conversation_id ON chat_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_active ON chat_participants(user_id, is_active) WHERE is_active = true;

-- Read status indexes
CREATE INDEX IF NOT EXISTS idx_chat_message_reads_message_id ON chat_message_reads(message_id);
CREATE INDEX IF NOT EXISTS idx_chat_message_reads_user_id ON chat_message_reads(user_id);

-- ============================================================================
-- PART 3: CREATE TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================================================

-- Update conversation last_message_at when new message is added
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE chat_conversations 
    SET 
        last_message_at = NEW.created_at,
        updated_at = NEW.created_at
    WHERE id = NEW.conversation_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for message updates
DROP TRIGGER IF EXISTS trigger_update_conversation_last_message ON chat_messages;
CREATE TRIGGER trigger_update_conversation_last_message
    AFTER INSERT ON chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_last_message();

-- Update participant last_read_at when they read messages
CREATE OR REPLACE FUNCTION update_participant_last_read()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE chat_participants 
    SET 
        last_read_at = NEW.read_at,
        last_read_message_id = NEW.message_id
    WHERE conversation_id = (
        SELECT conversation_id FROM chat_messages WHERE id = NEW.message_id
    ) AND user_id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for read status updates
DROP TRIGGER IF EXISTS trigger_update_participant_last_read ON chat_message_reads;
CREATE TRIGGER trigger_update_participant_last_read
    AFTER INSERT ON chat_message_reads
    FOR EACH ROW
    EXECUTE FUNCTION update_participant_last_read();

-- ============================================================================
-- PART 4: ENABLE ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all chat tables
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_message_reads ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PART 5: CREATE RLS POLICIES
-- ============================================================================

-- Chat Conversations Policies
DROP POLICY IF EXISTS "chat_conversations_participant_access" ON chat_conversations;
CREATE POLICY "chat_conversations_participant_access" ON chat_conversations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM chat_participants cp
            WHERE cp.conversation_id = id
            AND cp.user_id = auth.uid()
            AND cp.is_active = true
        )
    );

-- Chat Messages Policies
DROP POLICY IF EXISTS "chat_messages_participant_access" ON chat_messages;
CREATE POLICY "chat_messages_participant_access" ON chat_messages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM chat_participants cp
            WHERE cp.conversation_id = chat_messages.conversation_id
            AND cp.user_id = auth.uid()
            AND cp.is_active = true
        )
    );

-- Chat Participants Policies
DROP POLICY IF EXISTS "chat_participants_own_access" ON chat_participants;
CREATE POLICY "chat_participants_own_access" ON chat_participants
    FOR ALL USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM chat_participants cp
            WHERE cp.conversation_id = chat_participants.conversation_id
            AND cp.user_id = auth.uid()
            AND cp.is_active = true
        )
    );

-- Chat Message Reads Policies
DROP POLICY IF EXISTS "chat_message_reads_own_access" ON chat_message_reads;
CREATE POLICY "chat_message_reads_own_access" ON chat_message_reads
    FOR ALL USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM chat_participants cp
            JOIN chat_messages cm ON cm.conversation_id = cp.conversation_id
            WHERE cm.id = chat_message_reads.message_id
            AND cp.user_id = auth.uid()
            AND cp.is_active = true
        )
    );

-- ============================================================================
-- PART 6: CREATE HELPER FUNCTIONS
-- ============================================================================

-- Function to get unread message count for a user
CREATE OR REPLACE FUNCTION get_unread_chat_count(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    unread_count INTEGER;
BEGIN
    SELECT COUNT(DISTINCT cm.id) INTO unread_count
    FROM chat_messages cm
    JOIN chat_participants cp ON cp.conversation_id = cm.conversation_id
    LEFT JOIN chat_message_reads cmr ON cmr.message_id = cm.id AND cmr.user_id = user_uuid
    WHERE cp.user_id = user_uuid
    AND cp.is_active = true
    AND cm.sender_id != user_uuid
    AND cmr.id IS NULL;
    
    RETURN COALESCE(unread_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to create a direct conversation between two users
CREATE OR REPLACE FUNCTION create_direct_conversation(user1_uuid UUID, user2_uuid UUID)
RETURNS UUID AS $$
DECLARE
    conversation_uuid UUID;
    existing_conversation UUID;
BEGIN
    -- Check if conversation already exists
    SELECT cc.id INTO existing_conversation
    FROM chat_conversations cc
    JOIN chat_participants cp1 ON cp1.conversation_id = cc.id AND cp1.user_id = user1_uuid
    JOIN chat_participants cp2 ON cp2.conversation_id = cc.id AND cp2.user_id = user2_uuid
    WHERE cc.conversation_type = 'direct'
    AND cp1.is_active = true
    AND cp2.is_active = true;
    
    IF existing_conversation IS NOT NULL THEN
        RETURN existing_conversation;
    END IF;
    
    -- Create new conversation
    INSERT INTO chat_conversations (conversation_type, created_by)
    VALUES ('direct', user1_uuid)
    RETURNING id INTO conversation_uuid;
    
    -- Add participants
    INSERT INTO chat_participants (conversation_id, user_id, role)
    VALUES 
        (conversation_uuid, user1_uuid, 'participant'),
        (conversation_uuid, user2_uuid, 'participant');
    
    RETURN conversation_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to mark messages as read
CREATE OR REPLACE FUNCTION mark_messages_as_read(conversation_uuid UUID, user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    marked_count INTEGER;
BEGIN
    -- Insert read records for unread messages
    INSERT INTO chat_message_reads (message_id, user_id)
    SELECT cm.id, user_uuid
    FROM chat_messages cm
    LEFT JOIN chat_message_reads cmr ON cmr.message_id = cm.id AND cmr.user_id = user_uuid
    WHERE cm.conversation_id = conversation_uuid
    AND cm.sender_id != user_uuid
    AND cmr.id IS NULL;
    
    GET DIAGNOSTICS marked_count = ROW_COUNT;
    
    RETURN marked_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- PART 7: MIGRATE EXISTING MESSAGES TO CHAT SYSTEM
-- ============================================================================

-- Function to migrate existing messages to chat system
CREATE OR REPLACE FUNCTION migrate_messages_to_chat()
RETURNS TEXT AS $$
DECLARE
    migration_count INTEGER := 0;
    msg_record RECORD;
    conversation_uuid UUID;
BEGIN
    -- Migrate existing messages from the messages table
    FOR msg_record IN 
        SELECT DISTINCT 
            sender_id, 
            recipient_id,
            MIN(created_at) as first_message_at
        FROM messages 
        GROUP BY sender_id, recipient_id
    LOOP
        -- Create or get conversation
        SELECT create_direct_conversation(msg_record.sender_id, msg_record.recipient_id) 
        INTO conversation_uuid;
        
        -- Migrate messages for this conversation
        INSERT INTO chat_messages (conversation_id, sender_id, message_content, created_at)
        SELECT 
            conversation_uuid,
            sender_id,
            COALESCE(subject || ': ' || content, content),
            created_at
        FROM messages
        WHERE (sender_id = msg_record.sender_id AND recipient_id = msg_record.recipient_id)
           OR (sender_id = msg_record.recipient_id AND recipient_id = msg_record.sender_id);
        
        migration_count := migration_count + 1;
    END LOOP;
    
    RETURN 'Migrated ' || migration_count || ' conversations to chat system';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify chat tables are created
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name LIKE 'chat_%'
ORDER BY table_name;

-- Verify RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = t.tablename) as policy_count
FROM pg_tables t
WHERE schemaname = 'public' 
AND tablename LIKE 'chat_%'
ORDER BY tablename;

SELECT '🔥 Chat system database schema created successfully!' as result;
SELECT 'Ready for real-time messaging with proper RLS security' as status;
