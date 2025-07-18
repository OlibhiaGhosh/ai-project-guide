"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronDown,
  ChevronRight,
  Loader2,
  Sparkles,
  Eye,
  EyeOff,
  Key,
} from "lucide-react";
interface element {
  key: string;
  value: string;
}
interface ProjectGuide {
  projectAnalysis: Array<element>;
  recommendedStack: Array<element>;
  initialSetupSteps: Array<element>;
  projectStructure: Array<element>;
  implementationStrategy: Array<element>;
  resources: Array<element>;
}

export default function ProjectGuide() {
  const [formData, setFormData] = useState({
    projectIdea: "",
    applicationType: "",
    developmentType: "",
    additionalRequirements: "",
    technicalLevel: "",
    preferredTechStack: "",
  });

  const [guide, setGuide] = useState<ProjectGuide | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  );
  const [error, setError] = useState<string>("");
  const [remaining, setRemaining] = useState<number>();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError(""); // Clear error when user starts typing
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };
  const generateGuide = async () => {
    if (!formData.projectIdea.trim()) {
      setError("Please provide your project idea");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/generate-guide", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const { result, remaining } = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to generate guide");
      }

      setGuide(result);
      setRemaining(remaining);
    } catch (error) {
      console.error("Error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to generate project guide. Please try again."
      );
      setRemaining(remaining);
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    { key: "projectAnalysis", title: "Project Analysis", icon: "🔍" },
    { key: "recommendedStack", title: "Recommended Stack", icon: "⚡" },
    { key: "initialSetupSteps", title: "Initial Setup Steps", icon: "🚀" },
    { key: "projectStructure", title: "Project Structure", icon: "📁" },
    {
      key: "implementationStrategy",
      title: "Implementation Strategy",
      icon: "🎯",
    },
    { key: "resources", title: "Resources", icon: "📚" },
  ];

  return (
    <div className=" min-h-screen bg-black text-[#F6F6F6] font-geist-mono">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#F6F6F6] mb-4 flex items-center justify-center gap-2 max-sm:text-3xl">
            <p className="text-[#9af1ba]">Project</p>{" "}
            <p className="text-[#9af1ba]">Guide</p> Generator
          </h1>
          <p className="text-gray-300 text-lg max-sm:text-md">
            Get AI-powered guidance to bring your project ideas to life
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card
            className="h-max rounded-xl bg-black bg-gradient-to-r from-[#CFFFE2]/20 via-black to-[#CFFFE2]/20 backdrop-invert backdrop-opacity-10 shadow-inner inset-64 shadow-[#CFFFE2]/50 border-[#A2D5C6]"
          >
            <CardHeader>
              <CardTitle className="text-[#c8f4d8] text-2xl ">
                Project Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6" suppressHydrationWarning={true}>
              <div>
                <label className="block text-[#F6F6F6] font-medium mb-2">
                  Project Idea (Required)
                </label>
                <Textarea
                  placeholder="Describe your project idea in detail..."
                  value={formData.projectIdea}
                  onChange={(e) =>
                    handleInputChange("projectIdea", e.target.value)
                  }
                  className="bg-black/30 border-[#A2D5C6]/50 text-[#F6F6F6] placeholder-gray-400 focus:border-[#CFFFE2]"
                  rows={4}
                  suppressHydrationWarning={true}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#F6F6F6] font-medium mb-2">
                    Application Type
                  </label>
                  <Select
                    onValueChange={(value) =>
                      handleInputChange("applicationType", value)
                    }
                  >
                    <SelectTrigger
                      className="bg-black/30 border-[#A2D5C6]/50 focus:border-[#A2D5C6] text-[#F6F6F6]"
                      suppressHydrationWarning={true}
                    >
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-[#A2D5C6]/50 focus:border-[#A2D5C6]">
                      <SelectItem value="web">Web Application</SelectItem>
                      <SelectItem value="mobile">Mobile Application</SelectItem>
                      <SelectItem value="desktop">
                        Desktop Application
                      </SelectItem>
                      <SelectItem value="api">API/Backend Service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-[#F6F6F6] font-medium mb-2">
                    Development Type
                  </label>
                  <Select
                    onValueChange={(value) =>
                      handleInputChange("developmentType", value)
                    }
                  >
                    <SelectTrigger
                      className="bg-black/30 border-[#A2D5C6]/50 text-[#F6F6F6]"
                      suppressHydrationWarning={true}
                    >
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-[#A2D5C6]/50">
                      <SelectItem value="frontend">Frontend Only</SelectItem>
                      <SelectItem value="backend">Backend Only</SelectItem>
                      <SelectItem value="fullstack">Full Stack</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-[#F6F6F6] font-medium mb-2">
                  Technical Level
                </label>
                <Select
                  onValueChange={(value) =>
                    handleInputChange("technicalLevel", value)
                  }
                >
                  <SelectTrigger
                    className="bg-black/30 border-[#A2D5C6]/50 text-[#F6F6F6]"
                    suppressHydrationWarning={true}
                  >
                    <SelectValue placeholder="Select your level" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-[#A2D5C6]/50">
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-[#F6F6F6] font-medium mb-2">
                  Preferred Tech Stack (Optional)
                </label>
                <Input
                  placeholder="e.g., React, Node.js, MongoDB..."
                  value={formData.preferredTechStack}
                  onChange={(e) =>
                    handleInputChange("preferredTechStack", e.target.value)
                  }
                  className="bg-black/30 border-[#A2D5C6]/50 text-[#F6F6F6] placeholder-gray-400 focus:border-[#CFFFE2]/50"
                  suppressHydrationWarning={true}
                />
              </div>

              <div>
                <label className="block text-[#F6F6F6] font-medium mb-2">
                  Additional Requirements (Optional)
                </label>
                <Textarea
                  placeholder="Any specific features, constraints, or requirements..."
                  value={formData.additionalRequirements}
                  onChange={(e) =>
                    handleInputChange("additionalRequirements", e.target.value)
                  }
                  className="bg-black/30 border-[#A2D5C6]/50 text-[#F6F6F6] placeholder-gray-400 focus:border-[#CFFFE2]/50"
                  rows={3}
                  suppressHydrationWarning={true}
                />
              </div>

              {error && (
                <div className="bg-red-900/50 border border-red-500/50 rounded-lg p-3">
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              <Button
                onClick={generateGuide}
                disabled={
                  loading ||
                  !formData.projectIdea.trim() ||
                  !formData.technicalLevel
                }
                className="w-full bg-[#89ffdc] hover:bg-[#CFFFE2] text-black font-semibold py-3"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Guide...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Project Guide
                  </>
                )}
              </Button>
              <div className="text-gray-400 text-sm mt-2">
                <p>Limit: 10 requests per 30 days </p>
                {remaining !== undefined && (
                  <p>Remaining requests: {remaining}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4 ">
            {guide ? (
              <>
                {sections.map((section) => (
                  <Card
                    key={section.key}
                    className="rounded-lg bg-black bg-gradient-to-r from-[#CFFFE2]/20 via-black to-[#CFFFE2]/20 backdrop-invert backdrop-opacity-10 shadow-inner inset-64 shadow-[#CFFFE2]/50 border-[#A2D5C6]"
                  >
                    <CardHeader
                      className="cursor-pointer hover:bg-[#CFFFE2]/50 transition-colors"
                      onClick={() => toggleSection(section.key)}
                    >
                      <CardTitle className="text-[#CFFFE2] flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <span>{section.icon}</span>
                          {section.title}
                        </span>
                        {expandedSections.has(section.key) ? (
                          <ChevronDown className="h-5 w-5" />
                        ) : (
                          <ChevronRight className="h-5 w-5" />
                        )}
                      </CardTitle>
                    </CardHeader>
                    {expandedSections.has(section.key) && (
                      <CardContent>
                        <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                          {guide[section.key as keyof ProjectGuide].map(
                            (item, index) => (
                              <div key={index} className="mb-3">
                                <p className="font-semibold text-[#CFFFE2] text-lg">
                                  {item["key"]}
                                </p>
                                <p className="text-white">{item["value"]}</p>
                              </div>
                            )
                          )}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </>
            ) : (
              <div className="bg-black">
                <div className="text-center py-24">
                  <Sparkles className="h-16 w-16 text-[#A2D5C6] mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-[#F6F6F6] mb-2">
                    Ready to Generate Your Guide
                  </h3>
                  <p className="text-gray-400">
                    Fill out the form and click "Generate Project Guide" to get
                    started
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
