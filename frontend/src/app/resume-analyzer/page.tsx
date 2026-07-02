'use client';

import React, { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function ResumeAnalyzerPage() {
  useEffect(() => {
    window.location.replace('https://hireboost1.vercel.app');
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
        <p className="text-sm font-semibold text-muted-foreground">Redirecting to HireBoost Resume Scanner...</p>
      </div>
    </div>
  );
}
