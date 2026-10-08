import { LeaveRequestDetail } from '../../../../../../src/views/hr/leave/LeaveRequestDetail';

export default async function LeaveRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <LeaveRequestDetail id={id} />;
}
