import React from 'react';
import { LayoutDashboard } from 'lucide-react';

export default function About() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '60vh',
      textAlign: 'center',
      color: 'var(--text-secondary)'
    }}>
      <div style={{
        background: 'var(--primary-light)',
        color: 'var(--primary)',
        padding: '2rem',
        borderRadius: '50%',
        marginBottom: '2rem'
      }}>
        <LayoutDashboard size={48} />
      </div>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
        Welcome to Shyam Metalics
      </h1>
      <p style={{ fontSize: '1.1rem', maxWidth: '600px', lineHeight: '1.6' }}>
        You are now in the administrative control center. Use the sidebar to manage content,
        review inquiries, and monitor system activity.
      </p>
    </div>
  );
}
