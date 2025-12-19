export default function Overview({ formData, updateFormData }) {
    return (
        <div className="px-6 md:p-8">
            <div className="text-center mb-4">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">KL University – Student Activity Center (SAC)</h1>
                <h2 className="text-xl text-gray-600 mb-1">Annual Mission & Activity Overview</h2>
                <p className="text-lg text-gray-500">Academic Year 2025–26</p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg border mb-6">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">AY 2025–26 Goal</h3>
                <p className="text-gray-700 leading-relaxed">
                    Create a balanced platform where Clubs work together to help students
                    discover themselves, excel in their passions, and achieve outcomes worth celebrating.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="border-l-4 border-gray-400 pl-6">
                        <h3 className="text-xl font-semibold mb-4 text-gray-800">Mission Timeline</h3>
                        <div className="space-y-3 text-gray-700">
                            <div>
                                <span className="font-medium">Y22 – Legacy:</span> Building Foundations – establishing lasting contributions and leadership in SAC activities.
                            </div>
                            <div>
                                <span className="font-medium">Y23 – Mastery:</span> Excellence in Action – honing skills and achieving mastery in chosen domains.
                            </div>
                            <div>
                                <span className="font-medium">Y24 – Abhiyan:</span> Action for Impact – applying skills to deliver real-world outcomes.
                            </div>
                            <div>
                                <span className="font-medium">Y25 – Aarambh:</span> A New Beginning – converting interests into measurable achievements across all SAC tracks.
                            </div>
                        </div>
                    </div>

                    <div className="border border-gray-200 p-6 rounded-lg">
                        <h3 className="text-xl font-semibold mb-4 text-gray-800">Three SAC Pillars</h3>
                        <p className="text-gray-600 mb-4">For this academic year, both SAC pillars will start simultaneously:</p>
                        
                        <div className="space-y-4">
                            <div className="border-l-2 border-gray-300 pl-4">
                                <h4 className="font-semibold text-gray-800">1. Clubs & Talent Hubs</h4>
                                <p className="text-sm text-gray-600">Technical, cultural, literary, sports, and creativity clubs that help students explore and refine their interests.</p>
                            </div>

                            <div className="border-l-2 border-gray-300 pl-4">
                                <h4 className="font-semibold text-gray-800">2. Innovation & Entrepreneurship</h4>
                                <p className="text-sm text-gray-600">Idea-to-prototype projects, hackathons, business model challenges, and incubation opportunities.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="space-y-6">
                    <div className="border border-gray-200 p-6 rounded-lg">
                        <h3 className="text-xl font-semibold mb-4 text-gray-800">Activity Structure</h3>
                        <p className="text-gray-600 mb-4 text-sm">(Applicable to All Three Pillars)</p>
                        
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-medium text-gray-800 mb-1">1. Mission-Driven Selection</h4>
                                <p className="text-sm text-gray-600">Students choose activities/projects from their preferred pillar(s) and domain(s).</p>
                            </div>
                            
                            <div>
                                <h4 className="font-medium text-gray-800 mb-1">2. Time-Bound Execution</h4>
                                <p className="text-sm text-gray-600">Each task must be completed within 4–12 weeks, with mandatory learning, skill development, and tangible output.</p>
                            </div>
                            
                            <div>
                                <h4 className="font-medium text-gray-800 mb-1">3. Outcome-Based Assessment</h4>
                                <p className="text-sm text-gray-600">Evaluation will focus on innovation, quality, relevance, and impact. Recognition can be in the form of points, credits, scores, or appreciation.</p>
                            </div>
                            
                            <div>
                                <h4 className="font-medium text-gray-800 mb-1">4. Ranking & Recognition</h4>
                                <p className="text-sm text-gray-600">Transparent ranking systems will be maintained within each pillar, with awards for top performers.</p>
                            </div>
                            
                            <div>
                                <h4 className="font-medium text-gray-800 mb-1">5. Talent Identification & Career Linkage</h4>
                                <p className="text-sm text-gray-600">Hidden skills will be mapped to academic and career opportunities.</p>
                            </div>
                            
                            <div>
                                <h4 className="font-medium text-gray-800 mb-1">6. Holistic Growth & Happiness</h4>
                                <p className="text-sm text-gray-600">Connecting interests to academics ensures students enjoy the learning process while building a strong personal profile.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
