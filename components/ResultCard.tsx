import React from 'react';
import { AnalysisResult } from '../types';
import { CheckCircle, XCircle, Building2, FileText, Tag, User } from 'lucide-react';

interface ResultCardProps {
  result: AnalysisResult;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result }) => {
  const isApproved = result.overallStatus === 'APPROVED';

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 mb-6 transition-all hover:shadow-xl">
      <div className={`p-4 border-l-8 ${isApproved ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'} flex justify-between items-center flex-wrap gap-4`}>
        <div className="flex items-center space-x-3">
          <FileText className="w-8 h-8 text-gray-500" />
          <div>
            <h3 className="font-bold text-gray-900 text-lg leading-tight">{result.fileName}</h3>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-2">
                {result.identifiedType && (
                    <div className="flex items-center text-sm text-blue-700 font-medium">
                        <Tag className="w-4 h-4 mr-1.5" />
                        <span>{result.identifiedType}</span>
                    </div>
                )}
                
                {result.workerName && (
                    <div className="flex items-center text-sm text-purple-700 font-medium mt-1 sm:mt-0">
                        <User className="w-4 h-4 mr-1.5" />
                        <span>{result.workerName}</span>
                    </div>
                )}

                {result.schoolDetected && (
                    <div className="flex items-center text-sm text-gray-600 font-medium mt-1 sm:mt-0">
                        <Building2 className="w-4 h-4 mr-1.5" />
                        <span>{result.schoolDetected}</span>
                    </div>
                )}
            </div>
          </div>
        </div>
        <div className={`flex items-center px-4 py-2 rounded-full font-bold text-sm shadow-sm ${isApproved ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
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
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Detalhamento dos Critérios</h4>
        <div className="space-y-3">
          {result.criteriaResults.length === 0 ? (
             <p className="text-gray-500 text-sm italic border border-dashed border-gray-300 rounded p-4 text-center">
                Nenhum critério específico foi avaliado.
             </p>
          ) : (
            result.criteriaResults.map((criteria, idx) => (
                <div 
                key={idx} 
                className={`flex items-start p-3 rounded-lg border transition-colors ${criteria.status === 'OK' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}
                >
                <div className="mt-0.5 mr-3 flex-shrink-0">
                    {criteria.status === 'OK' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                    )}
                </div>
                <div className="flex-1">
                    <p className={`font-semibold text-sm ${criteria.status === 'OK' ? 'text-gray-800' : 'text-red-900'}`}>
                    {criteria.description}
                    </p>
                    {criteria.observation && (
                    <p className="text-sm text-gray-600 mt-1 bg-white bg-opacity-60 p-1 rounded inline-block">
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
