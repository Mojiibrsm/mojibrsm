
'use client';

import { Timestamp } from 'firebase/firestore';
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
    return <span {...props} />;
  }

  let date: Date;
  if (timestamp instanceof Timestamp) {
    date = timestamp.toDate();
  } else if (timestamp instanceof Date) {
    date = timestamp;
  } else if (typeof timestamp === 'string') {
    date = new Date(timestamp);
  } else {
    return <span {...props}>Invalid Date</span>;
  }

  if (isNaN(date.getTime())) {
    return <span {...props}>Invalid Date</span>;
  }

  const formattedDate = date[format]();

  return <span {...props}>{formattedDate}</span>;
}
