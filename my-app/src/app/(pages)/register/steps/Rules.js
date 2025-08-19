export default function Rules({ formData, updateFormData }) {
    return (
        <div className="bg-white p-5 md:p-6 rounded-lg shadow-md max-w-none">
            <h2 className="text-xl font-bold mb-5 text-center text-gray-800">General Guidelines & Rules for Students – AY 2025–26</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 text-sm">
                {/* Registration & Participation */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="text-base font-semibold mb-3 text-gray-800">1. Registration & Participation</h3>
                    <ul className="space-y-2 text-gray-700 text-sm">
                        <li className="flex items-start">
                            <span className="w-2 h-2 bg-gray-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                            <span>Every student must enroll in at least one SAC activity from any of the five domains: Health, Technical, Cultural, Innovation & Incubation, Outreach & Extension.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="w-2 h-2 bg-gray-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                            <span>Selection of the activity/project should be completed within the first 2 weeks of the semester.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="w-2 h-2 bg-gray-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                            <span>Students may participate in more than one domain if they can manage the time and deliverables.</span>
                        </li>
                    </ul>
                </div>

                {/* Task Duration & Completion */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="text-base font-semibold mb-3 text-gray-800">2. Task Duration & Completion</h3>
                    <ul className="space-y-2 text-gray-700 text-sm">
                        <li className="flex items-start">
                            <span className="w-2 h-2 bg-gray-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                            <span>All assigned activities/projects must be completed within 4–12 weeks from the approval date.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="w-2 h-2 bg-gray-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                            <span>Students must plan, learn, and execute their task with proper documentation.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="w-2 h-2 bg-gray-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                            <span>Deliverables (reports, presentations, products, events, etc.) must be submitted before the semester deadline.</span>
                        </li>
                    </ul>
                </div>

                {/* Conduct & Professionalism */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="text-base font-semibold mb-3 text-gray-800">3. Conduct & Professionalism</h3>
                    <ul className="space-y-2 text-gray-700 text-sm">
                        <li className="flex items-start">
                            <span className="w-2 h-2 bg-gray-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                            <span>Maintain discipline, punctuality, and regular attendance for all SAC activities.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="w-2 h-2 bg-gray-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                            <span>Show respect towards mentors, coordinators, peers, and community members.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="w-2 h-2 bg-gray-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                            <span>Avoid any behavior that brings disrepute to the university.</span>
                        </li>
                    </ul>
                </div>

                {/* Work Standards */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="text-base font-semibold mb-3 text-gray-800">4. Work Standards</h3>
                    <ul className="space-y-2 text-gray-700 text-sm">
                        <li className="flex items-start">
                            <span className="w-2 h-2 bg-gray-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                            <span>All work must be original — plagiarism or duplication will lead to disqualification.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="w-2 h-2 bg-gray-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                            <span>Follow safety, ethical, and quality guidelines relevant to the chosen domain.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="w-2 h-2 bg-gray-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                            <span>For events, competitions, or outreach programs, follow dress code & communication etiquette.</span>
                        </li>
                    </ul>
                </div>

                {/* Learning & Outcome Focus */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="text-base font-semibold mb-3 text-gray-800">5. Learning & Outcome Focus</h3>
                    <ul className="space-y-2 text-gray-700 text-sm">
                        <li className="flex items-start">
                            <span className="w-2 h-2 bg-gray-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                            <span>Students should aim to gain new knowledge and skills related to their chosen domain.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="w-2 h-2 bg-gray-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                            <span className="font-medium">Projects will be evaluated based on:</span>
                        </li>
                        <li className="ml-4 space-y-1">
                            <div className="text-sm text-gray-600">• Creativity & Innovation</div>
                            <div className="text-sm text-gray-600">• Quality of Work</div>
                            <div className="text-sm text-gray-600">• Relevance & Impact</div>
                            <div className="text-sm text-gray-600">• Timely Completion</div>
                            <div className="text-sm text-gray-600">• Teamwork & Leadership</div>
                        </li>
                    </ul>
                </div>

                {/* Evaluation & Recognition */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="text-base font-semibold mb-3 text-gray-800">6. Evaluation & Recognition</h3>
                    <ul className="space-y-2 text-gray-700 text-sm">
                        <li className="flex items-start">
                            <span className="w-2 h-2 bg-gray-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                            <span>Students will earn points, credits, or appreciation based on performance.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="w-2 h-2 bg-gray-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                            <span>Ranking will be maintained at the end of the semester.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="w-2 h-2 bg-gray-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                            <span>Outstanding performers will receive awards, certificates, and recognition at SAC events.</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Disciplinary Measures */}
            <div className="mt-5 bg-gray-100 p-4 rounded-lg border border-gray-300">
                <h3 className="text-base font-semibold mb-2 text-gray-800">7. Disciplinary Measures</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                    Non-participation, late submission, or violation of rules may lead to loss of points, disqualification, 
                    or disciplinary action as per university policy.
                </p>
            </div>

            <div className="mt-4 text-center bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="text-blue-800 text-sm">
                    Please read all rules carefully before proceeding. By continuing, you acknowledge 
                    that you understand and agree to follow these guidelines.
                </p>
            </div>
        </div>
    );
}
