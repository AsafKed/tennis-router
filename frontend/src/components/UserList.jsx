import { useEffect, useState } from "react";

export default function UserList({ socket, group, user, leavingGroup, users }) {

  useEffect(() => {
    if (group) {
      socket.emit("join_group", { group, user: user });
    }

    if (leavingGroup) {
      socket.emit("leave_group", { group, user: user });
    }

    socket.on("update_group_users", (users) => {
      // console.log("users", users);
    });

    return () => {
      if (group && leavingGroup) {
        socket.emit("leave_group", { group, user: user });
      }
      socket.off("update_group_users");
    };
  }, [socket, group, user, leavingGroup]);

  return (
    <div>
      <h2>Users in Group</h2>
      <div>
        <ul>
          {users.map((user, ind) => {
            return <li key={ind}>{user.name}</li>;
          })}
        </ul>
      </div>
    </div>
  );
}
