import { useEffect } from 'react';
import { router } from 'expo-router';

export default function Index() {
  useEffect(() => {
    console.log('Index component mounted, redirecting to landing');
    router.replace('/landing');
  }, []);

  return null;
}