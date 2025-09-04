"use client";

import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { motion } from "framer-motion";
import {
  FormInput,
  BarChart3,
  Zap,
  Smartphone,
  Shield,
  Code2,
  Globe,
  Server,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Heart,
  Users,
  Clock,
  TrendingUp,
} from "lucide-react";
import ShaderBackground from "./ui/shader-background";

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const features = [
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "AI-Powered Generation",
      description:
        "Describe your needs and let AI create professional forms instantly. No more starting from scratch - just intelligent form building.",
    },
    {
      icon: <FormInput className="w-8 h-8" />,
      title: "Smart Drag & Drop",
      description:
        "Simply drag fields where you want them. AI suggests optimal layouts and field types for better user experience.",
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Real-Time Analytics",
      description:
        "Watch responses come in real-time with AI-powered insights that help you understand trends and patterns in your data.",
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: "Mobile-First Design",
      description:
        "Your forms look perfect on phones, tablets, and computers. AI optimizes layouts for every device automatically.",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Enterprise Security",
      description:
        "Your data is protected with bank-level security and AI-powered threat detection. Focus on your business with confidence.",
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "AI-Enhanced UX",
      description:
        "Create forms that convert better with AI suggestions for field placement, styling, and user flow optimization.",
    },
  ];

  const benefits = [
    {
      name: "Always Available",
      category: "24/7 Uptime",
      color: "bg-green-500",
    },
    {
      name: "Lightning Fast",
      category: "Instant Loading",
      color: "bg-blue-500",
    },
    { name: "Mobile Friendly", category: "Any Device", color: "bg-purple-500" },
    { name: "Secure", category: "Bank-Level Security", color: "bg-red-500" },
    {
      name: "Easy to Use",
      category: "No Learning Curve",
      color: "bg-orange-500",
    },
    { name: "Real-time", category: "Live Updates", color: "bg-cyan-500" },
    {
      name: "Professional",
      category: "Beautiful Design",
      color: "bg-pink-500",
    },
    { name: "Reliable", category: "Never Breaks", color: "bg-indigo-500" },
  ];

  const useCases = [
    {
      category: "Small Business",
      items: [
        "Customer feedback forms",
        "Service booking requests",
        "Contact and inquiry forms",
        "Product order forms",
        "Newsletter signups",
      ],
    },
    {
      category: "Events & Organizations",
      items: [
        "Event registration forms",
        "Volunteer signup sheets",
        "Membership applications",
        "Donation collection",
        "Survey and polling",
      ],
    },
    {
      category: "Education",
      items: [
        "Student registration",
        "Parent-teacher communication",
        "Course evaluation surveys",
        "Field trip permission slips",
        "Application forms",
      ],
    },
    {
      category: "Healthcare & Services",
      items: [
        "Appointment scheduling",
        "Patient intake forms",
        "Service requests",
        "Insurance claims",
        "Consultation bookings",
      ],
    },
  ];

  return (
    <ShaderBackground>
    <div className="relative z-10">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="container mx-auto px-6 pt-20 pb-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="flex justify-center mb-6">
              <Badge
                variant="secondary"
                className="px-4 py-2 text-sm font-medium"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                AI-Powered Form Builder for Everyone
              </Badge>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white drop-shadow-lg mb-8 leading-tight">
              AI-Powered Form Builder
              <br />
              <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                Create Forms in Minutes
              </span>
            </h1>

            <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
              Build professional forms with AI assistance. Whether you need contact forms, surveys, or event registrations,
              our intelligent form builder creates professional forms instantly. Collect responses and see results in real-time.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={onGetStarted}
                size="lg"
                className="px-8 py-6 text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            <div className="mt-16 flex justify-center items-center gap-8 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                No Technical Skills Needed
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Free to Get Started
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                See Results Instantly
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Key Features Grid */}
      <div className="container mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-6 text-white drop-shadow-lg">
            Everything You Need for
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {" "}
              Perfect Forms
            </span>
          </h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto drop-shadow-md">
            Whether you&apos;re collecting feedback, registrations, or leads, we
            make it simple to create professional forms that get results.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-background/80 backdrop-blur-md border-white/20">
                <CardHeader>
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-xl flex items-center justify-center mb-4 text-blue-600">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl text-white">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed text-white/80">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Capabilities Section */}
      <div className="py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-6 text-white drop-shadow-lg">
              Perfect for
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {" "}
                Every Business
              </span>
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto drop-shadow-md">
              No matter what industry you&apos;re in, FormCraft helps you collect information,
              connect with customers, and grow your business.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {useCases.map((useCase, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full bg-background/60 backdrop-blur-sm border-white/10">
                  <CardHeader>
                    <CardTitle className="text-lg text-center text-white">
                      {useCase.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {useCase.items.map((item, itemIndex) => (
                        <li
                          key={itemIndex}
                          className="flex items-start gap-2 text-sm"
                        >
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-white/80">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Tech Stack Section */}
      <div className="container mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-6 text-white drop-shadow-lg">
            Why Choose
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {" "}
              FormCraft?
            </span>
          </h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto drop-shadow-md">
            We&apos;ve built the most reliable and user-friendly form platform so you
            can focus on what matters most - your business.
          </p>
        </motion.div>

        <div className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-background/70 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-500/20 to-purple-600/20">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Feature</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-white">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">FormCraft</span>
                        <Badge className="bg-green-500 text-white text-xs">Our Platform</Badge>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-white/80">Typeform</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-white/80">Google Forms</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-white/80">JotForm</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  <tr className="hover:bg-white/5">
                    <td className="px-6 py-4 text-sm text-white font-medium">Real-time Analytics</td>
                    <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-green-500 mx-auto" /></td>
                    <td className="px-6 py-4 text-center text-white/70">Limited</td>
                    <td className="px-6 py-4 text-center text-white/70">Basic</td>
                    <td className="px-6 py-4 text-center text-white/70">Paid Only</td>
                  </tr>
                  <tr className="hover:bg-white/5">
                    <td className="px-6 py-4 text-sm text-white font-medium">Drag & Drop Builder</td>
                    <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-green-500 mx-auto" /></td>
                    <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-green-500 mx-auto" /></td>
                    <td className="px-6 py-4 text-center text-white/70">✗</td>
                    <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr className="hover:bg-white/5">
                    <td className="px-6 py-4 text-sm text-white font-medium">Unlimited Forms</td>
                    <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-green-500 mx-auto" /></td>
                    <td className="px-6 py-4 text-center text-white/70">Paid Plans</td>
                    <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-green-500 mx-auto" /></td>
                    <td className="px-6 py-4 text-center text-white/70">Limited Free</td>
                  </tr>
                  <tr className="hover:bg-white/5">
                    <td className="px-6 py-4 text-sm text-white font-medium">Custom Branding</td>
                    <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-green-500 mx-auto" /></td>
                    <td className="px-6 py-4 text-center text-white/70">Pro Plans</td>
                    <td className="px-6 py-4 text-center text-white/70">Limited</td>
                    <td className="px-6 py-4 text-center text-white/70">Paid Only</td>
                  </tr>
                  <tr className="hover:bg-white/5">
                    <td className="px-6 py-4 text-sm text-white font-medium">Advanced Field Types</td>
                    <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-green-500 mx-auto" /></td>
                    <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-green-500 mx-auto" /></td>
                    <td className="px-6 py-4 text-center text-white/70">Basic Only</td>
                    <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr className="hover:bg-white/5">
                    <td className="px-6 py-4 text-sm text-white font-medium">No Response Limits</td>
                    <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-green-500 mx-auto" /></td>
                    <td className="px-6 py-4 text-center text-white/70">100/month free</td>
                    <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-green-500 mx-auto" /></td>
                    <td className="px-6 py-4 text-center text-white/70">100/month free</td>
                  </tr>
                  <tr className="hover:bg-white/5">
                    <td className="px-6 py-4 text-sm text-white font-medium">Open Source</td>
                    <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-green-500 mx-auto" /></td>
                    <td className="px-6 py-4 text-center text-white/70">✗</td>
                    <td className="px-6 py-4 text-center text-white/70">✗</td>
                    <td className="px-6 py-4 text-center text-white/70">✗</td>
                  </tr>
                  <tr className="hover:bg-white/5 bg-gradient-to-r from-green-500/10 to-blue-500/10">
                    <td className="px-6 py-4 text-sm text-white font-bold">Starting Price</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-2xl font-bold text-green-400 drop-shadow-lg">FREE</span>
                        <span className="text-xs text-white/80">Forever</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-white/70">
                      <div className="flex flex-col items-center">
                        <span className="text-lg font-semibold">$25</span>
                        <span className="text-xs">/month</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-white/70">
                      <div className="flex flex-col items-center">
                        <span className="text-lg font-semibold">FREE</span>
                        <span className="text-xs">Limited</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-white/70">
                      <div className="flex flex-col items-center">
                        <span className="text-lg font-semibold">$34</span>
                        <span className="text-xs">/month</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="bg-background/70 backdrop-blur-md border-white/20">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle className="text-white">Perfect for Any Business</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-white/80">
                Whether you run a restaurant, nonprofit, school, or online business, create forms that fit your needs perfectly.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-background/70 backdrop-blur-md border-white/20">
            <CardHeader>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle className="text-white">Save Hours Every Week</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-white/80">
                Stop spending time on paperwork and manual data entry. Automate your processes and focus on growing your business.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-background/70 backdrop-blur-md border-white/20">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle className="text-white">Make Better Decisions</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-white/80">
                See exactly what your customers want with real-time insights and beautiful reports that make sense.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-600/10 py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="text-3xl font-bold text-blue-400 mb-2 drop-shadow-lg">
                5 min
              </div>
              <div className="text-white/80">Average Setup Time</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="text-3xl font-bold text-green-400 mb-2 drop-shadow-lg">
                Instant
              </div>
              <div className="text-white/70">Form Loading</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="text-3xl font-bold text-purple-400 mb-2 drop-shadow-lg">
                Zero
              </div>
              <div className="text-white/70">Technical Skills Needed</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="text-3xl font-bold text-orange-400 mb-2 drop-shadow-lg">
                24/7
              </div>
              <div className="text-white/70">Always Available</div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto"
        >
          <h2 className="text-4xl font-bold mb-6 text-white drop-shadow-lg">
            Ready to Create Your
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {" "}
              First Form?
            </span>
          </h2>
          <p className="text-xl text-white/90 mb-8 drop-shadow-md">
            Join thousands of businesses who use FormCraft to connect with their customers.
            Create your first professional form in minutes.
          </p>

          <Button
            onClick={onGetStarted}
            size="lg"
            className="px-12 py-6 text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            Start Building Now
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          <div className="mt-8 text-sm text-white/80">
            No setup required • No technical skills needed • Start free today
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 py-12 bg-background/40 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4 md:mb-0 drop-shadow-lg">
              FormCraft
            </div>
            <div className="flex items-center gap-6 text-sm text-white/80">
              <span>Built with ❤️ by Charles Inwald</span>
              <span>•</span>
              <span>MIT License</span>
              <span>•</span>
              <span>Open Source</span>
            </div>
          </div>
          </div>
        </div>
      </div>
    </ShaderBackground>
  );
}
