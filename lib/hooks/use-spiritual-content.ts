import { useEffect, useState } from 'react';

interface SpiritualContentStatus {
  isLoading: boolean;
  isPopulated: boolean;
  error: string | null;
}

/**
 * Hook that ensures spiritual content is populated
 * Checks once per day and populates if needed
 */
export function useSpiritualContent(): SpiritualContentStatus {
  const [status, setStatus] = useState<SpiritualContentStatus>({
    isLoading: false,
    isPopulated: false,
    error: null,
  });

  useEffect(() => {
    const checkAndPopulate = async () => {
      // Check if we already checked today
      const lastCheck = localStorage.getItem('spiritual_content_last_check');
      const today = new Date().toISOString().split('T')[0];
      
      if (lastCheck === today) {
        setStatus({ isLoading: false, isPopulated: true, error: null });
        return;
      }

      setStatus({ isLoading: true, isPopulated: false, error: null });

      try {
        // Call the API to ensure content is available
        const response = await fetch('/api/spiritual/populate');
        
        if (!response.ok) {
          throw new Error('Failed to ensure spiritual content');
        }

        const data = await response.json();
        
        // Store that we checked today
        localStorage.setItem('spiritual_content_last_check', today);
        
        setStatus({
          isLoading: false,
          isPopulated: true,
          error: null,
        });
      } catch (error) {
        console.error('Error ensuring spiritual content:', error);
        setStatus({
          isLoading: false,
          isPopulated: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    };

    checkAndPopulate();
  }, []);

  return status;
}