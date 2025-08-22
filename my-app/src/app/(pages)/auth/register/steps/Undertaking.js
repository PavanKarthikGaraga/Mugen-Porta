export default function Undertaking({ formData, updateFormData }) {
    const handleCheckboxChange = (field) => {
        updateFormData({
            [field]: !formData[field]
        });
    };

    return (
        <div className="p-6 md:p-8  max-w-none">
            <h2 className="text-2xl font-bold mb-6 text-center">Undertaking</h2>
            
            <div className="bg-gray-50 p-6 rounded-lg border mb-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Declaration of Understanding and Commitment</h3>
                
                <div className="space-y-4 text-gray-700 leading-relaxed text-sm">
                    <p>
                        I hereby declare that I have read, understood, and agreed to abide by all the rules and regulations 
                        of the Student Activity Center. I commit to actively participating in my selected domain activities, 
                        completing all assigned projects within the stipulated 4-12 weeks timeline, and maintaining proper 
                        documentation of my progress. I understand that all work must be original, and I will follow safety, 
                        ethical, and quality guidelines while maintaining discipline, punctuality, and professionalism in all 
                        SAC activities and interactions with mentors, coordinators, peers, and community members.
                    </p>
                    
                    <p>
                        By proceeding with registration, I accept full responsibility for my choices and actions, understanding 
                        that once registered, no changes to the selected domain or club will be allowed. I acknowledge that 
                        project evaluation will be based on creativity, innovation, quality, relevance, impact, and timely 
                        completion, and that non-participation, late submission, or violation of rules may result in loss of 
                        points, disqualification, or disciplinary action as per university policy. I commit to demonstrating 
                        leadership qualities, collaborating effectively with team members, and avoiding any behavior that 
                        brings disrepute to the university.
                    </p>
                </div>
            </div>

            <div className="space-y-4 border-t border-gray-200 pt-6">
                <div className="flex items-start space-x-3">
                    <input
                        type="checkbox"
                        id="agreedToTerms"
                        checked={formData.agreedToTerms || false}
                        onChange={() => handleCheckboxChange('agreedToTerms')}
                        className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="agreedToTerms" className="text-gray-700 leading-relaxed text-sm">
                        <span className="font-semibold">I agree to all the terms, conditions, rules, and project commitments</span> mentioned above 
                        and understand that violation of any terms may result in penalties or termination from the SAC program. I commit to completing 
                        my selected projects with originality and dedication within the specified timeline.
                    </label>
                </div>
            </div>

            {!formData.agreedToTerms && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">
                    <p className="text-sm">
                        <strong>Note:</strong> You must agree to all terms, conditions, and commitments to proceed with your SAC registration.
                    </p>
                </div>
            )}

            <div className="mt-6 text-center bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-blue-800 text-sm">
                    By clicking &ldquo;Proceed,&rdquo; I confirm my acceptance of this undertaking and my commitment to the KL University Student Activity Center.
                </p>
            </div>
        </div>
    );
}
