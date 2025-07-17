/**
 * Supabase Integration for Closing Documents Management System
 * Provides real-time database connectivity and document management
 */

class SupabaseClosingDocsService {
    constructor() {
        this.supabase = null;
        this.isInitialized = false;
        this.subscriptions = new Map();
        this.currentUser = null;
        this.userProfile = null;
    }

    /**
     * Initialize Supabase client and authentication
     */
    async init() {
        try {
            console.log('🔄 Initializing Supabase Closing Documents Service...');
            
            // Initialize Supabase client
            if (window.supabase) {
                this.supabase = window.supabase;
            } else {
                // Import Supabase if not available globally
                const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
                this.supabase = createClient(
                    'https://pbydepsqcypwqbicnsco.supabase.co',
                    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieWRlcHNxY3lwd3FiaWNuc2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MjAxOTQsImV4cCI6MjA2NzQ5NjE5NH0.5aF46QcNOFN_vwXcHxCsVx_8a4EsqE1bL4fy4K7UXI0'
                );
            }

            // Get current user and profile
            await this.getCurrentUser();
            
            this.isInitialized = true;
            console.log('✅ Supabase Closing Documents Service initialized successfully');
            
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize Supabase Closing Documents Service:', error);
            throw error;
        }
    }

    /**
     * Get current authenticated user and profile
     */
    async getCurrentUser() {
        try {
            const { data: { user }, error } = await this.supabase.auth.getUser();
            
            if (error) throw error;
            
            this.currentUser = user;
            
            if (user) {
                // Get user profile
                const { data: profile, error: profileError } = await this.supabase
                    .from('profiles')
                    .select('*')
                    .eq('user_id', user.id)
                    .single();
                
                if (profileError) {
                    console.warn('Profile not found:', profileError);
                    this.userProfile = null;
                } else {
                    this.userProfile = profile;
                }
            }
            
            return { user: this.currentUser, profile: this.userProfile };
        } catch (error) {
            console.error('Error getting current user:', error);
            return { user: null, profile: null };
        }
    }

    /**
     * DEALS MANAGEMENT
     */

    /**
     * Get all deals for the current user
     */
    async getDeals(filters = {}) {
        try {
            if (!this.isInitialized) await this.init();
            
            let query = this.supabase
                .from('deals')
                .select(`
                    *,
                    buyer:buyer_id(id, first_name, last_name, company),
                    seller:seller_id(id, first_name, last_name, company),
                    agent:agent_id(id, first_name, last_name, company),
                    documents(id, status, category, is_required)
                `)
                .order('created_at', { ascending: false });

            // Apply filters
            if (filters.status) {
                query = query.eq('status', filters.status);
            }
            if (filters.priority) {
                query = query.eq('priority', filters.priority);
            }
            if (filters.search) {
                query = query.or(`business_name.ilike.%${filters.search}%,deal_number.ilike.%${filters.search}%`);
            }

            const { data, error } = await query;
            
            if (error) throw error;
            
            // Calculate document progress for each deal
            const dealsWithProgress = data.map(deal => {
                const totalDocs = deal.documents.length;
                const completedDocs = deal.documents.filter(doc => doc.status === 'completed').length;
                const progress = totalDocs > 0 ? Math.round((completedDocs / totalDocs) * 100) : 0;
                
                return {
                    ...deal,
                    documents: {
                        total: totalDocs,
                        completed: completedDocs,
                        pending: totalDocs - completedDocs
                    },
                    progress
                };
            });
            
            return dealsWithProgress;
        } catch (error) {
            console.error('Error fetching deals:', error);
            throw error;
        }
    }

    /**
     * Get a specific deal by ID
     */
    async getDeal(dealId) {
        try {
            if (!this.isInitialized) await this.init();
            
            const { data, error } = await this.supabase
                .from('deals')
                .select(`
                    *,
                    buyer:buyer_id(id, first_name, last_name, company, phone),
                    seller:seller_id(id, first_name, last_name, company, phone),
                    agent:agent_id(id, first_name, last_name, company, phone),
                    documents(*),
                    deal_participants(*, user:user_id(id, first_name, last_name, company))
                `)
                .eq('id', dealId)
                .single();
            
            if (error) throw error;
            
            return data;
        } catch (error) {
            console.error('Error fetching deal:', error);
            throw error;
        }
    }

    /**
     * Create a new deal
     */
    async createDeal(dealData) {
        try {
            if (!this.isInitialized) await this.init();
            
            const { data, error } = await this.supabase
                .from('deals')
                .insert([dealData])
                .select()
                .single();
            
            if (error) throw error;
            
            // Log activity
            await this.logActivity(data.id, null, 'created', 'Deal created', `New deal created: ${data.business_name}`);
            
            return data;
        } catch (error) {
            console.error('Error creating deal:', error);
            throw error;
        }
    }

    /**
     * Update deal
     */
    async updateDeal(dealId, updates) {
        try {
            if (!this.isInitialized) await this.init();
            
            const { data, error } = await this.supabase
                .from('deals')
                .update(updates)
                .eq('id', dealId)
                .select()
                .single();
            
            if (error) throw error;
            
            // Log activity
            await this.logActivity(dealId, null, 'updated', 'Deal updated', 'Deal information updated');
            
            return data;
        } catch (error) {
            console.error('Error updating deal:', error);
            throw error;
        }
    }

    /**
     * DOCUMENTS MANAGEMENT
     */

    /**
     * Get documents for a deal
     */
    async getDocuments(dealId, category = null) {
        try {
            if (!this.isInitialized) await this.init();
            
            let query = this.supabase
                .from('documents')
                .select(`
                    *,
                    uploaded_by_user:uploaded_by(id, first_name, last_name),
                    reviewed_by_user:reviewed_by(id, first_name, last_name),
                    approved_by_user:approved_by(id, first_name, last_name)
                `)
                .eq('deal_id', dealId)
                .order('created_at', { ascending: false });

            if (category) {
                query = query.eq('category', category);
            }

            const { data, error } = await query;
            
            if (error) throw error;
            
            return data;
        } catch (error) {
            console.error('Error fetching documents:', error);
            throw error;
        }
    }

    /**
     * Upload document
     */
    async uploadDocument(dealId, documentData, file = null) {
        try {
            if (!this.isInitialized) await this.init();
            
            let filePath = null;
            let fileSize = null;
            let fileType = null;
            
            // Upload file to Supabase Storage if provided
            if (file) {
                const fileName = `${dealId}/${Date.now()}_${file.name}`;
                const { data: uploadData, error: uploadError } = await this.supabase.storage
                    .from('deal-documents')
                    .upload(fileName, file);
                
                if (uploadError) throw uploadError;
                
                filePath = uploadData.path;
                fileSize = file.size;
                fileType = file.type;
            }
            
            // Create document record
            const { data, error } = await this.supabase
                .from('documents')
                .insert([{
                    ...documentData,
                    deal_id: dealId,
                    file_path: filePath,
                    file_size: fileSize,
                    file_type: fileType,
                    uploaded_by: this.currentUser?.id
                }])
                .select()
                .single();
            
            if (error) throw error;
            
            // Log activity
            await this.logActivity(dealId, data.id, 'uploaded', 'Document uploaded', `Document "${data.name}" uploaded`);
            
            return data;
        } catch (error) {
            console.error('Error uploading document:', error);
            throw error;
        }
    }

    /**
     * Update document status
     */
    async updateDocumentStatus(documentId, status, reviewerId = null) {
        try {
            if (!this.isInitialized) await this.init();
            
            const updates = { status };
            if (reviewerId) {
                updates.reviewed_by = reviewerId;
            }
            if (status === 'completed') {
                updates.approved_by = this.currentUser?.id;
            }
            
            const { data, error } = await this.supabase
                .from('documents')
                .update(updates)
                .eq('id', documentId)
                .select()
                .single();
            
            if (error) throw error;
            
            // Log activity
            await this.logActivity(data.deal_id, documentId, 'updated', 'Document status updated', `Document status changed to ${status}`);
            
            return data;
        } catch (error) {
            console.error('Error updating document status:', error);
            throw error;
        }
    }

    /**
     * Download document
     */
    async downloadDocument(documentId) {
        try {
            if (!this.isInitialized) await this.init();
            
            // Get document info
            const { data: document, error: docError } = await this.supabase
                .from('documents')
                .select('*')
                .eq('id', documentId)
                .single();
            
            if (docError) throw docError;
            
            if (!document.file_path) {
                throw new Error('No file associated with this document');
            }
            
            // Get signed URL for download
            const { data, error } = await this.supabase.storage
                .from('deal-documents')
                .createSignedUrl(document.file_path, 3600); // 1 hour expiry
            
            if (error) throw error;
            
            // Log activity
            await this.logActivity(document.deal_id, documentId, 'downloaded', 'Document downloaded', `Document "${document.name}" downloaded`);
            
            return {
                url: data.signedUrl,
                filename: document.name,
                type: document.file_type
            };
        } catch (error) {
            console.error('Error downloading document:', error);
            throw error;
        }
    }

    /**
     * DOCUMENT TEMPLATES MANAGEMENT
     */

    /**
     * Get document templates
     */
    async getTemplates(filters = {}) {
        try {
            if (!this.isInitialized) await this.init();
            
            let query = this.supabase
                .from('document_templates')
                .select(`
                    *,
                    author:author_id(id, first_name, last_name)
                `)
                .eq('is_active', true)
                .order('download_count', { ascending: false });

            // Apply filters
            if (filters.category) {
                query = query.eq('category', filters.category);
            }
            if (filters.type) {
                query = query.eq('type', filters.type);
            }
            if (filters.format) {
                query = query.eq('format', filters.format);
            }
            if (filters.search) {
                query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,tags.cs.{${filters.search}}`);
            }

            const { data, error } = await query;
            
            if (error) throw error;
            
            return data;
        } catch (error) {
            console.error('Error fetching templates:', error);
            throw error;
        }
    }

    /**
     * Download template
     */
    async downloadTemplate(templateId) {
        try {
            if (!this.isInitialized) await this.init();
            
            // Get template info
            const { data: template, error: templateError } = await this.supabase
                .from('document_templates')
                .select('*')
                .eq('id', templateId)
                .single();
            
            if (templateError) throw templateError;
            
            // Increment download count
            await this.supabase
                .from('document_templates')
                .update({ download_count: template.download_count + 1 })
                .eq('id', templateId);
            
            if (template.file_path) {
                // Get signed URL for download
                const { data, error } = await this.supabase.storage
                    .from('document-templates')
                    .createSignedUrl(template.file_path, 3600);
                
                if (error) throw error;
                
                return {
                    url: data.signedUrl,
                    filename: template.name,
                    type: template.format
                };
            } else {
                // Return template content for HTML templates
                return {
                    content: template.preview_content,
                    filename: template.name,
                    type: template.format
                };
            }
        } catch (error) {
            console.error('Error downloading template:', error);
            throw error;
        }
    }

    /**
     * ACTIVITY LOGGING
     */

    /**
     * Log activity
     */
    async logActivity(dealId, documentId, activityType, title, description, metadata = {}) {
        try {
            if (!this.isInitialized) await this.init();
            
            const { data, error } = await this.supabase
                .from('document_activities')
                .insert([{
                    deal_id: dealId,
                    document_id: documentId,
                    user_id: this.currentUser?.id,
                    activity_type: activityType,
                    title,
                    description,
                    metadata
                }])
                .select()
                .single();
            
            if (error) throw error;
            
            return data;
        } catch (error) {
            console.error('Error logging activity:', error);
            // Don't throw error for logging failures
        }
    }

    /**
     * Get activities for a deal
     */
    async getActivities(dealId, limit = 50) {
        try {
            if (!this.isInitialized) await this.init();
            
            const { data, error } = await this.supabase
                .from('document_activities')
                .select(`
                    *,
                    user:user_id(id, first_name, last_name),
                    document:document_id(id, name)
                `)
                .eq('deal_id', dealId)
                .order('created_at', { ascending: false })
                .limit(limit);
            
            if (error) throw error;
            
            return data;
        } catch (error) {
            console.error('Error fetching activities:', error);
            throw error;
        }
    }

    /**
     * REAL-TIME SUBSCRIPTIONS
     */

    /**
     * Subscribe to deal updates
     */
    subscribeToDeals(callback) {
        if (!this.isInitialized) {
            console.warn('Supabase not initialized for subscriptions');
            return null;
        }

        const subscription = this.supabase
            .channel('deals-changes')
            .on('postgres_changes', 
                { event: '*', schema: 'public', table: 'deals' },
                callback
            )
            .subscribe();

        this.subscriptions.set('deals', subscription);
        return subscription;
    }

    /**
     * Subscribe to document updates for a specific deal
     */
    subscribeToDocuments(dealId, callback) {
        if (!this.isInitialized) {
            console.warn('Supabase not initialized for subscriptions');
            return null;
        }

        const subscription = this.supabase
            .channel(`documents-${dealId}`)
            .on('postgres_changes', 
                { 
                    event: '*', 
                    schema: 'public', 
                    table: 'documents',
                    filter: `deal_id=eq.${dealId}`
                },
                callback
            )
            .subscribe();

        this.subscriptions.set(`documents-${dealId}`, subscription);
        return subscription;
    }

    /**
     * Subscribe to activities for a specific deal
     */
    subscribeToActivities(dealId, callback) {
        if (!this.isInitialized) {
            console.warn('Supabase not initialized for subscriptions');
            return null;
        }

        const subscription = this.supabase
            .channel(`activities-${dealId}`)
            .on('postgres_changes', 
                { 
                    event: 'INSERT', 
                    schema: 'public', 
                    table: 'document_activities',
                    filter: `deal_id=eq.${dealId}`
                },
                callback
            )
            .subscribe();

        this.subscriptions.set(`activities-${dealId}`, subscription);
        return subscription;
    }

    /**
     * Unsubscribe from all subscriptions
     */
    unsubscribeAll() {
        this.subscriptions.forEach((subscription, key) => {
            subscription.unsubscribe();
            console.log(`Unsubscribed from ${key}`);
        });
        this.subscriptions.clear();
    }

    /**
     * Cleanup
     */
    destroy() {
        this.unsubscribeAll();
        this.isInitialized = false;
        this.currentUser = null;
        this.userProfile = null;
    }
}

// Export singleton instance
window.supabaseClosingDocs = new SupabaseClosingDocsService();
