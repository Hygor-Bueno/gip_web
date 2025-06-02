import React from 'react';

interface IButtonIcon extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  color?: string;
  icon: string;
  description: string;
}

function ButtonIcon({ color, icon, description, ...rest }: IButtonIcon) {
  return (
    <button
      {...rest}
      className={`btn ${color && `btn-${color}`} btn rounded font-weight-bold p-2 d-flex align-items-center`}
    >
      <i className={`fa fa-${icon} ${color ? `text-white`:'text-success'}`}></i>{description.length > 0 && <span className='d-none d-md-inline'>{description}</span>}
    </button>
  );
}

export default ButtonIcon;
