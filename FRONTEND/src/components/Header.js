import React from "react";
import { Link } from "react-router-dom";

const Header = ({ account, role, userName }) => {
  return (
    <header>
      <nav>
        <ul className="nav">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/sections">Sections</Link></li>
          <li><Link to="/subjects">Subjects</Link></li>
          <li><Link to="/attendance">Attendance</Link></li>
          <li><Link to="/admin">Admin</Link></li>
          <li><Link to="/teacher">Teacher</Link></li>
          <li><Link to="/student">Student</Link></li>
        </ul>
      </nav>
      <p>Connected: {userName} ({account})</p>
    </header>
  );
};

export default Header;