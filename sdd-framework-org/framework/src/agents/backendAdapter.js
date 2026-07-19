import { api } from '../services/api';

export const backendAdapter = {
  /**
   * Run an agent compilation process.
   * Enqueues the job and polls for logs and final output results.
   */
  runGeneration: async (type, updatePageState, instructions = '') => {
    try {
      updatePageState(type, {
        isLoading: true,
        logs: ['[Client] Connecting to generator queue...', '[Client] Enqueuing request...'],
        output: null
      });

      const { jobId } = await api.generate(type, instructions);
      
      updatePageState(type, {
        logs: [`[Client] Request enqueued. Job ID: ${jobId}`, `[Queue] Job accepted. Polling status...`]
      });

      // Poll every 500ms
      const pollInterval = setInterval(async () => {
        try {
          const job = await api.getJobStatus(jobId);
          
          // Update logs and details in page context
          updatePageState(type, {
            logs: job.logs || []
          });

          if (job.status === 'completed') {
            clearInterval(pollInterval);
            updatePageState(type, {
              isLoading: false,
              output: job.result
            });
          } else if (job.status === 'failed') {
            clearInterval(pollInterval);
            updatePageState(type, {
              isLoading: false,
              logs: [...(job.logs || []), '[Error] Generation failed in model backend.']
            });
          }
        } catch (pollErr) {
          clearInterval(pollInterval);
          updatePageState(type, {
            isLoading: false,
            logs: ['[Error] Communication with server lost. Check backend logs.']
          });
        }
      }, 500);

    } catch (err) {
      updatePageState(type, {
        isLoading: false,
        logs: [`[Error] Failed to initiate generation: ${err.message}`]
      });
    }
  }
};
