import { useState, useEffect, useCallback } from 'react';

interface SalonInfo {
  name: string;
  owner: string;
  email: string;
  phone: string;
}

const defaultSalonInfo: SalonInfo = {
  name: 'Salão do Ratinho',
  owner: '',
  email: '',
  phone: '',
};

export function useSalonInfo() {
  const [salonInfo, setSalonInfo] = useState<SalonInfo>(() => {
    const saved = localStorage.getItem('salonInfo');
    return saved ? JSON.parse(saved) : defaultSalonInfo;
  });

  const updateSalonInfo = useCallback((newInfo: Partial<SalonInfo>) => {
    setSalonInfo(prev => {
      const updated = { ...prev, ...newInfo };
      localStorage.setItem('salonInfo', JSON.stringify(updated));
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('salonInfoUpdated', { detail: updated }));
      return updated;
    });
  }, []);

  const saveSalonInfo = useCallback((info: SalonInfo) => {
    localStorage.setItem('salonInfo', JSON.stringify(info));
    setSalonInfo(info);
    window.dispatchEvent(new CustomEvent('salonInfoUpdated', { detail: info }));
  }, []);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'salonInfo' && e.newValue) {
        setSalonInfo(JSON.parse(e.newValue));
      }
    };

    const handleCustomEvent = (e: CustomEvent<SalonInfo>) => {
      setSalonInfo(e.detail);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('salonInfoUpdated', handleCustomEvent as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('salonInfoUpdated', handleCustomEvent as EventListener);
    };
  }, []);

  // Split the name for display (first word / rest)
  const getDisplayName = () => {
    const parts = salonInfo.name.trim().split(' ');
    if (parts.length <= 2) {
      return { firstLine: parts[0] || 'Salão', secondLine: parts.slice(1).join(' ') || '' };
    }
    // For longer names, split at a reasonable point
    const midPoint = Math.ceil(parts.length / 2);
    return { 
      firstLine: parts.slice(0, midPoint).join(' '), 
      secondLine: parts.slice(midPoint).join(' ') 
    };
  };

  return {
    salonInfo,
    setSalonInfo,
    updateSalonInfo,
    saveSalonInfo,
    getDisplayName,
  };
}
