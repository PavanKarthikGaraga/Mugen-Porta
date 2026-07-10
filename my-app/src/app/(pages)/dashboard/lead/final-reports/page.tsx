"use client";
import ReportsEvaluation from '../../../../components/reports/ReportsEvaluation';

export default function LeadFinalReportsPage() {
    return (
        <ReportsEvaluation
            userRole="lead"
            reportType="final"
            title="Student Final Reports Evaluation"
            maxMarks={40}
        />
    );
}
