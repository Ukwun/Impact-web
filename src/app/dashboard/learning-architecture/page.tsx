'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type ArchitectureResponse = {
  success: boolean;
  data: {
    learningLayers: Array<{ id: string; purpose: string; typicalComponents: string[] }>;
    productHierarchy: Array<{ level: string; function: string }>;
    recommendedCmsFields: string[];
    subscriptionModes: Array<{ mode: string; primaryUser: string; requiredFeatures: string[] }>;
    deliveryBlend: {
      selfPacedPercent: number;
      liveClassPercent: number;
      projectAndCommunityPercent: number;
    };
    weeklyClassroomRhythm: Array<{
      stage: string;
      dayLabel: string;
      learnerExperience: string;
      systemFunction: string;
    }>;
    dashboardRequirements: {
      learner: string[];
      schoolParentAdmin: string[];
    };
    fourLevelCurriculumFramework: Array<{
      level: string;
      ageGroup: string;
      primaryOutcome: string;
      signatureShift: string;
    }>;
    levelStructures: Array<{
      level: string;
      ageGroup: string;
      purpose: string;
      coreOutcomes: string[];
      curriculumStrands: string[];
      termStructure: Array<{
        term: string;
        focus: string;
        illustrativeTopics: string[];
      }>;
      signatureExperiences: string[];
      liveClassroomFormat: string;
    }>;
  };
};

export default function LearningArchitecturePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payload, setPayload] = useState<ArchitectureResponse['data'] | null>(null);
  const [selectedLevel, setSelectedLevel] = useState('PRIMARY');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/learning-architecture');
        if (!response.ok) {
          throw new Error('Could not load learning architecture');
        }
        const result = (await response.json()) as ArchitectureResponse;
        setPayload(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const selectedStructure = useMemo(() => {
    return payload?.levelStructures.find((entry) => entry.level === selectedLevel) ?? null;
  }, [payload, selectedLevel]);

  if (loading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <p className="text-gray-300">Loading learning architecture...</p>
      </div>
    );
  }

  if (error || !payload) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto bg-red-500/10 border border-red-500/40 rounded-2xl p-6">
          <h1 className="text-2xl font-bold text-white">Learning Architecture</h1>
          <p className="text-red-300 mt-2">{error ?? 'No data available'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-8">
      <section className="max-w-7xl mx-auto bg-dark-500 border border-dark-400 rounded-2xl p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-black text-white">Learning Architecture and Delivery</h1>
        <p className="text-gray-300 mt-3 max-w-3xl">
          This is the operational blueprint used by the product to deliver realistic learning experiences across programmes,
          levels, terms, lessons, live sessions, assessments, and recognitions.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/dashboard/learn" className="px-4 py-2 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700">
            Open Learning Dashboard
          </Link>
          <Link href="/dashboard/learning-journey" className="px-4 py-2 rounded-lg border border-primary-500 text-primary-300 hover:bg-primary-500/10">
            View Learning Journey
          </Link>
          <Link href="/dashboard/projects" className="px-4 py-2 rounded-lg border border-dark-300 text-gray-200 hover:bg-dark-400">
            Open Project Showcase
          </Link>
        </div>
      </section>

      <section className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-4">
        {payload.learningLayers.map((layer) => (
          <article key={layer.id} className="bg-dark-500 border border-dark-400 rounded-xl p-4">
            <p className="text-xs tracking-wider uppercase text-primary-300">{layer.id.replace('_', ' ')}</p>
            <h2 className="text-white font-bold mt-2">{layer.purpose}</h2>
            <ul className="mt-3 space-y-1 text-sm text-gray-300">
              {layer.typicalComponents.map((component) => (
                <li key={component}>- {component}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-dark-500 border border-dark-400 rounded-xl p-5">
          <h3 className="text-xl font-bold text-white">Product Hierarchy</h3>
          <div className="mt-4 space-y-2">
            {payload.productHierarchy.map((row) => (
              <div key={row.level} className="rounded-lg border border-dark-300 p-3">
                <p className="text-primary-300 text-xs uppercase">{row.level.replace('_', ' ')}</p>
                <p className="text-gray-200 text-sm mt-1">{row.function}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-dark-500 border border-dark-400 rounded-xl p-5">
          <h3 className="text-xl font-bold text-white">CMS Object Fields</h3>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
            {payload.recommendedCmsFields.map((field) => (
              <div key={field} className="text-sm text-gray-300 bg-dark-600 rounded px-3 py-2">
                {field}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-dark-500 border border-dark-400 rounded-xl p-5">
          <h3 className="text-xl font-bold text-white">Subscription Delivery</h3>
          <div className="space-y-3 mt-4">
            {payload.subscriptionModes.map((mode) => (
              <div key={mode.mode} className="rounded-lg border border-dark-300 p-4">
                <p className="text-primary-300 text-xs uppercase">{mode.mode.replace('_', ' ')}</p>
                <p className="text-gray-200 text-sm mt-1">Primary user: {mode.primaryUser}</p>
                <ul className="text-sm text-gray-300 mt-2 space-y-1">
                  {mode.requiredFeatures.map((feature) => (
                    <li key={feature}>- {feature}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-dark-500 border border-dark-400 rounded-xl p-5">
          <h3 className="text-xl font-bold text-white">Recommended Delivery Blend</h3>
          <div className="mt-6 space-y-5">
            <BlendBar label="Self-paced structured content" value={payload.deliveryBlend.selfPacedPercent} colorClass="bg-blue-500" />
            <BlendBar label="Live classroom and guided facilitation" value={payload.deliveryBlend.liveClassPercent} colorClass="bg-amber-500" />
            <BlendBar label="Projects, simulations, showcases" value={payload.deliveryBlend.projectAndCommunityPercent} colorClass="bg-green-500" />
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto bg-dark-500 border border-dark-400 rounded-xl p-5">
        <h3 className="text-xl font-bold text-white">Weekly Classroom Rhythm</h3>
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-5 gap-3">
          {payload.weeklyClassroomRhythm.map((item) => (
            <div key={item.stage} className="rounded-lg border border-dark-300 p-3">
              <p className="text-xs uppercase text-primary-300">{item.dayLabel}</p>
              <p className="text-sm text-white font-semibold mt-2">{item.learnerExperience}</p>
              <p className="text-xs text-gray-300 mt-2">{item.systemFunction}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-dark-500 border border-dark-400 rounded-xl p-5">
          <h3 className="text-xl font-bold text-white">Dashboard Requirements</h3>
          <p className="text-gray-300 mt-3 font-semibold">Learner dashboard</p>
          <ul className="mt-2 text-sm text-gray-300 space-y-1">
            {payload.dashboardRequirements.learner.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
          <p className="text-gray-300 mt-4 font-semibold">School, parent, admin dashboards</p>
          <ul className="mt-2 text-sm text-gray-300 space-y-1">
            {payload.dashboardRequirements.schoolParentAdmin.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </div>

        <div className="bg-dark-500 border border-dark-400 rounded-xl p-5">
          <h3 className="text-xl font-bold text-white">Four-Level Curriculum Framework</h3>
          <div className="mt-4 space-y-2">
            {payload.fourLevelCurriculumFramework.map((entry) => (
              <div key={entry.level} className="rounded-lg border border-dark-300 p-3">
                <p className="text-primary-300 text-xs uppercase">{entry.level.replace('_', ' ')} | Age {entry.ageGroup}</p>
                <p className="text-sm text-white mt-1">{entry.primaryOutcome}</p>
                <p className="text-xs text-gray-300 mt-1">{entry.signatureShift}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto bg-dark-500 border border-dark-400 rounded-xl p-5">
        <div className="flex flex-wrap gap-2">
          {payload.levelStructures.map((structure) => (
            <button
              key={structure.level}
              onClick={() => setSelectedLevel(structure.level)}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                selectedLevel === structure.level
                  ? 'bg-primary-600 text-white'
                  : 'bg-dark-600 text-gray-200 hover:bg-dark-400'
              }`}
            >
              {structure.level.replace('_', ' ')}
            </button>
          ))}
        </div>

        {selectedStructure && (
          <div className="mt-5 grid grid-cols-1 xl:grid-cols-2 gap-5">
            <div className="rounded-lg border border-dark-300 p-4">
              <h4 className="text-white font-bold">{selectedStructure.level.replace('_', ' ')} (Ages {selectedStructure.ageGroup})</h4>
              <p className="text-sm text-gray-300 mt-2">{selectedStructure.purpose}</p>

              <p className="text-sm font-semibold text-primary-300 mt-4">Core outcomes</p>
              <ul className="text-sm text-gray-300 mt-2 space-y-1">
                {selectedStructure.coreOutcomes.map((outcome) => (
                  <li key={outcome}>- {outcome}</li>
                ))}
              </ul>

              <p className="text-sm font-semibold text-primary-300 mt-4">Curriculum strands</p>
              <ul className="text-sm text-gray-300 mt-2 space-y-1">
                {selectedStructure.curriculumStrands.map((strand) => (
                  <li key={strand}>- {strand}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border border-dark-300 p-4">
              <p className="text-sm font-semibold text-primary-300">Term structure</p>
              <div className="mt-2 space-y-2">
                {selectedStructure.termStructure.map((term) => (
                  <div key={term.term} className="rounded bg-dark-600 p-3">
                    <p className="text-sm text-white font-semibold">{term.term}: {term.focus}</p>
                    <p className="text-xs text-gray-300 mt-1">{term.illustrativeTopics.join(', ')}</p>
                  </div>
                ))}
              </div>

              <p className="text-sm font-semibold text-primary-300 mt-4">Signature experiences</p>
              <ul className="text-sm text-gray-300 mt-2 space-y-1">
                {selectedStructure.signatureExperiences.map((experience) => (
                  <li key={experience}>- {experience}</li>
                ))}
              </ul>

              <p className="text-sm font-semibold text-primary-300 mt-4">Live classroom format</p>
              <p className="text-sm text-gray-300 mt-2">{selectedStructure.liveClassroomFormat}</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function BlendBar({
  label,
  value,
  colorClass,
}: {
  label: string;
  value: number;
  colorClass: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-gray-300">{label}</span>
        <span className="text-white font-bold">{value}%</span>
      </div>
      <div className="w-full h-3 bg-dark-700 rounded-full overflow-hidden">
        <div className={`h-3 ${colorClass}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
