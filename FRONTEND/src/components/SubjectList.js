import React from 'react';

const SubjectList = ({ subjects }) => {
  return (
    <div>
      <h2>Subjects</h2>
      <ul>
        {subjects.map(subject => (
          <li key={subject.id}>{subject.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default SubjectList;
