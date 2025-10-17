'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface YearDiff {
  id: string;
  changeType: string;
  fromTitle: string | null;
  toTitle: string | null;
  rationale: string;
  impact: string | null;
  confidence: number;
  evidence: Array<{
    canonId?: string;
    title: string;
    url: string;
    venue: string;
    year: number;
  }>;
  lowEvidence: boolean;
  section: string | null;
  importance: number;
}

interface YearRun {
  id: string;
  year: number;
  status: string;
  tldr: string | null;
  pdfUrl: string | null;
  webContent: {
    tldr: string[];
    sections: {
      major: Array<{ text: string; citations: string[] }>;
      tools: Array<{ text: string; citations: string[] }>;
      resources: Array<{ text: string; citations: string[] }>;
      corrections: Array<{ text: string; citations: string[] }>;
      emerging: Array<{ text: string; citations: string[] }>;
    };
    deltaPath: Array<{
      title: string;
      hours: number;
      link: string;
      type: string;
    }>;
    bibliography: Array<{
      key: string;
      title: string;
      url: string;
      venue: string;
      year: number;
    }>;
  } | null;
  changesCount: number;
  completedAt: string | null;
  diffs?: YearDiff[];
  subject: {
    id: string;
    title: string;
    baselineYear: number;
    discipline: string;
  };
}

// Helper function to build content from diffs when webContent is not available
function buildContentFromDiffs(diffs: YearDiff[]) {
  const sections = {
    major: [] as Array<{ text: string; citations: string[] }>,
    tools: [] as Array<{ text: string; citations: string[] }>,
    resources: [] as Array<{ text: string; citations: string[] }>,
    corrections: [] as Array<{ text: string; citations: string[] }>,
    emerging: [] as Array<{ text: string; citations: string[] }>,
  };

  const bibliography: Array<{
    key: string;
    title: string;
    url: string;
    venue: string;
    year: number;
  }> = [];

  // Group diffs by change type and build bibliography
  diffs.forEach((diff) => {
    const citations: string[] = [];
    
    // Add evidence to bibliography
    if (diff.evidence && Array.isArray(diff.evidence)) {
      diff.evidence.forEach((ev) => {
        const key = `src_${bibliography.length + 1}`;
        citations.push(key);
        bibliography.push({
          key,
          title: ev.title,
          url: ev.url,
          venue: ev.venue,
          year: ev.year,
        });
      });
    }

    // Build the text based on change type
    let text = '';
    if (diff.changeType === 'ADD' && diff.toTitle) {
      text = `**${diff.toTitle}** — ${diff.rationale}`;
    } else if (diff.changeType === 'RENAME' && diff.fromTitle && diff.toTitle) {
      text = `**${diff.fromTitle}** → **${diff.toTitle}** — ${diff.rationale}`;
    } else if (diff.changeType === 'DEPRECATE' && diff.fromTitle) {
      text = `**${diff.fromTitle}** (deprecated) — ${diff.rationale}`;
    } else if (diff.changeType === 'CORRECT') {
      text = diff.rationale;
    } else if (diff.changeType === 'EMERGE' && diff.toTitle) {
      text = `**${diff.toTitle}** — ${diff.rationale}`;
    } else {
      text = diff.rationale;
    }

    if (diff.lowEvidence) {
      text += ' *(Low evidence)*';
    }

    // Add to appropriate section based on change type
    const item = { text, citations };
    
    switch (diff.changeType) {
      case 'ADD':
        sections.major.push(item);
        break;
      case 'RENAME':
        sections.major.push(item);
        break;
      case 'DEPRECATE':
        sections.major.push(item);
        break;
      case 'CORRECT':
        sections.corrections.push(item);
        break;
      case 'EMERGE':
        sections.emerging.push(item);
        break;
      default:
        sections.major.push(item);
    }
  });

  // Build TL;DR from most important changes
  const tldr = diffs
    .slice(0, 5)
    .map((diff) => {
      if (diff.changeType === 'ADD' && diff.toTitle) {
        return `New addition: ${diff.toTitle}`;
      } else if (diff.changeType === 'RENAME' && diff.fromTitle && diff.toTitle) {
        return `${diff.fromTitle} renamed to ${diff.toTitle}`;
      } else if (diff.changeType === 'DEPRECATE' && diff.fromTitle) {
        return `${diff.fromTitle} is now deprecated`;
      } else {
        return diff.rationale.substring(0, 100) + (diff.rationale.length > 100 ? '...' : '');
      }
    });

  return {
    tldr,
    sections,
    deltaPath: [],
    bibliography,
  };
}

export default function YearPatchPage() {
  const params = useParams();
  const subjectId = params?.id as string;
  const year = params?.year as string;

  const [run, setRun] = useState<YearRun | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRun = async () => {
      if (!subjectId || !year) return;

      setIsLoading(true);
      setError('');

      try {
        const response = await fetch(`/api/subjects/${subjectId}/years/${year}`);

        if (!response.ok) {
          throw new Error('Failed to fetch patch notes');
        }

        const data = await response.json();
        setRun(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching patch notes:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRun();
  }, [subjectId, year]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg
            className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="text-gray-600">Loading patch notes...</p>
        </div>
      </div>
    );
  }

  if (error || !run) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
            <h2 className="text-xl font-semibold mb-2">Error</h2>
            <p>{error || 'Patch notes not found'}</p>
            <Link
              href={`/subjects/${subjectId}`}
              className="mt-4 inline-block text-blue-600 hover:underline"
            >
              ← Back to Subject
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Use webContent if available, otherwise build from diffs
  const content = run.webContent || (run.diffs && run.diffs.length > 0 ? buildContentFromDiffs(run.diffs) : null);
  const hasAnyContent = content && (
    content.tldr?.length > 0 ||
    content.sections.major.length > 0 ||
    content.sections.tools.length > 0 ||
    content.sections.resources.length > 0 ||
    content.sections.corrections.length > 0 ||
    content.sections.emerging.length > 0
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/subjects/${subjectId}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4 font-medium"
          >
            <svg
              className="w-5 h-5 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to {run.subject.title}
          </Link>

          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {run.subject.title} — {year} Patch Notes
              </h1>
              <div className="flex items-center gap-4 text-gray-600">
                <span className="inline-flex items-center">
                  <span className="font-semibold mr-2">Baseline:</span>
                  {run.subject.baselineYear}
                </span>
                <span className="inline-flex items-center">
                  <span className="font-semibold mr-2">Year:</span>
                  {year}
                </span>
                <span className="inline-flex items-center">
                  <span className="font-semibold mr-2">Changes:</span>
                  {run.changesCount}
                </span>
              </div>
            </div>

            {run.pdfUrl && (
              <a
                href={run.pdfUrl}
                download
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium inline-flex items-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Download PDF
              </a>
            )}
          </div>

          {run.completedAt && (
            <p className="text-sm text-gray-500">
              Generated on {new Date(run.completedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          )}
        </div>

        {/* Status Check */}
        {run.status !== 'completed' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <h3 className="text-yellow-800 font-semibold mb-2">
              {run.status === 'processing' ? '⚙️ Processing...' : '⏳ Pending'}
            </h3>
            <p className="text-yellow-700">
              {run.status === 'processing'
                ? 'Patch notes are being generated. Please check back soon.'
                : 'Patch notes have not been generated yet.'}
            </p>
          </div>
        )}

        {/* Content */}
        {hasAnyContent && content && (
          <div className="space-y-6">
            {/* Show banner if content was built from diffs */}
            {!run.webContent && run.diffs && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  ℹ️ Content generated from database records. Full formatted content is not yet available.
                </p>
              </div>
            )}

            {/* TL;DR */}
            {content.tldr && content.tldr.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">
                  TL;DR
                </h3>
                <ul className="space-y-2">
                  {content.tldr.map((item: string, i: number) => (
                    <li key={i} className="text-gray-700 leading-relaxed">
                      • {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Major Changes */}
            {content.sections.major.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">
                  🔥 Major Changes
                </h3>
                <ul className="space-y-3">
                  {content.sections.major.map((item, i: number) => (
                    <li key={i} className="text-gray-700 leading-relaxed pl-4 border-l-4 border-red-500">
                      {item.text}
                      {item.citations && item.citations.length > 0 && (
                        <span className="text-blue-600 text-sm ml-2">
                          {item.citations.map((cit, idx) => (
                            <span key={idx}>
                              [{cit}]
                              {idx < item.citations.length - 1 ? ' ' : ''}
                            </span>
                          ))}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tools */}
            {content.sections.tools.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">
                  🛠️ New Tools
                </h3>
                <ul className="space-y-2">
                  {content.sections.tools.map((item, i: number) => (
                    <li key={i} className="text-gray-700 leading-relaxed">
                      • {item.text}
                      {item.citations && item.citations.length > 0 && (
                        <span className="text-blue-600 text-sm ml-2">
                          {item.citations.map((cit, idx) => (
                            <span key={idx}>
                              [{cit}]
                              {idx < item.citations.length - 1 ? ' ' : ''}
                            </span>
                          ))}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Resources */}
            {content.sections.resources.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">
                  📚 Resources
                </h3>
                <ul className="space-y-2">
                  {content.sections.resources.map((item, i: number) => (
                    <li key={i} className="text-gray-700 leading-relaxed">
                      • {item.text}
                      {item.citations && item.citations.length > 0 && (
                        <span className="text-blue-600 text-sm ml-2">
                          {item.citations.map((cit, idx) => (
                            <span key={idx}>
                              [{cit}]
                              {idx < item.citations.length - 1 ? ' ' : ''}
                            </span>
                          ))}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Corrections */}
            {content.sections.corrections.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">
                  🎯 Corrections
                </h3>
                <ul className="space-y-2">
                  {content.sections.corrections.map((item, i: number) => (
                    <li key={i} className="text-gray-700 leading-relaxed">
                      • {item.text}
                      {item.citations && item.citations.length > 0 && (
                        <span className="text-blue-600 text-sm ml-2">
                          {item.citations.map((cit, idx) => (
                            <span key={idx}>
                              [{cit}]
                              {idx < item.citations.length - 1 ? ' ' : ''}
                            </span>
                          ))}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Emerging */}
            {content.sections.emerging.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">
                  🔮 Emerging
                </h3>
                <ul className="space-y-2">
                  {content.sections.emerging.map((item, i: number) => (
                    <li key={i} className="text-gray-700 leading-relaxed">
                      • {item.text}
                      {item.citations && item.citations.length > 0 && (
                        <span className="text-blue-600 text-sm ml-2">
                          {item.citations.map((cit, idx) => (
                            <span key={idx}>
                              [{cit}]
                              {idx < item.citations.length - 1 ? ' ' : ''}
                            </span>
                          ))}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Delta Path */}
            {content.deltaPath && content.deltaPath.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">
                  📚 Delta Path (Learning Resources)
                </h3>
                <div className="space-y-3">
                  {content.deltaPath.map((item, i: number) => (
                    <div
                      key={i}
                      className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                    >
                      <div className="flex-shrink-0 w-16 text-center">
                        <span className="text-sm font-medium text-gray-600">
                          {item.hours}h
                        </span>
                        <div className="text-xs text-gray-500 mt-1">
                          {item.type}
                        </div>
                      </div>
                      <div className="flex-1">
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {item.title}
                        </a>
                      </div>
                    </div>
                  ))}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Total Time:</span>{' '}
                      {content.deltaPath.reduce((sum, item) => sum + item.hours, 0)} hours
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Bibliography */}
            {content.bibliography && content.bibliography.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">
                  📖 Bibliography
                </h3>
                <div className="space-y-3">
                  {content.bibliography.map((item, i: number) => (
                    <div key={i} className="text-sm text-gray-700">
                      <span className="font-mono text-blue-600">[{item.key}]</span>{' '}
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-900 hover:text-blue-600 font-medium"
                      >
                        {item.title}
                      </a>
                      {' — '}
                      <span className="text-gray-600">
                        {item.venue} {item.year}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* No content available */}
        {!hasAnyContent && run.status === 'completed' && (
          <div className="bg-gray-100 rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              No content available
            </h3>
            <p className="text-gray-600">
              Patch notes were generated but no content or diffs are available.
            </p>
            {run.diffs && run.diffs.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-500">
                  Found {run.diffs.length} diffs but unable to display them.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

