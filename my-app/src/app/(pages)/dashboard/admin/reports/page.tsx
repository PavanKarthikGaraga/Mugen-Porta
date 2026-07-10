"use client";
import ReportsEvaluation from '../../../../components/reports/ReportsEvaluation';

export default function AdminReportsPage() {
    return (
        <ReportsEvaluation
            userRole="admin"
            reportType="internal"
            title="Student Reports Evaluation"
            maxMarks={60}
        />
    );
}
