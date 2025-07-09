
'use client';

import { Timestamp } from 'firebase/firestore';
import { useState, useEffect } from 'react';

interface FormattedTimestampProps extends React.HTMLAttributes<HTMLSpanElement> {
  timestamp: Timestamp | undefined;
  format?: 'toLocaleString' | 'toLocaleDateString' | 'toLocaleTimeString';
}

export function FormattedTimestamp({ timestamp, format = 'toLocaleString', ...props }: FormattedTimestampProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !timestamp) {
    // Return an empty span or a placeholder to avoid layout shifts.
    return <span {...props} />;
  }

  const formattedDate = timestamp.toDate()[format]();

  return <span {...props}>{formattedDate}</span>;
}
