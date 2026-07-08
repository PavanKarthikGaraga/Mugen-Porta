export default function Rules({ formData, updateFormData }) {
    return (
        <div className="bg-white p-5 md:p-6 max-w-none">
            {/* Header / Goal */}
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-red-800 mb-2">AY 2026–27 Goal</h2>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Student Achievement Ecosystem</h3>
                <p className="text-gray-700 text-sm leading-relaxed max-w-3xl mx-auto mb-3">
                    To build a dynamic Student Achievement Ecosystem that empowers every student to discover their potential, develop future-ready competencies, create meaningful outcomes, and achieve excellence through innovation, leadership, entrepreneurship, community engagement, creativity, and lifelong learning.
                </p>
                <p className="text-gray-700 text-sm leading-relaxed max-w-3xl mx-auto font-medium">
                    Our goal is to ensure that every student graduates not only with a degree, but with a portfolio of achievements, professional competencies, leadership experiences, and measurable impact on society.
                </p>
            </div>
            
            <div className="space-y-8">
                {/* Mission Timeline */}
                <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">Mission Timeline</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-100 text-gray-700">
                                <tr>
                                    <th className="px-4 py-2 rounded-tl-md">Batch</th>
                                    <th className="px-4 py-2">Theme</th>
                                    <th className="px-4 py-2 rounded-tr-md">Mission</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                <tr>
                                    <td className="px-4 py-3 font-semibold">Y23</td>
                                    <td className="px-4 py-3 text-red-700 font-medium">Inspire</td>
                                    <td className="px-4 py-3 text-gray-600">Become mentors who transfer knowledge, strengthen student communities, and leave a lasting legacy of excellence.</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 font-semibold">Y24</td>
                                    <td className="px-4 py-3 text-red-700 font-medium">Elevate</td>
                                    <td className="px-4 py-3 text-gray-600">Strengthen competencies, pursue excellence, and transform experience into impactful achievements.</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 font-semibold">Y25</td>
                                    <td className="px-4 py-3 text-red-700 font-medium">Ignite</td>
                                    <td className="px-4 py-3 text-gray-600">Convert knowledge into action by solving real-world problems through innovation, entrepreneurship, and community engagement.</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 font-semibold">Y26</td>
                                    <td className="px-4 py-3 text-red-700 font-medium">Discover</td>
                                    <td className="px-4 py-3 text-gray-600">Explore interests, identify strengths, develop competencies, and begin the journey toward lifelong achievement.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-4 text-center">
                        <p className="text-sm font-medium text-gray-600">This creates a natural progression:</p>
                        <p className="text-base font-bold text-gray-800 mt-1">Discover → Ignite → Elevate → Inspire</p>
                    </div>
                </div>

                {/* Three SAC Pillars */}
                <div>
                    <h3 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">Three SAC Pillars</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                            <h4 className="font-bold text-red-800 mb-2">1. Discover & Develop</h4>
                            <p className="text-sm text-gray-600 mb-3 line-clamp-4 hover:line-clamp-none">
                                Helping students explore their interests, identify hidden talents, build competencies, and continuously learn through clubs, skill hubs, workshops, cultural activities, sports, and professional development.
                            </p>
                            <div className="text-xs font-semibold text-gray-800 mb-1">Focus Areas:</div>
                            <p className="text-xs text-gray-500">Passion Discovery, Skill Development, Competency Building, Talent Enhancement</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                            <h4 className="font-bold text-red-800 mb-2">2. Create & Innovate</h4>
                            <p className="text-sm text-gray-600 mb-3 line-clamp-4 hover:line-clamp-none">
                                Providing opportunities to convert ideas into projects, research, products, startups, performances, intellectual property, and technology solutions.
                            </p>
                            <div className="text-xs font-semibold text-gray-800 mb-1">Focus Areas:</div>
                            <p className="text-xs text-gray-500">Innovation, Entrepreneurship, Research, Product Development, Creative Excellence</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                            <h4 className="font-bold text-red-800 mb-2">3. Lead & Transform</h4>
                            <p className="text-sm text-gray-600 mb-3 line-clamp-4 hover:line-clamp-none">
                                Empowering students to lead teams, mentor peers, create social impact, participate in national missions, and build sustainable communities through service learning and leadership.
                            </p>
                            <div className="text-xs font-semibold text-gray-800 mb-1">Focus Areas:</div>
                            <p className="text-xs text-gray-500">Leadership, Community Engagement, Social Innovation, Sustainability, Nation Building</p>
                        </div>
                    </div>
                </div>

                {/* Student Achievement Framework */}
                <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
                    <h3 className="text-lg font-bold mb-4 text-blue-900 border-b border-blue-200 pb-2">Student Achievement Framework (Activity Structure)</h3>
                    <div className="space-y-3">
                        <div className="flex gap-3">
                            <div className="font-bold text-blue-800 whitespace-nowrap">Phase 1 — Discover:</div>
                            <div className="text-sm text-gray-700">Students identify their interests, strengths, aspirations, and preferred achievement pathway.</div>
                        </div>
                        <div className="flex gap-3">
                            <div className="font-bold text-blue-800 whitespace-nowrap">Phase 2 — Learn:</div>
                            <div className="text-sm text-gray-700">Acquire knowledge through structured learning, expert sessions, certifications, mentoring, and guided practice.</div>
                        </div>
                        <div className="flex gap-3">
                            <div className="font-bold text-blue-800 whitespace-nowrap">Phase 3 — Practice:</div>
                            <div className="text-sm text-gray-700">Apply learning through regular participation, team collaboration, hands-on activities, and competency-building exercises.</div>
                        </div>
                        <div className="flex gap-3">
                            <div className="font-bold text-blue-800 whitespace-nowrap">Phase 4 — Create:</div>
                            <div className="text-sm text-gray-700">Develop tangible outcomes such as projects, research, performances, publications, prototypes, events, startups, or community initiatives.</div>
                        </div>
                        <div className="flex gap-3">
                            <div className="font-bold text-blue-800 whitespace-nowrap">Phase 5 — Achieve:</div>
                            <div className="text-sm text-gray-700">Outcomes are evaluated based on innovation, quality, relevance, leadership, and measurable impact. Students receive achievement points, competency badges, learning credits, rankings, and institutional recognition.</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 text-center">
                <p className="text-gray-600 text-sm font-medium">
                    By proceeding, you acknowledge your commitment to the Student Achievement Ecosystem.
                </p>
            </div>
        </div>
    );
}
