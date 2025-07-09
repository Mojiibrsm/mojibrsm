
'use client';

import type { Timestamp } from 'firebase/firestore'; // Keep type for compatibility if used elsewhere
import { useState, useEffect } from 'react';

interface FormattedTimestampProps extends React.HTMLAttributes<HTMLSpanElement> {
  timestamp: Timestamp | Date | string | undefined | null;
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

  let date: Date;
  if (typeof timestamp === 'string') {
    date = new Date(timestamp);
  } else if (timestamp instanceof Date) {
    date = timestamp;
  } else if (typeof timestamp === 'object' && 'toDate' in timestamp && typeof (timestamp as any).toDate === 'function') {
    // Handle Firebase Timestamp
    date = (timestamp as any).toDate();
  } else {
    return <span {...props}>Invalid Date</span>;
  }

  // Check if the created date is valid
  if (isNaN(date.getTime())) {
    return <span {...props}>Invalid Date</span>;
  }

  const formattedDate = date[format]();

  return <span {...props}>{formattedDate}</span>;
}
