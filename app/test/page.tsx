export default function TestPage() {
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ color: '#333' }}>Test Page</h1>
      <p>If you can see this, basic rendering is working.</p>
      <p>Current time: {new Date().toLocaleString()}</p>
    </div>
  );
}
