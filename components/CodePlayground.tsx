'use client';

import { useState } from 'react';
import { Play, Code } from 'lucide-react';

const codeExamples = [
    {
        language: 'JavaScript',
        code: `// Hello World in JavaScript
console.log("Hello, CodeCamp!");

// Function example
function greet(name) {
  return \`Welcome, \${name}!\`;
}

console.log(greet("Developer"));`,
        output: `Hello, CodeCamp!\nWelcome, Developer!`,
    },
    {
        language: 'Python',
        code: `# Hello World in Python
print("Hello, CodeCamp!")

# Function example
def greet(name):
    return f"Welcome, {name}!"

print(greet("Developer"))`,
        output: `Hello, CodeCamp!\nWelcome, Developer!`,
    },
    {
        language: 'React',
        code: `// React Component Example
function Welcome({ name }) {
  return (
    <div className="greeting">
      <h1>Hello, {name}!</h1>
      <p>Welcome to CodeCamp</p>
    </div>
  );
}

export default Welcome;`,
        output: `Component rendered successfully!`,
    },
];

export default function CodePlayground() {
    const [activeTab, setActiveTab] = useState(0);
    const [showOutput, setShowOutput] = useState(false);

    return (
        <section className="py-20 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent"></div>

            <div className="container-custom relative z-10">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">
                        Try <span className="gradient-text">Coding</span> Now
                    </h2>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Langsung praktek coding di browser. Tidak perlu install apapun!
                    </p>
                </div>

                {/* Code Editor */}
                <div className="max-w-5xl mx-auto">
                    <div className="glass-strong rounded-2xl overflow-hidden border border-gray-800">
                        {/* Language Tabs */}
                        <div className="flex items-center gap-2 p-4 border-b border-gray-800 bg-gray-900/50">
                            {codeExamples.map((example, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setActiveTab(index);
                                        setShowOutput(false);
                                    }}
                                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${activeTab === index
                                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                            : 'glass text-gray-400 hover:text-white'
                                        }`}
                                >
                                    {example.language}
                                </button>
                            ))}
                        </div>

                        {/* Code Area */}
                        <div className="grid md:grid-cols-2 divide-x divide-gray-800">
                            {/* Code Input */}
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-400">
                                        <Code className="w-4 h-4" />
                                        <span>Code Editor</span>
                                    </div>
                                    <button
                                        onClick={() => setShowOutput(true)}
                                        className="btn-primary text-sm py-2 px-4 flex items-center gap-2"
                                    >
                                        <Play className="w-4 h-4" />
                                        Run Code
                                    </button>
                                </div>
                                <pre className="bg-black/30 rounded-lg p-4 overflow-x-auto">
                                    <code className="text-sm text-gray-300 font-mono">
                                        {codeExamples[activeTab].code}
                                    </code>
                                </pre>
                            </div>

                            {/* Output */}
                            <div className="p-6 bg-black/20">
                                <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                                    <span>Output</span>
                                </div>
                                {showOutput ? (
                                    <div className="bg-black/30 rounded-lg p-4 min-h-[200px]">
                                        <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">
                                            {codeExamples[activeTab].output}
                                        </pre>
                                    </div>
                                ) : (
                                    <div className="bg-black/30 rounded-lg p-4 min-h-[200px] flex items-center justify-center">
                                        <p className="text-gray-500 text-sm">
                                            Click "Run Code" to see the output
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Features */}
                        <div className="grid grid-cols-3 divide-x divide-gray-800 border-t border-gray-800 bg-gray-900/30">
                            <div className="p-4 text-center">
                                <div className="text-sm font-semibold text-purple-400 mb-1">
                                    Instant Feedback
                                </div>
                                <div className="text-xs text-gray-500">
                                    See results immediately
                                </div>
                            </div>
                            <div className="p-4 text-center">
                                <div className="text-sm font-semibold text-pink-400 mb-1">
                                    Multiple Languages
                                </div>
                                <div className="text-xs text-gray-500">
                                    Practice in any language
                                </div>
                            </div>
                            <div className="p-4 text-center">
                                <div className="text-sm font-semibold text-cyan-400 mb-1">
                                    No Setup Required
                                </div>
                                <div className="text-xs text-gray-500">
                                    Code directly in browser
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="text-center mt-8">
                        <p className="text-gray-400 mb-4">
                            Siap untuk belajar lebih dalam?
                        </p>
                        <a href="/register" className="btn-primary inline-block">
                            Daftar Sekarang - Gratis!
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
