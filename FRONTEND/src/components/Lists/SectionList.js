import React, { useState, useEffect } from "react";

const SectionList = ({ contract, account }) => {
  const [sections, setSections] = useState([]);
  const [message, setMessage] = useState("");

  const fetchSections = async () => {
    try {
      const sectionCounter = await contract.methods.sectionCounter().call({ from: account });
      const sectionList = [];
      for (let i = 0; i < sectionCounter; i++) {
        const section = await contract.methods.sections(i).call({ from: account });
        sectionList.push({
          id: section.id,
          name: section.name,
        });
      }
      setSections(sectionList);
      setMessage("");
    } catch (error) {
      setMessage(`Error: ${error.message}`);
      setSections([]);
    }
  };

  useEffect(() => {
    if (contract && account) {
      fetchSections();
    }
  }, [contract, account]);

  return (
    <div>
      <h3>Section List</h3>
      {sections.length > 0 ? (
        <ul>
          {sections.map((section) => (
            <li key={section.id}>
              ID: {section.id} | Name: {section.name}
            </li>
          ))}
        </ul>
      ) : (
        <p>No sections available.</p>
      )}
      {message && <p>{message}</p>}
      <button onClick={fetchSections}>Refresh Sections</button>
    </div>
  );
};

export default SectionList;