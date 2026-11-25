import React, { useEffect, useState } from 'react';
import { Copy, CheckCircle2 } from 'lucide-react';
import { useDashboardStore } from '../../store/dashboardStore';
import { useAppStore } from '../../store/appStore';

export const PaymentModal: React.FC = () => {
  const isOpen = useDashboardStore((s) => s.paymentModalOpen);
  const invoiceId = useDashboardStore((s) => s.paymentInvoiceId);
  const close = useDashboardStore((s) => s.closePaymentModal);
  const addToast = useAppStore((s) => s.addToast);
  const invoices = useAppStore((s) => s.invoices) ?? [];

  const invoice = invoices.find((i) => i.id === invoiceId);

  const [qrDataUrl, setQrDataUrl] = useState('');
  const [upiVpa, setUpiVpa] = useState('');
  const [upiUri, setUpiUri] = useState('');
  const [utr, setUtr] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen || !invoice) return;
    setSubmitted(false);
    setUtr('');
    fetch('/api/invoices/upi-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoiceId: invoice.id, amount: invoice.amount, project: invoice.project })
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.qrDataUrl) {
          setQrDataUrl(d.qrDataUrl);
          setUpiVpa(d.upiVpa);
          setUpiUri(d.upiUri);
        }
      })
      .catch(() => {});
  }, [isOpen, invoice]);

  if (!isOpen || !invoice) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!utr.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/invoices/submit-utr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: invoice.id, utr: utr.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'UTR submission failed');
      const updatedInvoices = invoices.map((inv) =>
        inv.id === invoice.id ? { ...inv, status: `Pending Verification (UTR: ${utr.trim()})` } : inv
      );
      useAppStore.getState().setState({ invoices: updatedInvoices });
      setSubmitted(true);
      addToast(`UTR submitted for Invoice ${invoice.id}!`, 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to submit UTR', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay open">
      <div className="modal-content" style={{ maxWidth: '430px' }}>
        <button className="modal-close" onClick={close}>
          &times;
        </button>
        <h3 style={{ marginBottom: '0.35rem' }}>Pay Invoice via UPI</h3>
        <div
          style={{
            margin: '0.85rem 0 1rem',
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
              color: 'var(--primary)'
            }}
          >
            <span>Amount Due:</span>
            <span>₹{invoice.amount}</span>
          </div>
        </div>

        {qrDataUrl && (
          <div style={{ background: '#ffffff', padding: '0.75rem', borderRadius: '12px', textAlign: 'center', marginBottom: '0.85rem', border: '1px solid var(--border)' }}>
            <img src={qrDataUrl} alt="UPI QR" style={{ width: '190px', height: '190px', margin: '0 auto', display: 'block' }} />
            <div style={{ fontSize: '0.76rem', color: '#4b5563', fontWeight: 600, marginTop: '0.3rem' }}>
              Scan with GPay • PhonePe • Paytm • BHIM
            </div>
          </div>
        )}

        {upiVpa && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.85rem', background: 'var(--bg2)', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.8rem', marginBottom: '0.85rem' }}>
            <span>UPI ID: <strong>{upiVpa}</strong></span>
            <button type="button" onClick={() => { navigator.clipboard.writeText(upiVpa); addToast('UPI ID copied!', 'info'); }} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              <Copy size={13} /> Copy
            </button>
          </div>
        )}

        {upiUri && (
          <a href={upiUri} className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', marginBottom: '0.85rem', fontSize: '0.85rem' }}>
            Open in UPI App (Mobile)
          </a>
        )}

        {submitted ? (
          <div style={{ padding: '0.9rem', borderRadius: '10px', background: 'rgba(16,185,129,0.12)', border: '1px solid #10b981', color: '#10b981', fontSize: '0.84rem', fontWeight: 600, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
            <CheckCircle2 size={16} /> UTR submitted! Verification in progress.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-group">
              <label>12-Digit UPI UTR / Reference Number</label>
              <input type="text" placeholder="e.g. 432918273645" value={utr} onChange={(e) => setUtr(e.target.value)} required />
            </div>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', fontWeight: 700, justifyContent: 'center' }}>
              {isSubmitting ? 'Submitting...' : 'Submit UTR for Verification'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
