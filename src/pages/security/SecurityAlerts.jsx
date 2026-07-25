import PageHeader from "../../components/PageHeader";
import Card from "../../components/Card";
import Badge from "../../components/Badge";
import { IconSparkle, IconShield } from "../../components/icons";

// Alerts will be AI-generated from complaint data once the analytics backend is connected.
export default function SecurityAlerts() {
  return (
    <>
      <PageHeader eyebrow="Security" title="Alerts" subtitle="AI-flagged emergencies and safety concerns" />
      <Card className="p-12 text-center">
        <IconShield className="w-8 h-8 text-brown/20 mx-auto mb-3" />
        <p className="text-sm text-brown/50">No active alerts. The AI watches incoming complaints for safety keywords automatically.</p>
      </Card>
    </>
  );
}
