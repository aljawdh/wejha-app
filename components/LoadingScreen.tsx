'use client'
export default function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh',
      minHeight: '100dvh',
      background: 'linear-gradient(180deg, #080608 0%, #111015 50%, #080608 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#F0EDE8',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.1,
        backgroundImage: `radial-gradient(circle at 25% 25%, #8B1F24 0%, transparent 50%),
                          radial-gradient(circle at 75% 75%, #D4A843 0%, transparent 50%)`,
        animation: 'float 6s ease-in-out infinite'
      }} />
      
      <div className="pop-in" style={{
        display: 'flex',
        gap: 8,
        justifyContent: 'center',
        marginBottom: 24,
        position: 'relative',
        zIndex: 2
      }}>
        <div style={{
          width: 32,
          height: 56,
          background: 'linear-gradient(135deg, #8B1F24, #A62028)',
          borderRadius: '8px 0 0 8px',
          animation: 'pulse 2s ease-in-out infinite'
        }} />
        <div style={{
          width: 12,
          height: 56,
          background: 'linear-gradient(135deg, #F0EDE8, #D4A843)',
          clipPath: 'polygon(0 0, 100% 15%, 100% 85%, 0 100%)',
          animation: 'pulse 2s ease-in-out infinite 0.2s'
        }} />
        <div style={{
          width: 64,
          height: 56,
          background: 'linear-gradient(135deg, #111015, #18141F)',
          borderRadius: '0 12px 12px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 28,
          animation: 'pulse 2s ease-in-out infinite 0.4s'
        }}>
          🏷️
        </div>
      </div>

      <h1 className="fade-in" style={{
        fontWeight: 900,
        fontSize: 'clamp(28px, 8vw, 36px)',
        color: '#F0EDE8',
        marginBottom: 8,
        textAlign: 'center',
        fontFamily: "'Tajawal', sans-serif"
      }}>قريب</h1>
      
      <p className="fade-in" style={{
        color: '#9CA3AF',
        fontSize: 'clamp(12px, 3vw, 14px)',
        marginBottom: 32,
        textAlign: 'center'
      }}>اكتشف العروض القريبة منك</p>

      <div style={{
        width: 48,
        height: 48,
        border: '4px solid #8B1F2430',
        borderTopColor: '#8B1F24',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: 16
      }} />

      <p className="fade-in" style={{
        fontSize: 'clamp(13px, 3vw, 15px)',
        color: '#6B7280',
        fontWeight: 600,
        textAlign: 'center'
      }}>جاري التحميل...</p>

      <div style={{
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        textAlign: 'center'
      }}>
        <p style={{
          fontSize: 11,
          color: '#374151',
          opacity: 0.7
        }}>قريب - Qreeb © 2026</p>
      </div>
    </div>
  )
}
