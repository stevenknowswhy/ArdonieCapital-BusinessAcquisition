-- Deployment Script for Closing Documents Management System
-- This script deploys the complete closing documents system to Supabase

-- Step 1: Create the schema
\i closing-documents-schema.sql

-- Step 2: Create storage buckets for document files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('deal-documents', 'deal-documents', false, 52428800, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'text/plain']),
    ('document-templates', 'document-templates', true, 52428800, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/html', 'text/plain'])
ON CONFLICT (id) DO NOTHING;

-- Step 3: Create storage policies for deal documents
DROP POLICY IF EXISTS "Deal participants can view documents" ON storage.objects;
CREATE POLICY "Deal participants can view documents" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'deal-documents' AND
        EXISTS (
            SELECT 1 FROM deals d
            JOIN deal_participants dp ON d.id = dp.deal_id
            WHERE (storage.foldername(name))[1] = d.id::text
            AND dp.user_id = auth.uid()
            AND dp.is_active = true
        )
    );

DROP POLICY IF EXISTS "Deal participants can upload documents" ON storage.objects;
CREATE POLICY "Deal participants can upload documents" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'deal-documents' AND
        EXISTS (
            SELECT 1 FROM deals d
            JOIN deal_participants dp ON d.id = dp.deal_id
            WHERE (storage.foldername(name))[1] = d.id::text
            AND dp.user_id = auth.uid()
            AND dp.is_active = true
            AND 'write' = ANY(dp.permissions)
        )
    );

DROP POLICY IF EXISTS "Deal participants can update documents" ON storage.objects;
CREATE POLICY "Deal participants can update documents" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'deal-documents' AND
        EXISTS (
            SELECT 1 FROM deals d
            JOIN deal_participants dp ON d.id = dp.deal_id
            WHERE (storage.foldername(name))[1] = d.id::text
            AND dp.user_id = auth.uid()
            AND dp.is_active = true
            AND 'write' = ANY(dp.permissions)
        )
    );

DROP POLICY IF EXISTS "Deal participants can delete documents" ON storage.objects;
CREATE POLICY "Deal participants can delete documents" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'deal-documents' AND
        EXISTS (
            SELECT 1 FROM deals d
            JOIN deal_participants dp ON d.id = dp.deal_id
            WHERE (storage.foldername(name))[1] = d.id::text
            AND dp.user_id = auth.uid()
            AND dp.is_active = true
            AND 'write' = ANY(dp.permissions)
        )
    );

-- Step 4: Create storage policies for document templates
DROP POLICY IF EXISTS "Anyone can view templates" ON storage.objects;
CREATE POLICY "Anyone can view templates" ON storage.objects
    FOR SELECT USING (bucket_id = 'document-templates');

DROP POLICY IF EXISTS "Admins can manage templates" ON storage.objects;
CREATE POLICY "Admins can manage templates" ON storage.objects
    FOR ALL USING (
        bucket_id = 'document-templates' AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Step 5: Create functions for document management

-- Function to calculate deal progress
CREATE OR REPLACE FUNCTION calculate_deal_progress(deal_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    total_required INTEGER;
    completed_required INTEGER;
    progress INTEGER;
BEGIN
    -- Count total required documents
    SELECT COUNT(*) INTO total_required
    FROM documents 
    WHERE deal_id = deal_uuid AND is_required = true;
    
    -- Count completed required documents
    SELECT COUNT(*) INTO completed_required
    FROM documents 
    WHERE deal_id = deal_uuid AND is_required = true AND status = 'completed';
    
    -- Calculate progress percentage
    IF total_required > 0 THEN
        progress := ROUND((completed_required::FLOAT / total_required::FLOAT) * 100);
    ELSE
        progress := 0;
    END IF;
    
    -- Update the deal progress
    UPDATE deals 
    SET progress_percentage = progress 
    WHERE id = deal_uuid;
    
    RETURN progress;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log document activity
CREATE OR REPLACE FUNCTION log_document_activity(
    p_deal_id UUID,
    p_document_id UUID,
    p_activity_type activity_type,
    p_title TEXT,
    p_description TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    activity_id UUID;
BEGIN
    INSERT INTO document_activities (
        deal_id,
        document_id,
        user_id,
        activity_type,
        title,
        description,
        metadata
    ) VALUES (
        p_deal_id,
        p_document_id,
        auth.uid(),
        p_activity_type,
        p_title,
        p_description,
        p_metadata
    ) RETURNING id INTO activity_id;
    
    RETURN activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update document status with activity logging
CREATE OR REPLACE FUNCTION update_document_status(
    p_document_id UUID,
    p_status document_status,
    p_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    doc_record RECORD;
    old_status document_status;
BEGIN
    -- Get current document info
    SELECT * INTO doc_record FROM documents WHERE id = p_document_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Document not found';
    END IF;
    
    old_status := doc_record.status;
    
    -- Update document status
    UPDATE documents 
    SET 
        status = p_status,
        reviewed_by = CASE WHEN p_status IN ('completed', 'approved') THEN auth.uid() ELSE reviewed_by END,
        approved_by = CASE WHEN p_status = 'completed' THEN auth.uid() ELSE approved_by END
    WHERE id = p_document_id;
    
    -- Log the activity
    PERFORM log_document_activity(
        doc_record.deal_id,
        p_document_id,
        'updated',
        'Document status updated',
        format('Status changed from %s to %s. %s', old_status, p_status, COALESCE(p_notes, '')),
        jsonb_build_object('old_status', old_status, 'new_status', p_status, 'notes', p_notes)
    );
    
    -- Recalculate deal progress
    PERFORM calculate_deal_progress(doc_record.deal_id);
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Create triggers for automatic activity logging

-- Trigger function for document changes
CREATE OR REPLACE FUNCTION trigger_document_activity()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM log_document_activity(
            NEW.deal_id,
            NEW.id,
            'created',
            'Document created',
            format('Document "%s" was created', NEW.name),
            jsonb_build_object('category', NEW.category, 'is_required', NEW.is_required)
        );
        
        -- Recalculate progress
        PERFORM calculate_deal_progress(NEW.deal_id);
        
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Only log if status changed
        IF OLD.status != NEW.status THEN
            PERFORM log_document_activity(
                NEW.deal_id,
                NEW.id,
                'updated',
                'Document status changed',
                format('Document "%s" status changed from %s to %s', NEW.name, OLD.status, NEW.status),
                jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status)
            );
            
            -- Recalculate progress
            PERFORM calculate_deal_progress(NEW.deal_id);
        END IF;
        
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS document_activity_trigger ON documents;
CREATE TRIGGER document_activity_trigger
    AFTER INSERT OR UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION trigger_document_activity();

-- Trigger function for deal changes
CREATE OR REPLACE FUNCTION trigger_deal_activity()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM log_document_activity(
            NEW.id,
            NULL,
            'created',
            'Deal created',
            format('New deal created for %s', NEW.business_name),
            jsonb_build_object('purchase_price', NEW.purchase_price, 'status', NEW.status)
        );
        
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Log status changes
        IF OLD.status != NEW.status THEN
            PERFORM log_document_activity(
                NEW.id,
                NULL,
                'updated',
                'Deal status changed',
                format('Deal status changed from %s to %s', OLD.status, NEW.status),
                jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status)
            );
        END IF;
        
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS deal_activity_trigger ON deals;
CREATE TRIGGER deal_activity_trigger
    AFTER INSERT OR UPDATE ON deals
    FOR EACH ROW
    EXECUTE FUNCTION trigger_deal_activity();

-- Step 7: Create views for easier data access

-- View for deal summary with document counts
CREATE OR REPLACE VIEW deal_summary AS
SELECT 
    d.*,
    buyer.first_name || ' ' || buyer.last_name AS buyer_name,
    seller.first_name || ' ' || seller.last_name AS seller_name,
    agent.first_name || ' ' || agent.last_name AS agent_name,
    COUNT(docs.id) AS total_documents,
    COUNT(docs.id) FILTER (WHERE docs.status = 'completed') AS completed_documents,
    COUNT(docs.id) FILTER (WHERE docs.status != 'completed') AS pending_documents,
    COUNT(docs.id) FILTER (WHERE docs.is_required = true) AS required_documents,
    COUNT(docs.id) FILTER (WHERE docs.is_required = true AND docs.status = 'completed') AS completed_required_documents
FROM deals d
LEFT JOIN profiles buyer ON d.buyer_id = buyer.id
LEFT JOIN profiles seller ON d.seller_id = seller.id
LEFT JOIN profiles agent ON d.agent_id = agent.id
LEFT JOIN documents docs ON d.id = docs.deal_id
GROUP BY d.id, buyer.first_name, buyer.last_name, seller.first_name, seller.last_name, agent.first_name, agent.last_name;

-- View for recent activities across all deals
CREATE OR REPLACE VIEW recent_activities AS
SELECT 
    da.*,
    d.business_name,
    d.deal_number,
    u.first_name || ' ' || u.last_name AS user_name,
    doc.name AS document_name
FROM document_activities da
JOIN deals d ON da.deal_id = d.id
LEFT JOIN profiles u ON da.user_id = u.id
LEFT JOIN documents doc ON da.document_id = doc.id
ORDER BY da.created_at DESC;

-- Step 8: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Step 9: Insert sample data
\i closing-documents-sample-data.sql

-- Step 10: Verification
SELECT 'Closing Documents System Deployment Complete' AS status;
SELECT 'Tables created:' AS info, COUNT(*) AS count 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('deals', 'documents', 'document_templates', 'document_activities', 'deal_participants', 'document_signatures');

SELECT 'Storage buckets created:' AS info, COUNT(*) AS count 
FROM storage.buckets 
WHERE id IN ('deal-documents', 'document-templates');

SELECT 'Functions created:' AS info, COUNT(*) AS count 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('calculate_deal_progress', 'log_document_activity', 'update_document_status');

SELECT 'Sample data loaded:' AS info, 
    (SELECT COUNT(*) FROM deals) AS deals,
    (SELECT COUNT(*) FROM document_templates) AS templates,
    (SELECT COUNT(*) FROM documents) AS documents,
    (SELECT COUNT(*) FROM document_activities) AS activities;
