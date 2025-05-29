import { syncModel } from './localDatabase';
import { SyncDirection } from './prismaClients';

// List of all models that need to be synchronized
const MODELS_TO_SYNC = [
  'User',
  'Organization',
  'Subscription',
  'SubscriptionPlan',
  'Payment',
  'Post',
  'Comment',
  'Attachment'
];

/**
 * Synchronize all models between local and remote databases
 * @param direction Direction of synchronization (default: bidirectional)
 */
export async function syncAllModels(direction: SyncDirection = SyncDirection.BIDIRECTIONAL): Promise<{
  success: boolean;
  results: Record<string, any>;
  errors: Record<string, string>;
}> {
  const results: Record<string, any> = {};
  const errors: Record<string, string> = {};
  let overallSuccess = true;

  console.log(`Starting synchronization of all models (direction: ${direction})...`);

  for (const model of MODELS_TO_SYNC) {
    try {
      console.log(`Syncing model: ${model}...`);
      const result = await syncModel(model, direction);
      results[model] = result;
      
      if (!result.success) {
        overallSuccess = false;
        errors[model] = result.error || 'Unknown error';
        console.error(`Failed to sync model ${model}: ${result.error}`);
      } else {
        console.log(`Successfully synced model ${model}: ${result.recordsSucceeded} records processed`);
      }
    } catch (error) {
      overallSuccess = false;
      errors[model] = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error syncing model ${model}:`, error);
    }
  }

  console.log(`Synchronization complete. Overall success: ${overallSuccess}`);
  
  return {
    success: overallSuccess,
    results,
    errors
  };
}

// If this file is run directly (e.g., from a script), execute the sync
if (require.main === module) {
  syncAllModels()
    .then(result => {
      console.log('Sync completed with result:', result);
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Sync failed with error:', error);
      process.exit(1);
    });
}
