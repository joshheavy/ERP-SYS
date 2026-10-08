import { ApprovalReview } from '../../../../src/views/approvals/ApprovalReview';

export default async function ApprovalReviewPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ApprovalReview id={id} />;
}
