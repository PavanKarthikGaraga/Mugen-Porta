const fs = require('fs');
const path = './src/app/(pages)/dashboard/student/passport/page.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/{about}/g, '{profile.about}');
content = content.replace(/{tagline}/g, '{profile.tagline}');
content = content.replace(/{links\.github}/g, '{profile.github_url}');
content = content.replace(/{links\.linkedin}/g, '{profile.linkedin_url}');
content = content.replace(/{links\.portfolio}/g, '{profile.portfolio_url}');
content = content.replace(/Nischal Singana/g, '{profile.name || profile.username}');

// Add the Edit button and fix the Export button
const oldActions = `<div className="flex gap-2 flex-wrap">
              {/* Social links */}`;
const newActions = `<div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl text-gray-700 bg-gray-100 shadow-sm hover:shadow-md transition-all border border-gray-200"
              >
                <FiUser size={13} /> Edit Profile
              </button>
              {/* Social links */}`;
content = content.replace(oldActions, newActions);

const oldExport = `<button
                className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl text-white shadow-sm hover:shadow-md transition-all"
                style={{ backgroundColor: BRAND }}
              >
                <FiDownload size={13} /> Export PDF
              </button>`;
const newExport = `<Link
                href="/dashboard/student/passport/resume"
                target="_blank"
                className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl text-white shadow-sm hover:shadow-md transition-all"
                style={{ backgroundColor: BRAND }}
              >
                <FiDownload size={13} /> Export PDF
              </Link>`;
content = content.replace(oldExport, newExport);

// Close the fragment at the end of the file
const oldEnd = `    </div>
  );
}`;
const newEnd = `    </div>
    </>
  );
}`;
content = content.replace(oldEnd, newEnd);

// Fix the banner image
const oldBanner = `background: \`linear-gradient(135deg, rgb(151,0,3) 0%, #7C3AED 50%, #2563EB 100%)\`,`;
const newBanner = `background: profile.banner_url ? \`url(\${profile.banner_url}) center/cover\` : \`linear-gradient(135deg, rgb(151,0,3) 0%, #7C3AED 50%, #2563EB 100%)\`,`;
content = content.replace(oldBanner, newBanner);

// Fix the avatar image
const oldAvatar = `className="w-24 h-24 rounded-2xl border-4 border-white flex items-center justify-center text-3xl font-bold text-white shadow-md bg-white overflow-hidden relative"
                style={{ backgroundColor: BRAND }}`;
const newAvatar = `className="w-24 h-24 rounded-2xl border-4 border-white flex items-center justify-center text-3xl font-bold text-white shadow-md bg-white overflow-hidden relative"
                style={{ backgroundColor: BRAND, backgroundImage: profile.avatar_url ? \`url(\${profile.avatar_url})\` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}`;
content = content.replace(oldAvatar, newAvatar);
// hide text if avatar_url is present
content = content.replace(`AS\n              </div>`, `{profile.avatar_url ? '' : (profile.name || profile.username)?.charAt(0).toUpperCase()}\n              </div>`);


// Add skills section in About
const oldAboutSection = `<Section id="about" title="About" icon={FiUser}>
            <p className="text-sm text-gray-700 leading-relaxed">{profile.about}</p>
          </Section>`;
const newAboutSection = `<Section id="about" title="About" icon={FiUser}>
            <p className="text-sm text-gray-700 leading-relaxed mb-4">{profile.about}</p>
            {profile.skills && profile.skills.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-gray-900 mb-2">Core Skills</h3>
                <div className="flex flex-wrap gap-1.5">
                  {profile.skills.map(s => (
                    <span key={s} className="px-2 py-1 bg-gray-100 text-gray-700 text-[10px] font-semibold rounded-md border border-gray-200">{s}</span>
                  ))}
                </div>
              </div>
            )}
          </Section>`;
content = content.replace(oldAboutSection, newAboutSection);

fs.writeFileSync(path, content);
console.log("Replaced JSX");
