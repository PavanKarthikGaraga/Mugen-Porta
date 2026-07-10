"use client";
import ReportsEvaluation from '../../../../components/reports/ReportsEvaluation';

export default function LeadReportsPage() {
    return (
        <ReportsEvaluation
            userRole="lead"
            reportType="internal"
            title="Student Reports Evaluation"
            maxMarks={60}
        />
    );
}
