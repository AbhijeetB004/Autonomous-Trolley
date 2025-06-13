import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { QrCode, Wifi } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCartStore } from '../stores/cartStore' // Assuming cartStore will manage trolleyId
import { Html5QrcodeScanner } from 'html5-qrcode'
import { trolleysApi } from '../services/api'
import { useAuthStore } from '../stores/authStore' // Import useAuthStore

const ConnectTrolley: React.FC = () => {
  const navigate = useNavigate()
  const { trolleyId: connectedTrolleyId, setTrolleyId, clearTrolleyId } = useCartStore()
  const [trolleyInput, setTrolleyInput] = useState('')
  const [scanning, setScanning] = useState(false) // New state to control scanner visibility
  const [trolleyAvailability, setTrolleyAvailability] = useState<{ id: string; available: boolean } | null>(null)
  const { user } = useAuthStore() // Get user from auth store

  useEffect(() => {
    if (user?.role === 'admin') {
      toast.error("Admin users cannot connect to trolleys.")
      navigate('/') // Redirect to dashboard or another appropriate page
      return
    }

    // Check trolley availability when trolleyInput changes and no trolley is connected
    const checkAvailability = async (id: string) => {
      if (!id) {
        setTrolleyAvailability(null);
        return;
      }
      try {
        const response = await trolleysApi.checkAvailability(id);
        setTrolleyAvailability({ id: response.data.trolleyId, available: response.data.available });
      } catch (error: any) {
        console.error('Error checking trolley availability:', error);
        setTrolleyAvailability({ id, available: false }); // Assume unavailable on error
      }
    };

    if (trolleyInput && !connectedTrolleyId) {
      const debounceTimeout = setTimeout(() => {
        checkAvailability(trolleyInput);
      }, 500); // Debounce to avoid too many API calls

      return () => clearTimeout(debounceTimeout);
    } else {
      setTrolleyAvailability(null);
    }
  }, [trolleyInput, connectedTrolleyId, user, navigate]); // Add user and navigate to dependencies

  useEffect(() => {
    let html5QrcodeScanner: Html5QrcodeScanner | null = null;

    if (scanning) {
      // Create a new scanner if not already created
      html5QrcodeScanner = new Html5QrcodeScanner(
        "qr-code-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false // Verbose logging
      );

      const onScanSuccess = (decodedText: string) => {
        // Handle the decoded QR code text
        console.log(`QR Code scanned: ${decodedText}`);
        setTrolleyInput(decodedText); // Pre-fill the input with the scanned ID
        toast.success(`QR Code Scanned: ${decodedText}`);
        setScanning(false); // Stop scanning after successful scan
        if (html5QrcodeScanner) {
          html5QrcodeScanner.clear().catch(error => {
            console.error("Failed to clear html5QrcodeScanner", error);
          });
        }
      };

      const onScanError = (errorMessage: string) => {
        // Handle scan error
        console.warn(`QR Scan Error: ${errorMessage}`);
      };

      html5QrcodeScanner.render(onScanSuccess, onScanError);
    }

    // Cleanup function
    return () => {
      // Ensure the scanner was actually initialized before trying to clear it
      if (html5QrcodeScanner) {
        html5QrcodeScanner.clear().catch(error => {
          console.error("Failed to clear html5QrcodeScanner on unmount", error);
        });
      }
    };
  }, [scanning]); // Rerun effect when scanning state changes

  const handleConnect = async () => {
    if (!trolleyInput.trim()) {
      toast.error('Please enter a Trolley ID.')
      return
    }
    try {
      const response = await trolleysApi.connect(trolleyInput.trim());
      setTrolleyId(response.data.trolley.trolleyId);
      toast.success(response.data.message);
      setTrolleyInput('');
      navigate('/products');
    } catch (error: any) {
      console.error('Error connecting to trolley:', error);
      toast.error(error.response?.data?.message || 'Failed to connect to trolley');
    }
  }

  const handleDisconnect = async () => {
    if (!connectedTrolleyId) return; // Should not happen if button is conditionally rendered
    try {
      const response = await trolleysApi.disconnect(connectedTrolleyId);
      clearTrolleyId();
      toast.success(response.data.message);
    } catch (error: any) {
      console.error('Error disconnecting from trolley:', error);
      toast.error(error.response?.data?.message || 'Failed to disconnect from trolley');
    }
    setTrolleyInput('');
  }

  return (
    <div className="space-y-6 fade-in pt-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Connect to Trolley</h1>
        <p className="text-gray-600 mt-1">Scan QR or enter ID to connect your shopping experience.</p>
      </div>

      <div className="card max-w-2xl mx-auto p-4 sm:p-6">
        <div className="space-y-4">
          {connectedTrolleyId ? (
            <div className="text-center py-4 bg-primary-50 text-primary-800 rounded-lg flex items-center justify-center space-x-2">
              <Wifi className="w-5 h-5" />
              <p className="font-semibold">Currently connected to Trolley: <span className="font-bold">{connectedTrolleyId}</span></p>
            </div>
          ) : (
            <div className="text-center py-4 bg-gray-50 text-gray-600 rounded-lg flex items-center justify-center space-x-2">
              <Wifi className="w-5 h-5" />
              <p>Not connected to any trolley.</p>
            </div>
          )}

          {!connectedTrolleyId && (
            <>
              <div>
                <label htmlFor="trolleyId" className="block text-sm font-medium text-gray-700">Enter Trolley ID Manually</label>
                <input
                  type="text"
                  id="trolleyId"
                  className="input mt-1"
                  value={trolleyInput}
                  onChange={(e) => setTrolleyInput(e.target.value)}
                  placeholder="e.g., T-081"
                />
                {trolleyInput && trolleyAvailability && (
                  <p className={`mt-1 text-sm ${trolleyAvailability.available ? 'text-success-600' : 'text-error-600'}`}>
                    Trolley {trolleyAvailability.id}: {trolleyAvailability.available ? 'Available' : 'Unavailable'}
                  </p>
                )}
              </div>

              {scanning && (
                <div id="qr-code-reader" style={{ width: "100%", maxWidth: "400px", margin: "auto" }}></div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                {!scanning ? (
                  <button
                    type="button"
                    onClick={() => setScanning(true)}
                    className="btn-secondary w-full sm:w-auto flex items-center justify-center"
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    Scan QR Code
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setScanning(false)}
                    className="btn-secondary w-full sm:w-auto flex items-center justify-center text-error-600 hover:text-error-700"
                  >
                    Cancel Scan
                  </button>
                )}
                <button
                  type="submit"
                  onClick={handleConnect}
                  className="btn-primary w-full sm:w-auto flex items-center justify-center"
                >
                  <Wifi className="w-4 h-4 mr-2" />
                  Connect to Trolley
                </button>
              </div>
            </>
          )}

          {connectedTrolleyId && (
            <button
              type="button"
              onClick={handleDisconnect}
              className="btn-secondary w-full flex items-center justify-center text-error-600 hover:text-error-700"
            >
              Disconnect Trolley
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ConnectTrolley 