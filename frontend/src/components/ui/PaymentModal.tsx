import React, { useEffect, useState } from 'react';
import { CreditCard, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useDashboardStore } from '../../store/dashboardStore';
import { useAppStore } from '../../store/appStore';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const PaymentModal: React.FC = () => {
  const isOpen = useDashboardStore((s) => s.paymentModalOpen);
  const invoiceId = useDashboardStore((s) => s.paymentInvoiceId);
  const close = useDashboardStore((s) => s.closePaymentModal);
  const addToast = useAppStore((s) => s.addToast);
  const invoices = useAppStore((s) => s.invoices) ?? [];

  const invoice = invoices.find((i) => i.id === invoiceId);

  const [paid, setPaid] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPaid(false);
      setIsProcessing(false);
    }
  }, [isOpen, invoiceId]);

  if (!isOpen || !invoice) return null;

  const handleRazorpayCheckout = async () => {
    if (!window.Razorpay) {
      addToast('Razorpay SDK failed to load. Please refresh and try again.', 'error');
      return;
    }
    setIsProcessing(true);
    try {
      const orderRes = await fetch('/api/payments/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: invoice.id,
          amount: invoice.amount,
          currency: 'INR',
        }),
      });
      const order = await orderRes.json();
      if (!orderRes.ok || !order.orderId) {
        throw new Error(order.error || 'Could not initialize Razorpay order');
      }

      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'RDK Tech',
        description: `${invoice.id} — ${invoice.project}`,
        order_id: order.orderId,
        prefill: {
          email: invoice.client && invoice.client.includes('@') ? invoice.client : undefined,
        },
        theme: { color: '#7c3aed' },
        modal: {
          ondismiss: () => setIsProcessing(false),
        },
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch('/api/payments/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                invoiceId: invoice.id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(verifyData.error || 'Payment verification failed');
            }
            const updatedInvoices = invoices.map((inv) =>
              inv.id === invoice.id ? { ...inv, status: 'Paid' } : inv
            );
            useAppStore.getState().setState({ invoices: updatedInvoices });
            setPaid(true);
            addToast(`Invoice ${invoice.id} paid via Razorpay!`, 'success');
          } catch (err: any) {
            addToast(err.message || 'Verification failed', 'error');
          } finally {
            setIsProcessing(false);
          }
        },
      });
      rzp.open();
    } catch (err: any) {
      addToast(err.message || 'Failed to launch Razorpay checkout', 'error');
      setIsProcessing(false);
    }
  };

  return (
    <div className="modal-overlay open">
      <div className="modal-content" style={{ maxWidth: '430px' }}>
        <button className="modal-close" onClick={close}>
          &times;
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <CreditCard size={20} color="#7c3aed" />
          <h3 style={{ margin: 0 }}>Pay Invoice via Razorpay</h3>
        </div>
        <p style={{ fontSize: '0.82rem', color: 'var(--text2)', margin: '0 0 0.85rem' }}>
          Instant checkout with UPI, Cards, Netbanking &amp; Wallets.
        </p>

        <div
          style={{
            margin: '0 0 1.15rem',
            padding: '0.9rem',
            background: 'var(--bg2)',
            borderRadius: '10px',
            border: '1px solid var(--border)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.83rem' }}>
            <span>Invoice:</span>
            <strong>{invoice.id}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.83rem', marginTop: '0.25rem' }}>
            <span>Project:</span>
            <strong>{invoice.project}</strong>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '1rem',
              marginTop: '0.5rem',
              paddingTop: '0.5rem',
              borderTop: '1px solid var(--border)',
              fontWeight: 800,
              color: 'var(--primary)',
            }}
          >
            <span>Amount Due:</span>
            <span>₹{invoice.amount}</span>
          </div>
        </div>

        {paid ? (
          <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(16,185,129,0.12)', border: '1px solid #10b981', color: '#10b981', fontSize: '0.88rem', fontWeight: 600, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem' }}>
            <CheckCircle2 size={18} /> Payment confirmed! Invoice marked as Paid.
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={handleRazorpayCheckout}
              disabled={isProcessing}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.8rem', fontWeight: 700, justifyContent: 'center' }}
            >
              {isProcessing ? 'Opening Razorpay...' : `Pay ₹${invoice.amount} with Razorpay`}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text3)' }}>
              <ShieldCheck size={14} color="#7c3aed" /> Secured by Razorpay 256-bit encryption
            </div>
          </>
        )}
      </div>
    </div>
  );
};
