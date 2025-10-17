'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Subject {
  id: string;
  title: string;
  discipline: string;
  baselineYear: number;
  description?: string;
}

interface YearRunData {
  year: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  tldr?: string;
  changesCount?: number;
  completedAt?: string;
}

interface YearTileProps {
  year: number;
  status: 'baseline' | 'pending' | 'processing' | 'completed' | 'failed';
  tldr?: string;
  changesCount?: number;
  subjectId: string;
}

function YearTile({ year, status, tldr, changesCount, subjectId }: YearTileProps) {
  const statusStyles = {
    baseline: 'bg-blue-50 border-blue-400 text-blue-900 border-2',
    pending: 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200',
    processing: 'bg-yellow-50 border-yellow-300 text-yellow-800 hover:bg-yellow-100 animate-pulse',
    completed: 'bg-green-50 border-green-300 text-green-900 hover:bg-green-100 cursor-pointer',
    failed: 'bg-red-50 border-red-300 text-red-900 hover:bg-red-100',
  };

  const statusIcons = {
    baseline: '📚',
    pending: '⏳',
    processing: '⚙️',
    completed: '✅',
    failed: '❌',
  };

  const statusLabels = {
    baseline: 'Base Year',
    pending: 'Not Generated',
    processing: 'Processing...',
    completed: 'Ready',
    failed: 'Failed',
  };

  const handleClick = () => {
    if (status === 'baseline') {
      // Baseline year is not clickable
      return;
    }
    if (status === 'completed') {
      // Navigate to year page (to be implemented)
      window.location.href = `/subjects/${subjectId}/years/${year}`;
    } else if (status === 'pending') {
      // TODO: Trigger generation
      console.log('Generate patch notes for', year);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`${statusStyles[status]} border-2 rounded-lg p-6 transition-all duration-200 shadow-sm hover:shadow-md ${
        status === 'baseline' ? 'cursor-default' : ''
      }`}
    >
      {/* Year */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-3xl font-bold">{year}</h3>
        <span className="text-2xl">{statusIcons[status]}</span>
      </div>

      {/* Status */}
      <div className="mb-3">
        <span className="text-sm font-semibold uppercase tracking-wide">
          {statusLabels[status]}
        </span>
      </div>

      {/* TL;DR or metadata */}
      {status === 'completed' && tldr && (
        <p className="text-sm line-clamp-2 mt-2 opacity-80">
          {tldr}
        </p>
      )}

      {status === 'completed' && changesCount !== undefined && (
        <div className="mt-3 text-xs opacity-70">
          {changesCount} {changesCount === 1 ? 'change' : 'changes'}
        </div>
      )}

      {status === 'baseline' && (
        <p className="text-sm mt-2 opacity-80">
          Your starting point
        </p>
      )}

      {status === 'pending' && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            console.log('Generate clicked');
          }}
          className="mt-3 text-sm font-medium underline hover:no-underline"
        >
          Generate now →
        </button>
      )}
    </div>
  );
}

export default function SubjectTimelinePage() {
  const params = useParams();
  const router = useRouter();
  const subjectId = params?.id as string;

  const [subject, setSubject] = useState<Subject | null>(null);
  const [years, setYears] = useState<YearTileProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!subjectId) return;

      setIsLoading(true);
      setError('');

      try {
        // Fetch subject details and timeline
        const response = await fetch(`/api/subjects/${subjectId}/timeline`);

        if (!response.ok) {
          throw new Error('Failed to fetch subject timeline');
        }

        const data = await response.json();
        setSubject(data.subject);
        setYears(data.years);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching timeline:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [subjectId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
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
          <p className="text-gray-600">Loading timeline...</p>
        </div>
      </div>
    );
  }

  if (error || !subject) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
            <h2 className="text-xl font-semibold mb-2">Error</h2>
            <p>{error || 'Subject not found'}</p>
            <Link
              href="/subjects"
              className="mt-4 inline-block text-blue-600 hover:underline"
            >
              ← Back to Subjects
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentYear = new Date().getFullYear();
  const totalYears = currentYear - subject.baselineYear;
  const completedYears = years.filter((y) => y.status === 'completed').length;
  const progressPercentage = totalYears > 0 ? (completedYears / totalYears) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/subjects"
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
            Back to Subjects
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {subject.title}
              </h1>
              <div className="flex items-center gap-4 text-gray-600">
                <span className="inline-flex items-center">
                  <span className="font-semibold mr-2">Baseline:</span>
                  {subject.baselineYear}
                </span>
                <span className="inline-flex items-center">
                  <span className="font-semibold mr-2">Discipline:</span>
                  {subject.discipline}
                </span>
              </div>
              {subject.description && (
                <p className="text-gray-600 mt-2 max-w-2xl">
                  {subject.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Year Tiles Grid */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Year-by-Year Timeline
          </h2>

          {years.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                No years to display
              </h3>
              <p className="text-gray-600">
                The baseline year is the current year or in the future.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {years.map((yearData) => (
                <YearTile
                  key={yearData.year}
                  year={yearData.year}
                  status={yearData.status}
                  tldr={yearData.tldr}
                  changesCount={yearData.changesCount}
                  subjectId={subjectId}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

