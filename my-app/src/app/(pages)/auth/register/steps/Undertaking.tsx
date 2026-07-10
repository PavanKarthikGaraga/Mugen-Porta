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
                        I hereby declare that I have read, understood, and agree to abide by all the policies, guidelines, and regulations of the Student Activity Center (SAC) under the Student Achievement Ecosystem. I commit to actively participating in my selected achievement pathway, club, or activity, completing all assigned responsibilities and deliverables as prescribed, and maintaining proper documentation of my learning, progress, and achievements. I understand that all work submitted must be original, and I will adhere to the highest standards of ethics, safety, quality, discipline, punctuality, and professionalism while interacting with mentors, coordinators, peers, industry experts, and community members.
                    </p>
                    
                    <p>
                        By proceeding with registration, I accept full responsibility for my choices and actions. I understand that any changes to my registered pathway, club, or activity shall be subject to the policies and approval process of the Student Activity Center. I acknowledge that my achievements will be evaluated based on competency development, innovation, creativity, quality of work, relevance, impact, collaboration, leadership, and successful completion of the expected outcomes. I further understand that failure to participate responsibly, maintain academic integrity, or comply with SAC policies may result in withdrawal of recognition, loss of achievement credits, or disciplinary action as per the university regulations.
                    </p>

                    <p className="font-semibold text-gray-800">
                        I pledge to uphold the values of the Student Achievement Ecosystem by continuously learning, collaborating, innovating, leading with integrity, and contributing meaningfully to the university and society.
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
