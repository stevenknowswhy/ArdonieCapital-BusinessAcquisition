/**
 * Document Management Service
 * Handles document upload, organization, and access control for deals
 * Supports due diligence document management and secure file sharing
 */

import { supabaseService } from '../../../shared/services/supabase/supabase.service.js';

class DocumentManagementService {
    constructor() {
        this.documentsTable = 'deal_documents';
        this.activitiesTable = 'deal_activities';
        this.allowedFileTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'image/jpeg',
            'image/png',
            'image/gif',
            'text/plain'
        ];
        this.maxFileSize = 10 * 1024 * 1024; // 10MB
    }

    /**
     * Upload document to deal
     */
    async uploadDocument(dealId, file, documentData) {
        try {
            // Validate file
            const validation = this.validateFile(file);
            if (!validation.valid) {
                return { success: false, error: validation.error };
            }

            // Get current user
            const user = await supabaseService.getCurrentUser();
            if (!user) {
                return { success: false, error: 'User not authenticated' };
            }

            const userProfile = await supabaseService.select('profiles', {
                eq: { user_id: user.id },
                single: true
            });

            if (!userProfile.success) {
                return { success: false, error: 'User profile not found' };
            }

            // Generate unique file path
            const fileExtension = file.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExtension}`;
            const filePath = `deals/${dealId}/documents/${fileName}`;

            // Upload file to Supabase Storage
            const uploadResult = await supabaseService.uploadFile('deal-documents', filePath, file);
            
            if (!uploadResult.success) {
                return uploadResult;
            }

            // Create document record
            const documentRecord = {
                deal_id: dealId,
                uploaded_by: userProfile.data.id,
                document_type: documentData.document_type || 'other',
                title: documentData.title || file.name,
                description: documentData.description || '',
                file_name: file.name,
                file_path: filePath,
                file_size: file.size,
                mime_type: file.type,
                is_confidential: documentData.is_confidential || false,
                visible_to: documentData.visible_to || ['buyer', 'seller']
            };

            const result = await supabaseService.insert(this.documentsTable, documentRecord);

            if (result.success) {
                // Log document upload activity
                await this.logDocumentActivity(dealId, 'document_uploaded', `Document uploaded: ${file.name}`, {
                    document_id: result.data.id,
                    document_type: documentRecord.document_type,
                    file_size: file.size
                });

                // Get full document data with uploader info
                return await this.getDocumentById(result.data.id);
            }

            return result;
        } catch (error) {
            console.error('Upload document error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get document by ID
     */
    async getDocumentById(documentId) {
        try {
            return await supabaseService.select(this.documentsTable, {
                select: `
                    *,
                    uploader:profiles!uploaded_by (
                        id, first_name, last_name, company
                    )
                `,
                eq: { id: documentId },
                single: true
            });
        } catch (error) {
            console.error('Get document error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get all documents for a deal
     */
    async getDealDocuments(dealId, documentType = null) {
        try {
            let query = {
                select: `
                    *,
                    uploader:profiles!uploaded_by (
                        id, first_name, last_name, company
                    )
                `,
                eq: { deal_id: dealId },
                order: { column: 'uploaded_at', ascending: false }
            };

            if (documentType) {
                query.eq.document_type = documentType;
            }

            return await supabaseService.select(this.documentsTable, query);
        } catch (error) {
            console.error('Get deal documents error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get documents organized by type
     */
    async getDealDocumentsByType(dealId) {
        try {
            const result = await this.getDealDocuments(dealId);
            
            if (!result.success) {
                return result;
            }

            // Group documents by type
            const documentsByType = result.data.reduce((acc, doc) => {
                const type = doc.document_type;
                if (!acc[type]) {
                    acc[type] = [];
                }
                acc[type].push(doc);
                return acc;
            }, {});

            return {
                success: true,
                data: {
                    all_documents: result.data,
                    by_type: documentsByType,
                    total_count: result.data.length,
                    type_counts: Object.keys(documentsByType).reduce((acc, type) => {
                        acc[type] = documentsByType[type].length;
                        return acc;
                    }, {})
                }
            };
        } catch (error) {
            console.error('Get documents by type error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Download document
     */
    async downloadDocument(documentId) {
        try {
            // Get document record
            const documentResult = await this.getDocumentById(documentId);
            
            if (!documentResult.success) {
                return documentResult;
            }

            const document = documentResult.data;

            // Get download URL from Supabase Storage
            const downloadResult = await supabaseService.getFileUrl('deal-documents', document.file_path);
            
            if (downloadResult.success) {
                // Log document access
                await this.logDocumentActivity(
                    document.deal_id,
                    'document_accessed',
                    `Document accessed: ${document.title}`,
                    { document_id: documentId }
                );
            }

            return downloadResult;
        } catch (error) {
            console.error('Download document error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Update document metadata
     */
    async updateDocument(documentId, updateData) {
        try {
            const allowedFields = [
                'title', 'description', 'document_type', 
                'is_confidential', 'visible_to'
            ];

            const filteredData = Object.keys(updateData)
                .filter(key => allowedFields.includes(key))
                .reduce((obj, key) => {
                    obj[key] = updateData[key];
                    return obj;
                }, {});

            filteredData.updated_at = new Date().toISOString();

            const result = await supabaseService.update(this.documentsTable, filteredData, { id: documentId });

            if (result.success) {
                // Get document to log activity
                const documentResult = await this.getDocumentById(documentId);
                if (documentResult.success) {
                    await this.logDocumentActivity(
                        documentResult.data.deal_id,
                        'document_updated',
                        `Document updated: ${documentResult.data.title}`,
                        { document_id: documentId, changes: Object.keys(filteredData) }
                    );
                }
            }

            return result;
        } catch (error) {
            console.error('Update document error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Delete document
     */
    async deleteDocument(documentId) {
        try {
            // Get document record first
            const documentResult = await this.getDocumentById(documentId);
            
            if (!documentResult.success) {
                return documentResult;
            }

            const document = documentResult.data;

            // Delete file from storage
            const deleteFileResult = await supabaseService.deleteFile('deal-documents', document.file_path);
            
            // Delete database record (even if file deletion fails)
            const deleteRecordResult = await supabaseService.delete(this.documentsTable, { id: documentId });

            if (deleteRecordResult.success) {
                // Log document deletion
                await this.logDocumentActivity(
                    document.deal_id,
                    'document_deleted',
                    `Document deleted: ${document.title}`,
                    { document_id: documentId, file_name: document.file_name }
                );
            }

            return {
                success: deleteRecordResult.success,
                data: {
                    record_deleted: deleteRecordResult.success,
                    file_deleted: deleteFileResult.success
                },
                error: deleteRecordResult.error
            };
        } catch (error) {
            console.error('Delete document error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Validate file before upload
     */
    validateFile(file) {
        // Check file size
        if (file.size > this.maxFileSize) {
            return {
                valid: false,
                error: `File size exceeds maximum limit of ${this.maxFileSize / (1024 * 1024)}MB`
            };
        }

        // Check file type
        if (!this.allowedFileTypes.includes(file.type)) {
            return {
                valid: false,
                error: 'File type not allowed. Please upload PDF, Word, Excel, or image files.'
            };
        }

        // Check file name
        if (!file.name || file.name.length > 255) {
            return {
                valid: false,
                error: 'Invalid file name'
            };
        }

        return { valid: true };
    }

    /**
     * Get document type requirements for deal stage
     */
    getRequiredDocuments(dealStatus) {
        const requirements = {
            'initial_interest': [],
            'nda_signed': ['nda'],
            'due_diligence': [
                'financial_statement',
                'tax_return',
                'lease_agreement'
            ],
            'negotiation': [
                'financial_statement',
                'tax_return',
                'due_diligence_report'
            ],
            'financing': [
                'financial_statement',
                'tax_return',
                'purchase_agreement'
            ],
            'legal_review': [
                'purchase_agreement',
                'legal_document'
            ],
            'closing': [
                'purchase_agreement',
                'legal_document',
                'inspection_report'
            ]
        };

        return requirements[dealStatus] || [];
    }

    /**
     * Check document completeness for deal stage
     */
    async checkDocumentCompleteness(dealId, dealStatus) {
        try {
            const requiredDocs = this.getRequiredDocuments(dealStatus);
            const documentsResult = await this.getDealDocumentsByType(dealId);

            if (!documentsResult.success) {
                return documentsResult;
            }

            const { by_type } = documentsResult.data;
            const missingDocuments = requiredDocs.filter(type => !by_type[type] || by_type[type].length === 0);
            const completionPercentage = requiredDocs.length > 0 ? 
                Math.round(((requiredDocs.length - missingDocuments.length) / requiredDocs.length) * 100) : 100;

            return {
                success: true,
                data: {
                    required_documents: requiredDocs,
                    missing_documents: missingDocuments,
                    completion_percentage: completionPercentage,
                    is_complete: missingDocuments.length === 0
                }
            };
        } catch (error) {
            console.error('Check document completeness error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Log document-related activity
     */
    async logDocumentActivity(dealId, activityType, title, metadata = {}) {
        try {
            const user = await supabaseService.getCurrentUser();
            const userProfile = user ? await supabaseService.select('profiles', {
                eq: { user_id: user.id },
                single: true
            }) : null;

            const activityData = {
                deal_id: dealId,
                user_id: userProfile?.success ? userProfile.data.id : null,
                activity_type: activityType,
                title: title,
                metadata: metadata
            };

            return await supabaseService.insert(this.activitiesTable, activityData);
        } catch (error) {
            console.error('Log document activity error:', error);
            return { success: false, error: error.message };
        }
    }
}

// Export singleton instance
export const documentManagementService = new DocumentManagementService();
