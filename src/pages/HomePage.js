import React from "react";

const HomePage = () => {
  return (
    <div>
      <h2 className="welc">Welcome to College Attendance</h2>
      <p>
        Manage your college attendance on the Educhain network. Navigate to the appropriate dashboard:
      </p>
      <ul>
        <li><strong>Admin</strong>: Manage sections, subjects, and students.</li>
        <li><strong>Teacher</strong>: Schedule classes and close attendance.</li>
        <li><strong>Student</strong>: Mark and view attendance.</li>
        <li><strong>Sections/Subjects</strong>: View details.</li>
      </ul>
    </div>
  );
};

export default HomePage;