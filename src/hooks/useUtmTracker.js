import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { captureUtmParameters } from '../utils/utmTracker';

/**
 * Hook to automatically capture and persist UTM parameters on URL changes.
 */
export function useUtmTracker() {
  const location = useLocation();

  useEffect(() => {
    captureUtmParameters();
  }, [location.pathname, location.search]);
}

export default useUtmTracker;
