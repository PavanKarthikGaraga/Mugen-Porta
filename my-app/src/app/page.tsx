"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Sparkles,
  Compass,
  Target,
  Award,
  Briefcase,
  GraduationCap,
  Users,
  Lightbulb,
  Crown,
  Search,
  BookOpen,
  CheckCircle2,
  TrendingUp,
  Fingerprint,
  Heart,
  Globe,
  Rocket,
  Shield,
  Activity,
  Layers,
  Star,
  Zap,
  LineChart,
  ChevronDown,
  Map as MapIcon,
  LayoutDashboard,
  List,
  ShieldCheck,
  User,
  Building,
  Brain
} from "lucide-react";

export default function Home() {
  const [activeFeature, setActiveFeature] = useState("Dashboard");

  const MOCK_FEATURES = [
    { id: "Dashboard", icon: LayoutDashboard, title: "Dashboard Overview", desc: "Your summary of points, recent activities, and notifications.", previewUi: (
      <div className="w-full mt-6 text-left space-y-3">
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Points</div>
            <div className="text-xl font-black text-red-900">2,500</div>
          </div>
          <TrendingUp className="h-6 w-6 text-emerald-500" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Activities</div>
            <div className="text-sm font-black text-slate-800">24 Done</div>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Stage</div>
            <div className="text-sm font-black text-blue-700">Leader</div>
          </div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm mt-3">
          <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-2">Recent Notification</div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-red-500"></div>
            <div className="text-[10px] font-medium text-slate-700">Your Certificate for Hackathon is ready.</div>
          </div>
        </div>
      </div>
    )},
    { id: "Learning Journey", icon: Compass, title: "Six-Stage Journey", desc: "Track your progression from Explorer to Mentor.", previewUi: (
      <div className="w-full mt-6 text-left space-y-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Current Stage</div>
            <div className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">Leader</div>
          </div>
          <div className="relative flex justify-between items-center mt-6 px-1">
            <div className="absolute top-1/2 left-1 right-1 h-1 bg-slate-100 -translate-y-1/2 -z-10"></div>
            <div className="absolute top-1/2 left-1 w-[50%] h-1 bg-blue-600 -translate-y-1/2 -z-10"></div>
            {[1, 2, 3, 4, 5, 6].map(step => (
              <div key={step} className={`h-3 w-3 rounded-full border-2 ${step <= 3 ? 'bg-blue-600 border-blue-600' : (step === 4 ? 'bg-white border-blue-600 shadow-[0_0_0_3px_rgba(37,99,235,0.2)]' : 'bg-white border-slate-200')} flex items-center justify-center`}></div>
            ))}
          </div>
          <div className="flex justify-between text-[8px] font-bold text-slate-400 mt-2">
            <span>Explorer</span>
            <span>Mentor</span>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl shadow-sm text-center">
           <div className="text-[10px] font-bold text-blue-800">Next Milestone: Create Phase</div>
           <div className="text-[9px] text-blue-600 mt-0.5">Host a campus-wide event</div>
        </div>
      </div>
    )},
    { id: "Activity Catalogue", icon: List, title: "Discover Activities", desc: "Browse and enroll in upcoming campus events and clubs.", previewUi: (
      <div className="w-full mt-6 text-left space-y-2.5">
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex gap-3 items-center">
          <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
            <Sparkles className="h-5 w-5 text-purple-700" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-slate-900 leading-tight">Hackathon 2026</div>
            <div className="text-[10px] text-slate-500">Oct 15 • 150 Pts</div>
          </div>
          <div className="text-[9px] font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded-full shrink-0">Open</div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex gap-3 items-center opacity-90">
          <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
            <Users className="h-5 w-5 text-blue-700" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-slate-900 leading-tight">Robotics Club</div>
            <div className="text-[10px] text-slate-500">Oct 18 • 50 Pts</div>
          </div>
          <div className="text-[9px] font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-full shrink-0">Open</div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex gap-3 items-center opacity-60">
          <div className="h-10 w-10 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
            <Target className="h-5 w-5 text-amber-700" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-slate-900 leading-tight">Design Thinking</div>
            <div className="text-[10px] text-slate-500">Nov 2 • 100 Pts</div>
          </div>
          <div className="text-[9px] font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-full shrink-0">Soon</div>
        </div>
      </div>
    )},
    { id: "My Activities", icon: Activity, title: "My Activities", desc: "Manage your enrolled activities and submit attendance.", previewUi: (
      <div className="w-full mt-6 text-left space-y-2.5">
        <div className="bg-white p-3 rounded-xl border border-emerald-200 shadow-sm border-l-4 border-l-emerald-500 flex justify-between items-center">
          <div>
            <div className="text-sm font-bold text-slate-900">Leadership Seminar</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Today • 2:00 PM</div>
          </div>
          <div className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">Enrolled</div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-slate-300 flex justify-between items-center opacity-90">
          <div>
            <div className="text-sm font-bold text-slate-900">AI Workshop</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Oct 12</div>
          </div>
          <div className="text-[9px] font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">Completed</div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-slate-300 flex justify-between items-center opacity-70">
          <div>
            <div className="text-sm font-bold text-slate-900">Community Drive</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Sep 28</div>
          </div>
          <div className="text-[9px] font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">Completed</div>
        </div>
      </div>
    )},
    { id: "Competencies", icon: Target, title: "Competency Tracking", desc: "Watch your skills grow as you participate in activities.", previewUi: (
      <div className="w-full mt-6 text-left">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="space-y-3">
            {[
              { label: "Technical", val: "85%", color: "bg-red-800" },
              { label: "Leadership", val: "60%", color: "bg-red-700" },
              { label: "Communication", val: "90%", color: "bg-red-600" },
              { label: "Problem Solving", val: "75%", color: "bg-red-700" },
              { label: "Teamwork", val: "80%", color: "bg-red-500" }
            ].map(c => (
              <div key={c.label}>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>{c.label}</span>
                  <span className="text-red-800">{c.val}</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                  <div className={`h-full ${c.color} rounded-full`} style={{ width: c.val }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )},
    { id: "My Points", icon: TrendingUp, title: "Points & Leaderboard", desc: "See your SAMAM points and where you stand.", previewUi: (
      <div className="w-full mt-6 text-left space-y-3">
        <div className="bg-white p-4 rounded-xl border border-red-200 shadow-sm bg-gradient-to-br from-white to-red-50/50">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Total SAMAM Points</div>
          <div className="text-3xl font-black text-red-900 tracking-tight">2,500</div>
          <div className="mt-2 text-xs font-semibold text-emerald-600 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> +150 this week
          </div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-2">Recent Activity</div>
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-slate-700 font-medium">Hackathon 2026</span>
              <span className="text-emerald-600 font-bold">+150 Pts</span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-slate-700 font-medium">Leadership Seminar</span>
              <span className="text-emerald-600 font-bold">+50 Pts</span>
            </div>
          </div>
        </div>
      </div>
    )},
    { id: "Badge Wallet", icon: ShieldCheck, title: "Digital Badges", desc: "Collect and showcase your verified achievements.", previewUi: (
      <div className="w-full mt-6 grid grid-cols-2 gap-3">
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm text-center">
          <div className="h-10 w-10 rounded-full border-2 border-amber-200 bg-amber-100 flex items-center justify-center mx-auto mb-2">
            <Star className="h-5 w-5 text-amber-600" />
          </div>
          <div className="text-[10px] font-bold text-slate-800 leading-tight">Tech Innovator</div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm text-center">
          <div className="h-10 w-10 rounded-full border-2 border-blue-200 bg-blue-100 flex items-center justify-center mx-auto mb-2">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-[10px] font-bold text-slate-800 leading-tight">Community Leader</div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm text-center">
          <div className="h-10 w-10 rounded-full border-2 border-emerald-200 bg-emerald-100 flex items-center justify-center mx-auto mb-2">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="text-[10px] font-bold text-slate-800 leading-tight">Fast Learner</div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm text-center opacity-50 border-dashed">
          <div className="h-10 w-10 rounded-full border-2 border-slate-200 bg-slate-50 flex items-center justify-center mx-auto mb-2">
            <ShieldCheck className="h-5 w-5 text-slate-300" />
          </div>
          <div className="text-[10px] font-bold text-slate-400 leading-tight">Locked</div>
        </div>
      </div>
    )},
    { id: "Excellence Passport", icon: Award, title: "Excellence Passport", desc: "Your ultimate verified record of university life.", previewUi: (
      <div className="w-full mt-6 text-left">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[7px] font-bold px-2 py-0.5 rounded-bl-lg tracking-wider">VERIFIED PASSPORT</div>
          <div className="flex items-center gap-3 mb-4 mt-2">
            <div className="h-10 w-10 bg-slate-50 rounded-full flex items-center justify-center border border-slate-200 shrink-0">
              <User className="h-5 w-5 text-slate-300" />
            </div>
            <div className="flex-1 space-y-2 opacity-50">
              <div className="h-2 w-3/4 bg-slate-300 rounded-full"></div>
              <div className="h-2 w-1/2 bg-slate-200 rounded-full"></div>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-slate-100 justify-center">
            {[
              "About", "Academic", "Projects", "Internships", 
              "Research", "Leadership", "Community", "Achievements", "Timeline"
            ].map((cat, i) => (
              <span key={i} className="text-[9px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-1 rounded shadow-sm">
                {cat}
              </span>
            ))}
          </div>
        </div>
      </div>
    )},
    { id: "Career Dashboard", icon: LineChart, title: "AI Role Match", desc: "See which career roles best fit your current skills.", previewUi: (
      <div className="w-full mt-6 text-left space-y-2">
        <div className="bg-white p-3 rounded-xl border border-emerald-200 shadow-sm flex justify-between items-center">
          <div>
            <div className="text-xs font-bold text-slate-900">Data Scientist</div>
            <div className="text-[9px] text-emerald-600 font-bold uppercase mt-0.5">Top Match</div>
          </div>
          <div className="text-lg font-black text-emerald-600">94%</div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center opacity-90">
          <div>
            <div className="text-xs font-bold text-slate-900">Software Engineer</div>
          </div>
          <div className="text-sm font-black text-blue-600">88%</div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center opacity-70">
          <div>
            <div className="text-xs font-bold text-slate-900">Product Manager</div>
          </div>
          <div className="text-sm font-black text-amber-600">75%</div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center opacity-50">
          <div>
            <div className="text-xs font-bold text-slate-900">UX Researcher</div>
          </div>
          <div className="text-sm font-black text-slate-500">62%</div>
        </div>
      </div>
    )},
    { id: "Career Roadmap", icon: MapIcon, title: "Deep AI Analysis", desc: "A comprehensive analysis of your future path.", previewUi: (
      <div className="w-full mt-4 text-left">
        <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
          {[
            { label: "Personality & MBTI", icon: User },
            { label: "Career Role Match", icon: Target },
            { label: "CliftonStrengths", icon: Zap },
            { label: "Recommended MNCs", icon: Building },
            { label: "Gardner Intelligences", icon: Brain },
            { label: "Top Universities", icon: GraduationCap },
            { label: "Project Portfolio", icon: Briefcase },
            { label: "SAC Club Fits", icon: Users }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 bg-white border border-slate-200 p-2 rounded-lg shadow-sm hover:border-red-200 transition-colors">
              <div className="h-7 w-7 rounded-md bg-red-50 flex items-center justify-center shrink-0 border border-red-100">
                <item.icon className="h-3.5 w-3.5 text-red-700" />
              </div>
              <span className="text-[10px] font-bold text-slate-800 leading-tight">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    )},
    { id: "Reflection Journal", icon: BookOpen, title: "Journal Entries", desc: "Document your learnings and experiences.", previewUi: (
      <div className="w-full mt-6 text-left space-y-3">
        <div className="bg-[#fdfbf7] p-4 rounded-xl border border-[#e6decc] shadow-sm font-serif relative">
          <div className="absolute top-2 right-3 opacity-20"><BookOpen className="h-8 w-8 text-amber-900" /></div>
          <div className="text-[9px] text-[#a89f8b] font-sans font-bold uppercase mb-2">Today, 4:30 PM</div>
          <div className="text-xs text-slate-700 leading-relaxed italic pr-4">
            &quot;Leading the team today taught me that active listening is just as important as delegating tasks. I noticed a huge shift in morale.&quot;
          </div>
        </div>
        <div className="bg-[#fdfbf7] p-4 rounded-xl border border-[#e6decc] shadow-sm font-serif opacity-60">
          <div className="text-[9px] text-[#a89f8b] font-sans font-bold uppercase mb-2">Yesterday, 10:15 AM</div>
          <div className="text-xs text-slate-700 leading-relaxed italic">
            &quot;The coding workshop was challenging but I finally grasped the concept of hooks...&quot;
          </div>
        </div>
      </div>
    )},
    { id: "Certificates", icon: GraduationCap, title: "Certificates", desc: "Download official SAMAM activity certificates.", previewUi: (
      <div className="w-full mt-6 text-center">
        <div className="relative inline-block w-[85%] mt-2">
          {/* Back Certificate */}
          <div className="absolute -top-3 -right-3 w-full h-full bg-white/50 border border-slate-200 rounded-xl shadow-sm rotate-3"></div>
          {/* Main Certificate */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-md relative z-10">
            <div className="border border-amber-200/50 rounded-lg p-5 bg-amber-50/20 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-12 h-12 bg-amber-100 rounded-bl-full opacity-50"></div>
              <Award className="h-8 w-8 text-amber-500 mx-auto mb-2" />
              <div className="text-[10px] font-bold text-amber-900 uppercase tracking-widest mb-3">Certificate of Excellence</div>
              <div className="text-[9px] text-slate-500 mb-4">Awarded for outstanding leadership</div>
              <div className="h-1 w-3/4 bg-slate-200 rounded-full mx-auto mb-1.5"></div>
              <div className="h-1 w-1/2 bg-slate-200 rounded-full mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    )},
  ];
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-red-900/20 selection:text-red-900">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 sm:gap-6">
            <Image src="/sac-logo.png" alt="SAC Logo" width={80} height={40} className="h-8 sm:h-10 w-auto object-contain" priority />
            <div className="h-8 w-px bg-slate-300 hidden sm:block"></div>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-red-900 text-white shadow-md shadow-red-900/20">
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
              </div>
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-red-950 hidden sm:block">SAMAM</span>
            </div>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <Link
              href="/auth/login"
              className="text-sm font-semibold text-slate-600 transition-colors hover:text-red-900"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex h-9 sm:h-10 items-center justify-center rounded-lg bg-red-900 px-4 sm:px-6 text-xs sm:text-sm font-semibold text-white shadow-md shadow-red-900/20 transition-all hover:bg-red-800 hover:scale-105"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 pt-20">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-20 pb-20 lg:pt-24 lg:pb-24">
          <div className="absolute top-1/4 left-1/4 -z-10 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-100/60 blur-[100px]"></div>
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 lg:gap-8 items-center">
              {/* Left Content */}
              <div className="space-y-8 sm:space-y-10 text-center lg:text-left">
                <div className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-red-900">
                  <Sparkles className="mr-2 h-3 w-3 sm:h-4 sm:w-4 text-red-700 shrink-0" />
                  Student Activity Management &amp; Achievement Model
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl leading-[1.1] text-red-950">
                  Your Journey.<br />
                  <span className="text-red-800">Your Skills.</span><br />
                  Your Future.
                </h1>
                <p className="max-w-2xl text-base sm:text-xl text-slate-600 leading-relaxed mx-auto lg:mx-0 font-medium">
                  Discover what you can become. Every activity, experience, and achievement builds the ultimate portfolio of your university journey.
                </p>
                <div className="flex flex-row flex-wrap items-center gap-3 sm:gap-4 pt-2 justify-center lg:justify-start">
                  <Link
                    href="/auth/register"
                    className="inline-flex h-11 sm:h-14 items-center justify-center rounded-xl bg-red-900 text-white px-6 sm:px-8 text-sm sm:text-lg font-bold shadow-xl shadow-red-900/20 transition-all hover:bg-red-800 hover:-translate-y-1"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                  </Link>
                  <Link
                    href="/auth/login"
                    className="inline-flex h-11 sm:h-14 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 px-6 sm:px-8 text-sm sm:text-lg font-bold shadow-sm transition-all hover:border-red-200 hover:text-red-900 hover:-translate-y-1"
                  >
                    Sign In
                  </Link>
                </div>
              </div>

              {/* Interactive Dashboard Mockup */}
              <div className="relative h-[350px] sm:h-[450px] lg:h-[580px] w-full flex justify-center items-center mt-8 lg:mt-0">
                <div className="absolute w-[640px] h-[550px] rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200 shadow-2xl z-20 overflow-hidden flex origin-center scale-[0.55] sm:scale-[0.75] md:scale-90 lg:scale-100">
                  {/* Sidebar */}
                  <div className="w-[35%] border-r border-slate-100 bg-white flex flex-col shrink-0">
                    <div className="p-4 border-b border-slate-100 flex items-center gap-3">
                      <div className="h-8 w-8 bg-red-50 rounded-full flex items-center justify-center border border-red-100 shrink-0">
                        <User className="h-4 w-4 text-red-900" />
                      </div>
                      <div className="text-sm font-bold text-slate-900 truncate">Student Portal</div>
                    </div>
                    <div className="p-3 space-y-0.5 overflow-y-auto flex-1 custom-scrollbar" style={{ maxHeight: "calc(100% - 65px)" }}>
                      {MOCK_FEATURES.map((item) => (
                        <button 
                          key={item.id} 
                          onClick={() => setActiveFeature(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${activeFeature === item.id ? 'bg-red-50 text-red-900' : 'hover:bg-slate-50 text-slate-600'}`}
                        >
                          <item.icon className={`h-4 w-4 shrink-0 ${activeFeature === item.id ? 'text-red-700' : 'text-slate-400'}`} />
                          <span className="text-xs font-bold truncate">{item.id}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Main Content Area */}
                  <div className="w-[65%] bg-slate-50/50 p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-bl-full opacity-50"></div>
                    {MOCK_FEATURES.map((item) => activeFeature === item.id && (
                      <div key={item.id} className="relative z-10 animate-in fade-in zoom-in-95 duration-300 w-full">
                        <div className="h-16 w-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
                          <item.icon className="h-8 w-8 text-red-800" />
                        </div>
                        <h4 className="text-xl font-extrabold text-slate-900 mb-2">{item.title}</h4>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-[240px] mx-auto">{item.desc}</p>
                        
                        <div className="mt-4 w-full flex justify-center">
                          <div className="w-[95%]">
                            {item.previewUi}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 1 & 2. THE QUESTION & INTRODUCING SAMAM */}
        <section id="intro" className="border-t border-slate-100 bg-slate-50/50 py-16 md:py-20 lg:py-24">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-16 lg:grid-cols-2 lg:gap-24 items-start">
              <div className="space-y-8">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 border border-red-200 text-red-900">
                  <Search className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl text-red-950">Every student enters university with something unique.</h2>
                <p className="text-lg text-slate-600 leading-relaxed">
                  An interest. A talent. A dream. Maybe you love technology, maybe you are creative, or maybe you want to become a leader. But there is one important question:
                </p>
                <div className="rounded-2xl border border-red-200 bg-white p-8 shadow-sm">
                  <p className="text-2xl font-bold text-red-900 italic">
                    &quot;How do all these experiences become part of your future?&quot;
                  </p>
                </div>
              </div>
              <div className="space-y-8">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 border border-red-200 text-red-900">
                  <Rocket className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl text-red-950">Introducing SAMAM</h2>
                <p className="text-lg text-slate-600 leading-relaxed">
                  SAMAM connects your interests, your activities, your skills, your achievements and your career into one continuous development journey. It is not simply about attending activities. It is about discovering what you can become.
                </p>
                
                <div className="rounded-2xl bg-white border border-slate-200 p-8 shadow-sm">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-red-800 mb-6">Development Framework</h3>
                  <div className="flex flex-wrap items-center gap-3 font-semibold text-slate-700">
                    <span className="bg-slate-100 px-3 py-1 rounded-md border border-slate-200">Interest</span> <ArrowRight className="h-4 w-4 text-red-800" />
                    <span className="bg-slate-100 px-3 py-1 rounded-md border border-slate-200">Opportunity</span> <ArrowRight className="h-4 w-4 text-red-800" />
                    <span className="bg-slate-100 px-3 py-1 rounded-md border border-slate-200">Activity</span> <ArrowRight className="h-4 w-4 text-red-800" />
                    <span className="bg-slate-100 px-3 py-1 rounded-md border border-slate-200">Competency</span> <ArrowRight className="h-4 w-4 text-red-800" />
                    <span className="bg-slate-100 px-3 py-1 rounded-md border border-slate-200">Achievement</span> <ArrowRight className="h-4 w-4 text-red-800" />
                    <span className="bg-red-900 px-3 py-1 rounded-md shadow-sm text-white">Future</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3 & 4. START WITH WHAT YOU LOVE & DISCOVER OPPORTUNITIES */}
        <section className="py-16 md:py-20 lg:py-24 relative">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-2xl font-bold tracking-tight sm:text-4xl lg:text-5xl text-red-950 mb-6">Start With What You Love</h2>
              <p className="text-lg text-slate-600">
                Your SAMAM journey begins with you. Tell SAMAM what interests you. Instead of searching through different messages, departments and groups, SAMAM brings opportunities together.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-16">
              {[
                "Technology", "Research", "Management", "Liberal Arts", 
                "Cultural Activities", "Sports", "Outreach", "Leadership", 
                "Entrepreneurship", "Volunteering", "Innovation", "Community Service"
              ].map((interest) => (
                <div key={interest} className="group flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 text-center transition-all hover:border-red-800 hover:shadow-md hover:-translate-y-1 cursor-default">
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-red-900 transition-colors">{interest}</span>
                </div>
              ))}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-red-50 p-10 md:p-16 text-center shadow-sm">
              <h3 className="text-2xl font-bold text-red-950 mb-8">Discover Activities & Join Clubs</h3>
              <div className="flex flex-wrap justify-center gap-4">
                {[
                  "Coding Challenges", "Photography Workshops", "Business Competitions",
                  "Music Performances", "Sports Tournaments", "Research Projects",
                  "Student Leadership", "Technical Events"
                ].map((opp, i) => (
                  <span key={i} className="inline-flex items-center rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-700 border border-slate-200 shadow-sm">
                    <Star className="mr-2 h-4 w-4 text-red-800" />
                    {opp}
                  </span>
                ))}
              </div>
              <p className="mt-8 text-red-900 font-bold">Every meaningful experience can become part of your SAMAM journey.</p>
            </div>
          </div>
        </section>

        {/* 5, 6, 7. COMPETENCIES, EVIDENCE & POINTS */}
        <section className="border-t border-slate-100 bg-slate-50/50 py-16 md:py-20 lg:py-24">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-2xl font-bold tracking-tight sm:text-4xl lg:text-5xl text-red-950 mb-6">Activities Become Competencies</h2>
              <p className="text-lg text-slate-600">
                Every student develops differently. Different activities can develop different competencies.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-24">
              {[
                { activity: "Hackathon", skills: ["Problem Solving", "Innovation", "Teamwork", "Technical Skills"] },
                { activity: "Debate", skills: ["Communication", "Critical Thinking", "Confidence", "Argumentation"] },
                { activity: "Cultural", skills: ["Creativity", "Discipline", "Collaboration", "Artistic Expression"] },
                { activity: "Sports", skills: ["Teamwork", "Resilience", "Discipline", "Decision Making"] },
              ].map((item, i) => (
                <div key={i} className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                  <h4 className="text-xl font-bold text-red-950 mb-6 flex items-center">
                    <Activity className="h-5 w-5 text-red-800 mr-3" />
                    {item.activity}
                  </h4>
                  <ul className="space-y-3">
                    {item.skills.map((skill, j) => (
                      <li key={j} className="text-sm font-medium text-slate-600 flex items-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-red-800 mr-3"></div>
                        {skill}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <h3 className="text-3xl font-bold text-red-950">Your Work Becomes Evidence</h3>
                <p className="text-lg text-slate-600">
                  SAMAM goes beyond simply saying: &quot;I participated.&quot; Your work is documented, verified, mapped to competencies, and added to your achievement profile.
                </p>
                <div className="flex items-center space-x-2 text-sm font-bold text-slate-500">
                  <span>Activity</span> <ArrowRight className="h-4 w-4 text-red-800" />
                  <span>Evidence</span> <ArrowRight className="h-4 w-4 text-red-800" />
                  <span>Verification</span> <ArrowRight className="h-4 w-4 text-red-800" />
                  <span className="text-red-900">Achievement</span>
                </div>
              </div>

              <div className="rounded-3xl border border-red-100 bg-white p-10 shadow-lg shadow-slate-200/50">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold text-red-950">SAMAM Points & Achievements</h3>
                  <Award className="h-8 w-8 text-red-800" />
                </div>
                <p className="text-slate-600 mb-8 font-medium">
                  As you participate, contribute, lead and achieve, you earn SAMAM Points, badges, certificates and milestones. They represent your progress, contributions, and leadership.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {["Badges and Certificates", "Milestones", "Verified Achievements", "Leadership Recognition"].map((item, i) => (
                    <div key={i} className="flex items-center rounded-xl bg-slate-50 p-4 border border-slate-100">
                      <CheckCircle2 className="h-5 w-5 text-red-800 mr-3 shrink-0" />
                      <span className="text-sm font-bold text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 8. THE SIX-STAGE LEARNING JOURNEY */}
        <section className="py-16 md:py-20 lg:py-24 relative">
          <div className="absolute top-1/2 left-1/2 -z-10 h-[800px] w-[1000px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-50 blur-[120px]"></div>
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-2xl font-bold tracking-tight sm:text-4xl lg:text-5xl text-red-950 mb-6">The Six-Stage Learning Journey</h2>
              <p className="text-lg text-slate-600">
                SAMAM provides a progressive six-stage development journey. I Discover &rarr; I Develop &rarr; I Apply &rarr; I Lead &rarr; I Create &rarr; I Influence and Inspire.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                { level: "1. Explorer", title: "I Discover", desc: "Discover interests, opportunities, and communities. The objective is to explore possibilities.", icon: Compass, points: "Start" },
                { level: "2. Foundation", title: "I Develop", desc: "Build fundamental skills, communication, and professional awareness. Establish a strong base.", icon: BookOpen, points: "500 Points" },
                { level: "3. Practitioner", title: "I Apply", desc: "Participate in real-world projects, competitions, and technical challenges. Apply what you learn.", icon: Target, points: "1,250 Points" },
                { level: "4. Leader", title: "I Lead", desc: "Take responsibility, lead teams, organize initiatives, and drive student communities.", icon: Users, points: "2,000 Points" },
                { level: "5. Innovator", title: "I Create", desc: "Transform ideas into prototypes, solutions, and innovations with meaningful impact.", icon: Lightbulb, points: "3,000 Points" },
                { level: "6. Fellow", title: "I Influence", desc: "Demonstrate achievement, mentorship, and positive influence. Help others grow.", icon: Crown, points: "4,500 Points" },
              ].map((stage, i) => (
                <div key={i} className="relative group overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:shadow-xl hover:border-red-200 hover:-translate-y-1">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                    <stage.icon className="h-32 w-32 text-red-900" />
                  </div>
                  <div className="flex items-center justify-between mb-8 relative z-10">
                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 border border-red-100 text-red-900">
                      <stage.icon className="h-7 w-7" />
                    </div>
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-4 py-1.5 text-xs font-bold tracking-wide text-slate-600">
                      {stage.points}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-red-800 mb-2 relative z-10">{stage.level}</h3>
                  <h4 className="text-2xl font-extrabold text-red-950 mb-4 relative z-10">{stage.title}</h4>
                  <p className="text-slate-600 relative z-10 leading-relaxed font-medium">{stage.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 9, 10, 15, 16. GROWTH, PERSONALIZED, DIFFERENT PATHS */}
        <section className="border-t border-slate-100 bg-slate-50/50 py-16 md:py-20 lg:py-24">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16">
              <div className="space-y-12">
                <div>
                  <h3 className="text-3xl font-bold text-red-950 mb-6">From Participant to Leader</h3>
                  <p className="text-lg text-slate-600 mb-6">
                    SAMAM allows your university journey to evolve naturally. You may begin by attending an activity. Then become a contributor. Then an organizer. Then a leader.
                  </p>
                  <div className="flex flex-wrap gap-2 text-sm font-bold text-red-900 bg-red-50 p-4 rounded-xl border border-red-100">
                    Participant &rarr; Contributor &rarr; Leader &rarr; Innovator &rarr; Mentor
                  </div>
                </div>

                <div>
                  <h3 className="text-3xl font-bold text-red-950 mb-6">Personalized Development</h3>
                  <p className="text-lg text-slate-600 mb-6">
                    SAMAM helps you understand yourself. What are your strengths? What competencies are developing? What are you still missing? If your technical skills are strong but your communication needs improvement, SAMAM can guide you towards opportunities that help build that competency.
                  </p>
                </div>
              </div>

              <div className="space-y-12">
                <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-bl-full"></div>
                  <h3 className="text-2xl font-bold text-red-950 mb-6 relative z-10">SAMAM Grows With You</h3>
                  <p className="text-slate-600 mb-6 relative z-10 font-medium">
                    From your first year to your final year, SAMAM grows with you. Every activity, experience, and leadership role becomes part of one connected journey.
                  </p>
                  <h3 className="text-2xl font-bold text-red-950 mb-6 mt-12 relative z-10">Different Paths. One Framework.</h3>
                  <p className="text-slate-600 mb-6 relative z-10 font-medium">
                    You do not have to follow the same path as everyone else. A technology student explores coding. An artist explores creativity. An athlete develops resilience.
                  </p>
                  <p className="text-red-900 font-bold italic relative z-10 border-l-4 border-red-800 pl-4 py-2 bg-red-50 rounded-r-lg">
                    Different Activities. Different Disciplines. Different Aspirations. One Development Framework.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 11, 12, 13, 14. EXCELLENCE PASSPORT & OUTCOMES */}
        <section className="py-16 md:py-20 lg:py-24 bg-red-950 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900 to-red-950"></div>
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="mx-auto max-w-3xl text-center space-y-8 mb-20">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 text-white backdrop-blur-md border border-white/20 shadow-2xl mb-4">
                <Fingerprint className="h-10 w-10" />
              </div>
              <h2 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-white">Your Excellence Passport</h2>
              <p className="text-xl text-red-100 leading-relaxed font-medium">
                It is not just a collection of certificates. It is a complete picture of what you have actually done, experienced and developed. Your Journey. Your Evidence. Your Achievement Story.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="rounded-3xl bg-white p-10 border border-red-900/50 hover:-translate-y-2 transition-transform shadow-2xl">
                <LineChart className="h-10 w-10 text-red-900 mb-6" />
                <h3 className="text-2xl font-bold text-red-950 mb-4">SAMAM & Your Career</h3>
                <p className="text-slate-600 mb-6 font-medium">
                  Compare the competencies you have developed with what your career goal requires. Identify your strengths and skill gaps.
                </p>
                <p className="text-xs font-bold text-red-800 uppercase tracking-wider bg-red-50 p-3 rounded-lg text-center">Competency &rarr; Skill Gap &rarr; Opportunity</p>
              </div>

              <div className="rounded-3xl bg-white p-10 border border-red-900/50 hover:-translate-y-2 transition-transform shadow-2xl">
                <Briefcase className="h-10 w-10 text-red-900 mb-6" />
                <h3 className="text-2xl font-bold text-red-950 mb-4">Job Opportunities</h3>
                <p className="text-slate-600 font-medium leading-relaxed">
                  Employers want to know what you have built and problems you have solved. SAMAM helps you build and present evidence of practical experience, leadership, and teamwork to compete for internships and employment.
                </p>
              </div>

              <div className="rounded-3xl bg-white p-10 border border-red-900/50 hover:-translate-y-2 transition-transform shadow-2xl">
                <GraduationCap className="h-10 w-10 text-red-900 mb-6" />
                <h3 className="text-2xl font-bold text-red-950 mb-4">Higher Education</h3>
                <p className="text-slate-600 font-medium leading-relaxed">
                  Demonstrate much more than grades. Showcase research, projects, innovation, and community contributions to present a richer, broader record of who you are as a student.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* AI CAREER TOOLS */}
        <section className="border-t border-slate-100 bg-white py-16 md:py-20 lg:py-24">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-900 mb-6">
                <Sparkles className="mr-2 h-4 w-4 text-red-700" />
                AI-Powered Career Intelligence
              </div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-4xl lg:text-5xl text-red-950 mb-6">Your Future, Data-Driven.</h2>
              <p className="text-lg text-slate-600">
                SAMAM doesn&apos;t just track your past; it predicts and plans your future. Using advanced AI, SAMAM analyzes your competencies, personality, and learning style to generate hyper-personalized career guidance.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8">
              {/* Career Dashboard */}
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-10 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-14 w-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                    <Target className="h-7 w-7 text-red-800" />
                  </div>
                  <h3 className="text-2xl font-bold text-red-950">Career Dashboard</h3>
                </div>
                <p className="text-slate-600 mb-6 font-medium leading-relaxed">
                  SAMAM AI scans your entire profile—activities, projects, and competencies—and ranks the top career roles you&apos;re best suited for. Check your fit for any specific role and get a personalized improvement plan to close your skill gaps.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start text-sm font-bold text-slate-700">
                    <CheckCircle2 className="h-5 w-5 text-red-700 mr-3 shrink-0" /> Real-time Competency Scoring
                  </li>
                  <li className="flex items-start text-sm font-bold text-slate-700">
                    <CheckCircle2 className="h-5 w-5 text-red-700 mr-3 shrink-0" /> AI Role Match Scanning
                  </li>
                  <li className="flex items-start text-sm font-bold text-slate-700">
                    <CheckCircle2 className="h-5 w-5 text-red-700 mr-3 shrink-0" /> Specific Role Fit Analysis &amp; Growth Plans
                  </li>
                </ul>
              </div>

              {/* Career Roadmap */}
              <div className="rounded-3xl border border-red-100 bg-red-50 p-10 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-14 w-14 rounded-2xl bg-white border border-red-200 flex items-center justify-center shadow-sm">
                    <MapIcon className="h-7 w-7 text-red-800" />
                  </div>
                  <h3 className="text-2xl font-bold text-red-950">AI Career Roadmap Analysis</h3>
                </div>
                <p className="text-slate-600 mb-8 font-medium leading-relaxed max-w-4xl">
                  Take our deep assessment covering your personality, learning style, and career vision. SAMAM generates a complete, strategic 15-point analysis tailored exactly to you:
                </p>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6">
                  {[
                    "1. Career Paths Matched to Your Profile",
                    "2. SAC Clubs Recommended for You",
                    "3. Personality Profile",
                    "4. Myers-Briggs (MBTI) Type",
                    "5. CliftonStrengths — Your Top 5 Themes",
                    "6. Gardner's Multiple Intelligence",
                    "7. Bloom's Taxonomy Level",
                    "8. Your Roadmap to Achieve Your Goal",
                    "9. Research Areas to Explore",
                    "10. Project & Portfolio Ideas",
                    "11. Top MNCs for Jobs",
                    "12. Top Universities for Higher Ed",
                    "13. Skills to Master",
                    "14. Social Impact Opportunities",
                    "15. Personal Development Plan"
                  ].map((item, i) => (
                    <div key={i} className="flex items-start text-sm font-bold text-slate-700">
                      <CheckCircle2 className="h-4 w-4 text-red-700 mr-2 shrink-0 mt-0.5" /> 
                      <span className="leading-tight">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 17. PHILOSOPHY & AT A GLANCE */}
        <section className="bg-slate-50 py-16 md:py-20 lg:py-24">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-4xl lg:text-5xl text-red-950 mb-16">The SAMAM Philosophy</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-24">
              {[
                { title: "Identify", desc: "Understand your interests & aspirations" },
                { title: "Engage", desc: "Discover and participate" },
                { title: "Develop", desc: "Build skills and competencies" },
                { title: "Map", desc: "Connect activities with evidence" },
                { title: "Measure", desc: "Track progress and achievements" },
                { title: "Achieve", desc: "Build a verified record" },
              ].map((step, i) => (
                <div key={i} className="flex flex-col items-center p-6 rounded-2xl bg-white border border-slate-200 shadow-sm relative">
                  <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-900 font-extrabold mb-4 border border-red-200 shadow-sm">
                    {i + 1}
                  </div>
                  <h4 className="text-lg font-bold text-slate-800 mb-2">{step.title}</h4>
                  <p className="text-xs text-slate-500 font-medium">{step.desc}</p>
                </div>
              ))}
            </div>

            <div className="rounded-3xl border border-red-100 bg-white p-10 md:p-16 text-left max-w-4xl mx-auto shadow-xl">
              <h3 className="text-2xl font-bold text-red-950 mb-8 border-b border-slate-100 pb-4">SAMAM At A Glance</h3>
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className="text-red-900 font-bold w-48 shrink-0 mb-1 sm:mb-0">Development Journey:</span>
                  <span className="text-slate-700 font-medium">I Discover &rarr; I Develop &rarr; I Apply &rarr; I Lead &rarr; I Create &rarr; I Influence and Inspire</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className="text-red-900 font-bold w-48 shrink-0 mb-1 sm:mb-0">Framework:</span>
                  <span className="text-slate-700 font-medium">Identify &rarr; Engage &rarr; Develop &rarr; Map &rarr; Measure &rarr; Achieve</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className="text-red-900 font-bold w-48 shrink-0 mb-1 sm:mb-0">Core Journey:</span>
                  <span className="text-slate-700 font-medium">Interest &rarr; Opportunity &rarr; Activity &rarr; Competency &rarr; Achievement &rarr; Future</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className="text-red-900 font-bold w-48 shrink-0 mb-1 sm:mb-0">Evidence Framework:</span>
                  <span className="text-slate-700 font-medium">Activity &rarr; Evidence &rarr; Verification &rarr; Competency &rarr; Achievement</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 18. FINAL MESSAGE & CTA */}
        <section className="py-32 relative overflow-hidden bg-white">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-red-50 via-white to-white"></div>
          <div className="container mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-slate-800 mb-8">
              From Student Activities... <br/>
              <span className="text-red-900">to Student Excellence.</span>
            </h2>
            <p className="text-2xl font-light text-slate-600 mb-12 leading-relaxed">
              Your university gives you opportunities. SAMAM helps you turn those opportunities into your journey. Your competencies. Your achievements. And your future.
            </p>
            <div className="flex flex-col items-center gap-6">
              <Link
                href="/auth/register"
                className="inline-flex h-16 items-center justify-center rounded-xl bg-red-900 px-12 text-xl font-bold text-white shadow-xl shadow-red-900/30 transition-all hover:bg-red-800 hover:-translate-y-1 hover:shadow-2xl hover:shadow-red-900/40"
              >
                Welcome to SAMAM
                <ArrowRight className="ml-3 h-6 w-6" />
              </Link>
              <div className="flex flex-wrap justify-center gap-4 text-sm font-bold text-red-900 mt-8">
                <span className="bg-red-50 px-3 py-1 rounded-full">Discover.</span>
                <span className="bg-red-50 px-3 py-1 rounded-full">Develop.</span>
                <span className="bg-red-50 px-3 py-1 rounded-full">Apply.</span>
                <span className="bg-red-50 px-3 py-1 rounded-full">Lead.</span>
                <span className="bg-red-50 px-3 py-1 rounded-full">Create.</span>
                <span className="bg-red-50 px-3 py-1 rounded-full">Inspire.</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-12">
        <div className="container mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-900 text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-red-950">SAMAM</span>
          </div>
          <p className="text-slate-600 font-semibold">
            Student Activity Management & Achievement Model
          </p>
          <div className="mt-8 flex justify-center gap-4 text-xs font-bold text-red-800 uppercase tracking-widest">
            <span>Your Journey.</span>
            <span>Your Skills.</span>
            <span>Your Achievements.</span>
            <span>Your Future.</span>
          </div>
          <div className="mt-8 text-xs font-medium text-slate-400 flex flex-col items-center gap-2">
            <div>&copy; {new Date().getFullYear()} SAMAM. All rights reserved.</div>
            <div>
              Designed and Developed By{" "}
              <a 
                href="https://www.linkedin.com/in/singananischal/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-red-800 hover:text-red-950 hover:underline font-bold transition-colors"
              >
                Nischal Singana
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}