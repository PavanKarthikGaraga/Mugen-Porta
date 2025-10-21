"use client";
import ReportsEvaluation from '../../../../components/reports/ReportsEvaluation';

export default function AdminFinalReportsPage() {
    return (
        <ReportsEvaluation
            userRole="admin"
            reportType="final"
            title="Student Final Reports Evaluation"
            maxMarks={40}
        />
    );
}
