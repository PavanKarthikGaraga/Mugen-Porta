"use client";
import ReportsEvaluation from '../../../../components/reports/ReportsEvaluation';

export default function FacultyFinalReportsPage() {
    return (
        <ReportsEvaluation
            userRole="faculty"
            reportType="final"
            title="Student Final Reports Evaluation"
            maxMarks={40}
        />
    );
}
