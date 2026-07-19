import React, { useState } from 'react';
import { useDashboardStore } from '../../store/dashboardStore';
import { useAppStore } from '../../store/appStore';
import { invoicesApi } from '../../api/invoices';

export const PaymentModal: React.FC = () => {
  const isOpen = useDashboardStore((s) => s.paymentModalOpen);
  const invoiceId = useDashboardStore((s) => s.paymentInvoiceId);
  const close = useDashboardStore((s) => s.closePaymentModal);
  const addToast = useAppStore((s) => s.addToast);
  const invoices = useAppStore((s) => s.invoices) ?? [];

  const invoice = invoices.find((i) => i.id === invoiceId);

  const [name, setName] = useState('');
  const [card, setCard] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !invoice) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await invoicesApi.pay(invoice.id);
      if (res.success) {
        addToast(`Successfully paid Invoice ${invoice.id}!`, 'success');
        close();
      } else {
        addToast(res.message || 'Payment failed', 'error');
      }
    } catch (err: any) {
      addToast(err.message || 'An error occurred during payment processing', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay open">
      <div className="modal-content">
        <button className="modal-close" onClick={close}>
          &times;
        </button>
        <h3>Simulate Secure Payment</h3>
        <div
          style={{
            margin: '1rem 0',
            padding: '1rem',
            background: 'var(--bg2)',
            borderRadius: '8px',
            border: '1px solid var(--border)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
            <span>Invoice:</span>
            <strong>{invoice.id}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            <span>Project:</span>
            <strong>{invoice.project}</strong>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '1rem',
              marginTop: '0.5rem',
              padding: '0.5rem 0 0 0',
              borderTop: '1px solid var(--border)',
              fontWeight: 800,
            }}
          >
            <span>Amount Due:</span>
            <span>${invoice.amount}</span>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="contact-form">
          <div className="form-group">
            <label>Cardholder Name</label>
            <input type="text" placeholder="Alex Johnson" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Card Number</label>
            <input type="text" placeholder="4111 2222 3333 4444" value={card} onChange={(e) => setCard(e.target.value)} required />
          </div>
          <div className="form-row" style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Expiry</label>
              <input type="text" placeholder="MM/YY" value={expiry} onChange={(e) => setExpiry(e.target.value)} required />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>CVC</label>
              <input type="password" placeholder="***" value={cvc} onChange={(e) => setCvc(e.target.value)} required />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={isSubmitting}>
            {isSubmitting ? 'Processing Payment...' : 'Pay Invoice'}
          </button>
        </form>
      </div>
    </div>
  );
};
export default PaymentModal;
