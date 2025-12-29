import React from 'react'

interface ModalNotifiation extends React.HTMLAttributes<HTMLDivElement> {
  title: string, 
  message: string, 
  user: string,
  whichType?: string, // Example of the type I want, "alert" or "info" is what I want.
}

function Modalnotification({title, message, whichType = "warning", user}: ModalNotifiation) {
  return (
    <div className={`alert alert-${whichType} alert-dismissible fade show`} role="alert" style={{zIndex: '999', top: '10px' }}>
      <strong>
        {title}
      </strong>
      <p>{message}</p>
      <hr />
      <p className="mb-0">
        <strong>{user}</strong>
      </p>
    </div>
  )
}

export default Modalnotification;