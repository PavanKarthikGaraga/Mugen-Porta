"use client";
import ReportsEvaluation from '../../../../components/reports/ReportsEvaluation';

export default function FacultyReportsPage() {
    return (
        <ReportsEvaluation
            userRole="faculty"
            reportType="internal"
            title="Student Reports Evaluation"
            maxMarks={60}
        />
    );
}
