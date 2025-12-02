import React from 'react';
import { AnalysisResult } from '../types';
import { CheckCircle, XCircle, AlertTriangle, Building2, FileText, Tag } from 'lucide-react';

interface ResultCardProps {
  result: AnalysisResult;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result }) => {
  const isApproved = result.overallStatus === 'APPROVED';

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 mb-6 transition-all hover:shadow-xl">
      <div className={`p-4 border-l-8 ${isApproved ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'} flex justify-between items-center flex-wrap gap-4`}>
        <div className="flex items-center space-x-3">
          <FileText className="w-6 h-6 text-gray-600" />
          <div>
            <h3 className="font-bold text-gray-800 text-lg">{result.fileName}</h3>
            {result.identifiedType && (
                <div className="flex items-center text-sm text-blue-600 mt-1 font-medium">
                    <Tag className="w-4 h-4 mr-1" />
                    <span>Identificado: {result.identifiedType}</span>
                </div>
            )}
            {result.schoolDetected && (
                <div className="flex items-center text-sm text-gray-600 mt-1">
                    <Building2 className="w-4 h-4 mr-1" />
                    <span>Escola: <strong>{result.schoolDetected}</strong></span>
                </div>
            )}
          </div>
        </div>
        <div className={`flex items-center px-4 py-2 rounded-full font-bold text-sm ${isApproved ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {isApproved ? (
            <>
              <CheckCircle className="w-5 h-5 mr-2" />
              APROVADO
            </>
          ) : (
            <>
              <XCircle className="w-5 h-5 mr-2" />
              REPROVADO
            </>
          )}
        </div>
      </div>

      <div className="p-6">
        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Detalhamento dos Critérios</h4>
        <div className="space-y-3">
          {result.criteriaResults.length === 0 ? (
             <p className="text-gray-500 text-sm italic">Nenhum critério específico foi avaliado.</p>
          ) : (
            result.criteriaResults.map((criteria, idx) => (
                <div 
                key={idx} 
                className={`flex items-start p-3 rounded-lg border ${criteria.status === 'OK' ? 'border-green-100 bg-green-50/50' : 'border-red-100 bg-red-50/50'}`}
                >
                <div className="mt-0.5 mr-3 flex-shrink-0">
                    {criteria.status === 'OK' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                    )}
                </div>
                <div>
                    <p className={`font-medium ${criteria.status === 'OK' ? 'text-gray-800' : 'text-red-800'}`}>
                    {criteria.description}
                    </p>
                    {criteria.observation && (
                    <p className="text-sm text-gray-600 mt-1">
                        {criteria.observation}
                    </p>
                    )}
                </div>
                </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};