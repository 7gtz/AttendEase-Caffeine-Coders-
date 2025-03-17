import React from "react";
import { Link } from "react-router-dom";

const Header = ({ account, role, userName }) => {
  return (
    <header>
      <nav>
        <ul>
          <li><Link to="/">Home</Link></li>
          {role === "admin" && <li><Link to="/sections">Sections</Link></li>}
          <li><Link to="/subjects">Subjects</Link></li>
          <li><Link to="/attendance">Attendance</Link></li>
          {role === "admin" && <li><Link to="/admin">Admin</Link></li>}
          {(role === "teacher" || role === "admin") && <li><Link to="/teacher">Teacher</Link></li>}
          <li><Link to="/student">Student</Link></li> {/* Added for completeness */}
        </ul>
      </nav>
      <p>Connected: {userName} ({account})</p> {/* Optional: Show account */}
    </header>
  );
};

export default Header;