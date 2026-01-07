-- Smart Reply feature tables
-- Conversations and messages for AI-generated reply assistance

-- Create conversations table
CREATE TABLE conversations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    message_type TEXT, -- 'rejection' | 'interview' | 'follow_up' | 'offer' | 'other'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create conversation_messages table
CREATE TABLE conversation_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL, -- 'pasted' | 'instruction' | 'assistant'
    content TEXT NOT NULL,
    credits_used DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add free_replies_used to profiles for tracking free tier usage
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS free_replies_used INTEGER DEFAULT 0;

-- Create indexes for better query performance
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_application_id ON conversations(application_id);
CREATE INDEX idx_conversations_created_at ON conversations(created_at DESC);
CREATE INDEX idx_conversation_messages_conversation_id ON conversation_messages(conversation_id);

-- Enable RLS on new tables
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;

-- Conversations policies
CREATE POLICY "Users can view own conversations"
    ON conversations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations"
    ON conversations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
    ON conversations FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
    ON conversations FOR DELETE
    USING (auth.uid() = user_id);

-- Conversation messages policies (via conversation ownership)
CREATE POLICY "Users can view messages in own conversations"
    ON conversation_messages FOR SELECT
    USING (
        conversation_id IN (
            SELECT id FROM conversations WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert messages in own conversations"
    ON conversation_messages FOR INSERT
    WITH CHECK (
        conversation_id IN (
            SELECT id FROM conversations WHERE user_id = auth.uid()
        )
    );

-- Apply updated_at trigger to conversations
CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
