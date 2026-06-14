"use client";

import { useState } from "react";
import { User, Mail, Phone, FileText, IndianRupee, Loader2, Briefcase, Calendar, CreditCard, Building } from "lucide-react";

const InputField = ({ label, name, type = "text", placeholder, icon: Icon, required = true, colSpan = false, value, onChange }: any) => (
  <div className={`${colSpan ? 'md:col-span-2' : ''}`}>
    <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
      {label}
    </label>
    <input
      type={type}
      name={name}
      required={required}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full h-12 text-base rounded-lg bg-[var(--bg-surface-hover)] border border-[var(--border-hairline)] text-[var(--text-pure)] placeholder:text-[var(--text-muted)] focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition-all outline-none"
      style={{ paddingLeft: '1rem', paddingRight: '1rem' }}
    />
  </div>
);

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    employee_name: "",
    employee_email: "",
    employee_phone: "",
    salary_slip_number: "",
    salary_amount: "",
    employee_id: "",
    designation: "",
    department: "",
    date_of_joining: "",
    pay_period: "",
    pay_date: "",
    payment_mode: "Bank Transfer",
    bank_name: "",
    bank_account_no: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/generate-salary-slip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          salary_amount: parseFloat(formData.salary_amount),
        }),
      });

      if (!res.ok) throw new Error("Failed to generate PDF");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (error) {
      console.error(error);
      alert("Error generating PDF");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-grid"></div>
      <div className="min-h-screen relative z-10 py-16 flex items-center justify-center" style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
        <div className="w-full max-w-4xl bg-[var(--bg-surface)] rounded-3xl border border-[var(--border-hairline)] shadow-2xl shadow-black/50 relative overflow-hidden" style={{ padding: '3.5rem' }}>
          
          {/* Decorative blur */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--brand-primary)]/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

          {/* Header */}
          <div className="text-center mb-12 relative z-10">
            <div className="inline-block p-4 bg-[var(--bg-void)] rounded-2xl border border-[var(--border-hairline)] shadow-xl mb-6">
              <img src="/gaprio_full_logo.png" alt="Gaprio Labs Logo" className="h-14 object-contain" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-pure)] mb-2">
              Orbit<span className="text-[var(--brand-primary)]">.</span>
            </h1>
            <p className="text-[var(--text-muted)]">
              Salary Slip Generator by Gaprio Labs
            </p>
          </div>

          <form onSubmit={handleSubmit} className="relative z-10">
            {/* Employee Information */}
            <section className="mb-10">
              <h2 className="text-lg font-semibold text-[var(--text-pure)] mb-6 flex items-center gap-2 border-b border-[var(--border-hairline)] pb-3">
                <User className="w-5 h-5 text-[var(--brand-primary)]" />
                Employee Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ columnGap: '1.5rem', rowGap: '2rem' }}>
                <InputField label="Employee Name" name="employee_name" placeholder="Arjun Mehta" icon={User} value={formData.employee_name} onChange={handleChange} />
                <InputField label="Employee Email" name="employee_email" type="email" placeholder="arjun@gaprio.in" icon={Mail} value={formData.employee_email} onChange={handleChange} />
                <InputField label="Phone Number" name="employee_phone" type="tel" placeholder="+91 98765 43210" icon={Phone} value={formData.employee_phone} onChange={handleChange} />
                <InputField label="Employee ID" name="employee_id" placeholder="GAP1234" icon={Briefcase} value={formData.employee_id} onChange={handleChange} />
                <InputField label="Designation" name="designation" placeholder="Software Engineer" icon={Briefcase} value={formData.designation} onChange={handleChange} />
                <InputField label="Department" name="department" placeholder="Engineering" icon={Building} value={formData.department} onChange={handleChange} />
                <InputField label="Date of Joining" name="date_of_joining" placeholder="15th January 2024" icon={Calendar} value={formData.date_of_joining} onChange={handleChange} />
              </div>
            </section>

            {/* Salary Details */}
            <section className="mb-10">
              <h2 className="text-lg font-semibold text-[var(--text-pure)] mb-6 flex items-center gap-2 border-b border-[var(--border-hairline)] pb-3">
                <IndianRupee className="w-5 h-5 text-[var(--brand-primary)]" />
                Salary Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ columnGap: '1.5rem', rowGap: '2rem' }}>
                <InputField label="Slip Number" name="salary_slip_number" placeholder="GS-001" icon={FileText} value={formData.salary_slip_number} onChange={handleChange} />
                <InputField label="Pay Period" name="pay_period" placeholder="01 Jun 2025 - 30 Jun 2025" icon={Calendar} value={formData.pay_period} onChange={handleChange} />
                <InputField label="Pay Date" name="pay_date" placeholder="30th June 2025" icon={Calendar} value={formData.pay_date} onChange={handleChange} />
                <InputField label="Payment Mode" name="payment_mode" placeholder="Bank Transfer" icon={CreditCard} value={formData.payment_mode} onChange={handleChange} />
                <InputField label="Bank Name" name="bank_name" placeholder="HDFC Bank" icon={Building} value={formData.bank_name} onChange={handleChange} />
                <InputField label="Bank Account No." name="bank_account_no" placeholder="XXXX XXXX 1234" icon={CreditCard} value={formData.bank_account_no} onChange={handleChange} />
                <InputField label="Gross Salary Amount" name="salary_amount" type="number" placeholder="80000.00" icon={IndianRupee} colSpan={true} value={formData.salary_amount} onChange={handleChange} />
              </div>
            </section>

            <div className="flex justify-center border-t border-[var(--border-hairline)]" style={{ paddingTop: '2.5rem', marginTop: '3rem' }}>
              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto min-w-[280px] h-14 group relative overflow-hidden rounded-xl bg-[var(--brand-primary)] text-[var(--bg-void)] font-bold text-lg transition-all hover:bg-[var(--brand-hover)] active:scale-[0.99] disabled:opacity-70 disabled:pointer-events-none shadow-lg shadow-[var(--brand-primary)]/20 flex justify-center items-center gap-3 cursor-pointer"
                style={{ padding: '0 2rem' }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    Generate Salary Slip
                    <FileText className="w-5 h-5 opacity-80 group-hover:opacity-100 transition-opacity" />
                  </>
                )}
              </button>
            </div>
          </form>

        </div>
      </div>
    </>
  );
}
