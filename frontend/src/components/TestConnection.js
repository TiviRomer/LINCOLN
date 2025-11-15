import { useEffect, useState } from 'react';
import { db } from '../firebase/config';
import { collection, getDocs } from 'firebase/firestore';

const TestConnection = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Intentar leer una colección de prueba
        const querySnapshot = await getDocs(collection(db, 'test'));
        console.log('Conexión exitosa:', querySnapshot);
        setIsConnected(true);
      } catch (err) {
        console.error('Error de conexión:', err);
        setError(err.message);
      }
    };

    testConnection();
  }, []);

  return (
    <div style={{
      padding: '20px',
      margin: '20px',
      border: isConnected ? '2px solid green' : '2px solid red',
      borderRadius: '5px',
      maxWidth: '500px'
    }}>
      <h2>Prueba de Conexión a Firebase</h2>
      {isConnected ? (
        <p style={{ color: 'green' }}>✅ ¡Conexión exitosa con Firebase!</p>
      ) : (
        <p style={{ color: 'red' }}>❌ Error de conexión: {error || 'Verificando...'}</p>
      )}
      <div style={{ marginTop: '20px', fontSize: '0.9em' }}>
        <p><strong>Nota:</strong> Revisa la consola del navegador (F12) para ver los detalles de la conexión.</p>
      </div>
    </div>
  );
};

export default TestConnection;
