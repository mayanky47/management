import React from "react";

interface InfoBlockProps {
  title: string;
  content?: string;
}

const InfoBlock: React.FC<InfoBlockProps> = ({ title, content }) => (
  <div>
    <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
    {content ? (
      <p className="text-gray-600 whitespace-pre-wrap">{content}</p>
    ) : (
      <p className="text-gray-400 italic">No data</p>
    )}
  </div>
);

export default InfoBlock;
