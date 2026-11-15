'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  ArrowLeft, 
  Send, 
  Sparkles, 
  BookOpen, 
  ShieldCheck, 
  Sliders, 
  Copy, 
  Check, 
  Compass, 
  Cpu, 
  GraduationCap,
  Search,
  FileText,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { useSimulationStore } from '../../lib/store/simulation-store';
import { 
  sendResearchBotChat, 
  recommendSettingsAI, 
  searchResearchAI, 
  summarizeDocumentAI,
  ResearchBotMode, 
  ChatMessage 
} from '../../lib/services/groq-research-bot-service';
import { BeginnerOnboardingWizardModal } from '../modals/BeginnerOnboardingWizardModal';
import { SmartHoverGuide } from '../ui/SmartHoverGuide';

export function ResearchBotWorkspace() {
  const { 
    currentResult, 
    conditions, 
    selectedEngine, 
    setBatchConditions, 
    setActiveTab,
    explanationContextForBot,
    setExplanationContextForBot
  } = useSimulationStore();

  const [input, setInput] = useState('');
  const [mode, setMode] = useState<ResearchBotMode>('beginner');
  const [activeView, setActiveView] = useState<'chat' | 'papers'>('chat');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // NASA Literature & Paper Summarizer State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<{
    synthesis: string;
    documents: Array<{ report_id: string; engine: string; citation: string; url: string; propellant: string }>;
  } | null>(null);

  const [paperTitle, setPaperTitle] = useState('');
  const [paperAbstract, setPaperAbstract] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryResult, setSummaryResult] = useState<string | null>(null);

  const handleSearchPapers = async () => {
    if (!searchQuery.trim() || isSearching) return;
    setIsSearching(true);
    try {
      const res = await searchResearchAI(searchQuery);
      setSearchResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSummarizePaper = async () => {
    if (!paperTitle.trim() || !paperAbstract.trim() || isSummarizing) return;
    setIsSummarizing(true);
    try {
      const res = await summarizeDocumentAI(paperTitle, paperAbstract, mode);
      setSummaryResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSummarizing(false);
    }
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'bot',
      text: `Welcome to Flame in Freefall. I am your Groq-powered AI Scientific Research Bot.\n\nI can assist you across three modes:\n• **Beginner Mode:** Plain-language fundamentals, intuitive analogies, and guided experiment setup.\n• **Guided Mode:** Intermediate combustion analysis, parameter recommendations, and time-series interpretation.\n• **Expert Mode:** Advanced thermodynamics, Navier-Stokes buoyancy dynamics, and NASA CEA kinetics.\n\nHow would you like to begin?`,
      timestamp: '12:00',
      mode: 'beginner',
      provenanceType: 'ai_explanation',
      citation: 'Groq Cloud High-Speed Inference • NASA Propulsion Archive Grounded',
    },
  ]);

  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const messageSeqRef = useRef(1);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isTyping) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    messageSeqRef.current += 1;
    const userMsgId = `usr-${messageSeqRef.current}`;

    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: content,
      timestamp,
      mode,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const lower = content.toLowerCase();
    const isConfigInquiry = lower.includes('configure') || lower.includes('recommend') || lower.includes('setup') || lower.includes('starter');

    try {
      if (isConfigInquiry) {
        const rec = await recommendSettingsAI(content, selectedEngine.category, mode);
        messageSeqRef.current += 1;
        const botMsgId = `bot-${messageSeqRef.current}`;
        const botTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const recMsg: ChatMessage = {
          id: botMsgId,
          sender: 'bot',
          text: `**[AI-GENERATED EXPERIMENT RECOMMENDATION]**\nI generated a validated experimental configuration based on your inquiry:\n\n*Rationale:* ${rec.rationale}`,
          timestamp: botTimestamp,
          mode,
          provenanceType: 'ai_recommendation',
          citation: 'Groq LLaMA/GPT & NASA CEA Physical Limits Validator',
          recommendedSettings: {
            parameters: rec.configuration,
            rationale: rec.rationale,
            breakdown: rec.parameters_breakdown,
          },
          suggestedAction: {
            label: 'Review & Apply to Experiment',
            action: () => {
              setBatchConditions(rec.configuration);
              alert('Configuration successfully applied to Experiment Dashboard! You can now review settings and manually start the simulation.');
            },
          },
        };

        setMessages((prev) => [...prev, recMsg]);
      } else {
        const chatHistory = messages.slice(-8).map((m) => ({
          role: m.sender === 'user' ? ('user' as const) : ('assistant' as const),
          content: m.text,
        }));
        chatHistory.push({ role: 'user', content });

        const currentTelemetry = {
          engine_name: selectedEngine.name,
          propellant: conditions.fuelType,
          chamber_pressure: conditions.chamberPressure,
          gravity: conditions.gravity,
          exhaust_velocity: currentResult.summaryMetrics.exhaustVelocity,
          thrust: currentResult.summaryMetrics.thrustForce,
          max_temp: currentResult.summaryMetrics.maxFlameTemperature,
          stability: currentResult.summaryMetrics.flameStabilityIndex,
        };

        const response = await sendResearchBotChat(chatHistory, mode, currentTelemetry);

        messageSeqRef.current += 1;
        const botMsgId = `bot-${messageSeqRef.current}`;
        const botTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const botMsg: ChatMessage = {
          id: botMsgId,
          sender: 'bot',
          text: response.reply,
          timestamp: botTimestamp,
          mode,
          provenanceType: 'ai_explanation',
          citation: response.citation,
        };

        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (err) {
      console.error('Error during research bot conversation:', err);
      messageSeqRef.current += 1;
      const botMsgId = `bot-${messageSeqRef.current}`;
      const botMsg: ChatMessage = {
        id: botMsgId,
        sender: 'bot',
        text: 'An error occurred during Groq inference. Local scientific calculation engine remains fully operational.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mode,
        provenanceType: 'ai_explanation',
        citation: 'Flame in Freefall Safety Core',
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  // Consume handoff context from Smart Hover Guide "Explain more with AI"
  useEffect(() => {
    if (!explanationContextForBot) return;
    const ctx = explanationContextForBot;
    const timer = setTimeout(() => {
      setExplanationContextForBot(null);
      setActiveView('chat');
      const paramName = ctx.title || ctx.name;
      const engName = ctx.engineName || selectedEngine.name;
      const question = `Can you explain ${paramName}${ctx.currentValue ? ` (currently set to ${ctx.currentValue})` : ''} in the context of our ${engName} engine simulation? Specifically: ${ctx.whatHappensIfChanged}`;
      handleSendMessage(question);
    }, 10);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [explanationContextForBot, selectedEngine.name, setExplanationContextForBot]);

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const starterQuestions = [
    'What is microgravity?',
    'Why does flame behaviour change in space?',
    'Help me configure my first experiment',
    'Explain the thruster exhaust plume',
    'What does chamber pressure mean?',
    'Explain my simulation results',
  ];

  return (
    <div className="flex-1 flex flex-col p-6 space-y-4 max-h-[calc(100vh-80px)]">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#1B64DD]/30 pb-4 gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="p-2 rounded-lg bg-[#0D2554] border border-[#1B64DD]/40 text-[#2694EE] hover:bg-[#164E9E] transition"
            title="Return to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#D9E0EE] flex items-center gap-2">
              <Bot className="w-6 h-6 text-[#F79628]" />
              Scientific Research Bot
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#2694EE]/20 text-[#2694EE] border border-[#2694EE]/40 font-bold uppercase">
                Groq AI Powered
              </span>
            </h1>
            <p className="text-xs text-[#A7B1D2]">
              Real-time conversational tutor, guided experiment setup, and literature reasoning
            </p>
          </div>
        </div>

        {/* Mode Selector & Onboarding Wizard Button */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* Navigation View Switcher (AI Chat vs NASA Literature) */}
          <div className="flex items-center bg-[#070F21] p-1 rounded-xl border border-[#1B64DD]/40 text-xs font-mono">
            <button
              onClick={() => setActiveView('chat')}
              className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1.5 font-bold ${
                activeView === 'chat'
                  ? 'bg-[#1B64DD] text-white shadow'
                  : 'text-[#A7B1D2] hover:text-[#D9E0EE]'
              }`}
              title="Conversational AI Chat"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>AI Chat</span>
            </button>
            <SmartHoverGuide id="bot_ntrsRagToggle">
              <button
                onClick={() => setActiveView('papers')}
                className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1.5 font-bold ${
                  activeView === 'papers'
                    ? 'bg-[#8B35E8] text-white shadow'
                    : 'text-[#A7B1D2] hover:text-[#D9E0EE]'
                }`}
                title="NASA Technical Reports Server & Paper Summarizer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>NASA Literature RAG</span>
              </button>
            </SmartHoverGuide>
          </div>

          {/* Beginner Onboarding Wizard Pill */}
          <SmartHoverGuide id="bot_beginnerWizard">
            <button
              onClick={() => setIsWizardOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#E8671C] to-[#F79628] text-white font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(232,103,28,0.4)] hover:brightness-110 transition whitespace-nowrap"
              title="Launch Interactive Beginner Setup Wizard"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Beginner</span> Setup Wizard
            </button>
          </SmartHoverGuide>

          {/* Three Persona Modes Selector */}
          <div className="flex items-center bg-[#070F21] p-1 rounded-xl border border-[#1B64DD]/40 text-xs font-mono">
            <SmartHoverGuide id="bot_beginnerMode">
              <button
                onClick={() => setMode('beginner')}
                className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 font-bold ${
                  mode === 'beginner'
                    ? 'bg-[#16A34A] text-white shadow'
                    : 'text-[#A7B1D2] hover:text-[#D9E0EE]'
                }`}
                title="Beginner Mode: Simple language, analogies, no equations"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Beginner</span>
              </button>
            </SmartHoverGuide>

            <SmartHoverGuide id="bot_guidedMode">
              <button
                onClick={() => setMode('guided')}
                className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 font-bold ${
                  mode === 'guided'
                    ? 'bg-[#1B64DD] text-white shadow'
                    : 'text-[#A7B1D2] hover:text-[#D9E0EE]'
                }`}
                title="Guided Mode: Intermediate explanations and parameter setup"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Guided</span>
              </button>
            </SmartHoverGuide>

            <SmartHoverGuide id="bot_expertMode">
              <button
                onClick={() => setMode('expert')}
                className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 font-bold ${
                  mode === 'expert'
                    ? 'bg-[#8B35E8] text-white shadow'
                    : 'text-[#A7B1D2] hover:text-[#D9E0EE]'
                }`}
                title="Expert Mode: Rigorous thermodynamics, Navier-Stokes, CEA equilibrium"
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Expert</span>
              </button>
            </SmartHoverGuide>
          </div>
        </div>
      </div>

      {activeView === 'papers' ? (
        <div className="flex-1 overflow-y-auto space-y-4 p-4 glass-panel border border-[#1B64DD]/40 bg-[#0D2554]/70 rounded-xl">
          {/* Section 1: NASA Technical Reports Server (NTRS) RAG Search */}
          <div className="p-4 rounded-xl bg-[#070F21]/80 border border-[#2694EE]/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-[#2694EE]" />
                <h2 className="text-sm font-bold text-[#D9E0EE]">
                  NASA Technical Reports Server (NTRS) Literature Search & RAG
                </h2>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#2694EE]/20 text-[#2694EE] border border-[#2694EE]/40 font-bold uppercase">
                Grounded Citations
              </span>
            </div>
            <p className="text-xs text-[#A7B1D2]">
              Search verified NASA propulsion technical publications, liquid rocket injector data, and chemical equilibrium reports.
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchPapers()}
                placeholder="Search NTRS: e.g., 'Space Shuttle OMS', 'Aerozine 50 LMDE', 'SSME LOX/LH2'..."
                className="flex-1 bg-[#0D2554] border border-[#1B64DD]/40 rounded-lg px-3 py-2 text-xs text-[#D9E0EE] outline-none placeholder-[#A7B1D2]/50"
              />
              <button
                onClick={handleSearchPapers}
                disabled={!searchQuery.trim() || isSearching}
                className="px-4 py-2 rounded-lg bg-[#2694EE] text-white hover:bg-[#1B64DD] disabled:opacity-50 font-bold text-xs flex items-center gap-1.5 transition shadow"
              >
                <Search className={`w-3.5 h-3.5 ${isSearching ? 'animate-spin' : ''}`} />
                <span>{isSearching ? 'Searching...' : 'Search NASA'}</span>
              </button>
            </div>

            {searchResult && (
              <div className="mt-3 space-y-3">
                <div className="p-3.5 rounded-lg bg-[#0D2554]/90 border border-[#2694EE]/30 space-y-2">
                  <div className="text-[10px] font-mono text-[#F79628] font-bold uppercase flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Groq RAG Synthesis:
                  </div>
                  <p className="text-xs text-[#D9E0EE] leading-relaxed whitespace-pre-wrap">
                    {searchResult.synthesis}
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-[#A7B1D2] font-bold uppercase">
                    Verified Technical Documents Retrieved:
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {searchResult.documents.map((doc) => (
                      <div key={doc.report_id} className="p-3 rounded-lg bg-[#070F21] border border-[#1B64DD]/30 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#2694EE]">{doc.report_id}</span>
                          <span className="text-[10px] font-mono text-[#A7B1D2]">{doc.propellant}</span>
                        </div>
                        <div className="text-[#D9E0EE] font-medium">{doc.engine}</div>
                        <div className="text-[11px] text-[#A7B1D2]">{doc.citation}</div>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-[#F79628] hover:underline flex items-center gap-1 pt-1"
                        >
                          <span>Open in NASA NTRS</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Research Paper Abstract Summarizer */}
          <div className="p-4 rounded-xl bg-[#070F21]/80 border border-[#8B35E8]/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#8B35E8]" />
                <h2 className="text-sm font-bold text-[#D9E0EE]">
                  Scientific Paper & Technical Abstract Summarizer
                </h2>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#8B35E8]/20 text-[#8B35E8] border border-[#8B35E8]/40 font-bold uppercase">
                Paper Assistant
              </span>
            </div>
            <p className="text-xs text-[#A7B1D2]">
              Paste the title and abstract of any propulsion or microgravity research paper for instant structured extraction.
            </p>

            <div className="space-y-2">
              <input
                type="text"
                value={paperTitle}
                onChange={(e) => setPaperTitle(e.target.value)}
                placeholder="Document / Paper Title..."
                className="w-full bg-[#0D2554] border border-[#1B64DD]/40 rounded-lg px-3 py-1.5 text-xs text-[#D9E0EE] outline-none placeholder-[#A7B1D2]/50"
              />
              <textarea
                rows={4}
                value={paperAbstract}
                onChange={(e) => setPaperAbstract(e.target.value)}
                placeholder="Paste abstract or excerpts here..."
                className="w-full bg-[#0D2554] border border-[#1B64DD]/40 rounded-lg p-3 text-xs text-[#D9E0EE] outline-none placeholder-[#A7B1D2]/50 resize-none font-sans"
              />
              <button
                onClick={handleSummarizePaper}
                disabled={!paperTitle.trim() || !paperAbstract.trim() || isSummarizing}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#8B35E8] to-[#1B64DD] text-white hover:brightness-110 disabled:opacity-50 font-bold text-xs flex items-center gap-1.5 transition shadow"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isSummarizing ? 'animate-spin' : ''}`} />
                <span>{isSummarizing ? 'Summarizing...' : 'Summarize Paper with Groq AI'}</span>
              </button>
            </div>

            {summaryResult && (
              <div className="p-4 rounded-lg bg-[#0D2554]/90 border border-[#8B35E8]/40 text-xs text-[#D9E0EE] leading-relaxed whitespace-pre-wrap font-sans mt-3">
                {summaryResult}
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Suggested Starter Question Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[10px] font-mono text-[#2694EE] font-bold uppercase whitespace-nowrap">
          Suggested Inquiries:
        </span>
        {starterQuestions.map((q) => (
          <button
            key={q}
            onClick={() => handleSendMessage(q)}
            className="px-3 py-1 rounded-full text-xs font-medium bg-[#0D2554] border border-[#1B64DD]/40 text-[#A7B1D2] hover:text-white hover:border-[#2694EE] hover:bg-[#164E9E]/30 transition whitespace-nowrap shadow-sm"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 glass-panel border border-[#1B64DD]/40 bg-[#0D2554]/70 rounded-xl">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-xl p-3.5 text-xs leading-relaxed group relative ${
                msg.sender === 'user'
                  ? 'bg-[#1B64DD] text-white rounded-br-none shadow-[0_0_15px_rgba(27,100,221,0.4)]'
                  : 'bg-[#070F21]/85 border border-[#1B64DD]/40 text-[#D9E0EE] rounded-bl-none shadow-md'
              }`}
            >
              {/* Message Header with Mode & Provenance Badge */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5">
                  {msg.provenanceType === 'verified_physics' && (
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#16A34A]/20 text-[#16A34A] border border-[#16A34A]/40 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      VERIFIED SIMULATION DATA
                    </span>
                  )}
                  {msg.provenanceType === 'ai_recommendation' && (
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#E8671C]/20 text-[#E8671C] border border-[#E8671C]/40 font-bold flex items-center gap-1">
                      <Sliders className="w-3 h-3" />
                      AI PARAMETER RECOMMENDATION
                    </span>
                  )}
                  {msg.provenanceType === 'ai_explanation' && (
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#2694EE]/20 text-[#2694EE] border border-[#2694EE]/40 font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      AI EXPLANATION
                    </span>
                  )}
                  {msg.mode && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#0A1B3B] text-[#A7B1D2] border border-[#1B64DD]/20 uppercase">
                      {msg.mode} mode
                    </span>
                  )}
                </div>

                {/* Copy Button */}
                {msg.sender === 'bot' && (
                  <button
                    onClick={() => handleCopyText(msg.id, msg.text)}
                    className="opacity-0 group-hover:opacity-100 transition p-1 hover:bg-[#164E9E]/30 rounded text-[#A7B1D2] hover:text-white"
                    title="Copy explanation"
                  >
                    {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-[#16A34A]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>

              {/* Message Content */}
              <div className="whitespace-pre-wrap">{msg.text}</div>

              {/* Recommended Parameters Card (if present) */}
              {msg.recommendedSettings && (
                <div className="mt-3 p-3 rounded-lg bg-[#0A1B3B]/80 border border-[#2694EE]/30 space-y-2">
                  <span className="text-[10px] font-mono text-[#2694EE] font-bold block uppercase">
                    Proposed Physical Parameters:
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono">
                    {msg.recommendedSettings.breakdown.map((param) => (
                      <div key={param.name} className="p-1.5 rounded bg-[#070F21] border border-[#1B64DD]/20">
                        <span className="text-[9px] text-[#A7B1D2] block">{param.label}</span>
                        <span className="text-[#D9E0EE] font-bold">
                          {param.value} {param.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Action Button (requires explicit confirmation) */}
              {msg.suggestedAction && (
                <button
                  onClick={msg.suggestedAction.action}
                  className="mt-3 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#E8671C] to-[#F79628] text-white font-bold hover:brightness-110 transition flex items-center gap-1.5 text-xs shadow-[0_0_12px_rgba(232,103,28,0.4)]"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{msg.suggestedAction.label}</span>
                </button>
              )}

              {/* Citation Footer */}
              {msg.citation && (
                <div className="mt-2 text-[10px] text-[#2694EE] border-t border-[#1B64DD]/30 pt-1 flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  <span>Provenance: {msg.citation}</span>
                </div>
              )}
            </div>
            <span className="text-[10px] text-[#A7B1D2]/70 mt-1 px-1">{msg.timestamp}</span>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-[#2694EE] p-2.5 bg-[#070F21]/80 border border-[#1B64DD]/40 rounded-lg w-fit shadow-md">
            <Sparkles className="w-4 h-4 animate-spin text-[#F79628]" />
            <span className="font-mono">Groq AI analyzing combustion kinetics & NASA archive...</span>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Form */}
      <SmartHoverGuide id="bot_chatInput" className="w-full">
        <div className="flex items-center gap-2 bg-[#0D2554] border border-[#1B64DD]/40 p-2 rounded-xl shadow-lg w-full">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(input)}
            placeholder={
              mode === 'beginner'
                ? 'Ask anything! e.g., "What is microgravity?" or "Help me setup my first experiment"'
                : mode === 'guided'
                ? 'Ask for experiment advice, parameter interpretation, or graph trends...'
                : 'Enter technical inquiry: de Laval expansion, Navier-Stokes, or NASA CEA equilibrium...'
            }
            className="flex-1 bg-transparent border-none outline-none text-xs text-[#D9E0EE] px-3 placeholder-[#A7B1D2]/60"
          />
          <button
            onClick={() => handleSendMessage(input)}
            disabled={!input.trim() || isTyping}
            className="p-2.5 rounded-lg bg-[#2694EE] text-white hover:bg-[#1B64DD] disabled:opacity-50 transition shadow-[0_0_12px_rgba(38,148,238,0.4)] flex items-center gap-1 font-bold text-xs"
            title="Send message to Research Bot"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Ask AI</span>
          </button>
        </div>
      </SmartHoverGuide>
        </>
      )}

      {/* Beginner Onboarding Wizard Modal */}
      <BeginnerOnboardingWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
      />
    </div>
  );
}
