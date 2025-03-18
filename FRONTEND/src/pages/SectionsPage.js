import React from "react";
import CreateSectionForm from "../components/Forms/CreateSectionForm";
import SectionList from "../components/Lists/SectionList";

const SectionsPage = ({ contract, account, role }) => {
  return (
    <div>
      <h2>Sections</h2>
      {contract && account ? (
        <div>
          <p>Create and manage sections.</p>
          <CreateSectionForm contract={contract} account={account} />
          <SectionList contract={contract} account={account} />
        </div>
      ) : (
        <p>Please connect your wallet to manage sections.</p>
      )}
    </div>
  );
};

export default SectionsPage;