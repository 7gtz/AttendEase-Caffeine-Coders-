import React from "react";
import AddSubjectForm from "../components/Forms/AddSubjectForm";
import GetSubjectClassForm from "../components/Forms/GetSubjectClassForm";

const SubjectsPage = ({ contract, account }) => {
  return (
    <div>
      <h2>Subjects</h2>
      {contract && account ? (
        <div>
          <p>Add subjects and view their classes.</p>
          <AddSubjectForm contract={contract} account={account} />
          <GetSubjectClassForm contract={contract} account={account} />
          <p><em>SubjectList to be implemented here.</em></p>
        </div>
      ) : (
        <p>Please connect your wallet to manage subjects.</p>
      )}
    </div>
  );
};

export default SubjectsPage;