import React from "react";

export default function UserList({ users, currentUser }) {
  return (
    <ul className="user-list">
      {users
        .filter((u) => u !== currentUser)
        .map((user) => (
          <li key={user} className="user-item">
            {user}
          </li>
        ))}
    </ul>
  );
}
