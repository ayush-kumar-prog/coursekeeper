import Link from 'next/link';

interface SubjectTileProps {
  id: string;
  title: string;
  discipline: string;
  baselineYear: number;
}

export default function SubjectTile({
  id,
  title,
  discipline,
  baselineYear,
}: SubjectTileProps) {
  return (
    <Link href={`/subjects/${id}`}>
      <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow cursor-pointer border border-gray-200 h-full flex flex-col">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-bold text-gray-900 flex-1 line-clamp-2">
            {title}
          </h3>
        </div>
        
        <div className="mt-auto space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
              {discipline}
            </span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <svg
              className="w-4 h-4 mr-1.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>Baseline: {baselineYear}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

