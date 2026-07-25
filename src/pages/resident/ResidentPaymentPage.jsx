import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import Card from "../../components/Card";
import Button from "../../components/Button";
import { toast } from "../../components/Toast";
import { paymentsAPI, bookingsAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function ResidentPaymentPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Params passed from booking/maintenance redirect
  const paramAmount = searchParams.get("amount") || "";
  const paramDesc = searchParams.get("description") || "";
  const facilityId = searchParams.get("facilityId") || "";
  const date = searchParams.get("date") || "";
  const slot = searchParams.get("slot") || "";

  const isBooking = !!facilityId;

  // Form State
  const [amount, setAmount] = useState(paramAmount);
  const [description, setDescription] = useState(paramDesc);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (paramAmount) setAmount(paramAmount);
    if (paramDesc) setDescription(paramDesc);
  }, [paramAmount, paramDesc]);

  async function handlePayment(e) {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (!description.trim()) {
      toast.error("Please enter a description for the payment");
      return;
    }

    setSubmitting(true);
    try {
      const month = new Date().toLocaleString("en-US", { month: "long", year: "numeric" });

      // 1. Create the payment record
      await paymentsAPI.create({
        amount: Number(amount),
        description: description.trim(),
        month,
        status: "paid",
        paidOn: new Date().toISOString(),
      });

      // 2. If it is a facility booking, also create the booking
      if (isBooking) {
        await bookingsAPI.create({
          facilityId,
          date,
          slot,
        });
        toast("Payment successful and facility booked!");
        navigate(user?.role === "admin" ? "/admin/personal" : "/resident/bookings");
      } else {
        toast("Payment completed successfully!");
        navigate(user?.role === "admin" ? "/admin/personal" : "/resident/payments");
      }
    } catch (err) {
      toast.error(err.message || "Payment transaction failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Resident"
        title="Process Payment"
        subtitle={isBooking ? "Confirm transaction to secure booking" : "Make a direct payment to society"}
      />

      <div className="max-w-xl mx-auto mb-8">
        <Card className="p-6 border border-brown/5 shadow-xl">
          <form onSubmit={handlePayment} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-brown/75 uppercase tracking-wide mb-1.5">
                Payment Amount (INR)
              </label>
              <input
                required
                type="number"
                disabled={isBooking}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 2000"
                className="admin-input disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-brown/75 uppercase tracking-wide mb-1.5">
                Description / Purpose
              </label>
              <input
                required
                type="text"
                disabled={isBooking}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. July Maintenance Dues"
                className="admin-input disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            <div className="flex gap-4 pt-2">
              <Button
                type="button"
                variant="ghost"
                className="flex-1"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={submitting}
                className="flex-1"
              >
                {submitting ? "Processing..." : `Confirm Payment ₹${Number(amount || 0).toLocaleString("en-IN")}`}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
}
