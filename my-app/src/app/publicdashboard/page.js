"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FiUsers,
  FiBriefcase,
  FiFolder,
  FiTrendingUp,
  FiUser,
  FiCalendar,
} from "react-icons/fi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PublicDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true; // Prevents state update if unmounted
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/public-stats");
        if (response.ok) {
          const data = await response.json();
          if (isMounted) setStats(data.data);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchStats();
    return () => {
      isMounted = false;
    };
  }, []);

  const getColorClasses = (color) => {
    switch (color) {
      case "blue":
        return "border-blue-500 text-blue-600 bg-blue-50";
      case "green":
        return "border-green-500 text-green-600 bg-green-50";
      case "purple":
        return "border-purple-500 text-purple-600 bg-purple-50";
      case "orange":
        return "border-orange-500 text-orange-600 bg-orange-50";
      case "red":
        return "border-red-500 text-red-600 bg-red-50";
      default:
        return "border-gray-500 text-gray-600 bg-gray-50";
    }
  };

  const statCards = [
    {
      title: "Total Students",
      value: stats?.overview?.totalStudents,
      icon: FiUsers,
      color: "blue",
    },
    {
      title: "Active Clubs",
      value: stats?.overview?.totalClubs,
      icon: FiBriefcase,
      color: "green",
    },
    {
      title: "Total Projects",
      value: stats?.overview?.totalProjects,
      icon: FiFolder,
      color: "purple",
    },
    {
      title: "Active Projects",
      value: stats?.overview?.activeProjects,
      icon: FiTrendingUp,
      color: "orange",
    },
  ];

  // Helper to avoid repetitive fallback logic for distributive/array stats
  const renderStatList = (arr, renderItem) => {
    if (loading) {
      return (
        <div className="text-center text-gray-500 py-4">Loading...</div>
      );
    }
    if (!Array.isArray(arr) || arr.length === 0) {
      return (
        <div className="text-center text-gray-500 py-4">
          No data available
        </div>
      );
    }
    return arr.map(renderItem);
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#1a1a1a" }}
    >
      {/* Navbar */}
      <nav
        className="text-white shadow-lg relative z-30 flex-shrink-0"
        style={{ backgroundColor: "rgb(151, 0, 3)" }}
      >
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">Student Activity Center</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/auth/login"
                className="flex items-center space-x-2 px-3 py-2 rounded-md transition-colors text-sm"
                style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = "rgba(255, 255, 255, 0.3)")
                }
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor = "rgba(255, 255, 255, 0.2)")
                }
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </nav>
      {loading ? (
        // Loading Spinner
        <div className="flex-1 bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-800"></div>
        </div>
      ) : (
        // Main Content - Scrollable
        <div className="flex-1 bg-gray-50 overflow-y-auto">
          <div className="w-[85%] mx-auto px-4 py-6">
            <div className="mb-8">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Public Dashboard
                  </h1>
                  <p className="mt-2 text-gray-600">
                    Student Activity Center - Community Statistics
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {statCards.map((stat, index) => {
                const Icon = stat.icon;
                const colorClasses = getColorClasses(stat.color);

                return (
                  <Card
                    key={index}
                    className={`cursor-pointer hover:shadow-lg transition-shadow border-l-4 ${colorClasses}`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            {stat.title}
                          </p>
                          <p className="text-3xl font-bold text-gray-900">
                            {stat.value !== undefined &&
                            stat.value !== null &&
                            !isNaN(Number(stat.value))
                              ? stat.value.toLocaleString()
                              : 0}
                          </p>
                        </div>
                        <Icon
                          className={`h-8 w-8 ${
                            stat.color === "blue"
                              ? "text-blue-500"
                              : stat.color === "green"
                              ? "text-green-500"
                              : stat.color === "purple"
                              ? "text-purple-500"
                              : stat.color === "orange"
                              ? "text-orange-500"
                              : stat.color === "red"
                              ? "text-red-500"
                              : "text-gray-500"
                          }`}
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Domain Statistics */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Domain Distribution
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {[
                  { label: "TEC", border: "border-blue-200", bg: "bg-blue-50", txt: "text-blue-700", val: "text-blue-800" },
                  { label: "LCH", border: "border-green-200", bg: "bg-green-50", txt: "text-green-700", val: "text-green-800" },
                  { label: "ESO", border: "border-yellow-200", bg: "bg-yellow-50", txt: "text-yellow-700", val: "text-yellow-800" },
                  { label: "IIE", border: "border-orange-200", bg: "bg-orange-50", txt: "text-orange-700", val: "text-orange-800" },
                  { label: "HWB", border: "border-pink-200", bg: "bg-pink-50", txt: "text-pink-700", val: "text-pink-800" },
                ].map((domain) => (
                  <Card
                    key={domain.label}
                    className={`${domain.border} ${domain.bg}`}
                  >
                    <CardContent className="p-4 text-center">
                      <div className={`text-sm font-medium ${domain.txt} mb-1`}>
                        {domain.label}
                      </div>
                      <div className={`text-2xl font-bold ${domain.val}`}>
                        {stats?.studentsByDomain?.find(
                          (d) => d.selectedDomain === domain.label
                        )?.count ?? 0}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Additional Statistics - 3 columns in a row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Students by Year */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FiCalendar className="mr-2 h-5 w-5 text-blue-600" />
                    Students by Year
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {renderStatList(stats?.studentsByYear, (item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm text-gray-600 capitalize">
                          {item.year} Year
                        </span>
                        <Badge variant="outline" className="font-semibold">
                          {item.count}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Gender Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FiUser className="mr-2 h-5 w-5 text-purple-600" />
                    Gender Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {renderStatList(stats?.genderDistribution, (item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm text-gray-600 capitalize">
                          {item.gender || "Not specified"}
                        </span>
                        <Badge variant="outline" className="font-semibold">
                          {item.count}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>


              {/* Clubs by Domain */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FiBriefcase className="mr-2 h-5 w-5 text-orange-600" />
                    Clubs by Domain
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {renderStatList(stats?.clubsByDomain, (item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm text-gray-600 capitalize">
                          {item.domain}
                        </span>
                        <Badge variant="outline" className="font-semibold">
                          {item.count}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer
        className="text-white py-2 px-4 text-center text-sm flex-shrink-0"
        style={{ backgroundColor: "rgb(151, 0, 3)" }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <span>© 2025 KL University SAC Activities. All Rights Reserved.</span>
          <span className="mt-1 sm:mt-0">
            Designed and Developed by Pavan Karthik Garaga | ZeroOne CodeClub
          </span>
        </div>
      </footer>
    </div>
  );
}
