/**
 * Escrow Integration Service
 * Handles secure fund holding and release for business acquisition deals
 * Integrates with third-party escrow services for transaction security
 */

import { supabaseService } from '../../../shared/services/supabase/supabase.service.js';

class EscrowIntegrationService {
    constructor() {
        this.escrowProvider = 'escrow.com'; // Default provider
        this.apiBaseUrl = 'https://api.escrow.com/2017-09-01';
        this.escrowAccountsTable = 'escrow_accounts';
        this.escrowTransactionsTable = 'escrow_transactions';
        this.isInitialized = false;
        this.apiKey = null;
    }

    /**
     * Initialize escrow service
     */
    async initialize() {
        try {
            if (this.isInitialized) return { success: true };

            this.apiKey = await this.getEscrowApiKey();
            if (!this.apiKey) {
                throw new Error('Escrow API key not configured');
            }

            this.isInitialized = true;
            return { success: true };
        } catch (error) {
            console.error('Escrow initialization error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Create escrow account for a deal
     */
    async createEscrowAccount(dealId, dealData) {
        try {
            await this.ensureInitialized();

            const escrowData = {
                title: `Business Acquisition - ${dealData.listing_title}`,
                description: `Escrow account for business acquisition deal ${dealData.deal_number}`,
                currency: 'USD',
                items: [{
                    title: dealData.listing_title,
                    description: `Business acquisition: ${dealData.listing_title}`,
                    type: 'general_merchandise',
                    inspection_period: 14, // 14 days for due diligence
                    quantity: 1,
                    price: dealData.deal_amount
                }],
                parties: [
                    {
                        role: 'buyer',
                        customer: {
                            first_name: dealData.buyer.first_name,
                            last_name: dealData.buyer.last_name,
                            email: dealData.buyer.email,
                            phone: dealData.buyer.phone || ''
                        }
                    },
                    {
                        role: 'seller',
                        customer: {
                            first_name: dealData.seller.first_name,
                            last_name: dealData.seller.last_name,
                            email: dealData.seller.email,
                            phone: dealData.seller.phone || ''
                        }
                    }
                ],
                broker_commission: this.calculateBrokerCommission(dealData.deal_amount),
                metadata: {
                    deal_id: dealId,
                    platform: 'BuyMartV1',
                    deal_number: dealData.deal_number
                }
            };

            // Create escrow account via API
            const escrowResult = await this.callEscrowAPI('POST', '/transactions', escrowData);
            
            if (!escrowResult.success) {
                return escrowResult;
            }

            // Store escrow account locally
            const localAccountResult = await this.createLocalEscrowAccount({
                deal_id: dealId,
                escrow_transaction_id: escrowResult.data.id,
                escrow_provider: this.escrowProvider,
                status: escrowResult.data.status,
                amount: dealData.deal_amount,
                broker_commission: escrowData.broker_commission,
                created_at: new Date().toISOString()
            });

            return {
                success: true,
                data: {
                    escrow_id: escrowResult.data.id,
                    local_id: localAccountResult.data?.id,
                    status: escrowResult.data.status,
                    amount: dealData.deal_amount,
                    inspection_period: 14
                }
            };
        } catch (error) {
            console.error('Create escrow account error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Fund escrow account (buyer deposits funds)
     */
    async fundEscrowAccount(escrowId, paymentMethod) {
        try {
            await this.ensureInitialized();

            const fundingData = {
                payment_method: paymentMethod.type, // 'wire_transfer', 'ach', 'credit_card'
                payment_details: paymentMethod.details
            };

            const result = await this.callEscrowAPI('POST', `/transactions/${escrowId}/fund`, fundingData);
            
            if (result.success) {
                // Update local record
                await this.updateLocalEscrowAccount(escrowId, {
                    status: 'funded',
                    funded_at: new Date().toISOString()
                });

                // Log transaction
                await this.logEscrowTransaction(escrowId, 'funded', 'Escrow account funded by buyer', {
                    payment_method: paymentMethod.type
                });
            }

            return result;
        } catch (error) {
            console.error('Fund escrow error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Release funds to seller (after successful deal completion)
     */
    async releaseFunds(escrowId, releaseData) {
        try {
            await this.ensureInitialized();

            const releasePayload = {
                action: 'release',
                reason: releaseData.reason || 'Deal completed successfully',
                release_to: 'seller',
                amount: releaseData.amount,
                metadata: {
                    deal_completed_date: releaseData.completion_date,
                    release_authorized_by: releaseData.authorized_by
                }
            };

            const result = await this.callEscrowAPI('POST', `/transactions/${escrowId}/release`, releasePayload);
            
            if (result.success) {
                // Update local record
                await this.updateLocalEscrowAccount(escrowId, {
                    status: 'released',
                    released_at: new Date().toISOString(),
                    release_reason: releaseData.reason
                });

                // Log transaction
                await this.logEscrowTransaction(escrowId, 'released', 'Funds released to seller', {
                    amount: releaseData.amount,
                    reason: releaseData.reason
                });
            }

            return result;
        } catch (error) {
            console.error('Release funds error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Cancel escrow and return funds to buyer
     */
    async cancelEscrow(escrowId, cancellationData) {
        try {
            await this.ensureInitialized();

            const cancellationPayload = {
                action: 'cancel',
                reason: cancellationData.reason,
                return_to: 'buyer',
                metadata: {
                    cancellation_date: new Date().toISOString(),
                    cancelled_by: cancellationData.cancelled_by
                }
            };

            const result = await this.callEscrowAPI('POST', `/transactions/${escrowId}/cancel`, cancellationPayload);
            
            if (result.success) {
                // Update local record
                await this.updateLocalEscrowAccount(escrowId, {
                    status: 'cancelled',
                    cancelled_at: new Date().toISOString(),
                    cancellation_reason: cancellationData.reason
                });

                // Log transaction
                await this.logEscrowTransaction(escrowId, 'cancelled', 'Escrow cancelled, funds returned to buyer', {
                    reason: cancellationData.reason
                });
            }

            return result;
        } catch (error) {
            console.error('Cancel escrow error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get escrow account status
     */
    async getEscrowStatus(escrowId) {
        try {
            await this.ensureInitialized();

            const result = await this.callEscrowAPI('GET', `/transactions/${escrowId}`);
            
            if (result.success) {
                // Update local record with latest status
                await this.updateLocalEscrowAccount(escrowId, {
                    status: result.data.status,
                    updated_at: new Date().toISOString()
                });
            }

            return result;
        } catch (error) {
            console.error('Get escrow status error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get escrow account by deal ID
     */
    async getEscrowByDealId(dealId) {
        try {
            const result = await supabaseService.select(this.escrowAccountsTable, {
                eq: { deal_id: dealId },
                single: true
            });

            if (result.success && result.data) {
                // Get latest status from escrow provider
                const statusResult = await this.getEscrowStatus(result.data.escrow_transaction_id);
                if (statusResult.success) {
                    result.data.current_status = statusResult.data.status;
                    result.data.escrow_details = statusResult.data;
                }
            }

            return result;
        } catch (error) {
            console.error('Get escrow by deal ID error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Calculate broker commission (platform fee)
     */
    calculateBrokerCommission(dealAmount, commissionRate = 0.05) {
        const commission = dealAmount * commissionRate;
        const minimumCommission = 500; // $5 minimum
        const maximumCommission = 50000; // $500 maximum
        
        return Math.max(minimumCommission, Math.min(commission, maximumCommission));
    }

    /**
     * API communication methods
     */
    async callEscrowAPI(method, endpoint, data = null) {
        try {
            const url = `${this.apiBaseUrl}${endpoint}`;
            const options = {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                    'User-Agent': 'BuyMartV1/1.0'
                }
            };

            if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
                options.body = JSON.stringify(data);
            }

            const response = await fetch(url, options);
            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.message || `API call failed: ${response.status}`);
            }

            return { success: true, data: responseData };
        } catch (error) {
            console.error('Escrow API call error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Local database operations
     */
    async createLocalEscrowAccount(accountData) {
        try {
            return await supabaseService.insert(this.escrowAccountsTable, accountData);
        } catch (error) {
            console.error('Create local escrow account error:', error);
            return { success: false, error: error.message };
        }
    }

    async updateLocalEscrowAccount(escrowId, updateData) {
        try {
            return await supabaseService.update(this.escrowAccountsTable, updateData, {
                escrow_transaction_id: escrowId
            });
        } catch (error) {
            console.error('Update local escrow account error:', error);
            return { success: false, error: error.message };
        }
    }

    async logEscrowTransaction(escrowId, action, description, metadata = {}) {
        try {
            const transactionData = {
                escrow_transaction_id: escrowId,
                action: action,
                description: description,
                metadata: metadata,
                created_at: new Date().toISOString()
            };

            return await supabaseService.insert(this.escrowTransactionsTable, transactionData);
        } catch (error) {
            console.error('Log escrow transaction error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Utility methods
     */
    async ensureInitialized() {
        if (!this.isInitialized) {
            const result = await this.initialize();
            if (!result.success) {
                throw new Error('Failed to initialize escrow service');
            }
        }
    }

    async getEscrowApiKey() {
        // This would typically come from environment variables or secure config
        return process.env.ESCROW_API_KEY || 'your_escrow_api_key_here';
    }

    formatAmount(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    /**
     * Get supported payment methods for escrow funding
     */
    getSupportedPaymentMethods() {
        return [
            {
                type: 'wire_transfer',
                name: 'Wire Transfer',
                description: 'Bank wire transfer (1-2 business days)',
                fees: 'No additional fees'
            },
            {
                type: 'ach',
                name: 'ACH Transfer',
                description: 'Automated Clearing House (3-5 business days)',
                fees: 'Low fees'
            },
            {
                type: 'credit_card',
                name: 'Credit Card',
                description: 'Instant funding',
                fees: '2.9% + $0.30 per transaction'
            }
        ];
    }
}

// Export singleton instance
export const escrowIntegrationService = new EscrowIntegrationService();
