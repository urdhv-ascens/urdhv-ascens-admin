'use client';

import { useState } from 'react';
import { getLiveContent } from '@/lib/api-client';

export function PublishButton() {
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const content = await getLiveContent();
      let webhookUrl = process.env.NEXT_PUBLIC_CLOUDFLARE_DEPLOY_WEBHOOK_URL;
      
      if (content && (content as any).cloudflareWebhookUrl) {
        webhookUrl = (content as any).cloudflareWebhookUrl;
      }
      
      if (!webhookUrl) {
        alert('Please configure the Cloudflare Webhook URL in the Admin Panel -> Settings tab.');
        return;
      }

      // Send as an opaque request (mode: no-cors) to bypass browser CORS blocks
      await fetch(webhookUrl, { method: 'POST', mode: 'no-cors' });
      
      // With no-cors, we can't read the response status, so we assume success if no network error occurred
      alert('Site publish triggered! Changes will be live in 1-2 minutes.');
    } catch (error) {
      alert('An error occurred during publishing.');
      console.error(error);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <button 
      onClick={handlePublish}
      disabled={isPublishing}
      className={`px-4 py-1.5 bg-emerald-400 text-black font-bold text-xs uppercase tracking-wider rounded-lg transition-colors ${
        isPublishing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-emerald-300'
      }`}
    >
      {isPublishing ? 'Publishing...' : 'Publish Site'}
    </button>
  );
}
