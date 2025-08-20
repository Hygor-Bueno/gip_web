import React, { useState, useEffect } from "react";
import { useWebSocket } from "../Modules/GTPP/Context/GtppWsContext";

export default function NotificationBell(props: { idTask?: number }): JSX.Element {
  const { notifications, setNotifications } = useWebSocket();
  const [isHovered, setIsHovered] = useState(false);
  const [count, setCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [filteredNotifications, setFilteredNotifications] = useState<any[]>([]);

  useEffect(() => {
    setCount(props.idTask ? notifications.filter((item) => item.task_id == props.idTask).length : notifications.length);
  }, [notifications]);

  const handleClick = () => {
    const filtered = props.idTask
      ? notifications.filter((item) => item.task_id === props.idTask)
      : notifications;
      
    const uniqueFiltered = Array.from(new Map(filtered.map(item => [item.id, item])).values());

    setFilteredNotifications(uniqueFiltered);
    setShowModal(true);
  };  

  const handleClose = () => {
    setShowModal(false);
    setNotifications(props.idTask ? notifications.filter((item) => item.task_id !== props.idTask): []);
    setFilteredNotifications([]);
  };

  return (
    <React.Fragment>
      <div
        className="d-flex justify-content-center align-items-center position-relative"
        style={{ width: "fit-content", cursor: "pointer" }}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <i
          className="fa-solid fa-bell"
          style={{
            color: notifications.length > 0 ? "red" : "gray",
            transition: "color 0.3s",
          }}
        ></i>
        {count > 0 && (
          <span className="position-absolute notification">{count}</span>
        )}
      </div>

      {showModal && (
        <div className="modal fade show d-block" tabIndex={-1} role="dialog" style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content bg-dark text-white">
              <div className="modal-header">
                <h5 className="modal-title">Notificações</h5>
                <button type="button" className="btn-close btn-close-white" aria-label="Fechar" onClick={handleClose}></button>
              </div>
              <div className="modal-body">
                {filteredNotifications.length > 0 ? (
                  <ul className="list-unstyled overflow-auto notification-container">
                    {filteredNotifications.map((n, i) => (
                      <li key={i} className="mb-2">
                        <strong>{n.title}</strong> {n.message}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Sem notificações.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .notification {
          background-color: ${isHovered ? "#ffc107" : "#dc3545"};
        }
      `}</style>
    </React.Fragment>
  );
}
