export default function ConnectPage() {
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <iframe
        src="/connect.html"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
        }}
        title="产品母体表"
      />
    </div>
  );
}
