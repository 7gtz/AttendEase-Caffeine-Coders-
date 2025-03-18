import React from 'react';

const SectionList = ({ sections }) => {
  return (
    <div>
      <h2>Sections</h2>
      <ul>
        {sections.map(section => (
          <li key={section.id}>{section.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default SectionList;